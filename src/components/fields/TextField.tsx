import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({
  label,
  error,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;
  const inputStateClasses = error
    ? "border-danger bg-danger-soft focus:border-danger focus:ring-danger/15"
    : "border-border bg-surface focus:border-primary focus:ring-primary/15";

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? "true" : "false"}
        className={`h-11 w-full rounded-md border px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-muted ${inputStateClasses} ${className}`}
        {...props}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
