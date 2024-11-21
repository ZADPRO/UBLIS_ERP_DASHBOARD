import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

type DecryptResult = any;

const Dashboard = () => {
  console.log("dfhbdf");

  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("JWTtoken");
  const refUtId = urlParams.get("refUtId");

  if (token && refUtId) {
    // Save token and refUtId to localStorage
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
    profileimg: { contentType: "", content: "" },
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
    });
  }, []);

  return (
    <div className="flex justify-center items-center w-[100%] h-screen">
      <h1>Dashboard - Comming Soon</h1>
    </div>
  );
};

export default Dashboard;
