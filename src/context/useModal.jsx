import { createContext, useContext, useState, useCallback } from "react";
import { Info } from "lucide-react";

const ModalContext = createContext();

// ─── Selectable Table ────────────────────────────────────────────────────────
const SelectableTable = ({ data, onConfirm, onCancel, hideModal, confirmText }) => {
  const [selected, setSelected] = useState(() => new Set(data.map((_, i) => i)));

  const allSelected = selected.size === data.length;
  const noneSelected = selected.size === 0;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(data.map((_, i) => i)));
  };

  const toggleRow = (i) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleConfirm = () => {
    const selectedRows = data.filter((_, i) => selected.has(i));
    onConfirm(selectedRows);
    hideModal();
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const buttonLabel = confirmText
    ? confirmText
    : allSelected
    ? "Update All"
    : "Confirm";

  return (
    <>
      {/* Body */}
      <div className="px-6 py-3 overflow-y-auto flex-1">
        <div className="overflow-x-auto mb-4">
          <table className="w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 border-b">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = !allSelected && !noneSelected; }}
                    onChange={toggleAll}
                    className="cursor-pointer"
                  />
                </th>
                {columns.map(col => (
                  <th
                    key={col}
                    className="px-2 py-1 text-left text-md font-medium border-b whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => toggleRow(i)}
                  className={`cursor-pointer ${
                    selected.has(i) ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50 opacity-50"
                  }`}
                >
                  <td className="px-2 py-1 border-b text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggleRow(i)}
                      onClick={e => e.stopPropagation()}
                      className="cursor-pointer"
                    />
                  </td>
                  {columns.map(col => (
                    <td key={col} className="px-2 py-1 text-sm border-b whitespace-nowrap">
                      {typeof row[col] === "object" ? JSON.stringify(row[col]) : row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {noneSelected && (
          <p className="text-xs text-red-500 mt-1">No rows selected. Select at least one to proceed.</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 px-6 py-3 border-t">
        <button
          onClick={() => { hideModal(); onCancel?.(); }}
          className="px-4 py-2 hover:bg-gray-200 text-primary font-semibold cursor-pointer rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={noneSelected}
          className="px-4 py-2 bg-primary hover:bg-primary-60 text-white cursor-pointer rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {buttonLabel}
        </button>
      </div>
    </>
  );
};

// ─── Static Table ─────────────────────────────────────────────────────────────
const StaticTable = ({ data, content, onConfirm, onCancel, hideModal, confirmText, cancelText, showCancel }) => (
  <>
    <div className="px-6 py-3 overflow-y-auto flex-1">
      <div className="overflow-x-auto mb-4">
        <table className="w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {Object.keys(data[0]).map(key => (
                <th key={key} className="px-2 py-1 text-left text-md font-medium border-b whitespace-nowrap">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="px-2 py-1 text-sm border-b whitespace-nowrap">
                    {typeof val === "object" ? JSON.stringify(val) : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {content && (
        <div className="bg-yellow-400 w-full p-2 font-bold rounded-md">{content}</div>
      )}
    </div>
    <div className="flex justify-end gap-2 px-6 py-3 border-t">
      {showCancel !== false && (
        <button
          onClick={() => { hideModal(); onCancel?.(); }}
          className="px-4 py-2 hover:bg-gray-200 text-primary font-semibold cursor-pointer rounded-lg"
        >
          {cancelText || "Cancel"}
        </button>
      )}
      {onConfirm && (
        <button
          onClick={() => { onConfirm(); hideModal(); }}
          className="px-4 py-2 bg-primary hover:bg-primary-60 text-white cursor-pointer rounded-lg"
        >
          {confirmText || "Confirm"}
        </button>
      )}
    </div>
  </>
);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const showModal = useCallback((options) => {
    setModal({ ...options, isOpen: true });
  }, []);

  const hideModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modal?.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 z-50">
          <div
            className={`bg-white rounded-xl shadow-lg ${
              modal.type === "table" || modal.type === "selectable-table"
                ? "w-[1000px]"
                : "w-[500px]"
            } max-w-full max-h-[50vh] flex flex-col`}
          >
            {/* Header */}
            {modal.title && (
              <h2 className="text-lg font-semibold px-6 py-3 border-b">
                {modal.title}
                {modal.sub && (
                  <div className="flex items-start gap-2 text-blue-600 text-xs font-normal">
                    <Info className="w-4 h-4" />
                    <p>{modal.sub}</p>
                  </div>
                )}
              </h2>
            )}

            {/* Body + Footer — delegated by type */}
            {modal.type === "selectable-table" && modal.data ? (
              <SelectableTable
                data={modal.data}
                onConfirm={modal.onConfirm}
                onCancel={modal.onCancel}
                hideModal={hideModal}
                confirmText={modal.confirmText}
              />
            ) : modal.type === "table" && modal.data ? (
              <StaticTable
                data={modal.data}
                content={modal.content}
                onConfirm={modal.onConfirm}
                onCancel={modal.onCancel}
                hideModal={hideModal}
                confirmText={modal.confirmText}
                cancelText={modal.cancelText}
                showCancel={modal.showCancel}
              />
            ) : (
              <>
                <div className="px-6 py-3 overflow-y-auto flex-1">{modal.content}</div>
                <div className="flex justify-end gap-2 px-6 py-3 border-t">
                  {modal.showCancel !== false && (
                    <button
                      onClick={() => { hideModal(); modal.onCancel?.(); }}
                      className="px-4 py-2 hover:bg-gray-200 text-primary font-semibold cursor-pointer rounded-lg"
                    >
                      {modal.cancelText || "Cancel"}
                    </button>
                  )}
                  {modal.onConfirm && (
                    <button
                      onClick={() => { modal.onConfirm(); hideModal(); }}
                      className="px-4 py-2 bg-primary hover:bg-primary-60 text-white cursor-pointer rounded-lg"
                    >
                      {modal.confirmText || "Confirm"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);