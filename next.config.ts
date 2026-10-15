import type { NextConfig } from "next";
const pdfTracePaths = [
  "./node_modules/pdfjs-dist/legacy/build/{pdf,pdf.worker}.mjs",
  "./node_modules/pdfjs-dist/package.json",
  "./node_modules/.pnpm/pdfjs-dist@*/node_modules/pdfjs-dist/{package.json,legacy/build/pdf.mjs,legacy/build/pdf.worker.mjs}",
  "./node_modules/.pnpm/@napi-rs+canvas*/node_modules/@napi-rs/**/*.{js,json,node}",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist"],
  logging: { serverFunctions: false },
  outputFileTracingIncludes: {
    "/api/applications/*/resume": pdfTracePaths,
    "/api/jobs/*/resume": pdfTracePaths,
    "/api/profile/resume": pdfTracePaths,
  },
};

export default nextConfig;
