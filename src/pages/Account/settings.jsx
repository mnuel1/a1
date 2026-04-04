import { IconShield } from "./ui/icons";
import { SettingsTable } from "./ui/settingsTable";
import { AccessPresets } from "./ui/accessPresets";

const Settings = () => {
  return (
    <div className="flex flex-col gap-5 p-6 h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-font-light tracking-tight">System Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Admin configuration panel</p>
        </div>
      </div>

      {/* Admin badge */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary/8 border border-primary/15">
        <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-xs font-medium text-primary">Admin access — changes apply system-wide</p>
      </div>

      {/* Delivery config */}
      <SettingsTable />

      {/* Access presets */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <IconShield />
          <h2 className="text-sm font-semibold text-font-light">Access Level Presets</h2>
          <span className="ml-auto text-xs text-gray-400">Role-based permissions</span>
        </div>
        <AccessPresets />
      </div>
    </div>
  );
};

export default Settings;