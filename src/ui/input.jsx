export const NormalInput = ({
  type = 'text',
  name = '',
  label = '',
  value = '',
  placeholder = '',
  required = false,
  canAutoComplete = false,
  onChange
}) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={name} className="block text-md font-medium mb-2">{label}</label>}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={canAutoComplete ? 'on' : 'off'}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-700"
      />
    </div>
  );
};


export const CardInput = ({
  type = "text",
  keyName,
  label,
  value,
  values,
  parentid,
  editable,
  handleFieldChange,
}) => {
  if (type === "label") {
    return (
      <div key={keyName} className="flex gap-2">
        <strong>{label}</strong>
        <span className="underline">{value}</span>
      </div>
    );
  }

  if (type === "text" || type === "date") {
    return (
      <label key={keyName} className="block mb-1">
        <strong>{label}:</strong>
        <input
          type={type === "date" ? "date" : "text"}
          className="border px-2 py-1 rounded w-full"
          value={value || ""}
          onChange={(e) =>
            editable &&
            handleFieldChange(parentid, keyName, e.target.value)
          }
          disabled={!editable}
        />
      </label>
    );
  }

  if (type === "dropdown") {
    return (
      <label key={keyName} className="block mb-1">
        <strong>{label}:</strong>
        <select
          className="border px-2 py-1 rounded w-full"
          value={value || ""}
          onChange={(e) =>
            editable &&
            handleFieldChange(parentid, keyName, e.target.value)
          }
          disabled={!editable}
        >
          <option value="">Select {label}</option>
          {values?.split("|").map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return null; // fallback if type is unknown
};
