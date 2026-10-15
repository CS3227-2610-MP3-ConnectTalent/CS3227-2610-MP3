import { JOB_SEARCH_DELAY, jobSearchUrl, parseJobSearch } from "./job-search";

export type JobFilters = {
  query: string;
  category?: string;
  invalid?: boolean;
  invalidKey?: string;
  historyPending?: boolean;
  explicitSearchPending?: boolean;
};
type Navigate = (url: string, replace: boolean) => void;
const filterKey = (value: JobFilters) =>
  value.invalid
    ? (value.invalidKey ?? "invalid")
    : jobSearchUrl(value.query, value.category);

/** Coordinates local typing with route acknowledgements; never holds job data. */
export class JobFilterController {
  private state: JobFilters;
  private confirmed: string;
  private requested?: string;
  private listeners = new Set<() => void>();
  private timer?: ReturnType<typeof setTimeout>;
  private composing = false;
  private editing = false;
  private historyTarget?: string;

  constructor(
    initial: JobFilters,
    private navigate: Navigate,
  ) {
    this.state = initial;
    this.confirmed = filterKey(initial);
  }

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private update(next: JobFilters) {
    this.state = next;
    this.listeners.forEach((listener) => listener());
  }

  private clearSearchPending(next: JobFilters) {
    if (!next.explicitSearchPending) return next;
    const cleared = { ...next };
    delete cleared.explicitSearchPending;
    return cleared;
  }

  cancel = () => {
    clearTimeout(this.timer);
    this.timer = undefined;
  };

  leave = () => {
    this.cancel();
    this.editing = false;
  };

  edit(query: string) {
    this.cancel();
    this.editing = true;
    this.update(this.clearSearchPending({ ...this.state, query }));
    if (!this.composing && !parseJobSearch(query).invalid) {
      this.timer = setTimeout(() => this.go(true), JOB_SEARCH_DELAY);
    }
  }

  composition(active: boolean) {
    this.composing = active;
    if (active) this.cancel();
    else this.edit(this.state.query);
  }

  go(replace = false, explicitSearch = false) {
    this.cancel();
    const parsed = parseJobSearch(this.state.query);
    if (this.composing || parsed.invalid) return;
    const url = jobSearchUrl(parsed.query, this.state.category);
    if (url === this.confirmed && this.requested === undefined) return;
    if (explicitSearch)
      this.update({ ...this.state, explicitSearchPending: true });
    else if (this.state.explicitSearchPending)
      this.update(this.clearSearchPending(this.state));
    // Next supersedes earlier navigations; they may never acknowledge.
    this.requested = url;
    if (this.historyTarget !== undefined) this.historyTarget = url;
    this.navigate(url, replace);
  }

  search() {
    this.go(false, true);
  }

  category(category?: string) {
    this.update(this.clearSearchPending({ ...this.state, category }));
    this.go();
  }

  clear() {
    this.update(this.clearSearchPending({ ...this.state, query: "" }));
    this.go();
  }

  confirm(next: JobFilters) {
    const url = filterKey(next);
    if (this.historyTarget !== undefined) {
      if (url !== this.historyTarget) return;
      this.historyTarget = undefined;
      this.confirmed = url;
      this.requested = undefined;
      this.update(
        this.editing
          ? this.clearSearchPending({
              ...this.state,
              historyPending: undefined,
            })
          : next,
      );
      return;
    }
    if (url === this.requested) {
      this.confirmed = url;
      this.requested = undefined;
      if (this.state.explicitSearchPending)
        this.update(this.clearSearchPending(this.state));
      return;
    }
    if (url === this.confirmed) return;
    this.confirmed = url;
    if (!this.editing && this.requested === undefined) this.update(next);
  }

  restore(next: JobFilters) {
    this.leave();
    this.requested = undefined;
    this.confirmed = filterKey(next);
    this.historyTarget = filterKey(next);
    this.update({ ...next, historyPending: true });
  }
}
