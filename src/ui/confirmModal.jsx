import React from "react";

const ConfirmModal = ({ isOpen, message = "", onClose, onConfirm }) => {
  const handleCancel = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    handleCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-400/50 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h3 className="text-lg font-semibold">Confirm Action</h3>
        <p className="my-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="cursor-pointer px-4 py-2 bg-gray-500 text-white rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
