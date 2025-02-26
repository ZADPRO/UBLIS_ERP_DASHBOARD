import React, { useEffect, useState, useRef } from "react";
import Axios from "axios";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { BsCameraVideoOffFill } from "react-icons/bs";

interface introVideo {
    refVdId: number;
    refVdLangId: number;
    refVdLink: string;
    refVdLang: string;
}

const TrialVideo: React.FC = () => {
    const navigate = useNavigate();
    const [introData, setIntroData] = useState<introVideo[]>([]);
    const toast = useRef<any>(null);

    const decrypt = (encryptedData: string, iv: string, key: string): any => {
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

        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    };

    const fetchTrialVideoData = () => {
        Axios.get(import.meta.env.VITE_API_URL + "/settings/introVideo/getData", {
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
            if (data.token === false) {
                navigate("/expired");
            } else {
                localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
                setIntroData(data.data);
            }
        });
    };

    const uploadVideo = async (
        e: React.ChangeEvent<HTMLInputElement>,
        refVdId: number,
        videoLink: string
    ) => {
        e.preventDefault();

        const file = e.target.files?.[0];
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        // Show initial loading toast
        toast.current.show({
            summary: "Uploading your video...",
            detail: `0% completed.`,
            closable: false, // Prevent manual closing during upload
            life: 999999, // Keep toast visible until explicitly cleared
        });

        try {
            const response = await Axios.post(
                `${import.meta.env.VITE_API_URL}/trailVideo/uploadUrl`,
                {
                    fileType: file.type,
                    fileName: file.name,
                },
                {
                    headers: {
                        Authorization: localStorage.getItem("JWTtoken") || "",
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = decrypt(
                response.data[1],
                response.data[0],
                import.meta.env.VITE_ENCRYPTION_KEY
            );

            if (!data.token) {
                navigate("/expired");
                return;
            }
            localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

            const url = data.UrlResult;

            // Use XMLHttpRequest for tracking upload progress
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    const percentCompleted = Math.round((event.loaded * 100) / event.total);

                    // Update the same toast with the current percentage
                    toast.current.replace({
                        summary: "Uploading your video...",
                        detail: `${percentCompleted}% completed.`,
                        closable: false,
                        life: 999999, // Keep toast visible
                    });
                }
            });

            xhr.open("PUT", url);
            xhr.setRequestHeader("Content-Type", file.type);

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    await Axios.post(
                        import.meta.env.VITE_API_URL + "/trailVideo/UpdateUrl",
                        {
                            link: url.split("?")[0],
                            id: refVdId,
                            oldlink: videoLink,
                        },
                        {
                            headers: {
                                Authorization: localStorage.getItem("JWTtoken"),
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    // Replace the loading toast with a success message
                    toast.current.clear();
                    toast.current.show({
                        summary: "Upload Successful",
                        detail: "Your video has been uploaded successfully!",
                        severity: "success",
                        life: 3000, // Auto close after 3 seconds
                    });

                    fetchTrialVideoData();
                } else {
                    throw new Error("Failed to upload file.");
                }
            };

            xhr.onerror = () => {
                // Replace the loading toast with an error message
                toast.current.clear();
                toast.current.show({
                    summary: "Upload Failed",
                    detail: "Something went wrong during the upload. Please try again.",
                    severity: "error",
                    life: 3000,
                });
            };

            xhr.send(file);
        } catch (error) {
            console.error("Error during file upload:", error);
            toast.current.clear();
            toast.current.show({
                summary: "Upload Failed",
                detail: "Something went wrong during the upload. Please try again.",
                severity: "error",
                life: 3000,
            });
        }
    };




    useEffect(() => {
        fetchTrialVideoData();
    }, []);

    return (
        <div>
            <Toast ref={toast} />
            <h2>Intro Video</h2>
            <div className="flex flex-wrap justify-center gap-5 mt-10">
                {introData.map((video) => (
                    <div
                        key={video.refVdId}
                        className="w-[45%] flex flex-col bg-white py-4 justify-center rounded-lg"
                    >
                        <div className="w-[90%] mx-auto flex justify-center">
                            {video.refVdLink !== "null" ? (
                                <video
                                    src={video.refVdLink}
                                    controls
                                    width="100%"
                                    height="auto"
                                />
                            ) : (
                                <BsCameraVideoOffFill
                                    style={{
                                        cursor: "pointer",
                                        color: "red",
                                        fontSize: "4.5rem",
                                        border: "2px solid red",
                                        padding: "10px",
                                    }}
                                />
                            )}
                        </div>
                        <div className="w-full text-center mt-4">
                            <h4>Language: {video.refVdLang}</h4>
                            <button
                                className="w-[80%] py-[2%] bg-green-500 border-transparent rounded-lg text-[#ffffff] text-[15px]"
                                onClick={() => document.getElementById(`uploadVideo-${video.refVdId}`)!.click()}>
                               Change
                            </button>
                            <input
                                type="file"
                                accept="video/*"
                                id={`uploadVideo-${video.refVdId}`}
                                className="hidden "
                                onChange={(e) =>
                                    uploadVideo(e, video.refVdId, video.refVdLink)
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrialVideo;
