import "server-only";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { Worker } from "node:worker_threads";

export const RESUME_MAX_BYTES = 1_048_576;
const safeError = "Choose a valid, unencrypted PDF résumé of at most 1 MiB.";
// Parsing runs outside the request thread with memory/time limits. No text extraction or execution.
async function checkPdf(bytes: Uint8Array) {
  const library = createRequire(`${process.cwd()}/package.json`).resolve(
    "pdf-lib",
  );
  await new Promise<void>((resolve, reject) => {
    const worker = new Worker(
      `
      const { parentPort, workerData } = require('node:worker_threads');
      const { PDFDocument } = require(workerData.library);
      PDFDocument.load(workerData.bytes, { ignoreEncryption: false, throwOnInvalidObject: true, updateMetadata: false })
        .then(doc => parentPort.postMessage(!doc.isEncrypted && doc.getPageCount() > 0))
        .catch(() => parentPort.postMessage(false));
    `,
      {
        eval: true,
        workerData: { bytes, library },
        resourceLimits: {
          maxOldGenerationSizeMb: 64,
          maxYoungGenerationSizeMb: 16,
        },
      },
    );
    const timer = setTimeout(() => {
      void worker.terminate();
      reject(new Error(safeError));
    }, 3000);
    const finish = (valid: boolean) => {
      clearTimeout(timer);
      void worker.terminate();
      if (valid) resolve();
      else reject(new Error(safeError));
    };
    worker.once("message", (valid) => finish(valid === true));
    worker.once("error", () => finish(false));
    worker.once("exit", (code) => {
      if (code !== 0) finish(false);
    });
  });
}
export async function validateResume(file: File) {
  if (
    !(file instanceof File) ||
    !file.name ||
    [...file.name].length > 120 ||
    !/\.pdf$/i.test(file.name) ||
    /[\u0000-\u001f\u007f-\u009f/\\]/u.test(file.name) ||
    file.type !== "application/pdf" ||
    file.size < 1 ||
    file.size > RESUME_MAX_BYTES
  )
    throw new Error(safeError);
  const bytes = new Uint8Array(
    await file.slice(0, RESUME_MAX_BYTES + 1).arrayBuffer(),
  );
  if (
    bytes.length !== file.size ||
    bytes.length > RESUME_MAX_BYTES ||
    !/^%PDF-1\.[0-9]|^%PDF-2\.0/.test(
      new TextDecoder().decode(bytes.slice(0, 9)),
    ) ||
    !new TextDecoder().decode(bytes.slice(-1024)).includes("%%EOF")
  )
    throw new Error(safeError);
  await checkPdf(bytes);
  return {
    bytes,
    filename: file.name,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}
