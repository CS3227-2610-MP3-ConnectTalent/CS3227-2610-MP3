import { Textarea } from "@/components/ui/textarea";

type PreviewProps = {
  draft: string;
  replacing: boolean;
  busy: boolean;
  onEdit: (value: string) => void;
  onAdopt: () => void;
  onDiscard: () => void;
};

export function AiDraftPreview({
  draft,
  replacing,
  busy,
  onEdit,
  onAdopt,
  onDiscard,
}: PreviewProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <label htmlFor="ai-draft-preview" className="block font-medium">
        AI draft preview
      </label>
      <Textarea
        id="ai-draft-preview"
        value={draft}
        maxLength={5000}
        rows={8}
        onChange={(event) => onEdit(event.target.value)}
        aria-describedby="ai-adoption-notice"
      />
      <p id="ai-adoption-notice" className="text-sm text-muted-foreground">
        Review and edit this suggestion. Using it replaces your current cover
        letter in this form only. Nothing is saved or submitted.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !draft.trim()}
          onClick={onAdopt}
          className="rounded-lg border px-4 py-2 disabled:opacity-60"
        >
          {replacing ? "Replace current cover letter" : "Use this draft"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDiscard}
          className="rounded-lg border px-4 py-2"
        >
          Discard suggestion
        </button>
      </div>
    </div>
  );
}
