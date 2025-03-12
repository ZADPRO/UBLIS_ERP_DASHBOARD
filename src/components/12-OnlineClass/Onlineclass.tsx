import { Skeleton } from "primereact/skeleton";
import React from "react";

import { useNavigate } from "react-router-dom";
import { MdContentCopy } from "react-icons/md";
import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Axios from "axios";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { MdDelete } from "react-icons/md";
import { Sidebar } from "primereact/sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoAdd } from "react-icons/io5";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { MdOutlineDelete } from "react-icons/md";

import { Dropdown } from "primereact/dropdown";
import GMeetMembersSidebar from "../../pages/GMeetMembersSidebar/GMeetMembersSidebar";

interface SelectedMeeting {
  refBranchName: string;
  refCreatedDate: string;
  refEndTime: string;
  refGoogleMeetId: string;
  refMLTypeName: string;
  refMeetEnd: string;
  refMeetStartFrom: string;
  refMeetingDescription: string;
  refMeetingLink: string;
  refMeetingTitle: string;
  refStartTime: string;
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
  const [showEmail, setShowEmail] = useState(false);

  const [googleWorkspaceLink, setGoogleWorkspaceLink] = useState([]);
  const [visibleLeft, setVisibleLeft] = useState(false);
  const [googleMeetDesc, setGoogleMeetDesc] = useState(false);

  const [meetingDetailsSidebar, setMeetingSidebar] = useState(false);

  const [visibleRight, setVisibleRight] = useState<boolean>(false);
  const [title, setTile] = useState<string>("");
  const [startdate, setStartdate] = useState<Date | null>(null);
  const [description, setDescription] = useState<string>("");
  const [enddate, setEnddate] = useState<Date | null>(null);
  const [starttime, setStarttime] = useState<Nullable<Date>>(null);
  const [endtime, setEndtime] = useState<Nullable<Date>>(null);

