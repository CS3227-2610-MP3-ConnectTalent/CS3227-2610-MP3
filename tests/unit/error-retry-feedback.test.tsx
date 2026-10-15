import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ transition: vi.fn() }));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useTransition: mocks.transition };
});

import ErrorPage from "@/app/error";

beforeEach(() => mocks.transition.mockReturnValue([false, vi.fn()]));

it("labels and disables the recovery button while reset is pending", () => {
  mocks.transition.mockReturnValue([true, vi.fn()]);
  const html = renderToStaticMarkup(
    <ErrorPage error={new Error("synthetic")} reset={vi.fn()} />,
  );
  expect(html).toContain("Retrying…");
  expect(html).toMatch(/<button[^>]*disabled=""/);
});

it("starts reset through a transition when activated", () => {
  const reset = vi.fn();
  const start = vi.fn((callback: () => void) => callback());
  mocks.transition.mockReturnValue([false, start]);
  const element = ErrorPage({ error: new Error("synthetic"), reset });
  const children = element.props.children as Array<{
    props?: { children?: unknown };
  }>;
  const controls = children.find(
    (child) => child.props?.children && Array.isArray(child.props.children),
  );
  const button = (
    controls?.props?.children as Array<{ props: { onClick: () => void } }>
  )[0];
  button.props.onClick();
  expect(start).toHaveBeenCalledOnce();
  expect(reset).toHaveBeenCalledOnce();
});
