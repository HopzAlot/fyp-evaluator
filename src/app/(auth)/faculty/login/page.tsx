import Link from "next/link";
import { TextField } from "@/components/fields/TextField";
import { Button } from "@/components/ui/Button";

export default function FacultyLoginPage() {
  return (
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Faculty Portal</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Login to your account
        </h1>
      </div>

      <form className="space-y-5">
        <TextField
          label="Email address"
          name="email"
          type="email"
          placeholder="name@university.edu"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          placeholder="Enter password"
        />
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New faculty member?{" "}
        <Link
          href="/faculty/register"
          className="font-semibold text-slate-950 hover:underline"
        >
          Register
        </Link>
      </p>
    </section>
  );
}
