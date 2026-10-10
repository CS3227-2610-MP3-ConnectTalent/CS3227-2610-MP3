import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-lib"],
  logging: { serverFunctions: false },
  outputFileTracingIncludes: {
    "/api/applications/*/resume": [
      "./node_modules/pdf-lib/**/*.{js,json}",
      "./node_modules/.pnpm/{pdf-lib@*,@pdf-lib*,pako@*,tslib@*}/node_modules/**/*.{js,json}",
    ],
  },
};

export default nextConfig;
