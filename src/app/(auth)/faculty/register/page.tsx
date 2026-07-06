import Link from "next/link";
import { SelectField } from "@/components/fields/SelectField";
import { TextField } from "@/components/fields/TextField";
import { Button } from "@/components/ui/Button";
import {
  departmentOptions,
  designationOptions,
  genderOptions,
} from "@/features/auth/constants/facultyOptions";

export default function FacultyRegisterPage() {
  return (
    <section className="w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Faculty Portal</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Create faculty account
        </h1>
      </div>

      <form className="grid gap-5 sm:grid-cols-2">
        <TextField label="Full name" name="fullName" placeholder="Enter name" />
        <TextField
          label="Faculty ID"
          name="facultyId"
          placeholder="Enter faculty ID"
        />
        <TextField
          label="Email address"
          name="email"
          type="email"
          placeholder="name@university.edu"
        />
        <TextField
          label="Contact number"
          name="contactNumber"
          type="tel"
          placeholder="03XX XXXXXXX"
        />
        <SelectField
          label="Department"
          name="department"
          options={departmentOptions}
        />
        <SelectField
          label="Designation"
          name="designation"
          options={designationOptions}
        />
        <SelectField label="Gender" name="gender" options={genderOptions} />
        <TextField
          label="Password"
          name="password"
          type="password"
          placeholder="Create password"
        />

        <div className="sm:col-span-2">
          <Button type="submit" className="w-full">
            Register
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link
          href="/faculty/login"
          className="font-semibold text-slate-950 hover:underline"
        >
          Login
        </Link>
      </p>
    </section>
  );
}
