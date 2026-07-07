"use client";

import { useForm } from "react-hook-form";
import { FormSelectField } from "@/components/main/fields/FormSelectField";
import { FormTextField } from "@/components/main/fields/FormTextField";
import { Button } from "@/components/main/ui/Button";
import { genderOptions } from "@/components/layout/auth/authOptions";
import {
  facultyRegisterValidation,
  type FacultyRegisterFormValues,
} from "@/components/layout/auth/validation/facultyRegisterValidation";

export function FacultyRegisterForm() {
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { isSubmitting },
  } = useForm<FacultyRegisterFormValues>({
    defaultValues: {
      fullName: "",
      gender: "",
      email: "",
      contactNumber: "",
      department: "",
      designation: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  const onSubmit = async (values: FacultyRegisterFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Faculty register data", {
      ...values,
      password: "[hidden]",
      confirmPassword: "[hidden]",
    });
    reset();
  };

  return (
    <form
      className="grid gap-5 sm:grid-cols-2"
      method="post"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormTextField
        control={control}
        name="fullName"
        label="Full name"
        placeholder="Enter name"
        rules={facultyRegisterValidation.fullName}
      />
      <FormSelectField
        control={control}
        name="gender"
        label="Gender"
        options={genderOptions}
        rules={facultyRegisterValidation.gender}
      />
      <FormTextField
        control={control}
        name="email"
        label="Email address"
        type="email"
        placeholder="name@university.edu"
        rules={facultyRegisterValidation.email}
      />
      <FormTextField
        control={control}
        name="contactNumber"
        label="Contact number"
        type="tel"
        placeholder="03XX XXXXXXX"
        rules={facultyRegisterValidation.contactNumber}
      />
      <FormTextField
        control={control}
        name="department"
        label="Department"
        placeholder="Enter department"
        rules={facultyRegisterValidation.department}
      />
      <FormTextField
        control={control}
        name="designation"
        label="Designation"
        placeholder="Enter designation"
        rules={facultyRegisterValidation.designation}
      />
      <FormTextField
        control={control}
        name="password"
        label="Password"
        type="password"
        placeholder="Create password"
        rules={facultyRegisterValidation.password}
      />
      <FormTextField
        control={control}
        name="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="Confirm password"
        rules={{
          ...facultyRegisterValidation.confirmPassword,
          validate: (value) =>
            value === getValues("password") || "Passwords do not match",
        }}
      />

      <div className="sm:col-span-2">
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          loadingText="Registering"
        >
          Register
        </Button>
      </div>
    </form>
  );
}
