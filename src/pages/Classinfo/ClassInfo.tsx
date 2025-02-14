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
import { MultiSelect } from "primereact/multiselect";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRef } from "react";

import { FilterMatchMode } from "primereact/api";
import UserProfileEdit from "../UserProfileEdit/UserProfileEdit";
import MedicalTabs from "../MedicalTab/MedicalTabs";
import { InputNumber } from "primereact/inputnumber";
import "./ClassInfo.css";
import { Fieldset } from "primereact/fieldset";
import { Divider } from "primereact/divider";
import ReportPageClass from "../ReportPageClass/ReportPageClass";

interface Customer {
  id: string;
  userId: string;
  fname: string;
  lname: string;
  email: string;
  date: string;
  mobile: string;
  classMode?: string;
  packageName?: string;
  batch?: string;
  weekEndTiming?: string;
  weekDaysTiming?: string;
  therapy?: string;
  refStDOB: string;
  refStFName: string;
  refCtEmail: string;
  refStLName: string;
  comments?: string;
  commentEnabled?: boolean;
  trial?: any;
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
  weekDaysTiming?: string;
  weekEndTimingId?: string;
  weekDaysTimingId?: string;
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

const ClassInfo: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [visibleLeft, setVisibleLeft] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Customer | null>(null);
  const [UserDetailss, setUserDetailss] = useState<UserDetails[]>([]);
  console.log("UserDetailss", UserDetailss);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [sessionData, setSessionData] = useState<sessionDetails>();
  const [threapyCount, setThreapyCount] = useState<number | null>();
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
  const [refUtId, setUtId] = useState("");

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
    threapy: false,
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

  // Reference for DataTable
  const dtRef = useRef<any>(null);

  const uniqueTrialStatuses = Array.from(
    new Set(customers.map((item) => item.trial))
  ).map((status) => ({ label: status, value: status }));
  console.log("uniqueTrialStatuses", uniqueTrialStatuses);
  const uniqueClassModes = Array.from(
    new Set(customers.map((item) => item.classMode))
  ).map((mode) => ({ label: mode, value: mode }));
  const uniqueBatches = Array.from(
    new Set(customers.map((item) => item.batch))
  ).map((batch) => ({ label: batch, value: batch }));
  const uniqueTherapies = Array.from(
    new Set(customers.map((item) => item.therapy))
  ).map((therapy) => ({ label: therapy, value: therapy }));
  const uniqueWeekDaysTimings = Array.from(
    new Set(customers.map((item) => item.weekDaysTiming))
  ).map((timing) => ({ label: timing, value: timing }));
  const uniqueWeekEndTimings = Array.from(
    new Set(customers.map((item) => item.weekEndTiming))
  ).map((timing) => ({ label: timing, value: timing }));
  const uniquePackageName = Array.from(
    new Set(customers.map((item) => item.packageName))
  ).map((packagename) => ({ label: packagename, value: packagename }));

