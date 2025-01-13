import axios from "axios";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { Fieldset } from "primereact/fieldset";
import { Nullable } from "primereact/ts-helpers";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { InputOtp } from 'primereact/inputotp';



interface RegularSession {
  refTimeId: number;
  reftime: string;
  usercount: number;
  attendancecount: number;
  kidscount: number;
  malecount: number;
  femalecount: number;
}

interface NearestSession {
  nearestRefTimeId: {
    refTimeId: number;
    reftime: string;
    usercount: number;
    attendancecount: number;
    startTime: string;
    kidscount: number;
    malecount: number;
    femalecount: number;
  };
}

type DecryptResult = any;


type AttendanceData = RegularSession | NearestSession;
interface OverviewAttendanceProps {
  overviewSessionData: AttendanceData | null;
}

const OverviewAttendance: React.FC<OverviewAttendanceProps> = ({
  overviewSessionData,
}) => {
  const [date, setDate] = useState<Nullable<Date>>(new Date());

  const [userData, setUserData] = useState<AttendanceData[]>([]);
  const [nearestSessionRefTime, setNearestSessionRefTime] =
    useState<string>("");

  const [_attendedTimeCount, setAttendedTimeCount] = useState<number>(0);
  const [kidsCount, setKidsCount] = useState<number>(0);
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [notAttendedTimeCount, setNotAttendedTimeCount] = useState<number>(0);

  useEffect(() => {
    if (overviewSessionData) {
      const dataArray = Array.isArray(overviewSessionData)
        ? overviewSessionData
        : [overviewSessionData];

      // Extract nearestRefTimeId refTime if it exists
      const nearestSession = dataArray.find(
        (data) => "nearestRefTimeId" in data
      ) as NearestSession;

      if (nearestSession?.nearestRefTimeId) {
        setNearestSessionRefTime(nearestSession.nearestRefTimeId.reftime);
        setAttendedTimeCount(nearestSession.nearestRefTimeId.usercount);
        setKidsCount(nearestSession.nearestRefTimeId.kidscount);
        setMaleCount(nearestSession.nearestRefTimeId.malecount);
        setFemaleCount(nearestSession.nearestRefTimeId.femalecount);
        setNotAttendedTimeCount(
          nearestSession.nearestRefTimeId.attendancecount
        );
      }

      // Set userData excluding the last item (nearest session)
      setUserData(dataArray.slice(0, -1));
      console.log('dataArray.slice(0, -1)', dataArray.slice(0, -1))
    }
  }, [overviewSessionData]);

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


  const [overviewSessionDatas, setOverviewSessionData] =
    useState<AttendanceData | null>(null);


  useEffect(() => {
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
    axios.post(import.meta.env.VITE_API_URL + "/attendance/overView",
      {
        date: formattedDate
      },
      {
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
        console.log('data', data)
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
          setOverviewSessionData(data.attendanceCount);
        }
      });
  }, [date]);

  useEffect(() => {
    if (overviewSessionDatas) {
      const dataArray = Array.isArray(overviewSessionDatas)
        ? overviewSessionDatas
        : [overviewSessionDatas];

      // Extract nearestRefTimeId refTime if it exists
      const nearestSession = dataArray.find(
        (data) => "nearestRefTimeId" in data
      ) as NearestSession;

      if (nearestSession?.nearestRefTimeId) {
        setNearestSessionRefTime(nearestSession.nearestRefTimeId.reftime);
        setAttendedTimeCount(nearestSession.nearestRefTimeId.usercount);
        setNotAttendedTimeCount(
          nearestSession.nearestRefTimeId.attendancecount
        );
      }

      // Set userData excluding the last item (nearest session)
      setUserData(dataArray.slice(0, -1));
    }
  }, [overviewSessionDatas]);

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
                "Total Count: " +
                userData.reduce((sum, item) => {
                  return sum + parseInt((item as any).attendancecount);
                }, 0)
              }
              disabled
            />
            <input
              className="border px-0 py-0 text-center rounded border p-4 border-[#f95005] border-2 text-[18px]"
              value={
                "Male: " +
                userData.reduce((sum, item) => {
                  return sum + parseInt((item as any).malecount);
                }, 0)
              }
              disabled
            />
            <input
              className="border px-0 py-0 text-center rounded border p-4 border-[#f95005] border-2 text-[18px]"
              value={
                "Female: " +
                userData.reduce((sum, item) => {
                  return sum + parseInt((item as any).femalecount);
                }, 0)
              }
              disabled
            />
            <input
              className="border px-0 py-0 text-center rounded border p-4 border-[#f95005] border-2 text-[18px]"
              value={
                "Kids: " +
                userData.reduce((sum, item) => {
                  return sum + parseInt((item as any).kidscount);
                }, 0)
              }
              disabled
            />
          </div>

        </div>


      </div>
      <div className="userDashboard grid-container flex justify-center">

        <div
          className="grid-item flex flex-col justify-start items-center lg:w-[40vw] mt-[-20px]"
          style={{ justifyContent: "start" }}
        >
          {" "}

          <div className="card mb-3">
            <Fieldset legend="Offline" className="">
              <div className="leaveBalance flex flex-col">

                <p
                  className="m-0"
                  style={{
                    color: "#f95005",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  {nearestSessionRefTime}
                </p>
                <div className="flex">
                  <div className="balance">
                    <p className="m-0">{notAttendedTimeCount}</p>
                    <p className="m-0">Attended</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">{kidsCount}</p>
                    <p className="m-0">Kids</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">{maleCount}</p>
                    <p className="m-0">Male</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">{femaleCount}</p>
                    <p className="m-0">Female</p>
                  </div>
                </div>
              </div>
            </Fieldset>
          </div>
          <DataTable
            value={userData}
            stripedRows
            scrollable
            scrollHeight="250px"
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
            {/* <Column
              body={(rowData) => {
                const absentCount = rowData.usercount - rowData.attendancecount;
                console.log("absentCount", absentCount);
                return absentCount == 0 ? 0 : absentCount;
              }}
              style={{ minWidth: "2rem" }}
              header="Absent"
            ></Column> */}
          </DataTable>
        </div>
        <div
          className="grid-item flex flex-col justify-start items-center lg:w-[40vw] mt-[-20px]"
          style={{ justifyContent: "start" }}
        >
          <div className="card mb-3">
            <Fieldset legend="Online">
              <div className="leaveBalance flex flex-col">

                <p
                  className="m-0"
                  style={{
                    color: "#f95005",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  {nearestSessionRefTime}
                </p>
                <div className="flex">
                  <div className="balance">
                    <p className="m-0">{notAttendedTimeCount}</p>
                    <p className="m-0">Attended</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">{kidsCount}</p>
                    <p className="m-0">Kids</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">{maleCount}</p>
                    <p className="m-0">Male</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">{femaleCount}</p>
                    <p className="m-0">Female</p>
                  </div>
                </div>
              </div>
            </Fieldset>
          </div>
          <DataTable
            stripedRows
            scrollHeight="250px"
            scrollable
            emptyMessage="No Data Found"
          >
            <Column
              header="S.No"
              body={(_rowData, options) => options.rowIndex + 1}
              style={{ minWidth: "2rem" }}
            ></Column>
            <Column
              field="refTime"
              header="Ref Time"
              style={{ minWidth: "7rem" }}
            ></Column>
            <Column
              field="usercount"
              header="Present"
              style={{ minWidth: "2rem" }}
            ></Column>
            <Column
              field="attendancecount"
              style={{ minWidth: "2rem" }}
              header="Kids"
            ></Column>
            <Column
              field="attendancecount"
              style={{ minWidth: "2rem" }}
              header="Male"
            ></Column>
            <Column
              field="attendancecount"
              style={{ minWidth: "2rem" }}
              header="Female"
            ></Column>
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default OverviewAttendance;
