import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "primereact/sidebar";

import { FilterMatchMode } from "primereact/api";

interface Customer {
  currentStatus: string;
  nextStatus: string | null;
  id: string;
  refUtId: any;
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

const statusMapping: Record<number, string> = {
  2: "Registered",
  3: "Trial",
  6: "Payment Pending",
  5: "Student",
  9: "Rejected",
};

import CryptoJS from "crypto-js";
import UserProfileView from "../UserProfileView/UserProfileView";
import Payment from "../Payment/Payment";

type DecryptResult = any;

export default function RegisteredDataTable() {
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
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [visibleLeft, setVisibleLeft] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Customer | null>(null);
  const [UserDetailss, setUserDetailss] = useState<UserDetails[]>([]);

  console.log("testing", userDetails, UserDetailss);

  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  // Filters state
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const initFilters = () => {
    // setFilters({
    //   global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    //   fname: {
    //     operator: FilterOperator.AND,
    //     constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    //   },
    //   mobile: {
    //     operator: FilterOperator.AND,
    //     constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    //   },
    //   email: {
    //     operator: FilterOperator.AND,
    //     constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    //   },
    //   date: {
    //     operator: FilterOperator.AND,
    //     constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    //   },
    //   currentStatus: {
    //     operator: FilterOperator.AND,
    //     constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    //   },
    //   nextStatus: {
    //     operator: FilterOperator.AND,
    //     constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    //   },
    // });
    setGlobalFilterValue("");
  };

  // Function to fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await Axios.get(
        import.meta.env.VITE_API_URL + `/staff/studentApproval`,
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
      if (data.token == false) {
        navigate("/expired");
      }
      console.log("Data line --------------- 227", data);

      const fetchedCustomers: Customer[] = data.data.map((customer: any) => ({
        id: customer.refStId,
        userId: customer.refSCustId,
        fname: customer.refStFName + " " + customer.refStLName,
        lname: customer.refStLName,
        email: customer.refCtEmail || "",
        date: customer.transTime || "",
        therapist: customer.reftherapist ? "Yes" : "No",
        mobile: customer.refCtMobile,
        comments: "",
        commentEnabled: false,
        refUtId: customer.refUtId,
        currentStatus: statusMapping[customer.refUtId],
        nextStatus: getNextStatus(customer.refUtId),
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
        return "Trial";
      case 3:
        return "Payment Pending";
      case 6:
        return "Student";
      default:
        return null;
    }
  };

  const closePayment = () => {
    setPayment(false);
  };

  useEffect(() => {
    fetchCustomers();
    initFilters();
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
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/staff/Approvalbtn`,
        {
          refStId: customer.id,
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
      if (data.token == false) {
        navigate("/expired");
      }
      console.log("Data line --------------- 227", data);
      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      if (data.success) {
        const updatedCustomers = customers.map((c) =>
          c.id === customer.id
            ? {
              ...c,
              currentStatus: c.nextStatus,
              nextStatus: getNextStatus(c.refUtId + 1),
            }
            : c
        );

        setCustomers(updatedCustomers as Customer[]);
        console.log("Approved:", customer, "Response:", data);
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error approving customer:", error);
    }
  };

  // const handleReject = async (customerId: string) => {
  //   const updatedCustomers = customers.map((customer) =>
  //     customer.id === customerId
  //       ? { ...customer, commentEnabled: true }
  //       : customer
  //   );
  //   setCustomers(updatedCustomers);
  // };

  const handleReject = async (id: any) => {
    const response = await Axios.post(
      import.meta.env.VITE_API_URL + `/staff/rejectionbtn`,
      {
        refStId: id,
        comment: "Frontoffice Reject The Application",
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
    if (data.token == false) {
      navigate("/expired");
    }

    localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

    if (data.success) {
      fetchCustomers();
    }
  };

  // const handleCommentChange = (customerId: string, value: string) => {
  //   const updatedCustomers = customers.map((customer) =>
  //     customer.id === customerId ? { ...customer, comments: value } : customer
  //   );
  //   setCustomers(updatedCustomers);
  // };

  // const handleSaveComment = async (customerId: string) => {
  //   const customer = customers.find((customer) => customer.id === customerId);
  //   if (customer) {
  //     try {
  //       // Log the current and next status before saving the comment
  //       const status1 = customer.currentStatus; // Assuming currentStatus is status1
  //       const status2 = customer.nextStatus; // Assuming nextStatus is status2
  //       console.log(`Saving comment for ${customerId}:`);
  //       console.log(`Status 1: ${status1}, Status 2: ${status2}`);

  //       const response = await Axios.post(
  //         import.meta.env.VITE_API_URL + `/staff/rejectionbtn`,
  //         {
  //           refStId: customer.id,
  //           comment: customer.comments,
  //         },
  //         {
  //           headers: {
  //             Authorization: localStorage.getItem("JWTtoken"),
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       const data = decrypt(
  //         response.data[1],
  //         response.data[0],
  //         import.meta.env.VITE_ENCRYPTION_KEY
  //       );

  //       localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

  //       if (data.success) {
  //         console.log(`Rejection saved for ${customerId}:`, data.data);
  //         fetchCustomers();
  //       }
  //     } catch (error) {
  //       console.error(`Error saving rejection for ${customerId}:`, error);
  //     }
  //   }
  // };

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
      if (data.token == false) {
        navigate("/expired");
      }
      console.log("Data line --------------- 227", data);
      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

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

  const passFromToThreapist = async (customerId: string) => {
    const customer = customers.find((customer) => customer.id === customerId);
    if (customer) {
      try {

        const response = await Axios.post(
          import.meta.env.VITE_API_URL + `/staff/passToThreapist`,
          {
            refStId: customer.id,
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

        if (data.token == false) {
          navigate("/expired")
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          if (data.success) {
            fetchCustomers();
          }
        }


      } catch (error) {
        console.error(`Error in passing the form of ${customerId}:`, error);
      }
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
    console.log("New ----------", rowData);

    return (
      <>
        {rowData.currentStatus === "Payment Pending" ? (
          <Button
            severity="success"
            onClick={() => {
              setPaymentID(rowData.id);
              setPayment(true);
            }}
            label="Pay"
          />
        ) : (
          <div className="flex gap-2 ">

            <Button
              className="flex items-center justify-center p-2 rounded-full bg-[#28a745] hover:bg-[#1b682d] text-white"
              aria-label="Approve"
              onClick={() => handleApprove(rowData)}
            >
              <i className="pi pi-check text-xl"></i>
            </Button>

            {/* <Button
              icon="pi pi-check"
              className="flex items-center justify-center text-[1.1rem] border rounded w-10 h-10"
              rounded
              severity="success"
              aria-label="Approve"
              onClick={() => handleApprove(rowData)}
            /> */}

            <Button
              className="flex items-center justify-center p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
              aria-label="Cancel"
              onClick={() => handleReject(rowData)}
            >
              <i className="pi pi-times text-xl"></i>
            </Button>


            {/* <Button
              icon="pi pi-times"
              rounded
              severity="danger"
              aria-label="Cancel"
              onClick={() => handleReject(rowData.id)}
            /> */}
          </div>
        )}
      </>
    );
  };
  const threapistRequestTemplate = (rowData: Customer) => {
    console.log("New ----------", rowData);

    return (
      <>
        {rowData.currentStatus === "Payment Pending" ? (
          <></>
        ) : (
          <div className="flex justify-center w-[80%]"><Button
            severity="info"
            onClick={() => {
              passFromToThreapist(rowData.id);
            }}
            label="Pass"
          /></div>

        )}
      </>
    );
  };

  // const commentsBodyTemplate = (rowData: Customer) => {
  //   return (
  //     <div className="flex align-items-center gap-2">
  //       <InputText
  //         value={rowData.comments || ""}
  //         onChange={(e) => handleCommentChange(rowData.id, e.target.value)}
  //         disabled={!rowData.commentEnabled}
  //         className="p-inputtext-sm"
  //         placeholder="Enter comments"
  //       />
  //       {rowData.commentEnabled && (
  //         <Button
  //           label="Save"
  //           className="p-button-primary p-button-sm"
  //           onClick={() => handleSaveComment(rowData.id)}
  //         />
  //       )}
  //     </div>
  //   );
  // };

  // const therapyBody = (rowData: any) => {
  //   return <>{rowData.therapist === "Yes" ? <>Therapist</> : <>General</>}</>;
  // };

  const header = renderHeader();

  const [paymentID, setPaymentID] = useState<string>("");

  const [payment, setPayment] = useState(false);

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
        scrollable
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
        {/* <Column
          selectionMode="multiple"
          frozen
          headerStyle={{ minWidth: "3rem" }}
        /> */}
        <Column
          field="userId"
          header="Customer Id"
          body={userIdTemplate}
          frozen
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="fname"
          header="Name"
          style={{ minWidth: "14rem" }}
          filterPlaceholder="Search by Mobile"
        />
        <Column
          field="mobile"
          header="Mobile"
          style={{ minWidth: "14rem" }}
          filterPlaceholder="Search by Mobile"
        />
        <Column field="email" header="Email" style={{ minWidth: "14rem" }} />
        <Column
          field="date"
          header="Application Submitted"
          filterField="date"
          dataType="date"
          style={{ minWidth: "20rem" }}
        />

        <Column
          header="Pass To Therapist"
          body={threapistRequestTemplate}
          style={{ minWidth: "14rem" }}
        />
        <Column
          header="Approve"
          body={statusBodyTemplate}
          style={{ minWidth: "14rem" }}
        />
      </DataTable>
      <Sidebar
        visible={visibleLeft}
        position="right"
        onHide={() => setVisibleLeft(false)}
        style={{ minWidth: "75vw" }}
      >
        <h2>User Data</h2>
        {/* <p>
          {selectedUserId ? `User ID: ${selectedUserId}` : "No user selected"}
        </p> */}

        <UserProfileView refid={selectedUserId} />
      </Sidebar>

      <Sidebar
        style={{ width: "70%" }}
        visible={payment}
        position="right"
        onHide={() => {
          console.log("1 --------------------------------------");
          setPayment(false);
          fetchCustomers();
        }}
      >
        <h2>Payment</h2>
        <Payment closePayment={closePayment} refStId={paymentID} />
      </Sidebar>
    </div>
  );
}
