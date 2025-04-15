import React, { useState, useEffect } from "react";

const Shipments = ({ 
  label = "", 
  value = "", 
  options = [], 
  onChange }) => {
    
  const defaultOptions = [
    "2501",
    "2504",
    "2505",
    "2434",
    "2435",
    "2437",
    "2438",
    "2439",
    "N/A",
  ];

  const finalOptions = options.length ? options : defaultOptions;
  const [selectedValue, setSelectedValue] = useState(value || "N/A");

  useEffect(() => {
    setSelectedValue(value || "N/A");
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold">{label}</label>
      <select
        name="status"
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
    </div>
  );
};

export default Shipments;
