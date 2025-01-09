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
import "./Package.css";
// import "./Session.css";

import { useNavigate } from "react-router-dom";
import { InputNumber } from "primereact/inputnumber";

// import { ImUpload2 } from "react-icons/im";
type DecryptResult = any;

const Package: React.FC = () => {
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

  // interface SessionDayOption {
  //   refSDId: number;
  //   refDays: string;
  //   disabled?: boolean;
  // }

  type SessionDayOption = {
    label: string;
    value: number;
    disabled?: boolean;
  };

  // Use State Setup ----------------------------------------------------------------------------------
  const [branch, setBranch] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [timingAdd, setTimingAdd] = useState(false);
  const [TimeUpdate, setTimeUpdate] = useState(false);
  const [timingData, setTimingData] = useState([]);
  const [classEditId, setClassEditId] = useState([]);
  const [packageAdd, setPackageAdd] = useState(false);
  const [packageUpdate, setPackageUpdate] = useState(false);
  const [sessionDaysOptions, setSessionDaysOption] = useState<
    SessionDayOption[]
  >([]);
  const [sessionMemberTypeOptions, setSessionMemberTypeOptions] = useState([]);
  const [sessionBranchOptions, setSessionBranchOptions] = useState([]);
  const [timingOptions, setTimingOptions] = useState([]);
  // const [updatedOptions, setUpdatedOptions] =
  //   useState<SessionDayOption[]>(sessionDaysOptions);

  const [PackageData, setPackageData] = useState<{
    fromdate?: Date | null | undefined;
    todate?: Date | null | undefined;
  }>({
    fromdate: undefined,
    todate: undefined,
  });

  const [newPackageData, setNewPackageData] = useState<{
    packageName?: string;
    Timing?: number[];
    sessionmode?: number[];
    sessiondays?: number[];
    membertype?: number[];
    branch?: any;
    feesType?: any;
    amount?: number;
  }>({
    packageName: "",
    Timing: [],
    sessionmode: [],
    sessiondays: [],
    membertype: [],
    branch: undefined,
    feesType: undefined,
    amount: undefined,
  });

  const [packData, setPackData] = useState([]);
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
  const feesTypeOptions = [
    {
      label: "per Month",
      value: 0,
    },
    {
      label: "Per Day",
      value: 1,
    },
  ];

  //  Use Effect Setup ----------------------------------------------------------------------------------
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

  const fetchTimingData = () => {
    Axios.get(import.meta.env.VITE_API_URL + "/settings/package/timingData", {
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
      console.log("data", data);
      console.log("data", data.Data);

      setTimingData(data.Data);
      console.log("setTimingData", timingData);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const TimingEdit = (rowData: any) => {
    return (
      <GrEdit
        style={{ cursor: "pointer", color: "green", fontSize: "1.5rem" }}
        onClick={() => {
          setTimingAdd(true);
          setTimeUpdate(true);
          //start here
          //   fetchsessionOption();
          //   setSessionAdd(true);
          //   setSessionUpdate(true);

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
          console.log("endTime", endTime);
          console.log("startTime", startTime);

          setClassEditId(rowData.refTimeId);

          setPackageData({
            fromdate: parseTimeToDate(startTime.trim()),
            todate: parseTimeToDate(endTime.trim()),
          });
        }}
      />
    );
  };

  const TimingDelete = (rowData: any) => {
    return (
      <MdDelete
        style={{ cursor: "pointer", color: "red", fontSize: "2rem" }}
        onClick={() => {
          Axios.post(
            import.meta.env.VITE_API_URL + "/settings/package/deleteTiming",
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
            console.log("data", data);
            localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

            if (data.success) {
              console.log("data.check", data.check);
              if (data.check == false) {
                toast.error("This Timing is Connected With a Package", {
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
              } else {
                toast.error("The Timing is Deleted Successfully", {
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
                fetchTimingData();
              }
            } else {
              toast.error(
                "There may be a technical Problem, try after some time",
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
            }
          });
        }}
      />
    );
  };

  const getFormOptions = () => {
    Axios.get(import.meta.env.VITE_API_URL + "/settings/package/addOptions", {
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
      console.log("data", data);

      const options1 = data.memberList.map((Data: any) => ({
        label: Data.refTimeMembers,
        value: Data.refTimeMembersID,
      }));
      setSessionMemberTypeOptions(options1);

      const options2 = data.sessionDays.map((Data: any) => ({
        label: Data.refDays,
        value: Data.refSDId,
      }));
      setSessionDaysOption(options2);

      const options3 = data.branch.map((Data: any) => ({
        label: Data.refBranchName,
        value: Data.refbranchId,
      }));
      setSessionBranchOptions(options3);

      const options4 = data.timing.map((Data: any) => ({
        label: Data.refTime,
        value: Data.refTimeId,
      }));
      setTimingOptions(options4);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const getPackageData = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/settings/package/Data",
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
      let data = decrypt(
        res.data[1],
        res.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );
      console.log("Package data", data);

      // const feeType = ;

      setPackData(data.package);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const updateOptions = (selectedValues: [number]) => {
    const selectedIds = selectedValues[0];
    const specialIds = [1, 2, 3];
    const isSpecialSelected = specialIds.includes(selectedIds);
    const updatedOptions = sessionDaysOptions.map(
      (option: SessionDayOption) => ({
        ...option,
        disabled: isSpecialSelected
          ? !specialIds.includes(option.value)
          : specialIds.includes(option.value),
      })
    );
    setSessionDaysOption(updatedOptions);
  };

  const PackageEdit = (rowData: any) => {
    return (
      <GrEdit
        style={{ cursor: "pointer", color: "green", fontSize: "1.5rem" }}
        onClick={() => {
          getFormOptions();
          setPackageAdd(true);
          setPackageUpdate(true);
          //start here
          //   fetchsessionOption();
          //   setSessionAdd(true);
          //   setSessionUpdate(true);

          setNewPackageData({
            packageName: rowData.refPackageName,
            Timing: rowData.refTimingId,
            sessionmode: rowData.refSessionMode,
            sessiondays: rowData.refSessionDays,
            membertype: rowData.refMemberType,
            branch: rowData.refBranchName,
            feesType: parseInt(rowData.refFeesType),
            amount: rowData.refFees,
          });
          setClassEditId(rowData.refPaId);
        }}
      />
    );
  };

  const PackageDelete = (rowData: any) => {
    return (
      <MdDelete
        style={{ cursor: "pointer", color: "red", fontSize: "2rem" }}
        onClick={() => {
          Axios.post(
            import.meta.env.VITE_API_URL + "/settings/package/deletePackage",
            {
              refPaId: rowData.refPaId,
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
            localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

            if (data.success) {
              toast.error("The Timing is Deleted Successfully", {
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
              getPackageData();
            } else {
              toast.error(
                "There may be a technical Problem, try after some time",
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
            }
          });
        }}
      />
    );
  };

  // Function Setup ----------------------------------------------------------------------------------
  useEffect(() => {
    fetchBranchData();
  }, []);

  useEffect(() => {
    fetchTimingData();
    getPackageData();
  }, [branch]);

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
          <h2>Class Package</h2>
        </div>
        <TabView>
          <TabPanel header="Package Fees">
            {packageAdd ? (
              <></>
            ) : (
              <div className="flex justify-end">
                <button
                  className="bg-green-500 border-none rounded-lg p-2  "
                  onClick={() => {
                    setPackageAdd(true);
                    getFormOptions();
                  }}
                >
                  <MdOutlineAddchart className="text-3xl text-white" />
                </button>
              </div>
            )}

            {packageAdd ? (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    let url = "/settings/package/addPackage";

                    if (packageUpdate) {
                      url = "/settings/package/editPackage";
                    }

                    Axios.post(
                      import.meta.env.VITE_API_URL + url,
                      {
                        newPackageData: newPackageData,
                        packageId: classEditId,
                      },
                      {
                        headers: {
                          Authorization: localStorage.getItem("JWTtoken"),
                          "Content-Type": "application/json",
                        },
                      }
                    ).then((res) => {
                      console.log("res", res);
                      const data = decrypt(
                        res.data[1],
                        res.data[0],
                        import.meta.env.VITE_ENCRYPTION_KEY
                      );

                      localStorage.setItem(
                        "JWTtoken",
                        "Bearer " + data.token + ""
                      );

                      if (data.success == true) {
                        setNewPackageData({});
                        setPackageAdd(false);
                        setPackageUpdate(false);
                        getPackageData();
                        toast.success(
                          packageUpdate
                            ? "Package Updated Successfully!"
                            : "New Package Added Successfully!",
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
                      } else {
                        toast.error("Some Error, Try After Some Time", {
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
                      }
                    });
                  }}
                >
                  <div>
                    <div className="flex justify-between mt-4">
                      <div className="flex flex-row gap-2 w-[50%]"></div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-6  w-[100%] mt-4">
                    <div className="flex flex-column gap-2 w-[30%]">
                      <label htmlFor="username">Package Name</label>
                      <InputText
                        placeholder="Enter Package Name"
                        value={newPackageData.packageName}
                        onChange={(e: any) => {
                          setNewPackageData({
                            ...newPackageData,
                            packageName: e.target.value,
                          });
                        }}
                        required
                      />
                    </div>

                    <div className="flex flex-column gap-2  w-[30%] ">
                      <label htmlFor="username">Timing</label>

                      <MultiSelect
                        value={newPackageData.Timing}
                        onChange={(e) => {
                          setNewPackageData({
                            ...newPackageData,
                            Timing: e.value, // e.value will be of type Nullable<Date>
                          });
                        }}
                        options={timingOptions}
                        optionLabel="label"
                        display="chip"
                        placeholder="Select Timing"
                        maxSelectedLabels={3}
                        className="w-full md:w-20rem"
                        required
                      />
                    </div>

                    <div className="flex flex-column gap-2  w-[30%] ">
                      <label htmlFor="username">Session Mode</label>

                      <Dropdown
                        value={newPackageData.sessionmode}
                        onChange={(e) => {
                          setNewPackageData({
                            ...newPackageData,
                            sessionmode: e.value,
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
                  <div className="flex flex-row gap-6  w-[100%] mt-4">
                    <div className="flex flex-column gap-2 w-[30%]">
                      <label htmlFor="username">Session Days</label>
                      <MultiSelect
                        value={newPackageData.sessiondays}
                        onChange={(e) => {
                          setNewPackageData({
                            ...newPackageData,
                            sessiondays: e.value,
                          });
                          updateOptions(e.value);
                        }}
                        options={sessionDaysOptions}
                        optionLabel="label"
                        optionDisabled="disabled"
                        display="chip"
                        placeholder="Select Session Days"
                        maxSelectedLabels={3}
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="flex flex-column gap-2  w-[30%]  ">
                      <label htmlFor="username">Member Type</label>

                      <MultiSelect
                        value={newPackageData.membertype}
                        onChange={(e) => {
                          setNewPackageData({
                            ...newPackageData,
                            membertype: e.value,
                          });
                        }}
                        options={sessionMemberTypeOptions}
                        optionLabel="label"
                        display="chip"
                        placeholder="Select a Member Type"
                        maxSelectedLabels={3}
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2  w-[30%] ">
                      <label htmlFor="username">Branch</label>

                      {packageUpdate ? (
                        <InputText
                          placeholder="Branch Name"
                          value={newPackageData.branch}
                          required
                          readOnly
                        />
                      ) : (
                        <MultiSelect
                          value={newPackageData.branch}
                          onChange={(e) => {
                            setNewPackageData({
                              ...newPackageData,
                              branch: e.value,
                            });
                          }}
                          options={sessionBranchOptions}
                          optionLabel="label"
                          display="chip"
                          placeholder="Select a Branch"
                          maxSelectedLabels={3}
                          className="w-full md:w-20rem"
                          required
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row gap-6  w-[100%] mt-4">
                    <div className="flex flex-column gap-2  w-[30%]  ">
                      <label htmlFor="username">Fees Type</label>

                      <Dropdown
                        value={newPackageData.feesType}
                        onChange={(e) => {
                          setNewPackageData({
                            ...newPackageData,
                            feesType: e.value,
                          });
                        }}
                        options={feesTypeOptions}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select a Session Mode"
                        className="w-[100%] h-[35px]"
                        checkmark={true}
                        highlightOnSelect={false}
                        required
                      />
                    </div>

                    <div className="flex flex-column gap-2 w-[30%]">
                      <label htmlFor="username">Amount</label>
                      <InputNumber
                        placeholder="Enter The Fees"
                        value={newPackageData.amount}
                        onChange={(e: any) => {
                          setNewPackageData({
                            ...newPackageData,
                            amount: e.value,
                          });
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      severity="info"
                      label="Close"
                      type="button"
                      onClick={() => {
                        setPackageAdd(false);
                        // setSessionWorkSpaceData({
                        //   fromdate: undefined,
                        //   todate: undefined,
                        //   sessionmode: [],
                        //   sessiondays: [],
                        //   membertype: [],
                        //   branch: [],
                        // });
                      }}
                    />
                    {packageUpdate ? (
                      <Button severity="warning" label="Update" type="submit" />
                    ) : (
                      <Button severity="success" label="Save" type="submit" />
                    )}
                  </div>
                </form>
              </>
            ) : null}

            <DataTable
              value={packData}
              className="mt-10"
              scrollable
              // showGridlines
              scrollHeight="400px" // Adjust the scroll height as needed
            >
              <Column
                field="refPackageName"
                header="Package"
                style={{ minWidth: "200px", width: "auto" }}
              ></Column>

              <Column
                header="Time"
                body={(rowData) => (
                  <ul className="list-none p-0 m-0">
                    {rowData.timingDetails?.map((time: any, index: any) => (
                      <li
                        key={index}
                        style={{
                          paddingTop: "5px",
                          paddingBottom: "5px",
                        }}
                      >
                        {time}
                      </li>
                    ))}
                  </ul>
                )}
                style={{ minWidth: "200px", width: "auto" }}
              ></Column>

              <Column
                field="refSessionMode"
                header="Session Mode"
                style={{ minWidth: "150px", width: "auto" }}
              ></Column>
              {/* 
              <Column
                header="Session Days"
                body={(rowData) => (
                  <DataTable
                    value={rowData.sessionDaysDetails}
                    className="p-0 m-0 border-none"
                    showHeaders={false} // This removes the header
                  >
                    <Column body={(data) => data}></Column>
                  </DataTable>
                )}
                style={{ width: "200px" }}
              ></Column> */}

              <Column
                header="Session Days"
                body={(rowData) => (
                  <ul className="list-none p-0 m-0">
                    {rowData.sessionDaysDetails?.map(
                      (time: any, index: any) => (
                        <li
                          key={index}
                          style={{
                            paddingTop: "5px",
                            paddingBottom: "5px",
                          }}
                        >
                          {time}
                        </li>
                      )
                    )}
                  </ul>
                )}
                style={{ minWidth: "150px", width: "auto" }}
              ></Column>
              <Column
                header="Member Type"
                body={(rowData) => (
                  <ul className="list-none p-0 m-0">
                    {rowData.memberTypeDetails?.map((time: any, index: any) => (
                      <li
                        key={index}
                        style={{
                          paddingTop: "5px",
                          paddingBottom: "5px",
                        }}
                      >
                        {time}
                      </li>
                    ))}
                  </ul>
                )}
                style={{ minWidth: "150px", width: "auto" }}
              ></Column>

              {/* <Column
                field="memberTypeDetails"
                header="Member Type"
                style={{ width: "150px" }}
              ></Column> */}

              <Column
                field="refBranchName"
                header="Branch"
                style={{ minWidth: "150px", width: "auto" }}
              ></Column>

              <Column
                header="Fee Type"
                body={(rowData) =>
                  parseInt(rowData.refFeesType) === 0 ? "Monthly" : "Perday"
                }
                style={{ minWidth: "130px", width: "auto" }}
              ></Column>

              <Column
                field="refFees"
                header="Amount"
                style={{ minWidth: "120px", width: "auto" }}
              ></Column>

              <Column header="Edit" body={PackageEdit}></Column>

              <Column header="Delete" body={PackageDelete}></Column>
            </DataTable>
          </TabPanel>

          {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
          <TabPanel header="Class Timing">
            {timingAdd ? (
              <>
                {" "}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    let url = "/settings/package/addTiming";

                    if (TimeUpdate) {
                      url = "/settings/package/editTiming";
                    }

                    Axios.post(
                      import.meta.env.VITE_API_URL + url,
                      {
                        fromTime: moment(PackageData.fromdate).format(
                          "hh:mm A"
                        ),
                        fromTo: moment(PackageData.todate).format("hh:mm A"),
                        refTimeId: classEditId ? classEditId : null,
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
                      fetchTimingData();

                      toast.success(
                        TimeUpdate
                          ? "Time Updated Successfully!"
                          : "New Time Added Successfully!",
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

                      setTimingAdd(false);

                      if (TimeUpdate) {
                        setTimeUpdate(false);
                      }
                      setPackageData({
                        fromdate: undefined,
                        todate: undefined,
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
                      <div className="flex flex-row gap-2 w-[80%]">
                        <div className="flex flex-column gap-2 w-[50%]">
                          <label htmlFor="username">From Time</label>
                          <Calendar
                            value={PackageData.fromdate || null}
                            onChange={(e) => {
                              setPackageData({
                                ...PackageData,
                                fromdate: e.value,
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
                            value={PackageData.todate || null}
                            onChange={(e) => {
                              setPackageData({
                                ...PackageData,
                                todate: e.value,
                              });
                            }}
                            timeOnly
                            hourFormat="12"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                        <Button
                          severity="info"
                          label="Close"
                          type="button"
                          onClick={() => {
                            setTimingAdd(false);
                            setPackageData({
                              fromdate: undefined,
                              todate: undefined,
                            });
                          }}
                        />
                        {TimeUpdate ? (
                          <Button
                            severity="warning"
                            label="Update"
                            type="submit"
                          />
                        ) : (
                          <Button
                            severity="success"
                            label="Save"
                            type="submit"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex justify-end">
                <button
                  className="bg-green-500 border-none rounded-lg p-2  "
                  onClick={() => {
                    setTimingAdd(true);
                  }}
                >
                  <MdOutlineAddchart className="text-3xl text-white" />
                </button>
              </div>
            )}

            <div className="dataTableClassPackage w-full flex items-center justify-center">
              <DataTable value={timingData} className="mt-10 w-[60%]">
                <Column
                  field="refTime"
                  header="Time"
                  className="w-[60%]"
                ></Column>

                <Column
                  header="Edit"
                  body={TimingEdit}
                  className="w-[20%]"
                ></Column>
                <Column
                  header="Delete"
                  body={TimingDelete}
                  className="w-[20%]"
                ></Column>
              </DataTable>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </>
  );
};

export default Package;
