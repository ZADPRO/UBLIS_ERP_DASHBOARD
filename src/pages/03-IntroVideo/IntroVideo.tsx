import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";


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
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [videoData, setVideoData] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoOption | null>(null);



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
  const [_endTime, setEndTime] = useState<string | null>(null);
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

  // const handlePlayPause = () => {
  //   if (videoRef.current) {
  //     if (isPaused) {
  //       videoRef.current.play();
  //     } else {
  //       videoRef.current.pause();
  //     }
  //     setIsPaused(!isPaused);
  //   }
  // };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // alert("Right-click is disabled on the video.");
  };

  const videoContainerRef = useRef<HTMLDivElement>(null);

  // const toggleFullscreen = () => {
  //   if (videoContainerRef.current) {
  //     if (!document.fullscreenElement) {
  //       videoContainerRef.current.requestFullscreen();
  //     } else {
  //       if (document.exitFullscreen) {
  //         document.exitFullscreen();
  //       }
  //     }
  //   }
  // };

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
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
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

  const videoSrc = selectedVideo ? selectedVideo.refVdLink : null;

  useEffect(() => {
    if (!Data?.refEndTime) {
      return; // Exit early if refEndTime is undefined
    }

    // Parse the custom date format (DD/MM/YYYY, hh:mm:ss A)
    const parseCustomDate = (dateString: string): number => {
      const [datePart, timePart] = dateString.split(", ");
      const [day, month, year] = datePart.split("/").map(Number);
      const [time, meridian] = timePart.split(" ");
      const [hours, minutes, seconds] = time.split(":").map(Number);

      // Convert hours based on AM/PM
      const parsedHours =
        meridian === "PM" && hours !== 12
          ? hours + 12
          : meridian === "AM" && hours === 12
            ? 0
            : hours;

      // Create the date object
      return new Date(year, month - 1, day, parsedHours, minutes, seconds).getTime();
    };

    const endTime = parseCustomDate(Data.refEndTime); // Convert refEndTime to a timestamp
    const currentTime = Date.now(); // Get the current system timestamp
    const initialTimeLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000)); // Difference in seconds

    setTimeLeft(initialTimeLeft); // Set the initial time left

    // Start the interval to update the time left
    let timer: NodeJS.Timeout | undefined;
    if (initialTimeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer); // Clear the interval when the timer reaches 0
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [Data?.refEndTime]);




  // Format timeLeft into HH:mm:ss format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="card">
        <div className="flex flex-column md:flex-row justify-evenly lg:h-[90vh]">
          <div className="w-full md:w-4 flex flex-column gap-3 py-5 px-3 align-items-center justify-center">
            <div className="flex md:w-[60%] w-[100%] justify-center">
              <div className="flex flex-col gap-2 text-[1.1rem] text-[#f95005]"><label>Select Language</label>
                <Dropdown
                  value={selectedVideo}
                  options={Data?.video}
                  optionLabel="refVdLang"
                  placeholder="Select a Language"
                  className="w-[80%] md:w-20rem"
                  onChange={(e) => {
                    setSelectedVideo(e.value)

                  }}
                /></div>


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

                  <div><video
                    src={videoSrc || undefined}
                    width="100%"
                    height="auto"
                    ref={videoRef}
                    className="jw-video jw-reset w-full"
                    title="Intro Video"
                    onClick={handleClick}
                    onContextMenu={handleRightClick}
                    style={{ cursor: "pointer" }}
                    controls
                    autoPlay={false}
                    controlsList="nodownload" // Disable download option
                  />
                    {/* <video

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
                  ></video> */}
                  </div>




                )}
                {/* <div className="custom-controls flex justify-center gap-3 py-4">
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
                </div> */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroVideo;
