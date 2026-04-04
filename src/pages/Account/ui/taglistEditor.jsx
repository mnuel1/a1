import { IconX } from "./icons";
export const TagListEditor = ({ label, value, onChange }) => {
  const handleDelete = (idx) => onChange(value.filter((_, i) => i !== idx));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      onChange([...value, e.target.value.trim()]);
      e.target.value = "";
      e.preventDefault();
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 p-2.5 border border-gray-200 rounded-xl min-h-[44px] bg-background focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        {value.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-white border border-gray-200 text-font-light px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm"
          >
            {v}
            <button
              type="button"
              onClick={() => handleDelete(i)}
              className="text-gray-400 hover:text-primary transition-colors ml-0.5"
            >
              <IconX />
            </button>
          </span>
        ))}
        <input
          className="outline-none bg-transparent text-sm text-font-light placeholder-gray-300 min-w-[120px] py-0.5"
          placeholder={`Add ${label.toLowerCase()}…`}
          onKeyDown={handleKeyDown}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">Press Enter to add</p>
    </div>
  );
};
