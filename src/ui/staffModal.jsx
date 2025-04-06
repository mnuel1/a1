import React, { useEffect, useState } from "react";

const StaffModal = ({ isOpen, staff = null, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    access: [],
    status: "Active",
  });

  useEffect(() => {
    if (staff) {
      console.log("Editing staff:", staff);
      setFormData({ ...staff, access: staff.access || [] });
    } else {
      setFormData({
        name: "",
        role: "",
        access: [],
        status: "Active",
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "access") {
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData((prev) => ({ ...prev, access: selectedOptions }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    // Send updated form data back to parent component
    onSave?.(formData);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-400/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">
          {staff ? "Edit Staff" : "Add Staff"}
        </h2>

        <label className="block mb-2">
          <span className="text-gray-700">Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Enter name"
            required
          />
        </label>

        <label className="block mb-2">
          <span className="text-gray-700">Role</span>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
            <option value="Agent">Agent</option>
          </select>
        </label>

        <label className="block mb-2">
          <span className="text-gray-700">Access</span>
          <select
            name="access"
            value={formData.access}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            multiple
          >
            <option value="all">All</option>
            <option value="bac">BAC</option>
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Status</span>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
            onClick={handleSave}
          >
            {staff ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffModal;
