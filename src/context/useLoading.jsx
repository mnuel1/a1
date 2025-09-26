import { createContext, useContext, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <OrbitProgress color="#bc2e35" size="small" text="" textColor="" />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
