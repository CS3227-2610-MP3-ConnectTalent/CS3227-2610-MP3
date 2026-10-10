import type { NextConfig } from "next";
const pdfTracePaths = ["./node_modules/pdf-lib/**/*.{js,json}", "./node_modules/.pnpm/{pdf-lib@*,@pdf-lib*,pako@*,tslib@*}/node_modules/**/*.{js,json}"];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-lib"],
  logging: { serverFunctions: false },
  outputFileTracingIncludes: {
    "/api/applications/*/resume": pdfTracePaths,
    "/api/jobs/*/resume": pdfTracePaths,
    "/api/profile/resume": pdfTracePaths,
  },
};

export default nextConfig;
