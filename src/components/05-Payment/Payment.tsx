import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import { Sidebar } from "primereact/sidebar";
import { Fieldset } from "primereact/fieldset";
import { Skeleton } from "primereact/skeleton";

import { useNavigate } from "react-router-dom";

type DecryptResult = any;

const Payment: React.FC = () => {
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
  const navigate = useNavigate();

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
      if(data.token==false)
      {
        navigate("/expired")
      }
      else{
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
      }

      
    });
  }, []);

  interface Customer {
    refCtEmail: string;
    refCtMobile: number;
    refCtWhatsapp: number;
    refCustTimeData: string;
    refExpiry: string;
    refFeesAmtOf: number;
    refFeesPaid: number;
    refGstPaid: number;
    refOfferType?: string;
    refOfferValue?: number;
    refPaymentFrom: string;
    refPaymentTo: string;
    refSCustId: string;
    refStFName: string;
    refStId: number;
    refStLName: string;
    refTime: string;
    refTimeDays: string;
    refTimeMembers: string;
    refTimeMode: string;
    refToAmt: number;
    row_num: number;
    refDate: string;
    refPaymentMode: string;
  }

  const [dataType, setDataType] = useState<number>(6);

  const [userData, setUserData] = useState<Customer[]>([]);
  const [info, setInfo] = useState<any[]>([]);
  // const [info, setInfo] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [visibleLeft, setVisibleLeft] = useState(false);

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

  const fetchCustomers = async () => {
    try {
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/studentFees/Data`,
        {
          refUtId: dataType,
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
      if(data.token==false){
        navigate("/expired")
      }
      else
      {

        console.log("Data line --------------- 227", data);
        console.log("data", data);
  
        const capitalizeString = (str: any): string => {
          if (typeof str !== "string") return str; // Only capitalize if it's a string
          return str.charAt(0).toUpperCase() + str.slice(1); // Capitalize first letter, leave the rest unchanged
        };
  
        const fetchedCustomers: Customer[] = data.feeData.map(
          (customer: any) => ({
            refCtEmail: customer.refCtEmail,
            refCtMobile: capitalizeString(customer.refCtMobile),
            refCtWhatsapp: capitalizeString(customer.refCtWhatsapp),
            refCustTimeData: capitalizeString(customer.refCustTimeData),
            refExpiry: capitalizeString(customer.refExpiry),
            refFeesAmtOf: capitalizeString(customer.refFeesAmtOf),
            refFeesPaid: capitalizeString(customer.refFeesPaid),
            refGstPaid: capitalizeString(customer.refGstPaid),
            refOfferType: capitalizeString(customer.refOfferType),
            refOfferValue: capitalizeString(customer.refOfferValue),
            refPaymentFrom: capitalizeString(customer.refPaymentFrom),
            refPaymentTo: capitalizeString(customer.refPaymentTo),
            refSCustId: capitalizeString(customer.refSCustId),
            refStFName: capitalizeString(customer.refStFName),
            refStId: capitalizeString(customer.refStId),
            refStLName: capitalizeString(customer.refStLName),
            refTime: capitalizeString(customer.refTime),
            refTimeDays: capitalizeString(customer.refTimeDays),
            refTimeMembers: capitalizeString(customer.refTimeMembers),
            refTimeMode: capitalizeString(customer.refTimeMode),
            refToAmt: capitalizeString(customer.refToAmt),
            row_num: customer.row_num,
            refDate: capitalizeString(customer.refDate),
            refPaymentMode: capitalizeString(customer.refPaymentMode),
          })
        );
  
        setUserData(fetchedCustomers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [dataType]);

  const onUserIdClick = (data: Customer) => {
    setInfo([data]);
    setVisibleLeft(true);
  };

  const userIdTemplate = (rowData: Customer) => {
    return (
      <Button
        label={rowData.refSCustId}
        // label=test
        className="p-button-link"
        style={{ textAlign: "start" }}
        onClick={() => onUserIdClick(rowData)}
      />
    );
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

        <IconField iconPosition="left">
          <InputIcon className="pi pi-filter " />
          <Dropdown
            options={[
              { label: "Fees Pending", value: 6 },
              { label: "Fees Paid", value: 5 },
            ]}
            value={dataType}
            onChange={(e) => {
              setDataType(e.value);
            }}
            placeholder="Select Fees"
          />
        </IconField>

        <div className="flex align-items-center justify-content-end gap-2">
          <Button
            type="button"
            severity="success"
            // onClick={exportExcel}
            data-pr-tooltip="XLS"
          >
            Export As Excel
          </Button>
        </div>
      </div>
    );
  };

  const header = renderHeader();

  return (
    <>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5]">
            <div className="headerPrimary">
              <h3>PAYMENTS</h3>
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
        <>
          <div className="card m-1" style={{ overflow: "auto" }}>
          <div className="headerPrimary">
            <h3>PAYMENTS</h3>
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
            <DataTable
              value={userData}
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
              // filters={filters}
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              {/* <Column
        selectionMode="multiple"
        frozen
        headerStyle={{ inlineSize: "3rem" }}
      /> */}
              <Column
                field="refSCustId"
                header="User ID"
                body={userIdTemplate}
                frozen
                style={{ inlineSize: "15rem" }}
              />

              <Column
                field="fullName"
                header="Name"
                style={{ inlineSize: "14rem" }}
                body={(rowData) =>
                  `${rowData.refStFName} ${rowData.refStLName}`
                }
              />

              <Column
                field="refCtMobile"
                header="Mobile"
                style={{ inlineSize: "14rem" }}
              />
              <Column
                field="refExpiry"
                header="Expire On"
                style={{ inlineSize: "14rem" }}
              />
              <Column
                field="refDate"
                header="Last Payment"
                style={{ inlineSize: "14rem" }}
              />
              <Column
                field="refPaymentMode"
                header="Last Payment Mode"
                style={{ inlineSize: "14rem" }}
              />
            </DataTable>
          </div>
          <Sidebar
            style={{ width: "70%" }}
            visible={visibleLeft}
            position="right"
            onHide={() => setVisibleLeft(false)}
          >
            <h2>Profile Data</h2>
            <p className="m-0">
              <Fieldset
                className="border-2 border-[#f95005] fieldData"
                legend={info[0] ? `${info[0].refSCustId}` : "No user selected"}
              >
                {info[0] ? (
                  <div>
                    <tr>
                      <td className="text-900 font-bold p-2">Name</td>
                      <td className="text-[#000] p-2">
                        {info[0].refStFName} {info[0].refStLName}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-900 font-bold p-2">Phone Number</td>
                      <td className="text-[#000] p-2">{info[0].refCtMobile}</td>
                    </tr>
                    <tr>
                      <td className="text-900 font-bold p-2">Email</td>
                      <td className="text-[#000] p-2">{info[0].refCtEmail}</td>
                    </tr>
                    <tr>
                      <td className="text-900 font-bold p-2">
                        Whatsapp Number
                      </td>
                      <td className="text-[#000] p-2">
                        {info[0].refCtWhatsapp}
                      </td>
                    </tr>
                  </div>
                ) : (
                  <p>No user details available.</p>
                )}
              </Fieldset>
            </p>
            {info[0] ? (
              <div className="contents">
                <Fieldset
                  className="mt-10 border-2 border-[#f95005] fieldData"
                  legend={"Class Type"}
                >
                  {info[0] ? (
                    <div>
                      <tr>
                        <td className="text-900 font-bold p-2">
                          Members Session
                        </td>
                        <td className="text-[#000] p-2">
                          {info[0].refTimeMembers
                            ? info[0].refTimeMembers
                            : "null"}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-900 font-bold p-2">Session Type</td>
                        <td className="text-[#000] p-2">
                          {info[0].refCustTimeData
                            ? info[0].refCustTimeData
                            : "null"}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-900 font-bold p-2">
                          Preferable Timing
                        </td>
                        <td className="text-[#000] p-2">
                          {info[0].refTime
                            ? info[0].refTime +
                              " | " +
                              info[0].refTimeDays +
                              " | " +
                              info[0].refTimeMode
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
                  legend={"Last Payment"}
                >
                  {info[0] ? (
                    <div>
                      <tr>
                        <td className="text-900 font-bold p-2">Payment From</td>
                        <td className="text-[#000] p-2">
                          {info[0].refPaymentFrom
                            ? info[0].refPaymentFrom
                            : "No Payment"}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-900 font-bold p-2">Payment To</td>
                        <td className="text-[#000] p-2">
                          {info[0].refPaymentTo
                            ? info[0].refPaymentTo
                            : "No Payment"}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-900 font-bold p-2">
                          Payment Expire
                        </td>
                        <td className="text-[#000] p-2">
                          {info[0].refExpiry ? info[0].refExpiry : "No Payment"}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-900 font-bold p-2">
                          Last Payment Date
                        </td>
                        <td className="text-[#000] p-2">
                          {info[0].refDate ? info[0].refDate : "No Payment"}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-900 font-bold p-2">Payment Mode</td>
                        <td className="text-[#000] p-2">
                          {info[0].refPaymentMode
                            ? info[0].refPaymentMode
                            : "No Payment"}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-900 font-bold p-2">Amount</td>
                        <td className="text-[#000] p-2">
                          {info[0].refFeesPaid
                            ? "Net: " +
                              info[0].refFeesPaid +
                              " + GST: " +
                              info[0].refGstPaid +
                              " : Total = " +
                              info[0].refToAmt
                            : "No Payment"}
                        </td>
                      </tr>
                    </div>
                  ) : (
                    <p>No user details available.</p>
                  )}
                </Fieldset>

                {/* <Fieldset
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
            </Fieldset> */}
              </div>
            ) : (
              <p>No user details available.</p>
            )}
          </Sidebar>
        </>
      )}
    </>
  );
};

export default Payment;
