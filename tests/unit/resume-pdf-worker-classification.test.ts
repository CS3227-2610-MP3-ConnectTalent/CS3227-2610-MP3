import { Worker } from "node:worker_threads";
import { expect, it } from "vitest";
import * as pdfCheck from "@/lib/resume-pdf-check";

const pdfWorkerSource = (pdfCheck as unknown as { pdfWorkerSource: string })
  .pdfWorkerSource;

it("treats unexpected PDF.js inspection failures as validator outages", async () => {
  const library = new URL(
    "../fixtures/pdf/pdfjs-runtime-error.mjs",
    import.meta.url,
  ).href;
  const parser = new URL(
    "../fixtures/pdf/pdfjs-worker-stub.mjs",
    import.meta.url,
  ).href;
  const worker = new Worker(pdfWorkerSource, {
    eval: true,
    workerData: { bytes: new Uint8Array([1]), library, parser },
  });

  try {
    const messages = await readWorkerResult(worker);
    expect(messages).toContainEqual({
      type: "phase",
      phase: "document-load",
    });
    expect(messages.at(-1)).toBe("unavailable");
  } finally {
    await worker.terminate();
  }
});

it("classifies parser format errors as invalid PDFs", async () => {
  const library = new URL(
    "../fixtures/pdf/pdfjs-format-error.mjs",
    import.meta.url,
  ).href;
  const parser = new URL(
    "../fixtures/pdf/pdfjs-worker-stub.mjs",
    import.meta.url,
  ).href;
  const worker = new Worker(pdfWorkerSource, {
    eval: true,
    workerData: { bytes: new Uint8Array([1]), library, parser },
  });

  try {
    const messages = await readWorkerResult(worker);
    expect(messages).toContainEqual({
      type: "phase",
      phase: "page-structure",
    });
    expect(messages.at(-1)).toBe("invalid");
  } finally {
    await worker.terminate();
  }
});

function readWorkerResult(worker: Worker) {
  return new Promise<unknown[]>((resolve, reject) => {
    const messages: unknown[] = [];
    worker.on("message", (message: unknown) => {
      messages.push(message);
      if (typeof message === "string") resolve(messages);
    });
    worker.once("error", reject);
    worker.once("exit", (code) => {
      reject(new Error(`PDF worker exited before returning a result: ${code}`));
    });
  });
}
