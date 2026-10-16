import "server-only";

export function allowedProviderEndpoint(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash) return false;
    if (url.pathname.replace(/\/$/, "") !== "/v1") return false;
    const gateway =
      url.protocol === "https:" &&
      url.hostname === "soclaas-api.comp.nus.edu.sg" &&
      !url.port;
    const local =
      process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return gateway || local;
  } catch {
    return false;
  }
}

export function completeAssistantContent(response: {
  choices: Array<{
    finish_reason: string;
    message: {
      role: string;
      content: string | null;
      refusal?: string | null;
      tool_calls?: unknown[];
      function_call?: unknown;
    };
  }>;
}): string {
  const choice = response.choices[0];
  if (
    response.choices.length !== 1 ||
    !choice ||
    choice.finish_reason !== "stop"
  )
    throw new Error("SoCLaaS returned an incomplete completion.");
  const message = choice.message;
  if (
    message.role !== "assistant" ||
    message.refusal ||
    message.tool_calls?.length ||
    message.function_call
  )
    throw new Error("SoCLaaS returned an unsupported completion.");
  if (typeof message.content !== "string" || !message.content.trim())
    throw new Error("SoCLaaS returned no JSON content.");
  return message.content;
}
