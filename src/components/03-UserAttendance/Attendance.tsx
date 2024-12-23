// import React from "react";

// const UserAttendance: React.FC = () => {
//   return (
//     <div className="flex justify-center items-center w-[100%] h-screen">
//       <h1>Attendence - Coming Soon</h1>
//     </div>
//   );
// };

// export default UserAttendance;


import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";
import React from "react";
import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Axios from "axios";
import { Sidebar } from "primereact/sidebar";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import SelectInput from "../../pages/Inputs/SelectInput";

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
}

const StaffAttendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<Customer[]>([]);

  useEffect(() => {
    const dummyData: Customer[] = [
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "Doe",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
        status2: "",
        comments: "No issues",
      },
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "Doe",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
        status2: "",
        comments: "No issues",
      },
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "Doe",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
        status2: "",
        comments: "No issues",
      },
      {
        Username: "001",
        Sessionname: "U001",
        Punchtime: "John",
        Attend_not: "Doe",
        Online_Offline: "john.doe@example.com",
        NotAttend: "12",
        Attend: "32",
        Signup: "dad33",
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
          <div className="card m-1" style={{ overflow: "auto" }}>
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
            <div className="flex flex-row ">
              <div className="basicProfileCont m-[10px] lg:m-[30px] p-[5px] lg:p-[5px]  shadow-lg">
                <div className="w-[100%] flex flex-row justify-between  items-center mb-5 p-[15px]">
                  <div>
                    {" "}
                    <div className="flex flex-row justify-between  pl-3 pr-3">
                      <h3 className="m-1">Online</h3>
                      <button className=" mb-1 text-[1rem] p-2 w-[20%] h-[20%] text-white bg-[#f95005] border-none  rounded-md">
                        view
                      </button>
                    </div>
                    <DataTable value={attendanceData}>
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
                        style={{ inlineSize: "20rem" }}
                      />
                    </DataTable>
                  </div>
                </div>
              </div>
              <div className="basicProfileCont m-[10px] lg:m-[30px] p-[5px] lg:p-[5px]  shadow-lg">
                <div className="w-[100%] flex flex-row justify-between  items-center mb-5 p-[15px]">
                  <div>
                    {" "}
                    <div className="flex flex-row justify-between  pl-3 pr-3">
                      <h3 className="m-1">Offline</h3>
                      <button className=" mb-1 text-[1rem] p-2 w-[20%] h-[20%] text-white bg-[#f95005] border-none  rounded-md">
                        view
                      </button>
                    </div>
                    <DataTable value={attendanceData}>
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
                        style={{ inlineSize: "20rem" }}
                      />
                    </DataTable>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Sidebar
            style={{ width: "70%" }}
            visible={visibleLeft}
            position="right"
            onHide={() => setVisibleLeft(false)}
          >
            <h2>12 Classes in One month duration</h2>
            <div className="w-[80%]  mt-5 px-5 flex flex-row justify-around lg:m-5">
              <div className="w-[50%] gap-5">
                <SelectInput
                  id="classtype"
                  name="classtype"
                  label=""
                  // label="Class Type *"
                  options={[
                    { value: "1", label: "Per Day" },
                    { value: "2", label: "Monthly" },
                  ]}
                  required
                />
              </div>
              <div>
                <Calendar
                  className="relative w-full  h-10  placeholder-transparent transition-all border-2 rounded outline-none peer border-bg-[#f95005] box-border-[#f95005] border-[#b3b4b6] text-[#4c4c4e] autofill:bg-white dateInput"
                  // value={inputs.dob}
                  // onChange={(e) => handleInput(e)}
                  name="dob"
                />
              </div>
              <div></div>

              <div>
                <button className="w-[200%] h-[100%] text-white bg-[#f95005] border-none p-1 rounded-md">
                  Submit
                </button>
              </div>
            </div>

            <hr />
            <div className="flex p-4 px-2">
              <Button type="button" severity="success" label="Download" />
            </div>
            <DataTable value={attendanceData}>
              <Column
                field="Username"
                header="User Name "
                style={{ inlineSize: "15rem" }}
              />

              <Column
                field="Sessionname"
                header="Session Name"
                style={{ inlineSize: "18rem" }}
              />
              <Column
                field="Punchtime"
                header="Punch Time"
                style={{ inlineSize: "14rem" }}
              />
              <Column
                field="Attend_not"
                header="Attended or Not Attended"
                style={{ inlineSize: "30rem" }}
              />
              <Column
                field="Online_Offline"
                header="Online/Offline"
                style={{ inlineSize: "20rem" }}
              />
            </DataTable>
          </Sidebar>
          {/* <Sidebar
            style={{ width: "70%" }}
            visible={visibleLeft}
            position="right"
            onHide={() => setVisibleLeft(false)}
          >
            <h2>Attendance Report</h2>
          
          </Sidebar> */}
        </>
      )}
    </>
  );
};

export default StaffAttendance;