  // const [branch, setBranch] = useState(null);
  const [ids, setIds] = useState([]);
  const [branchtype, setBranchtype] = useState([]);
  const [MeetingLinkType, setMeetingLinkType] = useState([]);
  const [branch, setBranch] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    meetingdetails();

  }, []);

  const resetForm = () => {
    setTile("");
    setStartdate(null);
    setEnddate(null);
    setStarttime(null);
    setEndtime(null);
    setDescription("");
    setIds([]);
    setBranchtype([]);
    setEmails([]);
    setShowEmail(false);
  };

  const handleCreateMeeting = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Form Submitted");
      await Createmeeting();
      setVisibleRight(false); // Close the sidebar
      resetForm(); // Reset form fields
      meetingdetails();
    } catch (error) {
      console.error("Error creating meeting:", error);
    } finally {
      setLoading(false);
    }
  };

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
      }
    });
  }, []);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const onUserIdClick = (id: string, rowData: string) => {
    setVisibleLeft(true);
  };

  const [selectedMeeting, setSelectedMeeting] = useState<SelectedMeeting>();

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

  const [emails, setEmails]: any = useState([]);

  const handleAddEmail = () => {
    setShowEmail(true);
    setEmails([...emails, { email: "" }]); // Add an empty object with an email field
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...emails]; // Create a copy of the emails array
    updatedEmails[index].email = value; // Update the email at the specified index
    setEmails(updatedEmails); // Update the state with the modified array
  };

  const handleDeleteEmail = (index: number) => {
    const updatedEmails = emails.filter((_: any, i: any) => i !== index); // Remove email at the specified index
    setEmails(updatedEmails); // Update the state with the filtered array
  };

  const meetinglinktype = async () => {
    try {
      const response = await Axios.get(
        import.meta.env.VITE_API_URL + `/googleWorkspace/MeetingLinkType`,
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

      if (data.token === false) {
        navigate("/expired");
        return;
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token);

        const options = data.MeetingType.map((Data: any) => ({
          label: Data.refMLTypeName,
          value: Data.refMLinkId,
        }));
        setMeetingLinkType(options);

        const options1 = data.branch.map((Data: any) => ({
          label: Data.refBranchName,
          value: Data.refbranchId,
        }));
        setBranch(options1);
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
    }
  };

  const meetingdetails = async () => {
    try {
      const response = await Axios.get(
        import.meta.env.VITE_API_URL + `/googleWorkspace/MeetingList`,
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

      console.log("data line ----- 233", data);
      if (data.token === false) {
        navigate("/expired");
        return;
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token);
        setGoogleWorkspaceLink(data.data);
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
    }
  };

  const handleAddNewMeeting = async () => {
    setVisibleRight(true);
    await meetinglinktype();
  };

  const handleDelete = async (meetingId: any) => {
    console.log("meetingId line ------ 258", meetingId);
    try {
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/googleWorkspace/DeleteMeeting`,
        {
          meetingId: meetingId,
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
      console.log("data line 270", data);
      if (data.success) {
        meetingdetails();
      }

    } catch (error) {
      console.error("Error deleting meeting:", error);
    }
  };

  const Createmeeting = async () => {
    const formattedStartDate = startdate
      ? startdate.toLocaleDateString("en-GB")
      : "";
    const formattedEndDate = enddate ? enddate.toLocaleDateString("en-GB") : "";
    const formattedStartTime = starttime
      ? starttime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "";
    const formattedEndTime = endtime
      ? endtime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "";

    console.log(
      ids,
      branchtype,
      title,
      formattedStartDate,
      formattedEndDate,
      formattedStartTime,
      formattedEndTime,
      description
    );

    console.log(emails);

    const payload = {
      title: title,
      startDateStr: formattedStartDate,
      endDateStr: formattedEndDate,
      startTimeStr: formattedStartTime,
      endTimeStr: formattedEndTime,
      description: description,
      attendees: emails,
      meetingType: ids,
      branchId: branchtype,
    };

    try {
      const res = await Axios.post(
        import.meta.env.VITE_API_URL + "/googleWorkspace/CreateMeeting",
        payload,
        {
          headers: {
            Authorization: localStorage.getItem("JWTtoken"),
            "Content-Type": "application/json",
          },
        }
      );

      const data = decrypt(
        res.data[1],
        res.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );

      if (data.token === false) {
        navigate("/expired");
      } else {
        console.log("Meeting created successfully", data);
      }
    } catch (error) {
      console.error("Error creating meeting: ", error);
    }
  };

  return (
    <>
      <ToastContainer />
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
                        label="Add New Meeting"
                        onClick={handleAddNewMeeting}
                      />
                    </div>
                  </div>
                  <Divider />
                </div>
              </div>

              <Sidebar
                visible={visibleRight}
                onHide={() => {
                  setVisibleRight(false);
                  resetForm();
                }}
                position="right"
                style={{ width: "60vw" }}
              >
                {/* Form content starts here */}
                <form onSubmit={handleCreateMeeting}>
                  <div>
                    <div className="w-[100%] ">
                      <div className="flex flex-row justify-between">
                        {" "}
                        <h2>Add New Meeting</h2>
                        <Button
                          type="submit"
                          className="w-[20%] mt-3 h-[20%]"
                          severity="info"
                          label={loading ? "Creating..." : "Create Meeting"}
                          disabled={loading}
                          icon={loading ? "pi pi-spin pi-spinner" : ""}
                        />
                      </div>
                      <div>
                        {visibleRight && (
                          <div className="card flex justify-evenly">
                            <Dropdown
                              value={ids}
                              options={MeetingLinkType}
                              optionLabel="label"
                              optionValue="value"
                              placeholder="Select a Meeting Type"
                              className="w-[40%] h-[35px]"
                              checkmark={true}
                              highlightOnSelect={false}
                              required
                              onChange={(e) => setIds(e.value)}
                            />
                            <Dropdown
                              value={branchtype}
                              options={branch}
                              optionLabel="label"
                              optionValue="value"
                              placeholder="Select a Branch"
                              className="w-[40%] h-[35px]"
                              checkmark={true}
                              highlightOnSelect={false}
                              required
                              onChange={(e) => setBranchtype(e.value)}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex flex-col gap-2 p-3 mt-3">
                          <div
                            className="p-fluid grid"
                            style={{ justifyContent: "center" }}
                          >
                            <div className="field col-8">
                              <span className="p-float-label">
                                <InputText
                                  id="title"
                                  value={title}
                                  required
                                  onChange={(e) => setTile(e.target.value)}
                                />
                                <label htmlFor="title">Meeting Title</label>
                              </span>
                            </div>
                            <div className="flex flex-row">
                              <div className="field col-6">
                                <span className="p-float-label">
                                  <Calendar
                                    id="startdate"
                                    value={startdate}
                                    onChange={(e) =>
                                      setStartdate(e.value ?? null)
                                    }
                                    showButtonBar
                                    required
                                    dateFormat="dd/mm/yy"
                                  />

                                  <label htmlFor="startdate">Start Date</label>
                                </span>
                              </div>

                              <div className="field col-6">
                                <span className="p-float-label">
                                  <Calendar
                                    id="enddate"
                                    value={enddate}
                                    onChange={(e) =>
                                      setEnddate(e.value ?? null)
                                    }
                                    showButtonBar
                                    dateFormat="dd/mm/yy"
                                    minDate={
                                      startdate
                                        ? new Date(
                                          startdate.getTime() + 86400000
                                        )
                                        : undefined
                                    }
                                    required
                                  />

                                  <label htmlFor="enddate">End Date</label>
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-row">
                              <div className="field col-6">
                                <span className="p-float-label">
                                  <Calendar
                                    id="startdate"
                                    value={starttime}
                                    onChange={(e) => setStarttime(e.value)}
                                    timeOnly
                                    required
                                    hourFormat="12"
                                  />

                                  <label htmlFor="startdate">Start Time</label>
                                </span>
                              </div>

                              <div className="field col-6">
                                <span className="p-float-label">
                                  <Calendar
                                    id="endtime"
                                    value={endtime}
                                    onChange={(e) => setEndtime(e.value)}
                                    timeOnly
                                    required
                                    hourFormat="12"
                                  />
                                  <label htmlFor="endtime">End Time</label>
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

                          <div className="mx-10 w-full">
                            <div className="flex flex-row w-full gap-3 p-2">
                              <p className="text-lg font-medium">Add User</p>
                              <Button
                                className="h-[10%] w-[6%] mt-3"
                                icon={<IoAdd size={20} />}
                                severity="success"
                                aria-label="Add"
                                onClick={handleAddEmail}
                              />
                            </div>

                            {showEmail && (
                              <div className="mx-10 w-full">
                                {emails.map((emailObj: any, index: any) => (
                                  <div
                                    key={index}
                                    className="flex gap-3 mt-5 w-full mb-2"
                                  >
                                    <div className="p-float-label w-[70%]">
                                      <InputText
                                        id={`email-${index}`}
                                        value={emailObj.email}
                                        onChange={(e) =>
                                          handleEmailChange(
                                            index,
                                            e.target.value
                                          )
                                        }
                                        required
                                        type="email"
                                      />
                                      <label htmlFor={`email-${index}`}>
                                        Email
                                      </label>
                                    </div>
                                    <Button
                                      className="text-red-500 bg-white"
                                      icon={<MdDelete size={24} />}
                                      onClick={() => handleDeleteEmail(index)} // Handle delete
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

              <Sidebar
                visible={googleMeetDesc}
                onHide={() => setGoogleMeetDesc(false)}
                position="right"
                style={{ width: "75vw" }}
              >
                {selectedMeeting && (
                  <GMeetMembersSidebar selectedMeeting={selectedMeeting} />
                )}
              </Sidebar>

              <div>
                <div className="card">
                  <DataTable
                    sortMode="single"
                    className="googleMeetDatatable"
                    scrollable
                    scrollHeight="80vh" // This can be removed if you are using max-height in CSS
                    value={googleWorkspaceLink}
                    sortOrder={1}
                  >
                    <Column
                      header="S.No"
                      style={{ width: "10%" }}
                      body={(_rowData, { rowIndex }) => rowIndex + 1}
                    />
                    <Column
                      field="refMeetingTitle"
                      header="Meeting Title"
                      style={{ minWidth: "14rem", cursor: "pointer" }}
                      body={(rowData) => (
                        <span
                          className="text-blue-500 hover:underline cursor-pointer"
                          onClick={() => {
                            setSelectedMeeting(rowData);
                            setGoogleMeetDesc(true);
                          }}
                        >
                          {rowData.refMeetingTitle}
                        </span>
                      )}
                    />
                    <Column
                      field="refMeetingLink"
                      header="Meeting Link"
                      style={{ minWidth: "22rem" }}
                      body={(rowData) => (
                        <div className="flex items-center justify-between gap-2">
                          <p>{rowData.refMeetingLink}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard
                                .writeText(rowData.refMeetingLink || "")
                                .then(() => {
                                  toast.success(
                                    `"${rowData.refMeetingTitle}" Meeting Link is copied Successfully`,
                                    {
                                      position: "top-right",
                                      autoClose: 5000,
                                      hideProgressBar: false,
                                      closeOnClick: true,
                                      pauseOnHover: true,
                                      draggable: true,
                                      progress: undefined,
                                      theme: "light",
                                    }
                                  );
                                })
                                .catch(() => {
                                  toast.error(
                                    `Failed To Copy the Meeting of "${rowData.refMeetingTitle}"`,
                                    {
                                      position: "top-right",
                                      autoClose: 5000,
                                      hideProgressBar: false,
                                      closeOnClick: true,
                                      pauseOnHover: true,
                                      draggable: true,
                                      progress: undefined,
                                      theme: "light",
                                    }
                                  );
                                });
                            }}
                            className="text-blue-500 hover:bg-blue-500 hover:text-white px-2 py-1 rounded border-transparent bg-transparent"
                          >
                            <MdContentCopy size={"1.2rem"} />
                          </button>
                        </div>
                      )}
                    />
                    <Column
                      field="refMLTypeName"
                      header="Meeting Type"
                      style={{ minWidth: "14rem" }}
                    />
                    <Column
                      field="refCreatedDate"
                      header="Created Date"
                      style={{ minWidth: "13rem" }}
                    />
                    <Column
                      header="Remove"
                      body={(rowData) => (
                        <button
                          onClick={() => handleDelete(rowData.refGoogleMeetId)}
                          className="border-transparent text-red-500 rounded bg-transparent hover:bg-red-500 hover:text-white"
                        >
                          <MdOutlineDelete size={"1.5rem"} />
                        </button>
                      )}
                    />
                  </DataTable>
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
