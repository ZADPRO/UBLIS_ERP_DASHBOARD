import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Axios from "axios";
import { Sidebar } from "primereact/sidebar";
import "./Attendance.css";
import { Calendar } from "primereact/calendar";
import SelectInput from "../../pages/Inputs/SelectInput";
import { TabPanel, TabView } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import Calenderss from "../10-Calender/Calenderss";
import { MultiSelect } from "primereact/multiselect";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import SessionTabs from "../../pages/SessionTabs/SessionTabs";

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

interface SessionOverviewData {
  attend_count: string;
  refDays: string;
  refPaID: number;
  refPackageName: string;
  refSDId: number;
  refSessonDays: string;
  refSessionMode: string;
  refTime: string;
  refTimeId: number;
  refTimingId: string;
  user_count: string;
}

interface AttendanceItem {
  formatted_punch_time: string;
  // Add other properties if they exist in the response
}

type DecryptResult = any;

const StaffAttendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<Customer[]>([]);

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

  const [pageLoading, setPageLoading] = useState({
    verifytoken: false,
    pageData: false,
  });
  const [userdata, setuserdata] = useState({
    username: "",
    usernameid: "",
    profileimg: { contentType: "", content: "" },
  });
  const [visibleLeft, setVisibleLeft] = useState(false);
  const [classType, setClassType] = useState("1");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>("Online");

  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  const [userFilteredAttendanceData, setUserFilteredAttendanceData] = useState<
    Attendance[]
  >([]);

  const clearClick = () => {
    setSelectedUser(null);
    setSearchQuery("");
    setFilteredAttendanceData([]);
  };

  const handleRowClick = async (rowData: RowData, month?: string) => {
    const response = await axios.post(
      import.meta.env.VITE_API_URL + "/attendance/user",
      {
        refCustId: rowData.refSCustId,
        month: month || "",
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
      const mappedData = data.attendanceResult.map(
        (item: AttendanceItem, index: number) => {
          const [date, time] = item.formatted_punch_time.split(", ");
          return {
            sno: index + 1,
            date: date.trim(),
            time: time.trim(),
          };
        }
      );
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

  const [overviewSessionData, setOverviewSessionData] =
    useState<SessionOverviewData | null>(null);

  useEffect(() => {
    Axios.get(import.meta.env.VITE_API_URL + "/attendance/overView", {
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

      setOverviewSessionData(data.attendanceCount);
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

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

      default:
        return null;
    }
  };
  // Handle dropdown changes
  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSession(e.target.value);
  };

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

            <TabView className="overflow-hidden m-2">
              <TabPanel header="Overview">
                <div className=" flex flex-row justify-evenly w-[100%]">
                  <div className="cardTesting w-[100%]">
                    <div className="cardOutlines card">
                      <div className="header">
                        <h3 className="text-[#f95005]">Offline</h3>
                        <div className="flex flex-row gap-10 w-[100%]">
                          <h3>{overviewSessionData?.refPackageName}</h3>
                          <h3>{overviewSessionData?.refTime}</h3>
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
                            <h3>{overviewSessionData?.user_count}</h3>
                          </div>
                          <div className="w-full md:w-2">
                            <Divider
                              layout="vertical"
                              className="hidden md:flex"
                            ></Divider>
                          </div>
                          <div
                            className="text-center"
                            style={{ inlineSize: "10rem" }}
                          >
                            <h4>Live Count</h4>
                            <h3>{overviewSessionData?.attend_count}</h3>
                          </div>

                          <div className="w-full md:w-2">
                            <Divider
                              layout="vertical"
                              className="hidden md:flex"
                            ></Divider>
                          </div>
                          <div
                            className="text-center"
                            style={{ inlineSize: "10rem" }}
                          >
                            <h4>Not Attended</h4>
                            <h3>
                              {Number(overviewSessionData?.user_count || 0) -
                                Number(overviewSessionData?.attend_count || 0)}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="cardOutlines card">
                      <div className="header">
                        <h3 className="text-[#f95005]">Online</h3>
                        <div className="flex flex-row gap-10 w-[100%]">
                          <h3>{overviewSessionData?.refPackageName}</h3>
                          <h3>{overviewSessionData?.refTime}</h3>
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
                            <h3>0</h3>
                          </div>
                          <div className="w-full md:w-2">
                            <Divider
                              layout="vertical"
                              className="hidden md:flex"
                            ></Divider>
                          </div>
                          <div
                            className="text-center"
                            style={{ inlineSize: "10rem" }}
                          >
                            <h4>Live Count</h4>
                            <h3>0</h3>
                          </div>

                          <div className="w-full md:w-2">
                            <Divider
                              layout="vertical"
                              className="hidden md:flex"
                            ></Divider>
                          </div>
                          <div
                            className="text-center"
                            style={{ inlineSize: "10rem" }}
                          >
                            <h4>Not Attended</h4>
                            <h3>0</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel header="Session">
                <SessionTabs />
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
                <div className="flex w-full justify-content-between">
                  <div className="flex w-[50%] gap-10 flex-col align-items-center">
                    <div className="flex flex-col w-full align-items-start">
                      <div className="flex w-full align-items-center">
                        <div className="m-3 w-full">
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
                              className="text-white text-[18px] bg-[#f95005] border-none p-2 rounded-md cursor-pointer"
                              onClick={clearClick}
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row w-full justify-center">
                        <div className="flex flex-col gap-3">
                          {!selectedUser && (
                            <DataTable
                              className="w-[400px]"
                              value={filteredAttendanceData}
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
                                style={{ minWidth: "7rem" }}
                              />
                              <Column
                                field="refCtMobile"
                                header="Mobile"
                                style={{ minWidth: "7rem" }}
                              />
                              <Column
                                field="refCtEmail"
                                header="Email"
                                style={{ minWidth: "8rem" }}
                              />
                              <Column
                                field="refStDOB"
                                header="DOB"
                                style={{ minWidth: "8rem" }}
                              />
                            </DataTable>
                          )}

                          {selectedUser && (
                            <div className="w-full flex flex-col align-items-center justify-center">
                              <div
                                className="flex flex-col justify-start p-4 w-full rounded-md"
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
                                  style={{ minWidth: "12rem" }}
                                />
                                <Column
                                  field="time"
                                  header="Time"
                                  style={{ minWidth: "10rem" }}
                                />
                              </DataTable>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-[50%]">
                    {selectedUser && (
                      <Calenderss
                        selectedUser={selectedUser}
                        userFilteredAttendanceData={userFilteredAttendanceData}
                        handleRowClick={(rowData, month) => {
                          handleRowClick(rowData, month);
                        }}
                      />
                    )}
                  </div>
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
