import React, { useState, useEffect } from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calenderss.css";

type Attendance = {
  sno: number;
  date: string;
  time: string;
};

type CalenderssProps = {
  selectedUser: any;
  userFilteredAttendanceData: Attendance[];
};

const Calenderss: React.FC<CalenderssProps> = ({
  selectedUser,
  userFilteredAttendanceData,
}) => {
  const [events, setEvents] = useState<any[]>([]);

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
      return ""; // Return empty string for invalid date
    }

    // Validate month and day ranges
    if (Number(month) < 1 || Number(month) > 12) {
      console.error(`Invalid month value: ${month}`);
      return ""; // Invalid month
    }

    if (Number(day) < 1 || Number(day) > 31) {
      console.error(`Invalid day value: ${day}`);
      return ""; // Invalid day
    }

    const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}`;
    return formattedDate;
  };

  useEffect(() => {
    if (
      !userFilteredAttendanceData ||
      userFilteredAttendanceData.length === 0
    ) {
      console.log("No attendance data available.");
      setEvents([]);
      return;
    }

    console.log("userFilteredAttendanceData:", userFilteredAttendanceData);

    const transformedEvents = userFilteredAttendanceData
      .map((attendance, index) => {
        console.log(`Processing attendance entry #${index + 1}:`, attendance);

        const formattedDate = formatDate(attendance.date);
        if (!formattedDate) {
          console.warn(`Skipping invalid date: ${attendance.date}`);
          return null; // Skip invalid date
        }

        return {
          title: `<i class="pi pi-check"></i>`, // Using PrimeReact icon
          start: formattedDate,
          allDay: true,
          extendedProps: {
            icon: "pi-check", // The icon used in the event
          },
        };
      })
      .filter((event) => event !== null); // Remove invalid events

    console.log("transformedEvents before setting state:", transformedEvents);

    setEvents(transformedEvents);
  }, [userFilteredAttendanceData]);

  return (
    <div className="w-full h-[75vh] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <Fullcalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          start: "today",
          center: "title",
          end: "prev next",
        }}
        height={"65vh"}
        contentHeight={"auto"}
        events={events}
        dayHeaderClassNames="bg-f95005 text-white font-bold"
        dayCellClassNames="hover:bg-f95005 hover:text-white transition-all cursor-pointer"
        eventContent={(eventInfo) => {
          return (
            <div className="fc-event-title">
              <i className="pi pi-check"></i>{" "}
            </div>
          );
        }}
      />
    </div>
  );
};

export default Calenderss;
