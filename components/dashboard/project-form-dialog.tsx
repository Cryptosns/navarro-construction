"use client";

import { useState } from "react";
import type { Project, ProjectStatus } from "@/lib/types";
import {
  createProject,
  updateProject,
  type ProjectFormData,
} from "@/app/dashboard/projects/actions";
import { Button } from "@/components/ui/button";

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In progress" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
];

const emptyForm: ProjectFormData = {
  name: "",
  location: "",
  status: "planning",
  progress: 0,
  budget: 0,
  spent: 0,
  deadline: "",
  teamSize: 0,
};

type ProjectFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  project?: Project;
  onClose: () => void;
};

export function ProjectFormDialog({
  open,
  mode,
  project,
  onClose,
}: ProjectFormDialogProps) {
  const [form, setForm] = useState<ProjectFormData>(() =>
    project
      ? {
          name: project.name,
          location: project.location,
          status: project.status,
          progress: project.progress,
          budget: project.budget,
          spent: project.spent,
          deadline: project.deadline,
          teamSize: project.teamSize,
        }
      : emptyForm,
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  function updateField<K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result =
      mode === "create"
        ? await createProject(form)
        : await updateProject(project!.id, form);

    setLoading(false);
    setMessage(result.message);

    if (result.ok) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            {mode === "create" ? "New project" : "Edit project"}
          </h2>
          <p className="text-sm text-zinc-500">
            Fill in the project details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <Field label="Project name *">
            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. North Tower"
            />
          </Field>

          <Field label="Location">
            <input
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={inputClass}
              placeholder="City, State"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value as ProjectStatus)
                }
                className={inputClass}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Progress (%)">
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) =>
                  updateField("progress", Number(e.target.value))
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget (USD)">
              <input
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) => updateField("budget", Number(e.target.value))}
                className={inputClass}
              />
            </Field>

            <Field label="Spent (USD)">
              <input
                type="number"
                min={0}
                value={form.spent}
                onChange={(e) => updateField("spent", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Deadline">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => updateField("deadline", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Team size">
              <input
                type="number"
                min={0}
                value={form.teamSize}
                onChange={(e) =>
                  updateField("teamSize", Number(e.target.value))
                }
                className={inputClass}
              />
            </Field>
          </div>

          {message && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                message.includes("created") || message.includes("updated")
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create project"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";
