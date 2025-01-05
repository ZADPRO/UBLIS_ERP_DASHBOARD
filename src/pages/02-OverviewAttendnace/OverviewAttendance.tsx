import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { Fieldset } from "primereact/fieldset";
import React, { useEffect, useState } from "react";

interface RegularSession {
  refTimeId: number;
  refTime: string;
  usercount: number;
  attendancecount: number;
}

interface NearestSession {
  nearestRefTimeId: {
    refTimeId: number;
    refTime: string;
    usercount: number;
    attendancecount: number;
    startTime: string;
  };
}

type AttendanceData = RegularSession | NearestSession;
interface OverviewAttendanceProps {
  overviewSessionData: AttendanceData | null;
}

const OverviewAttendance: React.FC<OverviewAttendanceProps> = ({
  overviewSessionData,
}) => {
  const [userData, setUserData] = useState<AttendanceData[]>([]);
  const [nearestSessionRefTime, setNearestSessionRefTime] =
    useState<string>("");

  const [attendedTimeCount, setAttendedTimeCount] = useState<number>(0);
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
        setNearestSessionRefTime(nearestSession.nearestRefTimeId.refTime);
        setAttendedTimeCount(nearestSession.nearestRefTimeId.usercount);
        setNotAttendedTimeCount(
          nearestSession.nearestRefTimeId.attendancecount
        );
      }

      // Set userData excluding the last item (nearest session)
      setUserData(dataArray.slice(0, -1));
    }
  }, [overviewSessionData]);

  return (
    <div>
      <div className="userDashboard grid-container">
        <div
          className="grid-item flex flex-col justify-start items-center"
          style={{ justifyContent: "start" }}
        >
          {" "}
          <div className="card mb-3">
            <Fieldset legend="Offline" className="">
              <div className="leaveBalance flex flex-col">
                <p className="m-2">{nearestSessionRefTime}</p>
                <div className="flex">
                  <div className="consumed">
                    <p className="m-0">{attendedTimeCount}</p>
                    <p className="m-0">Total</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">{notAttendedTimeCount}</p>
                    <p className="m-0">Attended</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">
                      {" "}
                      {Math.max(
                        Number(attendedTimeCount) -
                          Number(notAttendedTimeCount),
                        0
                      )}{" "}
                    </p>
                    <p className="m-0">Not Attended</p>
                  </div>
                </div>
              </div>
            </Fieldset>
          </div>
          <DataTable
            value={userData}
            stripedRows
            scrollable
            scrollHeight="300px"
            emptyMessage="No Data Found"
          >
            <Column
              header="S.No"
              body={(rowData, options) => options.rowIndex + 1}
              style={{ minWidth: "2rem" }}
            ></Column>
            <Column
              field="refTime"
              header="Ref Time"
              style={{ minWidth: "7rem" }}
            ></Column>
            <Column
              field="usercount"
              header="Total"
              style={{ minWidth: "2rem" }}
            ></Column>
            <Column
              field="attendancecount"
              style={{ minWidth: "2rem" }}
              header="Present"
            ></Column>
            <Column
              body={(rowData) => {
                const absentCount = rowData.usercount - rowData.attendancecount;
                console.log("absentCount", absentCount);
                return absentCount == 0 ? 0 : absentCount;
              }}
              style={{ minWidth: "2rem" }}
              header="Absent"
            ></Column>
          </DataTable>
        </div>
        <div
          className="grid-item flex flex-col justify-start items-center"
          style={{ justifyContent: "start" }}
        >
          <div className="card mb-3">
            <Fieldset legend="Offline">
              <div className="leaveBalance flex flex-col">
                <p className="m-2">{nearestSessionRefTime}</p>
                <div className="flex">
                  <div className="consumed">
                    <p className="m-0">0</p>
                    <p className="m-0">Total</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">0</p>
                    <p className="m-0">Attended</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="balance">
                    <p className="m-0">0</p>
                    <p className="m-0">Not Attended</p>
                  </div>
                </div>
              </div>
            </Fieldset>
          </div>
          <DataTable
            stripedRows
            scrollHeight="300px"
            scrollable
            emptyMessage="No Data Found"
          >
            <Column
              header="S.No"
              body={(rowData, options) => options.rowIndex + 1}
              style={{ minWidth: "2rem" }}
            ></Column>
            <Column
              field="refTime"
              header="Ref Time"
              style={{ minWidth: "7rem" }}
            ></Column>
            <Column
              field="usercount"
              header="Total"
              style={{ minWidth: "2rem" }}
            ></Column>
            <Column
              field="attendancecount"
              style={{ minWidth: "2rem" }}
              header="Present"
            ></Column>
            <Column
              field="attendancecount"
              style={{ minWidth: "2rem" }}
              header="Absent"
            ></Column>
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default OverviewAttendance;
