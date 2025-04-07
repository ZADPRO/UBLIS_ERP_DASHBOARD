import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Axios from "axios";
// import { Divider } from "primereact/divider";
// import { Fieldset } from "primereact/fieldset";
import { Nullable } from "primereact/ts-helpers";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";



interface RegularSession {
  refTimeId: number;
  reftime: string;
  usercount: number;
  attendancecount: number;
  kidscount: number;
  malecount: number;
  femalecount: number;
}

// interface NearestSession {
//   nearestRefTimeId: {
//     refTimeId: number;
//     reftime: string;
//     usercount: number;
//     attendancecount: number;
//     startTime: string;
//     kidscount: number;
//     malecount: number;
//     femalecount: number;
//   };
// }

type DecryptResult = any;


// type AttendanceData = RegularSession | NearestSession;
// interface OverviewAttendanceProps {
//   overviewSessionData: AttendanceData | null;
// }

const OverviewAttendance: React.FC = () => {
  // const OverviewAttendance: React.FC<OverviewAttendanceProps> = ({
  //   overviewSessionData,
  // }) => {
  const [date, setDate] = useState<Nullable<Date>>(new Date());

  // const [userData, setUserData] = useState<AttendanceData[]>([]);
  // const [nearestSessionRefTime, setNearestSessionRefTime] =
  //   useState<string>("");

  // const [attendedTimeCount, setAttendedTimeCount] = useState<number>(0);
  // const [kidsCount, setKidsCount] = useState<number>(0);
  // const [maleCount, setMaleCount] = useState<number>(0);
  // const [femaleCount, setFemaleCount] = useState<number>(0);
  // const [notAttendedTimeCount, setNotAttendedTimeCount] = useState<number>(0);
  const [offlineCount, setOfflineCount] = useState<RegularSession[]>([])
  const [onlineCount, setOnlineCount] = useState<RegularSession[]>([])


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

  const attendanceOverViewData = async () => {
    const formattedDate = date?.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    console.log(' -> Line Number ----------------------------------- 101',);
    console.log('formattedDate', formattedDate)

    const response = await Axios.post(
      import.meta.env.VITE_API_URL + "/attendance/overView",
      {
        date: formattedDate
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
    console.log(' -> Line Number ----------------------------------- 121',);
    console.log('data', data)

    if (data.token == false) {
      navigate("/expired");
    } else {
      setOfflineCount(data.attendanceCount.slice(0, -1))
      setOnlineCount(data.onlineAttendanceData.slice(0, -1))
      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    }
  }

  useEffect(() => {
    attendanceOverViewData();
  }, [date]);




  return (
    <div>
      <div className="card flex flex-wrap gap-3 p-fluid mb-5 " >
        <div className="flex flex-row gap-4">
          <div className="inputCalander w-[25%]">
            <Calendar
              id="buttondisplay"
              value={date}
              placeholder="Choose Date"
              onChange={(e) => {
                if (e.value) {
                  setDate(e.value);
                }
              }}
              showIcon
              dateFormat="dd/mm/yy"
            />
          </div>
          <div className="w-[70%] flex flex-row gap-2">
            <input
              className="border px-0 py-0 text-center rounded border  p-4 border-[#f95005] border-2 text-[18px]"
              value={
                "Total Count: " +(offlineCount.reduce((sum, item) => {
                  return sum + parseInt((item as any).attendancecount);
                }, 0) + onlineCount.reduce((sum, item) => {
                  return sum + parseInt((item as any).attendancecount);
                }, 0))
                
              }
              disabled
            />
            <input
              className="border px-0 py-0 text-center rounded border p-4 border-[#f95005] border-2 text-[18px]"
              value={
                "Male: " +(
                offlineCount.reduce((sum, item) => {
                  return sum + parseInt((item as any).malecount);
                }, 0) + onlineCount.reduce((sum, item) => {
                  return sum + parseInt((item as any).malecount);
                }, 0))
              }
              disabled
            />
            <input
              className="border px-0 py-0 text-center rounded border p-4 border-[#f95005] border-2 text-[18px]"
              value={
                "Female: " +(offlineCount.reduce((sum, item) => {
                  return sum + parseInt((item as any).femalecount);
                }, 0) + onlineCount.reduce((sum, item) => {
                  return sum + parseInt((item as any).femalecount);
                }, 0))
                
              }
              disabled
            />
            <input
              className="border px-0 py-0 text-center rounded border p-4 border-[#f95005] border-2 text-[18px]"
              value={
                "Kids: " + ( offlineCount.reduce((sum, item) => {
                  return sum + parseInt((item as any).kidscount);
                }, 0) + onlineCount.reduce((sum, item) => {
                  return sum + parseInt((item as any).kidscount);
                }, 0))
               
              }
              disabled
            />
          </div>

        </div>


      </div>
      <div className="userDashboard grid-container flex justify-center">

        <div
          className="grid-item flex flex-col justify-start items-center lg:w-[45vw] mt-[-20px] border-2 border-gray-400 h-[60vh]"
          style={{ justifyContent: "start" }}
        >
          <div className="bg-[#f95005] w-[100%]">
            <p className="text-white text-center font-bold">OFFLINE CLASS TIMINGS</p>
          </div>
          <div className="w-[100%]">
            <DataTable
              value={offlineCount}
              stripedRows
              scrollable
              scrollHeight="50vh"
              emptyMessage="No Data Found"
              className="w-[100%]"
            >
              <Column
                header="S.No"
                body={(_rowData, options) => options.rowIndex + 1}
                style={{ minWidth: "2rem" }}
              ></Column>
              <Column
                field="reftime"
                header="Ref Time"
                style={{ minWidth: "7rem" }}
              ></Column>
              <Column
                field="attendancecount"
                header="Present"
                style={{ minWidth: "2rem" }}
              ></Column>
              <Column
                field="kidscount"
                style={{ minWidth: "2rem" }}
                header="Kids"
              ></Column>
              <Column
                field="malecount"
                style={{ minWidth: "2rem" }}
                header="Male"
              ></Column>
              <Column
                field="femalecount"
                style={{ minWidth: "2rem" }}
                header="Female"
              ></Column>
            </DataTable>
          </div>



        </div>
        <div
          className="grid-item flex flex-col justify-start items-center lg:w-[45vw] mt-[-20px] border-2 border-gray-400 h-[60vh]"
          style={{ justifyContent: "start" }}
        >
          <div className="bg-[#f95005] w-[100%]">
            <p className="text-white text-center font-bold">ONLINE CLASS TIMINGS</p>
          </div>
          <div className="w-[100%]">
            <DataTable
              value={onlineCount}
              stripedRows
              scrollable
              scrollHeight="50vh"
              emptyMessage="No Data Found"
            >
              <Column
                header="S.No"
                body={(_rowData, options) => options.rowIndex + 1}
                style={{ minWidth: "2rem" }}
              ></Column>
              <Column
                field="reftime"
                header="Ref Time"
                style={{ minWidth: "7rem" }}
              ></Column>
              <Column
                field="attendancecount"
                header="Present"
                style={{ minWidth: "2rem" }}
              ></Column>
              <Column
                field="kidscount"
                style={{ minWidth: "2rem" }}
                header="Kids"
              ></Column>
              <Column
                field="malecount"
                style={{ minWidth: "2rem" }}
                header="Male"
              ></Column>
              <Column
                field="femalecount"
                style={{ minWidth: "2rem" }}
                header="Female"
              ></Column>
            </DataTable>
          </div>



        </div>

      </div>
    </div>
  );
};

export default OverviewAttendance;
