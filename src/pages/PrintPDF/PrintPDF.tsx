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

  const FetchData = async () => {
    console.log(refOrderId);

    await Axios.post(
      import.meta.env.VITE_API_URL + "/finance/invoiceDownload",
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

      console.log(data);

      const userData = data.data[0];

      setUserData({
        refBranchName: userData.refBranchName,
        refCtMobile: userData.refCtMobile,
        refCustTimeData: userData.refCustTimeData,
        refGstPaid: userData.refGstPaid,
        refOfferType: userData.refOfferType,
        refOfferValue: userData.refOfferValue,
        refOrderId: userData.refOrderId,
        refPaymentFrom: userData.refPaymentFrom,
        refPaymentTo: userData.refPaymentTo,
        refSCustId: userData.refSCustId,
        refStFName: userData.refStFName,
        refStLName: userData.refStLName,
        refTimeMembers: userData.refTimeMembers,
        refToAmt: userData.refToAmt,
        refToAmtOf: userData.refToAmtOf,
        refDate: userData.refDate,
        refExpiry: userData.refExpiry,
        refFeesPaid: userData.refFeesPaid,
        refFeesAmtOf: userData.refFeesAmtOf,
      });
      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const [userData, setUserData] = useState({
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

  const [isDataFetched, setIsDataFetched] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDataFetched(false);
    await FetchData();
    setIsDataFetched(true);
  };

  useEffect(() => {
    if (isDataFetched) {
      generatePDF();
    }
  }, [isDataFetched]);

  const generatePDF = async () => {
    const gst = userData.refGstPaid / 2;

    let content = "";

    if (userData.refOfferType === "Custom") {
      content = "Month";
    } else if (userData.refOfferType === "Discount") {
      content = "Rs Discount";
    } else if (userData.refOfferType === "Percentage") {
      content = "% Discount";
    }

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
                  No :28, Second Floor, Madambakkam Main Road,
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    marginTop: "3px",
                    textAlign: "right",
                  }}
                >
                  Opp. to Jains Sudharshana Apartment Gandhi nagar,
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
                marginTop: "10px",
              }}
            >
              <View
                style={{
                  width: "55%",
                  border: "2px solid #f95005",
                  borderRadius: "4px",
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
                    : {userData.refSCustId}
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
                    : {userData.refStFName} {userData.refStLName}
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
                    : {userData.refCtMobile}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  width: "40%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        width: "40%",
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        fontWeight: "bold",
                        color: "#f95005",
                        textAlign: "right",
                      }}
                    >
                      Date:
                    </Text>
                    <Text
                      style={{
                        width: "60%",
                        fontSize: "13px",
                        paddingLeft: "10px",
                      }}
                    >
                      {userData.refDate}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        width: "40%",
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        fontWeight: "bold",
                        color: "#f95005",
                        textAlign: "right",
                      }}
                    >
                      Branch:
                    </Text>
                    <Text
                      style={{
                        width: "60%",
                        fontSize: "13px",
                        paddingLeft: "10px",
                      }}
                    >
                      {userData.refBranchName}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        width: "40%",
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        fontWeight: "bold",
                        color: "#f95005",
                        textAlign: "right",
                      }}
                    >
                      Receipt ID:
                    </Text>
                    <Text
                      style={{
                        width: "60%",
                        fontSize: "13px",
                        paddingLeft: "10px",
                      }}
                    >
                      {userData.refOrderId}
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
                  <Text>Description</Text>
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
                  <Text>Date</Text>
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
                </View>

                <View
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
                </View>
              </View>
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
                    height: "60px",
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
                    {userData.refTimeMembers} & {userData.refCustTimeData}{" "}
                    Session
                  </Text>
                </View>

                <View
                  style={{
                    width: "25%",
                    height: "60px",
                    fontSize: "12px",
                    color: "#000",
                    textAlign: "center",
                    borderRight: "1px solid #f95005",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>
                    {userData.refPaymentFrom} - {userData.refPaymentTo}
                  </Text>
                </View>

                <View
                  style={{
                    width: "20%",
                    height: "60px",
                    fontSize: "12px",
                    color: "#000",
                    textAlign: "center",
                    borderRight: "1px solid #f95005",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>{userData.refFeesPaid}</Text>
                </View>

                <View
                  style={{
                    width: "20%",
                    height: "60px",
                    fontSize: "12px",
                    color: "#000",
                    textAlign: "center",
                    borderRight: "1px solid #f95005",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      width: "50%",
                      height: "60px",
                      borderRight: "1px solid #f95005 ",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text>9%</Text>
                  </View>
                  <View
                    style={{
                      width: "50%",
                      height: "60px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text>{gst}</Text>
                  </View>
                </View>

                <View
                  style={{
                    width: "20%",
                    height: "60px",
                    fontSize: "12px",
                    color: "#000",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      width: "50%",
                      height: "60px",
                      borderRight: "1px solid #f95005 ",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text>9%</Text>
                  </View>
                  <View
                    style={{
                      width: "50%",
                      height: "60px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text>{gst}</Text>
                  </View>
                </View>
              </View>

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
                    Package Expries On
                  </Text>
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
                    <Text style={{ width: "50%" }}>{userData.refFeesPaid}</Text>
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      textAlign: "right",
                      fontSize: "11px",
                      marginTop: "5px",
                    }}
                  >
                    <Text style={{ width: "50%" }}>Offer</Text>
                    <Text style={{ width: "50%" }}>
                      {userData.refOfferType ? userData.refOfferType : "-"}
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
                    <Text style={{ width: "50%" }}>Offer Discount</Text>
                    <Text style={{ width: "50%" }}>
                      {userData.refOfferValue
                        ? userData.refOfferValue + " " + content
                        : "-"}
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
                    <Text style={{ width: "50%" }}>Offer Fees</Text>
                    <Text style={{ width: "50%" }}>
                      {userData.refFeesAmtOf}
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
                      {userData.refFeesAmtOf * 0.09}
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
                      {userData.refFeesAmtOf * 0.09}
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
                    <Text style={{ width: "50%" }}>Rs.{userData.refToAmt}</Text>
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
                  fontSize: "13px",
                  marginTop: "10px",
                  textAlign: "justify",
                }}
              >
                User has to be complete their sessions on the subscribed month
                itself, the sessions cannot be compensate or carry forward to
                the next month.
              </Text>

              <Text
                style={{
                  fontSize: "13px",
                  marginTop: "10px",
                  textAlign: "justify",
                }}
              >
                All subscription sessions purchased by User are non-refundable,
                non exchangeable, non- saleable and non- transferrable. User
                wishes to disconitinue with its subscription, User will not
                receive the refund.
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: "11px",
                  fontFamily: "Poppins",
                  textAlign: "center",
                  marginTop: "20px",
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
                marginTop: "90px",
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

    closePayment();
  };

  return (
    <div>
      <Button onClick={handleDownloadPDF} label="Download PDF" />
    </div>
  );
};

export default PrintPDF;
