import { useState } from "react";
import { useToast } from "../../../context/useToast";
import {
  useSettings,
  useUpdateAccessPreset
} from "../hooks/useSettings";

import { PermissionMatrix } from "./permissionMatrix"
import { IconShield, IconPencil } from "./icons";
import { AccessPresetsSkeleton } from "./skeletons";
import { ActionButtons } from "./actionButton";

export const AccessPresets = () => {
  const { presets, loading } = useSettings();
  const updateMutation = useUpdateAccessPreset();
  const toast = useToast();

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ preset_name: "", preset: {} });
  const [jsonError, setJsonError] = useState(null);

  if (loading) return <AccessPresetsSkeleton />;
  if (!presets.length) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <IconShield />
      </div>
      <p className="text-sm text-gray-400">No access presets found</p>
    </div>
  );

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ preset_name: p.preset_name, preset: p.preset });
    setJsonError(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setJsonError(null);
  };

  const handleJsonChange = (raw) => {
    try {
      setForm((prev) => ({ ...prev, preset: JSON.parse(raw) }));
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON — fix before saving.");
    }
  };

  const handleSave = async (id) => {
    if (jsonError) return;
    try {
      await updateMutation.mutateAsync({ id, updates: form });
      toast.success("Preset updated");
      setEditing(null);
    } catch (err) {
      toast.error(err.message ?? "Failed to update preset.");
    }
  };

  return (
    <div className="space-y-2.5">
      {presets.map((p, idx) => (
        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {editing === p.id ? (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Preset Name
                </label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-font-light focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all bg-background"
                  value={form.preset_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, preset_name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Permissions (JSON)
                </label>
                <PermissionMatrix
                  value={form.preset?.permissions}
                  onChange={(permissions) =>
                    setForm((prev) => ({ ...prev, preset: { ...prev.preset, permissions } }))
                  }
                />
              </div>

              <ActionButtons
                onSave={() => handleSave(p.id)}
                onCancel={cancelEdit}
                isPending={updateMutation.isPending}
                disabled={!!jsonError}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-font-light">{p.preset_name}</p>
                  <p className="text-xs text-gray-400">
                    {Object.keys(p.preset ?? {}).length} permission{Object.keys(p.preset ?? {}).length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => startEdit(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <IconPencil />
                Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};