import React, { useState, useEffect } from "react";
import { PieChart } from "@carbon/charts-react";
import toast from "react-hot-toast";
import "@carbon/charts/styles.css";

import { Shipments } from "../ui/filters";
import ScheduleCalendar from "../ui/calendar";

import data from "../utils/pieData";
import pieOption from "../utils/pieOption";

import { getAnalytics } from "../api/reports";

import { useLoading } from "../context/useLoading";
import { useStatusShipment } from "../context/useStatusShipment";
import { useModal } from "../context/useModal";

const Report = () => {
  const { setLoading } = useLoading();
  const {
    shipmentNumber,
    shipmentNumbers,
    setShipmentNumber,
    statusOptions,
  } = useStatusShipment();
  const { showModal } = useModal();

  const [pieData, setPieData] = useState(data)
  const [totalBoxes, setTotalBoxes] = useState([]);

  useEffect(() => {
    setLoading(true);
    if (!shipmentNumber) return;
    getAnalytics(shipmentNumber, statusOptions)
      .then((res) => {
        console.log(res);
        
        setPieData(res.cities)
        if (res.destinations?.length) {
          setTotalBoxes(res.destinations);
        } else {
          setTotalBoxes([
            { destination: "LUZ", totalQty: 0, statusBreakdown: {} },
            { destination: "VIS", totalQty: 0, statusBreakdown: {} },
            { destination: "MIN", totalQty: 0, statusBreakdown: {} },
            { destination: "NCR", totalQty: 0, statusBreakdown: {} },
          ]);
        }
      })
      .catch((error) => {
        toast.error(`${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shipmentNumber]);

  return (
    <div className="flex h-full w-full">
      <main className="h-full w-full flex-1 p-6">
        <div className="flex gap-4">
          <h2 className="text-2xl font-bold">Reports</h2>
          <Shipments
            value={shipmentNumber}
            options={shipmentNumbers}
            label=""
            onChange={setShipmentNumber}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {totalBoxes.map((row, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg
                cursor-pointer 
                transform transition duration-300 ease-in-out
                hover:bg-gray-200 hover:scale-105"
              onClick={() => {
                const destinationData = totalBoxes[index]; // includes statusBreakdown
                showModal({
                  title: `Status Breakdown - ${destinationData.destination}`,
                  content: (
                    <div className="space-y-2">
                      {destinationData.statusBreakdown
                        ? Object.entries(destinationData.statusBreakdown).map(
                          ([status, qty]) => (
                            <div key={status} className="flex justify-between">
                              <span>{status}</span>
                              <span>{qty}</span>
                            </div>
                          )
                        )
                        : "No data available"}
                    </div>
                  ),
                });
              }}
            >

              <h3 className="text-lg font-semibold">{row.destination}</h3>
              <div className="flex items-end">
                <p className="text-3xl font-bold">{row.totalBoxes}</p>
                <span className="text-sm font-medium ml-2">total boxes</span>
              </div>
              <div className="w-full text-right text-xs text-gray-600">click me to see full details</div>
            </div>
          ))}
          {!totalBoxes.length === 0 && <span> No Data</span>}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <PieChart data={pieData} options={pieOption} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <ScheduleCalendar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Report;
