import Link from "next/link";
import { projects } from "@/data/projects";

const statusStyles = {
  Ready: "bg-accent-soft text-accent",
  "In Review": "bg-surface-muted text-ink",
  Submitted: "bg-primary/10 text-primary",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Projects
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Review assigned FYP projects and open the evaluation workspace for
            each group.
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
          <span className="font-semibold text-ink">{projects.length}</span>{" "}
          assigned projects
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Members</th>
                <th className="px-5 py-3 font-semibold">Phase</th>
                <th className="px-5 py-3 font-semibold">Progress</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr key={project.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{project.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {project.department} - {project.supervisor}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {project.members.join(", ")}
                  </td>
                  <td className="px-5 py-4 text-ink">{project.phase}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="font-medium text-ink">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[project.status]
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                    >
                      Evaluate
                    </Link>
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
