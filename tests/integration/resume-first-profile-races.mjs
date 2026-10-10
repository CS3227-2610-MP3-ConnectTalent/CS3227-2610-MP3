import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
const container = "supabase_db_CS3227-2610-MP3";
const actor = randomUUID();
const jobs = Array.from({ length: 4 }, () => randomUUID());
const operations = Array.from({ length: 4 }, () => randomUUID());
if (!process.env.TEST_SUPABASE_SERVICE_ROLE_KEY)
  throw new Error(
    "Local synthetic cleanup requires TEST_SUPABASE_SERVICE_ROLE_KEY.",
  );
const cleanupClient = createClient(
  "http://127.0.0.1:54321",
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
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
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    errors += chunk.toString();
  });
  const done = new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, output, errors }));
  });
  return {
    done,
    get output() {
      return output;
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

async function waitForMarker(process, marker) {
  const deadline = Date.now() + 10_000;
  while (!process.output.includes(marker)) {
    if (Date.now() > deadline)
      throw new Error(`Timed out waiting for ${marker}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
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

function hold(sql, marker) {
  return `begin; ${sql}; select '${marker}'; select pg_sleep(2); commit;`;
}
function write(job, mode, revision) {
  return `set local role authenticated; select set_config('request.jwt.claim.sub','${actor}',true);
 select public.${mode}_application_details_v3('${job}','Synthetic letter','Synthetic Applicant','+6591234567',null,'College','Internship',${revision})`;
}
async function pair(firstSql, secondSql, failure) {
  const marker = `LOCK_${randomUUID().replaceAll("-", "")}`;
  const first = startSql(hold(firstSql, marker));
  await waitForMarker(first, marker);
  const name = `profile44-${randomUUID()}`;
  const second = startSql(`begin; ${secondSql}; commit;`, name);
  await assertLockWait(name);
  const a = await first.done;
  const b = await second.done;
  if (
    a.code !== 0 ||
    (failure ? b.code === 0 || !b.errors.includes(failure) : b.code !== 0)
  )
    throw new Error(`Race failed: ${a.errors} ${b.errors}`);
}
try {
  await runSql(`insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at)
    values('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','resume53-race-${actor}@example.test','',now());
    insert into public.applicant_profiles(user_id,full_name,phone) values('${actor}','Fixture Applicant','+6591234567');
    insert into public.jobs(id,title,team,category,description,requirements,status,published_at)
    values('${jobs[0]}','First upload race','Synthetic','engineering','Synthetic','Synthetic','published',now());`);
  const firstUpload = `select public.prepare_application_resume('${actor}','${jobs[0]}',null,'${operations[0]}','synthetic.pdf',512,repeat('a',64))`;
  await pair(firstUpload, write(jobs[0], "save", "null"), "changed");
  const count = await runSql(
    `select count(*) from public.applications where applicant_id='${actor}' and job_id='${jobs[0]}'`,
  );
  if (count.output.trim() !== "1")
    throw new Error("First upload created duplicate applications");
  for (const index of [1, 2]) {
    await runSql(`select public.reserve_profile_resume('${actor}','${operations[index]}','profile.pdf',512,repeat('a',64),null);
      insert into storage.objects(bucket_id,name) values('profile-resumes','${operations[index]}.pdf');`);
    const finish = `select public.finalize_profile_resume('${actor}','${operations[index]}')`;
    const remove = `select public.retire_profile_resume('${actor}',null,false)`;
    if (index === 1) {
      await pair(finish, remove, "changed");
      await runSql(
        `select public.retire_profile_resume('${actor}','${operations[index]}',false)`,
      );
    } else await pair(remove, finish, "Profile resume changed");
  }
  const pointer = await runSql(
    `select count(*) from public.applicant_profiles where user_id='${actor}' and resume_id is not null`,
  );
  if (pointer.output.trim() !== "0")
    throw new Error("Retired profile file resurrected");
  process.stdout.write(
    "PASS: first-upload-vs-save, profile-finalize-vs-remove, remove-vs-finalize; actual lock waits observed.\n",
  );
} finally {
  for (const [table, bucket] of [
    ["application_resume_objects", "application-resumes"],
    ["profile_resume_objects", "profile-resumes"],
  ]) {
    const { data, error } = await cleanupClient
      .from(table)
      .select("object_path")
      .eq("applicant_id", actor);
    if (error) throw new Error("Cannot read scoped fixture keys");
    if (data?.length) {
      const { error: failure } = await cleanupClient.storage
        .from(bucket)
        .remove(data.map((row) => row.object_path));
      if (failure) throw new Error("Storage fixture cleanup failed");
    }
  }
  await runSql(`delete from public.applications where applicant_id='${actor}';
    update public.applicant_profiles set resume_id=null where user_id='${actor}';
    delete from public.profile_resume_objects where applicant_id='${actor}';
    delete from public.jobs where id='${jobs[0]}';delete from auth.users where id='${actor}';`);
}
