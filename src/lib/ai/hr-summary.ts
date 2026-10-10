import {
  hrSummaryResponseSchema,
  hrSummarySelectionSchema,
  type HrSummaryResponse,
} from "./schemas";

const maxItems = 5;
const maxDisplayItemLength = 240;
const followUpPrefix =
  "Could you share an example related to this requirement: “";
const followUpSuffix = "”?";
const standaloneAbbreviation =
  /^(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e)\.$/i;

function mergeAbbreviationFragments(sentences: string[]) {
  return sentences.reduce<string[]>((merged, sentence) => {
    const previous = merged[merged.length - 1];
    if (previous && standaloneAbbreviation.test(previous)) {
      merged[merged.length - 1] = `${previous} ${sentence}`;
    } else {
      merged.push(sentence);
    }
    return merged;
  }, []);
}

export function splitHrSummarySource(source: string) {
  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
  return source
    .replace(/\r\n?/g, "\n")
    .split(/\n+/)
    .flatMap((line) =>
      mergeAbbreviationFragments(
        [...segmenter.segment(line)]
          .map(({ segment }) => segment.trim())
          .filter(Boolean),
      ),
    );
}

function truncateSourceSentence(source: string, maxLength: number) {
  if (source.length <= maxLength) return source;

  let excerpt = "";
  for (const character of source) {
    if ((excerpt + character).length > maxLength - 1) break;
    excerpt += character;
  }
  return `${excerpt.trimEnd()}…`;
}

function excerptAt(sentences: string[], sentenceId: number) {
  return truncateSourceSentence(sentences[sentenceId]!, maxDisplayItemLength);
}

function followUpForRequirement(requirement: string) {
  const maxRequirementLength =
    maxDisplayItemLength - followUpPrefix.length - followUpSuffix.length;
  return `${followUpPrefix}${truncateSourceSentence(requirement, maxRequirementLength)}${followUpSuffix}`;
}

export function buildHrSummaryResponse(
  modelOutput: unknown,
  letterSentences: string[],
  requirementSentences: string[],
): HrSummaryResponse | null {
  if (letterSentences.length === 0 || requirementSentences.length === 0)
    return null;

  const selection = hrSummarySelectionSchema.safeParse(modelOutput);
  if (!selection.success) return null;

  const {
    evidence_sentence_ids: evidenceIds,
    requirements_not_addressed_ids: gapIds,
  } = selection.data;
  if (
    evidenceIds.some((id) => id >= letterSentences.length) ||
    gapIds.some((id) => id >= requirementSentences.length)
  )
    return null;

  const evidence_mentioned = [...evidenceIds]
    .sort((a, b) => a - b)
    .slice(0, maxItems)
    .map((sentenceId) => excerptAt(letterSentences, sentenceId));
  const gaps = [...gapIds].sort((a, b) => a - b).slice(0, maxItems);
  const requirements_not_addressed = gaps.map((sentenceId) =>
    excerptAt(requirementSentences, sentenceId),
  );
  const follow_up_questions = gaps.map((sentenceId) =>
    followUpForRequirement(requirementSentences[sentenceId]!),
  );

  const response = hrSummaryResponseSchema.safeParse({
    evidence_mentioned,
    requirements_not_addressed,
    follow_up_questions,
  });
  return response.success ? response.data : null;
}
