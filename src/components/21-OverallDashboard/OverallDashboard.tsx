import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OverallDashboard.css";
import { Link } from "react-router-dom";

import { DataTable } from "primereact/datatable";
import { Chart } from "primereact/chart";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";

import Axios from "axios";
import { Skeleton } from "primereact/skeleton";
import CryptoJS from "crypto-js";

import { AiOutlineAudit } from "react-icons/ai";

type DecryptResult = any;

const lineData = {
  labels: ["April", "May", "June", "July", "August", "September", "October  "],
  datasets: [
    {
      label: "Fee Payment",
      data: [28, 48, 40, 19, 86, 27, 90],
      fill: false,
      backgroundColor: "#00bb7e",
      borderColor: "#00bb7e",
      tension: 0.4,
    },
  ],
};

const OverallDashboard: React.FC = () => {
  const [products, setProducts] = useState([]);

  const [trialSampleData, setTrailSampleData] = useState([]);

  const [paymentSampleData, setPaymentSampleData] = useState([]);

  const [formSubmitted, setFormSubmitted] = useState({
    today: 0,
    futureToday: 0,
  });
  const [futureClient, setFutureClient] = useState({
    today: 0,
    futureToday: 0,
  });
  const [trailCount, setTrialCount] = useState({
    today: 0,
    futureToday: 0,
  });
  const [overallUserStatus, setOverallUserStatus] = useState([]);

  const [overallEmployeeStatus, setOverallEmployeeStatus] = useState([]);

  const [studentaudit, setStudentAudit] = useState({
    approvalCount: 0,
    readCount: 0,
  });

  const [employeeAudit, setEmployeeAudit] = useState({
    approvalCount: 0,
    readCount: 0,
  });

  const lineOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#495057",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
      y: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
    },
  };

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

        setFutureClient({
          today: data.data.signUpCount[0].count_today,
          futureToday: data.data.signUpCount[0].count_other_days,
        });

        if (
          localStorage.getItem("refUtId") === "7" ||
          localStorage.getItem("refUtId") === "4"
        ) {
          setTrialCount({
            today: data.data.trailCount[0].count_today,
            futureToday: data.data.trailCount[0].count_other_days,
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
            readCount: data.data.getEmployeeChangesCountResult[0].Employee_Read,
          });
        }

        if (localStorage.getItem("refUtId") === "4") {
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

        setOverallUserStatus(data.data.userTypeCount);

        setOverallEmployeeStatus(data.data.staffCount);
      });
  }, []);

  const [pageLoading, setPageLoading] = useState({
    verifytoken: true,
    pageData: true,
  });

  const [userdata, setuserdata] = useState({
    username: "",
    usernameid: "",
    profileimg: { contentType: "", content: "" },
  });

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

  useEffect(() => {
    Axios.get(import.meta.env.VITE_API_URL + "/validateTokenData", {
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

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
      setuserdata({
        username:
          "" + data.data[0].refStFName + " " + data.data[0].refStLName + "",
        usernameid: data.data[0].refusertype,
        profileimg: data.profileFile,
      });

      setPageLoading({
        ...pageLoading,
        verifytoken: false,
      });
    });
  }, []);

  return (
    <>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5]">
            <div className="headerPrimary">
              <h3>DASHBOARD</h3>
              <div className="quickAcces">
                <Skeleton
                  shape="circle"
                  size="3rem"
                  className="mr-2"
                ></Skeleton>
                <h3 className="flex-col flex items-center justify-center text-center ml-2 lg:ml-2 mr-0 lg:mr-5">
                  <Skeleton width="7rem" className="mb-2"></Skeleton>
                  <Skeleton width="7rem" className="mb-2"></Skeleton>
                </h3>
              </div>{" "}
            </div>

            <div className="userProfilePage">
              <Skeleton
                className="lg:m-[30px] shadow-lg"
                width="95%"
                height="80vh"
                borderRadius="16px"
              ></Skeleton>
              <div className="py-1"></div>
            </div>
          </div>
        </>
      ) : (
        <div className="dashboardContext">
          <div className="headerPrimary">
            <h3>DASHBOARD</h3>
            <div className="quickAcces">
              {userdata.profileimg ? (
                <div className="p-link layout-topbar-button">
                  <img
                    id="userprofileimg"
                    className="w-[45px] h-[45px] object-cover rounded-full"
                    src={`data:${userdata.profileimg.contentType};base64,${userdata.profileimg.content}`}
                    alt=""
                  />
                </div>
              ) : (
                <div className="p-link layout-topbar-button">
                  <i className="pi pi-user"></i>
                </div>
              )}
              <h3 className="text-[1rem] text-center ml-2 lg:ml-2 mr-0 lg:mr-5">
                <span>{userdata.username}</span>
                <br />
                <span className="text-[0.8rem] text-[#f95005]">
                  {userdata.usernameid}
                </span>
              </h3>
            </div>{" "}
          </div>
          <div className="cardTesting">
            {localStorage.getItem("refUtId") === "4" ? (
              <></>
            ) : (
              <Link
                to="/therapist/approve"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="cardOutline card">
                  <div className="header">
                    <i className="pi pi-user-plus"></i>
                    <h3>Therapist Users</h3>
                  </div>
                  <div className="counts">
                    <div className="countOne">
                      <h3>{formSubmitted.today}</h3>
                      <h5>Today</h5>
                    </div>
                    <div className="w-full md:w-2">
                      <Divider
                        layout="vertical"
                        className="hidden md:flex"
                      ></Divider>
                      <Divider
                        layout="horizontal"
                        className="flex md:hidden"
                        align="center"
                      ></Divider>
                    </div>
                    <div className="countOne">
                      <h3>{formSubmitted.futureToday}</h3>
                      <h5>Previous Day</h5>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            <Link
              to="/staff/signedupUsers"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="cardOutline card">
                <div className="header">
                  <i className="pi pi-user"></i>
                  <h3>Future Clients</h3>
                </div>
                <div className="counts">
                  <div className="countOne">
                    <h3>{futureClient.today}</h3>
                    <h5>Today</h5>
                  </div>
                  <div className="w-full md:w-2">
                    <Divider
                      layout="vertical"
                      className="hidden md:flex"
                    ></Divider>
                    <Divider
                      layout="horizontal"
                      className="flex md:hidden"
                      align="center"
                    ></Divider>
                  </div>
                  <div className="countOne">
                    <h3>{futureClient.futureToday}</h3>
                    <h5>Previous Day</h5>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/staff/registeredUsers"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="cardOutline card">
                <div className="header">
                  <i className="pi pi-money-bill"></i>
                  <h3>Trial</h3>
                </div>
                <div className="counts">
                  <div className="countOne">
                    <h3>{trailCount.today}</h3>
                    <h5>Today</h5>
                  </div>
                  <div className="w-full md:w-2">
                    <Divider
                      layout="vertical"
                      className="hidden md:flex"
                    ></Divider>
                    <Divider
                      layout="horizontal"
                      className="flex md:hidden"
                      align="center"
                    ></Divider>
                  </div>
                  <div className="countOne">
                    <h3>{trailCount.futureToday}</h3>
                    <h5>Previous Day</h5>
                  </div>
                </div>
              </div>
            </Link>

            {localStorage.getItem("refUtId") === "7" ? (
              <Link
                to="/dir/notify?user=student"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="cardOutline card">
                  <div className="header">
                    <AiOutlineAudit />
                    <h3>Student Aduit</h3>
                  </div>
                  <div className="counts">
                    <div className="countOne">
                      <h3>{studentaudit.approvalCount}</h3>
                      <h5>Approval</h5>
                    </div>
                    <div className="w-full md:w-2">
                      <Divider
                        layout="vertical"
                        className="hidden md:flex"
                      ></Divider>
                      <Divider
                        layout="horizontal"
                        className="flex md:hidden"
                        align="center"
                      ></Divider>
                    </div>
                    <div className="countOne">
                      <h3>{studentaudit.readCount}</h3>
                      <h5>Actions</h5>
                    </div>
                  </div>
                </div>
              </Link>
            ) : null}

            {/* <div className="cardOutline card">
              <div className="header">
                <i className="pi pi-calendar"></i>
                <h3>Attendance</h3>
              </div>
              <div className="counts">
                <div className="countOne">
                  <h3>--</h3>
                  <h5>Total</h5>
                </div>
                <div className="w-full md:w-2">
                  <Divider
                    layout="vertical"
                    className="hidden md:flex"
                  ></Divider>
                  <Divider
                    layout="horizontal"
                    className="flex md:hidden"
                    align="center"
                  ></Divider>
                </div>
                <div className="countOne">
                  <h3>--</h3>
                  <h5>Current Batch</h5>
                </div>
              </div>
            </div> */}
            {/* 
            <Link
              to="/settings"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="cardOutline card">
                <div className="header">
                  <i className="pi pi-receipt"></i>
                  <h3>Offers</h3>
                </div>
                <div className="counts">
                  <div className="countOne">
                    <h3>--</h3>
                    <h5>Trial</h5>
                  </div>
                  <div className="w-full md:w-2">
                    <Divider
                      layout="vertical"
                      className="hidden md:flex"
                    ></Divider>
                    <Divider
                      layout="horizontal"
                      className="flex md:hidden"
                      align="center"
                    ></Divider>
                  </div>
                  <div className="countOne">
                    <h3>--</h3>
                    <h5>Students</h5>
                  </div>
                </div>
              </div>
            </Link> */}
          </div>

          <div className="cardTesting">
            {localStorage.getItem("refUtId") === "7" ? (
              <Link
                to="/dir/notify?user=staff"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="cardOutline card">
                  <div className="header">
                    <AiOutlineAudit />
                    <h3>Employee Aduit</h3>
                  </div>
                  <div className="counts">
                    <div className="countOne">
                      <h3>{employeeAudit.approvalCount}</h3>
                      <h5>Approval</h5>
                    </div>
                    <div className="w-full md:w-2">
                      <Divider
                        layout="vertical"
                        className="hidden md:flex"
                      ></Divider>
                      <Divider
                        layout="horizontal"
                        className="flex md:hidden"
                        align="center"
                      ></Divider>
                    </div>
                    <div className="countOne">
                      <h3>{employeeAudit.readCount}</h3>
                      <h5>Actions</h5>
                    </div>
                  </div>
                </div>
              </Link>
            ) : null}
          </div>

          <div className="overallComponent mt-3" style={{ inlineSize: "100%" }}>
            <div className="dashboardContxt">
              <div
                className="dashboardCont"
                style={{ display: "flex", justifyContent: "space-around" }}
              >
                {/* RECENT SALES & BEST SELLING PRODUCTS */}
                <div className="col-12 xl:col-6 dashboardAnalytics">
                  <div className="card mt-2">
                    <div className="flex justify-content-between align-items-center mb-5">
                      <h3 className="text-[#f95005]">Overall User Status</h3>
                      <div>
                        {/* <Button
                          type="button"
                          icon="pi pi-ellipsis-v"
                          rounded
                          text
                          className="p-button-plain"
                          onClick={(event: any) => menu1.current?.toggle(event)}
                        /> */}
                        {/* <Menu
                          ref={menu1}
                          popup
                          model={[
                            { label: "Option One", icon: "pi pi-fw pi-plus" },
                            { label: "Option Two", icon: "pi pi-fw pi-minus" },
                          ]}
                        /> */}
                      </div>
                    </div>
                    {overallUserStatus.length ? (
                      <ul className="list-none p-0 m-0">
                        {overallUserStatus.map(
                          (element: any, index: number) => (
                            <li
                              key={index}
                              className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4"
                            >
                              <div>
                                <span className="text-900 font-medium mr-2 mb-1 md:mb-0 capitalize">
                                  {element.user_type_label}
                                </span>
                                <div className="mt-1 text-600">
                                  Count : {element.count}
                                </div>
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
                          )
                        )}
                      </ul>
                    ) : (
                      <p>No Data</p>
                    )}
                  </div>

                  {localStorage.getItem("refUtId") === "4" ? (
                    <></>
                  ) : (
                    <div className="mt-5">
                      <Link
                        to="/staff/registeredUsers"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className="card">
                          <h3 className="text-[#f95005]">
                            Today's Form Submissions
                          </h3>
                          <DataTable
                            value={products}
                            rows={5}
                            paginator
                            emptyMessage="No Data"
                            responsiveLayout="scroll"
                          >
                            <Column
                              field="sno"
                              header="S.No"
                              style={{ inlineSize: "35%" }}
                            />
                            <Column
                              field="name"
                              header="Name"
                              style={{ inlineSize: "35%" }}
                            />
                            <Column
                              field="transTime"
                              header="Registered Date"
                              style={{ inlineSize: "35%" }}
                            />
                          </DataTable>
                        </div>
                      </Link>
                    </div>
                  )}

                  <div className="mt-5">
                    <Link
                      to="/staff/registeredUsers"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="card">
                        <h3 className="text-[#f95005]">Students on Trial</h3>
                        <DataTable
                          value={trialSampleData}
                          rows={5}
                          paginator
                          responsiveLayout="scroll"
                          emptyMessage="No Data"
                        >
                          <Column
                            field="sno"
                            header="S.No"
                            style={{ inlineSize: "35%" }}
                          />
                          <Column
                            field="name"
                            header="Name"
                            style={{ inlineSize: "35%" }}
                          />
                          <Column
                            field="transTime"
                            header="Registered Date"
                            style={{ inlineSize: "35%" }}
                          />
                        </DataTable>
                      </div>
                    </Link>
                  </div>

                  {/* <div className="card mt-4">
                <div className="flex justify-content-between align-items-center mb-5">
                  <h5>Overall Employee Status</h5>
                  <div>
                    <Button
                      type="button"
                      icon="pi pi-ellipsis-v"
                      rounded
                      text
                      className="p-button-plain"
                      onClick={(event) => menu1.current?.toggle(event)}
                    />
                    <Menu
                      ref={menu1}
                      popup
                      model={[
                        { label: "Option One", icon: "pi pi-fw pi-plus" },
                        { label: "Option Two", icon: "pi pi-fw pi-minus" },
                      ]}
                    />
                  </div>
                </div>
                <ul className="list-none p-0 m-0">
                  <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                    <div>
                      <span className="text-900 font-medium mr-2 mb-1 md:mb-0">
                        Finance
                      </span>
                      <div className="mt-1 text-600">Count : 1</div>
                    </div>
                    <div className="mt-2 md:mt-0 flex align-items-center">
                      <div
                        className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem"
                        style={{ blockSize: "8px" }}
                      >
                        <div
                          className="bg-orange-500 h-full"
                          style={{ inlineSize: "12.50%" }}
                        />
                      </div>
                      <span className="text-orange-500 ml-3 font-medium">
                        %12.50
                      </span>
                    </div>
                  </li>
                  <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                    <div>
                      <span className="text-900 font-medium mr-2 mb-1 md:mb-0">
                        Front Office
                      </span>
                      <div className="mt-1 text-600">Count : 2</div>
                    </div>
                    <div className="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
                      <div
                        className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem"
                        style={{ blockSize: "8px" }}
                      >
                        <div
                          className="bg-cyan-500 h-full"
                          style={{ inlineSize: "25.00%" }}
                        />
                      </div>
                      <span className="text-cyan-500 ml-3 font-medium">
                        %25.00
                      </span>
                    </div>
                  </li>
                  <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                    <div>
                      <span className="text-900 font-medium mr-2 mb-1 md:mb-0">
                        Instructor
                      </span>
                      <div className="mt-1 text-600">Count : 5</div>
                    </div>
                    <div className="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
                      <div
                        className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem"
                        style={{ blockSize: "8px" }}
                      >
                        <div
                          className="bg-pink-500 h-full"
                          style={{ inlineSize: "62.50%" }}
                        />
                      </div>
                      <span className="text-pink-500 ml-3 font-medium">
                        %62.50
                      </span>
                    </div>
                  </li>
                </ul>
              </div> */}
                </div>

                {/* SALES OVERVIEW AND NOTIFICATIONS */}
                <div className="col-12 xl:col-6 dashboardAnalytics">
                  {localStorage.getItem("refUtId") === "4" ? (
                    <></>
                  ) : (
                    <div className="card mt-2">
                      <div className="flex justify-content-between align-items-center mb-5">
                        <h3 className="text-[#f95005]">
                          Overall Employee Status
                        </h3>
                        <div>
                          {/* <Button
                          type="button"
                          icon="pi pi-ellipsis-v"
                          rounded
                          text
                          className="p-button-plain"
                          onClick={(event) => menu1.current?.toggle(event)}
                        />
                        <Menu
                          ref={menu1}
                          popup
                          model={[
                            { label: "Option One", icon: "pi pi-fw pi-plus" },
                            { label: "Option Two", icon: "pi pi-fw pi-minus" },
                          ]}
                        /> */}
                        </div>
                      </div>
                      {overallEmployeeStatus.length ? (
                        <ul className="list-none p-0 m-0">
                          {overallEmployeeStatus.map((element: any) => (
                            <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                              <div>
                                <span className="text-900 font-medium mr-2 mb-1 md:mb-0 capitalize">
                                  {element.user_type_label}
                                </span>
                                <div className="mt-1 text-600">
                                  Count : {element.count}
                                </div>
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
                  )}
                  <div className="card">
                    <h5>October Month Revenue</h5>
                    <Chart type="line" data={lineData} options={lineOptions} />
                  </div>

                  <div className="mt-5">
                    <Link
                      to="/staff/registeredUsers"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="card">
                        <h3 className="text-[#f95005]">Fee Payment Dues</h3>
                        <DataTable
                          value={paymentSampleData}
                          rows={5}
                          paginator
                          responsiveLayout="scroll"
                          emptyMessage="No Data"
                        >
                          <Column
                            field="sno"
                            header="S.No"
                            style={{ inlineSize: "35%" }}
                          />
                          <Column
                            field="name"
                            header="Name"
                            style={{ inlineSize: "35%" }}
                          />
                          <Column
                            field="transTime"
                            header="Registered Date"
                            style={{ inlineSize: "35%" }}
                          />
                        </DataTable>
                      </div>
                    </Link>
                  </div>

                  {/* <div className="card mt-4">
                    <div className="flex align-items-center justify-content-between mb-4">
                      <h5>Notifications</h5>
                      <div>
                      </div>
                    </div>

                    <span className="block text-600 font-medium mb-3">
                      TODAY
                    </span>
                    <ul className="p-0 mx-0 mt-0 mb-4 list-none">
                      <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                        <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                          <i className="pi pi-dollar text-xl text-blue-500" />
                        </div>
                        <span className="text-900 line-blockSize-3">
                          Revenue Report
                          <span className="text-700">
                            {" "}
                            - Fee Payment{" "}
                            <span className="text-blue-500">
                              10 Verification Pending
                            </span>
                          </span>
                        </span>
                      </li>
                      <li className="flex align-items-center py-2">
                        <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0">
                          <i className="pi pi-download text-xl text-orange-500" />
                        </div>
                        <span className="text-700 line-blockSize-3">
                          Revenue Report{" "}
                          <span className="text-blue-500 font-medium">
                            DD-MM-YYYY (Today)
                          </span>{" "}
                          has been initiated.
                        </span>
                      </li>
                    </ul>

                    <span className="block text-600 font-medium mb-3">
                      YESTERDAY
                    </span>
                    <ul className="p-0 m-0 list-none">
                      <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                        <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                          <i className="pi pi-dollar text-xl text-blue-500" />
                        </div>
                        <span className="text-900 line-blockSize-3">
                          Revenue Report
                          <span className="text-700">
                            {" "}
                            - Fee Payment{" "}
                            <span className="text-blue-500">
                              3 Verification Pending
                            </span>
                          </span>
                        </span>
                      </li>
                      <li className="flex align-items-center py-2">
                        <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0">
                          <i className="pi pi-download text-xl text-orange-500" />
                        </div>
                        <span className="text-700 line-blockSize-3">
                          Revenue Report{" "}
                          <span className="text-blue-500 font-medium">
                            DD-MM-YYYY (Today)
                          </span>{" "}
                          has been initiated.
                        </span>
                      </li>
                    </ul>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OverallDashboard;
