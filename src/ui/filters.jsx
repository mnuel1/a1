import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export const LabeledField = ({ label, children, show }) => {
  return (
    <div className="flex flex-col gap-2">
      {show && <label className="text-xs font-bold"> {label} </label>}
      {children}
    </div>
  );
};

export const Status = ({
  label = "",
  value = "",
  options = [],
  onChange }) => {

  const finalOptions = options
  const [selectedValue, setSelectedValue] = useState(value || "ALL");

  useEffect(() => {
    setSelectedValue(value || "ALL");
  }, [value]);

  const handleChange = (e) => {
    let newValue = e.target.value;
    setSelectedValue(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <LabeledField label={label} show={label.trim() !== ""}>
      <select
        className="text-md w-full rounded-lg border px-2 py-1 focus:ring-red-300 focus:outline-none cursor-pointer"
        value={selectedValue}
        onChange={handleChange}
      >
        {finalOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </LabeledField>
  );
};

export const Shipments = ({
  label = "",
  value = "",
  options = [],
  onChange,

}) => {

  const finalOptions = options.length ? options : ["None"];
  const [selectedValue, setSelectedValue] = useState(value || "N/A");

  useEffect(() => {
    setSelectedValue(value || "N/A");
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    if (onChange) onChange(newValue);
  };

  const selectedOption = finalOptions.find(
    (opt) => opt.shipment_number === selectedValue
  );

  return (
    <div className="flex gap-4">
      <LabeledField label={label} show={label}>
        <select
          className="text-md w-full rounded-lg border px-2 py-1 focus:ring-red-300 focus:outline-none cursor-pointer"
          value={selectedValue}
          onChange={handleChange}
        >
          {finalOptions.map((option, idx) => (
            <option key={idx} value={option.shipment_number}>
              {option.shipment_number}
            </option>
          ))}
        </select>
      </LabeledField>

      <LabeledField label="Container No." show={label.trim() !== ""}>
        <input
          type="text"
          className="text-md w-full px-2 py-1 focus:ring-red-300 focus:outline-none cursor-normal"
          value={selectedOption ? selectedOption.container_number : "-"}
          readOnly
        />
      </LabeledField>
    </div>
  );
};


export const SearchBar = ({ label = "Search", value = "", placeholder = "Search...", onChange, handleOnKeyDown }) => {
  const [query, setQuery] = useState(value || "");

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
  };

  return (
    label ? (
      <LabeledField label={label} show={label.trim() !== ""}>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (handleOnKeyDown) handleOnKeyDown()
            }
          }}
          className="text-md w-full rounded-lg border px-2 py-1 focus:ring-red-300 focus:outline-none"
        />
      </LabeledField>
    )
      : (
        <div
          className="focus-within:ring-primary mb-4 flex w-full items-center
                    space-x-1 rounded-lg border border-gray-300 px-2 py-1 focus-within:ring-2"
        >
          <Search className="text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (handleOnKeyDown) handleOnKeyDown()
              }
            }}

            className="ml-2 w-full focus:outline-none text-lg py-2"
          />
        </div>

      )

  );
};