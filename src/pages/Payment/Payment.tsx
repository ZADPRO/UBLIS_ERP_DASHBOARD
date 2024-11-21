import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useEffect, useState } from "react";
import Axios from "axios";
import CryptoJS from "crypto-js";
import PrintPDF from "../PrintPDF/PrintPDF";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface PaymentProps {
  refStId: string;
  closePayment: () => void;
}

type DecryptResult = any;

interface PaymentInput {
  customerid: string;
  name: string;
  membersession: string;
  sessiontype: string;
  paymentfromDate: Date | null;
  paymenttoDate: Date | null;
  paymentExpireDate: Date | null;
  paymentfees: any;
  paymentgst: any;
  paymenttotal: any;
  coupon: string;
  couponfees: string;
  coupongst: any;
  coupontotal: string;
  couponexpireDate: Date | null;
  cashStatus: boolean;
  staffid: string;
  refOfferValue: string;
  refOfferType: string;
  refOfferName: string;
}

const Payment: React.FC<PaymentProps> = ({ refStId, closePayment }) => {
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

  const [constfees, setConstFees] = useState(0);

  const fetchData = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/finance/studentFeesDetails",
      {
        refStId: refStId,
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

      const userData = data.data[0];

      setConstFees(userData.refFees);

      setPaymentInput({
        ...paymentInput,
        customerid: userData.refSCustId,
        name: userData.FirstName + " " + userData.LastName,
        membersession: userData.refTimeMembers,
        sessiontype: userData.refCustTimeData,
        paymentfromDate: userData.refPaymentFrom,
        paymenttoDate: userData.refPaymentTo,
        paymentExpireDate: userData.refPaymentTo,
        paymentfees: userData.refFees,
        paymentgst: userData.refGst,
        paymenttotal: userData.refFeTotal,
      });

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  useEffect(() => {
    fetchData();
    getHistory();
  }, []);

  const [paymentInput, setPaymentInput] = useState<PaymentInput>({
    customerid: "",
    name: "",
    membersession: "",
    sessiontype: "",
    paymentfromDate: null,
    paymenttoDate: null,
    paymentExpireDate: null,
    paymentfees: "",
    paymentgst: "",
    paymenttotal: "",
    coupon: "",
    couponfees: "",
    coupongst: "",
    coupontotal: "",
    couponexpireDate: null,
    cashStatus: false,
    staffid: "",
    refOfferValue: "",
    refOfferType: "",
    refOfferName: "",
  });

  const [couponStatus, setCouponStatus] = useState(false);

  const [couponError, setCouponError] = useState(false);

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const [customOffer, setCustomOffer] = useState(false);

  const submitCoupon = () => {
    setCouponError(false);
    Axios.post(
      import.meta.env.VITE_API_URL + "/finance/verifyCoupon",
      {
        refCoupon: paymentInput.coupon,
        refToAmt: paymentInput.paymenttotal,
        refGst: paymentInput.paymentgst,
        refFees: paymentInput.paymentfees,
        refExDate: formatDate(paymentInput.paymentExpireDate),
        refStartDate: formatDate(paymentInput.paymentfromDate),
        refEndDate: formatDate(paymentInput.paymenttoDate),
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

      const fetchedData = data.data;

      if (data.success) {
        setCouponStatus(true);

        const gst = fetchedData.refFees * 0.18;
        const totalgst = gst + fetchedData.refFees;

        setPaymentInput({
          ...paymentInput,
          couponfees: fetchedData.refFees,
          coupongst: gst,
          coupontotal: totalgst,
          couponexpireDate: fetchedData.refExDate,
          refOfferValue: fetchedData.refOfferValue,
          refOfferType: fetchedData.refOfferType,
          refOfferName: fetchedData.refOfferName,
          paymenttoDate: fetchedData.refEndDate,
        });

        if (
          fetchedData.refOfferName === "Percentage" ||
          fetchedData.refOfferName === "Discount"
        ) {
          setCustomOffer(false);
        } else {
          setCustomOffer(true);
        }
      } else {
        setCouponError(true);
      }

      console.log("Coupon Data -----------", data);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const [downloadStatus, setDownloadStatus] = useState({
    status: false,
    id: "",
  });

  const handlePayment = (e: any) => {
    e.preventDefault();

    Axios.post(
      import.meta.env.VITE_API_URL + "/finance/FeesPaid",
      {
        refStId: refStId,
        refPaymentMode: "offline",
        refPaymentFrom: paymentInput.paymentfromDate,
        refPaymentTo: paymentInput.paymenttoDate,
        refExpiry: paymentInput.couponexpireDate
          ? paymentInput.couponexpireDate
          : paymentInput.paymentExpireDate,
        refToAmt: paymentInput.coupontotal
          ? paymentInput.coupontotal
          : paymentInput.paymenttotal,
        refFeesAmtOf: paymentInput.couponfees ? paymentInput.couponfees : 0,
        refOfferValue: paymentInput.refOfferValue
          ? paymentInput.refOfferValue
          : null,
        refFeesPaid: paymentInput.paymentfees,
        refGstPaid: paymentInput.paymentgst,
        refCoupon: paymentInput.coupon ? paymentInput.coupon : null,
        refOfferType: paymentInput.refOfferType
          ? paymentInput.refOfferType
          : null,
        refOfferName: paymentInput.refOfferName
          ? paymentInput.refOfferName
          : null,
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
        setDownloadStatus({
          status: true,
          id: data.data,
        });
      }

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const [getHistoryData, setGetHistoryData] = useState();

  const getHistory = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/finance/userPaymentAuditPg",
      {
        refStId: refStId,
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

      console.log(data.data);

      setGetHistoryData(data.data);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const returnDownloadBtn = (rowData: any) => {
    return (
      <>
        <PrintPDF closePayment={closePayment} refOrderId={rowData.refOrderId} />
      </>
    );
  };

  return (
    <TabView>
      <TabPanel header="Payment">
        <div className="flex justify-between mt-3">
          <div className="w-[48%] flex flex-col gap-[5px]">
            <label>Customer ID</label>
            <InputText value={paymentInput.customerid} readOnly />
          </div>
          <div className="w-[48%] flex flex-col gap-[5px]">
            <label>Name</label>
            <InputText value={paymentInput.name} readOnly />
          </div>
        </div>
        <h3>Class Type</h3>
        <div className="flex justify-between mt-3">
          <div className="w-[48%] flex flex-col gap-[5px]">
            <label>Members Session</label>
            <InputText value={paymentInput.membersession} readOnly />
          </div>
          <div className="w-[48%] flex flex-col gap-[5px]">
            <label>Session Type</label>
            <InputText value={paymentInput.sessiontype} readOnly />
          </div>
        </div>
        <h3>Payment</h3>
        <div className="flex justify-between mt-3">
          <div className="w-[32%] flex flex-col gap-[5px]">
            <label>From Date</label>
            <Calendar
              view="month"
              dateFormat="mm/yy"
              value={
                paymentInput.paymentfromDate
                  ? new Date(paymentInput.paymentfromDate)
                  : null
              }
              onChange={(e) => {
                const fromDate = new Date(e.value + "-01");
                const toDate = new Date(paymentInput.paymenttoDate + "-01");

                // Calculate the difference in months
                const monthsDifference =
                  (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
                  (toDate.getMonth() - fromDate.getMonth()) +
                  1; // Add 1 to include both months

                const fees = constfees * monthsDifference;
                const gst = 0.18 * fees;
                setPaymentInput({
                  ...paymentInput,
                  paymentfromDate: e.value || null,
                  paymentfees: fees,
                  paymentgst: gst,
                  paymenttotal: fees + gst,
                });
              }}
              disabled
            />
          </div>
          <div className="w-[32%] flex flex-col gap-[5px]">
            <label>To Date</label>
            <Calendar
              value={
                paymentInput.paymenttoDate
                  ? new Date(paymentInput.paymenttoDate)
                  : null
              }
              onChange={(e) => {
                const fromDate = new Date(paymentInput.paymentfromDate + "-01");
                const toDate = new Date(e.value + "-01");

                // Calculate the difference in months
                const monthsDifference =
                  (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
                  (toDate.getMonth() - fromDate.getMonth()) +
                  1; // Add 1 to include both months

                const fees = constfees * monthsDifference;
                const gst = 0.18 * fees;
                setPaymentInput({
                  ...paymentInput,
                  paymenttoDate: e.value || null,
                  paymentExpireDate: e.value || null,
                  paymentfees: fees,
                  paymentgst: gst,
                  paymenttotal: fees + gst,
                });
              }}
              view="month"
              dateFormat="mm/yy"
              minDate={
                new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
              disabled={couponStatus}
            />
          </div>
          <div className="w-[32%] flex flex-col gap-[5px]">
            <label>Package End On</label>
            <Calendar
              view="month"
              dateFormat="mm/yy"
              value={
                paymentInput.paymentExpireDate
                  ? new Date(paymentInput.paymentExpireDate)
                  : null
              }
              disabled
            />
          </div>
        </div>
        <div className="flex justify-between mt-3">
          <div className="w-[32%] flex flex-col gap-[5px]">
            <label>Fees</label>
            <InputText value={paymentInput.paymentfees} readOnly />
          </div>
          <div className="w-[32%] flex flex-col gap-[5px]">
            <label>GST</label>
            <InputText value={paymentInput.paymentgst} readOnly />
          </div>
          <div className="w-[32%] flex flex-col gap-[5px]">
            <label>Total Amount</label>
            <InputText value={paymentInput.paymenttotal} readOnly />
          </div>
        </div>

        <h3>Offers</h3>
        <div className="flex justify-between mt-3">
          <div className="w-[80%] flex flex-col gap-[5px]">
            <label>Coupon</label>
            <InputText
              value={paymentInput.coupon}
              onChange={(e: any) => {
                setCouponError(false);
                setPaymentInput({
                  ...paymentInput,
                  coupon: e.target.value,
                });
              }}
              readOnly={couponStatus}
            />
          </div>
          <div className="w-[15%] flex flex-col gap-[5px]">
            {couponStatus ? (
              <Button
                className="mt-3"
                severity="info"
                label="Cancel"
                onClick={() => {
                  setCouponStatus(false);
                  setPaymentInput({
                    ...paymentInput,
                    coupon: "",
                  });
                }}
              />
            ) : (
              <Button
                className="mt-3"
                severity="warning"
                label="Verify"
                onClick={submitCoupon}
              />
            )}
          </div>
        </div>
        {couponError ? (
          <p className="text-[red]">Invalid or Expired Token</p>
        ) : null}
        {couponStatus ? (
          <>
            {customOffer ? (
              <div className="flex justify-between mt-3">
                <div className="w-[100%] flex flex-col gap-[5px]">
                  <label>Package End On</label>
                  <Calendar
                    view="month"
                    dateFormat="mm/yy"
                    value={
                      paymentInput.couponexpireDate
                        ? new Date(paymentInput.couponexpireDate)
                        : null
                    }
                    disabled
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-between mt-3">
                <div className="w-[32%] flex flex-col gap-[5px]">
                  <label>Offer Fees</label>
                  <InputText value={paymentInput.couponfees} readOnly />
                </div>
                <div className="w-[32%] flex flex-col gap-[5px]">
                  <label>GST</label>
                  <InputText value={paymentInput.coupongst} readOnly />
                </div>
                <div className="w-[32%] flex flex-col gap-[5px]">
                  <label>Total Amount</label>
                  <InputText value={paymentInput.coupontotal} readOnly />
                </div>
              </div>
            )}
          </>
        ) : null}

        <h3>Verification</h3>
        <form onSubmit={handlePayment}>
          <div className="flex justify-between mt-3">
            <div className="w-[100%] flex flex-col gap-[5px]">
              <div className="flex align-items-center">
                <Checkbox
                  inputId="ingredient1"
                  name="pizza"
                  value="Cheese"
                  onChange={() => {
                    setPaymentInput({
                      ...paymentInput,
                      cashStatus: !paymentInput.cashStatus,
                    });
                  }}
                  checked={paymentInput.cashStatus}
                  required
                />
                <label htmlFor="ingredient1" className="ml-2">
                  Cash Collected
                </label>
              </div>
            </div>
          </div>

          <div className="w-[100%] mt-5 flex justify-center">
            {downloadStatus.status ? (
              <>
                <PrintPDF
                  closePayment={closePayment}
                  refOrderId={downloadStatus.id}
                />
              </>
            ) : (
              <>
                <Button severity="success" type="submit" label="Pay Amount" />
              </>
            )}
          </div>
        </form>
      </TabPanel>
      <TabPanel header="History">
        <DataTable
          paginator
          rows={10}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          rowsPerPageOptions={[10, 25, 50]}
          dataKey="id"
          tableStyle={{ minWidth: "50rem" }}
          value={getHistoryData}
        >
          <Column field="refOrderId" header="Order ID"></Column>
          <Column field="refDate" header="Payment Date"></Column>
          <Column field="refExpiry" header="Expiry Date"></Column>
          <Column
            field="refOrderId"
            body={returnDownloadBtn}
            header="Download"
          ></Column>
        </DataTable>
      </TabPanel>
    </TabView>
  );
};

export default Payment;
