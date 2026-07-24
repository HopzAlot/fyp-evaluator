"use client";

import { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import { Button } from "@/components/ui/Button";
import type { EvaluationPhaseOption } from "@/types/evaluation";

type EvaluationExportDialogProps = {
  phases: EvaluationPhaseOption[];
  exporting: boolean;
  error: string;
  onClose: () => void;
  onExport: (phaseIds: string[]) => void;
};

export function EvaluationExportDialog({
  phases,
  exporting,
  error,
  onClose,
  onExport,
}: EvaluationExportDialogProps) {
  const [selectedPhaseIds, setSelectedPhaseIds] = useState(() =>
    phases.map((phase) => phase.id),
  );
  const allPhasesSelected = selectedPhaseIds.length === phases.length;
  const somePhasesSelected =
    selectedPhaseIds.length > 0 && !allPhasesSelected;
  const checkboxStyles = {
    color: "var(--muted)",
    padding: 0,
    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
      color: "var(--primary)",
    },
  };

  const togglePhase = (phaseId: string) => {
    setSelectedPhaseIds((current) =>
      current.includes(phaseId)
        ? current.filter((id) => id !== phaseId)
        : [...current, phaseId],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="evaluation-export-title"
        className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-xl"
      >
        <div className="border-b border-border px-5 py-4">
          <div>
            <h2
              id="evaluation-export-title"
              className="text-base font-semibold text-ink"
            >
              Export evaluation results
            </h2>
            <p className="mt-1 text-sm text-muted">
              Choose which evaluation phases to include in the Excel sheet.
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-md border border-border bg-background">
            <p className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
              {selectedPhaseIds.length} of {phases.length} phases selected
            </p>
            <div className="p-4">
              <label className="mb-3 flex cursor-pointer items-center gap-3 border-b border-border px-2 pb-3 text-sm font-semibold text-ink">
                <Checkbox
                  checked={allPhasesSelected}
                  indeterminate={somePhasesSelected}
                  onChange={() =>
                    setSelectedPhaseIds(
                      allPhasesSelected
                        ? []
                      : phases.map((phase) => phase.id),
                    )
                  }
                  size="small"
                  disableRipple
                  sx={checkboxStyles}
                />
                {allPhasesSelected ? "Unselect all phases" : "Select all phases"}
              </label>

              <div className="max-h-72 space-y-2 overflow-y-auto">
                {phases.map((phase) => (
                  <label
                    key={phase.id}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-md px-2 py-2 text-sm transition hover:bg-surface-muted"
                  >
                    <span className="font-medium text-ink">{phase.title}</span>
                    <Checkbox
                      checked={selectedPhaseIds.includes(phase.id)}
                      onChange={() => togglePhase(phase.id)}
                      size="small"
                      disableRipple
                      sx={checkboxStyles}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error ? (
            <p className="rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={exporting}
              className="h-11 rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-muted"
            >
              Cancel
            </button>
            <Button
              type="button"
              loading={exporting}
              loadingText="Exporting"
              disabled={selectedPhaseIds.length === 0}
              onClick={() => onExport(selectedPhaseIds)}
            >
              Export selected phases
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
