import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { useNavigate } from "react-router-dom";
import { TabView, TabPanel } from "primereact/tabview";
import CryptoJS from "crypto-js";
import TextInput from "../../pages/Inputs/TextInput";
import SelectInput from "../../pages/Inputs/SelectInput";

import Axios from "axios";

import { FilterMatchMode } from "primereact/api";
import UserProfileEdit from "../UserProfileEdit/UserProfileEdit";

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

interface sessionDetails {
  branchId?: string;
  branchName?: string;
  memberTypeId?: string;
  memberTypeName?: string;
  classMode?: string;
  classModeId?: string;
  packageId?: string;
  packageName?: string;
  classTimeId?: string;
  classTime?: string;
  weekEndTiming?: string;
  weekDaysTiming?: string
  weekEndTimingId?: string;
  weekDaysTimingId?: string
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

const UserDirData: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [visibleLeft, setVisibleLeft] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Customer | null>(null);
  const [UserDetailss, setUserDetailss] = useState<UserDetails[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [sessionData, setSessionData] = useState<sessionDetails>();
  const [branchList, setBranchList] = useState([]);
  const [userAge, setUserAge] = useState<any>();
  const [refStId, setRefStId] = useState();
  const [sessionUpdate, setSessionUpdate] = useState<number>(1);
  const [sessionUpdateLoad, setSessionUpdateLoad] = useState(false);
  const branchOptions = Object.entries(branchList).map(([value, label]) => ({
    value, // Key (e.g., '1')
    label, // Value (e.g., 'Chennai')
  }));
  const [memberList, setMemberList] = useState([]);

  const memberlistOptions = Object.entries(memberList).map(
    ([value, label]) => ({
      value, // Key (e.g., '1')
      label, // Value (e.g., 'Chennai')
    })
  );
  const [sessiontype, setSessionType] = useState([]);

  const sessionTypeOption = Object.entries(sessiontype).map(
    ([value, label]) => ({
      value, // Key (e.g., '1')
      label, // Value (e.g., 'Chennai')
    })
  );
  const [weekDaysTiming, setWeekDaysTiming] = useState([]);
  const [weekEndTiming, setWeekEndTiming] = useState([]);
  const [refUtId, setUtId] = useState("")

  const weekDaysTimingOption = Object.entries(weekDaysTiming).map(
    ([value, label]) => ({
      value, // Key (e.g., '1')
      label, // Value (e.g., 'Chennai')
    })
  );
  const weekEndTimingOption = Object.entries(weekEndTiming).map(
    ([value, label]) => ({
      value, // Key (e.g., '1')
      label, // Value (e.g., 'Chennai')
    })
  );


  const [edits, setEdits] = useState({
    session: false,
  });
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

  const [refid, setRefId] = useState<string>("");

  // Filters state
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Function to fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await Axios.get(
        import.meta.env.VITE_API_URL + `/staff/userManagementPage`,
        {
          headers: {
            Authorization: localStorage.getItem("JWTtoken"),
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response", response);

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

      console.log(data.data);

      const fetchedCustomers: Customer[] = data.data.map((customer: any) => ({
        id: customer.refStId,
        userId: customer.refSCustId,
        fname: customer.refStFName + " " + customer.refStLName,
        lname: customer.refStLName,
        email: customer.refCtEmail || "",
        trial: customer.refUtIdLabel || "Trial",
        date: customer.transTime || "",
        mobile: customer.refCtMobile,
        comments: "",
        commentEnabled: false, // Default value for commentEnabled
      }));
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
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
      console.log('data', data)
      if (data.token == false) {
        navigate("/expired");
      }
      console.log("Data line --------------- 227", data);
      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      const calculateAge = (dob: string) => {
        const dobDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDifference = today.getMonth() - dobDate.getMonth();

        // Adjust age if the birthday hasn't occurred this year yet
        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < dobDate.getDate())
        ) {
          age--;
        }

        return age.toString(); // Return age as a string
      };

      const userData = data.data.userTransaction;
      console.log('userData', userData)
      const userDetails = data.data.UserData[0];
      console.log("userDetails line --- 181 ", userDetails);
      const age = calculateAge(userDetails.refStDOB)
      setUserAge(age);
      setRefStId(userDetails.refStId);
      const session = {
        branchId: "",
        branchName: userDetails.refBranchName,
        memberTypeId: "",
        memberTypeName: userDetails.refTimeMembers,
        classModeId: "",
        classMode: userDetails.refClassMode,
        packageId: "",
        packageName: userDetails.refPackageName,
        weekDaysTimingId: "",
        weekDaysTiming: userDetails.weekDaysTiming,
        weekEndTimingId: "",
        weekEndTiming: userDetails.weekEndTiming,
      };

      setSessionData(session);

      setUserDetails(userDetails);
      setUserDetailss(userData);

      console.log("Testing Data---------------", data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };
  const fetchSessionOptions = async () => {
    Axios.get(import.meta.env.VITE_API_URL + "/profile/passRegisterData", {
      headers: {
        Authorization: localStorage.getItem("JWTtoken"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        const data = decrypt(
          res.data[1],
          res.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );
        if (data.token == false) {
          navigate("/expired");
        }
        console.log("--------------  229", data);

        if (data.success) {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
          setBranchList(data.data.branchList);
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.error("Error: ", err);
      });
  };

  const fetchMemberTypeOptions = async () => {
    console.log("sessionData?.branchId", sessionData?.branchId);
    console.log("userAge", userAge);
    Axios.post(
      import.meta.env.VITE_API_URL + "/profile/MemberList",
      {
        branchId: sessionData?.branchId || 1,
        refAge: userAge,
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
        console.log("data line ------ 275", data);
        if (data.token == false) {
          navigate("/expired");
        } else {
          setMemberList(data.data); // Make sure this updates memberList
        }
        // setpreferTiming([]);
        // setSessionType([]);
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  };

  const fetchPackageOptions = async () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/profile/sectionTime",
      {
        sectionId: parseInt(
          (sessionData as { memberTypeId: string }).memberTypeId
        ),
        branch: parseInt((sessionData as { branchId: string }).branchId),
        classType: parseInt(sessionData?.classMode == "Online" ? "1" : "2"),
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
        console.log("data line ----------- 320", data);
        if (data.token == false) {
          navigate("/expired");
        } else {
          setSessionType(data.SectionTime);
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.error("Error: ", err);
      });
  };

  const fetchTimingOptions = async (value: any) => {
    console.log("sessionData", sessionData?.packageId);
    Axios.post(
      import.meta.env.VITE_API_URL + "/profile/PackageTime",
      {
        packageId: parseInt(value),
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
        if (data.token == false) {
          navigate("/expired");
        } else {
          console.log('data data--------- 393', data)
          setWeekEndTiming(data.packageWeTiming);
          setWeekDaysTiming(data.packageWTiming);
        }
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  };

  const updateSessionData = async () => {
    setSessionUpdateLoad(true); // Show loading indicator
    try {
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + "/profile/SessionUpdate",
        {
          refStId: refStId,
          personalData: {
            refClMode: parseInt(
              (sessionData as { classModeId: string }).classModeId
            ),
            refPaId: parseInt(
              (sessionData as { packageId: string }).packageId
            ),
            refWeekTiming: parseInt(
              (sessionData as { weekEndTimingId: string }).weekEndTimingId
            ),
            refWeekDaysTiming: parseInt(
              (sessionData as { weekDaysTimingId: string }).weekDaysTimingId
            ),
            refBatchId: parseInt(
              (sessionData as { memberTypeId: string }).memberTypeId
            ),
            refBranchId: parseInt(
              (sessionData as { branchId: string }).branchId
            ),
          },
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
      console.log("Data received:", data);
      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setEdits({ session: false });
      }
    } catch (error) {
      console.error("Error updating session data:", error);
      // Handle error (e.g., showing an error message)
    } finally {
      setSessionUpdateLoad(false);
      fetchCustomers();
      fetchUserDetails((refStId ?? 'default_value').toString());
    }

  };

  useEffect(() => {
    const token = localStorage.getItem("refUtId");
    console.log('token line ------- 475', token)
    if (token) {
      setUtId(token);
    }
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

  const onUserIdClick = (id: string, rowData: string) => {
    setSelectedUserId(rowData);
    fetchUserDetails(id);
    fetchSessionOptions();

    setRefId(id);

    console.log("user ID ----", id);

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

  const header = renderHeader();

  const actionBody = (rowData: any) => {
    console.log(rowData);

    let parsedData;
    try {
      parsedData = JSON.parse(rowData.transData);

      return (
        <>
          Label: {parsedData.label}
          <br />
          <br />
          Old Data:{" "}
          {parsedData.data.oldValue ? parsedData.data.oldValue : "null"} <br />
          <br />
          New Data: {parsedData.data.newValue}
        </>
      );
    } catch (error) {
      // If parsing fails, transData is not valid JSON
      return <>{rowData.transData}</>;
    }
  };

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
        scrollable
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
          headerStyle={{ minWidth: "3rem" }}
        />
        <Column
          field="userId"
          header="User ID"
          body={userIdTemplate}
          frozen
          sortable
          filterPlaceholder="Search by User ID"
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="fname"
          header="Name"
          sortable
          style={{ minWidth: "14rem" }}
        />
        <Column
          field="trial"
          header="Current Status"
          sortable
          style={{ minWidth: "14rem", textTransform: "capitalize" }}
        />
        <Column
          field="mobile"
          header="Mobile"
          sortable
          style={{ minWidth: "14rem" }}
          filterPlaceholder="Search by Mobile"
        />
        <Column
          field="email"
          header="Email"
          sortable
          style={{ minWidth: "14rem" }}
        />
      </DataTable>

      <Sidebar
        className="w-[90%] lg:w-[75%]"
        visible={visibleLeft}
        position="right"
        onHide={() => setVisibleLeft(false)}
      >
        <h2>User Detail</h2>
        <p>
          {selectedUserId ? `User ID: ${selectedUserId}` : "No user selected"}
        </p>
        <div className="card">
          <TabView>
            <TabPanel header="Profile">
              <p className="m-0">
                {userDetails ? (
                  <>
                    <div className="mt-10">
                      <UserProfileEdit refid={refid} />
                    </div>
                  </>
                ) : (
                  <p>No user details available.</p>
                )}
              </p>
            </TabPanel>
            <TabPanel header="Session details">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSessionData();
                }}
              >
                <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                  <div className="w-[100%] flex justify-between items-center mb-5">
                    <div className="text-[1.2rem] lg:text-[25px] font-bold">
                      Yoga class
                    </div>
                    {edits.session ? (
                      <button
                        className={`text-[15px] outline-none py-2 border-none px-3 font-bold cursor-pointer text-white rounded ${sessionUpdateLoad
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-[#f95005]"
                          }`}
                        type="submit"
                        disabled={sessionUpdateLoad}
                      >
                        {sessionUpdateLoad ? (
                          <>
                            Loading&nbsp;&nbsp;
                            <i className="pi pi-spin pi-spinner text-[15px]"></i>
                          </>
                        ) : (
                          <>
                            Save&nbsp;&nbsp;
                            <i className="text-[15px] pi pi-check"></i>
                          </>
                        )}
                      </button>
                    ) : (
                      <div
                        onClick={() => {
                          setEdits({ session: true });
                        }}
                        className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                      >
                        Edit&nbsp;&nbsp;
                        <i className="text-[15px] pi pi-pen-to-square"></i>
                      </div>
                    )}
                  </div>
                  <div className="w-[100%] flex justify-center items-center">
                    {!edits.session ? (
                      <div className="w-[100%] justify-center items-center flex flex-col">
                        <div className="w-[100%] flex flex-row lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                          <div className="w-[100%] lg:w-[48%]">
                            <TextInput
                              label="Branch *"
                              name="branchName"
                              id="branch"
                              type="text"
                              value={sessionData?.branchName}
                              readonly
                            />
                          </div>
                          <div className="w-[100%] lg:w-[48%]">
                            <TextInput
                              label="Member Type *"
                              name="memberTypeName"
                              id="mtype"
                              type="text"
                              value={sessionData?.memberTypeName}
                              readonly
                            />
                          </div>
                        </div>
                        <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between">
                          <div className="w-[100%] lg:w-[48%]">
                            <TextInput
                              label="Class Mode *"
                              name="classMode"
                              id="mtype"
                              type="text"
                              value={
                                sessionData?.classMode === "1"
                                  ? "Online"
                                  : "Offline"
                              }
                              readonly
                            />
                          </div>
                          <div className="w-[100%] lg:w-[48%]">
                            <TextInput
                              label="Package Name *"
                              id="mtype"
                              name="packageName"
                              type="text"
                              value={sessionData?.packageName}
                              readonly
                            />
                          </div>
                        </div>
                        <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] mt-[20px] justify-between">

                          {sessionData?.weekDaysTiming?.length || 0 > 0 ? <><div className="w-[100%] lg:w-[48%]">
                            <TextInput
                              label="Weekdays Timing"
                              id="mtype"
                              name="classTime"
                              type="text"
                              value={sessionData?.weekDaysTiming}
                              readonly
                            />
                          </div></> : <> </>}

                          {sessionData?.weekEndTiming?.length || 0 > 0 ? <><div className="w-[100%] lg:w-[48%]">
                            <TextInput
                              label="Weekend Timing"
                              id="mtype"
                              name="classTime"
                              type="text"
                              value={sessionData?.weekEndTiming}
                              readonly
                            />
                          </div></> : <></>}


                        </div>
                      </div>
                    ) : (
                      <div className="w-[100%] justify-center items-center flex flex-col">
                        <div className="w-[100%] flex flex-row lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                          <div className="w-[45%]">
                            <SelectInput
                              id="branch"
                              name="branchId"
                              label="Branch *"
                              options={branchOptions}
                              required
                              value={sessionData?.branchId || ""}
                              onChange={(e) => {
                                setSessionUpdate(2);
                                fetchMemberTypeOptions();
                                const { name, value } = e.target;
                                setSessionData((prevData) => ({
                                  ...prevData,
                                  [name]: value,
                                  memberTypeId: "",
                                  classModeId: "",
                                  packageId: "",
                                  classTimeId: "",
                                  weekEndTimingId: "",
                                  weekDaysTimingId: ""

                                }));
                              }}
                            />
                          </div>
                          <div className="w-[45%]">
                            <SelectInput
                              id="membertype"
                              name="memberTypeId"
                              label="Member Type *"
                              options={memberlistOptions}
                              disabled={sessionUpdate <= 1}
                              required
                              value={sessionData?.memberTypeId || ""}
                              onChange={(e) => {
                                setSessionUpdate(3);
                                const { name, value } = e.target;
                                setSessionData((prevData) => ({
                                  ...prevData,
                                  [name]: value,
                                  classModeId: "",
                                  packageId: "",
                                  classTimeId: "",
                                  weekEndTimingId: "",
                                  weekDaysTimingId: ""
                                }));
                              }}
                            />
                          </div>

                        </div>
                        <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between">
                          <div className="w-[45%]">
                            <SelectInput
                              id="classtype"
                              name="classModeId"
                              label="Class Type *"
                              options={[
                                { value: "1", label: "Online" },
                                { value: "2", label: "Offline" },
                              ]}
                              disabled={sessionUpdate <= 2}
                              required
                              value={sessionData?.classModeId || ""}
                              onChange={(e) => {
                                setSessionUpdate(4);
                                fetchPackageOptions();
                                const { name, value } = e.target;
                                setSessionData((prevData) => ({
                                  ...prevData,
                                  [name]: value,
                                  packageId: "",
                                  classTimeId: "",
                                }));
                              }}
                            />
                          </div>
                          <div className="w-[45%]">
                            <SelectInput
                              id="classtype"
                              name="packageId"
                              label="Class Package *"
                              options={sessionTypeOption}
                              disabled={sessionUpdate <= 3}
                              required
                              value={sessionData?.packageId || ""}
                              onChange={(e) => {
                                setSessionUpdate(5);
                                fetchTimingOptions(e.target.value);
                                const { name, value } = e.target;
                                setSessionData((prevData) => ({
                                  ...prevData,
                                  [name]: value,
                                  classTimeId: "",
                                  weekEndTimingId: "",
                                  weekDaysTimingId: ""
                                }));
                              }}
                            />
                          </div>

                        </div>
                        <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] mt-[20px] justify-between">

                          {weekDaysTimingOption.length > 0 ? <><div className="w-[45%]">
                            <SelectInput
                              id="weekDaysTimingId"
                              name="weekDaysTimingId"
                              label="weekdays Timing*"
                              options={weekDaysTimingOption}
                              disabled={sessionUpdate <= 4}
                              required
                              value={sessionData?.weekDaysTimingId || ""}
                              onChange={(e) => {
                                setSessionUpdate(6);
                                const { name, value } = e.target;
                                setSessionData((prevData) => ({
                                  ...prevData,
                                  [name]: value,
                                }));
                              }}
                            />
                          </div></> : <></>}

                          {weekEndTimingOption.length > 0 ? <><div className="w-[45%]">
                            <SelectInput
                              id="weekEndTimingId"
                              name="weekEndTimingId"
                              label="Weekend Timing *"
                              options={weekEndTimingOption}
                              disabled={sessionUpdate <= 4}
                              required
                              value={sessionData?.weekEndTimingId || ""}
                              onChange={(e) => {
                                setSessionUpdate(6);
                                const { name, value } = e.target;
                                setSessionData((prevData) => ({
                                  ...prevData,
                                  [name]: value,
                                }));
                              }}
                            />
                          </div></> : <></>}


                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </TabPanel>
            <TabPanel header="Audit">
              <p className="m-0">
                <DataTable value={UserDetailss} tableStyle={{ minWidth: "50rem" }}>
                  <Column
                    header="S.No"
                    body={(_data, options) => options.rowIndex + 1}
                  />
                  <Column
                    field="transTypeText"
                    header="Transaction Type"
                    style={{ textTransform: "capitalize" }}
                  />
                  <Column
                    field="transData"
                    header="Action"
                    body={actionBody}
                    style={{ textTransform: "capitalize" }}
                  />
                  <Column
                    field="transTime"
                    header="Date"
                    style={{ textTransform: "capitalize" }}
                  />
                  <Column
                    field="refUserType"
                    header="Performed By"
                    style={{ textTransform: "capitalize" }}
                  />
                  {/* Conditional rendering for Performer Name */}
                  {parseInt(refUtId) == 7 && (
                    <Column
                      header="Performer Name"
                      body={(rowData) => `${rowData.refStFName} ${rowData.refStLName}`}
                      style={{ textTransform: "capitalize" }}
                    />
                  )}
                </DataTable>


              </p>
            </TabPanel>
          </TabView>
        </div>
      </Sidebar>
    </div>
  );
};

export default UserDirData;
