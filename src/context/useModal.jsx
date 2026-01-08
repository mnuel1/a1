import { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext();

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
        <div
          className="fixed inset-0 flex items-center justify-center bg-gray-900/50 z-50"
        >
          <div className={`bg-white rounded-xl p-6 shadow-lg ${modal.type === "table" ? 'w-[1000px]' : 'w-[400px]'} max-w-full`}>
            {/* Header */}
            {modal.title && (
              <h2 className="text-lg font-semibold mb-4 border-b">
                {modal.title}
              </h2>
            )}

            {/* Body */}
            <div className="mb-4">
              {modal.type === "table" && modal.data ? (
                <>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full table-auto border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(modal.data[0]).map((key) => (
                            <th
                              key={key}
                              className="px-2 py-1 text-left text-md font-medium border-b whitespace-nowrap"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {modal.data.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {Object.values(row).map((val, j) => (
                              <td
                                key={j}
                                className="px-2 py-1 text-sm border-b whitespace-nowrap"
                              >
                                {typeof val === "object" ? JSON.stringify(val) : val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-yellow-400 w-full p-2 font-bold rounded-md">
                    {modal.content}
                  </div>
                </>
              ) : (
                modal.content
              )}
            </div>


            {/* Footer */}
            <div className="flex justify-end gap-2">
              {modal.showCancel !== false && (
                <button
                  onClick={() => {
                    hideModal();
                    modal.onCancel?.();
                  }}
                  className="px-4 py-2 hover:bg-gray-200 text-primary font-semibold cursor-pointer rounded-lg"
                >
                  {modal.cancelText || "Cancel"}
                </button>
              )}
              {modal.onConfirm && (
                <button
                  onClick={() => {
                    modal.onConfirm();
                    hideModal();
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary-60 text-white cursor-pointer rounded-lg"
                >
                  {modal.confirmText || "Confirm"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};


export const useModal = () => useContext(ModalContext);
