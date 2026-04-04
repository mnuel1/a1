import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import UserModal from './ui/userModal';
import UsersTable from './ui/usersTable';
import { useUsers } from './hooks/useUsers';
import { useToast } from '../../context/useToast';
import { useLoading } from '../../context/useLoading';

const UsersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: users = [], addUser, isLoading, isFetching } = useUsers();
  const toast = useToast();

  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  const handleSaveUser = async (data) => {
    try {
      await addUser(data);
      toast.success("User added", "New user added successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);

      toast.error(error.message);
    }
  };

  return (
    <div className="flex h-full w-full">
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />

      <div className="relative flex h-full w-full flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Users</h2>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover flex items-center rounded-lg px-2 py-1 text-white"
          >
            <Plus size={20} />
            <span className="ml-2">Add User</span>
          </button>
        </div>

        <UsersTable users={users} setUsers={() => { }} />
      </div>
    </div>
  );
};

export default UsersPage;