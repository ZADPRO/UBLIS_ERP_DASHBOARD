import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Axios from "axios";
// import { Sidebar } from "primereact/sidebar";
import "./Attendance.css";
// import { Calendar } from "primereact/calendar";
// import SelectInput from "../../pages/Inputs/SelectInput";
import { TabPanel, TabView } from "primereact/tabview";
// import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import Calenderss from "../10-Calender/Calenderss";
// import { MultiSelect } from "primereact/multiselect";
// import { IoSearch } from "react-icons/io5";
import axios from "axios";
import SessionTabs from "../../pages/SessionTabs/SessionTabs";
import OverviewAttendance from "../../pages/02-OverviewAttendnace/OverviewAttendance";

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
  reftime: string;
  refCtMobile: string;
  refCtEmail: string;
  weekDaysTiming: string;
  weekEndTiming: string
}

interface SelectedUser {
  id: number;
  userName: string;
  userId: string;
  userEmail: string;
  reftime: string;
  refPackageName: string;
  weekDaysTiming: string;
  weekEndTiming: string
}

type Attendance = {
  sno: number;
  date: string;
  time: string;
};

interface RegularSession {
  refTimeId: number;
  reftime: string;
  usercount: number;
  attendancecount: number;
  kidscount: number;
  malecount: number;
  femalecount: number;
}
interface NearestSession {
  nearestRefTimeId: {
    refTimeId: number;
    reftime: string;
    usercount: number;
    attendancecount: number;
    startTime: string;
    kidscount: number;
    malecount: number;
    femalecount: number;
  };
}

type AttendanceData = RegularSession | NearestSession;

interface AttendanceItem {
  formatted_punch_time: string;
  // Add other properties if they exist in the response
}

type DecryptResult = any;

