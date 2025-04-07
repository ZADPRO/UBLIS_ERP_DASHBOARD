import Axios from "axios";
import React, { useEffect, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosArrowDown } from "react-icons/io";
import CryptoJS from "crypto-js";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IoIosArrowUp } from "react-icons/io";
import { IoPersonRemoveSharp } from "react-icons/io5";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useNavigate } from "react-router-dom";
import { MultiSelect } from "primereact/multiselect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

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
  weekEndTiming: string;
}
interface GMeetMembersSidebarProps {
  selectedMeeting: SelectedMeeting;
}

interface GmeetStudent {
  refBranchId: number;
  refCtEmail: string;
  refCtMobile: string;
  refSCustId: string;
  refStFName: string;
  refStId: number;
  refStLName: string;
  status: string;
}

interface GMeetStudentProps {
  gmeetStudent: GmeetStudent;
}

type DecryptResult = any;

const GMeetMembersSidebar: React.FC<GMeetMembersSidebarProps> = ({
  selectedMeeting,
}) => {
  console.log("selectedMeeting--------", selectedMeeting);

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
  const [loading, setLoading] = useState(false);
  const [gmeetStudentDetails, setGmeetStudentDetails] = useState<
    GMeetStudentProps[]
  >([]);



  useEffect(() => {
    GetMembers(selectedMeeting.refGoogleMeetId);
  }, []);
  const navigate = useNavigate();

  const [meetingInfo, setMeetingInfo] = useState(false);

  const deleteMembers = async (email: string, meetingId: string) => {
    const response = await Axios.post(
      import.meta.env.VITE_API_URL + `/googleWorkspace/RemoveMemberFromMeeting`,
      {
        meetingId: meetingId,
        studentEmail: email,
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

    if (data.token == false) {
      navigate("/expired");
    } else {
      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
      if (data.success) {
        toast.success(`Student removed from the meeting Successfully`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        toast.error(`can not remove the student form the meeting link`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }
  };
  const AddNewMembers = async () => {
    setLoading(true);
    try {
      const emailIds = refSelectedMembers.map((member) => member.code);
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/googleWorkspace/AddMembersInMeeting`,
        {
          meetingId: selectedMeeting.refGoogleMeetId,
          studentEmails: emailIds,
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
      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        if (data.success) {
          toast.success(`Members Added Successfully`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setAddMembers(false);
          setSearchQuery("");
          setSelectedRows([]);
          setSelectedMembers([]);
          setRefSelectedMembers([]);
          setSearchList(false);
          GetMembers(selectedMeeting.refGoogleMeetId);
        } else {
          toast.error(`Error in Adding New Members`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
      }
    } catch (error) {
      console.error("Error adding members:", error);
    } finally {
      setLoading(false);
    }
  };

  const GetMembers = async (meetingId: any) => {
    try {
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + `/googleWorkspace/GetMembersInMeeting`,
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
      console.log('data line ------- 244 \n', data)
      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        if (data.success) {
          setGmeetStudentDetails(data.Data);
        }
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
    }
  };

  const handleRemoveMeeting = (Data: any, meetingId: string) => {
    toast.warning(
      <div>
        <p>
          Are you sure you want to remove{" "}
          <b>
            {Data.refSCustId} - {Data.refStFName} {Data.refStLName}
          </b>
          ?
        </p>
        <div className="flex justify-center w-[100%] gap-2 mt-2">
          <button
            className="px-3 py-1 w-[30%] bg-red-500 text-white rounded border-none"
            onClick={() => {
              deleteMembers(Data.refCtEmail, meetingId);
              toast.dismiss();
              GetMembers(selectedMeeting.refGoogleMeetId);
            }}
          >
            Yes
          </button>
          <button
            className="px-3 py-1 w-[30%] bg-gray-300 text-black rounded border-none"
            onClick={() => toast.dismiss()}
          >
            No
          </button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false, // Disable auto close to wait for user confirmation
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
      }
    );
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchList, setSearchList] = useState(false);
  // const [showData, setShowData] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<
    { name: string; code: string }[]
  >([]);
  const [refSelectedMembers, setRefSelectedMembers] = useState<
    { name: string; code: string }[]
  >([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
      console.log("data", data);

      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setFilteredAttendanceData(data.searchResult);
      }
    });
  };
  const [selectedRows, setSelectedRows] = useState<RowData[]>([]);

  const [filteredAttendanceData, setFilteredAttendanceData] = useState<
    RowData[]
  >([]);

  const handleRowSelection = (e: { value: RowData[] }) => {
    setSelectedRows(e.value);

    // Convert selected rows to required format
    const formattedMembers = e.value.map((row) => ({
      name: `${row.refSCustId} - ${row.refStFName} ${row.refStLName} - ${row.refCtEmail}`,
      code: row.refCtEmail,
    }));

    setSelectedMembers(formattedMembers);
    setRefSelectedMembers(formattedMembers); // Set MultiSelect value
  };

  const [addMembers, setAddMembers] = useState(false);

  return (
    <div>
      <ToastContainer />
      <div className="mb-2">
        <span className="text-[#f95005] font-bold text-[1.2rem]">
          Meeting Info
        </span>
      </div>
      <div className="border-2 border-gray-400 rounded-xl px-3">
        <div className="flex flex-row justify-start">
          <div className="w-[50%] flex flex-row">
            <p className="w-[100%]">
              <span className="text-[#f95005] font-bold">Title : </span>
              {selectedMeeting?.refMeetingTitle}
            </p>
          </div>
          <div className="w-[50%] flex flex-row justify-between align-items-center">
            <p className="w-[80%]">
              <span className="text-[#f95005] font-bold">Create Date : </span>
              {selectedMeeting?.refCreatedDate}
            </p>
            <button
              className="w-[20%] border-transparent rounded text-[#f95005] bg-transparent"
              onClick={() => {
                if (meetingInfo) {
                  setMeetingInfo(false);
                } else {
                  setMeetingInfo(true);
                }
              }}
            >
              {meetingInfo ? (
                <>
                  <IoIosArrowUp size={"1.5rem"} />
                </>
              ) : (
                <>
                  <IoIosArrowDown size={"1.5rem"} />
                </>
              )}
            </button>
          </div>
        </div>
        {meetingInfo ? (
          <>
            <div className="flex flex-row justify-start ">
              <div className="w-[50%] flex flex-row">
                <p className="w-[50%]">
                  <span className="text-[#f95005] font-bold">
                    Start Date :{" "}
                  </span>
                  {selectedMeeting?.refMeetStartFrom}
                </p>
                <p className="w-[50%]">
                  <span className="text-[#f95005] font-bold">End Date : </span>
                  {selectedMeeting?.refMeetEnd}
                </p>
              </div>
              <div className="w-[50%] flex flex-row">
                <p className="w-[50%]">
                  <span className="text-[#f95005] font-bold">
                    Start Time :{" "}
                  </span>
                  {selectedMeeting?.refStartTime}
                </p>
                <p className="w-[50%]">
                  <span className="text-[#f95005] font-bold">End Time : </span>
                  {selectedMeeting?.refEndTime}
                </p>
              </div>
            </div>
            <div className="flex flex-row justify-start">
              <div className="w-[50%] flex flex-row">
                <p className="w-[50%]">
                  <span className="text-[#f95005] font-bold">Meeting : </span>
                  {selectedMeeting?.refMLTypeName}
                </p>
                <p className="w-[50%]">
                  <span className="text-[#f95005] font-bold">Branch : </span>
                  {selectedMeeting?.refBranchName}
                </p>
              </div>
              <div className="w-[50%] flex flex-row">
                <p className="w-[100%]">
                  <span className="text-[#f95005] font-bold">Link : </span>
                  {selectedMeeting?.refMeetingLink}
                </p>
                <button
                  onClick={() => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard
                        .writeText(selectedMeeting.refMeetingLink || "")
                        .then(() => {
                          toast.success(
                            `"${selectedMeeting.refMeetingTitle}" Meeting Link is copied Successfully`,
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
                        .catch((err) => {
                          console.log('err', err)
                          toast.error(
                            `Failed To Copy the Meeting of "${selectedMeeting.refMeetingTitle}"`,
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
                    } else {
                      // Fallback: Create a temporary textarea element for copying
                      const tempInput = document.createElement("textarea");
                      tempInput.value = selectedMeeting.refMeetingLink || "";
                      document.body.appendChild(tempInput);
                      tempInput.select();
                      document.execCommand("copy");
                      document.body.removeChild(tempInput);

                      alert(`Copied: ${selectedMeeting.refMeetingLink}`);
                    }
                  }}
                  className="text-blue-500 hover:bg-blue-500 hover:text-white px-2 rounded border-transparent bg-transparent "
                >
                  <MdContentCopy size={"1.2rem"} />
                </button>
              </div>
            </div>
            <div className="flex flex-row justify-start">
              <p className="w-[100%]">
                <span className="text-[#f95005] font-bold">Description : </span>
                {selectedMeeting?.refMeetingDescription}
              </p>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>

      <div className="mt-4 mb-2 flex flex-row justify-between align-items-center">
        <span className="text-[#f95005] font-bold text-[1.2rem]">
          Student List
        </span>
        {addMembers ? (
          <>
            <button
              className="border-none bg-red-500 text-white px-5 py-2 text-[1rem]"
              onClick={() => {
                setAddMembers(false);
                setSearchQuery("");
                setSelectedRows([]);
                setSelectedMembers([]);
                setRefSelectedMembers([]);
                setSearchList(false);
              }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <button
              className="border-none bg-[#28a745] text-white px-5 py-2 text-[1rem]"
              onClick={() => {
                setAddMembers(true);
              }}
            >
              Add Student
            </button>
          </>
        )}
      </div>

      {addMembers ? (
        <>
          <div className="border-2 border-gray-400 rounded-xl">
            <div className="w-full flex flex-col justify-center align-items-center">
              <div className="flex w-[100%] align-items-center">
                <div className="m-3 w-[75%]">
                  <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"></InputIcon>
                    <InputText
                      placeholder="Search By Customer ID, First Name, Mobile, Email, DOB, Username"
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
                <div className="flex justify-end w-[20%]">
                  <button
                    className={`border-none rounded-md ${loading ? "bg-gray-400" : "bg-[#28a745]"
                      } text-white px-5 py-2 text-[1rem] flex items-center justify-center`}
                    onClick={AddNewMembers}
                    disabled={loading} // Disable the button while loading
                  >
                    {loading && (
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> // Loading icon
                    )}
                    {loading ? "Adding..." : "Add"}{" "}
                    {/* Change button text based on loading state */}
                  </button>
                </div>
              </div>
              {searchList ? (
                <div className="flex w-full align-items-center justify-center ">
                  <DataTable
                    className="w-[80%] rounded border-2 border-gray-500 custom-header"
                    value={filteredAttendanceData}
                    scrollable
                    scrollHeight="400px"
                    selection={selectedRows}
                    selectionMode="multiple"
                    onSelectionChange={handleRowSelection}
                    rowClassName={() => "hover:bg-gray-300 cursor-pointer"}
                  >
                    <Column
                      selectionMode="multiple"
                      headerStyle={{ width: "3rem" }}
                    />
                    <Column
                      field="fullName"
                      header="Name"
                      frozen
                      body={(rowData: RowData) =>
                        `${rowData.refStFName} ${rowData.refStLName}`
                      }
                      style={{ minWidth: "11rem" }}
                    />
                    <Column
                      field="refCtMobile"
                      header="Mobile"
                      style={{ minWidth: "10rem" }}
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
              <div className="w-[100%] flex flex-col justify-center align-items-center">
                <span className="font-bold text-[#f95005] text-[1rem] w-[80%]">
                  Selected Members
                </span>
                <div className="w-[100%] flex justify-center my-3">
                  <MultiSelect
                    value={refSelectedMembers}
                    onChange={(e) => setRefSelectedMembers(e.value)}
                    options={selectedMembers}
                    optionLabel="name"
                    filter
                    placeholder="Selected Members"
                    maxSelectedLabels={1}
                    className="w-[80%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}

      <DataTable value={gmeetStudentDetails}>
        <Column field="refSCustId" header="Customer ID" />
        <Column field="refStFName" header="Name" />

        <Column field="refCtEmail" header="Email" />
        <Column field="refCtMobile" header="Mobile" />
        <Column field="status" header="Status" />
        <Column
          field=""
          body={(rowData) => (
            <div className="w-[100%] flex justify-center">
              <button
                className="border-none rounded p-2 bg-transparent text-red-500 hover:text-white hover:bg-red-500"
                onClick={() => {
                  handleRemoveMeeting(rowData, selectedMeeting.refGoogleMeetId);
                }}
              >
                <IoPersonRemoveSharp size={"1.2rem"} />
              </button>
            </div>
          )}
          header="Remove"
        />
      </DataTable>
    </div>
  );
};

export default GMeetMembersSidebar;
