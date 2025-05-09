import React, { useEffect, useState } from "react";
import Axios from "axios";
import { Skeleton } from "primereact/skeleton";
import CryptoJS from "crypto-js";
// import { FaMoneyCheckDollar } from "react-icons/fa6";
import { BiSolidOffer } from "react-icons/bi";
import { Sidebar } from "primereact/sidebar";
import FeesStructure from "../../pages/FeesStructure/FeesStructure";
// import { SiGoogleclassroom } from "react-icons/si";
import Offers from "../../pages/Offers/Offers";
// import session from "../../pages/Session/Session"
import Session from "../../pages/Session/Session";
// import { FaUserClock } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Healthissues from "../../pages/Healthissues/Healthissues";
import { FaClipboardList } from "react-icons/fa6";
import { SiGoogleclassroom } from "react-icons/si";
import Package from "../../pages/Package/Package";
import { PiVideoBold } from "react-icons/pi";
import TrialVideo from "../../pages/TrialVideo/trialvideo";
import { GrDocumentTime } from "react-icons/gr";
import Browsher from "../../pages/Browsher/Browsher";
type DecryptResult = any;

const Settings: React.FC = () => {
  const navigate = useNavigate();

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

        console.log("Verify Token  Running --- ");
      }
    });
  }, []);

  const [feesStructure, setFeesStructure] = useState(false);

  const [offers, setOffers] = useState(false);

  const [session, setSession] = useState(false);
  const [packageCard, setPackageCard] = useState(false);

  const [healthissue, setHealthissue] = useState(false);
  const [trialVideo, setTrialVideo] = useState(false);
  const [browsher, setBrowsher] = useState(false);

  return (
    <>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5]">
            <div className="headerPrimary">
              <h3>SETTINGS</h3>
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
        <div className="usersTable bg-[#f6f5f5]">
          <div className="headerPrimary">
            <h3>SETTINGS</h3>
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
          <div className="p-10 bg-[#f6f5f5] h-[85vh]">
            <div className="flex justify-start gap-5 items-start">
              <div
                className="w-[250px] h-[100px] rounded-[5px] flex flex-col justify-center bg-[#fff] shadow-lg p-3 cursor-pointer"
                onClick={() => {
                  setPackageCard(true);
                }}
              >
                <div className="text-[20px] font-bold font-serif">Package</div>
                <div className="text-[#f95005] text-[40px] text-end">
                  <SiGoogleclassroom />
                </div>
              </div>

              <div
                onClick={() => {
                  setOffers(true);
                }}
                className="w-[250px] h-[100px] rounded-[5px] flex flex-col justify-center bg-[#fff] shadow-lg p-3 cursor-pointer"
              >
                <div className="text-[20px] font-bold font-serif">Offers</div>
                <div className="text-[#f95005] text-[40px] text-end">
                  <BiSolidOffer />
                </div>
              </div>


              <div
                className="w-[250px] h-[100px] rounded-[5px] flex flex-col justify-center bg-[#fff] shadow-lg p-3 cursor-pointer"
                onClick={() => {
                  setHealthissue(true);
                }}
              >
                <div className="text-[20px] font-bold font-serif">
                  Health Issue
                </div>
                <div className="text-[#f95005] text-[40px] text-end">
                  <FaClipboardList />
                </div>
              </div>
              <div
                className="w-[250px] h-[100px] rounded-[5px] flex flex-col justify-center bg-[#fff] shadow-lg p-3 cursor-pointer"
                onClick={() => {
                  setTrialVideo(true);
                }}
              >
                <div className="text-[20px] font-bold font-serif">
                  Intro Video
                </div>
                <div className="text-[#f95005] text-[40px] text-end">
                  <PiVideoBold />
                </div>
              </div>
              <div
                className="w-[250px] h-[100px] rounded-[5px] flex flex-col justify-center bg-[#fff] shadow-lg p-3 cursor-pointer"
                onClick={() => {
                  setBrowsher(true);
                }}
              >
                <div className="text-[20px] font-bold font-serif">
                  Brochure
                </div>
                <div className="text-[#f95005] text-[40px] text-end">
                  <GrDocumentTime />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        style={{ width: "80%" }}
        visible={packageCard}
        position="right"
        onHide={() => setPackageCard(false)}
      >
        <Package />
      </Sidebar>

      <Sidebar
        style={{ width: "70%" }}
        visible={feesStructure}
        position="right"
        onHide={() => setFeesStructure(false)}
      >
        <h2>Fee Structure</h2>
        <FeesStructure />
      </Sidebar>

      <Sidebar
        style={{ width: "70%" }}
        visible={offers}
        position="right"
        onHide={() => setOffers(false)}
      >
        <h2>Offers</h2>
        <Offers />
      </Sidebar>

      <Sidebar
        style={{ width: "70%" }}
        visible={session}
        position="right"
        onHide={() => setSession(false)}
      >
        <Session />
      </Sidebar>

      <Sidebar
        style={{ width: "50%" }}
        visible={healthissue}
        position="right"
        onHide={() => setHealthissue(false)}
      >
        <Healthissues />
      </Sidebar>

      <Sidebar
        style={{ width: "70%", background: "#f6f5f5" }}
        visible={trialVideo}
        position="right"
        onHide={() => setTrialVideo(false)}
      >
        <TrialVideo />
      </Sidebar>

      <Sidebar
        style={{ width: "70%", background: "white" }}
        visible={browsher}
        position="right"
        onHide={() => setBrowsher(false)}
      >
        <Browsher />
      </Sidebar>
    </>
  );
};

export default Settings;
