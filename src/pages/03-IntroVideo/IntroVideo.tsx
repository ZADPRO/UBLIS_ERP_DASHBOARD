import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

import Swal from "sweetalert2"; // Import SweetAlert

const IntroVideo: React.FC = () => {
  interface video {
    refVdId: number;
    refVdLangId: number;
    refVdLink: string;
    refVdLang: string;
  }
  interface userData {
    refCtEmail: string;
    refCtWhatsapp: string;
    refSCustId: string;
    refStFName: string;
    refStLName: string;
    refStId: number;
    refStartTime: string;
    refEndTime: string;
    status: boolean;
    video?: video[];
  }

  interface VideoOption {
    refVdLang: string; // Language name
    refVdLink: string; // Video link
    refVdId: any;
    refVdLangId: string;
  }


  const [Data, setData] = useState<userData>();
  const [timeLeft, setTimeLeft] = useState(14400 * 60);
  const [videoData, setVideoData] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoOption | null>(null);

  const formatTime = (time: any) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes} mins ${seconds} sec`;
  };

  const navigate = useNavigate();

  type DecryptResult = any;

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

  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClick = () => {
    if (startTime) {
      // Swal.fire({
      //   icon: "info",
      //   title: "Video Already Started",
      //   text: `You started the video at: ${startTime}. It will be valid until: ${endTime}.`,
      // });
      if (videoRef.current) {
        if (isPaused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
        setIsPaused(!isPaused);
      }
    } else {
      const currentTime = new Date();
      setStartTime(currentTime.toLocaleString());

      const endDate = new Date(currentTime);
      endDate.setHours(currentTime.getHours() + 2);
      setEndTime(endDate.toLocaleString());

      // Swal.fire({
      //   icon: "success",
      //   title: "Video Started",
      //   html: `Start Time: <b>${currentTime.toLocaleString()}</b><br>End Time: <b>${endDate.toLocaleString()}</b>`,
      // });

      setIsPaused(false);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  };
  

  useEffect(() => {
    let timer: any;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [timeLeft]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // alert("Right-click is disabled on the video.");
  };

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (videoContainerRef.current) {
      if (!document.fullscreenElement) {
        videoContainerRef.current.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token: any = urlParams.get("token");
    localStorage.setItem("JWTtoken", token);

    axios
      .get(import.meta.env.VITE_API_URL + "/trailVideo/linkGeneration", {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        const data = decrypt(
          res.data[1],
          res.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );
        console.log("data", data);
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
          console.log('data.data', data.data.video)
          setData(data.data);

          setSelectedVideo(data.data.video[0])

          setVideoData(data.data.video);
        }
      });
      

    const handleKeydown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J")
      ) {
        e.preventDefault();
        // alert("Developer tools are disabled.");
      }

      // Detect Print Screen key (Windows)
      if (e.key === "PrintScreen") {
        e.preventDefault();
        // alert("Screenshots are not allowed.");
      }

      // Detect Ctrl + Print Screen key (Windows)
      if (e.ctrlKey && e.key === "PrintScreen") {
        e.preventDefault();
        // alert("Screenshots are not allowed.");
      }

      // Detect Cmd + Shift + 4 key combination (Mac)
      if (e.metaKey && e.shiftKey && e.key === "4") {
        e.preventDefault();
        // alert("Screenshots are not allowed.");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // alert("Right-click is disabled.");
    };

    window.addEventListener("keydown", handleKeydown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  console.log('videoData', videoData)
  const videoSrc = selectedVideo ? selectedVideo.refVdLink : null;

  return (
    <div>
      <div className="card">
        <div className="flex flex-column md:flex-row justify-evenly lg:h-[90vh]">
          <div className="w-full md:w-4 flex flex-column gap-3 py-5 px-3 align-items-center justify-center">
            <div className="flex md:w-[60%] w-[100%] justify-center">
              <Dropdown
                value={selectedVideo}
                options={Data?.video}
                optionLabel="refVdLang"
                placeholder="Select a Language"
                className="w-[80%] md:w-20rem"
                onChange={(e) => {
                  console.log('line ------- 248', e.value)
                  setSelectedVideo(e.value)

                }}
              />

            </div>
            <div className="userDetails">
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  fontWeight: "bold",
                  color: "#f95005",
                }}
              >
                Ublis Yoga Introduction Tutorial
              </h2>
              <table className="detailsTable">
                <tbody>
                  <tr>
                    <td style={{ fontSize: "18px" }}>
                      <b>User Name</b>
                    </td>
                    <td style={{ fontSize: "18px" }}>
                      : {Data?.refStFName} {Data?.refStLName}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "18px" }}>
                      <b>Customer ID</b>
                    </td>
                    <td style={{ fontSize: "18px" }}>: {Data?.refSCustId}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "18px" }}>
                      <b>Email</b>
                    </td>
                    <td style={{ fontSize: "18px" }}>: {Data?.refCtEmail}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "18px" }}>
                      <b>Mobile </b>
                    </td>
                    <td style={{ fontSize: "18px" }}>
                      : {Data?.refCtWhatsapp}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "18px" }}>
                      <b>Start Time</b>
                    </td>
                    <td style={{ fontSize: "18px" }}>: {Data?.refStartTime}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "18px" }}>
                      <b>End Time</b>
                    </td>
                    <td style={{ fontSize: "18px" }}>: {Data?.refEndTime}</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-center mt-[1%] py-[2px]">
                <p
                  className="flex items-center justify-center text-[20px] "
                  style={{
                    border: "2px solid #f95005",
                    padding: "10px",
                    borderRadius: "10px",
                    color: "#f95005",
                    fontWeight: "bold",
                  }}
                >
                  {!Data?.status ? (
                    <>00 mins 00 sec left</>
                  ) : (
                    <> {formatTime(timeLeft)} left </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div
            ref={videoContainerRef}
            className="w-full md:w-6 flex flex-column gap-1 py-5 px-3 align-items-center justify-center"
          >
            {!Data?.status ? (
              <>
                <div className="w-[100%] h-[100%]  flex justify-center align-items-center text-[#f95005] text-[1.5rem]">
                  <h3>Intro Video Watching Time is Completed</h3>
                </div>
              </>
            ) : (
              <>
                {videoData && (

                  <video
                    ref={videoRef}
                    className="jw-video jw-reset w-full"
                    webkit-playsinline=""
                    title="Intro Video"
                    onClick={handleClick}
                    src={videoSrc || undefined}
                    onContextMenu={handleRightClick}
                    style={{ cursor: "pointer" }}
                    controls={false}
                    autoPlay={false}
                  // paused={isPaused}
                  ></video>
                )}
                <div className="custom-controls flex justify-center gap-3 py-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-button p-button-primary"
                  >
                    {isPaused ? "Play" : "Pause"}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-button p-button-secondary"
                  >
                    Fullscreen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroVideo;
