import React, { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Search, UserRoundX, UserPen, UserRoundCheck } from "lucide-react";
import toast from "react-hot-toast";

import ConfirmModal from "./confirmModal";
import StaffModal from "./staffModal";

import { updateStatusStaff, updateStaffInfo } from "../api/staff";
import { useLoading } from "../context/useLoading";


const columns = ["NAME", "ROLE", "ACCESS", "STATUS", "ACTIONS"];
const rowLimit = 5;

const StaffTable = ({ staffs = [], setStaffs }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { setLoading } = useLoading();

  const filteredData = useMemo(() => {
    return staffs.filter((staff) =>
      Object.values(staff || {}).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [staffs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowLimit));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowLimit;
    return filteredData.slice(start, start + rowLimit);
  }, [filteredData, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const updateStaffStatus = async () => {
    setLoading(true);
    try {
      if (!selectedStaff) {
        throw new Error("Please select a staff first.");
      }
      selectedStaff.status = selectedStaff.status === "Active" ? "Inactive" : "Active";
      const result = await updateStatusStaff(selectedStaff);

      if (!result.success) {
        throw new Error("Something went wrong. Please try again later.");
      }

      toast.success("Staff status updated succesfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsConfirmOpen(false);
      setLoading(false);
    }
  };

  const updateStaff = async (updatedStaff) => {
   
    setLoading(true);
    try {
      if (!updatedStaff) {
        throw new Error("Please select a staff first.");
      }     
      const result = await updateStaffInfo(updatedStaff);

      if (!result.success) {
        throw new Error("Something went wrong. Please try again later.");
      }

      toast.success("Staff status updated succesfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsModalOpen(false);
      setLoading(false);
      setStaffs((prevStaffs) =>
        prevStaffs.map((staff) =>
          staff.id === updatedStaff.id ? { ...staff, ...updatedStaff } : staff
        )
      );
    }    
  };

  const openEditModal = (staff) => {
    setStaffToEdit(staff);
    setIsModalOpen(true);
  };

  const confirmStatusChange = (staff) => {
    setSelectedStaff(staff);
    setIsConfirmOpen(true);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <StaffModal
        isOpen={isModalOpen}
        staff={staffToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={updateStaff}
      />
      <ConfirmModal
        isOpen={isConfirmOpen}
        message={`Are you sure you want to change the status of this staff to ${
          selectedStaff?.status === "Active" ? "Inactive" : "Active"
        }?`}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={updateStaffStatus}
      />

      <div className="relative h-full overflow-x-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="focus-within:ring-primary mb-4 flex w-full items-center space-x-1 rounded-lg border border-gray-300 px-2 py-1 focus-within:ring-2">
            <Search size={20} className="text-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Role, Access, or Status..."
              className="w-full border-0 p-2 text-xs outline-none focus:ring-0"
            />
          </div>
        </div>

        <table className="w-full border-collapse rounded-lg border border-gray-100">
          <thead className="bg-gray-100/50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="text-md p-3 text-center font-semibold text-black">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, i) => (
              <tr
                key={row.id}
                className={`${i % 2 !== 0 ? "bg-gray-100/50" : "bg-white"} hover:bg-primary/10 cursor-pointer transition delay-25`}
              >
                <td className="text-md p-3 text-center">{row.name}</td>
                <td className="text-md p-3 text-center">{row.role}</td>
                <td className="text-md p-3 text-center">{row.access?.join(", ") || ""}</td>
                <td className="text-md p-3 text-center">
                  <span
                    className={`rounded-lg px-2 py-1 ${
                      row.status === "Active" ? "bg-green-300" : "bg-red-300"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="text-md p-3 text-center flex justify-center gap-2">
                  <button
                    onClick={() => confirmStatusChange(row)}
                    className="cursor-pointer rounded-lg bg-red-300 p-2 hover:bg-red-400"
                  >
                    {row.status === "Active" ? (
                      <UserRoundX size={20} />
                    ) : (
                      <UserRoundCheck size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(row)}
                    className="cursor-pointer rounded-lg bg-blue-300 p-2 hover:bg-blue-400"
                  >
                    <UserPen size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              className="rounded-md border border-gray-300 px-3 py-2 text-xs"
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
              className="rounded-md border border-gray-300 px-3 py-2 text-xs"
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

export default StaffTable;
