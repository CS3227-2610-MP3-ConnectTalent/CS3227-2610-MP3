import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
const container="supabase_db_CS3227-2610-MP3";
const actor=randomUUID(); const jobs=Array.from({length:4},()=>randomUUID()); const operations=Array.from({length:4},()=>randomUUID());
if (!process.env.TEST_SUPABASE_SERVICE_ROLE_KEY) throw new Error('Local synthetic cleanup requires TEST_SUPABASE_SERVICE_ROLE_KEY.');
const cleanupClient=createClient('http://127.0.0.1:54321',process.env.TEST_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
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

function hold(sql, marker) { return `begin; ${sql}; select '${marker}'; select pg_sleep(2); commit;`; }
function write(job, mode, revision) { return `set local role authenticated; select set_config('request.jwt.claim.sub','${actor}',true);
 select public.${mode}_application_details_v3('${job}','Synthetic letter','Synthetic Applicant',null,null,'College','Internship',${revision})`; }
function reserve(index) { return `select public.reserve_application_resume('${actor}','${jobs[index]}',1,'${operations[index]}','synthetic.pdf',512,repeat('a',64))`; }
function finalize(index) { return `select public.finalize_application_resume('${actor}','${jobs[index]}',1,'${operations[index]}')`; }
async function pair(firstSql, secondSql, failure) {
  const marker = `LOCK_${randomUUID().replaceAll('-','')}`;
  const first = startSql(hold(firstSql, marker)); await waitForMarker(first, marker);
  const name = `profile44-${randomUUID()}`;
  const second = startSql(`begin; ${secondSql}; commit;`, name); await assertLockWait(name);
  const a = await first.done; const b = await second.done;
  if (a.code !== 0 || (failure ? b.code === 0 || !b.errors.includes(failure) : b.code !== 0)) throw new Error(`Race failed: ${a.errors} ${b.errors}`);
}
try {
  await runSql(`insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at)
   values('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','resume-race-${actor}@example.test','',now());
   insert into public.jobs(id,title,team,category,description,requirements,status,published_at) values
   ${jobs.map(job => `('${job}','Resume race','Synthetic','engineering','Synthetic','Synthetic','published',now())`).join(',')};`);
  for (const job of jobs) await runSql(`begin; ${write(job,'save', 'null')}; commit;`);
  // Reserve wins: concurrent submission waits and then rejects the pending upload.
  await pair(reserve(0), write(jobs[0], 'submit', 1), 'Finish or cancel the pending upload');
  // Submit wins: subsequent reservation cannot alter submitted application.
  await pair(write(jobs[1], 'submit', 1), reserve(1), 'Editable saved draft required');
  for (const index of [2,3]) {
    await runSql(`${reserve(index)}; insert into storage.objects(bucket_id,name)
      select 'application-resumes',object_path from public.application_resume_objects where id='${operations[index]}';`);
  }
  // Close wins the shared job lock: finalization fails and its tracked pending object is recoverable.
  await pair(`update public.jobs set status='closed' where id='${jobs[2]}'`, finalize(2), 'Job is not open for applications');
  // Finalize wins: close waits, preserving the finalized draft file reference for owned reads.
  await pair(finalize(3), `update public.jobs set status='closed' where id='${jobs[3]}'`, null);
  const result = await runSql(`select count(*) from public.applications where job_id='${jobs[3]}' and resume_id='${operations[3]}'`);
  if (result.output.trim() !== '1') throw new Error('Closure lost finalized reference');
  process.stdout.write('PASS: reserve-vs-submit, submit-vs-reserve, close-vs-finalize, finalize-vs-close; lock waits observed.\n');
} finally {
  const {data: objects,error}=await cleanupClient.from('application_resume_objects').select('object_path').eq('applicant_id',actor);
  if(error) throw new Error('Could not read own fixture cleanup keys.');
  if(objects?.length) { const {error:storageError}=await cleanupClient.storage.from('application-resumes').remove(objects.map(row=>row.object_path)); if(storageError) throw new Error('Storage fixture cleanup failed.'); }
  await runSql(`delete from public.applications where applicant_id='${actor}';
    delete from public.jobs where id in (${jobs.map(id=>`'${id}'`).join(',')}); delete from auth.users where id='${actor}';`);
}
