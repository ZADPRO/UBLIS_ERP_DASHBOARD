import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

import coverImage from "../../assets/Dashboard/banner.jpg";
import profileImage from "../../assets/Dashboard/logo3.png";
import { Mail, Phone } from "lucide-react";
import CryptoJS from "crypto-js";

import { Fieldset } from "primereact/fieldset";

import "./Dashboard.css";

type DecryptResult = any;

const Dashboard = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set mobile view if width <= 768px
    };

    handleResize(); // Check initial screen size
    window.addEventListener("resize", handleResize); // Add resize listener

    return () => {
      window.removeEventListener("resize", handleResize); // Clean up listener
    };
  }, []);


  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("JWTtoken");
  const refUtId = urlParams.get("refUtId");

  if (token && refUtId) {
    localStorage.setItem("JWTtoken", token);
    localStorage.setItem("refUtId", refUtId);

    console.log("sfhbsdhf");

    navigate("/");
  }

  const [pageLoading, setPageLoading] = useState({
    verifytoken: true,
    pageData: true,
  });

  const [userdata, setuserdata] = useState({
    username: "",
    usernameid: "",
    refUserName: "",
    profileimg: { contentType: "", content: "" },
    mobileNo: "",
    whatsappNo: "",
    email: ""
  });

  console.log("userdata", userdata);
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
      console.log(' -> Line Number ----------------------------------- 100',);
      console.log("data", data);
      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

        setuserdata({
          username:
            "" + data.data[0].refStFName + " " + data.data[0].refStLName + "",
          usernameid: data.data[0].refusertype,
          refUserName: data.data[0].refUserName,
          profileimg: data.profileFile,
          email: data.data[0].refCtEmail,
          whatsappNo: data.data[0].refCtWhatsapp,
          mobileNo: data.data[0].refCtMobile
        });

        setPageLoading({
          ...pageLoading,
          verifytoken: false,
        });

        console.log("Verify Token  Running --- ");
      }
    });
  }, []);


  const handleMobileNavigate = (path: string) => {
    const token = localStorage.getItem("JWTtoken");
    if (token) {
      const url = `${path}?token=${encodeURIComponent(token)}`;
      window.open(url, "_blank");
    } else {
      console.error("Token not found in localStorage");
    }
  };

  return (
    <>
      {!isMobile && (
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
      )}

      <div className="flex flex-col justify-center userContents m-3 items-center">
        <div className="userContents w-full">
          <div>
            <div className="contents w-full">
              <div className="userProfile">
                <div className="coverImage">
                  <img src={coverImage} alt="coverImage" />
                </div>
                <div className="coverContents">
                  <img src={profileImage}
                    style={{
                      borderTopLeftRadius: "50%",
                      borderTopRightRadius: "50%",
                    }} className="bg-[#ffffff] border rounded-xl-3xl rounded-se-2xl" alt="userProfile" />
                  <div className="userDetails">
                    <div className="">
                      <div className="userDetPrimary mt-2 flex items-center justify-between w-full m-0">
                        <p className="username">{userdata.username} </p>
                        <p className="username">Student</p>
                      </div>
                    </div>
                    <div className="flex lg:flex-row flex-col justify-between">
                      <p className="flex items-center gap-2">
                        <Mail />
                        {userdata.email}
                      </p>
                      <p className="flex items-center lg:mt-auto mt-0 gap-2">
                        {" "}
                        <Phone />
                        {userdata.mobileNo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="userTilesDashboard mt-4 mb-4 w-[100%]">
          <div className="flex flex-row justify-start w-[100%]">
            <Fieldset
            className="w-[30%] h-[120px]"
              legend="Intro Video"
              onClick={() => handleMobileNavigate("/introVideo")}
            >
              <p className="m-0">
                Complete The Introduction Video Before Start The Class
              </p>
            </Fieldset>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
