
export const SettingsTableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
        <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      </div>
      <div className="h-7 bg-gray-100 rounded-lg w-14 shrink-0" />
    </div>
  </div>
);

export const AccessPresetsSkeleton = () => (
  <div className="space-y-2.5">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg" />
            <div className="h-4 bg-gray-100 rounded-lg w-28" />
          </div>
          <div className="h-7 bg-gray-100 rounded-lg w-14" />
        </div>
      </div>
    ))}
  </div>
);
