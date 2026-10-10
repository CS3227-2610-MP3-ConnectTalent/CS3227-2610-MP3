import "server-only";
import { z } from "zod";
import { currentApplicant } from "./auth";
import { resumeMutationClient, type ResumeMetadata } from "./application-resumes";
import { validateResume } from "./resume-input";
const bucket="profile-resumes";
const metadata=z.object({id:z.uuid(),filename:z.string(),byte_size:z.number().int().positive(),object_path:z.string()});
export async function getProfileResume():Promise<ResumeMetadata|null>{
 const account=await currentApplicant();if(!account)return null;
 const {data,error}=await account.client.from("profile_resume_objects").select("id,filename,byte_size,object_path")
  .eq("applicant_id",account.user.id).eq("state","ready").maybeSingle();
 if(error)throw new Error("Résumé information is temporarily unavailable.");return data?metadata.parse(data):null;
}
export async function downloadProfileResume(expectedId?:string){
 const account=await currentApplicant();if(!account)return null;
 const info=await getProfileResume();if(!info||(expectedId&&info.id!==expectedId))return null;
 const {data,error}=await account.client.storage.from(bucket).download(info.object_path);
 return error||!data?null:{info,bytes:data};
}
async function cleanup(actor:string){
 const client=resumeMutationClient();const {data,error}=await client.rpc("claim_profile_resume_cleanup",{p_actor:actor});
 if(error||!Array.isArray(data))return;
 for(const item of data){const parsed=z.object({object_path:z.string().regex(/^[0-9a-f-]{36}\.pdf$/)}).safeParse(item);
  if(parsed.success)await client.storage.from(bucket).remove([parsed.data.object_path]);}
}
export async function retireProfileResume(actor:string,expected:string|null,pendingOnly=false){
 const {error}=await resumeMutationClient().rpc("retire_profile_resume",{p_actor:actor,p_expected:expected,p_pending_only:pendingOnly});
 if(error)throw new Error("Reload your profile before changing the résumé.");await cleanup(actor);
}
export async function uploadProfileResume(actor:string,file:File,operation:string,expected:string|null,retry=false){
 const valid=await validateResume(file);const client=resumeMutationClient();
 if(retry)await retireProfileResume(actor,expected,true);
 const {data:path,error}=await client.rpc("reserve_profile_resume",{p_actor:actor,p_operation:operation,p_filename:valid.filename,
  p_size:valid.bytes.length,p_sha256:valid.sha256,p_expected:expected});
 if(error||typeof path!=="string")throw new Error("Reload your profile or use Retry upload if an earlier upload was interrupted.");
 const {data:existing}=await client.from("profile_resume_objects").select("state").eq("id",operation).maybeSingle();
 if(existing?.state==="ready")return;
 try{
  const {data:stored}=await client.storage.from(bucket).download(path);
  if(stored){const storedFile=await validateResume(new File([stored],valid.filename,{type:"application/pdf"}));
   if(storedFile.sha256!==valid.sha256)throw new Error("Stored upload differs");}
  else {const {error:uploadError}=await client.storage.from(bucket).upload(path,valid.bytes,{contentType:"application/pdf",upsert:false});if(uploadError)throw new Error("Upload failed");}
  let {error:finalError}=await client.rpc("finalize_profile_resume",{p_actor:actor,p_operation:operation});
  if(finalError)({error:finalError}=await client.rpc("finalize_profile_resume",{p_actor:actor,p_operation:operation}));
  if(finalError)throw new Error("Finalize failed");
 }catch{await client.rpc("cancel_profile_resume",{p_actor:actor,p_operation:operation});await cleanup(actor);
  throw new Error("We could not confirm the upload. Reload to check your saved résumé.");}
 await cleanup(actor);
}
