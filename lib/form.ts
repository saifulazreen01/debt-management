export function parseAmount(value: FormDataEntryValue | null, label: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${label} must be a valid non-negative number`);
  }
  return amount;
}

export function parseOptionalAmount(value: FormDataEntryValue | null) {
  if (value === null || String(value).trim() === "") {
    return null;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a valid non-negative number");
  }
  return amount;
}

export function parseDueDay(value: FormDataEntryValue | null) {
  const day = Number(value);
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error("Payment due day must be between 1 and 31");
  }
  return day;
}

export function parseDate(value: FormDataEntryValue | null, label: string) {
  if (typeof value !== "string" || !value) {
    throw new Error(`${label} is required`);
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} is invalid`);
  }
  return date;
}
