import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import CryptoJS from "crypto-js";

import { MultiSelect } from "primereact/multiselect";
import Axios from "axios";

import "react-toastify/dist/ReactToastify.css";
import { useRef } from "react";

import { FilterMatchMode } from "primereact/api";
import { Nullable } from "primereact/ts-helpers";

interface Customer {
  StudentBatch?: String;
  StudentClassMode?: String;
  ThearpyAttend?: String;
  TotalThearpyClassCount?: String;
  WeekDaysTiming?: String;
  WeekEndTiming?: String;
  refBranchId?: String;
  refCtEmail?: String;
  refCtMobile?: String;
  refPackageName?: String;
  refSCustId?: String;
  refStFName?: String;
  refStId?: String;
  refStLName?: String;
  refTherapy?: String;
  totalClassCount?: String;
  classAttendCount?: String;
  reCount?: String;
  userType?: String;
  refStSex?: String;
  totalAttendCount?: string;
  onlineCount?: string;

}

type DecryptResult = any;

const ReportPageClass: React.FC = () => {
  const [toDate, _setToDate] = useState<Nullable<Date>>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const [_refUtId, setUtId] = useState("");

  const navigate = useNavigate();
  const decrypt = (
    encryptedData: string,
    iv: string,
    key: string
  ): DecryptResult => {
    // Create CipherParams with ciphertext
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(encryptedData),
    });

    // Perform decryption
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

  // Reference for DataTable
  const dtRef = useRef<any>(null);
  const uniqueClassModes = Array.from(
    new Set(customers.map((item) => item.StudentClassMode))
  ).map((mode) => ({ label: mode, value: mode }));
  const uniqueBatches = Array.from(
    new Set(customers.map((item) => item.StudentBatch))
  ).map((batch) => ({ label: batch, value: batch }));
  const uniqueTherapies = Array.from(
    new Set(customers.map((item) => item.refTherapy))
  ).map((therapy) => ({ label: therapy, value: therapy }));
  const uniqueWeekDaysTimings = Array.from(
    new Set(customers.map((item) => item.WeekDaysTiming))
  ).map((timing) => ({ label: timing, value: timing }));
  const uniqueWeekEndTimings = Array.from(
    new Set(customers.map((item) => item.WeekEndTiming))
  ).map((timing) => ({ label: timing, value: timing }));
  const uniquePackageName = Array.from(
    new Set(customers.map((item) => item.refPackageName))
  ).map((packagename) => ({ label: packagename, value: packagename }));

  const uniqueStudentTypeStatuses = Array.from(
    new Set(customers.map((item) => item.userType))
  ).map((status) => ({ label: status, value: status }));
  const uniqueGenderStatuses = Array.from(
    new Set(customers.map((item) => item.refStSex))
  ).map((status) => ({ label: status, value: status }));

  const classModeFilterTemplate = (options: any) => {
    return (
      <MultiSelect
        value={options.value}
        options={uniqueClassModes}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Select Class Mode"
        showClear
        className="p-column-filter"
      />
    );
  };

  const StudentTypeFilterTemplate = (options: any) => {
    return (
      <MultiSelect
        value={options.value}
        options={uniqueStudentTypeStatuses}
        onChange={(e) => {
          options.filterApplyCallback(e.value);
        }}
        placeholder="Select Option"
        showClear
        className="p-column-filter"
      />
    );
  };
  const GenderFilterTemplate = (options: any) => {
    return (
      <MultiSelect
        value={options.value}
        options={uniqueGenderStatuses}
        onChange={(e) => {
          options.filterApplyCallback(e.value);
        }}
        placeholder="Select Gender"
        showClear
        className="p-column-filter"
      />
    );
  };

  const packageModeFilterTemplate = (options: any) => {
    return (
      <MultiSelect
        value={options.value}
        options={uniquePackageName}
        onChange={(e) => {
          options.filterApplyCallback(e.value);
        }}
        placeholder="Select Option"
        showClear
        className="p-column-filter"
      />
    );
  };
  const batchFilterTemplate = (options: any) => {
    return (
      <MultiSelect
        value={options.value}
        options={uniqueBatches}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Select Batch"
        showClear
        className="p-column-filter"
      />
    );
  };
  const therapyFilterTemplate = (options: any) => {
    return (
      <MultiSelect
        value={options.value}
        options={uniqueTherapies}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Select Therapy"
        showClear
        className="p-column-filter"
      />
    );
  };
  const weekDaysTimingFilterTemplate = (options: any) => {
    return (
      <MultiSelect
        value={options.value}
        options={uniqueWeekDaysTimings}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Select Timing"
        showClear
        className="p-column-filter"
      />
    );
  };
  const weekEndTimingFilterTemplate = (options: any) => {
    return (
      <MultiSelect
        value={options.value}
        options={uniqueWeekEndTimings}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Select Weekend Timing"
        showClear
        className="p-column-filter"
      />
    );
  };

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    trial: { value: null, matchMode: FilterMatchMode.IN },
    StudentClassMode: { value: null, matchMode: FilterMatchMode.IN },
    StudentBatch: { value: null, matchMode: FilterMatchMode.IN },
    refTherapy: { value: null, matchMode: FilterMatchMode.IN },
    WeekDaysTiming: { value: null, matchMode: FilterMatchMode.IN },
    WeekEndTiming: { value: null, matchMode: FilterMatchMode.IN },
    refPackageName: { value: null, matchMode: FilterMatchMode.IN },
    userType: { value: null, matchMode: FilterMatchMode.IN },
    refStSex: { value: null, matchMode: FilterMatchMode.IN },
  });

  const handleDateChange = async (date: any) => {
    try {
      const formattedDate = formatDate(date.value);
      const payload = {
        refMonth: formattedDate,
      };

      console.log("Payload:", payload);

      const response = await Axios.post(
        import.meta.env.VITE_API_URL + "/classInfo/monthWiseReport",
        {
          refMonth: formattedDate,
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
      console.log("Data: line ----- 253", data);

      if (data.token === false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setCustomers(data.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Function to format date to yyyy-mm-dd
  const formatDate = (date: any) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("refUtId");
    if (token) {
      setUtId(token);
    }
  }, []);

  const onGlobalFilterChange = (e: any) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </IconField>
        <div>
          <Calendar
            value={toDate}
            onChange={handleDateChange}
            dateFormat="MM yy"
            view="month"
            showButtonBar
            placeholder="Select Month"
          />
        </div>

        <div className="flex align-items-center justify-content-end gap-2">
          <Button
            label="Export as Excel"
            icon="pi pi-file-excel"
            onClick={() => dtRef.current.exportCSV({ selectionOnly: false })}
            className="p-button-success p-mr-2"
          />
        </div>
      </div>
    );
  };

  const header = renderHeader();
  const nullToDash = (value: any) =>
    value === null || value === undefined ? "-" : value;

  return (
    <div>
      <div className="card" style={{ overflow: "auto" }}>
        <DataTable
          ref={dtRef} // Attach ref to get filtered data
          value={customers}
          paginator
          header={header}
          rows={10}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          rowsPerPageOptions={[10, 25, 50]}
          dataKey="id"
          selectionMode="checkbox"
          scrollable
          selection={selectedCustomers}
          onSelectionChange={(e) => setSelectedCustomers(e.value as Customer[])}
          emptyMessage="No customers found."
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          sortField="refSCustId"
          sortOrder={-1}
          filters={filters}
        >
          <Column
            selectionMode="multiple"
            frozen
            headerStyle={{ minWidth: "3rem" }}
          />
          <Column
            field="refSCustId"
            header="Cust ID"
            frozen
            sortable
            style={{ minWidth: "12rem" }}
          />
          <Column
            field="refStFName"
            header="Name"
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="refCtMobile"
            header="Mobile"
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="userType"
            filter
            sortable
            filterElement={StudentTypeFilterTemplate}
            showFilterMatchModes={false}
            header="Student Type"
            body={(rowData) => nullToDash(rowData.userType)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="refStSex"
            filter
            sortable
            filterElement={GenderFilterTemplate}
            showFilterMatchModes={false}
            header="Gender"
            body={(rowData) => nullToDash(rowData.refStSex)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="StudentClassMode"
            filter
            sortable
            filterElement={classModeFilterTemplate}
            showFilterMatchModes={false}
            header="Class Mode"
            body={(rowData) => nullToDash(rowData.StudentClassMode)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="refPackageName"
            filter
            sortable
            filterElement={packageModeFilterTemplate}
            showFilterMatchModes={false}
            header="Package Name"
            body={(rowData) => nullToDash(rowData.refPackageName)}
            style={{ minWidth: "14rem" }}
          />

          <Column
            field="StudentBatch"
            filter
            sortable
            filterElement={batchFilterTemplate}
            showFilterMatchModes={false}
            header="Batch"
            body={(rowData) => nullToDash(rowData.StudentBatch)}
            style={{ minWidth: "14rem" }}
          />

          <Column
            field="WeekDaysTiming"
            filter
            sortable
            filterElement={weekDaysTimingFilterTemplate}
            showFilterMatchModes={false}
            header="Weekdays Timing"
            body={(rowData) => nullToDash(rowData.WeekDaysTiming)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="WeekEndTiming"
            filter
            sortable
            filterElement={weekEndTimingFilterTemplate}
            showFilterMatchModes={false}
            header="Weekend Timing "
            body={(rowData) => nullToDash(rowData.WeekEndTiming)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="totalclass"
            sortable
            header="Total Class"
            body={(rowData) => nullToDash(rowData.totalClassCount)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="classAttendanceCount"
            sortable
            header="Offline Count"
            body={(rowData) => nullToDash(rowData.classAttendanceCount)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="onlineCount"
            sortable
            header="Online Count"
            body={(rowData) => nullToDash(rowData.onlineCount)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="totalAttendCount"
            sortable
            header="Total Class Attended"
            body={(rowData) => nullToDash(rowData.totalAttendCount)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="reCount"
            sortable
            header="Not Attended Class"
            body={(rowData) => nullToDash(rowData.reCount)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="refTherapy"
            filter
            sortable
            filterElement={therapyFilterTemplate}
            showFilterMatchModes={false}
            header="Therapy"
            body={(rowData) => nullToDash(rowData.refTherapy)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="TotalThearpyClassCount"
            sortable
            header="Therapy Class"
            body={(rowData) => nullToDash(rowData.TotalThearpyClassCount)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="ThearpyAttend"
            sortable
            header="Attended "
            body={(rowData) => nullToDash(rowData.ThearpyAttend)}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="therapynotattended"
            sortable
            header="Remaining "
            body={(rowData) =>
              nullToDash(
                parseInt(
                  rowData.TotalThearpyClassCount
                    ? rowData.TotalThearpyClassCount
                    : 0
                ) - parseInt(rowData.ThearpyAttend ? rowData.ThearpyAttend : 0)
              )
            }
            style={{ minWidth: "14rem" }}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default ReportPageClass;
