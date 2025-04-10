import React, { useState, useEffect } from "react";
import { PieChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";

import ManifestTable from "../ui/table";
// import Map from "../ui/map";
import ScheduleCalendar from "../ui/calendar";

import pieData from "../utils/pieData";
import pieOption from "../utils/pieOption";

import { getTotalBoxes } from "../api/reports";
import { getRecentManifest } from "../api/manifest";
import { useLoading } from "../context/useLoading";

const Report = () => {
  const { setLoading } = useLoading();
  const [shipmentNumber, setShipmentNumber] = useState(null);
  const [totalBoxes, setTotalBoxes] = useState([
    {
      destination: "LUZ",
      totalQty: 0,
    },
    {
      destination: "VIS",
      totalQty: 0,
    },
    {
      destination: "MIN",
      totalQty: 0,
    },
    {
      destination: "NCR",
      totalQty: 0,
    },
  ]);

  useEffect(() => {
    setLoading(true);
    getRecentManifest().then(setShipmentNumber);

    getTotalBoxes()
      .then((res) => {
        setTotalBoxes(res);
      })
      .catch((error) => {
        toast.error(`${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-full w-full">
      <main className="h-full w-full flex-1 p-6">
        <h2 className="text-2xl font-bold">Reports</h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {totalBoxes.map((row, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold">{row.destination}</h3>
              <div className="flex items-end">
                <p className="text-3xl font-bold">{row.totalQty}</p>
                <span className="text-sm font-medium ml-2">total boxes</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <PieChart data={pieData} options={pieOption} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <ScheduleCalendar />
          </div>
          <div className="col-span-2  rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="mb-4 font-semibold text-lg">Generate Reports</h3>
            <ManifestTable
              shipmentNumber={shipmentNumber}
              setShipmentNumber={setShipmentNumber}
            />
          </div>
          {/* 
          <div className="grow rounded-lg bg-white p-6 shadow-md">
            <Map />
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default Report;
