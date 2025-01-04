import axios from "axios";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { Skeleton } from "primereact/skeleton";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import AttendanceReportDownloadSidebar from "../AttendanceReportDownloadSidebar/AttendanceReportDownloadSidebar";

interface Mode {
  name: string;
  code: number;
}

interface Customer {
  attend_count: string;
  refDays: string;
  refPaID: number;
  refPackageName: string;
  refSDId: number;
  refSessonDays: string;
  refSessionMode: string;
  refTime: string;
  refTimeId: number;
  refTimingId: string;
  user_count: string;
}

type DecryptResult = any;

const SessionTabs: React.FC = () => {
  const [date, setDate] = useState<Nullable<Date>>(new Date());
  const [sessionMode, setSessionMode] = useState<Mode | null>({
    name: "Offline",
    code: 2,
  });

  const [visibleLeft, setVisibleLeft] = useState(false);

  const session: Mode[] = [
    { name: "Online", code: 1 },
    { name: "Offline", code: 2 },
  ];

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state

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

  const fetchData = (selectedDate: Date, mode: Mode) => {
    setLoading(true); // Set loading to true before fetching
    const formattedDate = selectedDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    axios
      .post(
        import.meta.env.VITE_API_URL + "/attendance/session",
        {
          date: formattedDate,
          sessionMode: mode.code,
        },
        {
          headers: {
            Authorization: localStorage.getItem("JWTtoken"),
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        const data = decrypt(
          res.data[1],
          res.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );

        console.log("Decrypted Data:", data);
        setCustomers(data.attendanceCount);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false)); // Set loading to false after fetching
  };

  useEffect(() => {
    if (date && sessionMode) {
      fetchData(date, sessionMode);
    }
  }, [date, sessionMode]);

  const renderHeader = () => {
    const skeletonRows = Array.from({ length: 5 });
    return (
      <div className="flex flex-wrap gap-2 pt-2 pb-2 justify-content-between align-items-center">
        <h3 className="m-0">Customers</h3>
        <Button
          label="View Report"
          severity="success"
          onClick={() => handleRowClick()}
        />
      </div>
    );
  };

  const handleRowClick = async () => {
    setVisibleLeft(true);
  };

  const header = renderHeader();

  return (
    <div className="AttendancePage">
      <div className="card flex flex-wrap gap-3 p-fluid mb-5">
        <div className="">
          <Calendar
            id="buttondisplay"
            value={date}
            placeholder="Choose Date"
            onChange={(e) => {
              if (e.value) setDate(e.value);
            }}
            showIcon
            dateFormat="dd/mm/yy"
          />
        </div>
        <div className="">
          <Dropdown
            value={sessionMode}
            onChange={(e: DropdownChangeEvent) => {
              if (e.value) setSessionMode(e.value);
            }}
            options={session}
            optionLabel="name"
            placeholder="Select a Mode"
            className="w-full md:w-14rem modeDropdown"
          />
        </div>
      </div>
      <DataTable
        value={customers}
        paginator
        header={header}
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        scrollable
        scrollHeight="45vh"
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          frozen
          field="name"
          header="Session"
          body={(rowData: Customer) => (
            <span
              style={{
                cursor: "pointer",
              }}
            >
              {`${rowData.refPackageName} - ${rowData.refTime}`}
            </span>
          )}
          style={{ minWidth: "7rem" }}
        ></Column>
        <Column
          field="user_count"
          header="Enrolled"
          style={{ minWidth: "10rem" }}
        ></Column>
        <Column
          field="attend_count"
          header="Attended"
          style={{ minWidth: "10rem" }}
        ></Column>
        <Column
          field="company"
          header="Not Attended"
          body={(rowData: Customer) => (
            <span>
              {Number(rowData?.user_count || 0) -
                Number(rowData?.attend_count || 0)}
            </span>
          )}
          style={{ minWidth: "10rem" }}
        ></Column>
      </DataTable>
      <Sidebar
        style={{ width: "70%" }}
        visible={visibleLeft}
        position="right"
        onHide={() => setVisibleLeft(false)}
      >
        <AttendanceReportDownloadSidebar />
      </Sidebar>
    </div>
  );
};

export default SessionTabs;
