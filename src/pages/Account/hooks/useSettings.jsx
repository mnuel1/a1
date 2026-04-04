import { useMutation } from "@tanstack/react-query";
import { updateSettings, updateAccessPreset } from "../api/settings";
import { useSettings } from "../../../context/useSettings"; // ← your global provider

export { useSettings }; // re-export so UI only imports from one place

export const useUpdateSettings = () => {
  
  return useMutation({
    mutationFn: updateSettings, // ({ id, updates })
    onSuccess: () => {
      console.log();
      
    },
  });
};

export const useUpdateAccessPreset = () => {
  const { setPresets } = useSettings();

  return useMutation({
    mutationFn: updateAccessPreset, // ({ id, updates })
    onSuccess: (updatedRow) => {
      setPresets((prev) =>
        prev.map((p) => (p.id === updatedRow.id ? { ...prev, ...updatedRow } : p))
      );
    },
  });
};