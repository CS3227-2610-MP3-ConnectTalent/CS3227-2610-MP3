import { PDFDocument } from "pdf-lib";
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { validateResume, RESUME_MAX_BYTES } from "@/lib/resume-input";
import { readResumeFile } from "@/lib/resume-request";

const pdfFile = (
  bytes: Uint8Array | string,
  name = "synthetic.pdf",
  type = "application/pdf",
) =>
  new File(
    [typeof bytes === "string" ? bytes : new Uint8Array(bytes).buffer],
    name,
    { type },
  );

it.each([
  [pdfFile(""), "RESUME_EMPTY"],
  [pdfFile("x", "bad/name.pdf"), "RESUME_FILENAME_INVALID"],
  [pdfFile("x", "x".repeat(121) + ".pdf"), "RESUME_FILENAME_INVALID"],
  [pdfFile("x", "file.exe"), "RESUME_TYPE_UNSUPPORTED"],
  [
    pdfFile("x", "file.pdf", "application/octet-stream"),
    "RESUME_TYPE_UNSUPPORTED",
  ],
  [pdfFile(new Uint8Array(RESUME_MAX_BYTES + 1)), "RESUME_TOO_LARGE"],
  [pdfFile("not PDF"), "RESUME_INVALID"],
  [pdfFile("%PDF-1.7\nmalformed\n%%EOF"), "RESUME_INVALID"],
])("classifies a rejected file as %s / %s", async (file, code) => {
  await expect(validateResume(file)).rejects.toMatchObject({ code });
});

it.each(["aes-128", "aes-256"])(
  "accepts %s encrypted PDFs that open without a password unchanged",
  async (algorithm) => {
    const bytes = await readFile(`tests/fixtures/pdf/${algorithm}-open.pdf`);
    const result = await validateResume(pdfFile(bytes));
    expect(result.bytes).toEqual(new Uint8Array(bytes));
  },
);

it.each(["aes-128", "aes-256"])(
  "explains when %s requires a password",
  async (algorithm) => {
    const bytes = await readFile(
      `tests/fixtures/pdf/${algorithm}-password.pdf`,
    );
    await expect(validateResume(pdfFile(bytes))).rejects.toMatchObject({
      code: "RESUME_PASSWORD_REQUIRED",
    });
  },
);

it("rejects zero-page PDFs without describing a service outage", async () => {
  const doc = await PDFDocument.create();
  await expect(
    validateResume(pdfFile(await doc.save({ addDefaultPage: false }))),
  ).rejects.toMatchObject({ code: "RESUME_INVALID" });
});

it("classifies oversized bodies before accepting file bytes", async () => {
  const request = new Request("http://localhost/api/profile/resume", {
    method: "POST",
    body: new Uint8Array(RESUME_MAX_BYTES + 1),
  });
  await expect(readResumeFile(request)).rejects.toMatchObject({
    code: "RESUME_TOO_LARGE",
  });
});

it("classifies malformed filename encoding without exposing a URI exception", async () => {
  const request = new Request("http://localhost/api/profile/resume", {
    method: "POST",
    headers: { "x-resume-filename": "%zz" },
    body: "synthetic",
  });
  await expect(readResumeFile(request)).rejects.toMatchObject({
    code: "RESUME_FILENAME_INVALID",
  });
});
