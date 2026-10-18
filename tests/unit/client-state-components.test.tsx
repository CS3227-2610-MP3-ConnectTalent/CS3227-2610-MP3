import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useState: vi.fn(),
  useActionState: vi.fn(),
  stateValues: [] as unknown[],
  stateCursor: 0,
  actionState: [
    { email: "", error: "" } as Record<string, unknown>,
    vi.fn(),
    false,
  ] as unknown[],
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: mocks.useState,
    useActionState: mocks.useActionState,
  };
});
vi.mock("@/app/auth/actions", () => ({
  signUp: vi.fn(),
  updatePassword: vi.fn(),
}));
vi.mock("@/app/applications/actions", () => ({
  withdrawApplication: vi.fn(),
}));

import { PasswordInput } from "@/components/password-input";
import { WithdrawalControl } from "@/components/withdrawal-control";
import { SignUpForm } from "@/app/auth/sign-up/sign-up-form";
import { ResetPasswordForm } from "@/app/auth/reset-password/reset-password-form";
import { PendingSubmitButton } from "@/components/pending-submit-button";

beforeEach(() => {
  mocks.stateValues = [];
  mocks.stateCursor = 0;
  mocks.actionState = [{ email: "", error: "" }, vi.fn(), false];
  mocks.useState.mockImplementation((initial: unknown) => {
    const index = mocks.stateCursor++;
    if (mocks.stateValues[index] === undefined)
      mocks.stateValues[index] = initial;
    return [
      mocks.stateValues[index],
      (value: unknown) => {
        mocks.stateValues[index] =
          typeof value === "function"
            ? (value as (current: unknown) => unknown)(mocks.stateValues[index])
            : value;
      },
    ];
  });
  mocks.useActionState.mockImplementation(() => mocks.actionState);
});

afterEach(() => vi.unstubAllGlobals());

function renderWithState(component: () => unknown) {
  mocks.stateCursor = 0;
  return component() as {
    type: unknown;
    props: Record<string, unknown>;
  };
}

function list(value: unknown) {
  return Array.isArray(value) ? value : [value];
}

class FormDataStub {
  constructor(private target: { values: Record<string, string> }) {}

  get(name: string) {
    return this.target.values[name] ?? null;
  }
}

function submitPasswords(
  formProps: Record<string, unknown>,
  password: string,
  confirmPassword: string,
) {
  const preventDefault = vi.fn();
  (formProps.onSubmit as (event: unknown) => void)({
    currentTarget: { values: { password, confirmPassword } },
    preventDefault,
  });
  return preventDefault;
}

function signupAlert(tree: { props: Record<string, unknown> }) {
  const alert = list(tree.props.children).find(
    (child) =>
      (child as { props?: Record<string, unknown> }).props?.role === "alert",
  ) as { props: Record<string, unknown> } | undefined;
  return alert?.props.children;
}

it("toggles a password field between hidden and visible text with an accessible label", () => {
  const first = renderWithState(() => PasswordInput({ name: "password" }));
  const [input, button] = first.props.children as Array<{
    props: Record<string, unknown>;
  }>;
  expect(input.props.type).toBe("password");
  expect(button.props["aria-label"]).toBe("Show password");
  expect(button.props["aria-pressed"]).toBe(false);

  (button.props.onClick as () => void)();
  const visible = renderWithState(() =>
    PasswordInput({ name: "password", className: "custom" }),
  );
  const [visibleInput, hideButton] = visible.props.children as Array<{
    props: Record<string, unknown>;
  }>;
  expect(visibleInput.props.type).toBe("text");
  expect(visibleInput.props.className).toContain("custom");
  expect(hideButton.props["aria-label"]).toBe("Hide password");
  expect(hideButton.props["aria-pressed"]).toBe(true);
});

