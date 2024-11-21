import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import Axios from "axios";

import { Sidebar } from "primereact/sidebar";

import { FilterMatchMode } from "primereact/api";
import CryptoJS from "crypto-js";
import UserProfileView from "../UserProfileView/UserProfileView";

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
  refStSex: string;
  refQualification: string;
  refHeight: string;
  refBlood: string;
  refWeight: string;
  refOccupation: string;
  refStLName: string;
  nextStatus: string;
  currentStatus: string;
  comments?: string;
  commentEnabled?: boolean;
}

interface UserDetails {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: string;
  rating: number;
}

type DecryptResult = any;

const statusMapping: Record<number, string> = {
  2: "Registered",
  3: "Trial",
  6: "Payment Pending",
  7: "Student",
  9: "Rejected",
};

export default function TherapistTable() {
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
  const [userDetails, setUserDetails] = useState<Customer | null>(null);
  const [UserDetailss, setUserDetailss] = useState<UserDetails[]>([]);

  console.log("testing", UserDetailss, userDetails);
  const [therapyStatus, setTherapyStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  // Filters state
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Function to fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await Axios.get(
        import.meta.env.VITE_API_URL + `/therapist/approvalData`,
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

      const fetchedCustomers: Customer[] = data.data.map((customer: any) => ({
        id: customer.refStId,
        userId: customer.refSCustId,
        fname: customer.refStFName + " " + customer.refStLName,
        lname: customer.refStLName,
        email: customer.refCtEmail || "",
        date: customer.transTime || "",
        mobile: customer.refCtMobile,
        comments: "",
        commentEnabled: false, // Default value for commentEnabled
        refUtId: customer.refUtId, // Get the refUtId from the response
        currentStatus: statusMapping[customer.refUtId], // Set current status based on refUtId
        nextStatus: getNextStatus(customer.refUtId), // Set next status based on current status
      }));
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Function to get the next status based on current status
  const getNextStatus = (refUtId: number): string | null => {
    switch (refUtId) {
      case 2:
        return "Trial"; // Next status after "Registered"
      case 3:
        return "Payment Pending"; // Next status after "Trial"
      case 6:
        return "Student"; // Next status after "Payment Pending"
      case 7:
        return null; // No next status after "Student"
      case 9:
        return null; // No next status after "Rejected"
      default:
        return null; // Handle any unknown status
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleApprove = async (customer: Customer) => {
    console.log("customer", customer);
    try {
      const therapyChecked = therapyStatus[customer.id] || false;
      console.log(`Customer ID: ${customer.id}, Therapy: ${therapyChecked}`);
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/therapist/approvalButton`,
        {
          refStId: customer.id,
          isTherapy: therapyChecked,
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

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
      fetchCustomers();
    } catch (error) {
      console.error("Error approving customer:", error);
    }
  };

  const fetchUserDetails = async (id: string) => {
    try {
      const payload = {
        refStId: id,
      };
      console.log("payload", payload);

      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/director/userData`,
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

      console.log("API response:", data);

      const userData = data.data.userTransaction;
      const userDetails = data.data.UserData[0];

      console.log("userDetails", userDetails);
      setUserDetails(userDetails);

      console.log("userData", userData);
      setUserDetailss(userData);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const onUserIdClick = (id: string) => {
    setSelectedUserId(id);
    fetchUserDetails(id);

    setVisibleLeft(true);
  };

  const userIdTemplate = (rowData: Customer) => {
    return (
      <Button
        label={rowData.userId}
        className="p-button-link"
        style={{ textAlign: "start" }}
        onClick={() => onUserIdClick(rowData.id)}
      />
    );
  };

  const statusBodyTemplate = (rowData: Customer) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-check"
          rounded
          severity="success"
          aria-label="Approve"
          onClick={() => handleApprove(rowData)}
        />

        <Button
          icon="pi pi-times"
          rounded
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleReject(rowData.id)}
        />
      </div>
    );
  };

  const handleReject = async (id: any) => {
    const response = await Axios.post(
      import.meta.env.VITE_API_URL + `/staff/rejectionbtn`,
      {
        refStId: id,
        comment: "Rejected By Therapist",
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

    localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

    if (data.success) {
      fetchCustomers();
    }
  };

  const handleTherapyCheckboxChange = (e: any, customerId: any) => {
    setTherapyStatus({
      ...therapyStatus,
      [customerId]: e.target.checked,
    });
  };

  const therapyCheckboxTemplate = (rowData: any) => {
    return (
      <input
        type="checkbox"
        checked={therapyStatus[rowData.id] || false}
        onChange={(e) => handleTherapyCheckboxChange(e, rowData.id)}
        style={{
          transform: "scale(1.5)",
        }}
      />
    );
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
        filters={filters}
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      >
        <Column
          selectionMode="multiple"
          frozen
          headerStyle={{ inlineSize: "3rem" }}
        />
        <Column
          field="userId"
          header="Customer Id"
          body={userIdTemplate}
          frozen
          style={{ inlineSize: "18rem" }}
        />
        <Column
          field="fname"
          header="Name"
          frozen
          style={{ inlineSize: "18rem" }}
        />
        <Column
          field="mobile"
          header="Mobile"
          style={{ inlineSize: "14rem" }}
          filterPlaceholder="Search by Mobile"
        />
        <Column
          field="email"
          header="Email"
          filter
          style={{ inlineSize: "14rem" }}
        />
        <Column
          field="date"
          header="Application Submitted"
          filterField="date"
          dataType="date"
          style={{ inlineSize: "23rem" }}
        />
        <Column
          field="therapy"
          header="Therapy"
          body={therapyCheckboxTemplate}
          style={{
            inlineSize: "9rem",
          }}
        />

        {/* <Column
          field="currentStatus"
          header="Current Status"
          filter
          style={{ inlineSize: "14rem" }}
        /> */}
        <Column
          header="Approved / Rejected"
          body={statusBodyTemplate}
          style={{ inlineSize: "20rem" }}
        />
      </DataTable>
      <Sidebar
        visible={visibleLeft}
        position="right"
        onHide={() => setVisibleLeft(false)}
        style={{ inlineSize: "75vw" }}
      >
        <h2>Therapist User</h2>
        {/* <p>
          {selectedUserId ? `User ID: ${selectedUserId}` : "No user selected"}
        </p> */}
        <UserProfileView refid={selectedUserId} />
      </Sidebar>
    </div>
  );
}
