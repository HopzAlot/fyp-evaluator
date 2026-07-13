"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
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

const statLabels = [
  { key: "total", label: "Total faculty" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
] as const;

export function AdminFacultyManager() {
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
  const columns: DataTableColumn<FacultyUser>[] = [
    {
      key: "name",
      header: "Name",
      render: (item) => (
        <span className="font-medium text-ink">
          {item.fullName ?? "Not provided"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (item) => <span className="text-muted">{item.email}</span>,
    },
    {
      key: "department",
      header: "Department",
      render: (item) => (
        <span className="text-muted">{item.department ?? "Not provided"}</span>
      ),
    },
    {
      key: "designation",
      header: "Designation",
      render: (item) => (
        <span className="text-muted">
          {item.designation ?? "Not provided"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
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
      ),
    },
  ];

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        {statLabels.map((stat) => (
          <article
            key={stat.key}
            className="rounded-lg border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {loading ? "--" : counts[stat.key]}
            </p>
          </article>
        ))}
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

        <DataTable
          columns={columns}
          data={faculty}
          emptyMessage="No faculty users found"
          getRowKey={(item) => item.id}
          loading={loading}
          loadingMessage="Loading faculty users"
        />
      </section>
    </>
  );
}
