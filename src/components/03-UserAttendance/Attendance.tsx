import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Axios from "axios";
import "./Attendance.css";
import Calenderss from "../10-Calender/Calenderss";
import { Panel } from "primereact/panel";

// interface Customer {
//   Username: string;
//   Sessionname: string;
//   Punchtime: string;
//   Attend_not: string;
//   Online_Offline: string;
//   NotAttend: string;
//   Attend: string;
//   Signup: string;
//   status2: string;
//   comments: string;
// }

type Attendance = {
  sno: number;
  date: string;
  time: string;
};

interface SelectedUser {
  id: number;
  userName: string;
  userId: string;
  userEmail: string;
  reftime: string;
  refPackageName: string;
  refSCustId: string;
}

// interface Data {
//   refStId: number;
//   refStFName: string;
//   refSCustId: string;
//   refStLName: string;
//   refPackageName: string;
//   refTime: string;
//   refCtMobile: string;
//   refCtEmail: string;
// }

interface AttendanceItem {
  formatted_punch_time: string;
  // Add other properties if they exist in the response
}

const StaffAttendance: React.FC = () => {
  // const [attendanceData, setAttendanceData] = useState<Customer[]>([]);

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

  const decrypt = (
    encryptedData: string,
    iv: string,
    key: string
  ): DecryptResult => {
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(encryptedData),
    });

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

  const [userFilteredAttendanceData, setUserFilteredAttendanceData] = useState<
    Attendance[]
  >([]);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  // const [rowData, setRowData] = useState<Data | null>(null);

  const userData = async () => {
    const response = await Axios.get(
      import.meta.env.VITE_API_URL + "/attendance/userData",
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
        setSelectedUser({
          id: data.data.refStId,
          userName: `${data.data.refStFName} ${data.data.refStLName}`,
          userId: data.data.refSCustId,
          refPackageName: data.data.refPackageName,
          userEmail: data.data.refCtEmail,
          reftime: data.data.refTime,
          refSCustId: data.data.refSCustId,
        });
      }
    }
  };

  useEffect(() => {
    userData();
  }, []);

  const handleRowClick = async (month?: string) => {
    const response = await Axios.post(
      import.meta.env.VITE_API_URL + "/attendance/user",
      {
        refCustId: selectedUser?.refSCustId,
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
    }
  };

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
    if (selectedUser) {
      handleRowClick(formattedMonthYear);
    } else {
      console.error("rowData is null");
    }

    console.log(`Formatted Month & Year: ${formattedMonthYear}`);
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set mobile view if width <= 768px
    };

    handleResize(); // Check initial screen size
    window.addEventListener("resize", handleResize); // Add resize listener

    return () => {
      window.removeEventListener("resize", handleResize); // Clean up listener
    };
  }, []);

  return (
    <>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5] AttendancePage">
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
          {!isMobile && (
            <div className="headerPrimary">
              <h3>Attendance</h3>
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
          )}
          <div className="card m-1 AttendancePage" style={{ overflow: "auto" }}>
            <div className="flex flex-row">
              <div className="flex lg:flex-row gap-10 flex-col w-full justify-content-between">
                <div className="flex lg:w-[50%] flex-col align-items-center">
                  <div className="flex flex-col w-full">
                    <div className="flex flex-row w-full justify-center">
                      <div className="flex flex-col w-[90%]">
                        {selectedUser && (
                          <div className="w-full flex flex-col align-items-center justify-center">
                            <Panel header="User Details" className="w-full">
                              <p>
                                Username:{" "}
                                {selectedUser.userName.charAt(0).toUpperCase() +
                                  selectedUser.userName.slice(1).toUpperCase()}
                              </p>
                              <p>User ID: {selectedUser.userId}</p>
                              <p>
                                Session:{" "}
                                {selectedUser.refPackageName
                                  ? selectedUser.refPackageName
                                  : "Not Available"}
                              </p>
                              <p>
                                Timing:{" "}
                                {selectedUser.reftime
                                  ? selectedUser.reftime
                                  : "Not Available"}
                              </p>
                            </Panel>
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
                <div className="flex lg:w-[50%]">
                  {selectedUser && (
                    <Calenderss
                      selectedUser={selectedUser}
                      userFilteredAttendanceData={userFilteredAttendanceData}
                      onMonthChange={handleCalendarMonthChange} // Pass the callback function
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StaffAttendance;
