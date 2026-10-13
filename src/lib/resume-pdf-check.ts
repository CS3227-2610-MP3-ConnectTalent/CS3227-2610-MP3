import "server-only";
import { createRequire } from "node:module";
import { Worker } from "node:worker_threads";
import { pathToFileURL } from "node:url";
import { ResumeValidationError } from "./resume-errors";

// Trusted bootstrap source; uploaded bytes never become executable source.
// Parse page structure only, with no rendering, text extraction or actions.
const workerSource = `
  const { parentPort, workerData } = require('node:worker_threads');
  async function inspect(pdfjs) {
    const task = pdfjs.getDocument({
      data: workerData.bytes, verbosity: 0, stopAtErrors: true,
      enableXfa: false, useWorkerFetch: false, useWasm: false,
      disableFontFace: true, useSystemFonts: false,
      disableAutoFetch: true, disableStream: true, disableRange: true
    });
    try {
      const doc = await task.promise;
      if (doc.numPages < 1) return 'invalid';
      for (let page = 1; page <= doc.numPages; page++) {
        await doc.getPage(page);
      }
      return 'valid';
    } catch (error) {
      return error instanceof pdfjs.PasswordException ? 'password' : 'invalid';
    } finally {
      await task.destroy();
    }
  }
  async function run() {
    const pdfjs = await import(workerData.library);
    // Preload the parser so a missing runtime module is a service failure.
    globalThis.pdfjsWorker = await import(workerData.parser);
    return inspect(pdfjs);
  }
  run().then(result => parentPort.postMessage(result))
    .catch(() => parentPort.postMessage('unavailable'));
`;

function startPdfWorker(bytes: Uint8Array) {
  try {
    const resolve = createRequire(`${process.cwd()}/package.json`).resolve;
    const library = pathToFileURL(
      resolve("pdfjs-dist/legacy/build/pdf.mjs"),
    ).href;
    const parser = pathToFileURL(
      resolve("pdfjs-dist/legacy/build/pdf.worker.mjs"),
    ).href;
    const worker = new Worker(workerSource, {
      eval: true,
      workerData: { bytes, library, parser },
      stdout: true,
      stderr: true,
      resourceLimits: {
        maxOldGenerationSizeMb: 64,
        maxYoungGenerationSizeMb: 16,
      },
    });
    // Do not forward parser diagnostics or private document contents to logs.
    worker.stdout?.resume();
    worker.stderr?.resume();
    return worker;
  } catch {
    throw new ResumeValidationError("RESUME_VALIDATOR_UNAVAILABLE");
  }
}

function resultError(result: unknown) {
  if (result === "valid") return null;
  if (result === "password")
    return new ResumeValidationError("RESUME_PASSWORD_REQUIRED");
  if (result === "invalid") return new ResumeValidationError("RESUME_INVALID");
  return new ResumeValidationError("RESUME_VALIDATOR_UNAVAILABLE");
}

export async function checkPdf(bytes: Uint8Array) {
  const worker = startPdfWorker(bytes);
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error: ResumeValidationError | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      // Error/exit listeners remain to consume late events during termination.
      void worker.terminate().catch(() => undefined);
      if (error) reject(error);
      else resolve();
    };
    const timer = setTimeout(() => {
      finish(new ResumeValidationError("RESUME_VALIDATION_TIMEOUT"));
    }, 3000);
    worker.once("message", (result: unknown) => finish(resultError(result)));
    worker.once("error", () =>
      finish(new ResumeValidationError("RESUME_VALIDATOR_UNAVAILABLE")),
    );
    worker.once("exit", () =>
      finish(new ResumeValidationError("RESUME_VALIDATOR_UNAVAILABLE")),
    );
  });
}