  const packageFilterTemplate = (options: any) => {
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

  // Filters state
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    trial: { value: null, matchMode: FilterMatchMode.IN },
    classMode: { value: null, matchMode: FilterMatchMode.IN },
    batch: { value: null, matchMode: FilterMatchMode.IN },
    therapy: { value: null, matchMode: FilterMatchMode.IN },
    weekDaysTiming: { value: null, matchMode: FilterMatchMode.IN },
    weekEndTiming: { value: null, matchMode: FilterMatchMode.IN },
    packageName: { value: null, matchMode: FilterMatchMode.IN },
  });

  const fetchCustomers = async () => {
    try {
      const response = await Axios.get(
        import.meta.env.VITE_API_URL + `/classInfo/currentStudentData`,
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
        batch: customer.refTimeMembers,
        classMode: customer.refClMode,
        weekDaysTiming: customer.WeekDaysTiming,
        packageName: customer.refPackageName,
        weekEndTiming: customer.WeekEndTiming,
        therapy: customer.refTherapy,
        comments: "",
        commentEnabled: false, // Default value for commentEnabled
      }));
      setCustomers(fetchedCustomers);
      console.log("fetchedCustomers", fetchedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  type ClassCountData = {
    classCount: number;
    classAttend: number;
    classreCount: number;
    therapyCount: number;
    thearpyAttend: number;
    thearpyreCount: number;
  };
  const [classCount, setClassCount] = useState<ClassCountData | undefined>(
    undefined
  );
  const [thearpyBtn, setTherapyBtn] = useState(true);

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
      console.log("data", data);
      if (data.token == false) {
        navigate("/expired");
      }
      console.log("Data line --------------- 227", data);
      const countData = {
        classCount: data.data.classCount.totalClassCount,
        classAttend: data.data.classCount.classAttendCount,
        classreCount: data.data.classCount.reCount,
        therapyCount: data.data.therapyCount.totalSession,
        thearpyAttend: data.data.therapyCount.attendSession,
        thearpyreCount: data.data.therapyCount.reSession,
      };

      setClassCount(countData);

      if (countData.therapyCount <= countData.thearpyAttend) {
        setTherapyBtn(false);
      } else {
        setTherapyBtn(true);
      }

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
      console.log("userData", userData);
      const userDetails = data.data.UserData[0];
      console.log("userDetails line --- 181 ", userDetails);
      const age = calculateAge(userDetails.refStDOB);
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
      setThreapyCount(userDetails.refThreapyCount);

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
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

        if (data.success) {
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
          console.log("data data--------- 393", data);
          setWeekEndTiming(data.packageWeTiming);
          setWeekDaysTiming(data.packageWTiming);
        }
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  };

  const updateSessionData = async () => {
    setSessionUpdateLoad(true);
    try {
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + "/profile/SessionUpdate",
        {
          refStId: refStId,
          personalData: {
            refClMode: parseInt(
              (sessionData as { classModeId: string }).classModeId
            ),
            refPaId: parseInt((sessionData as { packageId: string }).packageId),
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
        setEdits({ ...edits, session: false });
      }
    } catch (error) {
      console.error("Error updating session data:", error);
      // Handle error (e.g., showing an error message)
    } finally {
      setSessionUpdateLoad(false);
      fetchCustomers();
      fetchUserDetails((refStId ?? "default_value").toString());
    }
  };
  const updateThreapyCountData = async () => {
    setSessionUpdateLoad(true); // Show loading indicator
    try {
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + "/profile/ThreapyUpdate",
        {
          id: refStId,
          threapyCount: threapyCount,
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
        setEdits({ ...edits, threapy: false });
      }
    } catch (error) {
      console.error("Error updating session data:", error);
    } finally {
      setSessionUpdateLoad(false);
      fetchCustomers();
      fetchUserDetails((refStId ?? "default_value").toString());
    }
  };
  const addThreapyCountData = async (e: any) => {
    e.preventdefault;
    setSessionUpdateLoad(true); // Show loading indicator
    try {
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + "/classInfo/addUserTherapyCount",
        {
          refStId: refStId,
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
        // alert("here")
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setEdits({ ...edits, threapy: false });
        toast.success("student thearpy attendance is marked successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          // transition: Bounce,
        });
      }
    } catch (error) {
      console.error("Error updating session data:", error);
    } finally {
      setSessionUpdateLoad(false);
      fetchCustomers();
      fetchUserDetails((refStId ?? "default_value").toString());
    }
  };

  function getCurrentMonthYear(): string {
    const date: Date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    return date.toLocaleDateString("en-US", options);
  }

  useEffect(() => {
    const token = localStorage.getItem("refUtId");
    console.log("token line ------- 475", token);
    if (token) {
      setUtId(token);
    }
    fetchCustomers();
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

  const nullToDash = (value: any) =>
    value === null || value === undefined ? "-" : value;

  return (
    <>
      <TabView className="overflow-hidden  ">
        {/* <TabPanel header="Overview"></TabPanel> */}
        <TabPanel header="Class Details">
          <ToastContainer />
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
              onSelectionChange={(e) =>
                setSelectedCustomers(e.value as Customer[])
              }
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
                header="Cust ID"
                body={userIdTemplate}
                frozen
                sortable
                style={{ minWidth: "12rem" }}
              />
              <Column
                field="fname"
                header="Name"
                style={{ minWidth: "14rem" }}
              />
              <Column
                field="mobile"
                header="Mobile"
                style={{ minWidth: "14rem" }}
              />
              <Column
                field="packageName"
                filter
                sortable
                filterElement={packageFilterTemplate}
                showFilterMatchModes={false}
                header="Package Name"
                body={(rowData) => nullToDash(rowData.packageName)}
                style={{ minWidth: "14rem" }}
              />
              <Column
                field="classMode"
                filter
                sortable
                filterElement={classModeFilterTemplate}
                showFilterMatchModes={false}
                header="Class Mode"
                body={(rowData) => nullToDash(rowData.classMode)}
                style={{ minWidth: "14rem" }}
              />

              <Column
                field="batch"
                filter
                sortable
                filterElement={batchFilterTemplate}
                showFilterMatchModes={false}
                header="Batch"
                body={(rowData) => nullToDash(rowData.batch)}
                style={{ minWidth: "14rem" }}
              />
              <Column
                field="therapy"
                filter
                sortable
                filterElement={therapyFilterTemplate}
                showFilterMatchModes={false}
                header="Therapy"
                body={(rowData) => nullToDash(rowData.therapy)}
                style={{ minWidth: "14rem" }}
              />
              <Column
                field="weekDaysTiming"
                filter
                sortable
                filterElement={weekDaysTimingFilterTemplate}
                showFilterMatchModes={false}
                header="Weekdays Timing"
                body={(rowData) => nullToDash(rowData.weekDaysTiming)}
                style={{ minWidth: "14rem" }}
              />
              <Column
                field="weekEndTiming"
                filter
                sortable
                filterElement={weekEndTimingFilterTemplate}
                showFilterMatchModes={false}
                header="Weekend Timing "
                body={(rowData) => nullToDash(rowData.weekEndTiming)}
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
                {selectedUserId
                  ? `User ID: ${selectedUserId}`
                  : "No user selected"}
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
                  {localStorage.getItem("refUtId") != "4" && (
                    <TabPanel header="Medical Details">
                      <p className="m-0">
                        {userDetails ? (
                          <>
                            <div className="mt-10">
                              <MedicalTabs refid={refid} />
                            </div>
                          </>
                        ) : (
                          <p>No user details available.</p>
                        )}
                      </p>
                    </TabPanel>
                  )}

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
                              className={`text-[15px] outline-none py-2 border-none px-3 font-bold cursor-pointer text-white rounded ${
                                sessionUpdateLoad
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
                                setEdits({ ...edits, session: true });
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
                                    label="Batch Type *"
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
                                {sessionData?.weekDaysTiming?.length ||
                                0 > 0 ? (
                                  <>
                                    <div className="w-[100%] lg:w-[48%]">
                                      <TextInput
                                        label="Weekdays Timing"
                                        id="mtype"
                                        name="classTime"
                                        type="text"
                                        value={sessionData?.weekDaysTiming}
                                        readonly
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <> </>
                                )}

                                {sessionData?.weekEndTiming?.length || 0 > 0 ? (
                                  <>
                                    <div className="w-[100%] lg:w-[48%]">
                                      <TextInput
                                        label="Weekend Timing"
                                        id="mtype"
                                        name="classTime"
                                        type="text"
                                        value={sessionData?.weekEndTiming}
                                        readonly
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )}
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
                                        weekDaysTimingId: "",
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
                                        weekDaysTimingId: "",
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
                                        weekDaysTimingId: "",
                                      }));
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] mt-[20px] justify-between">
                                {weekDaysTimingOption.length > 0 ? (
                                  <>
                                    <div className="w-[45%]">
                                      <SelectInput
                                        id="weekDaysTimingId"
                                        name="weekDaysTimingId"
                                        label="weekdays Timing*"
                                        options={weekDaysTimingOption}
                                        disabled={sessionUpdate <= 4}
                                        required
                                        value={
                                          sessionData?.weekDaysTimingId || ""
                                        }
                                        onChange={(e) => {
                                          setSessionUpdate(6);
                                          const { name, value } = e.target;
                                          setSessionData((prevData) => ({
                                            ...prevData,
                                            [name]: value,
                                          }));
                                        }}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )}

                                {weekEndTimingOption.length > 0 ? (
                                  <>
                                    <div className="w-[45%]">
                                      <SelectInput
                                        id="weekEndTimingId"
                                        name="weekEndTimingId"
                                        label="Weekend Timing *"
                                        options={weekEndTimingOption}
                                        disabled={sessionUpdate <= 4}
                                        required
                                        value={
                                          sessionData?.weekEndTimingId || ""
                                        }
                                        onChange={(e) => {
                                          setSessionUpdate(6);
                                          const { name, value } = e.target;
                                          setSessionData((prevData) => ({
                                            ...prevData,
                                            [name]: value,
                                          }));
                                        }}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateThreapyCountData();
                      }}
                    >
                      <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                        <div className="w-[100%] flex justify-between items-center mb-5">
                          <div className="text-[1.2rem] lg:text-[25px] font-bold">
                            Therapy Session
                          </div>
                          {refUtId === "7" ||
                          refUtId === "11" ||
                          refUtId === "12" ? (
                            <>
                              {threapyCount === 0 || threapyCount === null ? (
                                <></>
                              ) : (
                                <>
                                  {edits.threapy ? (
                                    <button
                                      className={`text-[15px] outline-none py-2 border-none px-3 font-bold cursor-pointer text-white rounded ${
                                        sessionUpdateLoad
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
                                        setEdits({ ...edits, threapy: true });
                                      }}
                                      className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                                    >
                                      Edit&nbsp;&nbsp;
                                      <i className="text-[15px] pi pi-pen-to-square"></i>
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                        <div className="w-[100%] flex justify-center items-center">
                          <div className="w-[100%] justify-center items-center flex flex-col">
                            <div className="w-[100%] flex flex-row lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                              {(threapyCount === 0 || threapyCount === null) &&
                              !edits.threapy ? (
                                <>
                                  <div className="flex justify-center w-[100%]">
                                    <h3 className="text-red-500">
                                      No Therapy Class Assigned
                                    </h3>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex flex-row w-[100%] justify-around">
                                    <div className="flex flex-column gap-2 w-[48%]">
                                      <label>No.of Session</label>
                                      <InputNumber
                                        value={threapyCount}
                                        required
                                        readOnly={!edits.threapy}
                                        onChange={(e) => {
                                          const value = e.value ?? 0; // If e.value is null, set it to 0
                                          setThreapyCount(value); // Update state with valid number
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Button
                                        severity="success"
                                        type="button"
                                        disabled={!thearpyBtn}
                                        className="h-[35px] w-[100%] mt-[27px]"
                                        label="Completed 1 session"
                                        onClick={(e) => {
                                          addThreapyCountData(e);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateThreapyCountData();
                      }}
                    >
                      <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                        <div className="w-[100%] flex justify-between items-center mb-5">
                          <div className="text-[1.2rem] lg:text-[25px] font-bold">
                            Class Count
                          </div>
                          {refUtId === "7" ||
                          refUtId === "11" ||
                          refUtId === "12" ? (
                            <></>
                          ) : (
                            <></>
                          )}
                        </div>
                        <div className="w-[100%] flex justify-center items-center">
                          <div className="w-[100%] justify-center items-center flex flex-col">
                            <p className="m-0">
                              <Fieldset
                                className="border-2 border-[#f95005] fieldData pb-[2rem] w-[50vw]"
                                legend={getCurrentMonthYear()}
                              >
                                <div className="flex flex-row gap-0 justify-around">
                                  <div>
                                    <th className="text-900 font-bold p-2 text-start">
                                      Yoga Class
                                    </th>
                                    <tr>
                                      <td className="text-900 font-bold p-2">
                                        Total Class
                                      </td>
                                      <td className="text-[#000] p-2">
                                        {classCount?.classCount || 0}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="text-900 font-bold p-2">
                                        Attended Class
                                      </td>
                                      <td className="text-[#000] p-2">
                                        {classCount?.classAttend || 0}
                                      </td>
                                      {/* <td className="text-[#000] p-2">{info[0].refCtMobile}</td> */}
                                    </tr>
                                    <tr>
                                      <td className="text-900 font-bold p-2">
                                        Remaining Class
                                      </td>
                                      <td className="text-[#000] p-2">
                                        {classCount?.classreCount || 0}
                                      </td>
                                    </tr>
                                  </div>
                                  <Divider layout="vertical" />
                                  <div>
                                    <th className="text-900 font-bold p-2 text-start">
                                      Therapy Session
                                    </th>
                                    <tr>
                                      <td className="text-900 font-bold p-2">
                                        Total Class
                                      </td>
                                      <td className="text-[#000] p-2">
                                        {classCount?.therapyCount || 0}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="text-900 font-bold p-2">
                                        Attended Class
                                      </td>
                                      <td className="text-[#000] p-2">
                                        {classCount?.thearpyAttend}
                                      </td>
                                      {/* <td className="text-[#000] p-2">{info[0].refCtMobile}</td> */}
                                    </tr>
                                    <tr>
                                      <td className="text-900 font-bold p-2">
                                        Remaining Class
                                      </td>
                                      <td className="text-[#000] p-2">
                                        {classCount?.thearpyreCount || 0}
                                      </td>
                                    </tr>
                                  </div>
                                </div>
                              </Fieldset>
                            </p>
                          </div>
                        </div>
                      </div>
                    </form>
                  </TabPanel>
                </TabView>
              </div>
            </Sidebar>
          </div>
        </TabPanel>
        <TabPanel header="Report">
          <ReportPageClass />
        </TabPanel>
      </TabView>
    </>
  );
};

export default ClassInfo;
