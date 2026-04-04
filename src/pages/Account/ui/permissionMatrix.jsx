// ─── Permission Matrix Editor ─────────────────────────────────────────────────

const ALL_ACTIONS = ["view", "create", "edit", "delete", "export"];

const MODULE_CONFIG = [
  { key: "users",    label: "Users",    actions: ALL_ACTIONS },
  { key: "report",   label: "Reports",  actions: ALL_ACTIONS },
  { key: "account",  label: "Account",  actions: ALL_ACTIONS },
  { key: "database", label: "Database", actions: ["view", "create", "edit", "delete"] },
  { key: "manifest", label: "Manifest", actions: ["view", "create", "edit", "delete"] },
];

const permissionsToMatrix = (permissions = {}) => {
  const matrix = {};
  MODULE_CONFIG.forEach(({ key, actions }) => {
    matrix[key] = {};
    actions.forEach((a) => {
      matrix[key][a] = permissions[key]?.[a] ?? false;
    });
  });
  return matrix;
};

const matrixToPermissions = (matrix) => {
  const permissions = {};
  MODULE_CONFIG.forEach(({ key, actions }) => {
    permissions[key] = {};
    actions.forEach((a) => {
      permissions[key][a] = matrix[key]?.[a] ?? false;
    });
  });
  return permissions;
};

export const PermissionMatrix = ({ value, onChange }) => {
  const matrix = permissionsToMatrix(value);

  const toggle = (mod, action) => {
    const next = {
      ...matrix,
      [mod]: { ...matrix[mod], [action]: !matrix[mod][action] },
    };
    onChange(matrixToPermissions(next));
  };

  const setAll = (val) => {
    const next = {};
    MODULE_CONFIG.forEach(({ key, actions }) => {
      next[key] = {};
      actions.forEach((a) => { next[key][a] = val; });
    });
    onChange(matrixToPermissions(next));
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Column headers */}
      <div className="grid bg-background px-4 py-2 border-b border-gray-100"
           style={{ gridTemplateColumns: "140px repeat(5, 1fr)" }}>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Module</span>
        {ALL_ACTIONS.map((a) => (
          <span key={a} className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
            {a}
          </span>
        ))}
      </div>

      {/* Rows */}
      {MODULE_CONFIG.map(({ key, label, actions }) => {
        const granted = actions.filter((a) => matrix[key]?.[a]).length;
        return (
          <div
            key={key}
            className="grid items-center px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-background transition-colors"
            style={{ gridTemplateColumns: "140px repeat(5, 1fr)" }}
          >
            <div>
              <p className="text-sm font-medium text-font-light">{label}</p>
              <p className="text-xs text-gray-400">{granted}/{actions.length} granted</p>
            </div>
            {ALL_ACTIONS.map((a) => {
              const available = actions.includes(a);
              const checked = available && matrix[key]?.[a];
              return (
                <div key={a} className="flex justify-center">
                  {available ? (
                    <button
                      type="button"
                      onClick={() => toggle(key, a)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${
                        checked ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          checked ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  ) : (
                    <span className="w-4 h-px bg-gray-200 block mt-2.5" />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Footer: grant/revoke all */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-background border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {MODULE_CONFIG.reduce((sum, { key, actions }) =>
            sum + actions.filter((a) => matrix[key]?.[a]).length, 0
          )}{" "}
          of{" "}
          {MODULE_CONFIG.reduce((sum, { key, actions }) => sum + actions.length, 0)}{" "}
          permissions granted
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAll(false)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            Revoke all
          </button>
          <button type="button" onClick={() => setAll(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors font-medium">
            Grant all
          </button>
        </div>
      </div>
    </div>
  );
};