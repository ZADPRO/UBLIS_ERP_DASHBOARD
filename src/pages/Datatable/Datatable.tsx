import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import CryptoJS from "crypto-js";

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
  status1: string;
  status2: string;
  comments: string;
}

interface Option {
  label: string | unknown;
  value: string | unknown;
}

type DecryptResult = any;

export default function Datatables() {
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

  const [followUpOptions, setFollowUpOptions] = useState<Option[]>([]);
  const [statusOptions, setStatusOptions] = useState<Option[]>([]);

  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  // Filters state
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      const response = await Axios.get(
        import.meta.env.VITE_API_URL + `/staff/userSignedUp`,
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

      console.log("Data", data);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      const statusLabels = data.label.refStatusLabel;
      const statusOptionsFormatted = Object.entries(statusLabels).map(
        ([key, value]) => ({
          label: value,
          value: key,
        })
      );

      setStatusOptions(statusOptionsFormatted);
      // Extract follow-up options
      const followUpLabels = data.label.refFollowUpLabel;
      const followUpOptionsFormatted = Object.entries(followUpLabels).map(
        ([key, value]) => ({
          label: value,
          value: key,
        })
      );
      setFollowUpOptions(followUpOptionsFormatted);

      const fetchedCustomers: Customer[] = data.data.map((customer: any) => ({
        id: customer.refStId,
        userId: customer.refSCustId,
        fname: customer.refStFName + " " + customer.refStLName,
        lname: customer.refStLName,
        email: customer.refguardian || "",
        date: customer.transTime || "",
        mobile: customer.refCtMobile,
        status1: customer.resStatusId || "Call not attended",
        status2: customer.refFollowUpId || "Follow Up 1",
        comments: customer.refSUpdatedBy || null,
      }));
      setCustomers(fetchedCustomers);
    };

    fetchCustomers();
  }, []);

  const handleStatusChange = (newStatus: any, customerId: any) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((cust) =>
        cust.id === customerId ? { ...cust, status1: newStatus } : cust
      )
    );
  };

  const handleFollowUpChange = (newFollowUp: string, customerId: string) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((cust) =>
        cust.id === customerId ? { ...cust, status2: newFollowUp } : cust
      )
    );
  };

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

  const actionBodyTemplateStatus1 = (rowData: Customer) => {
    return (
      <Dropdown
        value={"" + rowData.status1 + ""}
        options={statusOptions}
        style={{ textTransform: "capitalize", width:"190px" }}
        onChange={(e) => handleStatusChange(e.value, rowData.id)}
        placeholder="Select Status"
      />
    );
  };

  const actionBodyTemplateStatus2 = (rowData: Customer) => {
    return (
      <Dropdown
      style={{ textTransform: "capitalize", width:"190px" }}
        value={"" + rowData.status2 + ""}
        options={followUpOptions}
        onChange={(e) => handleFollowUpChange(e.value, rowData.id)}
        placeholder="Select Follow Up"
      />
    );
  };

  const handleCommentChange = (customerId: string, value: string) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === customerId ? { ...customer, comments: value } : customer
    );
    setCustomers(updatedCustomers);
  };

  const handleSaveComment = async (customerId: string) => {
    customers.forEach((customer) => {
      console.log(
        `Customer ID: ${customer.id}, Status1: ${customer.status1}, Status2: ${
          customer.status2
        }, Comments: ${customer.comments || "No comments"}`
      );
    });

    const customer = customers.find((customer) => customer.id === customerId);

    if (customer) {
      if (customer.status1 && customer.status2 && customer.comments) {
        try {
          const payload = {
            refStId: customer.id,
            refStatusId: customer.status1,
            refFollowUpId: customer.status2,
            refComments: customer.comments,
          };
          console.log("Saving payload:", payload);

          const response = await Axios.post(
            import.meta.env.VITE_API_URL + `/staff/userFollowUp`,
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

          console.log("------->", data);

          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          if (response.status === 200) {
            console.log(`Follow-up updated for Customer ID: ${customerId}`);
          }
        } catch (error) {
          console.error("Error updating follow-up:", error);
        }
      } else {
        console.warn("Please fill all fields before saving.");
      }
    }
  };

  const commentsBodyTemplate = (rowData: Customer) => {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();

          // if (rowData.status2.length > 0 && rowData.status1.length > 0) {
          handleSaveComment(rowData.id);
          // } else {
          //   alert("Fill the Status 1 & Follow Up");
          // }
        }}
        className="flex align-items-center gap-2"
      >
        <InputText
          value={rowData.comments || ""}
          onChange={(e) => handleCommentChange(rowData.id, e.target.value)}
          className="p-inputtext-sm"
          placeholder="Enter comments"
          required
        />
        <Button
          label="Save"
          className="p-button-primary p-button-sm"
          type="submit"
        />
      </form>
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
          field="fname"
          header="Name"
          sortable
          style={{ inlineSize: "14rem" }}
        />
        <Column
          field="date"
          header="Signed Up Date"
          filterField="date"
          dataType="date"
          sortable
          style={{ inlineSize: "20rem" }}
        />
        <Column
          field="mobile"
          sortable
          header="Mobile"
          style={{ inlineSize: "14rem" }}
          filterPlaceholder="Search by Mobile"
        />
        <Column
          field="status1"
          header="Status 1"
          body={actionBodyTemplateStatus1}
          filterMenuStyle={{ inlineSize: "14rem" }}
          style={{ inlineSize: "14rem", textTransform: "capitalize" }}
        />
        <Column
          field="status2"
          header="Follow Up"
          body={actionBodyTemplateStatus2}
          filterMenuStyle={{ inlineSize: "14rem" }}
          style={{ inlineSize: "14rem" }}
        />
        <Column
          header="Comments"
          body={commentsBodyTemplate}
          style={{ inlineSize: "18rem" }}
        />
      </DataTable>

      {/* <Dialog
        header="Update Status"
        visible={displayStatusDialog}
        onHide={() => setDisplayStatusDialog(false)}
      >
        <div className="field">
          <Dropdown
            id="status"
            value={selectedStatus}
            options={statusOptions}
            onChange={(e) => setSelectedStatus(e.value)}
            placeholder="Select a status"
          />
        </div>
        <Button
          label="Update"
          onClick={() => handleStatusChange(customers.status1, customers.id)}
        />
      </Dialog> */}

      {/* <Dialog
        header="Change Follow Up"
        visible={displayFollowUpDialog}
        modal
        onHide={() => setDisplayFollowUpDialog(false)}
      >
        <div className="p-fluid">
          <Dropdown
            value={selectedFollowUp}
            options={followUpOptions}
            onChange={(e) => setSelectedFollowUp(e.value)}
            placeholder="Select a Follow Up"
            required
          />
        </div>
        <Button
          className="mt-5"
          label="Update"
          onClick={handleFollowUpChange}
        />
      </Dialog> */}
    </div>
  );
}
