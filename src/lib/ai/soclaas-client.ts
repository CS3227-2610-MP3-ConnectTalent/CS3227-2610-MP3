import "server-only";

import OpenAI from "openai";

import { applicantDraftMessages, hrSummaryMessages, type ApplicantDraftInput, type HrSummaryInput } from "./prompts";

const providerTimeoutMs = 20_000;

function providerConfiguration() {
  if (process.env.SOCLAAS_AI_ENABLED !== "true") return null;
  const apiKey = process.env.SOCLAAS_API_KEY?.trim();
  const baseURL = process.env.SOCLAAS_BASE_URL?.trim();
  const model = process.env.SOCLAAS_MODEL?.trim();
  if (!apiKey || !baseURL || !model) return null;

  let endpoint: URL;
  try {
    endpoint = new URL(baseURL);
  } catch {
    return null;
  }
  const localHost = endpoint.hostname === "localhost" || endpoint.hostname === "127.0.0.1";
  if (endpoint.protocol !== "https:" && !(localHost && endpoint.protocol === "http:")) return null;
  return { apiKey, baseURL, model };
}

export function isSoCLaaSReady() {
  return providerConfiguration() !== null;
}

function clientForRequest() {
  const configuration = providerConfiguration();
  if (!configuration) throw new Error("SoCLaaS is not configured.");
  const client = new OpenAI({
    apiKey: configuration.apiKey,
    baseURL: configuration.baseURL,
    timeout: providerTimeoutMs,
    maxRetries: 0,
  });
  return { client, model: configuration.model };
}

async function requestJson(messages: ReturnType<typeof applicantDraftMessages> | ReturnType<typeof hrSummaryMessages>, maxTokens: number) {
  const { client, model } = clientForRequest();
  const response = await client.chat.completions.create({
    model,
    messages,
    response_format: { type: "json_object" },
    max_tokens: maxTokens,
  });
  const content = response.choices[0]?.message.content;
  if (typeof content !== "string" || content.length === 0) throw new Error("SoCLaaS returned no JSON content.");
  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new Error("SoCLaaS returned invalid JSON.");
  }
}

export function generateApplicantDraft(input: ApplicantDraftInput) {
  return requestJson(applicantDraftMessages(input), 500);
}

export function generateHrSummary(input: HrSummaryInput) {
  return requestJson(hrSummaryMessages(input), 350);
}
