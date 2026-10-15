export function responseMessage(
  ok: boolean,
  error: unknown,
  reference: unknown,
) {
  if (ok) return "Résumé change saved. Review the attachment below.";
  const message =
    typeof error === "string" ? error : "Résumé change could not be saved.";
  return isReferenceCode(reference)
    ? `${message} Reference code: ${reference}`
    : message;
}

function isReferenceCode(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}
