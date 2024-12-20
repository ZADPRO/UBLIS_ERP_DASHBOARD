import React from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calenderss.css"; // Add a custom CSS file for additional styling

const Calenderss: React.FC = () => {
  const today = new Date();

  return (
    <div className="w-full h-[75vh] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <Fullcalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          start: "today", // Left
          center: "title", // Center
          end: "prev next", // Right
        }}
        height={"65vh"}
        contentHeight={"auto"}
        validRange={{
          end: new Date(today.getFullYear(), today.getMonth() + 1, 0), // End of the current month
        }}
        datesSet={(dateInfo) => {
          // Prevent going beyond the current month
          const currentDate = new Date();
          if (dateInfo.start.getMonth() > currentDate.getMonth()) {
            alert("You cannot navigate beyond the current month.");
          }
        }}
        dayHeaderClassNames="bg-f95005 text-white font-bold" // Custom header styling
        dayCellClassNames="hover:bg-f95005 hover:text-white transition-all cursor-pointer"
        events={[
          {
            title: "Meeting",
            start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
            color: "#f95005",
          },
        ]}
      />
    </div>
  );
};

export default Calenderss;
