import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

// Local-only concurrency check; requires this project's running Supabase Docker stack.
const container = "supabase_db_CS3227-2610-MP3";
const requests = Array.from({ length: 25 }, () => ({ userId: randomUUID(), jobId: randomUUID() }));

function startSql(sql) {
  const child = spawn("docker", [
    "exec", "-i", container, "psql", "-U", "postgres", "-d", "postgres", "-X", "-q", "-A", "-t",
    "-v", "ON_ERROR_STOP=1", "-f", "-",
  ], { windowsHide: true });
  child.stdin.end(sql);
  let output = "";
  let errors = "";
  child.stdout.on("data", (chunk) => { output += chunk.toString(); });
  child.stderr.on("data", (chunk) => { errors += chunk.toString(); });
  const done = new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, output, errors }));
  });
  return done;
}

async function runSql(sql) {
  const result = await startSql(sql);
  if (result.code !== 0) throw new Error(`SQL exit ${result.code}: ${result.errors.trim()}`);
  return result.output.trim();
}

const userRows = requests.map(({ userId }) =>
  `('${userId}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ai-race-${userId}@example.test', '', now())`);
const jobRows = requests.map(({ jobId }, index) =>
  `('${jobId}', 'Quota race ${index + 1}', 'Engineering', 'engineering', 'Synthetic description', 'Synthetic requirements', 'published', now())`);
const jobIds = requests.map(({ jobId }) => `'${jobId}'`).join(",");
const userIds = requests.map(({ userId }) => `'${userId}'`).join(",");

let fixturesCreated = false;
try {
  fixturesCreated = true;
  await runSql(`
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
    values ${userRows.join(",\n")};
    insert into public.jobs (id, title, team, category, description, requirements, status, published_at)
    values ${jobRows.join(",\n")};
  `);
  const results = await Promise.all(requests.map(({ userId, jobId }) => startSql(`
    begin;
    set local role service_role;
    select set_config('request.jwt.claims', '{"role":"service_role"}', true);
    select public.reserve_ai_invocation('${userId}', 'applicant_draft', '${jobId}');
    commit;
  `)));

  const successes = results.filter((result) => result.code === 0).length;
  const denials = results.filter((result) => result.code !== 0 && result.errors.includes("AI request limit exceeded")).length;
  const unexpected = results.filter((result) => result.code !== 0 && !result.errors.includes("AI request limit exceeded"));
  if (successes !== 24 || denials !== 1 || unexpected.length > 0) {
    throw new Error(`Expected 24 reservations and 1 quota denial; got ${successes} reservations, ${denials} quota denials, ${unexpected.length} unexpected failures.`);
  }

  const targetIds = requests.map(({ jobId }) => `'${jobId}'`).join(",");
  const recorded = await runSql(`select count(*) from public.ai_invocations where target_id in (${targetIds})`);
  if (recorded !== "24") throw new Error(`Expected 24 metadata rows, got ${recorded}.`);

  process.stdout.write("PASS: 25 concurrent synthetic users produced exactly 24 deployment reservations and one denial.\n");
} finally {
  if (fixturesCreated) {
    await runSql(`
      delete from public.ai_invocations where target_id in (${jobIds});
      delete from public.jobs where id in (${jobIds});
      delete from auth.users where id in (${userIds});
    `);
  }
}
