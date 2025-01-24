import React, { useEffect, useState } from "react";

// import "./Profile.css";
import TextInput from "../../pages/Inputs/TextInput";
import SelectInput from "../../pages/Inputs/SelectInput";
import CheckboxInput from "../../pages/Inputs/CheckboxInput";
import RadiobuttonInput from "../../pages/Inputs/RadiobuttonInput";
import Axios from "axios";
import CryptoJS from "crypto-js";

import { useNavigate } from "react-router-dom";

interface HealthProblemData {
  presentHealthProblem: Record<string, string>;
}

interface Condition {
  label: string;
  value: number;
  checked: number;
}

interface DecryptResult {
  [key: string]: any;
}

interface ModeOfContact {
  [key: number]: string;
}

interface UserProfileEditProps {
  refid: string; // Adjust the type according to your use case, it can be `number` or `string` depending on what `refid` represents
}

interface UserProfileEditProps {
  refid: string; // Adjust the type according to your use case, it can be `number` or `string` depending on what `refid` represents
}
const MedicalTabs: React.FC<UserProfileEditProps> = ({ refid }) => {
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
  const [conditions, setConditions] = useState<Condition[]>([]);
  const navigate = useNavigate();
  const handleCheckboxChange = (index: any) => {
    setConditions((prevConditions: any) =>
      prevConditions.map((condition: any, i: any) =>
        i === index
          ? { ...condition, checked: condition.checked === 1 ? 0 : 1 }
          : condition
      )
    );
  };

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
    whatsappno: "",
    emgContaxt: "",
    mode: "",
    height: "",
    weight: "",
    bloodgroup: "",
    bmi: "",
    ifbp: "",
    bp: "",
    bpValue: "",
    accidentdetails: "",
    breaksdetails: "",
    breaksotheractivities: "",
    BackPainValue: "",
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
    medicalIssue: false,
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
    medicalIssue: false,
    present: false,
    therapy: false,
    breaks: false,
    care: false,
    backpain: false,
    ifbp: false,
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

  const [modeofcontact, setModeofContact] = useState<ModeOfContact | undefined>(
    undefined
  );

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
      console.log("UserData Running ---  212 ");
      console.log(data);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      const healthConditions = Object.entries(
        (data.data as HealthProblemData).presentHealthProblem
      ).map(
        ([value, label]): Condition => ({
          label, // Label as string
          value: Number(value), // Ensure value is a number
          checked: 0, // Default checked value
        })
      );

      // Step 2: Update the mapped conditions to set `checked` to 1 if value matches
      const updatedConditions = healthConditions.map((condition) => {
        // Check if the condition value is in `presenthealth.refPresentHealth`
        if (data.data.presentHealth.refPresentHealth) {
          return {
            ...condition,
            checked: 1, // Set `checked` to 1 if value matches
          };
        }
        return condition; // Return as is if no match
      });

      // Step 3: Set the final updated conditions in state
      setConditions(updatedConditions);

      setModeofContact(data.data.modeOfCommunication);

      console.log(data.data);

      const personaldata = data.data.personalData;
      const addressdata = data.data.address;
      const communication = data.data.communication;
      const generalhealth = data.data.generalhealth;
      const presenthealth = data.data.presentHealth;

      setOptions({
        ...options,
        medicalIssue: personaldata.refHealthIssue,
        address: addressdata.addresstype,
        accident: generalhealth.refRecentInjuries,
        breaks: generalhealth.refRecentFractures,
        care: presenthealth.refUnderPhysicalCare,
        backpain: presenthealth.refBackPain === "no" ? false : true,
        ifbp: generalhealth.refIfBP === "no" ? false : true,
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
        whatsappno: communication.refCtWhatsapp,
        emgContaxt: communication.refEmerContact,
        mode: communication.refUcPreference,
        height: generalhealth.refHeight,
        weight: generalhealth.refWeight,
        bloodgroup: generalhealth.refBlood,
        bmi: generalhealth.refBMI,
        bp: generalhealth.refBP,
        BackPainValue: presenthealth ? presenthealth.refBackPainValue : null,

        bpValue: presenthealth ? generalhealth.refBpType : null,
        ifbp: presenthealth ? generalhealth.refIfBp : null,
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

  const handleInputVal = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    // Update inputs
    setInputs((prevInputs) => {
      const updatedInputs = {
        ...prevInputs,
        [name]: value,
      };

      // If the address option is enabled, update temporary address fields
      if (options.address) {
        updatedInputs.tempdoorno = prevInputs.perdoorno;
        updatedInputs.tempstreetname = prevInputs.perstreetname;
        updatedInputs.tempaddress = prevInputs.peraddress;
        updatedInputs.temppincode = prevInputs.perpincode;
        updatedInputs.tempcity = prevInputs.percity;
        updatedInputs.tempstate = prevInputs.perstate;
      }

      // If the input is for DOB, calculate the age
      if (name === "dob") {
        const calculatedAge = calculateAge(value);
        updatedInputs.age = calculatedAge;
      } else if (name === "maritalstatus") {
        if (value === "single") {
          updatedInputs.anniversarydate = "";
        }
      }

      return updatedInputs; // Return the updated inputs
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
          refCtWhatsapp: inputs.whatsappno,
          refEmerContact: inputs.emgContaxt,
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

  const handlepresenthealth = () => {
    let updatedHealthProblem: any[] = [];
    conditions.forEach((element) => {
      
      if (element.checked === 1) {
        updatedHealthProblem.push(element.value);
      }
    });

    Axios.post(
      import.meta.env.VITE_API_URL + "/staff/userDataUpdate",

      {
        refStId: refid,
        presentHealth: {
          refIfBp: inputs.ifbp,
          refBackPainValue: inputs.BackPainValue,
          refBackpain: inputs.backpainscale,
          refDrName: inputs.caredoctorname,
          refHospital: inputs.caredoctorhospital,
          refMedicalDetails: inputs.pastmedicaldetails,
          refOtherActivities: inputs.pastother,
          refPresentHealth: updatedHealthProblem,
          refUnderPhysCare: options.care,
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
            present: false,
          });
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  const handletherapy = () => {
    let updatedHealthProblem: any[] = [];
    conditions.forEach((element) => {
      if (element.checked === 1) {
        updatedHealthProblem.push(element.value);
      }
    });

    Axios.post(
      import.meta.env.VITE_API_URL + "/staff/userDataUpdate",

      {
        refStId: refid,
        presentHealth: {
          refIfBp: inputs.ifbp,
          refBackPainValue: inputs.BackPainValue,
          refBackpain: inputs.backpainscale,
          refDrName: inputs.caredoctorname,
          refHospital: inputs.caredoctorhospital,
          refMedicalDetails: inputs.pastmedicaldetails,
          refOtherActivities: inputs.pastother,
          refPresentHealth: updatedHealthProblem,
          refUnderPhysCare: options.care,
          refAnythingelse: inputs.therapyanythingelse,
          refFamilyHistory: inputs.therapyfamilyhistory,
          refProblem: inputs.therapydurationproblem,
          refPastHistory: inputs.therapypasthistory,
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
            therapy: false,
          });
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  return (
    <>
      <div className="bg-[#fff]">
        <div className="py-1" />

        <div className="">
          {/* Past or Present Health */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlepresenthealth();
            }}
          >
            <div className="basicProfileCont p-10 shadow-lg mt-10">
              <div className="w-[100%] flex justify-between items-center mb-5">
                <div className="text-[1.2rem] lg:text-[25px] font-bold">
                  Past or Present Health
                </div>
                {edits.present ? (
                  <button
                    className="text-[15px] outline-none py-2 border-none px-3 bg-[#f95005] font-bold cursor-pointer text-white rounded"
                    type="submit"
                  >
                    Save&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-check"></i>
                  </button>
                ) : (
                  <div
                    onClick={() => {
                      editform("present");
                    }}
                    className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                  >
                    Edit&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-pen-to-square"></i>
                  </div>
                )}
              </div>
              <div className="w-[100%] flex justify-center items-center">
                <div className="w-[100%] justify-center items-center flex flex-col">
                  <div className="w-[100%] flex flex-wrap gap-y-[10px] lg:gap-y-[30px] gap-x-10 mb-[20px]">
                    {conditions.map((condition, index) => (
                      <div className="w-[140px]" key={index}>
                        <CheckboxInput
                          id={`condition-${index}`}
                          checked={condition.checked === 1}
                          label={condition.label}
                          onChange={() => handleCheckboxChange(index)}
                          readonly={!edits.present}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between mb-[20px]">
                    <div className="w-[100%] md:w-[48%]">
                      <TextInput
                        label="Description "
                        name="pastother"
                        id="others"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.pastother}
                        readonly={!edits.present}
                      />
                    </div>
                    <div className="w-[100%] md:w-[48%]">
                      <TextInput
                        label="Current Medicines"
                        name="pastmedicaldetails"
                        id="medicaldetails"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.pastmedicaldetails}
                        readonly={!edits.present}
                      />
                    </div>
                  </div>

                  <div className="w-[100%] mb-5 flex flex-col gap-y-[20px] md:flex-row justify-between">
                    <div className="w-[100%] md:w-[100%]">
                      <label className="w-[100%] text-[#f95005]  text-[1.0rem] lg:text-[18px] text-start">
                        Under Physician's Care *
                      </label>
                      <div className="w-[100%] flex justify-start mt-[10px]">
                        <div className="mr-10">
                          <RadiobuttonInput
                            id="careyes"
                            value="yes"
                            name="care"
                            label="Yes"
                            selectedOption={options.care ? "yes" : ""}
                            onChange={() => {
                              setOptions({
                                ...options,
                                care: true,
                              });
                            }}
                            readonly={!edits.present}
                            required
                          />
                        </div>
                        <div className="">
                          <RadiobuttonInput
                            id="careno"
                            value="no"
                            name="care"
                            label="No"
                            selectedOption={!options.care ? "no" : ""}
                            onChange={() => {
                              setOptions({
                                ...options,
                                care: false,
                              });
                            }}
                            readonly={!edits.present}
                            required
                          />
                        </div>
                      </div>
                      <div className="w-[100%] flex justify-between mt-[20px]">
                        <div className="w-[48%]">
                          <TextInput
                            label="Doctor Name"
                            name="caredoctorname"
                            id="doctorname"
                            type="text"
                            onChange={handleInputVal}
                            value={inputs.caredoctorname}
                            disabled={!options.care}
                            readonly={!edits.present}
                            required
                          />
                        </div>
                        <div className="w-[48%]">
                          <TextInput
                            label="Hospital"
                            name="caredoctorhospital"
                            id="hospital"
                            type="text"
                            onChange={handleInputVal}
                            value={inputs.caredoctorhospital}
                            disabled={!options.care}
                            readonly={!edits.present}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-[100%] mb-5 flex flex-col gap-y-[20px] md:flex-row justify-between">
                    <div className="w-[100%] md:w-[100%]">
                      <label className="w-[100%] text-[#f95005]  text-[1.0rem] lg:text-[18px] text-start">
                        Back Pain *
                      </label>
                      <div className="w-[100%] flex justify-start mt-[10px]">
                        <div className="mr-10">
                          <RadiobuttonInput
                            id="painyes"
                            value="yes"
                            name="pain"
                            label="Yes"
                            selectedOption={options.backpain ? "yes" : ""}
                            onChange={() => {
                              setOptions({
                                ...options,
                                backpain: true,
                              });
                            }}
                            readonly={!edits.present}
                            required
                          />
                        </div>
                        <div className="">
                          <RadiobuttonInput
                            id="painno"
                            value="no"
                            name="pain"
                            label="No"
                            selectedOption={!options.backpain ? "no" : ""}
                            onChange={() => {
                              setOptions({
                                ...options,
                                backpain: false,
                              });
                            }}
                            readonly={!edits.present}
                            required
                          />
                        </div>
                      </div>

                      <div className="w-[100%] flex justify-between mt-[20px]">
                        <div className="w-[48%]">
                          <SelectInput
                            id="painscale"
                            name="backpainscale"
                            label="Pain Scale"
                            disabled={!options.backpain || !edits.present}
                            // readonly={!edits.present}
                            required
                            onChange={handleInputVal}
                            value={inputs.backpainscale}
                            options={[
                              { value: "upper", label: "Upper" },
                              { value: "middle", label: "Middle" },
                              { value: "lower", label: "Lower" },
                            ]}
                          />
                        </div>
                        <div className="w-[48%]">
                          <TextInput
                            id="painValue"
                            name="painscaleValue"
                            label="Additional Content (Back Pain)"
                            disabled={!options.backpain}
                            readonly={!edits.present}
                            required
                            value={inputs.BackPainValue}
                            onChange={(e) => handleInputVal(e)}
                            type="text"
                            placeholder="pain value"
                            // value={inputs.email}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-[100%] flex flex-col gap-y-[20px] md:flex-row justify-between">
                    <div className="w-[100%] md:w-[100%]">
                      <label className="w-[100%] text-[#f95005]  text-[1.0rem] lg:text-[18px] text-start">
                        BP *
                      </label>
                      <div className="w-[100%] flex justify-start mt-[10px]">
                        <div className="mr-10">
                          <RadiobuttonInput
                            id="bpyes"
                            value="yes"
                            name="bp"
                            label="Yes"
                            selectedOption={options.ifbp ? "yes" : ""}
                            onChange={() => {
                              setOptions({
                                ...options,
                                ifbp: true,
                              });
                            }}
                            readonly={!edits.present}
                            required
                          />
                        </div>
                        <div className="">
                          <RadiobuttonInput
                            id="bpno"
                            value="no"
                            name="bp"
                            label="No"
                            selectedOption={!options.ifbp ? "no" : ""}
                            onChange={() => {
                              setOptions({
                                ...options,
                                ifbp: false,
                              });
                            }}
                            readonly={!edits.present}
                            required
                          />
                        </div>
                      </div>

                      <div className="w-[100%] flex justify-between mt-[20px]">
                        <div className="w-[48%]">
                          <SelectInput
                            id="bp"
                            name="bp"
                            label="BP"
                            options={[
                              { value: "low", label: "Low" },
                              { value: "high", label: "High" },
                            ]}
                            disabled={!options.ifbp || !edits.present}
                            required
                            value={inputs.bpValue}
                            onChange={(e) => handleInputVal(e)}
                          />
                        </div>
                        <div className="w-[48%]">
                          <TextInput
                            id="bp"
                            name="bpValue"
                            label="BP Value (120/80)"
                            disabled={!options.ifbp}
                            readonly={!edits.present}
                            required
                            type=""
                            value={inputs.bp}
                            onChange={(e) => handleInputVal(e)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Therapy */}
          <div className="basicProfileCont p-10 shadow-lg mt-10">
            <div className="w-[100%] flex justify-between items-center mb-5">
              <div className="text-[1.2rem] lg:text-[25px] font-bold">
                Health Problem History
              </div>
              {edits.therapy ? (
                <button
                  className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                  // onClick={handletherapy}
                  type="submit"
                >
                  Save&nbsp;&nbsp;
                  <i className="text-[15px] pi pi-check"></i>
                </button>
              ) : (
                <div
                  onClick={() => {
                    editform("therapy");
                  }}
                  className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                >
                  Edit&nbsp;&nbsp;
                  <i className="text-[15px] pi pi-pen-to-square"></i>
                </div>
              )}
            </div>
            <div className="w-[100%] flex justify-center items-center">
              <div className="w-[100%] justify-center items-center flex flex-col">
                <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between mb-[20px]">
                  <div className="w-[100%] md:w-[48%]">
                    <TextInput
                      label="Duration of the Problem *"
                      name="therapydurationproblem"
                      id="durationproblem"
                      type="text"
                      onChange={handleInputVal}
                      value={inputs.therapydurationproblem}
                      readonly={!edits.therapy}
                      required
                    />
                  </div>
                  <div className="w-[100%] md:w-[48%]">
                    <TextInput
                      label="Relevant Past History"
                      name="therapypasthistory"
                      id="relevantpasthistory"
                      type="text"
                      onChange={handleInputVal}
                      value={inputs.therapypasthistory}
                      readonly={!edits.therapy}
                    />
                  </div>
                </div>

                <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between">
                  <div className="w-[100%] md:w-[48%]">
                    <TextInput
                      label="Relevant Family History"
                      name="therapyfamilyhistory"
                      id="relevantfamilyhistory"
                      type="text"
                      onChange={handleInputVal}
                      value={inputs.therapyfamilyhistory}
                      readonly={!edits.therapy}
                    />
                  </div>
                  <div className="w-[100%] md:w-[48%]">
                    <TextInput
                      label="Anything else"
                      name="therapyanythingelse"
                      id="anythingelse"
                      type="text"
                      onChange={handleInputVal}
                      value={inputs.therapyanythingelse}
                      readonly={!edits.therapy}
                    />
                  </div>
                </div>
                <div className="w-[90%] md:w-[100%]  mt-[20px]">
                  <label className="w-[100%] text-[#f95005]  text-[1.0rem] lg:text-[18px] text-start">
                    Recent Injuries / Accidents / Surgeries / Fractures /Sprains
                    *
                  </label>
                  <div className="w-[100%] flex justify-start mt-[10px]">
                    <div className="mr-10">
                      <RadiobuttonInput
                        id="breaksyes"
                        value="yes"
                        name="breaks"
                        label="Yes"
                        selectedOption={options.breaks ? "yes" : ""}
                        onChange={() => {
                          setOptions({
                            ...options,
                            breaks: true,
                          });
                        }}
                        readonly={!edits.gendrel}
                        required
                      />
                    </div>
                    <div className="">
                      <RadiobuttonInput
                        id="breaksno"
                        value="no"
                        name="breaks"
                        label="No"
                        selectedOption={!options.breaks ? "no" : ""}
                        onChange={() => {
                          setOptions({
                            ...options,
                            breaks: false,
                          });
                          setInputs({
                            ...inputs,
                            breaksdetails: "",
                            breaksotheractivities: "",
                          });
                        }}
                        readonly={!edits.gendrel}
                        required
                      />
                    </div>
                  </div>
                  <div className="w-[100%] flex flex-col  mt-[20px]">
                    <div className="w-[100%] mb-[20px]">
                      <TextInput
                        label="Details"
                        name="breaksdetails"
                        id="details"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.breaksdetails}
                        disabled={!options.breaks}
                        readonly={!edits.gendrel}
                        required
                      />
                    </div>
                    <div className="w-[100%] mb-[20px]">
                      <TextInput
                        label="Other Activities"
                        name="breaksotheractivities"
                        id="otheractivities"
                        type="text"
                        onChange={handleInputVal}
                        value={inputs.breaksotheractivities}
                        disabled={!options.breaks}
                        readonly={!edits.gendrel}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="w-[100%] flex justify-between">
                  <div className="w-[100%] ">
                    <TextInput
                      label="Anything else"
                      name="genderalanything"
                      id="anythingelse"
                      type="text"
                      onChange={handleInputVal}
                      value={inputs.genderalanything}
                      readonly={!edits.gendrel}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-1"></div>
        </div>
      </div>
    </>
  );
};

export default MedicalTabs;
