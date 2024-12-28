import React, { useState, useEffect, useRef } from "react";
import { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { OverlayPanel } from "primereact/overlaypanel";
import FullCalendar from "@fullcalendar/react";
import "./Calenderss.css";

type Attendance = {
  sno: number;
  date: string;
  time: string;
};

type User = {
  id: number;
  userName: string;
  userId: string;
  userEmail: string;
  refTime: string;
  refPackageName: string;
};

type CalenderssProps = {
  selectedUser: User | null;
  userFilteredAttendanceData: Attendance[];
  onMonthChange: (month: number, year: number) => void; // Add this prop
};

const Calenderss: React.FC<CalenderssProps> = ({
  selectedUser,
  userFilteredAttendanceData,
  onMonthChange, // Destructure the callback prop
}) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const op = useRef<OverlayPanel | null>(null); // OverlayPanel reference for hover

  const formatDate = (dateString: string): string => {
    const [day, month, year] = dateString.split("/");

    if (
      !day ||
      !month ||
      !year ||
      isNaN(Number(day)) ||
      isNaN(Number(month)) ||
      isNaN(Number(year))
    ) {
      console.error(`Invalid date format: ${dateString}`);
      return "";
    }

    if (Number(month) < 1 || Number(month) > 12) {
      console.error(`Invalid month value: ${month}`);
      return "";
    }

    if (Number(day) < 1 || Number(day) > 31) {
      console.error(`Invalid day value: ${day}`);
      return "";
    }

    const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}`;
    return formattedDate;
  };

  useEffect(() => {
    const transformedEvents = userFilteredAttendanceData
      .map((attendance) => {
        const formattedDate = formatDate(attendance.date);
        if (!formattedDate) return null;
        return {
          title: "Event", // Placeholder for event title
          start: formattedDate,
          allDay: true,
          time: attendance.time,
          extendedProps: { time: attendance.time }, // Storing time as extendedProps
        };
      })
      .filter((event) => event !== null);

    setEvents(transformedEvents);
  }, [userFilteredAttendanceData]);

  const renderEventContent = (_eventInfo: any) => {
    return (
      <div className="custom-event-content">
        <span className="pi pi-check" style={{ fontSize: "20px" }}></span>
        {/* Optionally add title here */}
      </div>
    );
  };

  const handleCalendarChange = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentDate = calendarApi.getDate(); // Get current date in view
      const month = currentDate.getMonth() + 1; // Get month (0-based index, so add 1)
      const year = currentDate.getFullYear(); // Get the year
      console.log(`Displayed Month: ${month}, Year: ${year}`);
      onMonthChange(month, year); // Pass the month and year to the parent
    }
  };

  return (
    <div className="w-full max-h-[75vh] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          start: "today",
          center: "title",
          end: "customPrev,customNext",
        }}
        customButtons={{
          customPrev: {
            text: "Prev",
            click: () => {
              const calendarApi = calendarRef.current?.getApi();
              if (calendarApi) {
                calendarApi.prev();
                handleCalendarChange(); // Log the month and year after going to prev
              }
            },
          },
          customNext: {
            text: "Next",
            click: () => {
              const calendarApi = calendarRef.current?.getApi();
              if (calendarApi) {
                calendarApi.next();
                handleCalendarChange(); // Log the month and year after going to next
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
        // Log the month and year when today button is clicked
        datesSet={handleCalendarChange}
      />
    </div>
  );
};

export default Calenderss;
