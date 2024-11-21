import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import CryptoJS from "crypto-js";

import { TabView, TabPanel } from "primereact/tabview";

import Axios from "axios";

import { FilterMatchMode } from "primereact/api";

interface Customer {
  id: string;
  userId: string;
  fname: string;
  lname: string;
  email: string;
  date: string;
  mobile: string;
  refStDOB: string;
  refStFName: string;
  refCtEmail: string;
  refStLName: string;
  comments?: string;
  commentEnabled?: boolean;
}

interface HistoryData {
  userid: string;
  id: string;
  changes: string;
  olddata: string;
  newdata: string;
  timing: string;
}

interface ApprovalData {
  userid: string;
  id: string;
  changes: string;
  label: string;
  olddata: string;
  newdata:
    | {
        content?: string;
      }
    | any;
  timing: string;
}

// interface UserDetails {
//   id: string;
//   userid: string;
//   changes: string;
//   olddata: string;
//   newdata: string;
//   transactioncount: string;
//   changedby: string;
//   branch: string;
// }

type DecryptResult = any;

export default function Notify(selectedType: any) {
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

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [visibleLeft, setVisibleLeft] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const [historyData, setHistoryData] = useState<HistoryData[]>([]);

  const [ApprovalData, setApprovalData] = useState<ApprovalData[]>([]);

  // Filters state
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  // Function to fetch customers
  const fetchCustomers = async () => {
    try {
      let url = "/director/userAuditList";

      if (selectedType.selectedType === "Staff") {
        url = "/director/staffAuditList";
      }

      setCustomers([]);

      console.log(url);

      const response = await Axios.get(import.meta.env.VITE_API_URL + url, {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json",
        },
      });

      const data = decrypt(
        response.data[1],
        response.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      console.log("response ---------", data);
      const fetchedCustomers: Customer[] = data.data.map((customer: any) => ({
        id: customer.refStId,
        userId: customer.refSCustId,
        fname: customer.refStFName + " " + customer.refStLName,
        lname: customer.refStLName,
        transactioncount: customer.unreadCount,
        changedby: customer.groupType,
        branch: customer.branchId,
        requestdate: customer.refDate,
        requesttime: customer.refTime,
      }));
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const readDocument = (rowData: ApprovalData) => {
    if (!rowData.newdata.content) {
      return <>{rowData.newdata}</>;
    }

    if (rowData.newdata.content) {
      return (
        <>
          <Button
            type="button"
            severity="success"
            onClick={() => {
              const content = rowData.newdata?.content;
              const filename = rowData.label + ".pdf";

              if (content) {
                const byteCharacters = atob(content);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });

                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.click();

                URL.revokeObjectURL(link.href);
              }
            }}
            label="Download"
          />
        </>
      );
    }
  };

  const fetchuserApprovalList = async (id: string) => {
    console.log(id);

    setApprovalData([]);

    try {
      const payload = {
        refStId: id,
      };
      // console.log("payload", payload);

      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/director/userDataListApproval`,
        payload,
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
      console.log("zdhd", data);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      const fetchedCustomers: ApprovalData[] = data.data.map(
        (ApprovalData: any) => ({
          userid: ApprovalData.refStId,
          id: ApprovalData.refTeId,
          label: ApprovalData.refChanges.label,
          olddata: ApprovalData.refChanges.data.oldValue,
          newdata: ApprovalData.refChanges.data.newValue,
          timing: ApprovalData.refTime,
        })
      );

      setApprovalData(fetchedCustomers);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const rejectallbtn = () => {
    const value = ApprovalData.map((element) => element.id);
    setVisibleLeft(false);

    const id = ApprovalData[0].userid;

    rejectData(value, id);
  };

  const approveallbtn = () => {
    const value = ApprovalData.map((element) => element.id);
    setVisibleLeft(false);

    const id = ApprovalData[0].userid;

    aprroveData(value, id);
  };

  const OverallBtn = (rowData: ApprovalData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-check"
          rounded
          severity="success"
          aria-label="Approve"
          onClick={() => {
            let value = [parseInt(rowData.id)];
            let id = rowData.userid;

            aprroveData(value, id);
          }}
        />

        <Button
          icon="pi pi-times"
          rounded
          severity="danger"
          aria-label="Cancel"
          onClick={() => {
            let value = [parseInt(rowData.id)];

            rejectData(value, rowData.userid);
          }}
        />
      </div>
    );
  };

  const rejectData = async (value: any, id: any) => {
    try {
      const payload = {
        userAppId: value,
        refStId: id,
      };

      console.log(value);

      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/director/userDataUpdateRejectBtn`,
        payload,
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

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      await fetchuserApprovalList(id);

      if (ApprovalData.length > 1) {
        fetchuserApprovalList(id);
      } else {
        setVisibleLeft(false);
      }

      fetchCustomers();
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const aprroveData = async (value: any, id: any) => {
    try {
      const payload = {
        userAppId: value,
        refStId: id,
      };

      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/director/userDataUpdateApprovalBtn`,
        payload,
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

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      await fetchuserApprovalList(id);

      if (ApprovalData.length > 1) {
        fetchuserApprovalList(id);
      } else {
        setVisibleLeft(false);
      }

      fetchCustomers();
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchUserDetails = async (id: string) => {
    try {
      const payload = {
        refStId: id,
      };
      // console.log("payload", payload);

      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/director/userUpdateAuditList`,
        payload,
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

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      const fetchedCustomers: HistoryData[] = data.data.map(
        (HistoryData: any) => {
          const transData = JSON.parse(HistoryData.transData);
          return {
            userid: HistoryData.refStId,
            id: HistoryData.transId,
            changes: HistoryData.transTypeText,
            olddata: transData.data.oldValue,
            newdata: transData.data.newValue,
            timing: HistoryData.transTime,
          };
        }
      );

      setHistoryData(fetchedCustomers);

      console.log("History Data ---------------------", response);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [selectedType]);

  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(customers);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAsExcelFile(excelBuffer, "customers");
    });
  };

  const saveAsExcelFile = (buffer: Uint8Array, fileName: string) => {
    import("file-saver").then((module) => {
      if (module && module.default) {
        const EXCEL_TYPE =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const EXCEL_EXTENSION = ".xlsx";
        const data = new Blob([buffer], { type: EXCEL_TYPE });

        module.default.saveAs(
          data,
          `${fileName}_export_${new Date().getTime()}${EXCEL_EXTENSION}`
        );
      }
    });
  };

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

        <div className="flex align-items-center justify-content-end gap-2">
          <Button
            type="button"
            severity="success"
            onClick={exportExcel}
            data-pr-tooltip="XLS"
          >
            Export As Excel
          </Button>
        </div>
      </div>
    );
  };

  const onUserIdClick = (id: string, rowData: string) => {
    setSelectedUserId(rowData);
    fetchUserDetails(id);
    fetchuserApprovalList(id);
    setVisibleLeft(true);
  };

  const userIdTemplate = (rowData: Customer) => {
    return (
      <Button
        label={rowData.userId}
        className="p-button-link"
        style={{ textAlign: "start" }}
        onClick={() => onUserIdClick(rowData.id, rowData.userId)}
      />
    );
  };

  const readHistory = (rowData: HistoryData) => {
    return (
      <Button
        label="Read"
        onClick={() => {
          let value = [parseInt(rowData.id)];

          HandleReadMessage(value);
        }}
      />
    );
  };

  const readAllHistory = () => {
    const value = historyData.map((element) => element.id);
    setVisibleLeft(false);

    HandleReadMessage(value);
  };

  const HandleReadMessage = async (value: any) => {
    try {
      const payload = {
        transId: value,
      };

      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/director/userUpdateAuditListRead`,
        payload,
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

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      if (historyData[0].userid) {
        fetchUserDetails(historyData[0].userid);
      } else {
        setVisibleLeft(false);
      }

      fetchCustomers();
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const header = renderHeader();

  return (
    <div className="card" style={{ overflow: "auto" }}>
      <DataTable
        value={customers}
        paginator
        header={header}
        rows={10}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        rowsPerPageOptions={[10, 25, 50]}
        dataKey="id"
        selectionMode="checkbox"
        selection={selectedCustomers}
        onSelectionChange={(e) => {
          const customers = e.value as Customer[];
          setSelectedCustomers(customers);
        }}
        emptyMessage="No customers found."
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        sortField="userId"
        sortOrder={-1}
        filters={filters}
      >
        <Column
          selectionMode="multiple"
          frozen
          headerStyle={{ inlineSize: "3rem" }}
        />
        <Column
          field="userId"
          header="User ID"
          body={userIdTemplate}
          frozen
          sortable
          filterPlaceholder="Search by User ID"
          style={{ inlineSize: "14rem" }}
        />
        <Column
          field="fname"
          header="Name"
          sortable
          style={{ inlineSize: "14rem" }}
        />
        <Column
          field="changedby"
          header="Changed By"
          sortable
          style={{ inlineSize: "14rem", textTransform: "capitalize" }}
        />

        <Column
          field="branch"
          header="Branch"
          sortable
          style={{ inlineSize: "14rem", textTransform: "capitalize" }}
        />

        <Column
          field="transactioncount"
          header="Transaction Count"
          sortable
          style={{ inlineSize: "14rem", textTransform: "capitalize" }}
        />
        <Column
          field="requestdate"
          header="Request Date"
          sortable
          style={{ inlineSize: "14rem" }}
          filterPlaceholder="Search by Mobile"
        />
        <Column
          field="requesttime"
          header="Request Time"
          sortable
          style={{ inlineSize: "14rem" }}
        />
      </DataTable>

      <Sidebar
        visible={visibleLeft}
        position="right"
        onHide={() => setVisibleLeft(false)}
        className="w-[90vw] lg:w-[70vw]"
        // style={{ inlineSize: "60vw" }}
      >
        <h2>User Details</h2>
        <div className="flex justify-start items-center">
          <p>
            {selectedUserId ? `User ID: ${selectedUserId}` : "No user selected"}
          </p>
        </div>

        <TabView>
          <TabPanel header="Request">
            <div className="flex justify-end">
              <div className="card pb-3 flex gap-x-3 justify-content-center">
                <Button
                  severity="danger"
                  className="h-10 p-0"
                  label="Reject All"
                  onClick={rejectallbtn}
                />
                <Button
                  severity="success"
                  className="h-10 p-0"
                  label="Approve All"
                  onClick={approveallbtn}
                />
              </div>
            </div>

            <div className="card">
              <DataTable
                paginator
                rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[10, 25, 50]}
                dataKey="id"
                value={ApprovalData}
                tableStyle={{ minWidth: "50rem" }}
              >
                <Column field="id" header="ID"></Column>
                <Column field="label" header="Changes Column"></Column>
                <Column field="olddata" header="Old Data"></Column>
                <Column
                  field="id"
                  body={readDocument}
                  header="New Data"
                ></Column>
                <Column field="timing" header="Data & Time"></Column>
                <Column
                  field="id"
                  body={OverallBtn}
                  header="Approve / Reject"
                ></Column>
                {/* <Column field="id" body={aprrovebtn} header="Aprrove"></Column> */}
              </DataTable>
            </div>
          </TabPanel>
          <TabPanel header="History">
            <div className="flex mb-3 justify-end items-center">
              <Button onClick={readAllHistory} label="Read All" />
            </div>
            <DataTable
              paginator
              rows={10}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              dataKey="id"
              value={historyData}
              tableStyle={{ minWidth: "50rem" }}
            >
              <Column field="id" header="ID"></Column>
              <Column field="changes" header="Changes Column"></Column>
              <Column field="olddata" header="Old Data"></Column>
              <Column field="newdata" header="New Data"></Column>
              <Column field="timing" header="Data & Time"></Column>
              <Column field="id" body={readHistory} header="Read"></Column>
            </DataTable>
          </TabPanel>
        </TabView>
      </Sidebar>
    </div>
  );
}
