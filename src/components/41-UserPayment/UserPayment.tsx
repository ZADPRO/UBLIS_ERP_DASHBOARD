import Axios from "axios";
import { Skeleton } from "primereact/skeleton";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { TabPanel, TabView } from "primereact/tabview";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Sidebar } from "primereact/sidebar";
import PriceSidebar from "../../pages/PriceSidebar/PriceSidebar";
import { IoCopyOutline } from "react-icons/io5";
import logo from "../../assets/Images/Logo/OfferLogo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { PiDownloadSimpleBold } from "react-icons/pi";
import PrintPDF from "../../pages/PrintPDF/PrintPDF";


type DecryptResult = any;

export interface UserDetails {
  refBatchId: number;
  refBranchId: number;
  refFees: number;
  refPaId: number;
  refPackageName: string;
  refSCustId: string;
  refStFName: string;
  refStId: number;
  refWTimingId: string;
  refWeTimingId: string;
  weekDaysTiming: string | null;
  weekEndTiming: string | null;
  refFeesType: string;
  refClsDuration: number;
  refClsCount: number;
}

interface Offer {
  refOfId: number;
  refOfferId: number;
  refMin: number;
  refOffer: number;
  refStartAt: string;
  refEndAt: string;
  refDummy1: string;
  refDummy2: string;
  refDummy3: string;
  refDummy4: string;
  refCoupon: string;
  refContent: string;
  refBranchId: number;
  refPackage: string;
  refBatch: string;
  refOfferName: string;
  refTimeMembers: string[];
  refPackageName: string[];
  canUse: boolean;
}
interface OtherPackageInterface {
  refBranchId: number;
  refClsCount: null;
  refClsDuration: null;
  refDeleteAt: null;
  refDummy1: null;
  refDummy2: null;
  refDummy3: null;
  refFees: number;
  refFeesType: string;
  refMeetingId: null;
  refMemberType: string;
  refPaId: number;
  refPackageName: string;
  refSessionDays: string;
  refSessionMode: string;
  refWTimingId: string;
  refWeTimingId: string;
  reftimemembersarray: [];
}

