import React, { useEffect, useState, useRef } from "react";
import Axios from "axios";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BsFillImageFill } from "react-icons/bs";
import { BiImageAdd } from "react-icons/bi";
import { Dropdown } from "primereact/dropdown";

interface BrosherData {
    refBroId: number;
    refBranchId: number;
    refBroLink: string;
    refBranchName: string;
}

const Browsher: React.FC = () => {
    const navigate = useNavigate();
    const [browsher, setBrowsher] = useState<BrosherData[]>([]);
    const [branch, setBranch] = useState<number>();
    const [addBtn, setAddBtn] = useState(false)

    const [branchOptions, setBranchOptions] = useState([]);


    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
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

    const fetchBrowsherData = () => {
        Axios.get(import.meta.env.VITE_API_URL + "/settings/browsher/getData", {
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
                setBrowsher(data.data);
            }
        });
    };

    const addImage = () => {
        setAddBtn(true)
        Axios.get(import.meta.env.VITE_API_URL + "/settings/browsher/getBranch", {
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
                const options = data.branch.map((branch: any) => ({
                    label: branch.refBranchName,
                    value: branch.refbranchId,
                }));
                setBranchOptions(options);
            }
        });
    };

    const uploadImage = async (
        e: React.ChangeEvent<HTMLInputElement>,
        refBroId: any,
        videoLink: string,
        branchId: number
    ) => {
        e.preventDefault();

        const file = e.target.files?.[0];
        if (!file) {
            toast.current.show({
                summary: "No File Selected",
                detail: "Please select a file to upload.",
                severity: "warn",
                life: 3000,
            });
            return;
        }

        toast.current.show({
            summary: "Uploading...",
            detail: "Your file is being uploaded.",
            closable: false,
            life: 999999,
        });

        try {
            const response = await Axios.post(
                `${import.meta.env.VITE_API_URL}/settings/browsher/generateUploadLink`,
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

            const xhr = new XMLHttpRequest();
            xhr.open("PUT", url);
            xhr.setRequestHeader("Content-Type", file.type);

            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    const percentCompleted = Math.round(
                        (event.loaded * 100) / event.total
                    );

                    toast.current.replace({
                        summary: "Uploading...",
                        detail: `${percentCompleted}% completed.`,
                        closable: false,
                        life: 999999,
                    });
                }
            });

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    await Axios.post(
                        import.meta.env.VITE_API_URL + "/settings/browsher/UploadLink",
                        {
                            refBroLink: url.split("?")[0],
                            refBroId: refBroId,
                            oldlink: videoLink,
                            refBranchId: branchId,
                        },
                        {
                            headers: {
                                Authorization: localStorage.getItem("JWTtoken"),
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    toast.current.clear();
                    toast.current.show({
                        summary: "Upload Successful",
                        detail: "Your video has been uploaded successfully!",
                        severity: "success",
                        life: 3000,
                    });

                    fetchBrowsherData();
                    setBranch(undefined);
                    setAddBtn(false);
                } else {
                    throw new Error("Failed to upload file.");
                }
            };

            xhr.onerror = () => {
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

    const handleImageView = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setIsDialogVisible(true);
    };

    useEffect(() => {
        fetchBrowsherData();
    }, []);

    const imageBodyTemplate = (rowData: BrosherData) => (
        <Button
            className="p-button-text p-button-rounded text-[black] text-[2rem]"
            onClick={() => handleImageView(rowData.refBroLink)}
        >
            <BsFillImageFill />
        </Button>
    );

    const uploadBodyTemplate = (rowData: BrosherData) => (
        <>
            <input
                type="file"
                accept="image/*"
                id={`uploadImage-${rowData.refBroId}`}
                className="hidden"
                onChange={(e) =>
                    uploadImage(
                        e,
                        rowData.refBroId,
                        rowData.refBroLink,
                        rowData.refBranchId
                    )
                }
            />
            <Button
                label="Upload"
                className="p-button-success"
                onClick={() =>
                    document
                        .getElementById(`uploadImage-${rowData.refBroId}`)
                        ?.click()
                }
            />
        </>
    );

    return (
        <div className="">
            <Toast ref={toast} />

            <h2>Browsher Data Table</h2>
            <div className="flex justify-end mr-10 my-4">
                <Button
                    className="p-button-success text-[1.5rem]"
                    onClick={() => addImage()}
                >
                    <BiImageAdd />
                </Button>
            </div>
            {!addBtn ? <></> : <>
                <div className="flex justify-center align-items-center">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                        className="w-[80%]"
                    >
                        <div className="flex justify-between my-4">
                            {/* Dropdown for selecting a branch */}
                            <Dropdown
                                value={branch}
                                onChange={(e: any) => {
                                    setBranch(e.value);
                                }}
                                options={branchOptions}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Select a Branch"
                                className="w-[45%] h-[35px]"
                                checkmark={true}
                                highlightOnSelect={false}
                            />

                            <div className="w-[50%]">
                                {/* File input (hidden) */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    id={`newImageUpload`}
                                    className="hidden"
                                    onChange={(e) =>
                                        uploadImage(
                                            e,
                                            "",
                                            "",
                                            branch || 1 // Default branch fallback
                                        )
                                    }
                                />

                                {/* Button to select the image */}
                                <Button
                                    label="Select Image"
                                    className="p-button-success w-[60%] mx-2"
                                    onClick={() => {
                                        if (!branch) {
                                            // Show a validation message if no branch is selected
                                            alert("Please select a branch before uploading an image.");
                                            return;
                                        }

                                        // Trigger the hidden file input click
                                        document.getElementById(`newImageUpload`)?.click();
                                    }}
                                />

                                {/* Close button */}
                                <Button
                                    label="Close"
                                    className="p-button-danger w-[30%]"
                                    onClick={() => {
                                        setBranch(undefined);
                                        setAddBtn(false);
                                    }}
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </>}

            <div className="flex justify-center">
                <DataTable value={browsher} responsiveLayout="scroll" className="w-[80%]">
                    <Column
                        header="View Image"
                        body={imageBodyTemplate}
                        style={{ textAlign: "start", width: "20%" }}
                    />
                    <Column
                        field="refBranchName"
                        header="Branch"
                        style={{ textAlign: "start", width: "40%" }}
                    />
                    <Column
                        header="Upload"
                        body={uploadBodyTemplate}
                        style={{ textAlign: "start", width: "40%" }}
                    />
                </DataTable></div>



            <Dialog
                visible={isDialogVisible}
                onHide={() => setIsDialogVisible(false)}
                header="Image Preview"
                style={{ width: "50vw" }}
            >
                {selectedImage && (
                    <img
                        src={selectedImage}
                        alt="No image Found Or Error in Showing the Image"
                        style={{ width: "100%", height: "auto" }}
                    />
                )}
            </Dialog>
        </div>
    );
};

export default Browsher;
