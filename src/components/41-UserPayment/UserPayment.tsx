import Axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

import "./UserPayment.css";
import { Button } from "primereact/button";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Sidebar } from "primereact/sidebar";
import { Stepper, StepperRefAttributes } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Nullable } from "primereact/ts-helpers";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";

import { differenceInCalendarMonths } from "date-fns";
import { Divider } from "primereact/divider";

type DecryptResult = any;

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

const UserPayment: React.FC = () => {
  const navigate = useNavigate();
  const stepperRef = useRef<StepperRefAttributes | null>(null);
  const [fromDate, setFromDate] = useState<Nullable<Date>>(null);
  const [toDate, setTodate] = useState<Nullable<Date>>(null);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [fee, setFee] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [coupon, setCoupon] = useState("");

  const [receiptFromDate, setReceiptFromDate] = useState<Nullable<Date>>(null);
  const [receiptToDate, setReceiptToDate] = useState<Nullable<Date>>(null);
  const [receiptFinalfee, setReceiptFinalFee] = useState("");
  const [receiptOfferType, setReceiptOfferType] = useState("");
  const [receiptPackageEndDate, setReceiptPackageEndDate] = useState("");
  console.log("receiptPackageEndDate", receiptPackageEndDate);
  const [receiptOfferName, setReceiptOfferName] = useState("");

  const [userInitialData, setUserInitialData] = useState({
    refClassMode: 0,
    refPackageName: "",
    refSCustId: "",
    refStFName: "",
    refStId: "",
    refSeTo: "",
    refStLName: "",
    refTimeMembers: "",
    refTime: "",
    refFeesType: "",
    refFees: 0,
    refPaId: 0,
  });

  const [otherPackageDatatable, setOtherPackageDatatable] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const [pageLoading, setPageLoading] = useState({
    verifytoken: true,
    pageData: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const validateResponse = await Axios.get(
          import.meta.env.VITE_API_URL + "/validateTokenData",
          {
            headers: {
              Authorization: localStorage.getItem("JWTtoken"),
              "Content-Type": "application/json",
            },
          }
        );

        const validateData = decrypt(
          validateResponse.data[1],
          validateResponse.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );

        console.log("data", validateData);

        if (validateData.token === false) {
          navigate("/expired");
          return;
        }

        localStorage.setItem("JWTtoken", "Bearer " + validateData.token + "");

        setuserdata({
          refUtId: validateData.data[0].refUtId,
          username:
            "" +
            validateData.data[0].refStFName +
            " " +
            validateData.data[0].refStLName +
            "",
          usernameid: validateData.data[0].refusertype,
          refUserName: validateData.data[0].refUserName,
          profileimg: validateData.profileFile,
        });

        setPageLoading({
          ...pageLoading,
          verifytoken: false,
        });

        console.log("Verify Token Running --- ");

        const paymentResponse = await Axios.post(
          import.meta.env.VITE_API_URL + "/users/payment",
          {
            refUtId: validateData.data[0].refUtId,
          },
          {
            headers: {
              Authorization: localStorage.getItem("JWTtoken"),
              "Content-Type": "application/json",
            },
          }
        );

        const paymentData = decrypt(
          paymentResponse.data[1],
          paymentResponse.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );

        if (paymentData.token === false) {
          console.log("data.token", paymentData.token);
          navigate("/expired");
        } else {
          console.log("UserData Running --- ");

          localStorage.setItem("JWTtoken", "Bearer " + paymentData.token + "");
          if (paymentData) {
            setUserInitialData(paymentData.userInitialData[0]);
            console.log("paymentData", paymentData.userInitialData[0]);

            const otherPackage = await Axios.post(
              import.meta.env.VITE_API_URL + "/users/otherPackage",
              {
                refPaId: paymentData.userInitialData[0].refPaId,
              },
              {
                headers: {
                  Authorization: localStorage.getItem("JWTtoken"),
                  "Content-Type": "application/json",
                },
              }
            );

            const otherPackageResponse = decrypt(
              otherPackage.data[1],
              otherPackage.data[0],
              import.meta.env.VITE_ENCRYPTION_KEY
            );

            if (otherPackageResponse.token === false) {
              console.log("data.token", otherPackageResponse.token);
              navigate("/expired");
            } else {
              console.log("UserData Running --- ");

              localStorage.setItem(
                "JWTtoken",
                "Bearer " + otherPackageResponse.token + ""
              );
              if (otherPackageResponse) {
                console.log("otherPackageResponse", otherPackageResponse);
                setOtherPackageDatatable(
                  otherPackageResponse.userOtherPackageData
                );
              }

              if (!userInitialData.refSeTo) {
                const currentDate = new Date();
                const month = currentDate.getMonth();
                const year = currentDate.getFullYear();

                const defaultDate = new Date(year, month, 1);
                setFromDate(defaultDate);

                // if (fromDate) {
                //   const selectedMonth = fromDate.getMonth();
                //   const selectedYear = fromDate.getFullYear();

                //   const nextMonth = selectedMonth + 1;
                //   const nextDate = new Date(selectedYear, nextMonth, 1);
                //   setTodate(nextDate);
                // }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (fromDate) {
      const selectedMonth = fromDate.getMonth();
      const selectedYear = fromDate.getFullYear();

      const nextMonth = selectedMonth;
      const nextDate = new Date(selectedYear, nextMonth, 1);
      setTodate(nextDate);
    }
  }, [fromDate]);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const sampleData = [
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
      {
        id: "1000",
        code: "f230fh0g3",
        name: "Bamboo Watch",
        description: "Product Description",
        image: "bamboo-watch.jpg",
        price: 65,
        category: "Accessories",
        quantity: 24,
        inventoryStatus: "INSTOCK",
        rating: 5,
      },
    ];
    setProducts(sampleData);
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      const monthsDifference = differenceInCalendarMonths(toDate, fromDate) + 1;
      const calculatedFee = userInitialData.refFees * monthsDifference;
      setFee(calculatedFee);

      const tax = (calculatedFee * 9) / 100;
      setCgst(tax);
      setSgst(tax);
      setTotalAmount(calculatedFee + 2 * tax);
    } else {
      setFee(0);
      setCgst(0);
      setSgst(0);
      setTotalAmount(0);
    }
  }, [fromDate, toDate, userInitialData.refFees]);

  const actionBodyTemplate = (rowData: Product) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-download"
          severity="success"
          rounded
          className="mr-2 downloadBtn"
        />
      </React.Fragment>
    );
  };

  const handlePayment = () => {
    const options = {
      key: "rzp_live_vpVNHNDB6ECdoH",
      amount: totalAmount * 100,
      currency: "INR",
      name: "Testing da venna",
      description: "Subscription Payment",
      // image: "https://example.com/your-logo.png",
      handler: function (response: any) {
        alert(
          `Payment Successful! Payment ID: ${response.razorpay_payment_id}`
        );
        // stepperRef.current && stepperRef.current.nextCallback();
      },
      prefill: {
        // name: userInitialData.refStFName + " " + userInitialData.refStLName,
      },
      theme: {
        color: "#f95005",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();

    rzp.on("payment.failed", function (response: any) {
      alert(`Payment Failed: ${response.error.description}`);
    });
  };

  const handleCoupon = async (couponValue: string) => {
    const couponVerifyPayload = await Axios.post(
      import.meta.env.VITE_API_URL + "/userPayment/verifyCoupon",
      {
        refFees: fee,
        refExDate: toDate,
        refCoupon: couponValue,
        refStartDate: fromDate,
        refEndDate: toDate,
      },
      {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json",
        },
      }
    );

    const couponVerifyResponse = decrypt(
      couponVerifyPayload.data[1],
      couponVerifyPayload.data[0],
      import.meta.env.VITE_ENCRYPTION_KEY
    );

    console.log("couponVerifyResponse", couponVerifyResponse);
    if (couponVerifyResponse.token === false) {
      console.log("data.token", couponVerifyResponse.token);
      navigate("/expired");
    } else {
      console.log("UserData Running --- ");

      localStorage.setItem(
        "JWTtoken",
        "Bearer " + couponVerifyResponse.token + ""
      );

      if (couponVerifyResponse.data) {
        setReceiptFromDate(couponVerifyResponse.data.refStartDate);
        setReceiptToDate(couponVerifyResponse.data.refEndDate);
        setReceiptPackageEndDate(couponVerifyResponse.data.refExDate);
        setReceiptFinalFee(couponVerifyResponse.data.refFees);
        setReceiptOfferType(couponVerifyResponse.data.refOfferName);
        setReceiptOfferName(couponVerifyResponse.data.refOfferValue);

        const taxFee = (couponVerifyResponse.data.refFees * 9) / 100;
        setCgst(taxFee);
        setSgst(taxFee);
        setTotalAmount(couponVerifyResponse.data.refFees + 2 * taxFee);
      }
    }
  };

  return (
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

      {userInitialData ? (
        <>
          <div className="flex lg:flex-row flex-col">
            <div className="paymentUIUser flex-1 m-3">
              <div className="card shadow-3 flex flex-col justify-center h-[100%] pl-3 pr-3 pb-3 rounded-lg">
                <p>
                  {userInitialData.refStFName} {userInitialData.refStLName}
                </p>
                <p className="mt-0" style={{ textTransform: "capitalize" }}>
                  Current Package: {userInitialData.refPackageName} ({" "}
                  {userInitialData.refClassMode === 1 ? "Online" : "Offline"} )
                </p>
                <p className="mt-0">
                  Preferred Timing: {userInitialData.refTime}
                </p>
                <p className="mt-0">
                  Package fee: {userInitialData.refFees} ({" "}
                  {userInitialData.refFeesType === "0"
                    ? "Per Month"
                    : "Per Day"}{" "}
                  )
                </p>

                <Button
                  onClick={() => setVisibleBottom(true)}
                  label="Pay"
                  severity="success"
                  raised
                />
              </div>
            </div>

            <div className="upcomingPackage flex-1 m-3">
              <div className="card shadow-3 h-[100%] pl-3 pr-3 pb-3 rounded-lg">
                <p>Other Packages</p>
                <DataTable
                  value={otherPackageDatatable}
                  showGridlines
                  className="userPaymentDataTable"
                  scrollHeight="200px"
                  scrollable
                >
                  <Column
                    field="refPackageName"
                    header="Package Name"
                    style={{ minWidth: "13rem" }}
                  ></Column>
                  <Column
                    field="refFees"
                    header="Price"
                    style={{ minWidth: "8rem" }}
                    body={(rowData) =>
                      `${rowData.refFees} ${
                        rowData.refFeesType === "0" ? "Per Month" : "Per Day"
                      }`
                    }
                  />
                  <Column
                    field="refSessionMode"
                    header="Mode"
                    style={{ minWidth: "8rem" }}
                  ></Column>
                  <Column
                    field="category"
                    header="Batch"
                    style={{ minWidth: "16rem" }}
                    body={(rowData) => rowData.reftimemembersarray.join(", ")}
                  />
                </DataTable>{" "}
              </div>
            </div>
          </div>

          <DataTable
            style={{ margin: "15px" }}
            value={products}
            showGridlines
            className="userPaymentDataTable"
            scrollHeight="300px"
            scrollable
          >
            <Column
              field="sno"
              header="S.No"
              style={{
                minWidth: "3rem",
              }}
              body={(rowData, options) => options.rowIndex + 1}
            ></Column>
            <Column
              body={actionBodyTemplate}
              exportable={false}
              header="Receipt"
              frozen
              style={{
                minWidth: "3rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Column>
            <Column
              field="name"
              header="Date"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="quantity"
              header="Fee Paid"
              style={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="category"
              header="Package Name"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="category"
              header="Mode"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="category"
              header="Expired"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="category"
              header="Duration"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="status"
              header="Status"
              style={{ minWidth: "6rem" }}
            ></Column>
          </DataTable>
        </>
      ) : (
        <></>
      )}

      <Sidebar
        visible={visibleBottom}
        position={isMobile ? "bottom" : "right"}
        className="userPaymentSidebar"
        style={{
          height: isMobile ? "80vh" : "100vh",
          width: isMobile ? "100vw" : "50vw",
        }}
        onHide={() => setVisibleBottom(false)}
      >
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
                    {userInitialData.refStFName} {userInitialData.refStLName}
                  </p>
                  <div className="flex justify-between">
                    <p className="mt-0">
                      {" "}
                      <span className="font-bold">Batch</span>{" "}
                      {userInitialData.refTimeMembers}
                    </p>
                    <p className="mt-0">
                      {" "}
                      {userInitialData.refClassMode === 1
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                  <div className="card flex flex-column md:flex-row gap-3">
                    <div className="p-inputgroup flex-1 flex-col">
                      <p className="mt-0">From Date</p>
                      <Calendar
                        value={fromDate}
                        style={{ width: "100%" }}
                        onChange={(e) => setFromDate(e.value)}
                        showIcon
                        disabled
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
                        disabled
                        view="month"
                        dateFormat="mm/yy"
                      />
                    </div>
                  </div>{" "}
                  <div className="flex ps-1 pe-1 justify-between">
                    <p>Fee</p>
                    <p>{fee > 0 ? `₹ ${fee}` : "-"}</p>
                  </div>
                </div>
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
            <StepperPanel header="Header II">
              <div className="flex flex-column">
                <h3>Offers</h3>
                <div className="flex items-center gap-3">
                  <Button
                    label="Apply Coupon"
                    severity="success"
                    raised
                    onClick={() => setShowCouponInput(true)}
                  />

                  {showCouponInput && (
                    <div className="p-inputgroup lg:mt-0 flex-1">
                      <InputText
                        placeholder="Coupon"
                        onChange={(e) => setCoupon(e.target.value)}
                        value={coupon}
                      />
                      <span className="p-inputgroup-addon">
                        <i
                          className="pi pi-check"
                          onClick={() => handleCoupon(coupon)}
                        ></i>
                      </span>
                    </div>
                  )}
                </div>

                <div className="totalFee mt-4">
                  <table
                    style={{
                      borderCollapse: "collapse",
                      width: "100%",
                    }}
                  >
                    <tbody>
                      {/* Session Details */}
                      <tr>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "start",
                          }}
                        >
                          Session Details
                        </th>
                        <td
                          style={{
                            padding: "8px",
                            textTransform: "capitalize",
                          }}
                        >
                          : {userInitialData.refPackageName}
                        </td>
                      </tr>

                      {/* Duration */}
                      <tr>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "start",
                          }}
                        >
                          Duration
                        </th>
                        <td style={{ padding: "8px" }}>
                          :{" "}
                          {receiptFromDate && receiptToDate
                            ? `${receiptFromDate} to ${receiptToDate}`
                            : fromDate && toDate
                            ? `${fromDate.toLocaleDateString("en-GB", {
                                month: "2-digit",
                                year: "numeric",
                              })} to ${toDate.toLocaleDateString("en-GB", {
                                month: "2-digit",
                                year: "numeric",
                              })}`
                            : "From date to To date"}
                        </td>
                      </tr>

                      {/* Sub Total */}
                      <tr>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "start",
                          }}
                        >
                          Sub Total
                        </th>
                        <td style={{ padding: "8px" }}>
                          : {fee > 0 ? `₹ ${fee}` : "-"}
                        </td>
                      </tr>

                      {/* Offers */}
                      <tr>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "start",
                          }}
                        >
                          Offers
                        </th>
                        <td style={{ padding: "8px" }}>
                          : {receiptOfferType ? receiptOfferType : "--Nil--"}
                        </td>
                      </tr>

                      {/* Offer Discount */}
                      <tr>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "start",
                          }}
                        >
                          Offer Discount
                        </th>
                        <td style={{ padding: "8px" }}>
                          :{" "}
                          {receiptOfferName === "Percentage"
                            ? `${receiptOfferName} %`
                            : receiptOfferName === "Discount"
                            ? `₹ ${receiptOfferName}`
                            : receiptOfferName
                            ? receiptOfferName
                            : "--Nil--"}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table
                    style={{
                      borderCollapse: "collapse",
                      width: "100%",
                      border: "1px solid black",
                      marginTop: "15px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{ border: "1px solid black", padding: "8px" }}
                        >
                          Offer Fee
                        </th>
                        <th
                          style={{ border: "1px solid black", padding: "8px" }}
                        >
                          CGST (9%)
                        </th>
                        <th
                          style={{ border: "1px solid black", padding: "8px" }}
                        >
                          SGST (9%)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{ border: "1px solid black", padding: "8px" }}
                        >
                          ₹{" "}
                          {receiptFinalfee
                            ? receiptFinalfee
                            : fee > 0
                            ? fee
                            : "-"}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "8px" }}
                        >
                          ₹ {fee > 0 ? cgst.toFixed(2) : "0"}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "8px" }}
                        >
                          ₹ {fee > 0 ? sgst.toFixed(2) : "0"}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex items-center gap-3">
                    <h4>Total</h4>
                    <p>
                      {totalAmount > 0 ? `₹ ${totalAmount.toFixed(2)}` : "-"}
                    </p>
                  </div>
                </div>
              </div>
              <h5 className="mb-2">Terms & Conditions</h5>
              <h6 className="text-justify m-0">
                User has to be complete their sessions on the subscribed month
                itself, the sessions cannot be compensate or carry forward to
                the next month.
              </h6>
              <h5 className="mb-2">Compensation Classes:</h5>
              <h6 className="text-justify m-0">
                {" "}
                All subscription sessions purchased by User are non-refundable,
                non exchangeable, non- saleable and non- transferrable. User
                wishes to disconitinue with its subscription, User will not
                receive the refund.
              </h6>
              <h5 className="mb-2">Refund:</h5>
              <h6 className="text-justify m-0">
                All subscription sessions are non-refundable, non-exchangeable
                and non-transferable. If a user decides to discontinue the
                subscription, no refund will be issued.
              </h6>
              <div className="flex pt-4 justify-content-between">
                <Button
                  label="Back"
                  severity="danger"
                  raised
                  icon="pi pi-arrow-left"
                  onClick={() =>
                    stepperRef.current && stepperRef.current.prevCallback()
                  }
                />
                <Button
                  label="Pay"
                  icon="pi pi-check"
                  raised
                  iconPos="right"
                  severity="success"
                  onClick={handlePayment}
                />
              </div>
            </StepperPanel>
          </Stepper>
        </div>
      </Sidebar>
    </div>
  );
};

export default UserPayment;
