"use client";

import { useRef, useState, useSyncExternalStore } from "react";

import { Input } from "@/components/ui/input";
import {
  formatBrowserLocalDateTime,
  formatUtcDateTime,
  getBrowserTimeZone,
  isoToLocalDateTime,
  isoToUtcDateTimeLocal,
  localDateTimeToIso,
  normalizeIsoTimestamp,
} from "@/lib/local-date-time";

const INVALID_LOCAL_TIME_MESSAGE =
  "This date and time is invalid in your local timezone. Choose another time.";
const subscribeToNoChanges = () => () => {};
const getServerTimeZone = () => "UTC fallback";

export function LocalScheduleInput({
  id,
  name,
  label,
  value,
  helpText,
}: {
  id: string;
  name: string;
  label: string;
  value?: string | null;
  helpText: string;
}) {
  const { localValue, utcValue, timeZone, enhanced, invalid, onChange } =
    useLocalScheduleInput(value);
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const error = invalid ? INVALID_LOCAL_TIME_MESSAGE : null;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <LocalScheduleDateTimeControl
        id={id}
        name={`${name}Local`}
        value={localValue}
        invalid={invalid}
        onChange={onChange}
        errorId={errorId}
        helpId={helpId}
      />
      <ScheduleInputMetadata
        name={name}
        utcValue={utcValue}
        enhanced={enhanced}
        timeZone={timeZone}
      />
      <ScheduleInputMessage
        error={error}
        errorId={errorId}
        helpId={helpId}
        helpText={helpText}
      />
    </div>
  );
}

function ScheduleInputMetadata({
  name,
  utcValue,
  enhanced,
  timeZone,
}: {
  name: string;
  utcValue: string;
  enhanced: boolean;
  timeZone: string;
}) {
  return (
    <>
      <input type="hidden" name={name} value={utcValue} />
      <input
        type="hidden"
        name={`${name}Mode`}
        value={enhanced ? "browser" : ""}
      />
      <p className="text-xs text-muted-foreground">
        Uses your browser timezone ({timeZone}). Without JavaScript, schedule
        times use UTC.
      </p>
    </>
  );
}

function useLocalScheduleInput(value?: string | null) {
  const [editedValue, setEditedValue] = useState<string | null>(null);
  const initialLocalValue = useSyncExternalStore(
    subscribeToNoChanges,
    () => isoToLocalDateTime(value),
    () => isoToUtcDateTimeLocal(value),
  );
  const timeZone = useSyncExternalStore(
    subscribeToNoChanges,
    getBrowserTimeZone,
    getServerTimeZone,
  );
  const enhanced = useSyncExternalStore(
    subscribeToNoChanges,
    () => true,
    () => false,
  );
  const initialUtcValue = useSyncExternalStore(
    subscribeToNoChanges,
    () => normalizeIsoTimestamp(value),
    () => "",
  );
  const localValue = editedValue ?? initialLocalValue;
  const utcValue =
    editedValue === null
      ? initialUtcValue
      : editedValue === ""
        ? ""
        : (localDateTimeToIso(editedValue) ?? "");
  const invalid =
    editedValue !== null &&
    editedValue !== "" &&
    localDateTimeToIso(editedValue) === null;

  return {
    localValue,
    utcValue,
    timeZone,
    enhanced,
    invalid,
    onChange: setEditedValue,
  };
}

function ScheduleInputMessage({
  error,
  errorId,
  helpId,
  helpText,
}: {
  error: string | null;
  errorId: string;
  helpId: string;
  helpText: string;
}) {
  if (error) {
    return (
      <p id={errorId} role="alert" className="text-xs text-destructive">
        {error}
      </p>
    );
  }

  return (
    <p id={helpId} className="text-xs text-muted-foreground">
      {helpText}
    </p>
  );
}

function LocalScheduleDateTimeControl({
  id,
  name,
  value,
  invalid,
  onChange,
  errorId,
  helpId,
}: {
  id: string;
  name: string;
  value: string;
  invalid: boolean;
  onChange: (value: string) => void;
  errorId: string;
  helpId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(nextValue: string) {
    const isInvalid =
      nextValue !== "" && localDateTimeToIso(nextValue) === null;
    inputRef.current?.setCustomValidity(
      isInvalid ? INVALID_LOCAL_TIME_MESSAGE : "",
    );
    onChange(nextValue);
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      name={name}
      type="datetime-local"
      value={value}
      onChange={(event) => handleChange(event.currentTarget.value)}
      aria-invalid={invalid}
      aria-describedby={invalid ? errorId : helpId}
    />
  );
}

export function LocalScheduleTime({ value }: { value: string }) {
  const formatted = useSyncExternalStore(
    subscribeToNoChanges,
    () => formatBrowserLocalDateTime(value),
    () => formatUtcDateTime(value),
  );

  return <time dateTime={value}>{formatted}</time>;
}
