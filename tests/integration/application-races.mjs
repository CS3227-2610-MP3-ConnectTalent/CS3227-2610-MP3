import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

// Local-only integration check. Requires this project's running Supabase Docker stack.
const container = "supabase_db_CS3227-2610-MP3";
const userId = randomUUID();
const hrId = randomUUID();
const jobs = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
const email = `race-${userId}@example.test`;

function startSql(sql, appName = "") {
  const args = ["exec"];
  if (appName) args.push("-e", `PGAPPNAME=${appName}`);
  args.push(
    "-i",
    container,
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-X",
    "-q",
    "-A",
    "-t",
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    "-",
  );
  const child = spawn("docker", args, {
    windowsHide: true,
  });
  child.stdin.end(sql);
  let output = "";
  let errors = "";
  let finished = false;
  let exitCode;
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    errors += chunk.toString();
  });
  const done = new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => {
      finished = true;
      exitCode = code;
      resolve({ code, output, errors });
    });
  });
  return {
    done,
    get output() {
      return output;
    },
    get errors() {
      return errors;
    },
    get finished() {
      return finished;
    },
    get exitCode() {
      return exitCode;
    },
  };
}

async function runSql(sql, expectedExit = 0) {
  const result = await startSql(sql).done;
  if (result.code !== expectedExit) {
    throw new Error(
      `SQL exit ${result.code}, expected ${expectedExit}: ${result.errors.trim()}`,
    );
  }
  return result;
}

