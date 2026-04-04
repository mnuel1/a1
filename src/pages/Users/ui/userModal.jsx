import { useEffect, useState } from "react";

const UserModal = ({ isOpen, user = null, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    role: "",
    access: [],
    status: "Active",
  });
  
  useEffect(() => {
    if (user) {
      setFormData({ ...user, access: user.access || [] });
    } else {
      setFormData({ id: "", name: "", role: "", access: [], status: "Active" });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "access") {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData((prev) => ({ ...prev, access: selectedOptions }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    onSave?.(formData);
    if (user && user.id === "") {
      setFormData({ id: "",name: "", role: "", access: [], status: "Active" });
    }
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 z-50">
      <div className="bg-white rounded-xl shadow-lg w-[500px] max-w-full flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex flex-row items-center justify-between lg:flow-col gap-2">
          <h2 className="text-lg font-semibold">
            {user ? "Edit User" : "Add User"}
          </h2>

          <label className="block">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-red-500 focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          <div className="flex gap-4">
            <label className="block w-full">
              <span className="text-gray-700 text-sm">Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-red-500 focus:outline-none"
                placeholder="Enter name"
                required
              />
            </label>

            <label className="block">
              <span className="text-gray-700 text-sm">Role</span>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-red-500 focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Agent">Agent</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700 text-sm">Access</span>
            <select
              name="access"
              value={formData.access}
              onChange={handleChange}
              multiple
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-red-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="bac">BAC</option>
            </select>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-gray-200 text-primary font-semibold cursor-pointer rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary hover:bg-primary-60 text-white cursor-pointer rounded-lg"
          >
            {user ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;