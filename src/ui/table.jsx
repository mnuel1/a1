import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getDeliveries } from "../api/manifest";
import Status from "./status";
import Shipments from "./shipments";

const rowLimit = 5;

const columns = [
  "SHIPMENT NO.",
  "CONTAINER NO.",
  "TRACKING NO.",
  "NAME OF SENDER",
  "SENDER CONTACT NO.",
  "AGENT",
  "CONSIGNEE",
  "CONSIGNEE_ADDRESS",
  "CONTACT NO.",
  "BARCODE",
  "DESTINATION",
  "# OF BOXES",
  "STATUS",
];

const mapToColumns = (row) => ({
  "SHIPMENT NO.": row.shipments?.shipment_number,
  "CONTAINER NO.": row.shipments?.container_number,
  "TRACKING NO.": row.tracking_number,
  "NAME OF SENDER": row.shipper_name,
  "SENDER CONTACT NO.": row.shipper_ctc,
  AGENT: row.agent,
  CONSIGNEE: row.consignee || "N/A",
  CONSIGNEE_ADDRESS: row.consignee_address,
  "CONTACT NO.": row.consignee_ctc || "N/A",
  BARCODE: row.barcode_no,
  DESTINATION: row.destination,
  "# OF BOXES": row.qty,
  STATUS: row.status || "N/A",
});

const ManifestTable = ({ shipmentNumber, setShipmentNumber, isFull }) => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deliveries, setDeliveries] = useState([]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    getDeliveries(
      {
        status: selectedStatus,
        shipment_number: shipmentNumber,
      },
      currentPage,
      rowLimit
    ).then(({ data, totalCount }) => {
      setDeliveries(data);
      setTotalPages(Math.ceil(totalCount / rowLimit));
    });
  }, [selectedStatus, shipmentNumber, currentPage]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="my-2 flex items-center w-full gap-2">
        <Status label="Status" onChange={setSelectedStatus} />
        <Shipments
          value={shipmentNumber}
          label="Shipment No."
          onChange={setShipmentNumber}
        />
      </div>

      <div className="relative h-full overflow-x-auto">
        <table className="mt-2 w-full table-auto border-collapse rounded-lg border border-gray-100">
          <thead className="bg-gray-100/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-3 text-center text-xs font-normal text-black"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deliveries.length > 0 ? (
              deliveries.map((row, i) => {
                const mappedRow = mapToColumns(row);
                return (
                  <tr
                    key={i}
                    className={`${
                      i % 2 !== 0 ? "bg-gray-100/50" : "bg-white"
                    } hover:bg-primary/10 cursor-pointer transition`}
                  >
                    {columns.map((col, j) => (
                      <td
                        key={j}
                        className="p-3 text-center text-xs font-normal text-black"
                      >
                        {mappedRow[col]}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-gray-500">
                  There's no data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {isFull ? (
          totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                className={`rounded-md border border-gray-300 px-3 py-2 text-xs ${
                  currentPage === 1
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-primary"
                }`}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={10} />
              </button>

              <input
                type="number"
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
                min="1"
                max={totalPages}
                className="w-10 rounded-md border border-gray-300 px-2 py-1 text-center focus:outline-none"
              />
              <span className="text-sm text-gray-600">/ {totalPages}</span>

              <button
                onClick={() => goToPage(currentPage + 1)}
                className={`rounded-md border border-gray-300 px-3 py-2 text-xs ${
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-primary"
                }`}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={10} />
              </button>
            </div>
          )
        ) : (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/full-manifest")}
              className="text-sm text-blue-500 hover:underline"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManifestTable;
