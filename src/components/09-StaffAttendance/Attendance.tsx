import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Axios from "axios";
import { Sidebar } from "primereact/sidebar";
import "./Attendance.css";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import SelectInput from "../../pages/Inputs/SelectInput";
import { TabPanel, TabView } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import Calenderss from "../10-Calender/Calenderss";
import { View } from "@react-pdf/renderer";
import { MultiSelect } from "primereact/multiselect";
import { IoSearch } from "react-icons/io5";
import axios from "axios";

interface Customer {
  Username: string;
  Sessionname: string;
  Punchtime: string;
  Attend_not: string;
  Online_Offline: string;
  NotAttend: string;
  Attend: string;
  Signup: string;
  status2: string;
  comments: string;
  classType: string;
}

interface RowData {
  refStId: number;
  refStFName: string;
  refSCustId: string;
  refStLName: string;
  refPackageName: string;
  refTime: string;
  refCtMobile: string;
  refCtEmail: string;
}

interface SelectedUser {
  id: number;
  userName: string;
  userId: string;
  userEmail: string;
  refTime: string;
  refPackageName: string;
}

type Attendance = {
  sno: number;
  date: string;
  time: string;
};

const StaffAttendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<Customer[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const handleSubmit = async () => {
    if (!searchQuery) {
      alert("Please enter a search query");
      return;
    }
    setIsLoading(true); // Show loading state
    setError(null); // Reset error state

    try {
      // Make API request to fetch user data
      const response = await fetch(
        `/api/v1/attendance/userSearch?query=${searchQuery}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      // Parse the response data
      const data = await response.json();
      setUserData(data); // Update state with the fetched user data
      setSearchFocused(false); // Hide search content after submission
    } catch (err: any) {
      setError(err.message); // Handle error if API request fails
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  const [filteredAttendanceData, setFilteredAttendanceData] = useState<
    Customer[]
  >([]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log("e.target.value", e.target.value);
    Axios.post(
      import.meta.env.VITE_API_URL + "/attendance/userSearch",
      {
        searchText: e.target.value,
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
      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setFilteredAttendanceData(data.searchResult);
      }

      console.log(data);
    });
  };

  // const handleSearchFocus = () => {
  //   setSearchFocused(true); // Hide the content when search bar is clicked
  // };

  useEffect(() => {
    const dummyData: Customer[] = [
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "20",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
        status2: "",
        comments: "No issues",
        classType: "",
      },
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "10",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
        status2: "",

        classType: "",
        comments: "No issues",
      },
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "5",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
        classType: "",
        status2: "",
        comments: "No issues",
      },
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "3",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
        classType: "",
        status2: "",
        comments: "No issues",
      },
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "5",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
        classType: "",
        status2: "",
        comments: "No issues",
      },
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "5",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
        classType: "",
        status2: "",
        comments: "No issues",
      },
    ];

    // Update state with dummy data inside useEffect
    setAttendanceData(dummyData);
  }, []);

  type DecryptResult = any;
  const [pageLoading, setPageLoading] = useState({
    verifytoken: false,
    pageData: false,
  });
  const [userdata, setuserdata] = useState({
    username: "",
    usernameid: "",
    profileimg: { contentType: "", content: "" },
  });
  const [visibleLeft, setVisibleLeft] = useState(true);
  const [classType, setClassType] = useState("1");
  const [startDate, setStartDate] = useState<Date | null>(null); // For Cust Date - start date
  const [endDate, setEndDate] = useState<Date | null>(null); // For Cust Date - end date
  const [selectedSession, setSelectedSession] = useState<string>("Online");
  const [selectedClass, setSelectedClass] = useState<string>("Online");

  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  const [userFilteredAttendanceData, setUserFilteredAttendanceData] = useState<
    Attendance[]
  >([]);

  const clearClick = () => {
    setSelectedUser(null);
    setSearchQuery("");
    setFilteredAttendanceData([]);
  };

  const handleRowClick = async (rowData: RowData) => {
    const response = await axios.post(
      import.meta.env.VITE_API_URL + "/attendance/user",
      {
        refCustId: rowData.refSCustId,
        month: "",
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

    console.log("data", data);

    if (data.success) {
      const mappedData = data.attendanceResult.map((item, index) => {
        const [date, time] = item.formatted_punch_time.split(", ");
        return {
          sno: index + 1, // Assign a serial number
          date: date.trim(),
          time: time.trim(),
        };
      });
      console.log("mappedData", mappedData);

      setUserFilteredAttendanceData(mappedData);
    }

    setSelectedUser({
      id: rowData.refStId,
      userName: `${rowData.refStFName} ${rowData.refStLName}`,
      userId: rowData.refSCustId,
      refPackageName: rowData.refPackageName,
      userEmail: rowData.refCtEmail,
      refTime: rowData.refTime,
    });
  };

  const [sessionData, setSessionData] = useState({
    sessionName: "Weekend class",
    sessionTime: "(10:10 AM to 11:10 AM)",
    registeredCount: 30,
    liveCount: 25,
    notAttendedCount: 5,
  });
  // const [userData, setUserData] = useState({
  //   userName: "John Doe", // Example username
  //   userId: "00121", // Example user ID
  //   userEmail: "abc@gmail.com",
  // });
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const preferredTimeOptions = [
    { label: "8 AM - 10 AM", value: "Morning" },
    { label: "12 PM - 2 PM", value: "Afternoon" },
    { label: "6 PM - 8 PM", value: "Evening" },
  ];
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
      if (data.token == false) {
        navigate("/expired");
      } else {
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
  //   const handleEndDateChange = (date: Date | Date[]) => {
  //     if (Array.isArray(date)) {
  //       setEndDate(date[0]);
  //     } else {
  //       // Ensure the end date is within the same month as the start date
  //       if (startDate) {
  //         const startMonth = startDate.getMonth();
  //         const selectedMonth = date.getMonth();
  //         if (startMonth !== selectedMonth) {
  //           alert("End date must be in the same month as the start date.");
  //           return;
  //         }
  //       }
  //       setEndDate(date);
  //     }
  //   };
  const fetchSessionData = async () => {
    try {
      const response = await Axios.get("YOUR_BACKEND_API_URL");
      setSessionData(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState({
    userName: "",
    userId: "",
    userEmail: "",
  });
  // const [attendanceData, setAttendanceData] = useState([]); // Adjust based on your data structure
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true); // Disable inputs and start loading
    try {
      const response = await fetch("/api/v1/attendance/userSearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({
          userName: data.userName || "N/A",
          userId: data.userId || "N/A",
          userEmail: data.userEmail || "N/A",
        });
        setAttendanceData(data.attendance || []);
      } else {
        console.error("Error fetching user data:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Re-enable inputs
    }
  };

  const renderCalendar = () => {
    switch (classType) {
      case "1":
        return (
          <div className=" flex flex-row w-[100%] ">
            <div className="w-[200%] px-3">
              <Calendar
                placeholder="Choose date"
                value={startDate}
                // onChange={(date: Date | Date[]) => setStartDate(date as Date)}
                className="relative w-full h-10 placeholder-transparent transition-all border-2 rounded outline-none peer border-bg-[#f95005] box-border-[#f95005] border-[#b3b4b6] text-[#4c4c4e] autofill:bg-white dateInput"
              />

              {/* <div>
                <button className="w-[100%] h-[100%] text-white bg-[#f95005] border-none p-2 rounded-md">
                  Submit
                </button>
              </div> */}
            </div>
            <div className="w-[200%] px-3">
              <SelectInput
                id="sessionSelect"
                name="sessionSelect"
                label="SessionType *"
                onChange={handleSessionChange} // Handle dropdown changes
                options={[
                  { value: "Online", label: "Online" },
                  { value: "Offline", label: "Offline" },
                ]}
                required
              />
            </div>
            <div className="w-[100%] px-3">
              <MultiSelect
                id="preferredTime"
                value={preferredTimes}
                options={preferredTimeOptions}
                onChange={(e) => setPreferredTimes(e.value)}
                className="w-full"
              />
            </div>
            <div className="w-[100%] px-3 text-[30px] text-[#f95005]">
              <IoSearch />
            </div>
            {/* <div className="w-[100%]">
                <button className="w-[100%] h-[100%] text-white bg-[#f95005] border-none p-2 rounded-md">
                  Submit
                </button>
              </div> */}
          </div>
        );
      case "2":
        return (
          <>
            <div className=" flex flex-row w-[100%] ">
              <div className="flex flex-row gap-3 justify-between w-[200%] px-3 ">
                {/* Start Date */}
                <div className="w-[100%]  ">
                  <Calendar
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => {
                      const selectedDate = e.value as Date;
                      setStartDate(selectedDate);
                    }}
                    className="relative w-full h-10 placeholder-transparent transition-all border-2 rounded outline-none peer border-bg-[#f95005] box-border-[#f95005] border-[#b3b4b6] text-[#4c4c4e] autofill:bg-white dateInput"
                  />
                </div>

                {/* End Date */}
                <div className="w-[100%]">
                  <Calendar
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.value as Date)}
                    minDate={
                      startDate
                        ? new Date(startDate.getTime()) // Clone the startDate to avoid mutating it
                        : undefined
                    } // Set minDate to the selected start date
                    maxDate={
                      startDate
                        ? new Date(
                            startDate.getFullYear(),
                            startDate.getMonth() + 1, // Next month
                            0 // Last day of the next month
                          )
                        : undefined
                    } // Set maxDate to the end of the next month
                    monthNavigator
                    yearNavigator
                    className="relative w-full h-10 placeholder-transparent transition-all border-2 rounded outline-none peer border-bg-[#f95005] box-border-[#f95005] border-[#b3b4b6] text-[#4c4c4e] autofill:bg-white dateInput"
                  />
                </div>
                {/* <div>
                <button className="w-[100%] h-[100%] text-white bg-[#f95005] border-none p-2 rounded-md">
                  Submit
                </button>
              </div> */}
              </div>
              <div className="w-[150%] px-2 ">
                <SelectInput
                  id="sessionSelect"
                  name="sessionSelect"
                  label="SessionType *"
                  onChange={handleSessionChange} // Handle dropdown changes
                  options={[
                    { value: "Online", label: "Online" },
                    { value: "Offline", label: "Offline" },
                  ]}
                  required
                />
              </div>
              <div className="w-[100%] px-3">
                <MultiSelect
                  id="preferredTime"
                  value={preferredTimes}
                  options={preferredTimeOptions}
                  onChange={(e) => setPreferredTimes(e.value)}
                  className="w-full"
                />
              </div>
              <div className="w-[100%] text-[30px] px-3 text-[#f95005]">
                <IoSearch />
              </div>
            </div>
          </>
          // <>
          //   <div className="flex flex-row justify-between w-[30%] gap-3 px-3">
          //     <Calendar
          //       placeholder="Choose date"
          //       value={startDate}
          //       className="relative w-full h-10 placeholder-transparent transition-all border-2 rounded outline-none peer border-bg-[#f95005] box-border-[#f95005] border-[#b3b4b6] text-[#4c4c4e] autofill:bg-white dateInput"
          //       view="month"
          //       dateFormat="mm/yy"
          //     />
          //     {/* <div>
          //       <button className="w-[100%] h-[100%] text-white bg-[#f95005] border-none p-2 rounded-md">
          //         Submit
          //       </button>
          //     </div> */}
          //   </div>
          // </>
        );

      // case "3":
      //   return (
      //     <>
      //       <div className="flex flex-row justify-between w-[100%] gap-3 px-3">
      //         <Calendar
      //           placeholder="Choose date"
      //           value={startDate}
      //           className="relative w-full h-10 placeholder-transparent transition-all border-2 rounded outline-none peer border-bg-[#f95005] box-border-[#f95005] border-[#b3b4b6] text-[#4c4c4e] autofill:bg-white dateInput"
      //           view="month"
      //           dateFormat="mm/yy"
      //         />
      //         <div>
      //           <button className="w-[100%] h-[100%] text-white bg-[#f95005] border-none p-2 rounded-md">
      //             Submit
      //           </button>
      //         </div>
      //       </div>
      //     </>
      //   );
      default:
        return null;
    }
  };
  // Handle dropdown changes
  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSession(e.target.value);
  };
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
  };
  // Sample attendance data for Online and Offline
  const attendanceDataOnline = [
    { Sessionname: "Weekend", Signup: 30, Attend: 25, NotAttend: 5 },
    { Sessionname: "20 classes", Signup: 20, Attend: 18, NotAttend: 2 },
  ];

  const attendanceDataOffline = [
    { Sessionname: "Weekend ", Signup: 25, Attend: 20, NotAttend: 5 },
    { Sessionname: "20 classes", Signup: 15, Attend: 12, NotAttend: 3 },
  ];

  return (
    <>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5]">
            <div className="headerPrimary">
              <h3>ATTENDANCE</h3>
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
          <div className="card m-1" style={{ overflow: "hidden" }}>
            <div className="headerPrimary">
              <h3>ATTENDANCE</h3>
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

            <TabView className="overflow-hidden">
              <TabPanel header="Overview">
                <div className=" flex flex-row justify-evenly w-[100%]">
                  <div className="cardTesting w-[100%]">
                    {localStorage.getItem("refUtId") === "4" ? (
                      <></>
                    ) : (
                      <div className="cardOutlines card]">
                        <div className="header">
                          <h3 className="text-[#f95005]">Online</h3>
                          <div className="flex flex-row gap-10 w-[100%]">
                            <h3>{sessionData.sessionName}</h3>
                            <h3>{sessionData.sessionTime}</h3>
                          </div>
                          <Divider
                            layout="horizontal"
                            className="flex"
                            align="center"
                          ></Divider>
                          <div className="flex flex-row w-[full]">
                            <div
                              className="text-center"
                              style={{ inlineSize: "15rem" }}
                            >
                              <h4>Registered Count</h4>
                              <h3>{sessionData.registeredCount}</h3>
                            </div>
                            <div className="w-full md:w-2">
                              <Divider
                                layout="vertical"
                                className="hidden md:flex"
                              ></Divider>
                              <Divider
                                layout="horizontal"
                                className="flex md:hidden"
                                align="center"
                              ></Divider>
                            </div>
                            <div
                              className="text-center"
                              style={{ inlineSize: "10rem" }}
                            >
                              <h4>Live Count</h4>
                              <h3>{sessionData.liveCount}</h3>
                            </div>

                            <div className="w-full md:w-2">
                              <Divider
                                layout="vertical"
                                className="hidden md:flex"
                              ></Divider>
                              <Divider
                                layout="horizontal"
                                className="flex md:hidden"
                                align="center"
                              ></Divider>
                            </div>
                            <div
                              className="text-center"
                              style={{ inlineSize: "10rem" }}
                            >
                              <h4>Not Attended</h4>
                              <h3>{sessionData.notAttendedCount}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="cardTesting w-[100%]">
                    {localStorage.getItem("refUtId") === "4" ? (
                      <></>
                    ) : (
                      <div className="cardOutlines card">
                        <div className="header">
                          <h3 className="text-[#f95005]">Offline</h3>
                          <div className="flex flex-row gap-10 w-[100%]">
                            <h3>{sessionData.sessionName}</h3>
                            <h3>{sessionData.sessionTime}</h3>
                          </div>
                          <Divider
                            layout="horizontal"
                            className="flex"
                            align="center"
                          ></Divider>
                          <div className="flex flex-row w-[full]">
                            <div
                              className="text-center"
                              style={{ inlineSize: "15rem" }}
                            >
                              <h4>Registered Count</h4>
                              <h3>{sessionData.registeredCount}</h3>
                            </div>
                            <div className="w-full md:w-2">
                              <Divider
                                layout="vertical"
                                className="hidden md:flex"
                              ></Divider>
                              <Divider
                                layout="horizontal"
                                className="flex md:hidden"
                                align="center"
                              ></Divider>
                            </div>
                            <div
                              className="text-center"
                              style={{ inlineSize: "10rem" }}
                            >
                              <h4>Live Count</h4>
                              <h3>{sessionData.liveCount}</h3>
                            </div>

                            <div className="w-full md:w-2">
                              <Divider
                                layout="vertical"
                                className="hidden md:flex"
                              ></Divider>
                              <Divider
                                layout="horizontal"
                                className="flex md:hidden"
                                align="center"
                              ></Divider>
                            </div>
                            <div
                              className="text-center"
                              style={{ inlineSize: "10rem" }}
                            >
                              <h4>Not Attended</h4>
                              <h3>{sessionData.notAttendedCount}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabPanel>
              <TabPanel
                header="Session"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="flex flex-col mt-3">
                  {/* Dropdown */}

                  {/* <div className="w-[30%] px-10">
                    <SelectInput
                      id="classSelect"
                      name="classSelect"
                      label="Classes *"
                      onChange={handleClassChange} // Handle dropdown changes
                      options={[
                        { value: "Online", label: "Online" },
                        { value: "Offline", label: "Offline" },
                      ]}
                      required
                    />
                  </div> */}
                  <div className="w-[100%] gap-5  mt-5 px-3 flex flex-row justify-evenly lg:m-5">
                    <div className="w-[25%] gap-5">
                      <SelectInput
                        id="classtype"
                        name="classtype"
                        label="ClassType *"
                        // label="Class Type *"
                        options={[
                          { value: "1", label: "Per Day" },
                          { value: "2", label: "Monthly" },
                        ]}
                        // {renderCalendar()}
                        onChange={(e) => {
                          setClassType(e.target.value);
                          console.log(e.target.value);
                        }}
                        required
                      />
                    </div>
                    <div className="w-[100%]"> {renderCalendar()}</div>
                  </div>

                  {/* Display Data Tables Based on Selection */}
                  <div className="flex flex-row w-[100%]">
                    {(selectedSession === "Online" ||
                      selectedSession === "Online and Offline") && (
                      <div className="basicProfileCont m-[10px] lg:m-[30px] p-[5px] lg:p-[5px] w-[60%] shadow-lg">
                        <div className="w-[100%] flex flex-row justify-between items-center mb-5 p-[15px]">
                          <div>
                            <div className="flex flex-row justify-between w-[100%] pl-3 pr-3">
                              <h3 className="m-1 text-[#f95005]">Online</h3>
                              <button className="mb-1 text-[1rem] p-2 w-[10%] h-[20%] text-white bg-[#f95005] border-none p-1 rounded-md">
                                View
                              </button>
                            </div>
                            <DataTable
                              className="w-[100%] "
                              value={attendanceDataOnline}
                            >
                              <Column
                                field="Sessionname"
                                header="Session"
                                frozen
                                style={{ inlineSize: "15rem" }}
                              />
                              <Column
                                field="Signup"
                                header="Enrolled"
                                style={{ inlineSize: "18rem" }}
                              />
                              <Column
                                field="Attend"
                                header="Attended"
                                style={{ inlineSize: "14rem" }}
                              />
                              <Column
                                field="NotAttend"
                                header="Not Attended"
                                style={{ inlineSize: "15rem" }}
                              />
                            </DataTable>
                          </div>
                        </div>
                      </div>
                    )}

                    {(selectedSession === "Offline" ||
                      selectedSession === "Online and Offline") && (
                      <div className="basicProfileCont m-[10px] lg:m-[30px] p-[5px] lg:p-[5px] w-[60%] shadow-lg">
                        <div className="w-[100%] flex flex-row justify-between items-center mb-5 p-[15px]">
                          <div>
                            <div className="flex flex-row justify-between pl-3 pr-3">
                              <h3 className="m-1 text-[#f95005]">Offline</h3>
                              <button className="mb-1 text-[1rem] p-2 w-[10%] h-[20%] text-white bg-[#f95005] border-none p-1 rounded-md">
                                View
                              </button>
                            </div>
                            <DataTable value={attendanceDataOffline}>
                              <Column
                                field="Sessionname"
                                header="Session"
                                frozen
                                style={{ inlineSize: "15rem" }}
                              />
                              <Column
                                field="Signup"
                                header="Enrolled"
                                style={{ inlineSize: "18rem" }}
                              />
                              <Column
                                field="Attend"
                                header="Attended"
                                style={{ inlineSize: "14rem" }}
                              />
                              <Column
                                field="NotAttend"
                                header="Not Attended"
                                style={{ inlineSize: "15rem" }}
                              />
                            </DataTable>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabPanel>
              <TabPanel
                header="User"
                className=""
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  justifyContent: "flex-end",
                  overflow: "hidden",
                  marginTop: "-10px",
                }}
              >
                <div className="flex flex-col w-full">
                  <div className="flex flex-row align-items-center">
                    <div className="w-[40%] m-2">
                      <IconField iconPosition="left">
                        <InputIcon className="pi pi-search"></InputIcon>
                        <InputText
                          placeholder="Search"
                          disabled={selectedUser}
                          value={searchQuery}
                          onChange={handleSearchChange}
                        />
                      </IconField>
                    </div>
                    {selectedUser && (
                      <div>
                        <button
                          className="w-[85px] h-[40px] text-white text-[18px] bg-[#f95005] border-none p-2 rounded-md cursor-pointer"
                          onClick={clearClick}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Conditional rendering for TabPanel content */}
                  {searchFocused ? (
                    <div className="flex justify-center items-center w-full h-screen">
                      {/* Placeholder while search is focused */}
                      <p className="text-xl font-bold">Searching...</p>
                    </div>
                  ) : (
                    <div className="flex flex-row w-full justify-between mt-5">
                      {/* User Data, DataTable, and Calendar */}
                      <div className="flex flex-col w-[48%] gap-3">
                        {/* DataTable */}
                        {/* ATTENDANCE DATA TABLE - 917 */}
                        {!selectedUser && (
                          <DataTable
                            value={filteredAttendanceData}
                            className="w-full mt-3"
                            scrollable
                          >
                            <Column
                              field="fullName"
                              header="Name"
                              frozen
                              body={(rowData: RowData) => (
                                <span
                                  onClick={() => handleRowClick(rowData)}
                                  style={{
                                    cursor: "pointer",
                                    color: "blue",
                                  }}
                                >
                                  {`${rowData.refStFName} ${rowData.refStLName}`}
                                </span>
                              )}
                              style={{ minWidth: "10rem" }}
                            />
                            <Column
                              field="refCtMobile"
                              header="Mobile"
                              style={{ minWidth: "13rem" }}
                            />
                            <Column
                              field="refCtEmail"
                              header="Email"
                              style={{ minWidth: "10rem" }}
                            />
                            <Column
                              field="refStDOB"
                              header="Date Of Birth"
                              style={{ minWidth: "10rem" }}
                            />
                          </DataTable>
                        )}

                        {/* User data section */}

                        {selectedUser && (
                          <>
                            <div
                              className="flex flex-col justify-start p-4 w-full rounded-xl mt-4"
                              style={{ border: "3px solid #f95005" }}
                            >
                              <div className="h-[25px] mt-[-30px] flex">
                                <p
                                  style={{
                                    width: "30%",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#f95005",
                                    textAlign: "left",
                                  }}
                                >
                                  User Name
                                </p>
                                <p
                                  style={{
                                    width: "60%",
                                    fontSize: "18px",
                                    paddingLeft: "10px",
                                  }}
                                >
                                  : {selectedUser.userName}
                                </p>
                              </div>
                              <div className="w-full h-[25px] flex">
                                <p
                                  style={{
                                    width: "30%",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#f95005",
                                    textAlign: "left",
                                  }}
                                >
                                  User ID
                                </p>
                                <p
                                  style={{
                                    width: "60%",
                                    fontSize: "18px",
                                    paddingLeft: "10px",
                                  }}
                                >
                                  : {selectedUser.userId}
                                </p>
                              </div>
                              <div className="w-full h-[25px] flex">
                                <p
                                  style={{
                                    width: "30%",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#f95005",
                                    textAlign: "left",
                                  }}
                                >
                                  Session
                                </p>
                                <p
                                  style={{
                                    width: "60%",
                                    fontSize: "18px",
                                    paddingLeft: "10px",
                                  }}
                                >
                                  : {selectedUser.refPackageName} -{" "}
                                  {selectedUser.refTime}
                                </p>
                              </div>
                            </div>
                            <DataTable
                              value={userFilteredAttendanceData}
                              className="w-full mt-3"
                              scrollHeight="350px"
                              scrollable
                            >
                              <Column
                                field="sno"
                                header="S.No"
                                style={{ minWidth: "3rem" }}
                              />
                              <Column
                                field="date"
                                header="Date"
                                style={{ minWidth: "10rem" }}
                              />
                              <Column
                                field="time"
                                header="Time"
                                style={{ minWidth: "10rem" }}
                              />
                            </DataTable>
                          </>
                        )}
                      </div>

                      <div className="w-[48%]">
                        {selectedUser && (
                          <Calenderss
                            selectedUser={selectedUser}
                            userFilteredAttendanceData={
                              userFilteredAttendanceData
                            }
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>
            </TabView>
            <Sidebar
              style={{ width: "70%" }}
              visible={visibleLeft}
              position="right"
              onHide={() => setVisibleLeft(false)}
            >
              <h2>12 Classes in One month duration</h2>
              <div className="flex flex-col justify-center align-middle w-[100%] ">
                <div className="w-[100%]  mt-5 px-3 flex flex-row justify-evenly lg:m-5">
                  <div className="w-[48%] gap-5">
                    <SelectInput
                      id="classtype"
                      name="classtype"
                      label=""
                      // label="Class Type *"
                      options={[
                        { value: "1", label: "Per Day" },
                        { value: "2", label: "Custom Date" },
                        { value: "3", label: "Monthly" },
                      ]}
                      // {renderCalendar()}
                      onChange={(e) => {
                        setClassType(e.target.value);
                        console.log(e.target.value);
                      }}
                      required
                    />
                  </div>
                  {renderCalendar()}
                </div>
                <DataTable value={attendanceData} className="w-[100%]">
                  <Column
                    field="Sessionname"
                    header="Session "
                    frozen
                    style={{ inlineSize: "15rem" }}
                  />

                  <Column
                    field="Signup"
                    header="Enrolled "
                    style={{ inlineSize: "18rem" }}
                  />
                  <Column
                    field="Attend"
                    header="Attended"
                    style={{ inlineSize: "14rem" }}
                  />
                  <Column
                    field="NotAttend"
                    header="Not Attended"
                    style={{ inlineSize: "15rem" }}
                  />
                </DataTable>
              </div>
            </Sidebar>
          </div>
        </>
      )}
    </>
  );
};

export default StaffAttendance;
