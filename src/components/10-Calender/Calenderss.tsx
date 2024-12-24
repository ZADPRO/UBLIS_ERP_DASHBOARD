import React, { useState, useEffect } from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calenderss.css";
import axios from "axios";
import CryptoJS from "crypto-js";

type Attendance = {
  sno: number;
  date: string;
  time: string;
};

type CalenderssProps = {
  selectedUser: any;
  userFilteredAttendanceData: Attendance[];
};

type DecryptResult = any;

const Calenderss: React.FC<CalenderssProps> = ({
  selectedUser,
  userFilteredAttendanceData,
}) => {
  console.log("selectedUser", selectedUser);
  const today = new Date();

  const decrypt = (
    encryptedData: string,
    iv: string,
    key: string
  ): DecryptResult => {
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(encryptedData),
    });

    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      CryptoJS.enc.Hex.parse(key),
      {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  };

  const [events, setEvents] = useState<any[]>([]);

  const sendEventData = async (formattedMonth: string) => {
    try {
      const token = localStorage.getItem("JWTtoken");
      if (!token) {
        return;
      }

      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/attendance/user",
        {
          month: formattedMonth,
        },
        {
          headers: {
            Authorization: localStorage.getItem("JWTtoken"),
            "Content-Type": "application/json",
          },
        }
      );

      const data = decrypt(
        response.data[1],
        response.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );

      console.log("Decrypted data:", data);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const formatDate = (dateString: string): string => {
    // Convert date from dd/mm/yyyy to yyyy-mm-dd
    const [day, month, year] = dateString.split("/");
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
    console.log("userFilteredAttendanceData", userFilteredAttendanceData);

    const transformedEvents = userFilteredAttendanceData
      .filter((attendance) => {
        const isValid = !isNaN(Date.parse(attendance.date));
        if (!isValid) {
          console.warn(`Invalid date detected: ${attendance.date}`);
        }
        return isValid;
      })
      .map((attendance) => ({
        title: "Check-in",
        start: formatDate(attendance.date),
        allDay: true,
      }));

    console.log("transformedEvents", transformedEvents);
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
        validRange={{
          end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
        }}
        events={events}
        dayHeaderClassNames="bg-f95005 text-white font-bold"
        dayCellClassNames="hover:bg-f95005 hover:text-white transition-all cursor-pointer"
      />
    </div>
  );
};

export default Calenderss;
