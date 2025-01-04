import { Divider } from "primereact/divider";
import { SelectButton } from "primereact/selectbutton";
import React, { useEffect, useState } from "react";

import coverImage from "../../assets/Dashboard/banner.jpg";
import profileImage from "../../assets/Dashboard/profile.svg";

import "./DashboardTiles.css";
import CryptoJS from "crypto-js";

import { Fieldset } from "primereact/fieldset";
import { Knob } from "primereact/knob";
import { AvatarGroup } from "primereact/avatargroup";
import { Avatar } from "primereact/avatar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

interface UserData {
  username: string;
  usernameId: string;
}

interface DashboardTilesProps {
  userData: UserData;
}

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: string;
  rating: number;
}

type DecryptResult = any;

const DashboardTiles: React.FC<DashboardTilesProps> = ({ userData }) => {
  const options = ["Tiles", "Stats", "Finance"];
  const [value, setValue] = useState(options[0]);

  const navigate = useNavigate();

  // TILES

  const [trialSampleData, setTrailSampleData] = useState([]);

  const [formSubmitted, setFormSubmitted] = useState({
    today: 0,
    futureToday: 0,
  });

  const [futureClient, setFutureClient] = useState({
    today: 0,
    futureToday: 0,
  });

  const [trailCount, setTrialCount] = useState({
    Trial: 0,
    FeesPending: 0,
  });
  const [feesCount, setFeesCount] = useState({
    feesPaid: 0,
    feesPending: 0,
  });

  const [studentaudit, setStudentAudit] = useState({
    approvalCount: 0,
    readCount: 0,
  });

  const [employeeAudit, setEmployeeAudit] = useState({
    approvalCount: 0,
    readCount: 0,
  });

  const [overallUserStatus, setOverallUserStatus] = useState([]);

  const [overallEmployeeStatus, setOverallEmployeeStatus] = useState([]);

  // DECRYPT
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

  // PAYMENT DATA TABLE
  const [paymentSampleData, setPaymentSampleData] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("JWTtoken");
    axios
      .get(import.meta.env.VITE_API_URL + `/staff/dashBoard`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        const data = decrypt(
          response.data[1],
          response.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );
        if (data.token == false) {
          navigate("/expired");
        } else {
          setFutureClient({
            today: data.data.signUpCount[0].count_today,
            futureToday: data.data.signUpCount[0].count_other_days,
          });

          if (
            localStorage.getItem("refUtId") === "7" ||
            localStorage.getItem("refUtId") === "4"
          ) {
            setTrialCount({
              Trial: data.data.trailCount[0].trailCount,
              FeesPending: data.data.trailCount[0].paymentPending,
            });
            setFeesCount({
              feesPaid: data.data.fessCount[0].feesPaid,
              feesPending: data.data.fessCount[0].feesPending,
            });
          }

          if (localStorage.getItem("refUtId") === "7") {
            setStudentAudit({
              approvalCount:
                data.data.getStudentChangesCountResult[0].ApproveCount,
              readCount: data.data.getStudentChangesCountResult[0].Student_Read,
            });

            setEmployeeAudit({
              approvalCount:
                data.data.getEmployeeChangesCountResult[0].ApproveCount,
              readCount:
                data.data.getEmployeeChangesCountResult[0].Employee_Read,
            });
          }

          if (localStorage.getItem("refUtId") === "4") {
            console.log("Line 153");
          } else {
            setFormSubmitted({
              today: data.data.registerCount[0].count_today,
              futureToday: data.data.registerCount[0].count_other_days,
            });

            const recentData = data.data.registerSampleData;
            const mappedData = recentData.map((item: any, index: any) => ({
              sno: index + 1,
              name: `${item.refStFName} ${item.refStLName}`,
              transTime: item.transTime,
            }));
            setProducts(mappedData);

            const trailSampleData = data.data.trailSampleData;
            const trailSampleDatamappedData = trailSampleData.map(
              (item: any, index: any) => ({
                sno: index + 1,
                name: `${item.refStFName} ${item.refStLName}`,
                transTime: item.transTime,
              })
            );
            setTrailSampleData(trailSampleDatamappedData);

            const paymentPendingSampleData = data.data.paymentPendingSampleData;
            const paymentPendingSampleDatamappedData =
              paymentPendingSampleData.map((item: any, index: any) => ({
                sno: index + 1,
                name: `${item.refStFName} ${item.refStLName}`,
                transTime: item.transTime,
              }));
            setPaymentSampleData(paymentPendingSampleDatamappedData);
          }

          console.log("data.data", data.data);
          setOverallUserStatus(data.data.userTypeCount);

          setOverallEmployeeStatus(data.data.staffCount);
        }
      });
  }, []);

  // TILES

  const [attendacenPercentage, setAttendancePercentage] = useState(90);

  // STATS

  const [products, setProducts] = useState<Product[]>([]);

  // FINANCE

  return (
    <div className="dashboard-container">
      {/* Fixed/Sticky SelectButton */}
      <div className="select-button-container">
        <SelectButton
          value={value}
          onChange={(e) => setValue(e.value)}
          options={options}
        />
      </div>

      {/* Scrollable Content */}
      <div className="scrollable-content">
        {value === "Profile" && (
          <div>
            <div className="contents">
              <div className="userProfile">
                <div className="coverImage">
                  <img src={coverImage} alt="coverImage" />
                </div>
                <div className="coverContents">
                  <img src={profileImage} alt="userProfile" />
                  <div className="userDetails">
                    <div className="userDetOne">
                      <div className="userDetPrimary">
                        <p className="username">{userData.username}</p>
                        <p className="useremail">User email</p>
                      </div>
                      <p className="empPosition">{userData.usernameId}</p>
                    </div>
                    <div className="userDetTwo">
                      <p>
                        <span>Employee ID </span>: COMP01HR1001
                      </p>
                      <Divider layout="vertical" />
                      <p>
                        <span>Department </span>: {userData.usernameId}
                      </p>
                      <Divider layout="vertical" />
                      <p>
                        <span>Mobile </span>: +91 9933994499
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="userDashboard grid-container">
              <div className="grid-item">
                <div className="card">
                  <Fieldset legend="Your Actions">
                    <div className="actions">
                      <p className="flex items-baseline">
                        <span className="mr-1">0 </span> actions left
                      </p>
                    </div>
                  </Fieldset>
                </div>
              </div>
              <div className="grid-item">
                <div className="card">
                  <Fieldset legend="In & Out">
                    <div className="card outToday flex justify-content-center">
                      <AvatarGroup>
                        <Avatar
                          image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                          size="large"
                          shape="circle"
                        />
                        <Avatar
                          image="https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png"
                          size="large"
                          shape="circle"
                        />
                        <Avatar
                          image="https://primefaces.org/cdn/primereact/images/avatar/onyamalimba.png"
                          size="large"
                          shape="circle"
                        />
                        <Avatar
                          image="https://primefaces.org/cdn/primereact/images/avatar/ionibowcher.png"
                          size="large"
                          shape="circle"
                        />
                        <Avatar
                          image="https://primefaces.org/cdn/primereact/images/avatar/xuxuefeng.png"
                          size="large"
                          shape="circle"
                        />
                        <Avatar label="+2" shape="circle" size="large" />
                      </AvatarGroup>
                      <p>2 People from Instructor out today</p>
                    </div>
                  </Fieldset>
                </div>
              </div>
              <div className="grid-item">
                <div className="card">
                  <Fieldset legend="Attendance">
                    <div className="attendance">
                      <Knob
                        value={attendacenPercentage}
                        onChange={(e) => setAttendancePercentage(e.value)}
                        valueTemplate={"{value}"}
                        size={120}
                      />
                      <div className="avgWorkHrs">
                        <p>
                          <span>7.5 Hrs</span> Per Day
                        </p>
                        <p>* Avg Working Hours</p>
                      </div>
                    </div>
                  </Fieldset>
                </div>
              </div>
            </div>
          </div>
        )}

        {value === "Tiles" && (
          <div>
            <div className="userDashboard grid-container">
              {localStorage.getItem("refUtId") !== "4" && (
                <Link
                  to="/therapist/approve"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="grid-item">
                    <div className="card">
                      <Fieldset legend="Registered users">
                        <div className="leaveBalance">
                          <div className="consumed">
                            <p>{formSubmitted.today}</p>
                            <p>Today</p>
                          </div>
                          <Divider layout="vertical" />
                          <div className="balance">
                            <p>{formSubmitted.futureToday}</p>
                            <p>Previous</p>
                          </div>
                        </div>
                      </Fieldset>
                    </div>
                  </div>
                </Link>
              )}
              <Link
                to="/staff/signedupUsers"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="grid-item">
                  <div className="card">
                    <Fieldset legend="Future Clients">
                      <div className="leaveBalance">
                        <div className="consumed">
                          <p>{futureClient.today ?? 0}</p>
                          <p>Today</p>
                        </div>
                        <Divider layout="vertical" />
                        <div className="balance">
                          <p>{futureClient.futureToday ?? 0}</p>
                          <p>Previous</p>
                        </div>
                      </div>
                    </Fieldset>
                  </div>
                </div>
              </Link>
              <Link
                to="/staff/registeredUsers"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="grid-item">
                  <div className="card">
                    <Fieldset legend="Trial">
                      <div className="leaveBalance">
                        <div className="consumed">
                          <p>{trailCount.Trial}</p>
                          <p>Trial</p>
                        </div>
                        <Divider layout="vertical" />
                        <div className="balance">
                          <p>{trailCount.FeesPending}</p>
                          <p>Fees Pending</p>
                        </div>
                      </div>
                    </Fieldset>
                  </div>
                </div>
              </Link>

              {localStorage.getItem("refUtId") === "7" && (
                <Link
                  to="/dir/notify?user=student"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="grid-item">
                    <div className="card">
                      <Fieldset legend="Student Audit">
                        <div className="leaveBalance">
                          <div className="consumed">
                            <p>{studentaudit.approvalCount}</p>
                            <p>Approval</p>
                          </div>
                          <Divider layout="vertical" />
                          <div className="balance">
                            <p>{studentaudit.readCount}</p>
                            <p>Actions</p>
                          </div>
                        </div>
                      </Fieldset>
                    </div>
                  </div>
                </Link>
              )}

              {localStorage.getItem("refUtId") === "7" && (
                <Link
                  to="/dir/notify?user=staff"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="grid-item">
                    <div className="card">
                      <Fieldset legend="Employee Audit">
                        <div className="leaveBalance">
                          <div className="consumed">
                            <p>{employeeAudit.approvalCount}</p>
                            <p>Approval</p>
                          </div>
                          <Divider layout="vertical" />
                          <div className="balance">
                            <p>{employeeAudit.readCount}</p>
                            <p>Actions</p>
                          </div>
                        </div>
                      </Fieldset>
                    </div>
                  </div>
                </Link>
              )}

              {localStorage.getItem("refUtId") === "4" ||
              localStorage.getItem("refUtId") === "7" ||
              localStorage.getItem("refUtId") === "8" ||
              localStorage.getItem("refUtId") === "11" ? (
                <Link
                  to="/staff/payment"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="grid-item">
                    <div className="card">
                      <Fieldset legend="Fee Paid & Pending">
                        <div className="leaveBalance">
                          <div className="consumed">
                            <p>{feesCount.feesPaid}</p>
                            <p>Fees Paid</p>
                          </div>
                          <Divider layout="vertical" />
                          <div className="balance">
                            <p>{feesCount.feesPending}</p>
                            <p>Fees Pending</p>
                          </div>
                        </div>
                      </Fieldset>
                    </div>
                  </div>
                </Link>
              ) : (
                <></>
              )}
            </div>
          </div>
        )}

        {value === "Stats" && (
          <div>
            <div className="stats-section">
              <div className="grid-containers">
                <div className="card statsDataTable">
                  <p>Overall User Stats</p>
                  {overallUserStatus.length ? (
                    <ul className="list-none p-0 m-0">
                      {overallUserStatus.map((element: any, index: number) => (
                        <li
                          key={index}
                          className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4"
                        >
                          <div>
                            <span className="text-900 font-medium mr-2 mb-1 md:mb-0 capitalize">
                              {element.user_type_label}
                            </span>
                            <div className="mt-1 text-600">{element.count}</div>
                          </div>
                          <div className="mt-2 md:mt-0 flex align-items-center">
                            <div
                              className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem"
                              style={{ blockSize: "8px" }}
                            >
                              <div
                                className="bg-orange-500 h-full"
                                style={{
                                  inlineSize: element.percentage + "%",
                                }}
                              />
                            </div>
                            <span className="text-orange-500 ml-3 font-medium">
                              {element.percentage} %
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No Data</p>
                  )}
                </div>

                <div className="card statsDataTable">
                  <p>Overall Employee Stats</p>
                  {overallEmployeeStatus.length ? (
                    <ul className="list-none p-0 m-0">
                      {overallEmployeeStatus.map((element: any) => (
                        <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                          <div>
                            <span className="text-900 font-medium mr-2 mb-1 md:mb-0 capitalize">
                              {element.user_type_label}
                            </span>
                            <div className="mt-1 text-600">{element.count}</div>
                          </div>
                          <div className="mt-2 md:mt-0 flex align-items-center">
                            <div
                              className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem"
                              style={{ blockSize: "8px" }}
                            >
                              <div
                                className="bg-orange-500 h-full"
                                style={{
                                  inlineSize: element.percentage + "%",
                                }}
                              />
                            </div>
                            <span className="text-orange-500 ml-3 font-medium">
                              {element.percentage} %
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No Data</p>
                  )}
                </div>

                <div className="card statsDataTable">
                  <p>Today's Form Submission</p>
                  <DataTable value={products} showGridlines>
                    <Column
                      field="sno"
                      header="S.No"
                      style={{ width: "1rem" }}
                    ></Column>
                    <Column
                      field="name"
                      header="Name"
                      style={{ minWidth: "4rem" }}
                    ></Column>
                    <Column
                      field="registeredDate"
                      header="RegisteredDate"
                      style={{ minWidth: "6rem" }}
                    ></Column>
                  </DataTable>
                </div>

                <div className="card statsDataTable">
                  <p>Students on Trial</p>
                  <DataTable value={trialSampleData} showGridlines>
                    <Column
                      field="sno"
                      header="S.No"
                      style={{ width: "1rem" }}
                    ></Column>
                    <Column
                      field="name"
                      header="Name"
                      style={{ minWidth: "4rem" }}
                    ></Column>
                    <Column
                      field="registeredDate"
                      header="RegisteredDate"
                      style={{ minWidth: "6rem" }}
                    ></Column>
                  </DataTable>
                </div>

                <div className="card statsDataTable">
                  <p>Fee Payment Details</p>
                  <DataTable
                    value={paymentSampleData}
                    showGridlines
                    emptyMessage="No Data"
                  >
                    <Column
                      field="sno"
                      header="S.No"
                      style={{ width: "1rem" }}
                    ></Column>
                    <Column
                      field="name"
                      header="Name"
                      style={{ minWidth: "4rem" }}
                    ></Column>
                    <Column
                      field="registeredDate"
                      header="RegisteredDate"
                      style={{ minWidth: "6rem" }}
                    ></Column>
                  </DataTable>
                </div>
              </div>
            </div>
          </div>
        )}

        {value === "Finance" && (
          <div>
            <p>Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTiles;
