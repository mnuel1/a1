import { useState } from "react";
import toast from "react-hot-toast";
import { useSettings } from "../context/useSettings";

// --- Component: Settings Table ---
const SettingsTable = () => {
  const { settings, setSettings, fetchSettings } = useSettings();
  console.log(settings);
  
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ cargo_agent: "", delivery_status: [], agents: [] });

  const handleAddOption = (field, value) => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], value] }));
  };
  const handleDeleteOption = (field, idx) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };

  const handleSave = async (id) => {
    const updates = {
      cargo_agent: form.cargo_agent,
      delivery_status: form.delivery_status,
      agents: form.agents,
    };
    const { error } = await supabase.from("settings").update(updates).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Settings saved");
      fetchSettings();
      setEditing(null);
    }
  };

  return (
    <div className="space-y-4">
      {settings.map((s) => (
        <div key={s.id} className="border p-4 rounded-lg shadow">
          {editing === s.id ? (
            <div className="space-y-2">
              <input
                className="border p-2 rounded w-full"
                value={form.cargo_agent}
                onChange={e => setForm(prev => ({ ...prev, cargo_agent: e.target.value }))}
                placeholder="Cargo Agent"
              />
              <div>
                <label className="font-semibold">Delivery Status</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {form.delivery_status.map((v, i) => (
                    <div key={i} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                      {v}
                      <button className="text-red-500 font-bold" onClick={() => handleDeleteOption("delivery_status", i)}>×</button>
                    </div>
                  ))}
                  <input
                    className="border p-1 rounded"
                    placeholder="Add status"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim() !== "") {
                        handleAddOption("delivery_status", e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">Agents</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {form.agents.map((v, i) => (
                    <div key={i} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                      {v}
                      <button className="text-red-500 font-bold" onClick={() => handleDeleteOption("agents", i)}>×</button>
                    </div>
                  ))}
                  <input
                    className="border p-1 rounded"
                    placeholder="Add agent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim() !== "") {
                        handleAddOption("agents", e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => handleSave(s.id)}>Save</button>
                <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{s.cargo_agent}</div>
                <div className="text-sm text-gray-600">Delivery Status: {s.delivery_status.join(", ")}</div>
                <div className="text-sm text-gray-600">Agents: {s.agents.join(", ")}</div>
              </div>
              <button className="text-primary font-semibold" onClick={() => { setEditing(s.id); setForm({ cargo_agent: s.cargo_agent, delivery_status: s.delivery_status, agents: s.agents }); }}>Edit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- Component: Access Level Presets ---
const AccessPresets = () => {
  const { presets, fetchPresets } = useSettings();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ preset_name: "", preset: {} });

  const handleSave = async (id) => {
    const { error } = await supabase.from("access_level_presets").update(form).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Preset updated");
      fetchPresets();
      setEditing(null);
    }
  };

  return (
    <div className="space-y-4">
      {presets.map((p) => (
        <div key={p.id} className="border p-4 rounded shadow">
          {editing === p.id ? (
            <div>
              <input
                className="border p-2 rounded w-full mb-2"
                value={form.preset_name}
                onChange={e => setForm(prev => ({ ...prev, preset_name: e.target.value }))}
              />
              <textarea
                className="border p-2 rounded w-full h-40"
                value={JSON.stringify(form.preset, null, 2)}
                onChange={e => {
                  try { setForm(prev => ({ ...prev, preset: JSON.parse(e.target.value) })); }
                  catch { }
                }}
              />
              <div className="flex gap-2 mt-2">
                <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => handleSave(p.id)}>Save</button>
                <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>{p.preset_name}</div>
              <button className="text-primary font-semibold" onClick={() => { setEditing(p.id); setForm({ preset_name: p.preset_name, preset: p.preset }); }}>Edit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Settings = () => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Settings Table</h2>
        <SettingsTable />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Access Level Presets</h2>
        <AccessPresets />
      </section>
    </div>

  );
};

export default Settings;
