import { PDFDocument, PDFName } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { RESUME_MAX_BYTES, validateResume } from "../../src/lib/resume-input";
async function pdf() { const doc = await PDFDocument.create(); doc.addPage(); return new Uint8Array(await doc.save()); }
describe("bounded PDF resume validation", () => {
  it("accepts an ordinary PDF without extracting its text", async () => {
    const result = await validateResume(new File([await pdf()], "synthetic.pdf", { type: "application/pdf" }));
    expect(result.filename).toBe("synthetic.pdf"); expect(result.bytes.length).toBeGreaterThan(0);
  });
  it("rejects oversized bytes before parsing", async () => {
    await expect(validateResume(new File([new Uint8Array(RESUME_MAX_BYTES + 1)], "large.pdf", { type: "application/pdf" }))).rejects.toThrow();
  });
  it.each(["not a PDF", "%PDF-1.7\npretend\n%%EOF"])("rejects spoofed PDF content", async (bytes) => {
    await expect(validateResume(new File([bytes], "synthetic.pdf", { type: "application/pdf" }))).rejects.toThrow();
  });
  it("rejects a valid PDF mislabelled as an executable", async () => {
    await expect(validateResume(new File([await pdf()], "synthetic.exe", { type: "application/pdf" }))).rejects.toThrow();
  });
  it("rejects untrusted path/header filenames", async () => {
    await expect(validateResume(new File([await pdf()], "../private\r\n.pdf", { type: "application/pdf" }))).rejects.toThrow();
  });
  it("accepts a valid PDF at exactly the byte limit", async () => {
    const bytes = await pdf(); const padded = new Uint8Array(RESUME_MAX_BYTES).fill(32);
    padded.set(bytes); padded.set(new TextEncoder().encode("%%EOF"), padded.length - 5);
    expect((await validateResume(new File([padded], "synthetic.pdf", { type: "application/pdf" }))).bytes.length).toBe(RESUME_MAX_BYTES);
  });
  it("rejects encrypted PDF metadata without ignoring encryption", async () => {
    const doc = await PDFDocument.create(); doc.addPage();
    doc.context.trailerInfo.Encrypt = doc.context.register(doc.context.obj({ Filter: PDFName.of("Standard") }));
    const bytes = new Uint8Array(await doc.save());
    await expect(validateResume(new File([bytes], "encrypted.pdf", { type: "application/pdf" }))).rejects.toThrow("unencrypted");
  });
});
