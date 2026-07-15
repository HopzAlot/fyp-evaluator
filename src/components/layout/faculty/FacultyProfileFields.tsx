import { matchIsValidTel } from "mui-tel-input";
import type { Control } from "react-hook-form";
import { FormPhoneField } from "@/components/fields/FormPhoneField";
import { FormSelectField } from "@/components/fields/FormSelectField";
import { FormTextField } from "@/components/fields/FormTextField";
import { genderOptions } from "@/components/layout/auth/authOptions";
import type { FacultyProfileRequest } from "@/types/faculty";
import { noHtmlValidation } from "@/utils/validation/formValidation";

type FacultyProfileFieldsProps = {
  control: Control<FacultyProfileRequest>;
  hideFullName?: boolean;
};

export function FacultyProfileFields({
  control,
  hideFullName = false,
}: FacultyProfileFieldsProps) {
  return (
    <>
      {hideFullName ? null : (
        <FormTextField
          control={control}
          name="fullName"
          label="Full name"
          placeholder="Enter full name"
          rules={{
            required: "Full name is required",
            minLength: {
              value: 3,
              message: "Full name must be at least 3 characters",
            },
            validate: noHtmlValidation,
          }}
        />
      )}
      <FormSelectField
        control={control}
        name="gender"
        label="Gender"
        options={genderOptions}
        rules={{ required: "Gender is required" }}
      />
      <FormPhoneField
        control={control}
        name="contactNumber"
        label="Contact number"
        defaultCountry="PK"
        placeholder="Enter contact number"
        rules={{
          required: "Contact number is required",
          validate: {
            noHtml: noHtmlValidation,
            validPhone: (value) =>
              matchIsValidTel(value) || "Enter a valid contact number",
          },
        }}
      />
      <FormTextField
        control={control}
        name="department"
        label="Department"
        placeholder="Enter department"
        rules={{
          required: "Department is required",
          validate: noHtmlValidation,
        }}
      />
      <FormTextField
        control={control}
        name="designation"
        label="Designation"
        placeholder="Enter designation"
        rules={{
          required: "Designation is required",
          validate: noHtmlValidation,
        }}
      />
    </>
  );
}
