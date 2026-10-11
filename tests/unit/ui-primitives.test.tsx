import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

it("renders Button variants and sizes with forwarded native button props", () => {
  const button = renderToStaticMarkup(
    createElement(
      Button,
      { variant: "destructive", size: "sm", type: "submit" },
      "Save",
    ),
  );
  const iconButton = renderToStaticMarkup(
    createElement(
      Button,
      { variant: "outline", size: "icon", "aria-label": "Open" },
      "↗",
    ),
  );
  expect(button).toContain('data-slot="button"');
  expect(button).toContain('type="submit"');
  expect(button).toContain("bg-destructive");
  expect(button).toContain("Save");
  expect(iconButton).toContain("border-border");
  expect(iconButton).toContain("size-8");
});

it("renders all supported Badge variants and custom render props", () => {
  const badges = [
    "default",
    "secondary",
    "destructive",
    "outline",
    "ghost",
    "link",
  ];
  const markup = badges
    .map((variant) =>
      renderToStaticMarkup(
        createElement(
          Badge,
          { variant: variant as never },
          `${variant} status`,
        ),
      ),
    )
    .join("");
  expect(markup).toContain('data-slot="badge"');
  expect(markup).toContain("bg-primary");
  expect(markup).toContain("bg-secondary");
  expect(markup).toContain("text-destructive");
  expect(markup).toContain("text-foreground");
  expect(markup).toContain("underline-offset-4");
});

it("renders Alert variants and its description, title, and action slots", () => {
  const markup = renderToStaticMarkup(
    createElement(
      Alert,
      { variant: "destructive" },
      createElement(AlertTitle, null, "Could not save"),
      createElement(AlertDescription, null, "Try again."),
      createElement(AlertAction, null, "Dismiss"),
    ),
  );
  expect(markup).toContain('role="alert"');
  expect(markup).toContain('data-slot="alert-title"');
  expect(markup).toContain('data-slot="alert-description"');
  expect(markup).toContain('data-slot="alert-action"');
  expect(markup).toContain("text-destructive");
});

it("composes each Card section while forwarding accessible content", () => {
  const markup = renderToStaticMarkup(
    createElement(
      Card,
      { size: "sm" },
      createElement(
        CardHeader,
        null,
        createElement(CardTitle, null, "Application"),
        createElement(CardDescription, null, "Submitted details"),
        createElement(CardAction, null, "Updated"),
      ),
      createElement(CardContent, null, "Private content"),
      createElement(CardFooter, null, "Status"),
    ),
  );
  for (const slot of [
    "card",
    "card-header",
    "card-title",
    "card-description",
    "card-action",
    "card-content",
    "card-footer",
  ]) {
    expect(markup).toContain(`data-slot="${slot}"`);
  }
  expect(markup).toContain('data-size="sm"');
  expect(markup).toContain("Private content");
});

it("renders table structure and semantic slots", () => {
  const table = renderToStaticMarkup(
    createElement(
      Table,
      null,
      createElement(TableCaption, null, "Synthetic applications"),
      createElement(
        TableHeader,
        null,
        createElement(TableRow, null, createElement(TableHead, null, "Role")),
      ),
      createElement(
        TableBody,
        null,
        createElement(
          TableRow,
          null,
          createElement(TableCell, null, "Engineer"),
        ),
      ),
      createElement(
        TableFooter,
        null,
        createElement(
          TableRow,
          null,
          createElement(TableCell, null, "One result"),
        ),
      ),
    ),
  );
  for (const slot of [
    "table-container",
    "table",
    "table-caption",
    "table-header",
    "table-body",
    "table-footer",
    "table-row",
    "table-head",
    "table-cell",
  ]) {
    expect(table).toContain(`data-slot="${slot}"`);
  }
});

it("forwards native input and label attributes and custom textarea classes", () => {
  const input = renderToStaticMarkup(
    createElement(Input, {
      type: "email",
      className: "custom-input",
      required: true,
    }),
  );
  const label = renderToStaticMarkup(
    createElement(Label, { htmlFor: "email" }, "Email"),
  );
  const textarea = renderToStaticMarkup(
    createElement(Textarea, {
      name: "notes",
      className: "custom-notes",
      maxLength: 2000,
    }),
  );
  expect(input).toContain('data-slot="input"');
  expect(input).toContain('type="email"');
  expect(input).toContain("custom-input");
  expect(label).toContain('data-slot="label"');
  expect(label).toContain('for="email"');
  expect(textarea).toContain('data-slot="textarea"');
  expect(textarea).toContain("custom-notes");
});
