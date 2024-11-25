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

type DecryptResult = any;

const Session: React.FC = () => {
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

  const [sessionDaysOptions, setSessionDaysOption] = useState([]);

  const [sessionMemberTypeOptions, setSessionMemberTypeOptions] = useState([]);

  const [sessionEditId, setSessionEditId] = useState(0);

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

      const options = data.Branch.map((branch: any) => ({
        label: branch.refBranchName,
        value: branch.refbranchId,
      }));

      setBranchOptions(options);

      setBranch(options[0].value);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
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

      const options = data.MemberList.map((sessionMemberTypeOptions: any) => ({
        label: sessionMemberTypeOptions.refTimeMembers,
        value: sessionMemberTypeOptions.refTimeMembersID,
      }));

      setSessionMemberTypeOptions(options);

      const sessionOptions = data.SessionDays.map(
        (sessionDaysOptions: any) => ({
          label: sessionDaysOptions.refDays,
          value: sessionDaysOptions.refDays,
        })
      );

      setSessionDaysOption(sessionOptions);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  useEffect(() => {
    fetchBranchData();
  }, []);

  useEffect(() => {
    fetchsessionData();
  }, [branch]);

  const sessionEdit = (rowData: any) => {
    return (
      <Button
        severity="success"
        onClick={() => {
          fetchsessionOption();
          setSessionAdd(true);
          setSessionUpdate(true);

          const parseTimeToDate = (timeString: any) => {
            const [time, meridian] = timeString.split(" ");
            const [hours, minutes] = time.split(":").map(Number);
            const date = new Date();

            // Adjust hours based on AM/PM
            date.setHours(
              meridian === "PM" && hours < 12 ? hours + 12 : hours % 12
            );
            date.setMinutes(minutes);
            date.setSeconds(0);
            date.setMilliseconds(0);

            return date;
          };

          const [startTime, endTime] = rowData.refTime.split(" to ");

          const selectedItem = sessionMemberTypeOptions.find(
            (item: any) => item.label == rowData.refTimeMembers
          );

          console.log("adddddddddddddddddd", selectedItem);

          setSessionEditId(rowData.refTimeId);

          setSessionWorkSpaceData({
            fromdate: parseTimeToDate(startTime.trim()),
            todate: parseTimeToDate(endTime.trim()),
            sessionmode: rowData.refTimeMode,
            sessiondays: rowData.refTimeDays,
            membertype: rowData.refTimeMembersID,
          });
        }}
        label="Edit"
      />
    );
  };

  const sessionDelete = (rowData: any) => {
    return (
      <Button
        severity="danger"
        label="Delete"
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

  const [sessionadd, setSessionAdd] = useState(false);

  const [sessionWorkSpaceData, setSessionWorkSpaceData] = useState<{
    fromdate: Date | null | undefined;
    todate: Date | null | undefined;
    sessionmode: null;
    sessiondays: null;
    membertype: null;
  }>({
    fromdate: undefined,
    todate: undefined,
    sessionmode: null,
    sessiondays: null,
    membertype: null,
  });

  const [sessionUpdate, setSessionUpdate] = useState(false);

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
          <TabPanel header="Session">
            {sessionadd ? (
              <></>
            ) : (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setSessionAdd(true);
                    fetchsessionOption();
                  }}
                  severity="success"
                  label="Add Session"
                />
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
                        sessionmode: null,
                        sessiondays: null,
                        membertype: null,
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
                        <label htmlFor="username">Sessoin Mode</label>
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

                    <div className="flex justify-between mt-4">
                      <div className="flex flex-row gap-2 w-[50%]">
                        <div className="flex flex-column gap-2 w-[100%]">
                          <label htmlFor="username">Sessoin Days</label>
                          <Dropdown
                            value={sessionWorkSpaceData.sessiondays}
                            onChange={(e) => {
                              setSessionWorkSpaceData({
                                ...sessionWorkSpaceData,
                                sessiondays: e.value, // e.value will be of type Nullable<Date>
                              });
                            }}
                            options={sessionDaysOptions}
                            optionLabel="value"
                            optionValue="value"
                            placeholder="Select a Session Days"
                            className="w-[100%] h-[35px]"
                            checkmark={true}
                            highlightOnSelect={false}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-column gap-2 w-[48%]">
                        <label htmlFor="username">Member Type</label>
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
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-5">
                    <Button
                      severity="info"
                      label="Close"
                      type="button"
                      onClick={() => {
                        setSessionAdd(false);
                        setSessionWorkSpaceData({
                          fromdate: undefined,
                          todate: undefined,
                          sessionmode: null,
                          sessiondays: null,
                          membertype: null,
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
          <TabPanel header="Audit">
            <p className="m-0">Audit</p>
          </TabPanel>
        </TabView>
      </div>
    </>
  );
};

export default Session;
