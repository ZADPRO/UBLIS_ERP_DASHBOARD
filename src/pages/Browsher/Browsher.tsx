import React, { useEffect, useState, useRef } from "react";
import Axios from "axios";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BsFillImageFill } from "react-icons/bs";
import { BiImageAdd } from "react-icons/bi";
import { Dropdown } from "primereact/dropdown";
import { TabPanel, TabView } from "primereact/tabview";
import { GrEdit } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import "react-toastify/dist/ReactToastify.css";
import { InputText } from "primereact/inputtext";
import { MdPlaylistAdd } from "react-icons/md";




interface BrosherData {
    refBroId: number;
    refBranchId: number;
    refBroLink: string;
    refBranchName: string;
    refBroTypeId: number;
    refBrowsherTypeName: string;
}
interface BrosherCatType {
    refBroTypeId: number;
    refBrowsherTypeName: number;
}

const Browsher: React.FC = () => {
    const navigate = useNavigate();
    const [browsher, setBrowsher] = useState<BrosherData[]>([]);
    const [browsherCatType, setBrowsherCatType] = useState<BrosherCatType[]>([]);
    const [branch, setBranch] = useState<number>();
    const [browsherTypeId, setBrowsherTypeId] = useState<number>();
    const [addBtn, setAddBtn] = useState(false)

    const [browserCatadd, setBrowserCatAdd] = useState(false);
    const [editBrowserCat, setBrowserCatEdit] = useState(false);
    const [browserCatUpdate, setBrowserCatUpdate] = useState(false);
    const [browserCategoryTypeName, setBrowserCateoryTypeName] = useState<string | undefined>("")
    const [id, setId] = useState<number | undefined>();


    const [branchOptions, setBranchOptions] = useState([]);
    const [broTypeOptions, setBroTypeOptions] = useState([]);
    const [broType, setBroType] = useState(false)


    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);

    const toasts = useRef<any>(null);


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

    const getBroTypeData = (branchId: number) => {
        Axios.post(import.meta.env.VITE_API_URL + "/settings/browsher/getBrowsherType",
            {
                branchId: branchId,  // Corrected: Removed extra curly braces
            },
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
            if (data.token === false) {
                navigate("/expired");
            } else {
                console.log(' -> Line Number ----------------------------------- 124',);
                console.log('data', data)
                localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
                const options = data.browsherType.map((browsherType: any) => ({
                    label: browsherType.refBrowsherTypeName,
                    value: browsherType.refBroTypeId,
                }));
                setBroTypeOptions(options);
                setBroType(true)

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
            toasts.current.show({
                summary: "No File Selected",
                detail: "Please select a file to upload.",
                severity: "warn",
                life: 3000,
            });
            return;
        }

        toasts.current.show({
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

                    toasts.current.replace({
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
                            refBroTypeId: browsherTypeId
                        },
                        {
                            headers: {
                                Authorization: localStorage.getItem("JWTtoken"),
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    toasts.current.clear();
                    toasts.current.show({
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
                toasts.current.clear();
                toasts.current.show({
                    summary: "Upload Failed",
                    detail: "Something went wrong during the upload. Please try again.",
                    severity: "error",
                    life: 3000,
                });
            };

            xhr.send(file);
        } catch (error) {
            console.error("Error during file upload:", error);
            toasts.current.clear();
            toasts.current.show({
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

    const getCategoryType = async () => {
        Axios.get(import.meta.env.VITE_API_URL + "/settings/browsher/getCategory", {
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
            console.log(' -> Line Number ----------------------------------- 289',);
            console.log('data', data)
            if (data.token === false) {
                navigate("/expired");
            } else {
                localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
                setBrowsherCatType(data.browserType);
            }
        });
    }

    useEffect(() => {
        fetchBrowsherData();
        getCategoryType();
    }, []);

    const imageBodyTemplate = (rowData: BrosherData) => (
        <Button
            className="p-button-text p-button-rounded text-[black] text-[2rem] border-none custom-button"
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

    const sessionEdit = (rowData: any) => {
        console.log("rowData", rowData);
        return (
            <div
                onClick={() => {
                    console.log("rowData.refTimeId", rowData.refBroTypeId);
                    setId(rowData.refBroTypeId);
                    setBrowserCatAdd(true);
                    setBrowserCatUpdate(true);
                    setBrowserCatEdit(false);
                    setBrowserCateoryTypeName(rowData.refBrowsherTypeName);
                }}
            >
                <GrEdit
                    style={{ cursor: "pointer", color: "green", fontSize: "1.5rem" }}
                />
            </div>
        );
    };

    const sessionDelete = (rowData: any) => {
        return (
            <MdDelete
                style={{ cursor: "pointer", color: "red", fontSize: "2rem" }}
                onClick={() => {
                    deleteHealth(rowData)
                }}
            />
        );
    };

    function deleteHealth(rowData: any) {
        Axios.post(
            import.meta.env.VITE_API_URL + "/settings/browsher/deleteCategory",
            {
                refCatId: rowData.refBroTypeId,
            },
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
            if (data.token == false) {
                navigate("/expired");
            } else {
                localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
                if (data.success == true) {
                    toast.error("The Browser Category Is Deleted Successfully", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });

                    getCategoryType();
                } else {
                    toast.warning("Something Went Wrong", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                }
            }
        });
    }

    const updateCategoryType = () => {
        Axios.post(
            import.meta.env.VITE_API_URL + "/settings/browsher/updateCategory",
            {
                refCatId: id,
                refCatageoryName: browserCategoryTypeName,
            },
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
            if (data.token == false) {
                navigate("/expired");
            } else {
                if (data.success == true) {
                    setBrowserCatAdd(false);
                    setBrowserCateoryTypeName("");
                    getCategoryType();
                    toast.success("Browser Type is Updated Successfully!", {
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
                } else {
                    toast.warning("can't Update the Browser Type", {
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
                }
            }
        });
    };

    const addCategoryType = () => {
        Axios.post(
            import.meta.env.VITE_API_URL + "/settings/browsher/addCategory",
            {
                refCatageoryName: browserCategoryTypeName,
            },
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
            if (data.token == false) {
                navigate("/expired");
            } else {
                if (data.success == true) {
                    setBrowserCatAdd(false);
                    setBrowserCateoryTypeName("");
                    getCategoryType();
                    toast.success("New Brochure Type is Added Successfully", {
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
                } else {
                    toast.warning("can't Add New Brochure Type", {
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
                }
            }
        });
    };
    return (
        <div className="bg-white">
            <Toast ref={toasts} />

            <ToastContainer />
            <div className="flex flex-row-reverse justify-between">
                <div className="pr-10">
                </div>
                <h2>Brochure Data Table</h2>
            </div>
            <TabView>
                <TabPanel header="Brochure">
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
                                <div className="flex justify-between gap-3 my-4">
                                    <Dropdown
                                        value={branch}
                                        onChange={(e: any) => {
                                            setBranch(e.value);
                                            getBroTypeData(e.value);
                                        }}
                                        options={branchOptions}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Select a Branch"
                                        className="w-[35%] h-[35px]"
                                        checkmark={true}
                                        highlightOnSelect={false}
                                        required
                                    />
                                    <Dropdown
                                        value={browsherTypeId}
                                        onChange={(e: any) => {
                                            setBrowsherTypeId(e.value);
                                        }}
                                        options={broTypeOptions}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Select Brochure Type"
                                        className="w-[35%] h-[35px]"
                                        checkmark={true}
                                        highlightOnSelect={false}
                                        disabled={!broType}
                                        required
                                    />

                                    <div className="w-[30%]">
                                        {/* File input (hidden) */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id={`newImageUpload`}
                                            className="hidden"
                                            required
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
                                            className="p-button-success w-[55%] mx-2"
                                            onClick={() => {
                                                if (!branch) {
                                                    // Show a validation message if no branch is selected
                                                    alert("Please select a branch before uploading an image.");
                                                    return;
                                                }
                                                if (!browsherTypeId) {
                                                    // Show a validation message if no branch is selected
                                                    alert("Please select a Brochure Type before uploading an image.");
                                                    return;
                                                }

                                                // Trigger the hidden file input click
                                                document.getElementById(`newImageUpload`)?.click();
                                            }}
                                        />

                                        {/* Close button */}
                                        <Button
                                            label="Close"
                                            className="p-button-danger w-[35%]"
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
                                field="refBrowsherTypeName"
                                header="Brochure Type"
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

                </TabPanel>
                <TabPanel header="Brochure Category Type">
                    <div className="flex w-[100%] flex-col bg justify-center align-items-center">

                        <div className="w-[80%]">
                            {browserCatadd ? (
                                <></>
                            ) : (
                                <div className="flex justify-end w-[90%]">
                                    <button
                                        className="bg-green-500 border-none rounded-lg p-2  "
                                        onClick={() => {
                                            setBrowserCatAdd(true);
                                            setBrowserCatEdit(false);
                                            setBrowserCatUpdate(false);
                                        }}
                                    >
                                        <MdPlaylistAdd className="text-3xl text-white" />
                                    </button>
                                </div>
                            )}
                            {browserCatadd ? (
                                <>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                        }}
                                    >
                                        <div className="flex justify-between mt-4">
                                            <div className="flex flex-col gap-2  w-[70%] ">
                                                {editBrowserCat ? (
                                                    <></>
                                                ) : (
                                                    <>
                                                        <label htmlFor="username">Brochure Type</label>
                                                        <InputText
                                                            required
                                                            onInput={(e: any) => {
                                                                setBrowserCateoryTypeName(e.target.value);
                                                            }}
                                                            value={browserCategoryTypeName}
                                                        />
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-3 mt-4">
                                                <Button
                                                    severity="info"
                                                    label="Close"
                                                    type="button"
                                                    onClick={() => {
                                                        setBrowserCatAdd(false);
                                                    }}
                                                />
                                                {browserCatUpdate ? (
                                                    <Button
                                                        severity="warning"
                                                        label="Update"
                                                        onClick={updateCategoryType}
                                                        type="submit"
                                                    />
                                                ) : (
                                                    <Button
                                                        severity="success"
                                                        label="Save"
                                                        onClick={addCategoryType}
                                                        type="submit"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </>
                            ) : null}
                        </div>
                        <div className="w-[100%]  flex justify-center">
                            <DataTable value={browsherCatType} className="mt-0 p-5  w-[80%]">
                                <Column
                                    body={(_data, options) => options.rowIndex + 1}
                                    header="S No"
                                ></Column>
                                <Column field="refBrowsherTypeName" header="Browsher Type"></Column>

                                <Column header="Edit" body={sessionEdit}></Column>
                                <Column header="Delete" body={sessionDelete}></Column>
                            </DataTable>
                        </div>
                    </div>
                </TabPanel>
            </TabView>



        </div>
    );
};

export default Browsher;
