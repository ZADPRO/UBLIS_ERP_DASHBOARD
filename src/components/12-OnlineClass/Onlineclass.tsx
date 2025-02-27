import { Skeleton } from "primereact/skeleton";
import React from "react";

import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Axios from "axios";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Column } from "primereact/column";
import { MdDelete } from "react-icons/md";
import { Sidebar } from "primereact/sidebar";

import { IoAdd } from "react-icons/io5";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";

interface GoogleWorkspaceInterface {
  meetingId: number;
  meetingName: string;
  dummy1: string;
  dummy2: string;
}

const Onlineclass: React.FC = () => {
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
  const [changes, setChnages] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const [googleWorkspaceLink, setGoogleWorkspaceLink] = useState<
    GoogleWorkspaceInterface[]
  >([]);
  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | GoogleWorkspaceInterface[]
  >([]);
  const [visibleLeft, setVisibleLeft] = useState(false);
  const [meetingDetailsSidebar, setMeetingSidebar] = useState(false);
  const [visibleRight, setVisibleRight] = useState<boolean>(false);
  const [title, setTile] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [startdate, setStartdate] = useState<Date | null>(null);
  const [description, setDescription] = useState<string>("");
  const [enddate, setEnddate] = useState<Date | null>(null);
  const [datetime12h, setDateTime12h] = useState(null);

  useEffect(() => {
    const data = [
      {
        meetingId: 101,
        meetingName: "Meeting Name 1",
        dummy1: "Dummy1",
        dummy2: "Dummy 2",
      },
    ];
    setGoogleWorkspaceLink(data);
  }, []);

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
  const onUserIdClick = (id: string, rowData: string) => {
    setVisibleLeft(true);
  };

  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const onMeetingClick = (rowData: any) => {
    setSelectedMeeting(rowData);
    setMeetingSidebar(true);
  };
  const meetingIdTemplate = (rowData: any) => (
    <Button
      label={rowData.meetingId}
      className="p-button-link"
      onClick={() => onMeetingClick(rowData)}
    />
  );

  const [emails, setEmails] = useState(['']); // Initialize with one empty email

  const handleAddEmail = () => {
    setEmails([...emails, '']); // Add a new empty email to the array
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleDeleteEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  return (
    <>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5] AttendancePage">
            <div className="headerPrimary">
              <h3>ONLINE CLASS</h3>
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
              <h3>Online Class</h3>
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
          <div>
            <div>
              <div className="routesCont">
                <div className="routeContents">
                  <div className="filterHeaders">
                    <div className="flex justify-between">
                      <div className="text-xl">Google Workspace</div>
                      <Button
                        severity="success"
                        label="Add New Employee"
                        onClick={() => {
                          setVisibleRight(true);
                        }}
                      />
                    </div>
                  </div>
                  <Divider />
                </div>
              </div>

              <Sidebar
                visible={visibleRight}
                onHide={() => setVisibleRight(false)}
                position="right"
                style={{ width: "60vw" }}
              >
                <div className="flex flex-row justify-between">
                  {" "}
                  <h2>Add New Meeting</h2>
                  <Button
                    className="w-[20%] mt-3 h-[20%]"
                    severity="info"
                    label="Create Meeting"
                    onClick={() => {
                      setVisibleRight(true);
                    }}
                  />
                </div>

                {/* Form content starts here */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault(); // Prevent default form submission
                    //   handleAddStaff(); // Call your submit function if validation passes
                  }}
                >
                  <div>
                    <div className="w-[100%] ">
                      <div>
                        <div className="flex flex-col gap-2 p-3">
                          <div
                            className="p-fluid grid"
                            style={{ justifyContent: "center" }}
                          >
                            <div className="field col-8">
                              <span className="p-float-label">
                                <InputText
                                  id="title"
                                  value={title}
                                  onChange={(e) => setTile(e.target.value)}
                                  required
                                />
                                <label htmlFor="title">Title</label>
                              </span>
                            </div>
                            <div className="flex flex-row">
                              <div className="field col-6">
                                <span className="p-float-label">
                                  <Calendar
                                    id="startdate"
                                    value={startdate}
                                    onChange={(e) => setStartdate(e.value)}
                                    showTime
                                    hourFormat="12"
                                    required
                                  />

                                  <label htmlFor="startdate">Start Date</label>
                                </span>
                              </div>

                              <div className="field col-6">
                                <span className="p-float-label">
                                  <Calendar
                                    id=""
                                    value={enddate}
                                    onChange={(e) => setEnddate(e.value)}
                                    dateFormat="dd/mm/yy"
                                    showTime
                                    hourFormat="12"
                                    required
                                  />
                                  <label htmlFor="enddate">End Date</label>
                                </span>
                              </div>
                            </div>
                            <div className="field col-8">
                              <span className="p-float-label">
                                <InputText
                                  id="description"
                                  value={description}
                                  onChange={(e) =>
                                    setDescription(e.target.value)
                                  }
                                  required
                                />
                                <label htmlFor="firstName">Discription</label>
                              </span>
                            </div>
                          </div>

                          <div className="mx-10 w-[full]">
                            <div className="flex flex-row w-[full] gap-3 p-2">
                              <p className="text-lg font-medium">Add User</p>
                              <Button
                                 className="h-[10%] w-[6%] mt-3"
                                  icon={<IoAdd size={20} />}
                                  severity="success"
                                  aria-label="Add"
                                  onClick={handleAddEmail}
                                />
                            </div>

                            {showDescription && (
                              <div className="mx-10 w-full">
                           
                        
                              {emails.map((email, index) => (
                                <div key={index} className="flex gap-3 w-[100%] mb-2">
                                  <div className="p-float-label w-[70%] ">
                                    <InputText
                                      id={`email-${index}`}
                                      value={email}
                                      onChange={(e) => handleEmailChange(index, e.target.value)}
                                      required
                                    />
                                    <label htmlFor={`email-${index}`}>Email</label>
                                  </div>
                                  <Button
                                    className="text-red-500 bg-white"
                                    icon={<MdDelete size={24} />}
                                    onClick={() => handleDeleteEmail(index)}
                                    aria-label="Delete"
                                  />
                                </div>
                              ))}
                            </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </Sidebar>

              <Sidebar
                visible={meetingDetailsSidebar}
                onHide={() => setMeetingSidebar(false)}
                position="right"
                style={{ width: "60vw" }}
              >
                <DataTable tableStyle={{ minWidth: "50rem" }}>
                  <Column field="customerID" header="CustomerID"></Column>
                  <Column field="name" header="Name"></Column>
                  <Column field="mobile" header="Mobile"></Column>
                  <Column field="email" header="Email"></Column>
                  <Column field="remove" header="Remove"></Column>
                </DataTable>
              </Sidebar>

              <div>
                <div className="card">
                  <DataTable
                    // rowGroupMode="subheader"
                    sortMode="single"
                    value={googleWorkspaceLink}
                    sortOrder={1}
                    // expandableRowGroups
                    tableStyle={{ minWidth: "50rem" }}
                  >
                    <Column
                      field="meetingId"
                      body={meetingIdTemplate}
                      header="Meeting ID"
                      style={{ width: "20%" }}
                    ></Column>
                    <Column
                      field="meetingName"
                      header="Meeting Name"
                      style={{ width: "20%" }}
                    ></Column>
                    <Column
                      field="dummy1"
                      header="Dummy1"
                      style={{ width: "20%" }}
                    ></Column>
                    <Column
                      field="dummy2"
                      header="Dummy2"
                      style={{ width: "20%" }}
                    ></Column>
                  </DataTable>

                  {/* <Sidebar
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
        
        </div>
      </Sidebar>
       */}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Onlineclass;
