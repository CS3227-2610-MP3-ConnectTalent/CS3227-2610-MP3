// @vitest-environment happy-dom

import { act, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  search: "",
  setSearch: null as ((value: string) => void) | null,
  pushes: [] as string[],
  replacements: [] as string[],
}));

vi.mock("next/navigation", () => {
  const updateSearch = (url: string) => {
    const search = new URL(url, "https://example.test").search;
    navigation.pushes.push(url);
    navigation.search = search;
    navigation.setSearch?.(search);
  };

  return {
    useRouter: () => ({
      push: updateSearch,
      replace: (url: string) => {
        navigation.replacements.push(url);
        const search = new URL(url, "https://example.test").search;
        navigation.search = search;
        navigation.setSearch?.(search);
      },
    }),
    useSearchParams: () => new URLSearchParams(navigation.search),
  };
});

import { HRApplicationFilters } from "@/components/hr-application-filters";
import {
  HR_APPLICATION_SEARCH_DELAY,
  buildHRApplicationsUrl,
  parseHRApplicationFilterParams,
} from "@/lib/hr-application-search";

function NavigationHarness({
  initialParams,
}: {
  initialParams: ReturnType<typeof parseHRApplicationFilterParams>;
}) {
  const [search, setSearch] = useState(navigation.search);
  useEffect(() => {
    navigation.search = search;
    navigation.setSearch = setSearch;
  }, [search]);

  return <HRApplicationFilters initialParams={initialParams} jobs={jobs} />;
}

const jobs = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Synthetic role",
  },
];

let container: HTMLDivElement;
let root: Root;

async function mountFilters(
  initialParams: ReturnType<typeof parseHRApplicationFilterParams>,
) {
  navigation.search = new URL(
    buildHRApplicationsUrl(initialParams),
    "https://example.test",
  ).search;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(<NavigationHarness initialParams={initialParams} />);
  });
}

function dispatchSelectChange(id: string, value: string) {
  const select = container.querySelector<HTMLSelectElement>(`#${id}`);
  if (!select) throw new Error(`Missing select #${id}`);
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function dispatchSearchInput(value: string) {
  const input = container.querySelector<HTMLInputElement>("#hr-app-search");
  if (!input) throw new Error("Missing application search input");
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  navigation.search = "";
  navigation.setSearch = null;
  navigation.pushes = [];
  navigation.replacements = [];
});

afterEach(async () => {
  if (root) {
    await act(async () => root.unmount());
  }
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("successive HR application filter changes", () => {
  it("keeps role and status changes in the routed URL", async () => {
    await mountFilters(parseHRApplicationFilterParams({}));

    await act(async () => {
      dispatchSelectChange("filter-job", jobs[0].id);
      dispatchSelectChange("filter-status", "in_review");
    });

    expect(navigation.pushes).toHaveLength(2);
    const finalUrl = new URL(navigation.pushes[1], "https://example.test");
    expect(finalUrl.searchParams.get("job")).toBe(jobs[0].id);
    expect(finalUrl.searchParams.get("status")).toBe("in_review");
  });
});

describe("pending HR application search", () => {
  it("survives a filter transition that completes first", async () => {
    vi.useFakeTimers();
    await mountFilters(parseHRApplicationFilterParams({}));

    await act(async () => dispatchSearchInput("Taylor"));
    await act(async () => dispatchSelectChange("filter-status", "in_review"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(HR_APPLICATION_SEARCH_DELAY + 1);
    });

    expect(navigation.pushes).toHaveLength(1);
    expect(navigation.replacements).toHaveLength(1);
    const searchUrl = new URL(
      navigation.replacements[0],
      "https://example.test",
    );
    expect(searchUrl.searchParams.get("q")).toBe("Taylor");
    expect(searchUrl.searchParams.get("status")).toBe("in_review");
  });
});

describe("clearing HR application filters", () => {
  it("cancels a pending search when Clear filters is selected", async () => {
    vi.useFakeTimers();
    await mountFilters(
      parseHRApplicationFilterParams({ q: "Old search", status: "submitted" }),
    );

    await act(async () => dispatchSearchInput("New search"));
    const clearButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((button) => button.textContent?.includes("Clear filters"));
    if (!clearButton) throw new Error("Missing Clear filters button");

    await act(async () => {
      clearButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(HR_APPLICATION_SEARCH_DELAY + 1);
    });

    expect(navigation.pushes).toHaveLength(1);
    expect(navigation.replacements).toHaveLength(0);
    const clearUrl = new URL(navigation.pushes[0], "https://example.test");
    expect(clearUrl.searchParams.has("q")).toBe(false);
    expect(clearUrl.searchParams.has("status")).toBe(false);
  });
});