async function waitForSleep(process, appName) {
  const deadline = Date.now() + 10_000;
  while (Date.now() <= deadline) {
    const result = await runSql(
      `select count(*) from pg_stat_activity where application_name = '${appName}' and state = 'active' and query ilike '%pg_sleep(5)%'`,
    );
    if (result.output.trim() === "1") return;
    if (process.finished) {
      throw new Error(
        `Transaction ${appName} exited before reaching its hold point (exit ${process.exitCode}): ${process.errors.trim()} ${process.output.trim()}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(
    `Timed out waiting for transaction ${appName} to reach its hold point: ${process.errors.trim()} ${process.output.trim()}`,
  );
}

async function assertLockWait(appName) {
  const deadline = Date.now() + 4_000;
  while (Date.now() < deadline) {
    const result = await runSql(
      `select count(*) from pg_stat_activity where application_name = '${appName}' and wait_event_type = 'Lock'`,
    );
    if (result.output.trim() === "1") return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`${appName} never reached a database lock wait`);
}

function applicantSql(statement) {
  return `begin;
    set local role authenticated;
    select set_config('request.jwt.claim.sub', '${userId}', true);
    ${statement};
    select pg_sleep(5);
    commit;`;
}

function hrSql(statement) {
  return `begin;
    set local role authenticated;
    select set_config('request.jwt.claim.sub', '${hrId}', true);
    ${statement};
    select pg_sleep(5);
    commit;`;
}

const insertFixtures = `
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
    values ('${userId}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '${email}', '', now()),
      ('${hrId}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'race-hr-${hrId}@example.test', '', now());
  update public.profiles set role = 'hr' where user_id = '${hrId}';
  insert into public.jobs (id, title, team, category, description, requirements, status, published_at)
    values ${jobs.map((id, index) => `('${id}', 'Race job ${index + 1}', 'Engineering', 'engineering', 'Synthetic description', 'Synthetic requirements', 'published', now())`).join(",\n")};`;
const cleanup = `
  delete from public.applications where job_id in (${jobs.map((id) => `'${id}'`).join(",")});
  delete from public.jobs where id in (${jobs.map((id) => `'${id}'`).join(",")});
  delete from auth.users where id in ('${userId}', '${hrId}');`;

let fixturesCreated = false;
try {
  await runSql(insertFixtures);
  fixturesCreated = true;
  // Complete the Applicant fixture through the authorized RPC used by the app.
  await runSql(`begin;
    set local role authenticated;
    select set_config('request.jwt.claim.sub', '${userId}', true);
    select public.save_applicant_profile('Synthetic Applicant', '+6591234567', null, null, null);
    commit;`);

  // One transaction holds the first submission and its job/advisory locks.
  const firstAppName = `race-first-submit-${userId}`;
  const first = startSql(
    applicantSql(
      `select public.submit_application_details_v2('${jobs[0]}', 'First synthetic letter','Synthetic Applicant','+6591234567',null, null)`,
    ),
    firstAppName,
  );
  await waitForSleep(first, firstAppName);
  const duplicateAppName = `race-duplicate-${userId}`;
  const duplicate = startSql(
    applicantSql(
      `select public.submit_application_details_v2('${jobs[0]}', 'Second synthetic letter','Synthetic Applicant','+6591234567',null, null)`,
    ),
    duplicateAppName,
  );
  await assertLockWait(duplicateAppName);
  const firstResult = await first.done;
  const duplicateResult = await duplicate.done;
  if (
    firstResult.code !== 0 ||
    duplicateResult.code === 0 ||
    !duplicateResult.errors.includes("Application already submitted")
  ) {
    throw new Error(
      `Concurrent submit outcome unexpected: first=${firstResult.code}, second=${duplicateResult.code}; ${duplicateResult.errors.trim()}`,
    );
  }
  const duplicateCount = await runSql(
    `select count(*) from public.applications where job_id = '${jobs[0]}'`,
  );
  if (duplicateCount.output.trim() !== "1")
    throw new Error("Concurrent submissions created more than one row");

  // Closure wins the job lock: the waiting submit must be rejected.
  const closingAppName = `race-close-first-${userId}`;
  const closing = startSql(
    hrSql(`select public.close_hr_job('${jobs[1]}')`),
    closingAppName,
  );
  await waitForSleep(closing, closingAppName);
  const lateAppName = `race-too-late-${userId}`;
  const tooLate = startSql(
    applicantSql(
      `select public.submit_application_details_v2('${jobs[1]}', 'Too late','Synthetic Applicant','+6591234567',null, null)`,
    ),
    lateAppName,
  );
  await assertLockWait(lateAppName);
  const closingResult = await closing.done;
  const tooLateResult = await tooLate.done;
  if (
    closingResult.code !== 0 ||
    tooLateResult.code === 0 ||
    !tooLateResult.errors.includes("Job is not open for applications")
  ) {
    throw new Error(
      `Close-first outcome unexpected: close=${closingResult.code}, submit=${tooLateResult.code}; ${tooLateResult.errors.trim()}`,
    );
  }
  const closedCount = await runSql(
    `select count(*) from public.applications where job_id = '${jobs[1]}'`,
  );
  if (closedCount.output.trim() !== "0")
    throw new Error("Submission was recorded after closure won the lock");

  // Submission wins the lock: close waits, then preserves the submitted row.
  const beforeCloseAppName = `race-submit-first-${userId}`;
  const beforeClose = startSql(
    applicantSql(
      `select public.submit_application_details_v2('${jobs[2]}', 'Before close','Synthetic Applicant','+6591234567',null, null)`,
    ),
    beforeCloseAppName,
  );
  await waitForSleep(beforeClose, beforeCloseAppName);
  const closeAppName = `race-close-after-${userId}`;
  const closeAfter = startSql(
    hrSql(`select public.close_hr_job('${jobs[2]}')`),
    closeAppName,
  );
  await assertLockWait(closeAppName);
  const submitResult = await beforeClose.done;
  const closeAfterResult = await closeAfter.done;
  if (submitResult.code !== 0 || closeAfterResult.code !== 0) {
    throw new Error(
      `Submit-first outcome unexpected: submit=${submitResult.code}, close=${closeAfterResult.code}`,
    );
  }
  const finalState = await runSql(
    `select j.status || ':' || count(a.id) from public.jobs j left join public.applications a on a.job_id = j.id where j.id = '${jobs[2]}' group by j.status`,
  );
  if (finalState.output.trim() !== "closed:1")
    throw new Error("Close did not preserve the preceding application");

  // Competing revisions cannot save a letter from one request and contacts from another.
  await runSql(`begin; set local role authenticated; select set_config('request.jwt.claim.sub', '${userId}', true);
    select public.save_application_details_v2('${jobs[3]}', 'Initial', 'Initial Name', null, null, null); commit;`);
  const savingAppName = `race-save-winning-${userId}`;
  const saving = startSql(
    applicantSql(
      `select public.save_application_details_v2('${jobs[3]}', 'Winning letter', 'Winning Name', '+6591234567', 'https://example.test/winner', 1)`,
    ),
    savingAppName,
  );
  await waitForSleep(saving, savingAppName);
  const staleAppName = `race-stale-details-${userId}`;
  const stale = startSql(
    applicantSql(
      `select public.save_application_details_v2('${jobs[3]}', 'Losing letter', 'Losing Name', '+6598765432', null, 1)`,
    ),
    staleAppName,
  );
  await assertLockWait(staleAppName);
  const savingResult = await saving.done;
  const staleResult = await stale.done;
  if (
    savingResult.code !== 0 ||
    staleResult.code === 0 ||
    !staleResult.errors.includes("Application changed; reload before saving")
  ) {
    throw new Error(
      "Concurrent complete-field draft revision did not reject the stale writer",
    );
  }
  const savedDetails = await runSql(
    `select cover_letter || ':' || full_name || ':' || phone || ':' || portfolio_url || ':' || revision from public.applications where job_id='${jobs[3]}'`,
  );
  if (
    savedDetails.output.trim() !==
    "Winning letter:Winning Name:+6591234567:https://example.test/winner:2"
  ) {
    throw new Error(
      "Concurrent writes mixed field sets or advanced the wrong revision",
    );
  }
  process.stdout.write(
    "PASS: duplicate submit, close-first, submit-first and complete-field stale-draft races.\n",
  );
} finally {
  if (fixturesCreated) await runSql(cleanup);
}
