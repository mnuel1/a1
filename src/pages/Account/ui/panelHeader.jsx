export const PanelHeader = ({ icon, title, description }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-semibold text-font-light">{title}</h3>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
  </div>
);