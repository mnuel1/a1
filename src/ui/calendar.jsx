import React, { useEffect, useRef } from 'react';
import Calendar from '@event-calendar/core';
import DayGrid from '@event-calendar/day-grid';
import "@event-calendar/core/index.css";


const ScheduleCalendar = () => {
  const calendarRef = useRef(null);
  const calendarInstanceRef = useRef(null); // To store and destroy calendar later

  useEffect(() => {
    const plugins = [DayGrid];
    const options = {
      view: 'dayGridMonth',
      events: [
        // Example events
        { title: 'Meeting', start: '2025-04-10' },
        { title: 'Conference', start: '2025-04-15' },
      ],
    };

    if (calendarRef.current) {
      calendarInstanceRef.current = new Calendar({
        target: calendarRef.current,
        props: {
          plugins,
          options,
        },
      });
    }

    return () => {
      if (calendarInstanceRef.current) {
        calendarInstanceRef.current.$destroy();
      }
    };
  }, []);

  return <div ref={calendarRef} />;
};

export default ScheduleCalendar;