const StaffAttendance: React.FC = () => {
  // const [attendanceData, setAttendanceData] = useState<Customer[]>([]);

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
      console.log('data', data)

      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setFilteredAttendanceData(data.searchResult);
      }

      console.log(data);
    });
  };

  const [pageLoading, setPageLoading] = useState({
    verifytoken: false,
    pageData: false,
  });
  const [userdata, setuserdata] = useState({
    username: "",
    usernameid: "",
    profileimg: { contentType: "", content: "" },
  });
  // const [visibleLeft, setVisibleLeft] = useState(false);
  // const [classType, setClassType] = useState("1");
  // const [startDate, setStartDate] = useState<Date | null>(null);
  // const [endDate, setEndDate] = useState<Date | null>(null);
  // const [selectedSession, setSelectedSession] = useState<string>("Online");

  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [rowData, setRowData] = useState<RowData | null>(null);

  const [searchList, setSearchList] = useState(false);
  const [showData, setShowData] = useState(false);

  const [userFilteredAttendanceData, setUserFilteredAttendanceData] = useState<
    Attendance[]
  >([]);

  const clearClick = () => {
    setShowData(false);
    setSelectedUser(null);
    setSearchQuery("");
    setFilteredAttendanceData([]);
  };

  const handleRowClick = async (rowData: RowData, month?: string) => {
    setShowData(true), setSearchList(false);

    if (rowData) {
      setRowData({
        refStId: rowData.refStId,
        refStFName: rowData.refStFName,
        refSCustId: rowData.refSCustId,
        refStLName: rowData.refStLName,
        refPackageName: rowData.refPackageName,
        reftime: rowData.reftime,
        refCtMobile: rowData.refCtMobile,
        refCtEmail: rowData.refCtEmail,
        weekDaysTiming: rowData.weekDaysTiming,
        weekEndTiming: rowData.weekEndTiming
      });
    }
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
    if (data.token == false) {
      navigate("/expired");
    } else {
      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
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
        reftime: rowData.reftime,
        weekEndTiming: rowData.weekEndTiming,
        weekDaysTiming: rowData.weekDaysTiming,
      });
    }
  };

  // const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  // const preferredTimeOptions = [
  //   { label: "8 AM - 10 AM", value: "Morning" },
  //   { label: "12 PM - 2 PM", value: "Afternoon" },
  //   { label: "6 PM - 8 PM", value: "Evening" },
  // ];
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
    useState<AttendanceData | null>(null);

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
      console.log('data', data)
      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setOverviewSessionData(data.attendanceCount);
      }
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const handleCalendarMonthChange = (month: number, year: number) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthName = monthNames[month - 1];

    const formattedMonthYear = `${monthName},${year}`;
    if (rowData) {
      handleRowClick(rowData, formattedMonthYear);
    } else {
      console.error("rowData is null");
    }

    console.log(`Formatted Month & Year: ${formattedMonthYear}`);
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
            <div className="headerPrimary fixed w-[95.5%]">
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

            <TabView className="overflow-hidden m-2 pt-[10vh]">
              <TabPanel header="Overview">
                <OverviewAttendance overviewSessionData={overviewSessionData} />

              </TabPanel>
              <TabPanel header="Session">
                <SessionTabs />
              </TabPanel>
              <TabPanel
                header="User Attendance"
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
                {showData ? (
                  <></>
                ) : (
                  <div className="w-full flex flex-col justify-center align-items-center">
                    <div className="flex w-[60%] align-items-center">
                      <div className="m-3 w-full">
                        <IconField iconPosition="left">
                          <InputIcon className="pi pi-search"></InputIcon>
                          <InputText
                            placeholder="Search By CustomerId, Firstname, Mobile, Email, DOB, Username"
                            // disabled={selectedUser}
                            value={searchQuery}
                            onChange={(e) => {
                              handleSearchChange(e);

                              if (e.target.value.length > 0) {
                                setSearchList(true);
                              } else {
                                setSearchList(false);
                              }
                            }}
                          />
                        </IconField>
                      </div>
                      {selectedUser && <div></div>}
                    </div>
                    {searchList ? (
                      <div className="flex w-full align-items-center justify-center ">
                        <DataTable
                          className="w-[60%] border-2 border-gray-500 custom-header"
                          value={filteredAttendanceData}
                          scrollable
                          scrollHeight="400px"
                          onRowClick={(e) => handleRowClick(e.data as RowData)} // Ensure e.data is typed as RowData
                          rowClassName={() =>
                            "hover:bg-gray-300 cursor-pointer"
                          }
                        >
                          <Column
                            field="fullName"
                            header="Name"
                            frozen
                            body={(rowData: RowData) =>
                              `${rowData.refStFName} ${rowData.refStLName}`
                            }
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
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                )}

                <div className="flex w-full justify-content-between">
                  <div className="flex w-[50%] flex-col align-items-center">
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row w-full justify-center">
                        <div className="flex flex-col w-[90%]">
                          {selectedUser && (
                            <div className="w-full flex flex-col align-items-center justify-center">
                              <div
                                className="flex flex-col justify-start p-4 w-full rounded-md"
                                style={{ border: "3px solid #f95005" }}
                              >
                                <div className="flex flex-row w-full align-items-center justify-center">
                                  <div className="w-[95%]">
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
                                        :{" "}
                                        {selectedUser.userName
                                          .charAt(0)
                                          .toUpperCase() +
                                          selectedUser.userName
                                            .slice(1)
                                            .toLowerCase()}
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
                                        : {selectedUser.refPackageName}
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
                                        Weekdays
                                      </p>
                                      <p
                                        style={{
                                          width: "60%",
                                          fontSize: "18px",
                                          paddingLeft: "10px",
                                        }}
                                      >
                                        : {selectedUser.weekDaysTiming}
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
                                        Weekend
                                      </p>
                                      <p
                                        style={{
                                          width: "60%",
                                          fontSize: "18px",
                                          paddingLeft: "10px",
                                        }}
                                      >
                                        : {selectedUser.weekEndTiming}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="w-[5%]">
                                    <button
                                      className="text-white text-[17px] bg-[#f95005] border-none p-2 rounded-md cursor-pointer pi pi-times"
                                      onClick={clearClick}
                                    ></button>
                                  </div>
                                </div>
                              </div>
                              <DataTable
                                value={userFilteredAttendanceData}
                                className="w-full mt-3 border-2 border-gray-400 custom-header"
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
                        onMonthChange={handleCalendarMonthChange} // Pass the callback function
                      />
                    )}
                  </div>
                </div>
              </TabPanel>
            </TabView>
          </div>
        </>
      )}
    </>
  );
};

export default StaffAttendance;
