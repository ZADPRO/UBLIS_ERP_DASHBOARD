import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import CryptoJS from "crypto-js";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

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

interface Product {
  id: string | null;
  code: string;
  name: string;
  description: string;
  image: string | null;
  price: number;
  category: string | null;
  quantity: number;
  inventoryStatus: string;
  rating: number;
}

interface Attendance {
  emp_code: string;
  punch_date: string;
  punch_time: string;
  refStFName: string;
  refStLName: string;
  interval_start: string;
  interval_end: string;
}

interface FlattenedData extends Attendance {
  packageName: string;
  sessionMode: string;
  timing: string;
}

const AttendanceReportDownloadSidebar: React.FC = () => {
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Product[]>>(null);
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
  const [attendanceData, setAttendanceData] = useState<FlattenedData[]>([]);

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

  // const formatMonthYear = (date: Nullable<Date>): string => {
  //   return date
  //     ? new Intl.DateTimeFormat("en-GB", {
  //         month: "2-digit",
  //         year: "numeric",
  //       }).format(date)
  //     : "";
  // };

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
  }, [reportRange, date, sessionMode, toMonth]);

  const groupedData: GroupedOption[] = useMemo(() => {
    if (!attendanceOptions || !Array.isArray(attendanceOptions)) {
      return [];
    }

    return attendanceOptions.reduce(
      (acc: GroupedOption[], curr: AttendanceOption) => {
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
      },
      []
    );
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

  const reportAPI = async () => {
    try {
      const refRepDurationFormatted = date
        ? new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }).format(date)
        : "";

      const refRepDuType = reportRange?.code;

      const refSessionMod = sessionMode.map((session) => session.code);

      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/attendance/report",
        {
          refRepDuration: refRepDurationFormatted,
          refRepDuType: refRepDuType,
          refPackageId: selectedDropdownValue,
          refSessionMod: refSessionMod,
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

      const processData = (data: any) => {
        const flattened: FlattenedData[] = data.reportData.map(
          (report: any) => {
            const uniqueKey = `${report.packageName} : ${report.timing} : ${report.sessionMode}`;
            const attendance = report.attendance || [];

            // If attendance exists, map it to FlattenedData
            if (attendance.length > 0) {
              return attendance.map((att: any) => ({
                ...att,
                packageName: uniqueKey,
                sessionMode: report.sessionMode,
                timing: report.timing,
              }));
            }

            return [
              {
                packageName: uniqueKey,
                emp_code: "-",
                punch_date: "-",
                punch_time: "-",
                interval_start: "-",
                interval_end: "-",
                sessionMode: report.sessionMode,
                timing: report.timing,
              },
            ];
          }
        );

        // Flatten the array of arrays
        return flattened.flat();
      };

      // Example usage

      const processedData = processData(data);

      setAttendanceData(processedData);

      // setAttendanceData(flattened);
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  const exportCSV = () => {
    if (!dt.current) return;

    // Prepare the data for export with the packageName included in each row
    const exportData = attendanceData.map((row) => ({
      packageName: row.packageName, // Include package name explicitly
      emp_code: row.emp_code || "-",
      employee_name:
        row.refStFName && row.refStLName
          ? `${row.refStFName} ${row.refStLName}`
          : "-",
      punch_date: row.punch_date || "-",
      punch_time: row.punch_time || "-",
    }));

    // Export as CSV
    const csvContent = exportData
      .map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`) // Enclose each value in quotes for safety
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rightToolbarTemplate = () => {
    return (
      <Button label="Export" className="p-button-help" onClick={exportCSV} />
    );
  };

  const headerTemplate = (data: FlattenedData) => {
    return (
      <div className="flex flex-column">
        <div className="font-bold">{data.packageName}</div>
        <small>Session Mode: {data.sessionMode}</small>
      </div>
    );
  };

  return (
    <div className="m-2">
      <label
        htmlFor="calendar-12h"
        className="font-bold block mb-2 text-[#f95005]"
      >
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
          <Button
            onClick={reportAPI}
            label="Submit"
            className="mt-3"
            severity="success"
          />
        </div>
      )}

      {reportRange &&
        date &&
        attendanceData &&
        groupedDropdownOptions &&
        selectedDropdownValue && (
          <>
            <Toast ref={toast} />
            <div className="card mt-4">
              <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

              <DataTable
                value={attendanceData}
                rowGroupMode="subheader"
                groupRowsBy="packageName"
                sortMode="single"
                ref={dt}
                sortField="packageName"
                sortOrder={1}
                rowGroupHeaderTemplate={headerTemplate}
                scrollable
                scrollHeight="400px"
                tableStyle={{ minWidth: "50rem" }}
              >
                <Column
                  field="emp_code"
                  frozen
                  header="Employee Code"
                  style={{ minWidth: "150px" }}
                ></Column>
                <Column
                  field="refStFName"
                  header="Employee Name"
                  body={(rowData) =>
                    rowData.refStFName && rowData.refStLName
                      ? `${rowData.refStFName} ${rowData.refStLName}`
                      : "-"
                  }
                  style={{ minWidth: "150px" }}
                ></Column>
                <Column
                  field="punch_date"
                  header="Punch Date"
                  style={{ minWidth: "150px" }}
                ></Column>
                <Column
                  field="punch_time"
                  header="Punch Time"
                  style={{ minWidth: "150px" }}
                ></Column>
              </DataTable>
            </div>
          </>
        )}
    </div>
  );
};

export default AttendanceReportDownloadSidebar;
