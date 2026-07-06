import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
};

export function SelectField({
  label,
  options,
  error,
  id,
  placeholder = "Select an option",
  className = "",
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? props.name;
  const selectStateClasses = error
    ? "border-danger bg-danger-soft focus:border-danger focus:ring-danger/15"
    : "border-border bg-surface focus:border-primary focus:ring-primary/15";

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={fieldId}
        aria-invalid={error ? "true" : "false"}
        className={`h-11 w-full rounded-md border px-3 text-sm text-ink outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-muted ${selectStateClasses} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
