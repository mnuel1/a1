import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Search,
  UserRoundX,
  UserPen,
  UserRoundCheck,
} from "lucide-react";

import UserModal from "./userModal";
import { useUsers } from "../hooks/useUsers";

import { useToast } from "../../../context/useToast";
import { useLoading } from "../../../context/useLoading";
import { useModal } from "../../../context/useModal";

import { confirmUserStatusChange } from "../../../ui/modals";

const columns = ["NAME", "ROLE", "STATUS", "ACTIONS"];
const rowLimit = 5;

const UTable = ({ users = [], title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { updateUser, updateUserStatus } = useUsers();
  const { setLoading } = useLoading();
  const { showModal } = useModal();
  const toast = useToast();

  const filteredData = useMemo(() => {
    return users.filter((user) =>
      Object.values(user || {}).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowLimit));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowLimit;
    return filteredData.slice(start, start + rowLimit);
  }, [filteredData, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const updateUserInfo = async (user) => {
    setLoading(true);
    try {
      await updateUser(user);
      toast.success("User updated successfully.", "User information has been updated.");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsModalOpen(false);
      setLoading(false);
    }
  };

  const confirmStatusChange = async (user) => {
    await confirmUserStatusChange(showModal, user, async () => {
      setLoading(true);
      try {
        const updated = {
          ...user,
          status: user.status === "Active" ? "Inactive" : "Active",
        };

        await updateUserStatus(updated);
        toast.success("User status updated successfully.", `User is now ${updated.status}.`);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    });
  };

  const openEditModal = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        user={userToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={updateUserInfo}
      />

      <div className="relative h-full overflow-x-auto p-4">
        {/* Search */}
        <div className="mb-4 flex items-center justify-between">
          <div className="focus-within:ring-primary flex w-full items-center space-x-1 rounded-lg border border-gray-300 px-2 py-1 focus-within:ring-2">
            <Search size={20} className="text-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${title || "data"}...`}
              className="w-full border-0 p-2 text-xs outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse rounded-lg border border-gray-100">
          <thead className="bg-gray-100/50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="p-3 text-center text-md font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row, i) => (
              <tr
                key={row.id}
                className={`${
                  i % 2 ? "bg-gray-100/50" : "bg-white"
                } hover:bg-primary/10 cursor-pointer`}
              >
                <td className="p-3 text-center">{row.name}</td>
                <td className="p-3 text-center">{row.role}</td>

                <td className="p-3 text-center">
                  <span
                    className={`rounded-lg px-2 py-1 ${
                      row.status === "Active"
                        ? "bg-green-300"
                        : "bg-red-300"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>

                <td className="flex justify-center gap-2 p-3">
                  {/* Toggle Status */}
                  <button
                    onClick={() => confirmStatusChange(row)}
                    className="rounded-lg bg-red-300 p-2 hover:bg-red-400"
                  >
                    {row.status === "Active" ? (
                      <UserRoundX size={20} />
                    ) : (
                      <UserRoundCheck size={20} />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(row)}
                    className="rounded-lg bg-blue-300 p-2 hover:bg-blue-400"
                  >
                    <UserPen size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border px-3 py-2 text-xs"
            >
              <ChevronLeft size={10} />
            </button>

            <input
              type="number"
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              min="1"
              max={totalPages}
              className="w-10 rounded-md border text-center"
            />

            <span className="text-sm text-gray-600">/ {totalPages}</span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border px-3 py-2 text-xs"
            >
              <ChevronRight size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const UsersTable = ({ users = [] }) => {
  const admins = useMemo(
    () => users.filter((u) => u.role?.toLowerCase() === "admin"),
    [users]
  );

  const staff = useMemo(
    () => users.filter((u) => u.role?.toLowerCase() === "staff"),
    [users]
  );

  const agents = useMemo(
    () => users.filter((u) => u.role?.toLowerCase() === "agent"),
    [users]
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-md border border-gray-200 p-4">
        <h2 className="mb-2 text-xl font-bold">Admins</h2>
        <UTable users={admins} title="Admins" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-md border border-gray-200 p-4">
          <h2 className="mb-2 text-xl font-bold">Staff</h2>
          <UTable users={staff} title="Staff" />
        </div>

        <div className="rounded-md border border-gray-200 p-4">
          <h2 className="mb-2 text-xl font-bold">Agents</h2>
          <UTable users={agents} title="Agents" />
        </div>
      </div>
    </div>
  );
};

export default UsersTable;