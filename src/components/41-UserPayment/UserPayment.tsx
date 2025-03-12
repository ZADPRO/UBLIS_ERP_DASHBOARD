import Axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

import "./UserPayment.css";
import { Button } from "primereact/button";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";


import { FaCopy } from "react-icons/fa6";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";
import { Sidebar } from "primereact/sidebar";
import { Stepper, StepperRefAttributes } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import offer from "../../assets/Images/offer.png";

type DecryptResult = any;



const UserPayment: React.FC = () => {
  const navigate = useNavigate();



  const stepperRef = useRef<StepperRefAttributes | null>(null);

  const [userInitialData, setUserInitialData]: any = useState<[]>([]);
  const [otherPackageData, setotherPackageData]: any = useState([]);
  const [offers, setOffers]: any = useState([]);
  const [fromDate, setFromDate] = useState<Nullable<Date>>(null);
  const [toDate, setTodate] = useState<Nullable<Date>>(null);
  const [fee, setFee] = useState(0);
  const [offerPopup, setOfferPopup] = useState(false);
  const [selectedOffer, setSelectedOffer]: any = useState([]);



  const [visibleBottom, setVisibleBottom] = useState<boolean>(false);

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

  const [userdata, setuserdata] = useState({
    refUtId: 0,
    username: "",
    usernameid: "",
    refUserName: "",
    profileimg: { contentType: "", content: "" },
  });



  const formatDate = (dateString: any) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })
      .format(date)
      .replace(" ", "/"); // Converts "Mar 2025" to "Mar/2025"
  };

  const applicableOffers = offers.filter((user: any) => user.canUse);
  const nonApplicableOffers = offers.filter((user: any) => !user.canUse);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get(
          import.meta.env.VITE_API_URL + "/userPayment/paymentPageData",
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

        console.log("Fetched Data:=====================", data);

        if (data.token === false) {
          navigate("/expired");
          return;
        }

        localStorage.setItem("JWTtoken", "Bearer " + data.token);

        setotherPackageData(data.otherPackage)
        setOffers(data.offers)


        setUserInitialData(
          data.UserDetails.map((item: any) => ({
            refClMode: item.refClMode || "",
            refPackageName: item.refPackageName || "",
            refSCustId: item.refSCustId || "",
            refStFName: item.refStFName || "",
            refStId: item.refStId || "",
            refClTo: item.refClTo || "",
            refStLName: item.refStLName || "",
            refTimeMembers: item.refTimeMembers || "",
            refTime: item.refTime || "",
            weekDaysTiming: item.weekDaysTiming || "",
            weekEndTiming: item.weekEndTiming || "",
            refFeesType: item.refFeesType || "",
            refFees: item.refFees || "0",
            refPaId: item.refPaId || "0",
            refSessionMode: item.refSessionMode || " ",
            reftimemembersarray: Array.isArray(item.reftimemembersarray)
              ? item.reftimemembersarray
              : [],
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleOfferClick = (offer: any) => {
    setSelectedOffer(offer);
    setOfferPopup(true);
  };

  const tableData = [
    { month: "Feb", classCount: 12, fees: 1068 },
    { month: "Mar", classCount: 31, fees: 2500 },
    { month: "April", classCount: 30, fees: 2500 },
    { month: "Therapy", classCount: 3, fees: 2400 },
  ];

  const totalFees = tableData.reduce((acc, row) => acc + Number(row.fees), 0);

  const handleCopy = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert("Copied to clipboard!"))
        .catch(err => console.error("Failed to copy:", err));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Copied to clipboard! ");
    }
  };




  return (
    <>
      <div>
        <div className="headerPrimary hidden md:flex">
          <h3>Payment</h3>
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

        <TabView>
          <TabPanel header="Pay">
            {userInitialData ? (
              <>
                <div className="flex lg:flex-row flex-col">
                  <div className="w-[100%] flex-1 ">

                    {userInitialData.length > 0 && (
                      <div className="card shadow-3 flex flex-col justify-center h-[100%]  p-3 rounded-lg">
                        {userInitialData.map((user: any, index: number) => (
                          <div key={index} className="mb-4 p-3 border-b border-gray-300">
                            <table className="w-[100%]">
                              <tbody>
                                <tr>
                                  <td className="font-bold w-40 capitalize">Name:</td>
                                  <td className="capitalize  w-40">{user.refStFName}</td>
                                </tr>
                                <tr>
                                  <td className="font-bold w-40 capitalize">Current Package:</td>
                                  <td className="capitalize  w-40">
                                    {user.refPackageName} ({user.refClMode === "1" ? "Online" : "Offline"})
                                  </td>
                                </tr>

                                {user.weekDaysTiming && (
                                  <tr>
                                    <td className="font-bold w-40 capitalize">Weekdays Timing:</td>
                                    <td className="capitalize">{user.weekDaysTiming}</td>
                                  </tr>
                                )}

                                {user.weekEndTiming && (
                                  <tr>
                                    <td className="font-bold w-40 capitalize">Weekend Timing:</td>
                                    <td className="capitalize">{user.weekEndTiming}</td>
                                  </tr>
                                )}

                                <tr>
                                  <td className="font-bold w-40 capitalize">Package fee:</td>
                                  <td className="capitalize">
                                    {user.refFees} ({user.refFeesType === "0" ? "Per Month" : "Per Day"})
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                          </div>
                        ))}


                        <div className=" flex justify-center w-[100%] ">
                          <Button className="w-[100%]" onClick={() => setVisibleBottom(true)} label="Pay" severity="success" raised />
                        </div>
                      </div>
                    )}



                  </div>

                  <div className="upcomingPackage flex-1 mx-2 w-[60%]">
                    <div className="card shadow-3 h-[100%] pl-2 pr-2 pb-3 rounded-lg ">
                      <p style={{ fontWeight: "bold" }}>Other Packages</p>
                      <DataTable
                        value={otherPackageData}
                        showGridlines
                        className="userPaymentDataTable"
                        scrollHeight="200px"
                        scrollable
                      >
                        <Column
                          field="refPackageName"
                          header="Package Name"
                          style={{ minWidth: "13rem" }}
                        />
                        <Column
                          field="refFees"
                          header="Price"
                          style={{ minWidth: "8rem" }}
                          body={(rowData) => `${rowData.refFees} ${rowData.refFeesType === "0" ? "Per Month" : "Per Day"}`}
                        />
                        <Column
                          field="refSessionMode"
                          header="Mode"
                          style={{ minWidth: "8rem" }}
                        />
                        <Column
                          header="Batch"
                          style={{ minWidth: "16rem" }}
                          body={(rowData) =>
                            Array.isArray(rowData.reftimemembersarray)
                              ? rowData.reftimemembersarray.join(", ")
                              : "N/A"
                          }
                        />
                      </DataTable>
                    </div>
                  </div>

                </div>

                <div>
                  <p style={{ fontWeight: "bold" }}>Handpicked Deals for You !</p>

                  <div className="pl-3 flex flex-row gap-5 w-[100%]">

                    <div className="flex flex-col">
                      <p style={{ fontWeight: "bold" }}>Applicable Offers</p>
                      <div className="card shadow-3 h-[100%] pl-2 pr-2 pb-3 rounded-lg flex flex-row gap-2">
                        {applicableOffers.map((user: any, index: number) => (
                          <div key={index} onClick={() => handleOfferClick(user)} className="w-48 h-64 border border-gray-300 rounded-lg shadow-lg flex flex-col items-center p-1 text-center transition-transform transform hover:shadow-xl">
                            <div className="w-full bg-[#f95005] text-white text-lg font-semibold py-2 flex justify-between items-center px-3 rounded-t-lg">
                              <span>{user.refCoupon}</span>
                              <FaCopy
                                size={14}
                                className="cursor-pointer hover:text-gray-200 transition-colors"
                                onClick={() => handleCopy(user.refCoupon)}
                              />
                            </div>
                            <div className="text-[#000] text-5xl font-bold font-italic mt-4">
                              {user.refOffer}%
                            </div>
                            <div className="text-sm text-[#000] mt-2">
                              <p><b>Batch:</b> {user.refTimeMembers}</p>
                              <p><b>Min-Value:</b> {user.refMin} /-</p>
                            </div>
                            <div className="text-xs w-full mt-auto bg-[#cfcece] text-[#f95005] font-bold py-2 rounded-b-lg">
                              {formatDate(user.refStartAt)} - {formatDate(user.refEndAt)}
                            </div>
                          </div>
                        ))}
<Dialog
    visible={offerPopup}
    onHide={() => setOfferPopup(false)}
    header={<div className="dialog-header">Offer Details</div>}
    modal
    style={{ width: "40vw", borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
>
    {selectedOffer && (
        <div className="dialog-body">
            <p className="dialog-offer-name">{selectedOffer.refOfferName}</p>
            <h4 className="dialog-coupon">{selectedOffer.refCoupon}<FaCopy
                                size={14}
                                className="cursor-pointer hover:text-[#000] transition-colors mt-1"
                                onClick={() => handleCopy(selectedOffer.refCoupon)}
                              /> </h4> 
            <div className="dialog-info-container">
                <p className="dialog-info-text"><strong>Discount:</strong> {selectedOffer.refOffer} %</p>
                <p className="dialog-info-text"><strong>Package Name:</strong> {selectedOffer.refPackageName}</p>
                <p className="dialog-info-text"><strong>Batch:</strong> {selectedOffer.refTimeMembers}</p>
                <p className="dialog-info-text"><strong>Minimum Value:</strong> {selectedOffer.refMin}</p>
                <p className="dialog-info-text"><strong>Details:</strong> {selectedOffer.refContent}</p>
                <p className="dialog-info-text"><strong>Validity:</strong> {formatDate(selectedOffer.refStartAt)} - {formatDate(selectedOffer.refEndAt)}</p>
            </div>
        </div>
    )}
</Dialog>
                      </div>
                    </div>



                    <div className="flex flex-col">
                      <p style={{ fontWeight: "bold" }}>Non - Applicable Offers</p>
                      <div className="card shadow-3 h-[100%] pl-2 pr-2 pb-3 rounded-lg flex flex-row gap-2">
                        {nonApplicableOffers.map((user: any, index: number) => (
                          <div key={index} onClick={() => handleOfferClick(user)} className="w-48 h-64 border border-gray-300 rounded-lg shadow-lg flex flex-col items-center p-1 text-center transition-transform transform hover:shadow-xl">
                            <div className="w-full bg-[#f95005] text-white text-lg font-semibold py-2 flex justify-between items-center px-3 rounded-t-lg">
                              <span>{user.refCoupon}</span>
                              <FaCopy size={14} className="cursor-pointer hover:text-gray-200 transition-colors" />
                            </div>
                            <div className="text-[#000] text-5xl font-bold font-italic mt-4">
                              {user.refOffer}%
                            </div>
                            <div className="text-sm text-[#000] mt-2">
                              <p><b>Batch:</b> {user.refTimeMembers}</p>
                              <p><b>Min-Value:</b> {user.refMin} /-</p>
                            </div>
                            <div className="text-xs w-full mt-auto bg-[#cfcece] text-[#f95005] font-bold py-2 rounded-b-lg">
                              {formatDate(user.refStartAt)} - {formatDate(user.refEndAt)}
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  </div>
                </div>

              </>
            ) : (
              <></>
            )}
          </TabPanel>
          <TabPanel header="Payment Audit">

          </TabPanel>
        </TabView>
        <Sidebar
          visible={visibleBottom}

          className="userPaymentSidebar"
          position="right"
          style={{ width: "70vw" }}

          onHide={() => setVisibleBottom(false)}
        >
          <div className="stepperForPayment">
            <Stepper ref={stepperRef}>
              <StepperPanel>

                <div className="stepperForPayment">
                  <Stepper ref={stepperRef}>
                    <StepperPanel header="Header I">
                      <div className="flex flex-column">
                        <div className="flex-col flex pl-3 pr-3">
                          <h3 className="" style={{ textTransform: "uppercase" }}>
                            Session Name : {userInitialData.refPackageName}
                          </h3>
                          <p className="mt-0">
                            {" "}
                            <span className="font-bold">ID: </span>
                            {userInitialData.refSCustId}
                          </p>
                          <p className="mt-0">
                            <span className="font-bold">Username</span>{" "}
                            : {userInitialData.refStFName} {userInitialData.refStLName}
                          </p>
                          <div className="flex justify-between">
                            <p className="mt-0">
                              {" "}
                              <span className="font-bold">Batch</span>{" "}
                              : {userInitialData.refTimeMembers}
                            </p>

                          </div>

                          <hr style={{ borderTop: "1px solid #ccc", margin: "10px 0" }} />

                          <h3>PAYMENT</h3>

                          <div className="card flex flex-column md:flex-row gap-3">
                            <div className="p-inputgroup flex-1 flex-col">
                              <p className="mt-0">From Date</p>
                              <Calendar
                                value={fromDate}
                                style={{ width: "100%" }}
                                onChange={(e) => setFromDate(e.value)}
                                showIcon

                                view="month"
                                dateFormat="mm/yy"
                              />
                            </div>

                            <div className="p-inputgroup flex-1 flex-col">
                              <p className="mt-0">To Date</p>
                              <Calendar
                                value={toDate}
                                style={{ width: "100%" }}
                                onChange={(e) => setTodate(e.value)}
                                showIcon

                                view="month"
                                dateFormat="mm/yy"
                              />
                            </div>

                            <div className="p-inputgroup flex-1 flex-col">
                              <p className="mt-0">Package Ends On</p>
                              <Calendar
                                value={toDate}
                                style={{ width: "100%" }}
                                onChange={(e) => setTodate(e.value)}
                                showIcon

                                view="month"
                                dateFormat="mm/yy"
                              />
                            </div>
                          </div>{" "}

                        </div>
                      </div>


                      <div className="mt-3 mx-4">
                        Payment Calculation
                      </div>


                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-black m-5">
                          <thead className="bg-gray-300">
                            <tr>
                              <th className="border border-black px-4 py-2 text-center">Month</th>
                              <th className="border border-black px-4 py-2 text-center">Class Count</th>
                              <th className="border border-black px-4 py-2 text-center">Month Fees</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.map((row, index) => (
                              <tr key={index} className="text-center">
                                <td className="border border-black px-4 py-2">{row.month}</td>
                                <td className="border border-black px-4 py-2">{row.classCount}</td>
                                <td className="border border-black px-4 py-2">{row.fees}</td>
                              </tr>
                            ))}
                            {/* Total Fees Row */}
                            <tr className="font-bold text-center">
                              <td colSpan={2} className="border border-black px-4 py-2">TOTAL FEES</td>
                              <td className="border border-black px-4 py-2">{totalFees}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>


                      <div className="flex pt-4 justify-content-end">
                        <Button
                          label="Next"
                          icon="pi pi-arrow-right"
                          iconPos="right"
                          raised
                          onClick={() =>
                            stepperRef.current && stepperRef.current.nextCallback()
                          }
                        />
                      </div>
                    </StepperPanel>

                  </Stepper>
                </div>
              </StepperPanel>

            </Stepper>
          </div>
        </Sidebar>



      </div >


    </>
  );
};

export default UserPayment;
