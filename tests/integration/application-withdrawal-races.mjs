import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
const container="supabase_db_CS3227-2610-MP3";
const actor=randomUUID(), hr=randomUUID(), jobs=Array.from({length:4},()=>randomUUID());
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

async function pair(firstSql, secondSql, failure) {
 const marker=`LOCK_${randomUUID().replaceAll('-','')}`;
 const first=startSql(hold(firstSql,marker));await waitForMarker(first,marker);
 const name=`withdraw50-${randomUUID()}`;
 const second=startSql(`begin; ${secondSql}; commit;`,name);await assertLockWait(name);
 const a=await first.done,b=await second.done;
 if(a.code!==0 || (failure ? b.code===0 || !b.errors.includes(failure) : b.code!==0))throw new Error(`Race failed: ${a.errors} ${b.errors}`);
}
function asActor(id,sql){return `set local role authenticated; select set_config('request.jwt.claim.sub','${id}',true); ${sql}`;}
const app=index=>`(select id from public.applications where job_id='${jobs[index]}' and applicant_id='${actor}')`;
const withdraw=index=>asActor(actor,`select public.withdraw_application(${app(index)})`);
const note=index=>asActor(hr,`select public.append_hr_application_note(${app(index)},'Synthetic race note')`);
const status=index=>asActor(hr,`select public.change_hr_application_status(${app(index)},'shortlisted',1)`);
try{
 await runSql(`insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at) values
 ('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','withdraw-race-${actor}@example.test','',now()),
 ('${hr}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','withdraw-race-${hr}@example.test','',now());
 insert into public.applicant_profiles(user_id,full_name,phone) values('${actor}','Fixture Applicant','+6591234567');
 update public.profiles set role='hr' where user_id='${hr}';
 insert into public.jobs(id,title,team,category,description,requirements,status,published_at) values
 ${jobs.map(job=>`('${job}','Withdrawal race','Synthetic','engineering','Synthetic','Synthetic','published',now())`).join(',')};
 begin; ${asActor(actor,jobs.map(job=>`select public.submit_application_details_v3('${job}','Synthetic letter','Synthetic Applicant','+6591234567',null,null,null,null);`).join(' '))} commit;`);
 await pair(withdraw(0),note(0),'Withdrawn applications cannot be processed');
 await pair(note(1),withdraw(1),null);
 await pair(withdraw(2),status(2),'Withdrawn applications are locked');
 await pair(status(3),withdraw(3),null);
 const result=await runSql(`select count(*) from public.applications where applicant_id='${actor}' and withdrawn_at is not null;
 select count(*) from public.application_notes where application_id in(select id from public.applications where applicant_id='${actor}');
 select count(*) from public.application_status_events where application_id in(select id from public.applications where applicant_id='${actor}');`);
 if(result.output.trim()!=='4\n1\n1')throw new Error('Race retention counts differ: '+result.output.trim());
 process.stdout.write('PASS: withdrawal-vs-note, note-vs-withdrawal, withdrawal-vs-status, status-vs-withdrawal; actual lock waits observed.\n');
}finally{
 await runSql(`delete from public.applications where applicant_id='${actor}'; delete from public.jobs where id in(${jobs.map(job=>`'${job}'`).join(',')}); delete from auth.users where id in('${actor}','${hr}');`);
}
