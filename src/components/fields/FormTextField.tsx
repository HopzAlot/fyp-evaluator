import type { InputHTMLAttributes } from "react";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

type FormTextFieldProps<TFieldValues extends FieldValues = FieldValues> =
  Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    label: string;
    rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  };

export function FormTextField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  rules,
  className = "",
  ...props
}: FormTextFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;
        const inputStateClasses = error
          ? "field-invalid focus:ring-[var(--danger)]/20"
          : "border-border bg-surface focus:border-primary focus:ring-primary/15";

        return (
          <div className="space-y-2">
            <label
              htmlFor={name}
              className="block text-sm font-medium text-ink"
            >
              {label}
            </label>
            <input
              id={name}
              aria-invalid={error ? "true" : "false"}
              className={`h-11 w-full rounded-md border px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-muted ${inputStateClasses} ${className}`}
              {...props}
              {...field}
              value={field.value ?? ""}
            />
            {error ? (
              <p className="field-error-message text-sm font-medium" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
