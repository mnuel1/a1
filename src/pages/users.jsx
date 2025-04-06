import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

import StaffModal from '../ui/staffModal';
import StaffTable from '../ui/staffTable';

import { fetchStaffs, addStaff } from '../api/staff';

import { useLoading } from '../context/useLoading';

const Staffs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffs, setStaffs] = useState([])
  const { setLoading } = useLoading()


  useEffect(() => {
    setLoading(true);
    fetchStaffs().then((staffs) => {
      setStaffs(staffs);
      setLoading(false);
    }).catch((error) => {      
      setLoading(false);
    });
  }, []);
  

  const openAddModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {    
    setIsModalOpen(false);
  };

  const handleSaveStaff = async (data) => {
    setLoading(true)
    try {

      const result = await addStaff(data)

      if (!result.success) {
        throw new Error("Something went wrong. Please try again later.");
      }

      toast.success("New staff added successfully")

    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex h-full w-full">
      <StaffModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStaff}
      />

      <div className="relative flex h-full w-full flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Staffs</h2>

          <button
            onClick={openAddModal}
            className="bg-primary hover:bg-primary-hover flex cursor-pointer items-center rounded-lg px-2 py-1 text-white"
          >
            <Plus size={20} />
            <span className="ml-2">Add Staff</span>
          </button>
        </div>
        
        <StaffTable staffs={staffs} setStaffs={setStaffs} />
        
      </div>
    </div>
  );
};

export default Staffs;
