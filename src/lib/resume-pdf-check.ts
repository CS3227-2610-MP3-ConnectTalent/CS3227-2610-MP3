import "server-only";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
import { Worker } from "node:worker_threads";
import { pathToFileURL } from "node:url";
import { ResumeValidationError } from "./resume-errors";

// Trusted bootstrap source; uploaded bytes never become executable source.
// Parse page structure only, with no rendering, text extraction or actions.
export const pdfWorkerSource = `
  const { parentPort, workerData } = require('node:worker_threads');
  const reportPhase = phase => parentPort.postMessage({ type: 'phase', phase });
  async function inspect(pdfjs) {
    reportPhase('document-load');
    const task = pdfjs.getDocument({
      data: workerData.bytes, verbosity: 0, stopAtErrors: true,
      enableXfa: false, useWorkerFetch: false, useWasm: false,
      disableFontFace: true, useSystemFonts: false,
      disableAutoFetch: true, disableStream: true, disableRange: true
    });
    try {
      const doc = await task.promise;
      reportPhase('page-structure');
      if (doc.numPages < 1) return 'invalid';
      for (let page = 1; page <= doc.numPages; page++) {
        await doc.getPage(page);
      }
      return 'valid';
    } catch (error) {
      if (error instanceof pdfjs.PasswordException) return 'password';
      if (error instanceof pdfjs.InvalidPDFException) return 'invalid';
      if (
        error?.name === 'FormatError' ||
        (typeof error?.details === 'string' && error.details.includes('FormatError')) ||
        (typeof error?.message === 'string' && error.message.includes('FormatError'))
      ) return 'invalid';
      throw error;
    } finally {
      await task.destroy();
    }
  }
  async function run() {
    reportPhase('parser-import');
    const [pdfjs, parser] = await Promise.all([
      import(workerData.library), import(workerData.parser)
    ]);
    // Preload the parser so a missing runtime module is a service failure.
    globalThis.pdfjsWorker = parser;
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
    const worker = new Worker(pdfWorkerSource, {
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
  const startedAt = performance.now();
  let phase = "worker-startup";
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
      console.warn("resume_pdf_check_timeout", {
        phase,
        elapsedMs: Math.round(performance.now() - startedAt),
      });
      finish(new ResumeValidationError("RESUME_VALIDATION_TIMEOUT"));
    }, 5_000);
    worker.on("message", (result: unknown) => {
      if (isPhaseMessage(result)) {
        phase = result.phase;
        return;
      }
      if (result === "unavailable")
        logWorkerUnavailable(phase, "worker_result_unavailable");
      finish(resultError(result));
    });
    worker.once("error", () => {
      if (!settled) logWorkerUnavailable(phase, "worker_error");
      finish(new ResumeValidationError("RESUME_VALIDATOR_UNAVAILABLE"));
    });
    worker.once("exit", () => {
      if (!settled) logWorkerUnavailable(phase, "worker_exit");
      finish(new ResumeValidationError("RESUME_VALIDATOR_UNAVAILABLE"));
    });
  });
}

function isPhaseMessage(
  value: unknown,
): value is { type: "phase"; phase: string } {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  if (message.type !== "phase") return false;
  if (
    message.phase === "parser-import" ||
    message.phase === "document-load" ||
    message.phase === "page-structure"
  )
    return true;
  return false;
}

function logWorkerUnavailable(phase: string, category: string) {
  console.error("resume_pdf_check_unavailable", { phase, category });
}
