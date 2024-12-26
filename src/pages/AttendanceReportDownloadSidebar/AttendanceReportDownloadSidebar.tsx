import React, { useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import CryptoJS from "crypto-js";

interface SessionType {
  name: string;
  code: number;
}

interface ReportRangeParams {
  name: string;
  code: number;
}

type DecryptResult = any;

const AttendanceReportDownloadSidebar: React.FC = () => {
  const [sessionMode, setSessionMode] = useState<SessionType | null>(null);
  const [reportRange, setReportRange] = useState<ReportRangeParams | null>(
    null
  );
  const [date, setDate] = useState<Nullable<Date>>(null);
  const [fromMonth, setFromMonth] = useState<Nullable<Date>>(null);
  const [toMonth, setToMonth] = useState<Nullable<Date>>(null);

  const session: SessionType[] = [
    { name: "Online", code: 1 },
    { name: "Offline", code: 2 },
  ];

  const range: ReportRangeParams[] = [
    { name: "Per Day", code: 1 },
    { name: "Per Month", code: 2 },
  ];

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

  const handleApiCall = async (mode: number, date: string) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/attendance/reportOptions",
        {
          mode: mode,
          date: date,
        },
        {
          headers: {
            Authorization: localStorage.getItem("JWTtoken"),
            "Content-Type": "application/json",
          },
        }
      );

      const data = decrypt(
        res.data[1],
        res.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );

      console.log("Decrypted Data:", data);
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  useEffect(() => {
    if (reportRange?.code === 1 && date) {
      const selectedDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(date);

      handleApiCall(sessionMode?.code || 0, selectedDate);
    } else if (reportRange?.code === 2) {
      handleApiCall(sessionMode?.code || 0, "");
    }
  }, [reportRange, date, sessionMode]);

  return (
    <div className="m-2">
      <label htmlFor="calendar-12h" className="font-bold block mb-2">
        Attendance Report Download
      </label>
      <div className="flex gap-3">
        <Dropdown
          value={sessionMode}
          onChange={(e: DropdownChangeEvent) => setSessionMode(e.value)}
          options={session}
          optionLabel="name"
          placeholder="Select a SessionType"
          className="w-full md:w-14rem"
        />

        <Dropdown
          value={reportRange}
          onChange={(e: DropdownChangeEvent) => setReportRange(e.value)}
          options={range}
          optionLabel="name"
          placeholder="Select a Report Type"
          className="w-full md:w-14rem"
        />
      </div>

      {reportRange?.code === 1 && (
        <div className="flex gap-3 mt-3">
          <Calendar
            id="buttondisplay"
            placeholder="Select Date"
            value={date}
            dateFormat="dd/mm/yy"
            onChange={(e) => setDate(e.value)}
            showIcon
          />
        </div>
      )}

      {reportRange?.code === 2 && (
        <div className="flex gap-3 mt-3">
          <Calendar
            value={fromMonth}
            onChange={(e) => setFromMonth(e.value)}
            view="month"
            placeholder="From Date"
            showIcon
            dateFormat="mm/yy"
          />
          <Calendar
            value={toMonth}
            onChange={(e) => setToMonth(e.value)}
            view="month"
            showIcon
            placeholder="To Date"
            dateFormat="mm/yy"
          />
        </div>
      )}
    </div>
  );
};

export default AttendanceReportDownloadSidebar;