const UserPayment: React.FC = () => {
  const decrypt = (
    encryptedData: string,
    iv: string,
    key: string
  ): DecryptResult => {
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(encryptedData),
    });
    
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

  const [pageLoading, setPageLoading] = useState({
    verifytoken: false,
    pageData: false,
  });

  const [offers, setOffers] = useState<Offer[]>([]);

  const availableOffers = offers.filter((offer) => offer.canUse);
  const otherOffers = offers.filter((offer) => !offer.canUse);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Coupon Code Copied Successfully", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      // transition: Bounce,
    });
  };

  const [basicUserDetails, setBasicUserDetails] =
    useState<UserDetails | null>();

  const [otherPackageDetails, setOtherPackageDetails] = useState<
    OtherPackageInterface[]
  >([]);

  const [visibleRight, setVisibleRight] = useState<boolean>(false);

  const navigate = useNavigate();

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

  const OfferCard = ({ offer }: { offer: Offer }) => (
    <div className="max-w-[280px] shadow-gray-500 border-1 rounded-sm card flex flex-col justify-center items-center p-3">
      <div className="shadow-sm shadow-gray-500 w-[90%] m-2 flex justify-around p-2">
        <p className="font-bold">{offer.refCoupon}</p>
        <button
          className="border-none bg-transparent hover:text-[#f95005]"
          onClick={() => copyToClipboard(offer.refCoupon)}
        >
          <IoCopyOutline size={"1.3rem"} />
        </button>
      </div>
      <div className="w-full flex justify-start items-center ml-3 mt-2">
        <div className="max-w-[70%]">
          <b className="text-[2rem] text-[#f95005] ml-3">
            &#8377; {offer.refOffer}
          </b>
          <p className="text-[0.8rem]">
            <b>Min Value:</b> &#8377; {offer.refMin}
          </p>
          <p className="max-w-[230px]">
            <b>
              {new Date(offer.refStartAt).toLocaleDateString("en-GB")} -{" "}
              {new Date(offer.refEndAt).toLocaleDateString("en-GB")}
            </b>
          </p>
        </div>
        <div className="w-[20%]">
          <img src={logo} className="w-[5rem] h-[4rem]" alt="Offer Logo" />
        </div>
      </div>
    </div>
  );

  const [auditData, setAuditData] = useState<any[]>([])
  const paymentAuditData = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/userPayment/invoiceAudit",
      {
        refStId: "",
      },
      {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json",
        },
      }
    ).then((res) => {
      let data = decrypt(
        res.data[1],
        res.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );
      console.log('data line ----- 226', data)

      setAuditData(data.data)

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

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

        console.log("data line ----- 225", data);
        setBasicUserDetails(data.UserDetails[0]);
        setOtherPackageDetails(data.otherPackage);
        setOffers(data.offers);

        if (data.token === false) {
          navigate("/expired");
          return;
        }

        localStorage.setItem("JWTtoken", "Bearer " + data.token);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    paymentAuditData()
  }, []);

  const [userdata, setuserdata] = useState({
    username: "",
    usernameid: "",
    profileimg: { contentType: "", content: "" },
  });

  const handlePayClick = () => {
    navigate("/user/payment/details");
  };

  const invoiceDownload = (rowData: any) => {
    return (
      <div><PrintPDF
        closePayment={rowData.refOrderId}
        refOrderId={rowData.refOrderId}
      />
        {/* <PiDownloadSimpleBold
          style={{ cursor: "pointer", color: "green", fontSize: "1.5rem" }}
          onClick={() => {

          }}
        /> */}
      </div>

    );
  };

  return (
    <div>
      <ToastContainer />
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5]">
            <div className="headerPrimary">
              <h3>Payment</h3>
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
          <div className="card m-1" style={{ overflow: "hidden" }}>
            <div className="lg:block hidden">
              <div className="headerPrimary fixed w-[95.5%]">
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
            </div>
            <div className="card lg:mt-[70px]">
              <TabView>
                <TabPanel header="Payment" key="tab1">
                  <div className="w-[100%] flex lg:flex-row flex-col justify-between">
                    <div className=" border-2  lg:w-[45%] border-gray-400 px-3 lg:py-0 py-3 rounded shadow-md flex flex-col justify-center">
                      <div className="flex flex-column justify-content-between">
                        <p className="m-0 mt-0">
                          {" "}
                          <span className="font-bold">Username :</span>{" "}
                          {basicUserDetails?.refStFName}
                        </p>
                        <p className="m-0 mt-3">
                          {" "}
                          <span className="font-bold">Current Package : </span>
                          {basicUserDetails?.refPackageName}
                        </p>

                      </div>
                      <div className="flex flex-column justify-content-between ">
                        <p className="m-0 mt-3">
                          <span className="font-bold"> Fee : </span>
                          {basicUserDetails?.refFees}
                          {" (INR) "} (
                          {basicUserDetails?.refFeesType === "0"
                            ? "Per Month"
                            : basicUserDetails?.refFeesType === "1"
                              ? "Per Day"
                              : `${basicUserDetails?.refClsDuration} Month ${basicUserDetails?.refClsCount} Class's`}
                          )
                        </p>
                        <p className="m-0 mt-3">
                          <span className="font-bold">Weekdays Timing : </span>
                          {basicUserDetails?.weekDaysTiming}
                        </p>
                      </div>
                      <div className="flex flex-column justify-content-between">
                        <p className="m-0 mt-3">
                          <span className="font-bold">Weekend Timing : </span>
                          {basicUserDetails?.weekEndTiming || "Not Applicable"}
                        </p>
                        <Button
                          label="Pay"
                          severity="success"
                          className="mt-3"
                          onClick={handlePayClick}
                        />
                        {/* onClick={() => setVisibleRight(true)} */}
                      </div>
                    </div>
                    <div className="mt-3 lg:w-[50%]">
                      <b className="text-[#f95005] m-1 p-2">Other Packages</b>
                      <div className="w-full overflow-x-auto border-2 border-gray-400 rounded shadow-md p-2">
                        <div className="flex space-x-3">
                          {otherPackageDetails.map((pkg, index) => (
                            <div key={index} className="p-3 border-3 border-gray-300 rounded-md bg-white shadow-sm min-w-[250px]">
                              <p className="text-lg font-bold card text-center shadow-sm shadow-gray-500 "><b className="text-[#f95005]">{pkg.refPackageName}</b></p>
                              <p className="text-sm text-gray-700"><b>Mode:</b> {pkg.refSessionMode}</p>
                              <p className="text-sm text-gray-700"><b>Batch:</b> {pkg.reftimemembersarray}</p>
                              <p className="text-sm text-gray-700">
                                <b>Price:</b>  ₹ {pkg.refFees} {pkg.refFeesType === "2" ? `(${pkg.refClsCount} Class in ${pkg.refClsDuration} Month Duration)` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-row flex-column my-3 gap-3">
                    {/* Handpicked Offers */}
                    {availableOffers.length > 0 ? <> <div className="lg:w-[50%] flex flex-col">
                      <b className="text-[#f95005]">
                        Handpicked Offers For You
                      </b>
                      <div className="flex gap-4 my-3 border-3 border-gray-500 rounded-lg p-3 max-w-[100%] overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
                        {availableOffers.length > 0 ? (
                          availableOffers.map((offer) => (
                            <OfferCard key={offer.refOfId} offer={offer} />
                          ))
                        ) : (
                          <p>No offers available</p>
                        )}
                      </div>
                    </div></> : <></>}


                    {/* Other Offers */}
                    {otherOffers.length > 0 ? <><div className="lg:w-[50%] flex flex-col">
                      <b className="text-[#f95005]">Other Offers</b>
                      <div className="flex gap-4 my-3 border-3 border-gray-500 rounded-lg p-3 max-w-[100%] overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
                        {otherOffers.length > 0 ? (
                          otherOffers.map((offer) => (
                            <OfferCard key={offer.refOfId} offer={offer} />
                          ))
                        ) : (
                          <p>No other offers</p>
                        )}
                      </div>
                    </div></> : <></>}

                  </div>
                </TabPanel>
                <TabPanel header="Audit" key="tab2">
                  {/* <DataTable
                    value={otherPackageDetails}
                    scrollable
                    showGridlines
                    stripedRows
                    scrollHeight="300px"
                    className="mt-2 border-2 border-gray-400 rounded shadown-md"
                  >
                    <Column
                      field="sno"
                      header="S.No"
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{ minWidth: "1rem", textAlign: "center" }}
                    />
                    <Column
                      field="refPackageName"
                      header="Package Name"
                      style={{ minWidth: "15rem" }}
                    />
                    <Column
                      field="refFees"
                      header="Price"
                      style={{ minWidth: "6rem" }}
                    />
                    <Column
                      field="refSessionMode"
                      header="Mode"
                      style={{ minWidth: "10rem" }}
                    />
                    <Column
                      field="reftimemembersarray"
                      header="Batch"
                      style={{ minWidth: "13rem" }}
                    />
                  </DataTable> */}
                  <DataTable
                    value={auditData}
                    className="mt-10"
                    scrollable
                    scrollHeight="400px"
                  >
                    <Column
                      field="refOrderId"
                      header="Order Id"
                      style={{ minWidth: "200px", width: "auto" }}
                    ></Column>



                    <Column
                      field="refTransId"
                      header="Transaction Id"
                      style={{ minWidth: "150px", width: "auto" }}
                    ></Column>



                    <Column
                      field="refPayDate"
                      header="Date"
                      style={{ minWidth: "150px", width: "auto" }}
                    ></Column>

                    <Column
                      field="refFeesType"
                      header="Payment Mode"
                      style={{ minWidth: "150px", width: "auto" }}
                    ></Column>



                    <Column
                      field="refFeesPaid"
                      header="Amount"
                      style={{ minWidth: "120px", width: "auto" }}
                    ></Column>

                    <Column header="Edit" body={invoiceDownload}></Column>

                  </DataTable>
                </TabPanel>
              </TabView>
            </div>
          </div>
        </>
      )}

      <Sidebar
        visible={visibleRight}
        position="right"
        className="lg:w-[60vw] w-[80vw]"
        onHide={() => setVisibleRight(false)}
      >
        <PriceSidebar refStId={""} />
      </Sidebar>
    </div>
  );
};

export default UserPayment;
