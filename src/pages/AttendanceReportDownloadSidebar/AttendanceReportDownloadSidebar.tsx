import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import CryptoJS from "crypto-js";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";

interface SessionType {
  name: string;
  code: number;
}

interface ReportRangeParams {
  name: string;
  code: number;
}

interface AttendanceOption {
  refPaId: number;
  refPackageName: string;
  refTimeId: number;
  refTime: string;
  value: string;
  refSDId: number;
  refDays: string;
}

interface GroupedOption {
  label: string;
  items: {
    label: string;
    value: string;
  }[];
}

type DecryptResult = any;

const AttendanceReportDownloadSidebar: React.FC = () => {
  const [sessionMode, setSessionMode] = useState<SessionType[]>([]);
  const [reportRange, setReportRange] = useState<ReportRangeParams | null>(
    null
  );
  const [date, setDate] = useState<Nullable<Date>>(null);
  const [fromMonth, setFromMonth] = useState<Nullable<Date>>(null);
  const [toMonth, setToMonth] = useState<Nullable<Date>>(null);
  const [groupedDropdownOptions, setGroupedDropdownOptions] = useState<
    GroupedOption[]
  >([]);
  const [attendanceOptions, setAttendanceOptions] =
    useState<AttendanceOption | null>(null);
  const [selectedDropdownValue, setSelectedDropdownValue] = useState<string[]>(
    []
  );

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

  const handleApiCall = async (date: string) => {
    try {
      const sessionCodes = sessionMode.map((s) => s.code);
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/attendance/reportOptions",
        {
          mode: sessionCodes,
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
      setAttendanceOptions(data.options);
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

      handleApiCall(selectedDate);
    } else if (reportRange?.code === 2) {
      handleApiCall("");
    }
  }, [reportRange, date, sessionMode]);

  const groupedData: GroupedOption[] = useMemo(() => {
    if (!attendanceOptions) {
      return [];
    }

    return attendanceOptions.reduce((acc, curr) => {
      const existingGroup = acc.find(
        (group) => group.label === curr.refPackageName
      );
      if (existingGroup) {
        existingGroup.items.push({
          label: `${curr.refTime}`,
          value: curr.value,
        });
      } else {
        acc.push({
          label: curr.refPackageName,
          items: [
            {
              label: `${curr.refTime}`,
              value: curr.value,
            },
          ],
        });
      }
      return acc;
    }, [] as GroupedOption[]);
  }, [attendanceOptions]);

  useEffect(() => {
    setGroupedDropdownOptions(groupedData);
  }, [groupedData]);

  const handleDropdownChange = (e: DropdownChangeEvent) => {
    setSelectedDropdownValue(e.value as string[]);
    console.log("Selected Value:", e.value);
  };

  const groupedItemTemplate = (option: GroupedOption) => {
    return (
      <div className="flex align-items-center">
        <span className="font-bold">{option.label}</span>
      </div>
    );
  };

  const handleDateChange = useCallback((e: { value: Nullable<Date> }) => {
    setDate(e.value);
  }, []);

  return (
    <div className="m-2">
      <label htmlFor="calendar-12h" className="font-bold block mb-2">
        Attendance Report Download
      </label>
      <div className="flex gap-3 mt-3">
        <MultiSelect
          value={sessionMode}
          onChange={(e: DropdownChangeEvent) =>
            setSessionMode(e.value as SessionType[])
          }
          options={session}
          optionLabel="name"
          placeholder="Select Session Types"
          className="w-full md:w-20rem"
        />

        <Dropdown
          value={reportRange}
          onChange={(e: DropdownChangeEvent) => setReportRange(e.value)}
          options={range}
          optionLabel="name"
          placeholder="Select a Report Type"
          className="w-full md:w-20rem"
        />
      </div>

      {reportRange?.code === 1 && (
        <div className="flex gap-3 mt-3">
          <Calendar
            id="buttondisplay"
            placeholder="Select Date"
            value={date}
            className="w-full md:w-20rem"
            dateFormat="dd/mm/yy"
            onChange={handleDateChange}
            showIcon
          />
        </div>
      )}

      {reportRange?.code === 2 && (
        <div className="flex gap-3 mt-3">
          <Calendar
            value={fromMonth}
            onChange={(e) => setFromMonth(e.value as Nullable<Date>)}
            view="month"
            placeholder="From Date"
            className="w-full md:w-20rem"
            showIcon
            dateFormat="mm/yy"
          />
          <Calendar
            value={toMonth}
            onChange={(e) => setToMonth(e.value as Nullable<Date>)}
            view="month"
            placeholder="To Date"
            className="w-full md:w-20rem"
            showIcon
            dateFormat="mm/yy"
          />
        </div>
      )}
      {reportRange && date && groupedDropdownOptions && (
        <div className="flex align-items-center gap-3">
          <MultiSelect
            value={selectedDropdownValue}
            options={groupedDropdownOptions}
            onChange={handleDropdownChange}
            optionLabel="label"
            optionGroupLabel="label"
            optionGroupChildren="items"
            optionGroupTemplate={groupedItemTemplate}
            placeholder="Select Package and Time"
            display="chip"
            className="w-full md:w-20rem mt-3"
          />
          <Button label="Success" className="mt-3" severity="success" />
        </div>
      )}
    </div>
  );
};

export default AttendanceReportDownloadSidebar;
