import "server-only";

const DEFAULT_LOCAL_ORIGIN = "http://localhost:3000";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function normalizeOrigin(
  value: string,
  variableName: string,
  allowLocalHttp: boolean,
): string {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    throw new Error(`${variableName} must be a valid site origin.`);
  }

  const isLocalHost = LOCAL_HOSTS.has(url.hostname);
  const isAllowedHttp =
    allowLocalHttp && isLocalHost && url.protocol === "http:";
  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    (url.protocol !== "https:" && !isAllowedHttp)
  ) {
    throw new Error(
      `${variableName} must be an HTTPS origin without a path, query, or fragment.`,
    );
  }

  return url.origin;
}

function configuredOverride(allowLocalHttp: boolean): string | undefined {
  const value = process.env.APP_SITE_URL?.trim();
  return value
    ? normalizeOrigin(value, "APP_SITE_URL", allowLocalHttp)
    : undefined;
}

export function getAppSiteOrigin(): string {
  const vercelEnvironment = process.env.VERCEL_ENV;

  if (vercelEnvironment === "production") {
    const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (productionUrl) {
      return normalizeOrigin(
        productionUrl,
        "VERCEL_PROJECT_PRODUCTION_URL",
        false,
      );
    }

    const override = configuredOverride(false);
    if (override) return override;
    throw new Error(
      "VERCEL_PROJECT_PRODUCTION_URL is required to build production Auth redirects.",
    );
  }

  if (vercelEnvironment === "preview") {
    const previewUrl = process.env.VERCEL_URL?.trim();
    if (previewUrl) return normalizeOrigin(previewUrl, "VERCEL_URL", false);

    const override = configuredOverride(false);
    if (override) return override;
    throw new Error("VERCEL_URL is required to build preview Auth redirects.");
  }

  if (process.env.VERCEL === "1" && vercelEnvironment !== "development") {
    throw new Error("VERCEL_ENV is required to build Vercel Auth redirects.");
  }

  return configuredOverride(true) ?? DEFAULT_LOCAL_ORIGIN;
}
