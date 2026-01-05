import { createContext, useContext, useEffect, useState } from "react";
import { getRecentManifest } from "../api/manifest";
import { useAuth } from "./useAuth";

const StatusShipmentContext = createContext(null);

export const StatusShipmentProvider = ({ children }) => {
  const { getSettings } = useAuth();

  const [shipmentNumber, setShipmentNumber] = useState(null);
  const [shipmentNumbers, setShipmentNumbers] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch shipment numbers
      const shipments = await getRecentManifest();
      if (shipments?.length) {
        setShipmentNumbers(shipments);
        setShipmentNumber(shipments[0].shipment_number);
      }

      // Fetch status options (from settings)
      const status =
        getSettings()?.delivery_status?.values ?? [];
      setStatusOptions(status);
    };

    fetchInitialData();
  }, [getSettings]);

  return (
    <StatusShipmentContext.Provider
      value={{
        // shipment
        shipmentNumber,
        shipmentNumbers,
        setShipmentNumber,

        // status
        statusOptions,
        selectedStatus,
        setSelectedStatus,
      }}
    >
      {children}
    </StatusShipmentContext.Provider>
  );
};

export const useStatusShipment = () => {
  const ctx = useContext(StatusShipmentContext);
  if (!ctx) {
    throw new Error(
      "useStatusShipment must be used inside StatusShipmentProvider"
    );
  }
  return ctx;
};
