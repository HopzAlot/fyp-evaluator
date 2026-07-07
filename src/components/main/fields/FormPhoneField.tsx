import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { MuiTelInput } from "mui-tel-input";
import type { MuiTelInputCountry } from "mui-tel-input";

type FormPhoneFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  defaultCountry?: MuiTelInputCountry;
  disabled?: boolean;
  placeholder?: string;
};

export function FormPhoneField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  rules,
  defaultCountry,
  disabled,
  placeholder,
}: FormPhoneFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <MuiTelInput
          {...field}
          label={label}
          defaultCountry={defaultCountry}
          disabled={disabled}
          placeholder={placeholder}
          value={field.value ?? ""}
          onChange={(value) => field.onChange(value)}
          onBlur={field.onBlur}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          fullWidth
          size="small"
          sx={{
            "& .MuiInputLabel-root": {
              color: "var(--ink)",
              fontFamily: "var(--font-geist-sans)",
              fontSize: "0.875rem",
              fontWeight: 500,
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "var(--primary)",
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "var(--surface)",
              borderRadius: "0.375rem",
              color: "var(--ink)",
              fontFamily: "var(--font-geist-sans)",
              minHeight: "2.75rem",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: fieldState.error ? "var(--danger)" : "var(--border)",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: fieldState.error
                  ? "var(--danger)"
                  : "var(--primary)",
              },
            "& .MuiFormHelperText-root": {
              color: "var(--danger)",
              fontFamily: "var(--font-geist-sans)",
              fontSize: "0.875rem",
              fontWeight: 500,
              marginLeft: 0,
            },
            "& .MuiInputBase-input": {
              color: "var(--ink)",
              fontSize: "0.875rem",
            },
          }}
        />
      )}
    />
  );
}
