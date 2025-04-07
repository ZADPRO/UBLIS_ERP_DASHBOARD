import Axios from "axios";
import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { FaRegCopy } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GrEdit } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import { MdOutlineAddchart } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { MultiSelect } from "primereact/multiselect";


type DecryptResult = any;

interface WorkSpaceData {
  refOfferId: any;
  description: any;
  coupon: any;
  minimumval: any;
  offers: any;
  startingDate: any;
  endingDate: any;
  packageId: [];
  batchId: []
}

const Offers: React.FC = () => {
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
  const navigate = useNavigate();
  const [branch, setBranch] = useState();
  const [branchOptions, setBranchOptions] = useState([]);

  const [branch1, setBranch1] = useState();
  const [branchOptions1, setBranchOptions1] = useState([]);
  const [packageOption, setPackageOption] = useState([]);
  const [batchOption, setBatchOption] = useState([]);

  const [tableData, setTableData] = useState();

  const [verifycoupon, setVerifyCoupon] = useState(false);

  const fetchData = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/director/offerStructure",
      {
        refOfferId: branch,
        refBranchId: branch1,
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
      }

      console.log("Offers Data -----------", data);

      const options = data.offerName.map((branch: any) => ({
        label: branch.refOfferName,
        value: branch.refOfferId,
      }));

      setBranchOptions(options);

      setBranch(options[0].value);

      const branchOptions = data.BranchList.map((branch: any) => ({
        label: branch.refBranchName,
        value: branch.refbranchId,
      }));

      setBranchOptions1(branchOptions);

      setBranch1(branchOptions[0].value);

      setTableData(data.offersStructure);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const GetOptions = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/director/offerOptions",
      {
        branchId: branch1,
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
      }

      console.log("Offers Data ----------- 141", data);

      const options = data.batchOption.map((data: any) => ({
        label: data.refTimeMembers,
        value: data.refTimeMembersID,
      }));

      setBatchOption(options);

      const packageOptions = data.packageOption.map((data: any) => ({
        value: data.refPaId,
        label: data.refPackageName,
      }));

      setPackageOption(packageOptions);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const branchChange = (e: any) => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/director/offerStructure",
      {
        refOfferId: e,
        refBranchId: branch1,
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
      }
      console.log(data);

      setTableData(data.offersStructure);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const branchChange1 = (e: any) => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/director/offerStructure",
      {
        refBranchId: e,
        refOfferId: branch,
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
      }

      console.log(data);

      setTableData(data.offersStructure);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };
  const convertToDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
  };
  const EditBtn = (rowData: any) => {

    return (
      <GrEdit
        style={{ cursor: "pointer", color: "green", fontSize: "1.5rem" }}
        onClick={() => {
          GetOptions()
          setWorkSpace(true);
          setUpdateStructure(true);
          console.log('rowData', rowData)
          setWorkSpaceData({
            refOfferId: rowData.refOfId,
            description: rowData.refContent,
            coupon: rowData.refCoupon,
            minimumval: rowData.refMin,
            offers: rowData.refOffer,
            startingDate: rowData.refStartAt ? convertToDate(rowData.refStartAt) : null,
            endingDate: rowData.refEndAt ? convertToDate(rowData.refEndAt) : null,
            packageId: rowData.refPackage,
            batchId: rowData.refBatch
          });

          console.log(' -> Line Number ----------------------------------- 251',);
        }}
      />
    );
  };

  const DeleteBtn = (rowData: any) => {
    return (
      <MdDelete
        style={{ cursor: "pointer", color: "red", fontSize: "1.8rem" }}
        onClick={() => {
          deleteFees(rowData.refOfId);
        }}
      />
    );
  };

  const deleteFees = (e: any) => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/director/deleteOfferStructure",
      {
        refOfId: e,
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
      }

      branchChange(branch);
      toast.error("Deleted Successfully", {
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

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
    });
  };

  const [workSpace, setWorkSpace] = useState(false);

  const [workSpaceData, setWorkSpaceData] = useState<WorkSpaceData>({
    refOfferId: null,
    description: "",
    coupon: "",
    minimumval: null,
    offers: null,
    startingDate: "",
    endingDate: "",
    packageId: [],
    batchId: [],
  });

  function formatDateToYYYYMMDD(date: any) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const [updateStructure, setUpdateStructure] = useState(false);

  const handleFeesSubmit = (e: any) => {
    e.preventDefault();

    if (updateStructure) {
      Axios.post(
        import.meta.env.VITE_API_URL + "/director/editOfferStructure",
        {
          refOfId: workSpaceData.refOfferId,
          refMin: workSpaceData.minimumval,
          refOffer: workSpaceData.offers,
          refContent: workSpaceData.description,
          refStartAt: formatDateToYYYYMMDD(workSpaceData.startingDate),
          refEndAt: formatDateToYYYYMMDD(workSpaceData.endingDate),
          refPackage: workSpaceData.packageId,
          refBatch: workSpaceData.batchId
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
        }

        console.log("Edited Data ----------", data);
        toast.success("Updated Successfully", {
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

        if (data.success) {
          setWorkSpaceData({
            refOfferId: null,
            description: "",
            coupon: "",
            minimumval: null,
            offers: null,
            startingDate: "",
            endingDate: "",
            packageId: [],
            batchId: []
          });

          setUpdateStructure(false);

          setWorkSpace(false);

          branchChange(branch);
        } else {
          setUpdateStructure(true);
        }

        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
      });
    } else {
      Axios.post(
        import.meta.env.VITE_API_URL + "/director/addNewOffersStructure",
        {
          refOfferId: branch,
          refMin: workSpaceData.minimumval,
          refOffer: workSpaceData.offers,
          refContent: workSpaceData.description,
          refStartAt: formatDateToYYYYMMDD(workSpaceData.startingDate),
          refEndAt: formatDateToYYYYMMDD(workSpaceData.endingDate),
          refCouponCode: workSpaceData.coupon,
          refBranchId: branch1,
          refPackage: workSpaceData.packageId,
          refBatch: workSpaceData.batchId

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
        }

        console.log(data);

        if (data.success) {
          setWorkSpaceData({
            refOfferId: null,
            description: "",
            coupon: "",
            minimumval: null,
            offers: null,
            startingDate: "",
            endingDate: "",
            packageId: [],
            batchId: []
          });
          toast.success("New Fees Added Successfully", {
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

          setWorkSpace(false);

          branchChange(branch);
        } else {
          //   setWorkSpaceData({
          //     ...workSpaceData,
          //     refFeId: data.data[0].refFeId,
          //   });
          setUpdateStructure(true);
        }

        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
      });
    }
  };

  const Status = (rowData: any) => {
    return (
      <>
        {rowData.status === "live" ? (
          <div className="text-green-500 font-bold">Live</div>
        ) : rowData.status === "expire" ? (
          <div className="text-red-600 font-bold">Expired</div>
        ) : (
          <div className="text-yellow-600 font-bold">Yet to Start</div>
        )}
      </>
    );
  };

  const couponBody = (rowData: any) => {
    return (
      <div
        style={{
          // border: "1px dotted green",
          // padding: "5px",
          // borderRadius: "5px",
          cursor: "pointer",
          // fontWeight: "700",
          // color: "green",
        }}
        onClick={() => {
          navigator.clipboard
            .writeText(rowData.refCoupon)
            .then(() => {
              alert(`Copied: ${rowData.refCoupon}`);
            })
            .catch((err) => {
              console.error("Failed to copy text:", err);
            });
        }}
      >
        {rowData.refCoupon}
      </div>
    );
  };

  return (
    <>
      <ToastContainer />
      <div className="flex justify-between items-center">
        <Dropdown
          value={branch}
          onChange={(e: any) => {
            setBranch(e.value);
            branchChange(e.value);
          }}
          options={branchOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Select a Offer Type"
          className="w-[200px] mt-2 h-[35px]"
          checkmark={true}
          highlightOnSelect={false}
        />

        <Dropdown
          value={branch1}
          onChange={(e: any) => {
            console.log(e.value);

            setBranch1(e.value);
            branchChange1(e.value);
          }}
          options={branchOptions1}
          optionLabel="label"
          disabled={workSpace}
          optionValue="value"
          placeholder="Select a Offer Type"
          className="w-[200px] mt-2 h-[35px]"
          checkmark={true}
          highlightOnSelect={false}
        />

        {workSpace ? null : (
          <button
            className="bg-green-500 border-none rounded-lg p-2  "
            onClick={() => {
              setWorkSpace(true);
              GetOptions()
            }}
          >
            <MdOutlineAddchart className="text-3xl text-white" />
          </button>
        )}
      </div>

      {workSpace ? (
        <>
          <form onSubmit={handleFeesSubmit}>
            <div className="m-2 p-3 rounded shadow-md mt-5 bg-[#f6f5f5]">
              <div className="my-3 text-[25px] font-semibold">
                {updateStructure ? "Update Offers" : "Add Offers"}
              </div>
              <div className="flex justify-between">
                <div className="flex flex-column gap-2 w-[48%]">
                  <label htmlFor="username">Minimum Value</label>
                  <InputNumber
                    value={workSpaceData.minimumval}
                    onChange={(e: any) => {
                      setWorkSpaceData({
                        ...workSpaceData,
                        minimumval: e.value,
                      });
                    }}
                    required
                  />
                </div>
                <div className="flex flex-column gap-2 w-[48%]">
                  <label htmlFor="username">Discount / Offers</label>
                  <InputNumber
                    value={workSpaceData.offers}
                    onChange={(e: any) => {
                      setWorkSpaceData({
                        ...workSpaceData,
                        offers: e.value,
                      });
                    }}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <div className="flex flex-column gap-2 w-[48%]">
                  <label htmlFor="username">Starting Date</label>
                  <Calendar
                    value={
                      workSpaceData.startingDate
                        ? new Date(workSpaceData.startingDate)
                        : null
                    }
                    onChange={(e: any) => {
                      setWorkSpaceData({
                        ...workSpaceData,
                        startingDate: e.value,
                      });
                    }}
                    dateFormat="dd/mm/yy"
                    required
                  />
                </div>
                <div className="flex flex-column gap-2 w-[48%]">
                  <label htmlFor="username">Ending Date</label>
                  <Calendar
                    value={
                      workSpaceData.endingDate
                        ? new Date(workSpaceData.endingDate)
                        : null
                    }
                    onChange={(e: any) => {
                      setWorkSpaceData({
                        ...workSpaceData,
                        endingDate: e.value,
                      });
                    }}
                    dateFormat="dd/mm/yy"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <div className="flex flex-column gap-2 w-[48%]">
                  <label htmlFor="username">Select Class Package</label>

                  <MultiSelect
                    value={workSpaceData.packageId}
                    onChange={(e) => {
                      console.log('e line ----- 689', e.value[0])


                      setWorkSpaceData((prevState) => ({
                        ...prevState,
                        packageId: e.value,
                      }));
                    }}
                    options={packageOption}
                    optionLabel="label"
                    placeholder="Select Class Package"

                  />
                </div>
                <div className="flex flex-column gap-2 w-[48%]">
                  <label htmlFor="username">Select Batch</label>
                  <MultiSelect
                    value={workSpaceData.batchId}
                    onChange={(e) => {


                      setWorkSpaceData((prevState) => ({
                        ...prevState,
                        batchId: e.value,
                      }));
                    }}
                    options={batchOption}
                    optionLabel="label"
                    placeholder="Select Batch"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <div className="flex flex-column gap-2 w-[100%]">
                  <label htmlFor="username">Description</label>
                  <InputText
                    value={workSpaceData.description}
                    onChange={(e: any) => {
                      setWorkSpaceData({
                        ...workSpaceData,
                        description: e.target.value,
                      });
                    }}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-start gap-5 mt-3">
                <div className="flex flex-column gap-2 w-[48%]">
                  <label htmlFor="username">Coupon</label>
                  <InputText
                    value={workSpaceData.coupon}
                    onChange={(e: any) => {
                      const couponValue = e.target.value;
                      setWorkSpaceData({
                        ...workSpaceData,
                        coupon: couponValue,
                      });

                      Axios.post(
                        `${import.meta.env.VITE_API_URL
                        }/director/validateCouponCode`,
                        {
                          CouponCode: couponValue,
                        },
                        {
                          headers: {
                            Authorization: localStorage.getItem("JWTtoken"),
                            "Content-Type": "application/json",
                          },
                        }
                      )
                        .then((res) => {
                          const data = decrypt(
                            res.data[1],
                            res.data[0],
                            import.meta.env.VITE_ENCRYPTION_KEY
                          );

                          if (data.success) {
                            setVerifyCoupon(true);
                          } else {
                            setVerifyCoupon(false);
                          }
                        })
                        .catch((err) => {
                          console.error("Error: ", err);
                        });
                    }}
                    required
                    readOnly={!updateStructure ? false : true}
                  />

                  {!updateStructure && (
                    <>
                      {workSpaceData.coupon.length === 0 ? (
                        <></>
                      ) : workSpaceData.coupon.length < 8 ? (
                        <div className="text-red-700">
                          Coupon Code Should be Above 8 Characters
                        </div>
                      ) : !verifycoupon ? (
                        <div className="text-red-700">
                          Already Expired Coupon
                        </div>
                      ) : (
                        <div className="text-green-600">Valid</div>
                      )}
                    </>
                  )}
                </div>
                {updateStructure ? (
                  <></>
                ) : (
                  <Button
                    severity="success"
                    type="button"
                    className="h-[35px] w-[20%] mt-[27px]"
                    label="Generate"
                    onClick={() => {
                      const characters =
                        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                      let couponCode = "";

                      for (let i = 0; i < 8; i++) {
                        const randomIndex = Math.floor(
                          Math.random() * characters.length
                        );
                        couponCode += characters[randomIndex];
                      }

                      setWorkSpaceData({
                        ...workSpaceData,
                        coupon: couponCode,
                      });

                      Axios.post(
                        import.meta.env.VITE_API_URL +
                        "/director/validateCouponCode",
                        {
                          CouponCode: couponCode,
                        },
                        {
                          headers: {
                            Authorization: localStorage.getItem("JWTtoken"),
                            "Content-Type": "application/json",
                          },
                        }
                      )
                        .then((res) => {
                          const data = decrypt(
                            res.data[1],
                            res.data[0],
                            import.meta.env.VITE_ENCRYPTION_KEY
                          );

                          if (data.success) {
                            setVerifyCoupon(true);
                          } else {
                            setVerifyCoupon(false);
                          }
                        })
                        .catch((err) => {
                          console.error("Error: ", err);
                        });
                    }}
                  />
                )}

                <button
                  type="button"
                  className=" h-[35px] w-[20%] mt-[30px] text-xl p-1"
                  onClick={() => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard
                        .writeText(workSpaceData.coupon || "")
                        .then(() => {
                          alert(`Copied: ${workSpaceData.coupon}`);
                        })
                        .catch((err) => {
                          console.error("Failed to copy text:", err);
                        });
                    } else {
                      // Fallback: Create a temporary textarea element for copying
                      const tempInput = document.createElement("textarea");
                      tempInput.value = workSpaceData.coupon || "";
                      document.body.appendChild(tempInput);
                      tempInput.select();
                      document.execCommand("copy");
                      document.body.removeChild(tempInput);

                      alert(`Copied: ${workSpaceData.coupon}`);
                    }
                  }}
                >
                  <FaRegCopy />
                </button>
              </div>
              <div className="flex justify-end mt-4 mb-3">
                {updateStructure ? (
                  <Button severity="warning" type="submit" label="Update" />
                ) : (
                  <Button severity="success" type="submit" label="Save" />
                )}
                &nbsp;&nbsp;
                <Button
                  onClick={() => {
                    setWorkSpace(false);
                    setUpdateStructure(false);
                    setWorkSpaceData({
                      refOfferId: null,
                      description: "",
                      coupon: "",
                      minimumval: null,
                      offers: null,
                      startingDate: "",
                      endingDate: "",
                      packageId: [],
                      batchId: []
                    });
                  }}
                  label="Close"
                />
              </div>
            </div>
          </form>
        </>
      ) : null}

      <DataTable value={tableData} className="mt-10">
        <Column field="Offer Type" header="Offer Type"></Column>
        <Column field="refCoupon" body={couponBody} header="Coupon"></Column>
        <Column field="refMin" header="Minimum Value"></Column>
        <Column field="refOffer" header="Discount / Offers"></Column>
        <Column
          style={{ width: "8rem" }}
          field="refStartAt"
          header="Starting Date"
        ></Column>
        <Column
          style={{ width: "8rem" }}
          field="refEndAt"
          header="Ending Date"
        ></Column>
        <Column field="status" body={Status} header="Status"></Column>
        <Column field="refFeId" body={EditBtn} header="Edit"></Column>
        <Column field="refFeId" body={DeleteBtn} header="Delete"></Column>
      </DataTable>
    </>
  );
};

export default Offers;
