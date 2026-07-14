"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FacultyProject } from "@/types/project";

export function FacultyDashboardOverview() {
  const [projects, setProjects] = useState<FacultyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const stats = useMemo(
    () => [
      {
        label: "Available projects",
        value: projects.length,
        detail: "Ready for faculty evaluation",
      },
      {
        label: "Project students",
        value: projects.reduce(
          (count, project) => count + project.students.length,
          0,
        ),
        detail: "Across imported groups",
      },
      {
        label: "Industry linked",
        value: projects.filter((project) => project.industrialPartner).length,
        detail: "Projects with industrial partners",
      },
    ],
    [projects],
  );
  const recentProjects = projects.slice(0, 3);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const response = await fetch("/api/faculty/projects", {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          projects?: FacultyProject[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message ?? "Unable to load dashboard");
        }

        if (active) {
          setProjects(data.projects ?? []);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load dashboard",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {error ? (
        <p className="rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {loading ? "--" : stat.value}
            </p>
            <p className="mt-2 text-sm text-muted">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Recent projects
            </h2>
            <p className="mt-1 text-sm text-muted">
              Latest imported project records
            </p>
          </div>
          <span className="rounded-md bg-accent-soft px-3 py-1 text-sm font-semibold text-ink">
            {loading ? "--" : projects.length} total
          </span>
        </div>

        <div className="mt-5 divide-y divide-border">
          {loading ? (
            <p className="py-3 text-sm text-muted">Loading projects</p>
          ) : null}
          {!loading && recentProjects.length > 0
            ? recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block py-3 transition hover:bg-surface-muted"
                >
                  <p className="text-sm font-semibold text-ink">
                    {project.title}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {project.students.length} student(s) - Supervisor:{" "}
                    {project.supervisor}
                  </p>
                </Link>
              ))
            : null}
          {!loading && recentProjects.length === 0 ? (
            <p className="py-3 text-sm text-muted">
              No projects imported yet.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
