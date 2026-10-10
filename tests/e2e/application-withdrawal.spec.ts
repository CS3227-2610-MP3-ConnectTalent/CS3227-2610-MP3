import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import { expect, test } from "@playwright/test";
const key=process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!key,"Local synthetic withdrawal test requires local admin key.");
test("one form, private resume retry and confirmed retained withdrawal",async ({page,browser,baseURL})=>{
 test.setTimeout(180_000);
 const admin=createClient("http://127.0.0.1:54321",key!,{auth:{persistSession:false,autoRefreshToken:false}});
 const suffix=crypto.randomUUID(),job=crypto.randomUUID(),password="SyntheticCorrectHorse9!";
 const emails=[`withdraw50-${suffix}@example.test`,`withdraw50-hr-${suffix}@example.test`,`withdraw50-other-${suffix}@example.test`];
 const users:string[]=[];let app:string|undefined;
 const doc=await PDFDocument.create();doc.addPage();const pdf=Buffer.from(await doc.save());
 const contexts:Awaited<ReturnType<typeof browser.newContext>>[]=[];
 async function login(target:typeof page,email:string){await target.goto("/auth/sign-in");await target.getByLabel("Email").fill(email);await target.getByLabel("Password",{exact:true}).fill(password);await target.getByRole("button",{name:"Sign in",exact:true}).click();await expect(target).toHaveURL(email===emails[1]?/\/hr\/applications$/:/\/applications$/);}
 try{
  for(const email of emails){const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});expect(error).toBeNull();users.push(data.user!.id);}
  for(const email of [emails[0],emails[2]]) {
      const fixture=createClient("http://127.0.0.1:54321",key!,{auth:{persistSession:false}});
      expect((await fixture.auth.signInWithPassword({email,password})).error).toBeNull();
      expect((await fixture.rpc("save_applicant_profile",{p_full_name:"Fixture Applicant",p_phone:"+6591234567",p_portfolio_url:null,p_education:null,p_work_experience:null})).error).toBeNull();
    }
    expect((await admin.from("profiles").update({role:"hr"}).eq("user_id",users[1])).error).toBeNull();
  expect((await admin.from("jobs").insert({id:job,title:`Withdrawal role ${suffix}`,team:"Synthetic Platform",category:"engineering",description:"Synthetic",requirements:"Synthetic requirements",status:"published",published_at:new Date().toISOString()})).error).toBeNull();
  await login(page,emails[0]);await page.goto(`/jobs/${job}/apply`);
  await expect(page.locator("main form")).toHaveCount(1);await expect(page.getByRole("link",{name:"My applications",exact:true})).toHaveCount(1);
  await expect(page.getByLabel("Choose PDF résumé")).toBeEnabled();await expect(page.getByText("Save your draft to enable résumé upload.")).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Cancel interrupted upload"})).toHaveCount(0);
  await page.route("**/api/ai/applicant-draft",route=>route.fulfill({json:{draft:"Synthetic AI-assisted letter"}}));
  await page.getByLabel("Experience notes").fill("Synthetic experience");await page.getByRole("button",{name:"Generate draft",exact:true}).click();
  await expect(page.getByLabel("Cover letter",{exact:true})).toHaveValue("Synthetic AI-assisted letter");
  expect((await admin.from("applications").select("id").eq("applicant_id",users[0]).eq("job_id",job)).data).toHaveLength(0);
  await page.getByLabel("Full name",{exact:true}).fill("Synthetic Withdrawal Applicant");await page.getByRole("button",{name:"Save draft",exact:true}).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]+$/);app=new URL(page.url()).pathname.split("/").at(-1)!;
  await page.getByLabel("Choose PDF résumé").setInputFiles({name:"synthetic.pdf",mimeType:"application/pdf",buffer:pdf});
  await page.getByRole("button",{name:"Upload résumé",exact:true}).click();await expect(page.getByRole("link",{name:"Download résumé: synthetic.pdf"})).toBeVisible({timeout:30_000});
  await expect(page.getByRole("button",{name:"Retry upload",exact:true})).toHaveCount(0);
  const {data:saved}=await admin.from("applications").select("revision").eq("id",app).single();
  expect((await admin.rpc("reserve_application_resume",{p_actor:users[0],p_job:job,p_revision:saved!.revision,p_operation:crypto.randomUUID(),p_filename:"interrupted.pdf",p_size:pdf.length,p_sha256:"a".repeat(64)})).error).toBeNull();
  await page.getByLabel("Cover letter",{exact:true}).fill("Synthetic unsaved letter retained during upload");
  await page.getByLabel("Choose PDF résumé").setInputFiles({name:"replacement.pdf",mimeType:"application/pdf",buffer:pdf});
  await page.getByRole("button",{name:"Replace résumé",exact:true}).click();await expect(page.getByRole("button",{name:"Retry upload",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Retry upload",exact:true}).click();await expect(page.getByRole("link",{name:"Download résumé: replacement.pdf"})).toBeVisible();
  await expect(page.getByLabel("Cover letter",{exact:true})).toHaveValue("Synthetic unsaved letter retained during upload");
  for(const width of [390,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);}
  await page.getByRole("button",{name:"Submit application",exact:true}).click();await expect(page.getByText("Submitted application",{exact:true})).toBeVisible();
  await page.goto("/applications");
  await expect(page.getByRole("button",{name:"Withdraw application",exact:true})).toHaveCount(0);
  await page.locator(`a[href="/applications/${app}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/applications/${app}$`));
  await expect(page.getByRole("button",{name:"Withdraw application",exact:true})).toHaveCount(1);
  const hrContext=await browser.newContext({baseURL});contexts.push(hrContext);const hr=await hrContext.newPage();await login(hr,emails[1]);await hr.goto(`/hr/applications/${app}`);
  await hr.getByLabel("Add a note",{exact:true}).fill("Synthetic retained HR note");await hr.getByRole("button",{name:"Add note",exact:true}).click();await expect(hr.getByText("Synthetic retained HR note",{exact:true})).toBeVisible();
  const otherContext=await browser.newContext({baseURL});contexts.push(otherContext);const other=await otherContext.newPage();await login(other,emails[2]);expect((await other.request.get(`/api/applications/${app}/resume`)).status()).toBe(404);
  expect((await admin.from("jobs").update({status:"closed"}).eq("id",job)).error).toBeNull();await page.reload();
  await page.getByRole("button",{name:"Withdraw application",exact:true}).focus();await expect(page.getByRole("button",{name:"Withdraw application",exact:true})).toBeFocused();await page.keyboard.press("Enter");await page.getByRole("button",{name:"Keep application",exact:true}).click();
  expect((await admin.from("applications").select("withdrawn_at").eq("id",app).single()).data!.withdrawn_at).toBeNull();
  await page.getByRole("button",{name:"Withdraw application",exact:true}).click();await page.getByRole("button",{name:"Confirm withdrawal",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("Withdrawn");await expect(page.getByRole("button",{name:"Withdraw application",exact:true})).toHaveCount(0);
  expect((await page.request.get(`/api/applications/${app}/resume`)).status()).toBe(200);
  await hr.reload();await expect(hr.getByText("Withdrawn by the Applicant.",{exact:false})).toBeVisible();
  await expect(hr.getByRole("button",{name:"Add note",exact:true})).toHaveCount(0);await expect(hr.getByRole("button",{name:"Update status",exact:true})).toHaveCount(0);
  await expect(hr.getByRole("button",{name:/Generate summary/})).toHaveCount(0);await expect(hr.getByText("Synthetic retained HR note",{exact:true})).toBeVisible();
  expect((await hr.request.get(`/api/applications/${app}/resume`)).status()).toBe(200);
  const {data:retained}=await admin.from("applications").select("withdrawn_at,withdrawn_by,cover_letter,original_submitted_letter,resume_id").eq("id",app).single();
  expect(retained!.withdrawn_at).not.toBeNull();expect(retained!.withdrawn_by).toBe(users[0]);expect(retained!.cover_letter).toBe("Synthetic unsaved letter retained during upload");expect(retained!.resume_id).not.toBeNull();
  await page.goto("/applications");await expect(page.getByText("Withdrawn",{exact:true})).toBeVisible();await expect(page.getByText("View application",{exact:true})).toBeVisible();
 }finally{
  for(const context of contexts)await context.close();
  if(app){const {data:objects}=await admin.from("application_resume_objects").select("object_path").eq("application_id",app);if(objects?.length)await admin.storage.from("application-resumes").remove(objects.map(r=>r.object_path));expect((await admin.from("applications").delete().eq("id",app)).error).toBeNull();}
  await admin.from("jobs").delete().eq("id",job);for(const user of users)await admin.auth.admin.deleteUser(user);
 }
});
