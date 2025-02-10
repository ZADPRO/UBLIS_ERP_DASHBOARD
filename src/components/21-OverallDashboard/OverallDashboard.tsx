import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OverallDashboard.css";

import Axios from "axios";
import { Skeleton } from "primereact/skeleton";
import CryptoJS from "crypto-js";

import { useNavigate } from "react-router-dom";
import DashboardTiles from "../../pages/00-DashboardTiles/DashboardTiles";
import Dashboard from "../01-Dashboard/Dashboard";

type DecryptResult = any;

const OverallDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  console.log("products", products);

  const [trialSampleData, setTrailSampleData] = useState([]);
  console.log("trialSampleData", trialSampleData);

  const [paymentSampleData, setPaymentSampleData] = useState([]);
  console.log("paymentSampleData", paymentSampleData);

  const [formSubmitted, setFormSubmitted] = useState({
    today: 0,
    futureToday: 0,
  });
  console.log("formSubmitted", formSubmitted);
  const [futureClient, setFutureClient] = useState({
    today: 0,
    futureToday: 0,
  });
  console.log("futureClient", futureClient);
  const [trailCount, setTrialCount] = useState({
    Trial: 0,
    FeesPending: 0,
  });
  console.log("trailCount", trailCount);
  const [feesCount, setFeesCount] = useState({
    feesPaid: 0,
    feesPending: 0,
  });
  console.log("feesCount", feesCount);
  const [overallUserStatus, setOverallUserStatus] = useState([]);

  console.log("overallUserStatus", overallUserStatus);
  const [overallEmployeeStatus, setOverallEmployeeStatus] = useState([]);
  console.log("overallEmployeeStatus", overallEmployeeStatus);

  const [studentaudit, setStudentAudit] = useState({
    approvalCount: 0,
    readCount: 0,
  });
  console.log("studentaudit", studentaudit);

  const [employeeAudit, setEmployeeAudit] = useState({
    approvalCount: 0,
    readCount: 0,
  });
  console.log("employeeAudit", employeeAudit);

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

          setOverallUserStatus(data.data.userTypeCount);

          setOverallEmployeeStatus(data.data.staffCount);
        }
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
      if (data.token == false) {
        navigate("/expired");
      } else {
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
      }
    });
  }, []);

  return (
    <>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5] ">
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
        <>
          {localStorage.getItem("refUtId") === "5" || localStorage.getItem("refUtId") === "6" ?
            <>
              <Dashboard />
            </>
            :
            <>
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


                <div className="showCardTiles ms-5">

                  <DashboardTiles
                    userData={{
                      username: userdata.username,
                      usernameId: userdata.usernameid,
                    }}
                  />




                </div>

              </div>
            </>
          }

        </>



      )}
    </>
  );
};

export default OverallDashboard;
