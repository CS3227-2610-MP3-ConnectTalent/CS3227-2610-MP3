import { jsonNoStore } from "./http";

/** Browser request protection; authentication and authorization still run next. */
export function guardAiRequest(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (
    (origin !== null && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return jsonNoStore({ error: "This AI request is not allowed." }, 403);
  const media = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (media !== "application/json")
    return jsonNoStore({ error: "Send this AI request as JSON." }, 415);
  return null;
}
