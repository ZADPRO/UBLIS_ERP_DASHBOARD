import Axios from "axios";
import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";

type DecryptResult = any;

const FeesStructure: React.FC = () => {
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

  const [branch, setBranch] = useState();
  const [branchOptions, setBranchOptions] = useState([]);

  const [tableData, setTableData] = useState();

  const fetchData = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/director/feesStructure",
      {
        refBranchId: "",
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

      console.log(data.FessData);

      const options = data.Branch.map((branch: any) => ({
        label: branch.refBranchName,
        value: branch.refbranchId,
      }));

      setBranchOptions(options);

      setBranch(options[0].value);

      setTableData(data.FessData);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const branchChange = (e: any) => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/director/feesStructure",
      {
        refBranchId: e,
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

      setTableData(data.FessData);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const EditBtn = (rowData: any) => {
    return (
      <Button
        label="Edit"
        severity="success"
        onClick={() => {
          console.log(rowData);

          setWorkSpace(true);

          setUpdateStructure(true);

          getAddStructure();

          setWorkSpaceData({
            refFeId: rowData.refFeId,
            memberlist: rowData.refMemberList,
            sessionType: rowData.refSessionType,
            fees: rowData.refFees,
            gstfees: rowData.refGst,
            totalfees: rowData.refFeTotal,
          });
        }}
      />
    );
  };

  const DeleteBtn = (rowData: any) => {
    return (
      <Button
        label="Delete"
        severity="danger"
        onClick={() => {
          deleteFees(rowData.refFeId);
        }}
      />
    );
  };

  const deleteFees = (e: any) => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/director/deleteFeesStructure",
      {
        refFeId: e,
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

      branchChange(branch);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const [workSpace, setWorkSpace] = useState(false);

  const [memeberlistOption, setMemberListOption] = useState([]);
  const [sessionTypeOption, setsessionTypeOption] = useState([]);

  const [workSpaceData, setWorkSpaceData] = useState({
    refFeId: "",
    memberlist: "",
    sessionType: "",
    fees: 0,
    gstfees: 0,
    totalfees: 0,
  });

  const getAddStructure = () => {
    Axios.get(import.meta.env.VITE_API_URL + "/director/addFeesStructure", {
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

      const MemberListoptions = data.memberList.map(
        (memeberlistOption: any) => ({
          label: memeberlistOption.refTimeMembers,
          value: memeberlistOption.refTimeMembersID,
        })
      );

      setMemberListOption(MemberListoptions);

      const sessionTypeOption = data.timeData.map((sessionTypeOption: any) => ({
        label: sessionTypeOption.refCustTimeData,
        value: sessionTypeOption.refCustTimeId,
      }));

      setsessionTypeOption(sessionTypeOption);

      console.log(sessionTypeOption);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const [updateStructure, setUpdateStructure] = useState(false);

  const handleFeesSubmit = (e: any) => {
    e.preventDefault();

    if (updateStructure) {
      Axios.post(
        import.meta.env.VITE_API_URL + "/director/editFeesStructure",
        {
          refFeId: workSpaceData.refFeId,
          refFees: workSpaceData.fees,
          refGst: workSpaceData.gstfees,
          refTotal: workSpaceData.totalfees,
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

        console.log(data);

        if (data.success) {
          setWorkSpaceData({
            refFeId: "",
            memberlist: "",
            sessionType: "",
            fees: 0,
            gstfees: 0,
            totalfees: 0,
          });

          setUpdateStructure(false);

          setWorkSpace(false);

          branchChange(branch);
        } else {
          setUpdateStructure(true);
        }

        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
      });
    } else {
      Axios.post(
        import.meta.env.VITE_API_URL + "/director/addNewFeesStructure",
        {
          refBranchId: branch,
          refMemberType: workSpaceData.memberlist,
          refSessionType: workSpaceData.sessionType,
          refFees: workSpaceData.fees,
          refGst: workSpaceData.gstfees,
          refTotal: workSpaceData.totalfees,
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

        console.log(data);

        if (data.success) {
          setWorkSpaceData({
            refFeId: "",
            memberlist: "",
            sessionType: "",
            fees: 0,
            gstfees: 0,
            totalfees: 0,
          });

          setWorkSpace(false);

          branchChange(branch);
        } else {
          setWorkSpaceData({
            ...workSpaceData,
            refFeId: data.data[0].refFeId,
          });
          setUpdateStructure(true);
        }

        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <Dropdown
          value={branch}
          onChange={(e: any) => {
            setBranch(e.value);
            branchChange(e.value);
          }}
          options={branchOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Select a City"
          className="w-[200px] mt-2 h-[35px]"
          checkmark={true}
          highlightOnSelect={false}
        />

        {workSpace ? null : (
          <Button
            severity="success"
            onClick={() => {
              setWorkSpace(true);
              getAddStructure();
            }}
            label="Add Structure"
          />
        )}
      </div>

      {workSpace ? (
        <>
          <form onSubmit={handleFeesSubmit}>
            <div className="m-2 p-3 rounded shadow-md mt-5 bg-[#f6f5f5]">
              <div className="my-3 text-[25px] font-semibold">
                {updateStructure ? "Update Structure" : "Add Structure"}
              </div>
              <div className="flex justify-between">
                <div className="flex flex-column gap-2 w-[48%]">
                  <label htmlFor="username">Member List</label>
                  <Dropdown
                    value={workSpaceData.memberlist}
                    onChange={(e: any) => {
                      setWorkSpaceData({
                        ...workSpaceData,
                        memberlist: e.value,
                      });
                    }}
                    options={memeberlistOption}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select a Member List"
                    className="w-[100%] h-[35px]"
                    checkmark={true}
                    highlightOnSelect={false}
                    required
                    disabled={updateStructure}
                  />
                </div>
                <div className="flex flex-column gap-2 w-[48%]">
                  <label htmlFor="username">Session Type</label>
                  <Dropdown
                    value={workSpaceData.sessionType}
                    onChange={(e: any) => {
                      setWorkSpaceData({
                        ...workSpaceData,
                        sessionType: e.value,
                      });
                    }}
                    options={sessionTypeOption}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select a Member List"
                    className="w-[100%] h-[35px]"
                    checkmark={true}
                    highlightOnSelect={false}
                    required
                    disabled={updateStructure}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex flex-column gap-2 w-[30%]">
                  <label htmlFor="username">Fees</label>
                  <InputNumber
                    value={workSpaceData.fees}
                    onChange={(e) => {
                      let fees = e.value || 0;

                      let gstfees = 0.18 * fees;

                      let totalfees = fees + gstfees;

                      setWorkSpaceData({
                        ...workSpaceData,
                        fees: fees,
                        gstfees: gstfees,
                        totalfees: totalfees,
                      });
                    }}
                    required
                  />
                </div>
                <div className="flex flex-column gap-2 w-[30%]">
                  <label htmlFor="username">GST Fees</label>
                  <InputNumber
                    value={workSpaceData.gstfees}
                    readOnly
                    required
                  />
                </div>
                <div className="flex flex-column gap-2 w-[30%]">
                  <label htmlFor="username">Total Fees</label>
                  <InputNumber
                    value={workSpaceData.totalfees}
                    readOnly
                    required
                  />
                </div>
              </div>
              {updateStructure ? (
                <div className="flex justify-end mt-5 mb-2">
                  Already Fees Structure Available, Do You Want to Update ?
                </div>
              ) : null}
              <div className="flex justify-end mt-4 mb-3">
                {updateStructure ? (
                  <Button severity="warning" type="submit" label="Update" />
                ) : (
                  <Button severity="success" type="submit" label="Save" />
                )}
                &nbsp;&nbsp;
                <Button
                  onClick={() => {
                    setWorkSpace(false);
                    setUpdateStructure(false);
                    setWorkSpaceData({
                      refFeId: "",
                      memberlist: "",
                      sessionType: "",
                      fees: 0,
                      gstfees: 0,
                      totalfees: 0,
                    });
                  }}
                  label="Close"
                />
              </div>
            </div>
          </form>
        </>
      ) : null}

      <DataTable value={tableData} className="mt-10">
        <Column field="MemberListName" header="Member List"></Column>
        <Column field="SessionTypeName" header="Session Type"></Column>
        <Column field="refFees" header="Fees"></Column>
        <Column field="refGst" header="GST"></Column>
        <Column field="refFeTotal" header="Total Fees"></Column>
        <Column field="refFeId" body={EditBtn} header="Edit"></Column>
        <Column field="refFeId" body={DeleteBtn} header="Delete"></Column>
      </DataTable>
    </>
  );
};

export default FeesStructure;
