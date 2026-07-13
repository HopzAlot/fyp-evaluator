"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserStatus } from "@/types/auth";

type FacultyUser = {
  id: string;
  email: string;
  status: UserStatus;
  fullName?: string;
  contactNumber?: string;
  department?: string;
  designation?: string;
};

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const counts = useMemo(
    () => ({
      total: faculty.length,
      active: faculty.filter((item) => item.status === "active").length,
      inactive: faculty.filter((item) => item.status === "inactive").length,
    }),
    [faculty],
  );

  useEffect(() => {
    let active = true;

    async function loadFaculty() {
      try {
        const response = await fetch("/api/admin/faculty", {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          faculty?: FacultyUser[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message ?? "Unable to load faculty users");
        }

        if (active) {
          setFaculty(data.faculty ?? []);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load faculty users",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFaculty();

    return () => {
      active = false;
    };
  }, []);

  const updateStatus = async (userId: string, status: UserStatus) => {
    setError("");
    setUpdatingId(userId);

    const response = await fetch(`/api/admin/faculty/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = (await response.json()) as {
      user?: { id: string; status: UserStatus };
      message?: string;
    };

    setUpdatingId("");

    if (!response.ok || !data.user) {
      setError(data.message ?? "Unable to update faculty status");
      return;
    }

    setFaculty((currentFaculty) =>
      currentFaculty.map((item) =>
        item.id === data.user?.id ? { ...item, status: data.user.status } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Faculty users
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Review registered faculty accounts and control account access.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Total faculty</p>
          <p className="mt-3 text-3xl font-semibold text-ink">
            {loading ? "--" : counts.total}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Active</p>
          <p className="mt-3 text-3xl font-semibold text-ink">
            {loading ? "--" : counts.active}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Inactive</p>
          <p className="mt-3 text-3xl font-semibold text-ink">
            {loading ? "--" : counts.inactive}
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">
            Registered faculty
          </h2>
          {error ? (
            <p className="mt-2 text-sm font-medium text-danger">{error}</p>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-background text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Designation</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td className="px-5 py-4 text-muted" colSpan={5}>
                    Loading faculty users
                  </td>
                </tr>
              ) : null}
              {!loading && faculty.length === 0 ? (
                <tr>
                  <td className="px-5 py-4 text-muted" colSpan={5}>
                    No faculty users found
                  </td>
                </tr>
              ) : null}
              {faculty.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 font-medium text-ink">
                    {item.fullName ?? "Not provided"}
                  </td>
                  <td className="px-5 py-4 text-muted">{item.email}</td>
                  <td className="px-5 py-4 text-muted">
                    {item.department ?? "Not provided"}
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {item.designation ?? "Not provided"}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(event) =>
                        updateStatus(item.id, event.target.value as UserStatus)
                      }
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm font-medium text-ink outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:text-muted"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
