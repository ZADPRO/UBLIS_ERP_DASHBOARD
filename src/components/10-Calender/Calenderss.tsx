import React, { useState, useEffect, useRef } from "react";
import { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calenderss.css";
import FullCalendar from "@fullcalendar/react";

type Attendance = {
  sno: number;
  date: string;
  time: string;
};

type RowData = {
  refSCustId: string;
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
  handleRowClick: (rowData: RowData, month: string) => void;
};

const Calenderss: React.FC<CalenderssProps> = ({
  selectedUser,
  userFilteredAttendanceData,
  handleRowClick,
}) => {
  const calendarRef: React.MutableRefObject<FullCalendar | null> = useRef(null);
  const [events, setEvents] = useState<EventInput[]>([]);

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

  const today = new Date();

  const [calendarDate, setCalendarDate] = useState({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });

  function getMonthNameFromNumber(monthNumber: number) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long" });
  }

  function adjustMonth(offset: number) {
    const currentDate = new Date(calendarDate.year, calendarDate.month - 1);
    const adjustedDate = new Date(currentDate);
    adjustedDate.setMonth(currentDate.getMonth() + offset);

    console.log(
      getMonthNameFromNumber(adjustedDate.getMonth() + 1),
      adjustedDate.getFullYear()
    );

    console.log(selectedUser);

    if (selectedUser) {
      handleRowClick(
        { refSCustId: selectedUser.userId }, // Pass userId as refSCustId in rowData
        getMonthNameFromNumber(adjustedDate.getMonth() + 1) +
          " " +
          adjustedDate.getFullYear()
      );
    }

    setCalendarDate({
      month: adjustedDate.getMonth() + 1,
      year: adjustedDate.getFullYear(),
    });
  }

  useEffect(() => {
    const transformedEvents = userFilteredAttendanceData
      .map((attendance) => {
        const formattedDate = formatDate(attendance.date);
        if (!formattedDate) return null;
        return {
          title: `<i class="pi pi-check"></i>`,
          start: formattedDate,
          allDay: true,
        };
      })
      .filter((event) => event !== null);

    setEvents(transformedEvents);
  }, [userFilteredAttendanceData]);

  return (
    <div className="w-full h-[75vh] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 m-2">
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
                adjustMonth(-1);
                console.log("Moved to previous month");
              } else {
                console.error("Calendar API is not available");
              }
            },
          },
          customNext: {
            text: "Next",
            click: () => {
              const calendarApi = calendarRef.current?.getApi();
              if (calendarApi) {
                calendarApi.next();
                adjustMonth(1);
                console.log("Moved to next month");
              } else {
                console.error("Calendar API is not available");
              }
            },
          },
        }}
        ref={calendarRef}
        height={"65vh"}
        contentHeight={"auto"}
        events={events}
        dayHeaderClassNames="bg-f95005 text-white font-bold"
        datesSet={(info) => {
          const startDate = info.start;
          const endDate = info.end;
          console.log("View changed: ", startDate, endDate);
        }}
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
