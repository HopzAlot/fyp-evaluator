export const genderValues = ["male", "female", "prefer-not-to-say"] as const;

export type GenderValue = (typeof genderValues)[number];

export function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeGender(value: string) {
  return value.trim().toLowerCase();
}

export function isGenderValue(value: string): value is GenderValue {
  return genderValues.includes(value as GenderValue);
}

export function formatGender(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalizedValue = normalizeGender(value);

  if (normalizedValue === "prefer-not-to-say") {
    return "Prefer not to say";
  }

  return normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
}
