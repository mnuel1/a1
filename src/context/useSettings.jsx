import { createContext, useContext, useEffect, useState } from "react";
import { getSettings, getAccessPresets } from "../pages/Account/api/settings";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    let unsubscribe;

    const fetchData = async () => {    
      // fetch settings with realtime updates
      const res = await getSettings((updated) => {
        setSettings(updated); // realtime updates
      });
      
      if (res?.data) setSettings(res.data);
      if (res?.unsubscribe) unsubscribe = res.unsubscribe;

      // fetch presets
      const { data } = await getAccessPresets();
      setPresets(data || []);
    };

    fetchData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        presets,
        setPresets,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return ctx;
};
