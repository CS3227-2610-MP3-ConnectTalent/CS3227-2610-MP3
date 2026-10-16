import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { AiDraftPreview } from "@/components/ai-draft-preview";

function preview(overrides = {}) {
  return AiDraftPreview({
    draft: "Synthetic suggestion",
    replacing: false,
    busy: false,
    onEdit: vi.fn(),
    onAdopt: vi.fn(),
    onDiscard: vi.fn(),
    ...overrides,
  });
}

it.each([
  [false, "Use this draft"],
  [true, "Replace current cover letter"],
])("uses a fixed human-action label when replacing=%s", (replacing, label) => {
  const onAdopt = vi.fn();
  const view = preview({ replacing, onAdopt });
  const button = view.props.children[3].props.children[0];
  expect(button.props.children).toBe(label);
  expect(button.props.type).toBe("button");
  expect(button.props.disabled).toBe(false);
  expect(onAdopt).not.toHaveBeenCalled();
  button.props.onClick();
  expect(onAdopt).toHaveBeenCalledOnce();
});

it.each([
  [true, "Synthetic suggestion", true],
  [false, "  ", true],
  [false, "Edited suggestion", false],
])("bounds adoption for busy=%s and draft=%s", (busy, draft, disabled) => {
  const buttons = preview({ busy, draft }).props.children[3].props.children;
  expect(buttons[0].props.disabled).toBe(disabled);
  expect(buttons[1].props.disabled).toBe(busy);
  expect(buttons[1].props.type).toBe("button");
});

it("edits or discards only through explicit callbacks and escapes model markup", () => {
  const onEdit = vi.fn(),
    onDiscard = vi.fn(),
    onAdopt = vi.fn();
  const view = preview({
    draft: "<script>submitNow()</script>",
    onEdit,
    onDiscard,
    onAdopt,
  });
  const html = renderToStaticMarkup(view);
  expect(html).not.toContain("<script>");
  expect(html).toContain("Nothing is saved or submitted.");
  view.props.children[1].props.onChange({
    target: { value: "Human revision" },
  });
  view.props.children[3].props.children[1].props.onClick();
  expect(onEdit).toHaveBeenCalledWith("Human revision");
  expect(onDiscard).toHaveBeenCalledOnce();
  expect(onAdopt).not.toHaveBeenCalled();
});
