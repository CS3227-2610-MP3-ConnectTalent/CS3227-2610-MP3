import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useState: vi.fn(),
  states: [] as unknown[],
  cursor: 0,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useState: mocks.useState };
});

import { ApplicantAiDraft } from "@/components/applicant-ai-draft";
import { HrAiSummary } from "@/components/hr-ai-summary";

function componentState<T>(component: () => T): T {
  mocks.cursor = 0;
  return component();
}

function array(
  value: unknown,
): Array<{ type?: unknown; props?: Record<string, unknown> }> {
  return Array.isArray(value) ? value : [value as never];
}

function applicantControls(onDraft = vi.fn()) {
  const root = componentState(() =>
    ApplicantAiDraft({
      jobId: "80000000-0000-4000-8000-000000000b01",
      onDraft,
    }),
  );
  const rootProps = (root as { props: Record<string, unknown> }).props;
  const controlsElement = array(rootProps.children)[1] as {
    type: (props: Record<string, unknown>) => unknown;
    props: Record<string, unknown>;
  };
  const controls = controlsElement.type(controlsElement.props) as {
    props: Record<string, unknown>;
  };
  return { root, controls, controlsProps: controlsElement.props, onDraft };
}

function findButton(element: { props: Record<string, unknown> }) {
  return array(element.props.children).find(
    (child) => child.type === "button",
  ) as { props: Record<string, unknown> };
}

function summarySection() {
  const root = componentState(() =>
    HrAiSummary({ applicationId: "80000000-0000-4000-8000-000000000b02" }),
  ) as {
    type: (props: Record<string, unknown>) => unknown;
    props: Record<string, unknown>;
  };
  const section = root.type(root.props) as { props: Record<string, unknown> };
  return { root, section };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.states = [];
  mocks.cursor = 0;
  mocks.useState.mockImplementation((initial: unknown) => {
    const index = mocks.cursor++;
    if (mocks.states[index] === undefined) mocks.states[index] = initial;
    return [
      mocks.states[index],
      (value: unknown) => {
        mocks.states[index] =
          typeof value === "function"
            ? (value as (current: unknown) => unknown)(mocks.states[index])
            : value;
      },
    ];
  });
});

afterEach(() => vi.unstubAllGlobals());

it("keeps the Applicant AI draft disabled until notes are entered", () => {
  const { controls } = applicantControls();
  const initial = applicantControls();
  const button = findButton(controls);
  expect(button.props.disabled).toBe(true);
  expect(initial.controlsProps.notes).toBe("");

  (initial.controlsProps.setNotes as (value: string) => void)(
    "  Synthetic experience  ",
  );
  const withNotes = applicantControls();
  expect(findButton(withNotes.controls).props.disabled).toBe(false);
  expect(withNotes.controlsProps.notes).toBe("  Synthetic experience  ");
});

it("adds a validated AI draft only to the editable form and shows review guidance", async () => {
  const onDraft = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ draft: "Synthetic editable draft" }), {
        status: 200,
      }),
    ),
  );
  const initial = applicantControls(onDraft);
  (initial.controlsProps.setNotes as (value: string) => void)(
    "Synthetic notes",
  );
  const ready = applicantControls(onDraft);
  (findButton(ready.controls).props.onClick as () => void)();
  await vi.waitFor(() =>
    expect(onDraft).toHaveBeenCalledWith("Synthetic editable draft"),
  );
  const rerendered = applicantControls(onDraft);
  const children = array(rerendered.controls.props.children);
  const noticeElement = children.at(-1) as {
    type: (props: Record<string, unknown>) => unknown;
    props: Record<string, unknown>;
  };
  expect(noticeElement.props.value).toContain(
    "Check every date, skill, and achievement",
  );
  expect(noticeElement.props.role).toBe("status");
  expect(onDraft).toHaveBeenCalledOnce();
});

it("shows safe API and JSON errors without invoking the Applicant draft callback", async () => {
  const onDraft = vi.fn();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Job is no longer available." }), {
        status: 404,
      }),
    )
    .mockResolvedValueOnce(new Response("not-json", { status: 502 }));
  vi.stubGlobal("fetch", fetch);
  for (const expected of [
    "Job is no longer available.",
    "AI drafting is temporarily unavailable.",
  ]) {
    (
      applicantControls(onDraft).controlsProps.setNotes as (
        value: string,
      ) => void
    )("Synthetic notes");
    const ready = applicantControls(onDraft);
    (findButton(ready.controls).props.onClick as () => void)();
    await vi.waitFor(() => {
      const current = applicantControls(onDraft);
      const message = array(current.controls.props.children).at(-2) as {
        props: Record<string, unknown>;
      };
      expect(String(message.props.value)).toContain(expected);
    });
  }
  expect(onDraft).not.toHaveBeenCalled();
});

it("renders each HR summary section, including an empty section", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          evidence_mentioned: ["Synthetic evidence"],
          requirements_not_addressed: [],
          follow_up_questions: ["Synthetic question"],
        }),
        { status: 200 },
      ),
    ),
  );
  const { section } = summarySection();
  const button = findButton(section);
  expect(button.props.children).toBe("Summarize");
  (button.props.onClick as () => void)();
  await vi.waitFor(() => expect(mocks.states[0]).not.toBeNull());
  const { section: updated } = summarySection();
  const children = array(updated.props.children);
  const summaryElement = children.find(
    (child) =>
      typeof child.type === "function" && "summary" in (child.props ?? {}),
  ) as {
    type: (props: Record<string, unknown>) => unknown;
    props: Record<string, unknown>;
  };
  const rendered = summaryElement.type(summaryElement.props) as {
    props: Record<string, unknown>;
  };
  const sections = array(rendered.props.children);
  expect(sections).toHaveLength(3);
  expect(JSON.stringify(sections)).toContain("Synthetic evidence");
  expect(JSON.stringify(sections)).toContain("None identified.");
  expect(JSON.stringify(sections)).toContain("Synthetic question");
});

it("maps HR throttling, invalid model data, and invalid JSON to safe messages", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 429 }))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ evidence_mentioned: [] }), { status: 200 }),
    )
    .mockResolvedValueOnce(new Response("not-json", { status: 200 }));
  vi.stubGlobal("fetch", fetch);
  const expected = [
    "AI usage limit reached. Try again shortly.",
    "The summary is temporarily unavailable.",
    "The summary is temporarily unavailable.",
  ];
  for (const message of expected) {
    const { section } = summarySection();
    (findButton(section).props.onClick as () => void)();
    await vi.waitFor(() => {
      const { section: current } = summarySection();
      const alert = array(current.props.children).find(
        (child) => child.props?.role === "alert",
      );
      expect(alert?.props?.children).toContain(message);
    });
  }
});
