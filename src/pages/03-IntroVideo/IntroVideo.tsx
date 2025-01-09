import React, { useState, useRef, useEffect } from "react";

import video from "../../assets/video/REC.mp4";

const IntroVideo: React.FC = () => {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClick = () => {
    if (startTime) {
      //   alert(
      //     `You already started the video at: ${startTime}. It will be valid until: ${endTime}`
      //   );
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

      alert(
        `Start Time: ${currentTime.toLocaleString()}.\nEnd Time: ${endDate.toLocaleString()}`
      );

      setIsPaused(false);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  };

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
    alert("Right-click is disabled on the video.");
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
    const handleKeydown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J")
      ) {
        e.preventDefault();
        alert("Developer tools are disabled.");
      }
    };

    // Disable right-click on the entire page
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert("Right-click is disabled.");
    };

    window.addEventListener("keydown", handleKeydown);

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <div>
      <div className="card">
        <div className="flex flex-column md:flex-row justify-evenly lg:h-[90vh]">
          <div className="w-full md:w-4 flex flex-column gap-3 py-5 px-3">
            <div className="userDetails">
              <p>User Name</p>
              <p>Email</p>
              <p>Course Name</p>
              <p>Start Time: {startTime || "Not started"}</p>
              <p>End Time: {endTime || "Not calculated"}</p>
              <p>
                Description: Lorem ipsum dolor sit amet consectetur adipisicing
                elit. Praesentium magni esse ea, reprehenderit sunt quasi. Ipsam
                voluptate veniam facere saepe corrupti repellendus excepturi
                deleniti, dolores sequi, maiores a, ab animi!
              </p>
            </div>
          </div>

          <div
            ref={videoContainerRef}
            className="w-full md:w-7 flex flex-col align-items-center justify-content-center py-5"
          >
            <video
              ref={videoRef}
              className="jw-video jw-reset w-full"
              webkit-playsinline=""
              title="Intro Video"
              src={video}
              onClick={handleClick}
              onContextMenu={handleRightClick}
              style={{ cursor: "pointer" }}
              controls={false}
              autoPlay={false}
              paused={isPaused}
            ></video>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroVideo;
