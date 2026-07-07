import type { SelectHTMLAttributes } from "react";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

type SelectOption = {
  label: string;
  value: string;
};

type FormSelectFieldProps<TFieldValues extends FieldValues = FieldValues> =
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> & {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    label: string;
    options: SelectOption[];
    rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
    placeholder?: string;
  };

export function FormSelectField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  options,
  rules,
  placeholder = "Select an option",
  className = "",
  ...props
}: FormSelectFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;
        const selectStateClasses = error
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
            <select
              id={name}
              aria-invalid={error ? "true" : "false"}
              className={`select-field h-11 w-full rounded-md border px-3 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-muted ${selectStateClasses} ${className}`}
              {...props}
              {...field}
              value={field.value ?? ""}
            >
              <option value="">{placeholder}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
