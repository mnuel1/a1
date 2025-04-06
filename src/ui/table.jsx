import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import Status from './status';
import Shipments from './shipments'

const rowLimit = 5;

const columns = [
  'SHIPMENT NO.',
  'CONTAINER NO.',
  'TRACKING NO.',
  'NAME OF SENDER',
  'CONTACT NO.',
  'AGENT',
  'CONSIGNEE',
  'CONSIGNEE_ADDRESS',
  'CONTACT NO.',
  'BARCODE',
  'DESTINATION',
  '# OF BOXES',
  'STATUS',
];

const ManifestTable = ({ filesData = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('city');

  const filteredData = useMemo(() => {
    return filesData.filter((row) => {
      const queryMatch = Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const statusMatch = selectedStatus
        ? row.STATUS?.toLowerCase() === selectedStatus.toLowerCase()
        : true;

      return queryMatch && statusMatch;
    });
  }, [filesData, searchQuery, selectedStatus]);

  const totalPages = Math.ceil(filteredData.length / rowLimit) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowLimit;
    return filteredData.slice(start, start + rowLimit);
  }, [filteredData, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="my-2 flex w-full gap-2">
        <Status label="Status" onChange={setSelectedStatus} />
        <Shipments label="Shipment No." onChange={setSearchQuery} />
      </div>

      <div className="relative h-full overflow-x-auto">
        <table className="mt-2 w-full table-auto border-collapse rounded-lg border border-gray-100">
          <thead className="bg-gray-100/50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="p-3 text-center text-xs font-normal text-black">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 !== 0 ? 'bg-gray-100/50' : 'bg-white'
                  } hover:bg-primary/10 cursor-pointer transition`}
                >
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="p-3 text-center text-xs font-normal text-black">
                      {val}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-gray-500">
                  There's no data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredData.length > rowLimit && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              className={`rounded-md border border-gray-300 px-3 py-2 text-xs ${
                currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary'
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
                currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary'
              }`}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManifestTable;
