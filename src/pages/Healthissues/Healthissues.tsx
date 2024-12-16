import Axios from "axios";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
// import { InputNumber } from "primereact/inputnumber";
// import { TabView } from "primereact/tabview";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { GrEdit } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import React, { useEffect, useState } from "react";
import { RiHeartAddFill } from "react-icons/ri";
import { InputText } from "primereact/inputtext";
// import { ImUpload2 } from "react-icons/im";

interface healthData {
  id: number;
  refHealthData: string;
}

const Healthissues: React.FC = () => {
  const navigate = useNavigate();

  const [healthissueData, setHealthissueData] = useState<healthData[]>([]);
  const [healthissueadd, setHealthissueAdd] = useState(false);
  const [editHealthissue, setHealthissue] = useState(false);
  const [healthissueUpdate, setHealthissueUpdate] = useState(false);
  const [healthData, setHealthData] = useState<string | undefined>("");
  const [id, setId] = useState<number | undefined>();
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
  const fetchHealthissueDate = () => {
    Axios.get(
      import.meta.env.VITE_API_URL + "/settings/generalHealth/Options",
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
        const capitalizeString = (str: any): string => {
          if (typeof str !== "string") return str; // Only capitalize if it's a string
          return str.charAt(0).toUpperCase() + str.slice(1); // Capitalize first letter, leave the rest unchanged
        };

        const fetchedHealthissue: healthData[] = data.healthOptions.map(
          (healthissue: any) => ({
            id: healthissue.refHealthId,
            refHealthData: capitalizeString(healthissue.refHealth),
          })
        );

        setHealthissueData(fetchedHealthissue);
      }
    });
  };

  const addHealthissueDate = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/settings/generalHealth/addOptions",
      {
        healthText: healthData,
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
          setHealthissueAdd(false);
          // setHealthData();
          setHealthData("");
          fetchHealthissueDate();
          toast.success("New Health Issue Added Successfully!", {
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
          toast.warning("can't Add New Health Issue", {
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
  const updateHealthissueDate = () => {
    console.log("----------------------------------------------------");
    Axios.post(
      import.meta.env.VITE_API_URL + "/settings/generalHealth/editOptions",
      {
        healthText: healthData,
        refHId: id,
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
          setHealthissueAdd(false);
          // setHealthData();
          fetchHealthissueDate();
          toast.success("Health Issue Updated Successfully!", {
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
          toast.warning("can't Update the Health Issue", {
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

  useEffect(() => {
    fetchHealthissueDate();
  }, []);

  const sessionEdit = (rowData: any) => {
    console.log("rowData", rowData);
    return (
      <div
        onClick={() => {
          console.log("rowData.refTimeId", rowData.refTimeId);
          setHealthissueAdd(true);
          setHealthissueUpdate(true);
          setHealthissue(false);
          setHealthData(rowData.refHealthData);
          setId(rowData.id);
        }}
      >
        <GrEdit
          style={{ cursor: "pointer", color: "green", fontSize: "1.5rem" }}
        />
      </div>
    );
  };

  function deleteHealth(rowData:any){
    Axios.post(
      import.meta.env.VITE_API_URL +
        "/settings/generalHealth/deleteOptions",
      {
        refHealthId: rowData.id,
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
          toast.error("The Section Is Deleted Successfully", {
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
          fetchHealthissueDate();
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
            // transition: Bounce,
          });
        }
      }
    });
  }

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

  return (
    <div>
      <ToastContainer />

      <div>
        {" "}
        <h2>Health issue</h2>
      </div>
      {healthissueadd ? (
        <></>
      ) : (
        <div className="flex justify-end w-[90%]">
          <button
            className="bg-green-500 border-none rounded-lg p-2  "
            onClick={() => {
              setHealthissueAdd(true);
              setHealthissue(false);
              setHealthissueUpdate(false);
            }}
          >
            <RiHeartAddFill className="text-3xl text-white" />
          </button>
        </div>
      )}

      {healthissueadd ? (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex justify-between mt-4">
              <div className="flex flex-col gap-2  w-[50%] ">
                {editHealthissue ? (
                  <></>
                ) : (
                  <>
                    <label htmlFor="username">Health issue</label>
                    <InputText
                      required
                      onInput={(e: any) => {
                        setHealthData(e.target.value);
                      }}
                      value={healthData}
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
                    setHealthissueAdd(false);
                  }}
                />
                {healthissueUpdate ? (
                  <Button
                    severity="warning"
                    label="Update"
                    onClick={updateHealthissueDate}
                    type="submit"
                  />
                ) : (
                  <Button
                    severity="success"
                    label="Save"
                    onClick={addHealthissueDate}
                    type="submit"
                  />
                )}
              </div>
            </div>
          </form>
        </>
      ) : null}

      <DataTable value={healthissueData} className="mt-10 p-5 ">
        <Column
          body={(_data, options) => options.rowIndex + 1}
          header="S No"
        ></Column>
        <Column field="refHealthData" header="Health issue"></Column>

        <Column header="Edit" body={sessionEdit}></Column>
        <Column header="Delete" body={sessionDelete}></Column>
      </DataTable>
    </div>
  );
};

export default Healthissues;
