import React, { useEffect, useState } from "react";

// import "./Profile.css";
import TextInput from "../../pages/Inputs/TextInput";
import SelectInput from "../../pages/Inputs/SelectInput";
import CheckboxInput from "../../pages/Inputs/CheckboxInput";
import RadiobuttonInput from "../../pages/Inputs/RadiobuttonInput";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

import CryptoJS from "crypto-js";
import { Calendar } from "primereact/calendar";

// interface HealthProblemData {
//   presentHealthProblem: Record<string, string>;
// }

// interface Condition {
//   label: string;
//   value: number;
//   checked: number;
// }

interface DecryptResult {
  [key: string]: any;
}

// interface ModeOfContact {
//   [key: number]: string;
// }

interface UserProfileEditProps {
  refid: string; // Adjust the type according to your use case, it can be `number` or `string` depending on what `refid` represents
}

const UserProfileEdit: React.FC<UserProfileEditProps> = ({ refid }) => {
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
  // const [conditions, setConditions] = useState<Condition[]>([]);
  const navigate = useNavigate();
  // const handleCheckboxChange = (index: any) => {
  //   setConditions((prevConditions: any) =>
  //     prevConditions.map((condition: any, i: any) =>
  //       i === index
  //         ? { ...condition, checked: condition.checked === 1 ? 0 : 1 }
  //         : condition
  //     )
  //   );
  // };

  const [inputs, setInputs] = useState({
    profilefile: { contentType: "", content: "" },
    fname: "",
    lname: "",
    dob: "",
    age: "",
    gender: "",
    guardianname: "",
    maritalstatus: "",
    anniversarydate: "",
    qualification: "",
    occupation: "",
    perdoorno: "",
    perstreetname: "",
    peraddress: "",
    perpincode: "",
    perstate: "",
    percity: "",
    tempdoorno: "",
    tempstreetname: "",
    tempaddress: "",
    temppincode: "",
    tempstate: "",
    tempcity: "",
    email: "",
    phoneno: "",
    emergencyno: "",
    whatsappno: "",
    mode: "",
    height: "",
    weight: "",
    bloodgroup: "",
    bmi: "",
    bp: "",
    accidentdetails: "",
    breaksdetails: "",
    breaksotheractivities: "",
    genderalanything: "",
    pastother: "",
    pastmedicaldetails: "",
    caredoctorname: "",
    caredoctorhospital: "",
    backpainscale: "",
    therapydurationproblem: "",
    therapypasthistory: "",
    therapyfamilyhistory: "",
    therapyanythingelse: "",
  });

  const [edits, setEdits] = useState({
    personal: false,
    address: false,
    communitcation: false,
    gendrel: false,
    present: false,
    therapy: false,
  });

  const editform = (event: string) => {
    setEdits({
      ...edits,
      [event]: true,
    });
  };

  const [options, setOptions] = useState({
    address: false,
    accident: false,
    breaks: false,
    care: false,
    backpain: false,
    refHealthIssue: false,
  });

  // const [userdata, setuserdata] = useState({
  //   username: "",
  //   usernameid: "",
  //   profileimg: { contentType: "", content: "" },
  // });

  // useEffect(() => {
  //   Axios.get(import.meta.env.VITE_API_URL + "/validateTokenData", {
  //     headers: {
  //       Authorization: localStorage.getItem("JWTtoken"),
  //       "Content-Type": "application/json",
  //     },
  //   }).then((res) => {
  //     const data = decrypt(
  //       res.data[1],
  //       res.data[0],
  //       import.meta.env.VITE_ENCRYPTION_KEY
  //     );

  //     localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

  //     setuserdata({
  //       username:
  //         "" + data.data[0].refStFName + " " + data.data[0].refStLName + "",
  //       usernameid: data.data[0].refUserName,
  //       profileimg: data.profileFile,
  //     });

  //     console.log("Verify Token  Running --- ");
  //   });
  // }, []);

  // const [modeofcontact, setModeofContact] = useState<ModeOfContact | undefined>(
  //   undefined
  // );

  useEffect(() => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/user/profileData",
      { refStId: parseInt(refid) },
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
      console.log("UserData Running --- ");
      console.log(data);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      // const healthConditions = Object.entries(
      //   (data.data as HealthProblemData).presentHealthProblem
      // ).map(
      //   ([value, label]): Condition => ({
      //     label, // Label as string
      //     value: Number(value), // Ensure value is a number
      //     checked: 0, // Default checked value
      //   })
      // );

      // Step 2: Update the mapped conditions to set `checked` to 1 if value matches
      // const updatedConditions = healthConditions.map((condition) => {
      //   // Check if the condition value is in `presenthealth.refPresentHealth`
      //   if (data.data.presentHealth.refPresentHealth) {
      //     return {
      //       ...condition,
      //       checked: 1, // Set `checked` to 1 if value matches
      //     };
      //   }
      //   return condition; // Return as is if no match
      // });

      // Step 3: Set the final updated conditions in state
      // setConditions(updatedConditions);

      // setModeofContact(data.data.modeOfCommunication);

      console.log(data.data);

      const personaldata = data.data.personalData;
      const addressdata = data.data.address;
      const communication = data.data.communication;
      const generalhealth = data.data.generalhealth;
      const presenthealth = data.data.presentHealth;

      setOptions({
        ...options,
        address: addressdata.addresstype,
        accident: generalhealth.refRecentInjuries,
        breaks: generalhealth.refRecentFractures,
        care: presenthealth.refUnderPhysicalCare,
        backpain: presenthealth.refBackPain === "no" ? false : true,
        refHealthIssue: personaldata.refHealthIssue,
      });

      setInputs({
        profilefile: data.data.profileFile,
        fname: personaldata.refStFName,
        lname: personaldata.refStLName,
        dob: personaldata.refStDOB,
        age: calculateAge(personaldata.refStDOB),
        gender: personaldata.refStSex,
        maritalstatus: personaldata.refMaritalStatus,
        anniversarydate: personaldata.refWeddingDate,
        guardianname: personaldata.refguardian,
        qualification: personaldata.refQualification,
        occupation: personaldata.refOccupation,
        perdoorno: addressdata.refAdFlat1,
        perstreetname: addressdata.refAdArea1,
        peraddress: addressdata.refAdAdd1,
        perpincode: addressdata.refAdPincode1,
        perstate: addressdata.refAdState1,
        percity: addressdata.refAdCity1,
        tempdoorno: addressdata.addresstype
          ? addressdata.refAdFlat1
          : addressdata.refAdFlat2,
        tempstreetname: addressdata.addresstype
          ? addressdata.refAdArea1
          : addressdata.refAdArea2,
        tempaddress: addressdata.addresstype
          ? addressdata.refAdAdd1
          : addressdata.refAdAdd2,
        temppincode: addressdata.addresstype
          ? addressdata.refAdPincode1
          : addressdata.refAdPincode2,
        tempstate: addressdata.addresstype
          ? addressdata.refAdState1
          : addressdata.refAdState2,
        tempcity: addressdata.addresstype
          ? addressdata.refAdCity1
          : addressdata.refAdCity2,
        email: communication.refCtEmail,
        phoneno: communication.refCtMobile,
        emergencyno: communication.refEmerContact,
        whatsappno: communication.refCtWhatsapp,
        mode: communication.refUcPreference,
        height: generalhealth.refHeight,
        weight: generalhealth.refWeight,
        bloodgroup: generalhealth.refBlood,
        bmi: generalhealth.refBMI,
        bp: generalhealth.refBP,
        accidentdetails: generalhealth.refRecentInjuriesReason,
        breaksdetails: generalhealth.refRecentFracturesReason,
        breaksotheractivities: generalhealth.refOthers,
        genderalanything: generalhealth.refElse,
        pastother: presenthealth.refPastHistory,
        pastmedicaldetails: presenthealth.refMedicalDetails,
        caredoctorname: presenthealth.refDoctor,
        caredoctorhospital: presenthealth.refHospital,
        backpainscale: presenthealth.refBackPain,
        therapydurationproblem: presenthealth.refProblem,
        therapypasthistory: presenthealth.refPastHistory,
        therapyfamilyhistory: presenthealth.refFamilyHistory,
        therapyanythingelse: presenthealth.refAnythingelse,
      });
    });
  }, []);

  // const [loading, setLoading] = useState({
  //   changeimg: false,
  // });
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle the file input change
  // const handleImageChange = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   setLoading({
  //     ...loading,
  //     changeimg: true,
  //   });
  //   const file = event.target.files?.[0] || null;

  //   if (file) {
  //     handleImageUpload(file); // Pass the file directly to the upload function
  //   }
  // };

  // Handle the image upload
  // const handleImageUpload = async (file: any) => {
  //   if (!file) {
  //     setLoading({
  //       ...loading,
  //       changeimg: false,
  //     });
  //     alert("Please select an image first.");
  //     return;
  //   }

  //   try {
  //     const response = await Axios.post(
  //       import.meta.env.VITE_API_URL + "/director/addEmployeeDocument",
  //       { file: file },
  //       {
  //         headers: {
  //           Authorization: localStorage.getItem("JWTtoken"),
  //           "Content-Type": "multipart/form-data", // Set content type to form-data
  //         },
  //       }
  //     );

  //     const data = decrypt(
  //       response.data[1],
  //       response.data[0],
  //       import.meta.env.VITE_ENCRYPTION_KEY
  //     );

  //     console.log(data);

  //     setInputs({
  //       ...inputs,
  //       profilefile: data.filePath,
  //     });

  //     setuserdata({
  //       ...userdata,
  //       profileimg: data.filePath,
  //     });

  //     setLoading({
  //       ...loading,
  //       changeimg: false,
  //     });

  //     console.log("Image uploaded successfully:", data);
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //   }
  // };
  const calculateAge = (dob: string) => {
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();

    // Adjust age if the birthday hasn't occurred this year yet
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < dobDate.getDate())
    ) {
      age--;
    }

    return age.toString(); // Return age as a string
  };

  const handleInputVal = (event: {
    target: { name: string; value: string | Date | null };
  }) => {
    const { name, value } = event.target;
    let Bmi: any;
    if (name === "height" || name === "weight") {
      function calculateBMI(weight: any, height: any) {
        let heightInMeters = height / 100;
        let bmi = weight / heightInMeters ** 2;
        return bmi.toFixed(2);
      }
      const height = name === "height" ? value : inputs.height
      const weight = name === "weight" ? value : inputs.weight
      Bmi = calculateBMI(weight, height)

    }

    setInputs((prevInputs) => {
      const updatedInputs = {
        ...prevInputs,
        [name]:
          value instanceof Date ? value.toISOString().split("T")[0] : value,
        bmi: Bmi
      };


      if (name === "dob") {
        const calculatedAge = calculateAge(updatedInputs.dob);
        updatedInputs.age = calculatedAge;
      }

      return updatedInputs;
    });
  };

  const handlesubmitaddress = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/staff/userDataUpdate",
      {
        refStId: refid,
        address: {
          addresstype: options.address,
          refAdAdd1: inputs.peraddress,
          refAdFlat1: inputs.perdoorno,
          refAdArea1: inputs.perstreetname,
          refAdCity1: inputs.percity,
          refAdState1: inputs.perstate,
          refAdPincode1: parseInt(inputs.perpincode),
          refAdAdd2: inputs.tempaddress,
          refAdFlat2: inputs.tempdoorno,
          refAdArea2: inputs.tempstreetname,
          refAdCity2: inputs.tempcity,
          refAdState2: inputs.tempstate,
          refAdPincode2: parseInt(inputs.temppincode),
        },
      },
      {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json", // Ensure the content type is set
        },
      }
    )
      .then((res) => {
        const data = decrypt(
          res.data[1],
          res.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );

        console.log(data.success);

        if (data.success) {
          setEdits({
            ...edits,
            address: false,
          });
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  const handlepersonalinfo = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/staff/userDataUpdate",
      {
        refStId: refid,
        personalData: {
          refOccupation: inputs.occupation,
          refQualification: inputs.qualification,
          refStAge: parseInt(inputs.age),
          refStDOB: new Date(inputs.dob),
          refStFName: inputs.fname,
          refStLName: inputs.lname,
          refStSex: inputs.gender,
          refguardian: inputs.guardianname,
          refMaritalStatus: inputs.maritalstatus,
          refWeddingDate: inputs.anniversarydate ? inputs.anniversarydate : "",
        },
      },
      {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json", // Ensure the content type is set
        },
      }
    )
      .then((res) => {
        const data = decrypt(
          res.data[1],
          res.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );

        console.log(data);

        if (data.success) {
          setEdits({
            ...edits,
            personal: false,
          });
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  const handlecommunicationtype = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/staff/userDataUpdate",

      {
        refStId: refid,
        communication: {
          refCtEmail: inputs.email,
          refCtMobile: inputs.phoneno,
          refEmerContact: inputs.emergencyno,
          refCtWhatsapp: inputs.whatsappno,
          refUcPreference: inputs.mode,
        },
      },
      {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json", // Ensure the content type is set
        },
      }
    )
      .then((res) => {
        const data = decrypt(
          res.data[1],
          res.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );

        console.log(data.success);

        if (data.success) {
          setEdits({
            ...edits,
            communitcation: false,
          });
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  const handlegenderalhealth = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/staff/userDataUpdate",

      {
        refStId: refid,
        generalhealth: {
          refBMI: inputs.bmi,
          refBP: inputs.bp,
          refBlood: inputs.bloodgroup,
          refElse: inputs.genderalanything,
          refHeight: parseInt(inputs.height),
          refOthers: inputs.breaksotheractivities,
          refRecentFractures: options.breaks,
          refRecentFracturesReason: inputs.breaksdetails,
          refRecentInjuries: options.accident,
          refRecentInjuriesReason: inputs.accidentdetails,
          refWeight: parseInt(inputs.weight),
        },
        medicalIssue: {
          refHealthIssue: options.refHealthIssue,
        },
      },
      {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json", // Ensure the content type is set
        },
      }
    )
      .then((res) => {
        const data = decrypt(
          res.data[1],
          res.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );

        console.log(data.success);

        if (data.success) {
          setEdits({
            ...edits,
            gendrel: false,
          });
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  // const handlepresenthealth = () => {
  //   let updatedHealthProblem: any[] = [];
  //   conditions.forEach((element) => {
  //     if (element.checked === 1) {
  //       updatedHealthProblem.push(element.value);
  //     }
  //   });

  //   Axios.post(
  //     import.meta.env.VITE_API_URL + "/staff/userDataUpdate",

  //     {
  //       refStId: refid,
  //       presentHealth: {
  //         refBackpain: inputs.backpainscale,
  //         refDrName: inputs.caredoctorname,
  //         refHospital: inputs.caredoctorhospital,
  //         refMedicalDetails: inputs.pastmedicaldetails,
  //         refOtherActivities: inputs.pastother,
  //         refPresentHealth: updatedHealthProblem,
  //         refUnderPhysCare: options.care,
  //       },
  //     },
  //     {
  //       headers: {
  //         Authorization: localStorage.getItem("JWTtoken"),
  //         "Content-Type": "application/json", // Ensure the content type is set
  //       },
  //     }
  //   )
  //     .then((res) => {
  //       const data = decrypt(
  //         res.data[1],
  //         res.data[0],
  //         import.meta.env.VITE_ENCRYPTION_KEY
  //       );

  //       console.log(data.success);

  //       if (data.success) {
  //         setEdits({
  //           ...edits,
  //           present: false,
  //         });
  //       }
  //     })
  //     .catch((err) => {
  //       // Catching any 400 status or general errors
  //       console.log("Error: ", err);
  //     });
  // };

  // const handletherapy = () => {
  //   let updatedHealthProblem: any[] = [];
  //   conditions.forEach((element) => {
  //     if (element.checked === 1) {
  //       updatedHealthProblem.push(element.value);
  //     }
  //   });

  //   Axios.post(
  //     import.meta.env.VITE_API_URL + "/staff/userDataUpdate",

  //     {
  //       refStId: refid,
  //       presentHealth: {
  //         refBackpain: inputs.backpainscale,
  //         refDrName: inputs.caredoctorname,
  //         refHospital: inputs.caredoctorhospital,
  //         refMedicalDetails: inputs.pastmedicaldetails,
  //         refOtherActivities: inputs.pastother,
  //         refPresentHealth: updatedHealthProblem,
  //         refUnderPhysCare: options.care,
  //         refAnythingelse: inputs.therapyanythingelse,
  //         refFamilyHistory: inputs.therapyfamilyhistory,
  //         refProblem: inputs.therapydurationproblem,
  //         refPastHistory: inputs.therapypasthistory,
  //       },
  //     },
  //     {
  //       headers: {
  //         Authorization: localStorage.getItem("JWTtoken"),
  //         "Content-Type": "application/json", // Ensure the content type is set
  //       },
  //     }
  //   )
  //     .then((res) => {
  //       const data = decrypt(
  //         res.data[1],
  //         res.data[0],
  //         import.meta.env.VITE_ENCRYPTION_KEY
  //       );

  //       console.log(data.success);

  //       if (data.success) {
  //         setEdits({
  //           ...edits,
  //           therapy: false,
  //         });
  //       }
  //     })
  //     .catch((err) => {
  //       // Catching any 400 status or general errors
  //       console.log("Error: ", err);
  //     });
  // };

  return (
    <>
      <div className="bg-[#fff]">
        <div className="py-1" />

        <div className="">
          {/* Personal Information */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlepersonalinfo();
            }}
          >
            <div className="basicProfileCont p-10 shadow-lg w-[100%] ">
              <div className="w-[100%] flex justify-between items-center mb-5">
                <div className="text-[1.2rem] lg:text-[25px] font-bold ">
                  Personal Information
                </div>
                {edits.personal ? (
                  <button
                    className="text-[15px] outline-none py-2 border-none px-3 bg-[#f95005] font-bold cursor-pointer text-white rounded"
                    type="submit"
                  >
                    Save&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-check"></i>
                  </button>
                ) : (
                  <>
                    {window.location.pathname !== "/staff/classinfo" && (
                      <div
                        onClick={() => {
                          editform("personal");
                        }}
                        className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                      >
                        Edit&nbsp;&nbsp;
                        <i className="text-[15px] pi pi-pen-to-square"></i>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="w-[100%] flex flex-col gap-y-10 justify-center items-center">
                <div className="w-[100%] mb-10 lg:mb-0 lg:w-[30%] flex flex-col justify-center lg:justify-start items-center lg:items-start">
                  {!inputs.profilefile ? (
                    <div className="w-[250px] border-[#b3b4b6] cursor-pointer rounded-full flex justify-center items-center border-2 h-[250px]">
                      <i className="text-[150px] text-[#858585] pi pi-user"></i>
                    </div>
                  ) : (
                    <div className="w-[250px] border-[#b3b4b6] cursor-pointer rounded-full flex justify-center items-center border-2 h-[250px]">
                      <img
                        id="userprofileimg"
                        className="w-[250px] h-[250px] object-cover rounded-full"
                        src={`data:${inputs.profilefile.contentType};base64,${inputs.profilefile.content}`}
                        alt=""
                      />
                    </div>
                  )}
                </div>
                <div className="w-[100%] lg:w-[100%] flex flex-col justify-center items-center">
                  <div className="w-[100%] justify-center items-center flex flex-col">
                    <div className="w-[100%] flex justify-between mb-[20px]">
                      <div className="w-[48%]">
                        <TextInput
                          label="First Name *"
                          name="fname"
                          id="fname"
                          type="text"
                          onChange={handleInputVal}
                          value={inputs.fname}
                          readonly={!edits.personal}
                          required
                        />
                      </div>
                      <div className="w-[48%]">
                        <TextInput
                          label="Last Name *"
                          name="lname"
                          id="lname"
                          type="text"
                          onChange={handleInputVal}
                          value={inputs.lname}
                          readonly={!edits.personal}
                          required
                        />
                      </div>
                    </div>

                    <div className="w-[100%] flex justify-between mb-[20px]">
                      <div className="flex flex-col w-[48%] -mt-[13px]">
                        <label className="bg-[#fff] text-[#ff621b]  -mb-[15px] z-50 w-[120px] ml-[10px]">
                          &nbsp;Date of Birth *
                        </label>
                        <Calendar
                          name="dob"
                          id="dob"
                          className={`relative w-full mt-1 h-10 placeholder-transparent transition-all border-2 rounded outline-none peer 
      ${edits.personal ? "text-[#4c4c4e]" : "text-black"} border-[#b3b4b6] autofill:bg-white dateInput`}
                          onChange={(e) =>
                            handleInputVal({
                              target: {
                                name: "dob",
                                value: e.value
                                  ? new Date(e.value.getTime() - e.value.getTimezoneOffset() * 60000)
                                    .toISOString()
                                    .split("T")[0]
                                  : "",
                              },
                            })
                          }
                          value={inputs.dob ? new Date(inputs.dob) : null} // Ensure it's a Date object
                          dateFormat="dd/mm/yy"
                          disabled={!edits.personal}
                          required
                        />

                      </div>

                      <div className="w-[48%]">
                        <TextInput
                          label="Age *"
                          name="age"
                          id="age"
                          type="number"
                          value={inputs.age}
                          readonly
                          required
                        />
                      </div>
                    </div>

                    <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between mb-[20px]">
                      <div className="w-[100%] md:w-[48%] lg:w-[48%]">
                        <SelectInput
                          id="gender"
                          name="gender"
                          label="Gender *"
                          value={inputs.gender}
                          disabled={!edits.personal}
                          onChange={handleInputVal}
                          options={[
                            { value: "male", label: "Male" },
                            { value: "female", label: "Female" },
                          ]}
                          required
                        />
                      </div>
                      <div className="w-[100%] md:w-[48%] lg:w-[48%]">
                        <TextInput
                          label="Emergency Contact Name / Relationship *"
                          name="guardianname"
                          id="guardianname"
                          type="text"
                          onChange={handleInputVal}
                          value={inputs.guardianname}
                          readonly={!edits.personal}
                          required
                        />
                      </div>
                    </div>

                    <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between mb-[20px]">
                      <div className="w-[100%] md:w-[48%] lg:w-[48%]">
                        <SelectInput
                          id="maritalstatus"
                          name="maritalstatus"
                          label="Marital Status *"
                          value={inputs.maritalstatus}
                          onChange={handleInputVal}
                          options={[
                            { value: "single", label: "Single" },
                            { value: "married", label: "Married" },
                          ]}
                          disabled={
                            edits.personal && inputs.age > "20" ? false : true
                          }
                          required
                        />
                      </div>
                      <div className="w-[100%] md:w-[48%] lg:w-[48%]">
                        <TextInput
                          label="Anniversary Date *"
                          name="anniversarydate"
                          id="anniversarydate"
                          type="date"
                          onChange={handleInputVal}
                          disabled={
                            inputs.maritalstatus === "married" ? false : true
                          }
                          readonly={!edits.personal}
                          value={inputs.anniversarydate}
                          required
                        />
                      </div>
                    </div>

                    <div className="w-[100%] flex justify-between">
                      <div className="w-[48%]">
                        <TextInput
                          label="Qualification"
                          name="qualification"
                          id="qualification"
                          type="text"
                          onChange={handleInputVal}
                          disabled={inputs.age > "18" ? false : true}
                          value={inputs.qualification}
                          readonly={!edits.personal}
                        />
                      </div>
                      <div className="w-[48%]">
                        <TextInput
                          label="Occupation"
                          name="occupation"
                          id="Occupation"
                          type="text"
                          onChange={handleInputVal}
                          disabled={inputs.age > "20" ? false : true}
                          value={inputs.occupation}
                          readonly={!edits.personal}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Address */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlesubmitaddress();
            }}
          >
            <div className="basicProfileCont p-10 shadow-lg mt-10">
              <div className="w-[100%] flex justify-between items-center mb-5">
                <div className="text-[1.2rem] lg:text-[25px] font-bold">
                  Address
                </div>
                {edits.address ? (
                  <button
                    className="text-[15px] outline-none py-2 border-none px-3 bg-[#f95005] font-bold cursor-pointer text-white rounded"
                    type="submit"
                  >
                    Save&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-check"></i>
                  </button>
                ) : (
                  <>
                    {window.location.pathname !== "/staff/classinfo" && (
                      <div
                        onClick={() => {
                          editform("address");
                        }}
                        className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                      >
                        Edit&nbsp;&nbsp;
                        <i className="text-[15px] pi pi-pen-to-square"></i>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="w-[100%] flex justify-center items-center">
                <div className="w-[100%] justify-center items-center flex flex-col">
                  <div className="text-[1.2rem] lg:text-[25px] font-bold mb-5">
                    Permanent Address
                  </div>

                  <div className="w-[100%] mb-[20px] flex justify-between">
                    <div className="w-[48%]">
                      <div className="relative w-full">
                        <TextInput
                          id="perdoorno"
                          type="text"
                          name="perdoorno"
                          label="Door no *"
                          required
                          value={inputs.perdoorno}
                          readonly={!edits.address}
                          onChange={(e) => handleInputVal(e)}
                        />
                      </div>
                    </div>

                    <div className="w-[48%]">
                      <div className="relative w-full">
                        <TextInput
                          id="streetname"
                          type="text"
                          name="perstreetname"
                          label="Street Name *"
                          required
                          value={inputs.perstreetname}
                          readonly={!edits.address}
                          onChange={(e) => handleInputVal(e)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between mb-[20px]">
                    <div className="w-[100%] md:w-[48%]">
                      <TextInput
                        label="Locality *"
                        name="peraddress"
                        id="peraddress"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.peraddress}
                        readonly={!edits.address}
                        required
                      />
                    </div>
                    <div className="w-[100%] md:w-[48%]">
                      <TextInput
                        label="Pincode *"
                        name="perpincode"
                        id="perpincode"
                        type="number"
                        onChange={handleInputVal}
                        value={inputs.perpincode}
                        readonly={!edits.address}
                        required
                      />
                    </div>
                  </div>

                  <div className="w-[100%] flex justify-between mb-[20px]">
                    <div className="w-[48%]">
                      <TextInput
                        label="State *"
                        name="perstate"
                        id="perstate"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.perstate}
                        readonly={!edits.address}
                        required
                      />
                    </div>
                    <div className="w-[48%]">
                      <TextInput
                        label="City *"
                        name="percity"
                        id="percity"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.percity}
                        readonly={!edits.address}
                        required
                      />
                    </div>
                  </div>

                  <div className="w-[100%]">
                    <CheckboxInput
                      id="bothaddress"
                      label="Use Communication Address & Permanent Address as Same."
                      checked={options.address}
                      onChange={() => {
                        setOptions({
                          ...options,
                          address: !options.address,
                        });

                        if (!options.address) {
                          setInputs({
                            ...inputs,
                            tempdoorno: inputs.perdoorno,
                            tempstreetname: inputs.perstreetname,
                            tempaddress: inputs.peraddress,
                            temppincode: inputs.perpincode,
                            tempstate: inputs.perstate,
                            tempcity: inputs.percity,
                          });
                        } else {
                          setInputs({
                            ...inputs,
                            tempdoorno: "",
                            tempstreetname: "",
                            tempaddress: "",
                            temppincode: "",
                            tempstate: "",
                            tempcity: "",
                          });
                        }
                      }}
                      readonly={!edits.address}
                    />
                  </div>

                  <div className="text-[1.2rem] lg:text-[25px] font-bold mb-5">
                    Communication Address
                  </div>
                  <div className="w-[100%] mb-[20px] flex justify-between">
                    <div className="w-[48%]">
                      <div className="relative w-full">
                        <TextInput
                          id="doorno"
                          type="text"
                          name="tempdoorno"
                          label="Door no *"
                          required
                          value={inputs.tempdoorno}
                          readonly={!edits.address}
                          onChange={(e) => handleInputVal(e)}
                        />
                      </div>
                    </div>

                    <div className="w-[48%]">
                      <div className="relative w-full">
                        <TextInput
                          id="streetname"
                          type="text"
                          name="tempstreetname"
                          label="Street Name *"
                          required
                          value={inputs.tempstreetname}
                          readonly={!edits.address}
                          onChange={(e) => handleInputVal(e)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between mb-[20px]">
                    <div className="w-[100%] md:w-[48%]">
                      <TextInput
                        label="Locality *"
                        name="tempaddress"
                        id="tempaddress"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.tempaddress}
                        readonly={!edits.address}
                        required
                      />
                    </div>
                    <div className="w-[100%] md:w-[48%]">
                      <TextInput
                        label="Pincode *"
                        name="temppincode"
                        id="temppincode"
                        type="number"
                        onChange={handleInputVal}
                        value={inputs.temppincode}
                        readonly={!edits.address}
                        required
                      />
                    </div>
                  </div>

                  <div className="w-[100%] flex justify-between">
                    <div className="w-[48%]">
                      <TextInput
                        label="State *"
                        name="tempstate"
                        id="perstate"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.tempstate}
                        readonly={!edits.address}
                        required
                      />
                    </div>
                    <div className="w-[48%]">
                      <TextInput
                        label="City *"
                        name="tempcity"
                        id="tempcity"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.tempcity}
                        readonly={!edits.address}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Communication Type */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlecommunicationtype();
            }}
          >
            <div className="basicProfileCont p-10 shadow-lg mt-10">
              <div className="w-[100%] flex justify-between items-center mb-5">
                <div className="text-[1rem] lg:text-[25px] font-bold">
                  Communication Type
                </div>
                {edits.communitcation ? (
                  <button
                    className="text-[15px] outline-none py-2 border-none px-3 bg-[#f95005] font-bold cursor-pointer text-white rounded"
                    type="submit"
                  >
                    Save&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-check"></i>
                  </button>
                ) : (
                  <>
                    {window.location.pathname !== "/staff/classinfo" && (
                      <div
                        onClick={() => {
                          editform("communitcation");
                        }}
                        className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                      >
                        Edit&nbsp;&nbsp;
                        <i className="text-[15px] pi pi-pen-to-square"></i>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="w-[100%] flex flex-col justify-center items-center">
                <div className="w-[100%] gap-4 flex justify-between mb-[20px]">
                  <div className="w-[100%]">
                    <TextInput
                      label="E-Mail *"
                      name="email"
                      id="email"
                      type="email"
                      onChange={handleInputVal}
                      value={inputs.email}
                      readonly={!edits.communitcation}
                      required
                    />
                  </div>
                  <div className="w-[100%] ">
                    <TextInput
                      label="Emergency Contact Number *"
                      name="emergencyno"
                      id="emergencyno"
                      type="number"
                      onChange={handleInputVal}
                      value={inputs.emergencyno}
                      readonly={!edits.communitcation}
                      required
                    />
                  </div>
                </div>
                <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between mb-[20px]">
                  <div className="w-[100%] md:w-[40%]">
                    <TextInput
                      label="Phone Number *"
                      name="phoneno"
                      id="phoneno"
                      type="number"
                      onChange={handleInputVal}
                      value={inputs.phoneno}
                      readonly={!edits.communitcation}
                      required
                    />
                  </div>
                  <div className="w-[100%] md:w-[56%] flex justify-between">
                    <div className="w-[65%] md:w-[75%]">
                      <TextInput
                        label="WhatsApp Number *"
                        name="whatsappno"
                        id="whatsappno"
                        type="number"
                        onChange={handleInputVal}
                        value={inputs.whatsappno}
                        readonly={!edits.communitcation}
                        required
                      />
                    </div>
                    <div
                      className="w-[30%] md:w-[18%] text-[0.7rem] lg:text-[14px] flex justify-center items-center text-center bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                      onClick={() => {
                        if (edits.communitcation) {
                          setInputs({
                            ...inputs,
                            whatsappno: inputs.phoneno,
                          });
                        } else {
                          console.log("Edit Disabled");
                        }
                      }}
                    >
                      Use Same Number
                    </div>
                  </div>
                </div>

                {/* <div className="w-[100%] ">
                  <SelectInput
                    id="modeofcontact"
                    name="mode"
                    label="Mode of Contact *"
                    value={inputs.mode}
                    onChange={handleInputVal}
                    options={
                      modeofcontact
                        ? Object.entries(modeofcontact).map(
                          ([value, label]) => ({
                            value, // The key as value
                            label, // The value as label
                          })
                        )
                        : [] // Empty array before the data is loaded
                    }
                    disabled={!edits.communitcation}
                    required
                  />
                </div> */}
              </div>
            </div>
          </form>

          {/* Genderal Health */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlegenderalhealth();
            }}
          >
            <div className="basicProfileCont p-10 shadow-lg mt-10">
              <div className="w-[100%] flex justify-between items-center mb-5">
                <div className="text-[1.2rem] lg:text-[25px] font-bold">
                  General Health
                </div>
                {edits.gendrel ? (
                  <button
                    className="text-[15px] outline-none py-2 border-none px-3 bg-[#f95005] font-bold cursor-pointer text-white rounded"
                    type="submit"
                  >
                    Save&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-check"></i>
                  </button>
                ) : (
                  <>
                    {window.location.pathname !== "/staff/classinfo" && (
                      <div
                        onClick={() => {
                          editform("gendrel");
                        }}
                        className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                      >
                        Edit&nbsp;&nbsp;
                        <i className="text-[15px] pi pi-pen-to-square"></i>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="w-[100%] flex flex-col justify-center items-center">
                <div className="w-[100%] flex justify-between mb-[20px]">
                  <div className="w-[48%]">
                    <TextInput
                      label="Height in CM *"
                      name="height"
                      id="height"
                      type="number"
                      onChange={handleInputVal}
                      value={inputs.height}
                      readonly={!edits.gendrel}
                      required
                    />
                  </div>
                  <div className="w-[48%]">
                    <TextInput
                      label="Weight in KG *"
                      name="weight"
                      id="weight"
                      type="number"
                      onChange={handleInputVal}
                      value={inputs.weight}
                      readonly={!edits.gendrel}
                      required
                    />
                  </div>
                </div>

                <div className="w-[100%] flex justify-between mb-[20px]">
                  <div className="w-[48%]">
                    <SelectInput
                      id="bloodgroup"
                      name="bloodgroup"
                      label="Blood Group *"
                      onChange={handleInputVal}
                      value={inputs.bloodgroup}
                      options={[
                        { value: "A+", label: "A+" },
                        { value: "A-", label: "A-" },
                        { value: "B+", label: "B+" },
                        { value: "B-", label: "B-" },
                        { value: "AB+", label: "AB+" },
                        { value: "AB-", label: "AB-" },
                        { value: "O+", label: "O+" },
                        { value: "O-", label: "O-" },
                      ]}
                      disabled={!edits.gendrel}
                      required
                    />
                  </div>
                  <div className="w-[48%]">
                    <TextInput
                      label="BMI"
                      name="bmi"
                      id="bmi"
                      type="number"
                      onChange={handleInputVal}
                      value={inputs.bmi}
                      readonly
                    />
                  </div>
                </div>

                {localStorage.getItem("refUtId") === "4" ? (
                  <>
                    {" "}
                    <div className="w-[100%] flex flex-col md:flex-row gap-y-[25px] justify-between mb-[25px]">
                      <div className="w-[100%] md:w-[48%]">
                        <label className="w-[100%] text-[#f95005] font-bold text-[1.0rem] lg:text-[20px] text-start">
                          Medical Issue *{" "}
                        </label>
                        <div className="w-[100%] flex justify-start mt-[10px]">
                          <div className="mr-10">
                            <RadiobuttonInput
                              id="refHealthIssue"
                              value="yes"
                              name="refHealthIssue"
                              selectedOption={
                                options.refHealthIssue ? "yes" : ""
                              }
                              onChange={() => {
                                setOptions({
                                  ...options,
                                  refHealthIssue: true,
                                });
                              }}
                              label="Yes"
                              readonly={!edits.gendrel}
                              required
                            />
                          </div>
                          <div className="">
                            <RadiobuttonInput
                              id="refHealthIssue"
                              value="no"
                              name="refHealthIssue"
                              label="No"
                              onChange={() => {
                                setOptions({
                                  ...options,
                                  refHealthIssue: false,
                                });
                              }}
                              selectedOption={
                                !options.refHealthIssue ? "no" : ""
                              }
                              readonly={!edits.gendrel}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </form>

          <div className="py-1"></div>
        </div>
      </div>
    </>
  );
};

export default UserProfileEdit;
