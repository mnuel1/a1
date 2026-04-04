import { useState } from "react";
import { useToast } from "../../../context/useToast";
import {
  useSettings,
  useUpdateSettings
} from "../hooks/useSettings";

import { IconSliders, IconPencil } from "./icons";
import { SettingsTableSkeleton } from "./skeletons";
import { TagListEditor } from "./taglistEditor";
import { PanelHeader } from "./panelHeader";
import { ActionButtons } from "./actionButton";

export const SettingsTable = () => {
  const { settings } = useSettings();
  const updateMutation = useUpdateSettings();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ cargo_agent: "", delivery_status: [], agents: [] });

  if (!settings) return <SettingsTableSkeleton />;

  const startEdit = () => {
    setEditing(true);
    setForm({
      cargo_agent: settings.cargo_agent,
      delivery_status: settings.delivery_status?.values ?? [],
      agents: settings.agents ?? [],
    });
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: settings.id,
        updates: {
          ...form,
          delivery_status: { values: form.delivery_status },
        },
      });
      toast.success("Settings saved");
      setEditing(false);
    } catch (err) {
      toast.error(err.message ?? "Failed to save settings.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <PanelHeader
          icon={<IconSliders />}
          title="Delivery Configuration"
          description="Cargo agent and delivery status options"
        />
        {!editing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
          >
            <IconPencil />
            Edit
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Cargo Agent
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-font-light focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all bg-background"
                value={form.cargo_agent}
                onChange={(e) => setForm((prev) => ({ ...prev, cargo_agent: e.target.value }))}
                placeholder="e.g. Kabalikat Cargo"
              />
            </div>

            <TagListEditor
              label="Delivery Status"
              value={form.delivery_status}
              onChange={(val) => setForm((prev) => ({ ...prev, delivery_status: val }))}
            />

            <TagListEditor
              label="Agents"
              value={form.agents}
              onChange={(val) => setForm((prev) => ({ ...prev, agents: val }))}
            />

            <ActionButtons
              onSave={handleSave}
              onCancel={cancelEdit}
              isPending={updateMutation.isPending}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">Cargo Agent</p>
                <p className="text-sm font-semibold text-font-light">{settings.cargo_agent}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Delivery Status</p>
              <div className="flex flex-wrap gap-1.5">
                {settings.delivery_status?.values?.length
                  ? settings.delivery_status.values.map((v, i) => (
                    <span key={i} className="px-2.5 py-1 bg-secondary/40 text-font-light rounded-lg text-xs font-medium">
                      {v}
                    </span>
                  ))
                  : <span className="text-sm text-gray-400">—</span>
                }
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Agents</p>
              <div className="flex flex-wrap gap-1.5">
                {settings.agents?.length
                  ? settings.agents.map((v, i) => (
                    <span key={i} className="px-2.5 py-1 bg-accent/30 text-font-light rounded-lg text-xs font-medium">
                      {v}
                    </span>
                  ))
                  : <span className="text-sm text-gray-400">—</span>
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
