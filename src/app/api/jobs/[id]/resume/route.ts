import { z } from "zod";
import { currentApplicant } from "@/lib/auth";
import { getOwnApplicationForJob } from "@/lib/applications";
import { getApplicationResume,removeApplicationResume,uploadResumeForJob } from "@/lib/application-resumes";
import { downloadProfileResume } from "@/lib/profile-resumes";
import { readResumeFile,resumeFailure,resumeHeaders } from "@/lib/resume-request";
export const runtime="nodejs";export const dynamic="force-dynamic";
type Context={params:Promise<{id:string}>};
async function result(job:string){const app=await getOwnApplicationForJob(job);return app?{applicationId:app.id,revision:app.revision,resume:await getApplicationResume(app.id)}:{};}
export async function POST(request:Request,{params}:Context){
 if(request.headers.get("origin")!==new URL(request.url).origin)return Response.json({error:"Request not allowed."},{status:403,headers:resumeHeaders});
 const account=await currentApplicant();if(!account)return Response.json({error:"Applicant access required."},{status:403,headers:resumeHeaders});
 const {id}=await params;if(!z.uuid().safeParse(id).success)return Response.json({error:"Job unavailable."},{status:404,headers:resumeHeaders});
 try{
  const raw=request.headers.get("x-application-revision");const revision=raw?Number(raw):null;
  if(revision!==null&&(!Number.isSafeInteger(revision)||revision<1))throw new Error("Reload the application.");
  const intent=request.headers.get("x-resume-intent");
  if(intent==="remove"){if(revision===null)throw new Error("Reload the application.");await removeApplicationResume(account.user.id,id,revision);}
  else if(intent==="upload"||intent==="profile"){
   const operation=request.headers.get("x-resume-operation");if(!z.uuid().safeParse(operation).success)throw new Error("Choose the file again.");
   let file:File;
   if(intent==="profile"){
    const sourceId=request.headers.get("x-profile-resume");if(!z.uuid().safeParse(sourceId).success)throw new Error("Reload your profile résumé.");
    const source=await downloadProfileResume(sourceId!);if(!source)throw new Error("Reload your profile résumé before using it.");
    file=new File([source.bytes],source.info.filename,{type:"application/pdf"});
   }else file=await readResumeFile(request);
   await uploadResumeForJob(account.user.id,id,revision,file,operation!,request.headers.get("x-resume-retry")==="true");
  }else throw new Error("Choose an upload action.");
  return Response.json({ok:true,...await result(id)},{headers:resumeHeaders});
 }catch(error){let current={};try{current=await result(id);}catch{/* Safe error must not expose DB details. */}
  return Response.json({...resumeFailure(error),...current},{status:400,headers:resumeHeaders});}
}
