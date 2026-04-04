import { createContext, useContext } from "react";
import { Toaster, sileo } from "sileo";

const ToastContext = createContext(null);

const options = {
  success: {
    styles: {
      title: "text-green!",
      description: "text-green/75!",
    },
  },
}

export const ToastProvider = ({ children }) => {
  const appToast = {
    success: (input, description) => {
      return sileo.success({
        title: input,
        description: (
          <>
            <span className="text-green-500! font-medium!">
              { description }
            </span>
          </>
        ),
        ...options.success
      });
    },

    error: (input, description = null) => {
      return sileo.error({
        title: input,
        description: (
          <>
            <span className="text-white! font-medium!">
              { description || "Something went wrong. Please try again later" }
            </span>
          </>
        )
      });
    },

    info: (input, description) => {
      return sileo.info({
        title: input,
        description: (
          <>
            <span className="text-blue-500! font-medium!">
              {description}
            </span>
          </>
        )
      });
    },
    dismiss: (id) => {
      sileo.dismiss(id);
    },
  };

  return (
    <ToastContext.Provider value={appToast}>
      <Toaster
        position="top-right"
        options={{
          fill: "#171717",
          roundness: 12,
        }}
      />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// helper
const normalize = (input) => {
  if (typeof input === "string") return { title: input };
  return input;
};