"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormTextField } from "@/components/fields/FormTextField";
import { Button } from "@/components/ui/Button";
import type { Project, ProjectInput } from "@/types/project";
import { noHtmlValidation } from "@/utils/validation/formValidation";

const emptyProjectValues: ProjectInput = {
  title: "",
  students: ["", "", "", ""],
  supervisor: "",
  coSupervisor: "",
  industrialPartner: "",
  sdg: "",
};

const getProjectFormValues = (project: Project): ProjectInput => ({
  title: project.title,
  students: [...project.students, "", "", "", ""].slice(0, 4),
  supervisor: project.supervisor,
  coSupervisor: project.coSupervisor,
  industrialPartner: project.industrialPartner,
  sdg: project.sdg,
});

type ProjectEditRowProps = {
  project: Project;
  saving: boolean;
  onCancel: () => void;
  onSave: (values: ProjectInput) => void;
};

export function ProjectEditRow({
  project,
  saving,
  onCancel,
  onSave,
}: ProjectEditRowProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<ProjectInput>({
    defaultValues: emptyProjectValues,
    mode: "onChange",
  });

  useEffect(() => {
    reset(getProjectFormValues(project));
  }, [project, reset]);

  return (
    <div className="border-t border-border bg-background px-5 py-4">
      <form
        className="rounded-lg border border-border bg-surface p-4"
        noValidate
        onSubmit={handleSubmit((values) => {
          if (!isDirty) {
            return;
          }

          onSave(values);
        })}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink">Edit project</h3>
            <p className="mt-1 text-sm text-muted">
              Update project details.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-md border border-border px-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormTextField
            control={control}
            name="title"
            label="Title"
            placeholder="Enter project title"
            rules={{
              required: "Project title is required",
              validate: noHtmlValidation,
            }}
          />
          {Array.from({ length: 4 }).map((_, index) => (
            <FormTextField
              key={index}
              control={control}
              name={`students.${index}` as const}
              label={`Student ${index + 1}`}
              placeholder={`Enter student ${index + 1}`}
              rules={{
                required: index === 0 ? "At least one student is required" : false,
                validate: noHtmlValidation,
              }}
            />
          ))}
          <FormTextField
            control={control}
            name="supervisor"
            label="Supervisor"
            placeholder="Enter supervisor"
            rules={{
              required: "Supervisor is required",
              validate: noHtmlValidation,
            }}
          />
          <FormTextField
            control={control}
            name="coSupervisor"
            label="Co Supervisor"
            placeholder="Enter co supervisor"
            rules={{ validate: noHtmlValidation }}
          />
          <FormTextField
            control={control}
            name="industrialPartner"
            label="Industrial Partner"
            placeholder="Enter industrial partner"
            rules={{
              required: "Industrial partner is required",
              validate: noHtmlValidation,
            }}
          />
          <FormTextField
            control={control}
            name="sdg"
            label="SDG"
            placeholder="Enter SDG"
            rules={{
              required: "SDG is required",
              validate: noHtmlValidation,
            }}
          />
        </div>

        <Button
          type="submit"
          className="mt-4"
          disabled={!isDirty}
          loading={saving || isSubmitting}
          loadingText="Saving"
        >
          Save changes
        </Button>
      </form>
    </div>
  );
}
