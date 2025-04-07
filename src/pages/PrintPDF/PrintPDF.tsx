import React, { useEffect, useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  pdf,
} from "@react-pdf/renderer";
import logo from "../../assets/Images/Logo/logo.png";
import PoppinsBold from "../../assets/Font/Poppins-Bold.ttf";
import PoppinsSemiBold from "../../assets/Font/Poppins-SemiBold.ttf";
import { Button } from "primereact/button";
import Axios from "axios";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";

// Register the font with specified weights
Font.register({
  family: "Poppins",
  fonts: [
    { src: PoppinsBold, fontWeight: "bold" },
    { src: PoppinsSemiBold, fontWeight: 600 }, // Corrected font weight
  ],
});

interface PrintPDFProps {
  refOrderId: any;
  closePayment: () => void;
}

type DecryptResult = any; 

const PrintPDF: React.FC<PrintPDFProps> = ({ refOrderId, closePayment }) => {
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
  const FetchData = async () => {
    console.log(refOrderId);

    await Axios.post(
      import.meta.env.VITE_API_URL + "/userPayment/invoiceDownload",
      { refOrderId: refOrderId },
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
      if (data.token == false) {
        navigate("/expired");
      }
      console.log(' -> Line Number ----------------------------------- 83',);
      console.log(data);
      console.log(' -> Line Number ----------------------------------- 85',);
      const userData = data.data;
      console.log(' -> Line Number ----------------------------------- 87',);
      // setUserData({
      //   refBranchName: userData.refBranchName,
      //   refCtMobile: userData.refCtMobile,
      //   refCustTimeData: userData.refCustTimeData,
      //   refGstPaid: userData.refGstPaid,
      //   refOfferType: userData.refOfferType,
      //   refOfferValue: userData.refOfferValue,
      //   refOrderId: userData.refOrderId,
      //   refPaymentFrom: userData.refPaymentFrom,
      //   refPaymentTo: userData.refPaymentTo,
      //   refSCustId: userData.refSCustId,
      //   refStFName: userData.refStFName,
      //   refStLName: userData.refStLName,
      //   refTimeMembers: userData.refTimeMembers,
      //   refToAmt: userData.refToAmt,
      //   refToAmtOf: userData.refToAmtOf,
      //   refDate: userData.refDate,
      //   refExpiry: userData.refExpiry,
      //   refFeesPaid: userData.refFeesPaid,
      //   refFeesAmtOf: userData.refFeesAmtOf,
      // });
      setUserDatas(userData)
      console.log(' -> Line Number ----------------------------------- 128',);
      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const [userData, _setUserData] = useState({
    refBranchName: "",
    refCtMobile: "",
    refCustTimeData: "",
    refFeesPaid: 0,
    refGstPaid: 0,
    refOfferType: "",
    refOfferValue: "",
    refOrderId: "",
    refPaymentFrom: "",
    refPaymentTo: "",
    refSCustId: "",
    refStFName: "",
    refStLName: "",
    refTimeMembers: "",
    refToAmt: "",
    refToAmtOf: "",
    refDate: "",
    refExpiry: "",
    refFeesAmtOf: 0,
  });

  const [userDatas, setUserDatas] = useState([{
    refBranchName: "",
    refCtMobile: "",
    refDuration: "",
    refFeesPaid: 0,
    refName: "",
    refOffer: null,
    refOfferName: null,
    refOrderId: "",
    refPackage: "",
    refPagExp: "",
    refPagFees: 0,
    refPayDate: "",
    refPaymentCharge: 0,
    refSCustId: "",
    refStId: null,
    refTransId: "",
    sub_amount: "",
    refOfferId: 0
  }]);

  const [isDataFetched, setIsDataFetched] = useState(false);

  const handleDownloadPDF = async () => {
    await setIsDataFetched(false);
    await FetchData();
    await setIsDataFetched(true);
    { localStorage.getItem("refUtId") === "4" || localStorage.getItem("refUtId") === "7" || localStorage.getItem("refUtId") === "12" ? closePayment() : navigate("/users/payment") }

  };

  useEffect(() => {
    if (isDataFetched) {
      generatePDF();
    }
  }, [isDataFetched]);

  const generatePDF = async () => {

    // let content = "";

    // if (userData.refOfferType === "Custom") {
    //   content = "Month";
    // } else if (userData.refOfferType === "Discount") {
    //   content = "Rs Discount";
    // } else if (userData.refOfferType === "Percentage") {
    //   content = "% Discount";
    // }

    const doc = (
      <Document>
        <Page size="A4">
          <View
            style={{
              paddingTop: "10px",
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f84f04",
                paddingBottom: "5px",
              }}
            >
              <Image src={logo} style={{ width: "125px", height: "auto" }} />
              <View>
                <Text
                  style={{
                    fontSize: "20px",
                    fontFamily: "Poppins",
                    fontWeight: "bold",
                    color: "#f95005",
                  }}
                >
                  Ublis Yoga India Private Limited
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    marginTop: "3px",
                    textAlign: "right",
                  }}
                >
                  No: 28, Second Floor, Madambakkam Main Road,
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    marginTop: "3px",
                    textAlign: "right",
                  }}
                >
                  Opp. to Jains Sudharshana Apartment, Gandhi nagar,
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    marginTop: "3px",
                    textAlign: "right",
                  }}
                >
                  Rajakilpakkam, Chennai, Tamil Nadu-600073, India
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    marginTop: "5px",
                    textAlign: "right",
                    fontFamily: "Poppins",
                    fontWeight: 600,
                  }}
                >
                  GSTIN 33AACCU8675J1ZV
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    marginTop: "3px",
                    textAlign: "right",
                    fontFamily: "Poppins",
                    fontWeight: 600,
                  }}
                >
                  Email: helpdesk.rajakilpakkam@ublisyoga.com
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    marginTop: "3px",
                    textAlign: "right",
                    fontFamily: "Poppins",
                    fontWeight: 600,
                  }}
                >
                  Mobile: +91 9940082000
                </Text>
              </View>
            </View>

            <View
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                alignItems: "center",
                marginTop: "10px",
                fontFamily: "Poppins",
                fontWeight: 600, // Apply 600 for semi-bold
              }}
            >
              <Text style={{ fontSize: "25px" }}>Tax Invoice</Text>
            </View>

            <View
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                border: "2px solid #f95005",
                borderRadius: "4px",
              }}
            >
              <View
                style={{
                  width: "50%",

                  padding: "6px",
                }}
              >
                <View style={{ display: "flex", flexDirection: "row" }}>
                  <Text
                    style={{
                      width: "40%",
                      fontSize: "13px",
                      fontFamily: "Poppins",
                      fontWeight: "bold",
                      color: "#f95005",
                    }}
                  >
                    Customer ID
                  </Text>
                  <Text style={{ width: "60%", fontSize: "13px" }}>
                    : {userDatas[0].refSCustId}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: "5px",
                  }}
                >
                  <Text
                    style={{
                      width: "40%",
                      fontSize: "13px",
                      fontFamily: "Poppins",
                      fontWeight: "bold",
                      color: "#f95005",
                    }}
                  >
                    Name
                  </Text>
                  <Text style={{ width: "60%", fontSize: "13px" }}>
                    : {userDatas[0].refName}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: "5px",
                  }}
                >
                  <Text
                    style={{
                      width: "40%",
                      fontSize: "13px",
                      fontFamily: "Poppins",
                      fontWeight: "bold",
                      color: "#f95005",
                    }}
                  >
                    Phone Number
                  </Text>
                  <Text style={{ width: "60%", fontSize: "13px" }}>
                    : {userDatas[0].refCtMobile}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  width: "50%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >




                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        width: "40%",
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        fontWeight: "bold",
                        color: "#f95005",
                        textAlign: "left",
                      }}
                    >
                      Date
                    </Text>
                    <Text
                      style={{
                        width: "60%",
                        fontSize: "13px",
                        paddingLeft: "10px",
                      }}
                    >
                      {userDatas[0].refPayDate}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        width: "40%",
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        fontWeight: "bold",
                        color: "#f95005",
                        textAlign: "left",
                      }}
                    >
                      Branch
                    </Text>
                    <Text
                      style={{
                        width: "60%",
                        fontSize: "13px",
                        paddingLeft: "10px",
                      }}
                    >
                      {userDatas[0].refBranchName}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        width: "40%",
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        fontWeight: "bold",
                        color: "#f95005",
                        textAlign: "left",
                      }}
                    >
                      Receipt ID
                    </Text>
                    <Text
                      style={{
                        width: "60%",
                        fontSize: "13px",
                        paddingLeft: "10px",
                      }}
                    >
                      {userDatas[0].refOrderId}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        width: "40%",
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        fontWeight: "bold",
                        color: "#f95005",
                        textAlign: "left",
                      }}
                    >
                      Transaction ID
                    </Text>
                    <Text
                      style={{
                        width: "60%",
                        fontSize: "13px",
                        paddingLeft: "10px",
                      }}
                    >
                      {userDatas[0].refTransId}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={{
                width: "100%",
                marginTop: "20px",
                marginBottom: "20px",
                border: "2px solid #f95005",
                borderRadius: "4px",
              }}
            >
              <View
                style={{
                  width: "100%",
                  backgroundColor: "#fff",
                  display: "flex",
                  flexDirection: "row",
                  borderBottom: "1px solid #f95005",
                }}
              >
                <View
                  style={{
                    width: "25%",
                    height: "40px",
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    color: "#f95005",
                    borderRight: "1px solid #f95005",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Product</Text>
                </View>
                <View
                  style={{
                    width: "25%",
                    height: "40px",
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    color: "#f95005",
                    borderRight: "1px solid #f95005",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Duration</Text>
                </View>
                <View
                  style={{
                    width: "20%",
                    height: "40px",
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    color: "#f95005",
                    borderRight: "1px solid #f95005",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Fee</Text>
                </View>
                <View
                  style={{
                    width: "20%",
                    height: "40px",
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    color: "#f95005",
                    borderRight: "1px solid #f95005",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Offers</Text>
                </View>
                <View
                  style={{
                    width: "20%",
                    height: "40px",
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    color: "#f95005",
                    borderRight: "1px solid #f95005",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Total</Text>
                </View>
                {/* <View
                  style={{
                    width: "20%",
                    height: "40px",
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    color: "#f95005",
                    textAlign: "center",
                    borderRight: "1px solid #f95005",
                  }}
                >
                  <Text
                    style={{
                      width: "100%",
                      height: "20px",
                      fontSize: "12px",
                      fontFamily: "Poppins",
                      color: "#f95005",
                      textAlign: "center",
                      borderBottom: "1px solid #f95005",
                    }}
                  >
                    CGST
                  </Text>
                  <View
                    style={{
                      width: "100%",
                      height: "20px",
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        width: "50%",
                        fontSize: "12px",
                        fontFamily: "Poppins",
                        color: "#f95005",
                        textAlign: "center",
                        borderRight: "1px solid #f95005",
                      }}
                    >
                      %
                    </Text>
                    <Text
                      style={{
                        width: "50%",
                        fontSize: "12px",
                        fontFamily: "Poppins",
                        color: "#f95005",
                        textAlign: "center",
                      }}
                    >
                      Amt
                    </Text>
                  </View>
                </View> */}

                {/* <View
                  style={{
                    width: "20%",
                    height: "40px",
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    color: "#f95005",
                    textAlign: "center",
                  }}
                >
                  <Text
                    style={{
                      width: "100%",
                      height: "20px",
                      fontSize: "12px",
                      fontFamily: "Poppins",
                      color: "#f95005",
                      textAlign: "center",
                      borderBottom: "1px solid #f95005",
                    }}
                  >
                    SGST
                  </Text>
                  <View
                    style={{
                      width: "100%",
                      height: "20px",
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        width: "50%",
                        fontSize: "12px",
                        fontFamily: "Poppins",
                        color: "#f95005",
                        textAlign: "center",
                        borderRight: "1px solid #f95005",
                      }}
                    >
                      %
                    </Text>
                    <Text
                      style={{
                        width: "50%",
                        fontSize: "12px",
                        fontFamily: "Poppins",
                        color: "#f95005",
                        textAlign: "center",
                      }}
                    >
                      Amt
                    </Text>
                  </View>
                </View> */}
              </View>

              {userDatas.map(data =>
                <View
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "row",
                    borderBottom: "1px solid #f95005",
                  }}
                >
                  <View
                    style={{
                      width: "25%",
                      height: "40px",
                      fontSize: "12px",
                      color: "#000",
                      textAlign: "center",
                      borderRight: "1px solid #f95005",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ padding: "2px" }}>
                      {data.refPackage}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "25%",
                      height: "40px",
                      fontSize: "12px",
                      color: "#000",
                      textAlign: "center",
                      borderRight: "1px solid #f95005",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ padding: "2px" }}>
                      {data.refDuration}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "20%",
                      height: "40px",
                      fontSize: "12px",
                      color: "#000",
                      textAlign: "center",
                      borderRight: "1px solid #f95005",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ padding: "2px" }}>
                      {data.refPagFees}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "20%",
                      height: "40px",
                      fontSize: "12px",
                      color: "#000",
                      textAlign: "center",
                      borderRight: "1px solid #f95005",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ padding: "2px" }}>
                      {data.refOfferId === 1
                        ? `${data.refOffer}%`
                        : data.refOfferId === 2
                          ? `₹${data.refOffer}`
                          : data.refOfferId === 3
                            ? `${data.refOffer} Month`
                            : data.refOffer || "-"}
                    </Text>

                  </View>
                  <View
                    style={{
                      width: "20%",
                      height: "40px",
                      fontSize: "12px",
                      color: "#000",
                      textAlign: "center",
                      borderRight: "1px solid #f95005",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ padding: "2px" }}>
                      {data.sub_amount}
                    </Text>
                  </View>


                </View>
              )}

              <View
                style={{
                  width: "100%",
                  backgroundColor: "#fff",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    width: "55%",
                    borderRight: "1px solid #f95005",
                    display: "flex",
                    flexDirection: "row",
                    padding: "10px",
                  }}
                >

                  <Text style={{ width: "40%", fontSize: "12px" }}>
                    {userData.refExpiry}
                  </Text>
                </View>
                <View style={{ width: "43%" }}>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      textAlign: "right",
                      fontSize: "11px",
                      marginTop: "10px",
                    }}
                  >
                    <Text style={{ width: "50%" }}>Sub Total</Text>
                    <Text style={{ width: "50%" }}>{userDatas.reduce((total, count) => total + parseFloat(count.sub_amount || "0"), 0)}
                    </Text>
                  </View>

                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      textAlign: "right",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    <Text style={{ width: "50%" }}>CGST(9%)</Text>
                    <Text style={{ width: "50%" }}>
                      {((userDatas.reduce((total, count) => total + parseFloat(count.sub_amount || "0"), 0)) * 0.09).toFixed(2)}
                    </Text>

                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      textAlign: "right",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    <Text style={{ width: "50%" }}>SGST(9%)</Text>
                    <Text style={{ width: "50%" }}>
                      {((userDatas.reduce((total, count) => total + parseFloat(count.sub_amount || "0"), 0)) * 0.09).toFixed(2)}
                    </Text>

                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      textAlign: "right",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    <Text style={{ width: "50%" }}>Payment Charges</Text>
                    <Text style={{ width: "50%" }}>
                      {userDatas[0].refPaymentCharge || "-"}
                    </Text>

                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      textAlign: "right",
                      fontSize: "11px",
                      marginTop: "4px",
                      fontFamily: "Poppins",
                    }}
                  >
                    <Text style={{ width: "50%" }}>Total</Text>
                    <Text style={{ width: "50%" }}>&#8377; {(
                      userDatas.reduce((total, count) => total + parseFloat(count.sub_amount || "0"), 0) + userDatas[0].refPaymentCharge +
                      2 * (userDatas.reduce((total, count) => total + parseFloat(count.sub_amount || "0"), 0) * 0.09)
                    ).toFixed(2)}
                    </Text>

                  </View>
                </View>
              </View>
            </View>

            <View>
              <Text style={{ fontSize: "16px", fontFamily: "Poppins" }}>
                Terms & Conditions
              </Text>
              <Text
                style={{
                  fontSize: "12.5px",
                  marginTop: "10px",
                  textAlign: "justify",
                }}
              >
                Users must complete their sessions within the subscribed month. Sessions cannot be compensated,
              </Text>
              <Text
                style={{
                  fontSize: "12.5px",
                  // marginTop: "10px",
                  textAlign: "justify",
                }}
              >
                carried forward, or rescheduled to the next month.
              </Text>

              {/* <Text style={{ fontSize: "12px", fontFamily: "Poppins" }}>
                Compensation Classes:
              </Text> */}
              <Text
                style={{
                  fontSize: "12.5px",
                  marginTop: "10px",
                  textAlign: "justify",
                }}
              >
                All subscribed sessions purchased by the user are non-refundable, non-exchangeable, non-saleable, and non-transferable. If a user wishes to discontinue their subscription, they will not receive a refund.
              </Text>

              <Text style={{ fontSize: "12px", fontFamily: "Poppins", marginTop: "5px", }}>
                Refund:
              </Text>
              <Text
                style={{
                  fontSize: "12px",
                  marginTop: "5px",
                  textAlign: "justify",
                }}
              >
                All subscribed sessions are non-refundable, non-exchangeable and non-transferable. If a user decides to discontinue the subscription, no refund will be issued.

              </Text>


            </View>

            <View>
              <Text
                style={{
                  fontSize: "12px",
                  fontFamily: "Poppins",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                This is computer generated invoice no signature required
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#f95005",
                paddingTop: "10px",
                paddingBottom: "10px",
                width: "110%",
                marginLeft: "-30px",
                marginTop: "30px",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  textAlign: "center",
                  fontFamily: "Poppins",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {" "}
                Copyright © Ublis Yoga - {new Date().getFullYear()}. All Rights
                Reserved.
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    );
    const pdfBlob = await pdf(doc).toBlob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(pdfBlob);
    link.download = userData.refOrderId + ".pdf";
    link.click();

    // Clean up the link element
    URL.revokeObjectURL(link.href);

    // closePayment();
  };

  return (
    <div>
      <Button onClick={handleDownloadPDF} label="Download PDF" />
    </div>
  );
};

export default PrintPDF;
