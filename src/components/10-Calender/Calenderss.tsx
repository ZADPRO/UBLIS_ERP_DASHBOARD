import React, { useState, useEffect, useRef } from "react";
import { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import "./Calenderss.css";

type Attendance = {
  sno: number;
  date: string;
  time: string;
  atten_in: string; // Added key for Online/Offline
};

type User = {
  id: number;
  userName: string;
  userId: string;
  userEmail: string;
  reftime: string;
  refPackageName: string;
};

type CalenderssProps = {
  selectedUser: User | null;
  userFilteredAttendanceData: Attendance[];
  onMonthChange: (month: number, year: number) => void;
};

const Calenderss: React.FC<CalenderssProps> = ({
  selectedUser,
  userFilteredAttendanceData,
  onMonthChange,
}) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);

  const formatDate = (dateString: string): string => {
    const [day, month, year] = dateString.split("/");

    if (!day || !month || !year || isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
      console.error(`Invalid date format: ${dateString}`);
      return "";
    }

    const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    return formattedDate;
  };

  useEffect(() => {
    const transformedEvents = userFilteredAttendanceData
      .map((attendance) => {
        const formattedDate = formatDate(attendance.date);
        if (!formattedDate) return null;
        return {
          title: "Event",
          start: formattedDate,
          allDay: true,
          extendedProps: { time: attendance.time, atten_in: attendance.atten_in },
        };
      })
      .filter((event) => event !== null);

    setEvents(transformedEvents);
  }, [userFilteredAttendanceData]);

  const renderEventContent = (eventInfo: any) => {
    const attendanceMode = eventInfo.event.extendedProps.atten_in;
    const color = attendanceMode === "Online" ? "blue" : "green";

    return (
      <div className="custom-event-content">
        <span className="pi pi-check" style={{ fontSize: "20px", color }}></span>
      </div>
    );
  };

  const handleCalendarChange = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentDate = calendarApi.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      onMonthChange(month, year);
    }
  };

  return (
    <div className="w-full max-h-[75vh] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{ start: "today", center: "title", end: "customPrev,customNext" }}
        customButtons={{
          customPrev: {
            text: "Prev",
            click: () => {
              const calendarApi = calendarRef.current?.getApi();
              if (calendarApi) {
                calendarApi.prev();
                handleCalendarChange();
              }
            },
          },
          customNext: {
            text: "Next",
            click: () => {
              const calendarApi = calendarRef.current?.getApi();
              if (calendarApi) {
                calendarApi.next();
                handleCalendarChange();
              }
            },
          },
        }}
        ref={calendarRef}
        height={"65vh"}
        contentHeight={"auto"}
        events={events}
        eventContent={renderEventContent}
        initialView="dayGridMonth"
        datesSet={handleCalendarChange}
      />
    </div>
  );
};

export default Calenderss;
