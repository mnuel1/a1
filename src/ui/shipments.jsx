import React, { useState, useEffect } from "react";

const Shipments = ({ 
  label = "", 
  value = "", 
  options = [], 
  onChange }) => {

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
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold">{label}</label>
        <select
          key={"status"}
          name="status"
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
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold">Container No.</label>
        <input 
          type="text" 
          className="text-md w-full  px-2 py-1 focus:ring-red-300 focus:outline-none cursor-normal"
          value={selectedOption ? selectedOption.container_number : "-"} readOnly/>
      </div>
    </div>
  );
};

export default Shipments;
