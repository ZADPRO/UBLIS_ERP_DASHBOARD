import Axios from "axios";
import React, { useEffect, useState } from "react";

import CryptoJS from "crypto-js";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

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

  const [gmeetStudentDetails, setGmeetStudentDetails] = useState<
    GMeetStudentProps[]
  >([]);

  useEffect(() => {
    handleDelete(selectedMeeting.refGoogleMeetId);
  });

  const handleDelete = async (meetingId: any) => {
    console.log("meetingId line ------ 258", meetingId);
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
      console.log("data line 78 ---- gmeet", data);
      if (data.success) {
        setGmeetStudentDetails(data.Data);
      }

      // setGoogleWorkspaceLink((prevData) =>
      // prevData.filter((m) => {
      // console.log("m", m);
      // m.refGoogleMeetId !== meetingId;
      // })
      // );
    } catch (error) {
      console.error("Error deleting meeting:", error);
    }
  };

  return (
    <div>
      <h2>{selectedMeeting?.refMeetingTitle}</h2>
      <p>
        {selectedMeeting?.refMeetingDescription || "No description available"}
      </p>
      <DataTable value={gmeetStudentDetails}>
        <Column field="refSCustId" header="Customer ID" />
        <Column field="refStFName" header="Name" />

        <Column field="refCtEmail" header="Email" />
        <Column field="refCtMobile" header="Mobile" />
        <Column field="status" header="Status" />
        <Column field="" header="Remove" />
      </DataTable>
    </div>
  );
};

export default GMeetMembersSidebar;
