import React, { useState, useEffect } from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calenderss.css";
import axios from "axios";
import CryptoJS from "crypto-js";

type DecryptResult = any;

const Calenderss: React.FC = () => {
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

  const [eventData, setEventData] = useState({
    title: "Meeting",
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      10,
      0
    ),
    color: "#f95005",
  });

  const sendEventData = async (formattedMonth: string) => {
    try {
      const token = localStorage.getItem("JWTtoken");
      if (!token) {
        console.error("JWT token is missing.");
        return;
      }
      console.log("Token:", token);

      console.log("Sending event data:", {
        title: eventData.title,
        start: eventData.start,
        color: eventData.color,
        formattedMonth,
      });

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

      console.log("Full response data:", response.data);
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

  useEffect(() => {
    const formattedMonth = today.toLocaleString("default", {
      year: "numeric",
      month: "long",
    });

    sendEventData(formattedMonth);
  }, []);

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
        datesSet={(dateInfo) => {
          const currentDate = new Date();
          if (dateInfo.start.getMonth() > currentDate.getMonth()) {
            alert("You cannot navigate beyond the current month.");
          }

          const currentMonth = dateInfo.view.title.split(" ")[0];
          const currentYear = dateInfo.view.title.split(" ")[1];

          const formattedMonth = new Date(dateInfo.view.title).toLocaleString(
            "default",
            { month: "long", year: "numeric" }
          );

          sendEventData(formattedMonth);

          console.log(
            `Current Month: ${currentMonth}, Current Year: ${currentYear}`
          );
        }}
        dayHeaderClassNames="bg-f95005 text-white font-bold"
        dayCellClassNames="hover:bg-f95005 hover:text-white transition-all cursor-pointer"
        events={[
          {
            title: eventData.title,
            start: eventData.start,
            color: eventData.color,
          },
        ]}
      />
    </div>
  );
};

export default Calenderss;
