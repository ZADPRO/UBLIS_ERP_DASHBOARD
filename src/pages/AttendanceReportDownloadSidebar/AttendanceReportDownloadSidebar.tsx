import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import CryptoJS from "crypto-js";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";

import * as XLSX from "xlsx";

interface SessionType {
  name: string;
  code: number;
}

interface ReportRangeParams {
  name: string;
  code: number;
}

// interface AttendanceOption {
//   refPaId: number;
//   refPackageName: string;
//   refTimeId: number;
//   refTime: string;
//   value: string;
//   refSDId: number;
//   refDays: string;
// }

// interface GroupedOption {
//   label: string;
//   items: {
//     label: string;
//     value: string;
//   }[];
// }

type DecryptResult = any;

// interface FlattenedData {
//   refPaId: string;
//   displayName: string;
//   packageName?: string;
// }

interface User {
  refStId: number;
  refSCustId: string;
  refStFName: string;
  refStLName: string;
  refCtMobile: string;
  attendance?: string[];
}

interface PackageData {
  refPaId: number;
  refTime?: any;
  refPackageName: string;
  users: User[];
}

const AttendanceReportDownloadSidebar: React.FC = () => {
  const navigate = useNavigate();

  const dt = useRef<DataTable<PackageData[]>>(null);
  const [sessionMode, setSessionMode] = useState<SessionType[]>([]);
  const [reportType, setReportType] = useState<number>();
  const [reportRange, setReportRange] = useState<ReportRangeParams | null>(
    null
  );
  const [dateChoose, setDateChoose] = useState(false);
  const [date, setDate] = useState<Nullable<Date>>(null);
  const [fromMonth, setFromMonth] = useState<Nullable<Date>>(null);
  const [toMonth, setToMonth] = useState<Nullable<Date>>(null);

  const [reportOptions, setReportOptions] = useState([]);
  const [optionValue, setOptionValue] = useState([]);

  const [attendanceData, setAttendanceData] = useState<
    PackageData[] | undefined
  >([]);
  const [dataDisplay, setDataDisplay] = useState(false);

  const session: SessionType[] = [
    { name: "Online", code: 1 },
    { name: "Offline", code: 2 },
  ];

  const range: ReportRangeParams[] = [
    { name: "Per Day", code: 1 },
    { name: "Per Month", code: 2 },
  ];
  const Type: ReportRangeParams[] = [
    { name: "Package Wise", code: 1 },
    { name: "Time Wise", code: 2 },
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
          reportType: reportType,
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

      console.log("Decrypted Data: line -------  164", data);

      setAttendanceData(data.options);

      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        console.log("data.options", data.options);
        const options = data.options.map((Data: any) => ({
          label: Data.optionName,
          value: Data.optionId,
        }));
        console.log("options", options);
        setReportOptions(options);
      }
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  const flattenExpandedData = (): any[] => {
    return transformedData.flatMap((data: any) =>
      data.users.flatMap((user: any) => {
        if (user.attendance && user.attendance.length > 0) {
          return user.attendance.map((entry: any) => ({
            PackageName: data.refPackageName || data.refTime,
            CustomerID: user.refSCustId,
            FirstName: user.refStFName,
            LastName: user.refStLName,
            refCtMobile: user.refCtMobile,
            Attendance: entry,
          }));
        } else {
          return {
            PackageName: data.refPackageName,
            Timing: data.refTime || "-",
            CustomerID: user.refSCustId,
            FirstName: user.refStFName,
            LastName: user.refStLName,
            refCtMobile: user.refCtMobile,
            Attendance: "Not Attend",
          };
        }
      })
    );
  };

  const exportCSV = () => {
    const exportData = flattenExpandedData();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");

    XLSX.writeFile(workbook, "export.xlsx");
  };

  const rightToolbarTemplate = () => {
    return (
      <Button label="Export" className="p-button-help" onClick={exportCSV} />
    );
  };

  // DATA TABLE

  const [expandedRows, setExpandedRows] = useState<any>(null);

  console.log("attendanceData", attendanceData);
  const transformedData: (PackageData & { displayName: string })[] = (
    attendanceData || []
  ).map((item) => ({
    ...item,
    displayName: item.refPackageName || item.refTime || "-",
  }));

  const rowExpansionTemplate = (data: PackageData) => {
    const userEntries = data.users.map((user) => {
      if (user.attendance && user.attendance.length > 0) {
        return user.attendance.map((entry, index) => ({
          refSCustId: user.refSCustId,
          refStFName: user.refStFName,
          refStLName: user.refStLName,
          refCtMobile: user.refCtMobile,
          attendance: entry,
          key: `${user.refStId}-${index}`,
        }));
      } else {
        return [
          {
            refSCustId: user.refSCustId,
            refStFName: user.refStFName,
            refStLName: user.refStLName,
            refCtMobile: user.refCtMobile,
            attendance: "Not Attend",
          },
        ];
      }
    });

    const flatUserEntries = userEntries.flat();

    return (
      <div className="p-3">
        <DataTable value={flatUserEntries} scrollHeight="250px" scrollable>
          <Column field="refSCustId" header="Customer ID" sortable />
          <Column field="refStFName" header="First Name" sortable />
          <Column field="refStLName" header="Last Name" sortable />
          <Column field="refCtMobile" header="Mobile" sortable />
          <Column
            field="attendance"
            header="Attendance"
            sortable
            body={(rowData) => (
              <span style={{ color: rowData.attendance === "Not Attend" ? "red" : "green" }}>
                {rowData.attendance}
              </span>
            )}
          />
        </DataTable>
      </div>
    );
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
  }, [reportRange, date, sessionMode, toMonth]);

  const handleDateChange = useCallback((e: { value: Nullable<Date> }) => {
    setDate(e.value);
  }, []);

  const reportAPI = async () => {
    try {
      let refRepDurationFormatted;
      if (date) {
        refRepDurationFormatted = date
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
      }

      let fromChooseDate;
      let toChooseDate;

      if (fromMonth && toMonth) {
        console.log("toMonth", toMonth);
        console.log("fromMonth", fromMonth);
        const formatMonthYear = (date: any) =>
          new Intl.DateTimeFormat("en-GB", {
            month: "2-digit",
            year: "numeric",
          }).format(date);

        fromChooseDate = formatMonthYear(fromMonth);
        toChooseDate = formatMonthYear(toMonth);

        console.log("toMonth formatted:", toChooseDate);
        console.log("fromMonth formatted:", fromChooseDate);

        refRepDurationFormatted = fromChooseDate + "," + toChooseDate;
      }

      const refRepDuType = reportRange?.code;

      const refSessionMod = sessionMode.map((session) => session.code);

      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/attendance/report",
        {
          reportType: reportType,
          refRepDuration: refRepDurationFormatted,
          refRepDurationType: refRepDuType,
          refPackageId: optionValue,
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
      console.log("Decrypted Data: line -------- 330 vijay", data);

      if (data.token == false) {
        navigate("/expired");
      } else {
        setDataDisplay(true);
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setAttendanceData(data.attendanceData);
      }
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  return (
    <div className="m-2 w-[100%]  AttendancePage">
      <div className="font-bold block mb-2 text-[#f95005] flex justify-between align-middle">
        <p>Attendance Report Download</p>
        {dataDisplay ? (
          <Button
            onClick={(e) => {
              e.preventDefault();
              setDataDisplay(false);
            }}
            label="Clear"
            className="mt-3"
            severity="success"
            type="submit"
          />
        ) : (
          <></>
        )}
      </div>

      {dataDisplay ? (
        <div className="card mt-4">
          <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>
          <DataTable
            value={transformedData}
            ref={dt}
            scrollHeight="400px"
            expandedRows={expandedRows}
            rowExpansionTemplate={rowExpansionTemplate}
            onRowToggle={(e) => setExpandedRows(e.data)}
            dataKey="refPaId"
            tableStyle={{ minWidth: "60rem" }}
          >
            <Column expander style={{ width: "5rem" }} />
            <Column
              field="displayName"
              header="Package Name / Timing"
              sortable
            />
          </DataTable>
        </div>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reportAPI();
            }}
          >
            <div className="flex w-[100%] justify-center  gap-5 mt-3 ">
              <MultiSelect
                value={sessionMode}
                onChange={(e: DropdownChangeEvent) =>
                  setSessionMode(e.value as SessionType[])
                }
                options={session}
                optionLabel="name"
                placeholder="Select Session Types"
                className="w-[80%] md:w-20rem"
                disabled={dataDisplay}
              />

              <Dropdown
                value={reportType}
                onChange={(e: DropdownChangeEvent) => setReportType(e.value)}
                options={Type}
                optionLabel="name"
                placeholder="Select a Report Type"
                className="w-[80%] md:w-20rem"
                disabled={dataDisplay}
              />
              <Dropdown
                value={reportRange}
                onChange={(e: DropdownChangeEvent) => setReportRange(e.value)}
                options={range}
                optionLabel="name"
                placeholder="Select a Duration Type"
                className="w-[80%] md:w-20rem"
                disabled={dataDisplay}
              />
            </div>

            {reportRange?.code === 1 && (
              <div className="flex justify-around gap-3 mt-3">
                <Calendar
                  id="buttondisplay"
                  placeholder="Select Date"
                  value={date}
                  className="w-full md:w-20rem"
                  dateFormat="dd/mm/yy"
                  onChange={(e) => {
                    handleDateChange(e);
                    setDateChoose(true);
                  }}
                  showIcon
                  disabled={dataDisplay}
                />
              </div>
            )}

            {reportRange?.code === 2 && (
              <div className="flex justify-center gap-3 mt-3">
                <Calendar
                  value={fromMonth}
                  onChange={(e) => setFromMonth(e.value as Nullable<Date>)}
                  view="month"
                  placeholder="Starting Month"
                  className="w-full md:w-20rem"
                  showIcon
                  dateFormat="mm/yy"
                  disabled={dataDisplay}
                />
                <Calendar
                  value={toMonth}
                  onChange={(e) => {
                    setToMonth(e.value as Nullable<Date>);
                    setDateChoose(true);
                  }}
                  view="month"
                  placeholder="Ending Month"
                  className="w-full md:w-20rem"
                  showIcon
                  dateFormat="mm/yy"
                  disabled={dataDisplay}
                />
              </div>
            )}

            {!dateChoose ? (
              <></>
            ) : (
              <div className="flex justify-center align-items-center mt-3 gap-3">
                <MultiSelect
                  value={optionValue}
                  onChange={(e) => {
                    setOptionValue(e.value);
                  }}
                  options={reportOptions}
                  optionLabel="label"
                  display="chip"
                  placeholder="Select Package or Timing"
                  maxSelectedLabels={3}
                  className="w-full md:w-20rem"
                  required
                  disabled={dataDisplay}
                />
              </div>
            )}

            {!dateChoose ? (
              <></>
            ) : (
              <div className="flex justify-center align-middle ">
                <Button
                  // onClick={reportAPI}
                  label="Submit"
                  className="mt-3 w-[20%]"
                  severity="success"
                  type="submit"
                />
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default AttendanceReportDownloadSidebar;
