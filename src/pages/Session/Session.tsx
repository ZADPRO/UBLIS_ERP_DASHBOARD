import Axios from "axios";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InputText } from "primereact/inputtext";
import { GrEdit } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import { MdOutlineAddchart } from "react-icons/md";
import { MultiSelect } from "primereact/multiselect";
import "./Session.css";

import { useNavigate } from "react-router-dom";
import { InputNumber } from "primereact/inputnumber";

// import { ImUpload2 } from "react-icons/im";
type DecryptResult = any;

const Session: React.FC = () => {
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

  const [branch, setBranch] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [sectionData, setSectionData] = useState([]);
  const [classData, setClassData] = useState([]);
  // const [customClassData, setCustomClassDataData] = useState([]);
  const [sessionDaysOptions, setSessionDaysOption] = useState([]);

  const [sessionMemberTypeOptions, setSessionMemberTypeOptions] = useState([]);
  const [sessionBranchOptions, setSessionBranchOptions] = useState([]);

  const [sessionEditId, setSessionEditId] = useState();
  const [customClassEditId, setCustomClassEditId] = useState(0);
  const [editSession, setEditSession] = useState(false);
  const sessionModeOptions = [
    {
      value: "Online",
    },
    {
      value: "Offline",
    },
    {
      value: "Offline & Online",
    },
  ];

  const fetchBranchData = () => {
    Axios.get(import.meta.env.VITE_API_URL + "/settings/Section/branch", {
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
        const options = data.Branch.map((branch: any) => ({
          label: branch.refBranchName,
          value: branch.refbranchId,
        }));

        setBranchOptions(options);

        setBranch(options[0].value);

        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
      }
    });
  };

  const fetchsessionData = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/settings/Section",
      {
        branchId: branch,
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

      setSectionData(data.SectionData);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const fetchclassData = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/settings/Section/customClassData",
      {
        branchId: branch,
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

      setClassData(data.customClass);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const fetchsessionOption = () => {
    Axios.get(
      import.meta.env.VITE_API_URL + "/settings/Section/addSectionPage",
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

      const options = data.MemberList.map((sessionMemberTypeOptions: any) => ({
        label: sessionMemberTypeOptions.refTimeMembers,
        value: sessionMemberTypeOptions.refTimeMembersID,
      }));
      setSessionMemberTypeOptions(options);

      const sessionOptions = data.SessionDays.map(
        (sessionDaysOptions: any) => ({
          label: sessionDaysOptions.refDays,
          value: sessionDaysOptions.refSDId,
        })
      );

      setSessionDaysOption(sessionOptions);

      const bOptions = data.Branch.map((sessionBranchOptions: any) => ({
        label: sessionBranchOptions.refBranchName,
        value: sessionBranchOptions.refbranchId,
      }));

      setSessionBranchOptions(bOptions);

      //   const sessionOptions = data.SessionDays.map(
      //     (sessionDaysOptions: any) => ({
      //       label: sessionDaysOptions.refDays,
      //       value: sessionDaysOptions.refSDId,
      //     })
      //   );

      //   console.log("sessionOptions line ---------  189", sessionOptions);
      //   setSessionDaysOption(sessionOptions);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  useEffect(() => {
    fetchBranchData();
  }, []);

  useEffect(() => {
    fetchsessionData();
    fetchclassData();
  }, [branch]);

  const sessionEdit = (rowData: any) => {
    return (
      <GrEdit
        style={{ cursor: "pointer", color: "green", fontSize: "1.5rem" }}
        onClick={() => {
          setEditSession(true);
          //start here
          fetchsessionOption();
          setSessionAdd(true);
          setSessionUpdate(true);

          const parseTimeToDate = (timeString: any) => {
            const [time, meridian] = timeString.split(" ");
            const [hours, minutes] = time.split(":").map(Number);
            const date = new Date();

            date.setHours(
              meridian === "PM" && hours < 12 ? hours + 12 : hours % 12
            );
            date.setMinutes(minutes);
            date.setSeconds(0);
            date.setMilliseconds(0);

            return date;
          };

          const [startTime, endTime] = rowData.refTime.split(" to ");

          setSessionEditId(rowData.refTimeId);

          setSessionWorkSpaceData({
            fromdate: parseTimeToDate(startTime.trim()),
            todate: parseTimeToDate(endTime.trim()),
            sessionmode: rowData.refTimeMode,
            sessiondays: rowData.refTimeDaysId,
            membertype: rowData.refTimeMembersID,
            branch: rowData.refBranch,
          });
        }}
      />
    );
  };

  const customClassEdit = (rowData: any) => {
    return (
      <GrEdit
        style={{ cursor: "pointer", color: "green", fontSize: "1.5rem" }}
        onClick={() => {
          setClassAdd(true);
          setClassUpdate(true);

          setCustomClassEditId(rowData.refCustTimeId);

          // setClassWorkSpaceData({
          //   custClass: rowData.refCustTimeData,
          // });
        }}
      />
    );
  };

  const sessionDelete = (rowData: any) => {
    return (
      <MdDelete
        style={{ cursor: "pointer", color: "red", fontSize: "2rem" }}
        onClick={() => {
          Axios.post(
            import.meta.env.VITE_API_URL +
              "/settings/Section/deleteSectionData",
            {
              refTimeId: rowData.refTimeId,
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
            localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
            toast.error("The Section Is Deleted Successfully", {
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
            fetchsessionData();
          });
        }}
      />
    );
  };

  const customClassDelete = (rowData: any) => {
    return (
      <MdDelete
        style={{ cursor: "pointer", color: "red", fontSize: "2rem" }}
        onClick={() => {
          Axios.post(
            import.meta.env.VITE_API_URL +
              "/settings/Section/deleteCustomClassData",
            {
              refCustTimeId: rowData.refCustTimeId,
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
            localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
            toast.error("Custom class Deleted Successfully", {
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
            fetchclassData();
          });
        }}
      />
    );
  };

  const [sessionadd, setSessionAdd] = useState(false);
  const [classadd, setClassAdd] = useState(false);

  const [sessionWorkSpaceData, setSessionWorkSpaceData] = useState<{
    fromdate?: Date | null | undefined;
    todate?: Date | null | undefined;
    sessionmode?: any[];
    sessiondays?: any[];
    membertype?: any[];
    branch?: any[];
  }>({
    fromdate: undefined,
    todate: undefined,
    sessionmode: [],
    sessiondays: [],
    membertype: [],
    branch: [],
  });

  const [classWorkSpaceData, setClassWorkSpaceData] = useState<{
    custClassCout: number;
    custClassDuration: number;
    custClassAddCom: null;
  }>({
    custClassCout: 0,
    custClassDuration: 0,
    custClassAddCom: null,
  });

  const [sessionUpdate, setSessionUpdate] = useState(false);
  const [classUpdate, setClassUpdate] = useState(false);

  return (
    <>
      <div className="card ">
        <ToastContainer />
        <div className="flex flex-row-reverse justify-between">
          <div className="pr-10">
            <Dropdown
              value={branch}
              onChange={(e: any) => {
                setBranch(e.value);
              }}
              options={branchOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Select a City"
              className="w-[200px] mt-2 h-[35px]"
              checkmark={true}
              highlightOnSelect={false}
            />
          </div>
          <h2>Session</h2>
        </div>
        <TabView>
          <TabPanel header="Custom Session">
            {sessionadd ? (
              <></>
            ) : (
              <div className="flex justify-end">
                <button
                  className="bg-green-500 border-none rounded-lg p-2  "
                  onClick={() => {
                    setSessionAdd(true);
                    setEditSession(false);
                    fetchsessionOption();
                  }}
                >
                  <MdOutlineAddchart className="text-3xl text-white" />
                </button>
              </div>
            )}

            {sessionadd ? (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    let url = "/settings/Section/addNewSection";

                    if (sessionUpdate) {
                      url = "/settings/Section/editSectionData";
                    }

                    Axios.post(
                      import.meta.env.VITE_API_URL + url,
                      {
                        fromTime: moment(sessionWorkSpaceData.fromdate).format(
                          "hh:mm A"
                        ),
                        fromTo: moment(sessionWorkSpaceData.todate).format(
                          "hh:mm A"
                        ),
                        refTimeMode: sessionWorkSpaceData.sessionmode,
                        refTimeDays: sessionWorkSpaceData.sessiondays,
                        refTimeMembersID: sessionWorkSpaceData.membertype,
                        refTimeId: sessionUpdate ? sessionEditId : null,
                        refBranchId: sessionWorkSpaceData.branch,
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
                      fetchsessionData();

                      toast.success(
                        sessionUpdate
                          ? "Session Updated Successfully!"
                          : "New Session Added Successfully!",
                        {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "light",
                          // transition: Bounce,
                        }
                      );

                      setSessionAdd(false);

                      if (sessionUpdate) {
                        setSessionUpdate(false);
                      }
                      setSessionWorkSpaceData({
                        fromdate: undefined,
                        todate: undefined,
                        sessionmode: [],
                        sessiondays: [],
                        membertype: [],
                        branch: [],
                      });

                      localStorage.setItem(
                        "JWTtoken",
                        "Bearer " + data.token + ""
                      );
                    });
                  }}
                >
                  <div>
                    <div className="flex justify-between mt-4">
                      <div className="flex flex-row gap-2 w-[50%]">
                        <div className="flex flex-column gap-2 w-[50%]">
                          <label htmlFor="username">From Time</label>
                          <Calendar
                            value={sessionWorkSpaceData.fromdate || null} // Ensure null is passed when value is undefined
                            onChange={(e) => {
                              setSessionWorkSpaceData({
                                ...sessionWorkSpaceData,
                                fromdate: e.value, // e.value will be of type Nullable<Date>
                              });
                            }}
                            timeOnly
                            hourFormat="12"
                            required
                          />
                        </div>
                        <div className="flex flex-column gap-2 w-[48%]">
                          <label htmlFor="username">To Time</label>
                          <Calendar
                            value={sessionWorkSpaceData.todate || null} // Ensure null is passed when value is undefined
                            onChange={(e) => {
                              setSessionWorkSpaceData({
                                ...sessionWorkSpaceData,
                                todate: e.value, // e.value will be of type Nullable<Date>
                              });
                            }}
                            timeOnly
                            hourFormat="12"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-column gap-2 w-[48%]">
                        <label htmlFor="username">Session Mode</label>

                        <Dropdown
                          value={sessionWorkSpaceData.sessionmode}
                          onChange={(e) => {
                            setSessionWorkSpaceData({
                              ...sessionWorkSpaceData,
                              sessionmode: e.value, // e.value will be of type Nullable<Date>
                            });
                          }}
                          options={sessionModeOptions}
                          optionLabel="value"
                          optionValue="value"
                          placeholder="Select a Session Mode"
                          className="w-[100%] h-[35px]"
                          checkmark={true}
                          highlightOnSelect={false}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-1  w-[100%] mt-4">
                    <div className="flex flex-column gap-2 w-[30%] ">
                      <label htmlFor="username">Session Days</label>
                      {editSession ? (
                        <Dropdown
                          value={sessionWorkSpaceData.sessiondays}
                          onChange={(e) => {
                            setSessionWorkSpaceData({
                              ...sessionWorkSpaceData,
                              sessiondays: e.value, // e.value will be of type Nullable<Date>
                            });
                          }}
                          options={sessionDaysOptions}
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Select a Session Days"
                          className="w-[100%] h-[35px]"
                          checkmark={true}
                          highlightOnSelect={false}
                          required
                        />
                      ) : (
                        <MultiSelect
                          value={sessionWorkSpaceData.sessiondays}
                          onChange={(e) => {
                            setSessionWorkSpaceData({
                              ...sessionWorkSpaceData,
                              sessiondays: e.value, // e.value will be of type Nullable<Date>
                            });
                          }}
                          options={sessionDaysOptions}
                          optionLabel="label"
                          display="chip"
                          placeholder="Select Session Days"
                          maxSelectedLabels={3}
                          className="w-full"
                        />
                      )}
                    </div>

                    <div className="flex flex-column gap-2  w-[30%]  ">
                      <label htmlFor="username">Member Type</label>
                      {editSession ? (
                        <Dropdown
                          value={sessionWorkSpaceData.membertype}
                          onChange={(e) => {
                            setSessionWorkSpaceData({
                              ...sessionWorkSpaceData,
                              membertype: e.value, // e.value will be of type Nullable<Date>
                            });
                          }}
                          options={sessionMemberTypeOptions}
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Select a Session Mode"
                          className="w-[100%] h-[35px]"
                          checkmark={true}
                          highlightOnSelect={false}
                          required
                        />
                      ) : (
                        <MultiSelect
                          value={sessionWorkSpaceData.membertype}
                          onChange={(e) => {
                            setSessionWorkSpaceData({
                              ...sessionWorkSpaceData,
                              membertype: e.value, // e.value will be of type Nullable<Date>
                            });
                          }}
                          options={sessionMemberTypeOptions}
                          optionLabel="label"
                          display="chip"
                          placeholder="Select a Member Type"
                          maxSelectedLabels={3}
                          className="w-full"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-2  w-[30%] ">
                      {editSession ? (
                        <></>
                      ) : (
                        <>
                          <label htmlFor="username">Branch</label>

                          <MultiSelect
                            value={sessionWorkSpaceData.branch}
                            onChange={(e) => {
                              setSessionWorkSpaceData({
                                ...sessionWorkSpaceData,
                                branch: e.value, // e.value will be of type Nullable<Date>
                              });
                            }}
                            options={sessionBranchOptions}
                            optionLabel="label"
                            display="chip"
                            placeholder="Select a Branch"
                            maxSelectedLabels={3}
                            className="w-full md:w-20rem"
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      severity="info"
                      label="Close"
                      type="button"
                      onClick={() => {
                        setSessionAdd(false);
                        setSessionWorkSpaceData({
                          fromdate: undefined,
                          todate: undefined,
                          sessionmode: [],
                          sessiondays: [],
                          membertype: [],
                          branch: [],
                        });
                      }}
                    />
                    {sessionUpdate ? (
                      <Button severity="warning" label="Update" type="submit" />
                    ) : (
                      <Button severity="success" label="Save" type="submit" />
                    )}
                  </div>
                </form>
              </>
            ) : null}

            <DataTable value={sectionData} className="mt-10">
              <Column field="refTime" header="Time"></Column>
              <Column field="refTimeMode" header="Session Mode"></Column>
              <Column field="refTimeDays" header="Session Days"></Column>
              <Column field="refTimeMembers" header="Member Type"></Column>
              <Column header="Edit" body={sessionEdit}></Column>
              <Column header="Delete" body={sessionDelete}></Column>
            </DataTable>
          </TabPanel>

          {/* ***************************************************************************** */}

          <TabPanel header="Custom Class">
            {classadd ? (
              <></>
            ) : (
              <div className="flex justify-end">
                <button
                  className="bg-green-500 border-none rounded-lg p-2  "
                  onClick={() => {
                    setClassAdd(true);
                  }}
                >
                  <MdOutlineAddchart className="text-3xl text-white" />
                </button>
              </div>
            )}

            {classadd ? (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    let url = "/settings/Section/addCustomClassData";

                    if (classUpdate) {
                      url = "/settings/Section/editCustomClassData";
                    }

                    Axios.post(
                      import.meta.env.VITE_API_URL + url,
                      {
                        refCustTimeId: classUpdate ? customClassEditId : null,
                        refClassCount: classWorkSpaceData.custClassCout,
                        refMonthDuration: classWorkSpaceData.custClassDuration,
                        refClassValue: classWorkSpaceData.custClassAddCom,
                        refBranchId: branch,
                        checkValue: false,
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
                      fetchclassData();

                      toast.success(
                        sessionUpdate
                          ? "Custom Class  Updated Successfully!"
                          : "New Custom Class Added Successfully!",
                        {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "light",
                          // transition: Bounce,
                        }
                      );

                      setClassAdd(false);

                      if (classUpdate) {
                        setClassUpdate(false);
                      }
                      // setClassWorkSpaceData({
                      //   custClass: null,
                      // });

                      localStorage.setItem(
                        "JWTtoken",
                        "Bearer " + data.token + ""
                      );
                    });
                  }}
                >
                  <div className="flex flex-row justify-evenly  w-[100%]">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="username">Class</label>
                      <InputNumber
                        value={classWorkSpaceData.custClassCout}
                        onChange={(e: any) => {
                          setClassWorkSpaceData({
                            ...classWorkSpaceData,
                            custClassCout: e.value,
                          });
                        }}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="username">Months</label>
                      <InputNumber
                        value={classWorkSpaceData.custClassDuration}
                        onChange={(e: any) => {
                          setClassWorkSpaceData({
                            ...classWorkSpaceData,
                            custClassDuration: e.value,
                          });
                        }}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="username">Additional Comments</label>
                      <InputText
                        value={classWorkSpaceData.custClassAddCom}
                        onChange={(e: any) => {
                          setClassWorkSpaceData({
                            ...classWorkSpaceData,
                            custClassAddCom: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end align-items-center  gap-3 mt-5 bg-orange-600">
                    <div className="justify-start bg-black">
                      <label>
                        <input
                          type="checkbox"
                          name="option1"
                          value="Option 1"
                        />
                        Option 1
                      </label>
                    </div>
                    <div className="w-[50%] flex justify-between">
                      <Button
                        severity="info"
                        label="Close"
                        type="button"
                        onClick={() => {
                          setClassAdd(false);
                          // setClassWorkSpaceData({
                          //   custClass: null,
                          // });
                        }}
                      />
                      {classUpdate ? (
                        <Button
                          severity="warning"
                          label="Update"
                          type="submit"
                        />
                      ) : (
                        <Button severity="success" label="Save" type="submit" />
                      )}
                    </div>
                  </div>
                </form>
              </>
            ) : null}
            <DataTable value={classData} className="mt-10">
              <Column
                header="S.No"
                body={(_data, options) => options.rowIndex + 1}
              ></Column>
              <Column field="refCustTimeData" header="Custom Class"></Column>
              <Column field="refBranchName" header="Branch"></Column>

              <Column header="Edit" body={customClassEdit}></Column>
              <Column header="Delete" body={customClassDelete}></Column>
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
    </>
  );
};

export default Session;
