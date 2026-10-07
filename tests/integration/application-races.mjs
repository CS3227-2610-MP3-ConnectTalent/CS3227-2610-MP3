import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

// Local-only integration check. Requires this project's running Supabase Docker stack.
const container = "supabase_db_CS3227-2610-MP3";
const userId = randomUUID();
const jobs = [randomUUID(), randomUUID(), randomUUID()];
const email = `race-${userId}@example.test`;

function startSql(sql, appName = "") {
  const args = ["exec"];
  if (appName) args.push("-e", `PGAPPNAME=${appName}`);
  args.push("-i", container, "psql", "-U", "postgres", "-d", "postgres", "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-f", "-");
  const child = spawn("docker", args, {
    windowsHide: true,
  });
  child.stdin.end(sql);
  let output = "";
  let errors = "";
  child.stdout.on("data", (chunk) => { output += chunk.toString(); });
  child.stderr.on("data", (chunk) => { errors += chunk.toString(); });
  const done = new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, output, errors }));
  });
  return { done, get output() { return output; } };
}

async function runSql(sql, expectedExit = 0) {
  const result = await startSql(sql).done;
  if (result.code !== expectedExit) {
    throw new Error(`SQL exit ${result.code}, expected ${expectedExit}: ${result.errors.trim()}`);
  }
  return result;
}

async function waitForMarker(process, marker) {
  const deadline = Date.now() + 10_000;
  while (!process.output.includes(marker)) {
    if (Date.now() > deadline) throw new Error(`Timed out waiting for ${marker}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function assertLockWait(appName) {
  const deadline = Date.now() + 4_000;
  while (Date.now() < deadline) {
    const result = await runSql(`select count(*) from pg_stat_activity where application_name = '${appName}' and wait_event_type = 'Lock'`);
    if (result.output.trim() === "1") return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`${appName} never reached a database lock wait`);
}

function applicantSql(statement, marker) {
  return `begin;
    set local role authenticated;
    select set_config('request.jwt.claim.sub', '${userId}', true);
    ${statement};
    select '${marker}';
    select pg_sleep(5);
    commit;`;
}

const insertFixtures = `
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
    values ('${userId}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '${email}', '', now());
  insert into public.jobs (id, title, team, category, description, requirements, status, published_at)
    values ${jobs.map((id, index) => `('${id}', 'Race job ${index + 1}', 'Engineering', 'engineering', 'Synthetic description', 'Synthetic requirements', 'published', now())`).join(",\n")};`;
const cleanup = `
  delete from public.applications where job_id in (${jobs.map((id) => `'${id}'`).join(",")});
  delete from public.jobs where id in (${jobs.map((id) => `'${id}'`).join(",")});
  delete from auth.users where id = '${userId}';`;

let fixturesCreated = false;
try {
  await runSql(insertFixtures);
  fixturesCreated = true;

  // One transaction holds the first submission and its job/advisory locks.
  const first = startSql(applicantSql(`select public.submit_application('${jobs[0]}', 'First synthetic letter', null)`, "FIRST_SUBMITTED"));
  await waitForMarker(first, "FIRST_SUBMITTED");
  const duplicateAppName = `race-duplicate-${userId}`;
  const duplicate = startSql(applicantSql(`select public.submit_application('${jobs[0]}', 'Second synthetic letter', null)`, "SECOND_SUBMITTED"), duplicateAppName);
  await assertLockWait(duplicateAppName);
  const firstResult = await first.done;
  const duplicateResult = await duplicate.done;
  if (firstResult.code !== 0 || duplicateResult.code === 0 || !duplicateResult.errors.includes("Application already submitted")) {
    throw new Error(`Concurrent submit outcome unexpected: first=${firstResult.code}, second=${duplicateResult.code}; ${duplicateResult.errors.trim()}`);
  }
  const duplicateCount = await runSql(`select count(*) from public.applications where job_id = '${jobs[0]}'`);
  if (duplicateCount.output.trim() !== "1") throw new Error("Concurrent submissions created more than one row");

  // Closure wins the job lock: the waiting submit must be rejected.
  const closing = startSql(`begin; update public.jobs set status = 'closed' where id = '${jobs[1]}'; select 'CLOSE_LOCK_HELD'; select pg_sleep(5); commit;`);
  await waitForMarker(closing, "CLOSE_LOCK_HELD");
  const lateAppName = `race-too-late-${userId}`;
  const tooLate = startSql(applicantSql(`select public.submit_application('${jobs[1]}', 'Too late', null)`, "TOO_LATE"), lateAppName);
  await assertLockWait(lateAppName);
  const closingResult = await closing.done;
  const tooLateResult = await tooLate.done;
  if (closingResult.code !== 0 || tooLateResult.code === 0 || !tooLateResult.errors.includes("Job is not open for applications")) {
    throw new Error(`Close-first outcome unexpected: close=${closingResult.code}, submit=${tooLateResult.code}; ${tooLateResult.errors.trim()}`);
  }
  const closedCount = await runSql(`select count(*) from public.applications where job_id = '${jobs[1]}'`);
  if (closedCount.output.trim() !== "0") throw new Error("Submission was recorded after closure won the lock");

  // Submission wins the lock: close waits, then preserves the submitted row.
  const beforeClose = startSql(applicantSql(`select public.submit_application('${jobs[2]}', 'Before close', null)`, "SUBMIT_LOCK_HELD"));
  await waitForMarker(beforeClose, "SUBMIT_LOCK_HELD");
  const closeAppName = `race-close-after-${userId}`;
  const closeAfter = startSql(`update public.jobs set status = 'closed' where id = '${jobs[2]}'`, closeAppName);
  await assertLockWait(closeAppName);
  const submitResult = await beforeClose.done;
  const closeAfterResult = await closeAfter.done;
  if (submitResult.code !== 0 || closeAfterResult.code !== 0) {
    throw new Error(`Submit-first outcome unexpected: submit=${submitResult.code}, close=${closeAfterResult.code}`);
  }
  const finalState = await runSql(`select j.status || ':' || count(a.id) from public.jobs j left join public.applications a on a.job_id = j.id where j.id = '${jobs[2]}' group by j.status`);
  if (finalState.output.trim() !== "closed:1") throw new Error("Close did not preserve the preceding application");

  process.stdout.write("PASS: concurrent duplicate submit, close-first, and submit-first races.\n");
} finally {
  if (fixturesCreated) await runSql(cleanup);
}