it("moves the withdrawal control into confirmation and returns on cancel", () => {
  const action = vi.fn();
  mocks.actionState = [{ message: "Synthetic safe message" }, action, true];
  const initial = renderWithState(() =>
    WithdrawalControl({ applicationId: "application-1" }),
  );
  expect(initial.type).toBeTypeOf("function");
  (initial.props.onClick as () => void)();

  const confirming = renderWithState(() =>
    WithdrawalControl({ applicationId: "application-1" }),
  );
  expect(confirming.type).toBeTypeOf("function");
  expect(confirming.props.pending).toBe(true);
  expect(confirming.props.message).toBe("Synthetic safe message");
  const section = (
    confirming.type as (props: Record<string, unknown>) => {
      props: Record<string, unknown>;
    }
  )(confirming.props);
  const [, formComponent] = list(section.props.children) as Array<{
    type: unknown;
    props: Record<string, unknown>;
  }>;
  const form = (
    formComponent.type as (props: Record<string, unknown>) => {
      props: Record<string, unknown>;
    }
  )(formComponent.props);
  const buttons = list(form.props.children).filter(
    (child) => (child as { type?: unknown }).type === "button",
  ) as Array<{ props: Record<string, unknown> }>;
  expect(buttons[0]?.props.disabled).toBe(true);
  expect(buttons[1]?.props.disabled).toBe(true);

  (confirming.props.onCancel as () => void)();
  expect(
    renderWithState(() => WithdrawalControl({ applicationId: "application-1" }))
      .type,
  ).toBeTypeOf("function");
});

it("stops submission on a local password mismatch and displays that error first", () => {
  mocks.actionState = [
    { email: "applicant@example.test", error: "provider error" },
    vi.fn(),
    false,
  ];
  const component = () => SignUpForm({ serverError: "route error" });
  const initial = renderWithState(component);
  const [, form] = initial.props.children as Array<unknown>;
  const formProps = (form as { props: Record<string, unknown> }).props;
  vi.stubGlobal("FormData", FormDataStub);
  const preventDefault = submitPasswords(
    formProps,
    "first-password",
    "different-password",
  );
  expect(preventDefault).toHaveBeenCalledOnce();
  const mismatch = renderWithState(component);
  expect(signupAlert(mismatch)).toBe(
    "Passwords do not match. Please try again.",
  );
});

it("clears a local password error after a match and restores the provider error", () => {
  mocks.actionState = [
    { email: "applicant@example.test", error: "provider error" },
    vi.fn(),
    false,
  ];
  const component = () => SignUpForm({ serverError: "route error" });
  vi.stubGlobal("FormData", FormDataStub);
  const initial = renderWithState(component);
  let [, form] = initial.props.children as Array<unknown>;
  submitPasswords(
    (form as { props: Record<string, unknown> }).props,
    "first-password",
    "different-password",
  );
  const mismatch = renderWithState(component);
  const [, matchedForm] = mismatch.props.children as Array<unknown>;
  form = matchedForm;
  const preventDefault = submitPasswords(
    (form as { props: Record<string, unknown> }).props,
    "same-password",
    "same-password",
  );
  expect(preventDefault).not.toHaveBeenCalled();
  const matched = renderWithState(component);
  expect(signupAlert(matched)).toBe("provider error");
});

it("renders reset-password errors and delegates pending feedback to its form button", () => {
  mocks.actionState = [{ error: "Could not update password." }, vi.fn(), true];
  const form = renderWithState(() => ResetPasswordForm());
  expect(form.type).toBe("form");
  const children = list(form.props.children) as Array<{
    type?: unknown;
    props?: Record<string, unknown>;
  }>;
  expect(children[0]?.props?.role).toBe("alert");
  const button = children.find((child) => child.type === PendingSubmitButton);
  expect(button?.props?.label).toBe("Update password");
  expect(button?.props?.pendingLabel).toBe("Updating password…");

  mocks.actionState = [{ error: "" }, vi.fn(), false];
  const noError = renderWithState(() => ResetPasswordForm());
  expect(list(noError.props.children)).not.toContain(
    expect.objectContaining({
      props: expect.objectContaining({ role: "alert" }),
    }),
  );
});
