import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import { useToast } from "../context/useToast";
import { useLoading } from "../context/useLoading";

import { addSchedule, getSchedules } from "../api/schedule";

const ScheduleCalendar = () => {
  const [schedules, setSchedules] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { setLoading } = useLoading();
  const toast = useToast();
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    time: "",
  });

  const handleDateClick = (arg) => {
    const selectedDate = arg.dateStr;
    setFormData((prev) => ({ ...prev, date: selectedDate }));
    setModalOpen(true);
  };

  const createSchedule = async () => {
    const { title, time, date } = formData;

    if (!title || !time || !date) {
      toast.error("Please fill up title, time and selected date first.");
      return;
    }

    try {
      const result = await addSchedule(title, time, date);

      if (!result.success) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      toast.success("Schedule added!");
      setModalOpen(false);
      setFormData({ date: "", title: "", time: "" });
    } catch (error) {
      toast.error(`${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getSchedules()
      .then((res) => {
        setSchedules(res);
      })
      .catch((err) => {
        toast.error(`${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <FullCalendar
        timeZone="local"
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={schedules}
        dateClick={handleDateClick}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        dayCellDidMount={(info) => {
          info.el.classList.add("cursor-pointer");
        }}
        eventContent={(arg) => {
          return {
            domNodes: [
              Object.assign(document.createElement("div"), {
                className:
                  "overflow-y-auto whitespace-normal max-h-[40px] text-sm",
                innerHTML: `${arg.timeText} : ${arg.event.title}`,
              }),
            ],
          };
        }}
      />

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center 
        justify-center bg-gray-200/50 bg-opacity-40"
      >
        <DialogPanel className="bg-white p-6 rounded-lg max-w-sm w-full">
          <DialogTitle className="text-lg font-semibold mb-4">
            Schedule for {formData.date}
          </DialogTitle>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full border rounded px-2 py-1 mb-3"
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, time: e.target.value }))
            }
            className="w-full border rounded px-2 py-1 mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-3 py-1 cursor-pointer bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={createSchedule}
              className="px-3 py-1 cursor-pointer bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default ScheduleCalendar;
