import React, { useEffect, useState } from "react";
import Axios from "axios";
import { Skeleton } from "primereact/skeleton";
import CryptoJS from "crypto-js";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { Fieldset } from "primereact/fieldset";
import "./Transactions.css";
import Payment from "../../pages/Payment/Payment";

type DecryptResult = any;

const Transactions: React.FC = () => {
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [pageLoading, setPageLoading] = useState({
    verifytoken: true,
    pageData: true,
  });

  const [userdata, setuserdata] = useState({
    username: "",
    usernameid: "",
    profileimg: { contentType: "", content: "" },
  });

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

  useEffect(() => {
    Axios.get(import.meta.env.VITE_API_URL + "/validateTokenData", {
      headers: {
        Authorization: localStorage.getItem("JWTtoken"),
        "Content-Type": "application/json",
      },
    }).then((res) => {
      const data = decrypt(
        res.data[1],
        res.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      setuserdata({
        username:
          "" + data.data[0].refStFName + " " + data.data[0].refStLName + "",
        usernameid: data.data[0].refusertype,
        profileimg: data.profileFile,
      });

      setPageLoading({
        ...pageLoading,
        verifytoken: false,
      });

      console.log("Verify Token  Running --- ");
    });
  }, []);

  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(tableData);
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

  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-2 my-2 justify-content-between align-items-center">
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

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const onGlobalFilterChange = (e: any) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const header = renderHeader();

  const [tableData, setTableData] = useState([]);

  const fetchData = () => {
    Axios.get(import.meta.env.VITE_API_URL + "/finance/studentDetails", {
      headers: {
        Authorization: localStorage.getItem("JWTtoken"),
        "Content-Type": "application/json",
      },
    }).then((res) => {
      const data = decrypt(
        res.data[1],
        res.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      console.log("Fetch Data--------", data);

      setTableData(data.data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const userIdTemplate = (rowData: any) => {
    return (
      <Button
        label={rowData.refSCustId}
        className="p-button-link"
        style={{ textAlign: "start" }}
        onClick={() => {
          fetchAuditPage(rowData.refStId);
          setAudit(true);
        }}
      />
    );
  };

  const userNameTemplate = (rowData: any) => {
    return (
      <p>
        {rowData.refStFName} {rowData.refStLName}
      </p>
    );
  };

  const payBtnTemplate = (rowData: any) => {
    return (
      <Button
        severity="success"
        label="Pay"
        onClick={() => {
          setPaymentID(rowData.refStId);
          setPayment(true);
        }}
      />
    );
  };

  const [audit, setAudit] = useState(false);

  const [payment, setPayment] = useState(false);

  const closePayment = () => {
    setPayment(false);
  };

  const [paymentID, setPaymentID] = useState<string>("");

  const [auditData, setAuditData] = useState([
    {
      LastName: "",
      FirstName: "",
      refCtEmail: "",
      refCtMobile: "",
      refSCustId: "",
      refTimeMembers: "",
      refCustTimeData: "",
      refTime: "",
      refTimeDays: "",
      refTimeMode: "",
      refPaymentFrom: "",
      refPaymentTo: "",
      refExpiry: "",
      refDate: "",
      PaymentMode: "",
      refFeesPaid: "",
      refGstPaid: "",
      refToAmt: "",
      OfferName: "",
      refOffer: "",
    },
  ]);

  const fetchAuditPage = (refStId: any) => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/finance/studentProfile",
      {
        refStId: refStId,
      },
      {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json",
        },
      }
    ).then((res) => {
      const data = decrypt(
        res.data[1],
        res.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      setAuditData(data.data);

      console.log("Fetch Data--------", data);
    });
  };

  return (
    <>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5]">
            <div className="headerPrimary">
              <h3>TRANSACTIONS</h3>
              <div className="quickAcces">
                <Skeleton
                  shape="circle"
                  size="3rem"
                  className="mr-2"
                ></Skeleton>
                <h3 className="flex-col flex items-center justify-center text-center ml-2 lg:ml-2 mr-0 lg:mr-5">
                  <Skeleton width="7rem" className="mb-2"></Skeleton>
                  <Skeleton width="7rem" className="mb-2"></Skeleton>
                </h3>
              </div>{" "}
            </div>

            <div className="userProfilePage">
              <Skeleton
                className="lg:m-[30px] shadow-lg"
                width="95%"
                height="80vh"
                borderRadius="16px"
              ></Skeleton>
              <div className="py-1"></div>
            </div>
          </div>
        </>
      ) : (
        <div className="usersTable bg-[#f6f5f5]">
          <div className="headerPrimary">
            <h3>TRANSACTIONS</h3>
            <div className="quickAcces">
              {userdata.profileimg ? (
                <div className="p-link layout-topbar-button">
                  <img
                    id="userprofileimg"
                    className="w-[45px] h-[45px] object-cover rounded-full"
                    src={`data:${userdata.profileimg.contentType};base64,${userdata.profileimg.content}`}
                    alt=""
                  />
                </div>
              ) : (
                <div className="p-link layout-topbar-button">
                  <i className="pi pi-user"></i>
                </div>
              )}
              <h3 className="text-[1rem] text-center ml-2 lg:ml-2 mr-0 lg:mr-5">
                <span>{userdata.username}</span>
                <br />
                <span className="text-[0.8rem] text-[#f95005]">
                  {userdata.usernameid}
                </span>
              </h3>
            </div>{" "}
          </div>
          <div className=" px-5 bg-[#f6f5f5] h-[85vh]">
            <div className="card" style={{ overflow: "auto",marginTop:"10px" }}>
              <DataTable
                paginator
                rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[10, 25, 50]}
                dataKey="id"
                header={header}
                filters={filters}
                tableStyle={{ minWidth: "50rem" }}
                value={tableData}
              >
                <Column
                  field="refSCustId"
                  body={userIdTemplate}
                  header="Customer Id"
                ></Column>
                <Column
                  field="refSCustId"
                  body={userNameTemplate}
                  header="Name"
                ></Column>
                <Column field="refCtMobile" header="Phone Number"></Column>
                <Column field="refCtEmail" header="Mail"></Column>
                <Column
                  field="quantity"
                  body={payBtnTemplate}
                  header="Pay"
                ></Column>
              </DataTable>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        style={{ width: "70%" }}
        visible={audit}
        position="right"
        onHide={() => setAudit(false)}
      >
        <h2>Profile Data</h2>
        <p className="m-0">
          <Fieldset
            className="border-2 border-[#f95005] fieldData"
            legend={
              auditData ? `${auditData[0].refSCustId}` : "No user selected"
            }
          >
            {auditData ? (
              <div>
                <tr>
                  <td className="text-900 font-bold p-2">Name</td>
                  <td className="text-[#000] p-2">
                    {auditData[0].FirstName} {auditData[0].LastName}
                  </td>
                </tr>
                <tr>
                  <td className="text-900 font-bold p-2">Email</td>
                  <td className="text-[#000] p-2">{auditData[0].refCtEmail}</td>
                </tr>
                <tr>
                  <td className="text-900 font-bold p-2">Phone Number</td>
                  <td className="text-[#000] p-2">
                    {auditData[0].refCtMobile}
                  </td>
                </tr>
              </div>
            ) : (
              <p>No user details available.</p>
            )}
          </Fieldset>
        </p>
        {auditData ? (
          <div className="contents">
            <Fieldset
              className="mt-10 border-2 border-[#f95005] fieldData"
              legend={"Class Type"}
            >
              {auditData ? (
                <div>
                  <tr>
                    <td className="text-900 font-bold p-2">Members Session</td>
                    <td className="text-[#000] p-2">
                      {auditData[0].refTimeMembers
                        ? auditData[0].refTimeMembers
                        : "null"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-900 font-bold p-2">Session Type</td>
                    <td className="text-[#000] p-2">
                      {auditData[0].refCustTimeData
                        ? auditData[0].refCustTimeData
                        : "null"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-900 font-bold p-2">
                      Preferable Timing
                    </td>
                    <td className="text-[#000] p-2">
                      {auditData[0].refTime
                        ? auditData[0].refTime +
                          " | " +
                          auditData[0].refTimeDays +
                          " | " +
                          auditData[0].refTimeMode
                        : "null"}
                    </td>
                  </tr>
                </div>
              ) : (
                <p>No user details available.</p>
              )}
            </Fieldset>

            <Fieldset
              className="mt-10 h-[46vh] border-2 border-[#f95005] fieldData"
              legend={"Payment"}
            >
              {auditData ? (
                <div>
                  <tr>
                    <td className="text-900 font-bold p-2">Payment From</td>
                    <td className="text-[#000] p-2">
                      {auditData[0].refPaymentFrom
                        ? auditData[0].refPaymentFrom
                        : "No Payment"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-900 font-bold p-2">Payment To</td>
                    <td className="text-[#000] p-2">
                      {auditData[0].refPaymentTo
                        ? auditData[0].refPaymentTo
                        : "No Payment"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-900 font-bold p-2">Payment Expire</td>
                    <td className="text-[#000] p-2">
                      {auditData[0].refExpiry
                        ? auditData[0].refExpiry
                        : "No Payment"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-900 font-bold p-2">
                      Last Payment Date
                    </td>
                    <td className="text-[#000] p-2">
                      {auditData[0].refDate
                        ? auditData[0].refDate
                        : "No Payment"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-900 font-bold p-2">Payment Mode</td>
                    <td className="text-[#000] p-2">
                      {auditData[0].PaymentMode
                        ? auditData[0].PaymentMode
                        : "No Payment"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-900 font-bold p-2">Amount</td>
                    <td className="text-[#000] p-2">
                      {auditData[0].refFeesPaid
                        ? "Net: " +
                          auditData[0].refFeesPaid +
                          " + GST: " +
                          auditData[0].refGstPaid +
                          " : Total = " +
                          auditData[0].refToAmt
                        : "No Payment"}
                    </td>
                  </tr>
                </div>
              ) : (
                <p>No user details available.</p>
              )}
            </Fieldset>

            <Fieldset
              className="mt-10 h-[25vh] border-2 border-[#f95005] fieldData"
              legend={"Payment Offers"}
            >
              {auditData ? (
                <div>
                  <tr>
                    <td className="text-900 font-bold p-2">Offer Type</td>
                    <td className="text-[#000] p-2">
                      {auditData[0].OfferName
                        ? auditData[0].OfferName
                        : "No Offer"}
                    </td>
                  </tr>

                  <tr>
                    <td className="text-900 font-bold p-2">Offer Value</td>
                    <td className="text-[#000] p-2">
                      {auditData[0].refOffer
                        ? auditData[0].refOffer
                        : "No Offer"}
                    </td>
                  </tr>
                </div>
              ) : (
                <p>No user details available.</p>
              )}
            </Fieldset>
          </div>
        ) : (
          <p>No user details available.</p>
        )}
      </Sidebar>

      <Sidebar
        style={{ width: "70%" }}
        visible={payment}
        position="right"
        onHide={() => setPayment(false)}
      >
        <h2>Payment</h2>
        <Payment closePayment={closePayment} refStId={paymentID} />
      </Sidebar>
    </>
  );
};

export default Transactions;
