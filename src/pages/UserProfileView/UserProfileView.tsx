import React, { useEffect, useState } from "react";
import TextInput from "../../pages/Inputs/TextInput";
import SelectInput from "../../pages/Inputs/SelectInput";
import CheckboxInput from "../../pages/Inputs/CheckboxInput";
import RadiobuttonInput from "../../pages/Inputs/RadiobuttonInput";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./UserProfileView.css";
import CryptoJS from "crypto-js";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
// import { ImUpload2 } from "react-icons/im";
// import { MdDelete } from "react-icons/md";
import { FaEye } from "react-icons/fa";

interface HealthProblemData {
  presentHealthProblem: Record<string, string>;
}

interface Condition {
  label: string;
  value: number;
  checked: number;
}

interface sessionDetails {
  branchId?: string;
  branchName?: string;
  memberTypeId?: string;
  memberTypeName?: string;
  classMode?: string;
  classModeId?: string;
  packageId?: string;
  packageName?: string;
  classTimeId?: string;
  classTime?: string;
}

interface DecryptResult {
  [key: string]: any;
}

interface ModeOfContact {
  [key: number]: string;
}

interface UserProfileEditProps {
  refid: any;
  type?: any;
  viewProfile?: boolean;
}

let userTypeId: any;

const UserProfileView: React.FC<UserProfileEditProps> = ({
  refid,
  type,
  viewProfile,
}) => {
  useEffect(() => {
    userTypeId = localStorage.getItem("refUtId");
    console.log("userTypeId", userTypeId);
  }, []);
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
    pancard: {
      content: "",
    },
    aadhar: {
      content: "",
    },
    certification: {
      content: "",
    },
    refTimeMembersId: "",
    refTimeMembers: "",
    refCustTimeId: "",
    refCustTimeData: "",
    refTime: "",
    refTimeId: "",
    refClassMode: "",
    branch: "",
  });

  const [edits, setEdits] = useState({
    personal: false,
    address: false,
    communitcation: false,
    gendrel: false,
    present: false,
    therapy: false,
    prof: false,
    session: false,
  });

  const [options, setOptions] = useState({
    address: false,
    accident: false,
    breaks: false,
    care: false,
    backpain: false,
  });

  const [_modeofcontact, setModeofContact] = useState<
    ModeOfContact | undefined
  >(undefined);

  const [employeeData, setEmployeeData] = useState({
    refExperence: "",
    refSpecialization: "",
  });
  interface MedDoc {
    refMedDocId: number;
    refStId: number;
    refMedDocName: string;
    refMedDocPath: string;
    refMedDocFile: {
      filename: string;
      content: string; // Base64 string
      contentType: string; // MIME type
    };
  }
  const [medDocData, setMedDocData] = useState<MedDoc[]>([]);

  const [sessionData, setSessionData] = useState<sessionDetails>();
  const [branchList, setBranchList] = useState([]);
  const [userAge, setUserAge] = useState();
  const [refStId, setRefStId] = useState();
  const [sessionUpdate, setSessionUpdate] = useState<number>(1);
  const [sessionUpdateLoad, setSessionUpdateLoad] = useState(false);
  const branchOptions = Object.entries(branchList).map(([value, label]) => ({
    value, // Key (e.g., '1')
    label, // Value (e.g., 'Chennai')
  }));
  const [memberList, setMemberList] = useState([]);

  const memberlistOptions = Object.entries(memberList).map(
    ([value, label]) => ({
      value, // Key (e.g., '1')
      label, // Value (e.g., 'Chennai')
    })
  );
  const [sessiontype, setSessionType] = useState([]);

  const sessionTypeOption = Object.entries(sessiontype).map(
    ([value, label]) => ({
      value, // Key (e.g., '1')
      label, // Value (e.g., 'Chennai')
    })
  );
  const [preferTiming, setpreferTiming] = useState([]);

  const preferTimingOption = Object.entries(preferTiming).map(
    ([value, label]) => ({
      value, // Key (e.g., '1')
      label, // Value (e.g., 'Chennai')
    })
  );
  // const [edits, setEdits] = useState({
  //   session: false,
  // });

  const handlePreviewDocument = (dataArray: any, index: number) => {
    console.log("dataArray", dataArray);
    const file = dataArray[index]?.refMedDocFile;
    console.log("file", file);
    if (file) {
      try {
        const binaryContent = atob(file.content);
        const byteArray = new Uint8Array(binaryContent.length);
        for (let i = 0; i < binaryContent.length; i++) {
          byteArray[i] = binaryContent.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: file.contentType });
        const url = URL.createObjectURL(blob);
        let content;
        if (file.contentType == "application/pdf") {
          content = `<iframe src="${url}" width="100%" height="450px" style="border: none;"></iframe>`;
        } else {
          content = `<img src="${url}" alt="Document Preview" style="max-width: 100%; max-height: 450px; object-fit: contain; display: block; margin: 0 auto;">`;
        }
        const targetDiv = document.getElementById("target-container");

        Swal.fire({
          title: "Medical Document Preview",
          html: `
          <div style="display: flex; justify-content:center;align-item:center;">     
          ${content} 
          </div>
            <div style="margin-top: 10px; text-align: center; width: 100%; display: flex; justify-content: center;">
              <a href="${url}" download="document.pdf" style="padding: 10px 20px; width: 80%; background-color: #f95005; color: white; text-decoration: none; border-radius: 4px; text-align: center;">
                Download
              </a>
            </div>
          `,
          showCloseButton: true,
          showConfirmButton: false,
          target: targetDiv,
          customClass: {
            title: "custom-title",
            popup: "custom-popup",
          },
        });
      } catch (error) {
        console.error("Error previewing document:", error);
      }
    } else {
      console.error("No file to preview");
    }
  };

  const getProfileData = () => {
    let url = "/user/profileData";

    if (type === "staff") {
      url = "/staff/ProfileData";
    }

    Axios.post(
      import.meta.env.VITE_API_URL + url,
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

      console.log(
        "UserData Running ----------------------------------------- 318"
      );
      console.log(data);

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      if (type === "staff") {
        setEmployeeData({
          refExperence: data.data.EmployeeData.refExperence,
          refSpecialization: data.data.EmployeeData.refSpecialization,
        });
      } else {
        const healthConditions = Object.entries(
          (data.data as HealthProblemData).presentHealthProblem
        ).map(
          ([value, label]): Condition => ({
            label, // Label as string
            value: Number(value), // Ensure value is a number
            checked: 0, // Default checked value
          })
        );

        const updatedConditions = healthConditions.map((condition) => {
          // Check if the condition value is in `presenthealth.refPresentHealth`
          if (
            data.data.presentHealth.refPresentHealth.includes(condition.value)
          ) {
            return {
              ...condition,
              checked: 1, // Set `checked` to 1 if value matches
            };
          }
          return condition; // Return as is if no match
        });

        // Step 3: Set the final updated conditions in state
        setConditions(updatedConditions);
      }

      // Step 2: Update the mapped conditions to set `checked` to 1 if value matches

      setModeofContact(data.data.modeOfCommunication);

      console.log(data.data);

      const personaldata = data.data.personalData;
      const addressdata = data.data.address;
      const communication = data.data.communication;
      const generalhealth = data.data.generalhealth;
      const presenthealth = data.data.presentHealth;
      const refSessionData = data.data.refSessionData;

      setOptions({
        ...options,
        address: addressdata.addresstype,
        accident: type === "staff" ? "" : generalhealth.refRecentInjuries,
        breaks: type === "staff" ? "" : generalhealth.refRecentFractures,
        care: type === "staff" ? "" : presenthealth.refUnderPhysicalCare,
        backpain:
          type === "staff"
            ? false
            : presenthealth.refBackPain === "no"
            ? false
            : true,
      });
      setUserAge(personaldata.refStAge);
      setRefStId(personaldata.refStId);
      const session = {
        branchId: "",
        branchName: personaldata.refBranchName,
        memberTypeId: "",
        memberTypeName: personaldata.refTimeMembers,
        classModeId: "",
        classMode: personaldata.refClassMode,
        packageId: "",
        packageName: personaldata.refPackageName,
        classTimeId: "",
        classTime: personaldata.refTime,
      };

      console.log("######################>", personaldata);

      setSessionData(session);

      setInputs({
        profilefile: data.data.profileFile,
        fname: personaldata.refStFName,
        lname: personaldata.refStLName,
        dob: personaldata.refStDOB,
        age: personaldata.refStAge,
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
        branch: personaldata.refBranchId,
        email: communication.refCtEmail,
        phoneno: communication.refCtMobile,
        whatsappno: communication.refCtWhatsapp,
        mode: communication.refUcPreference,
        height: type === "staff" ? "" : generalhealth.refHeight,
        weight: type === "staff" ? "" : generalhealth.refWeight,
        bloodgroup: type === "staff" ? "" : generalhealth.refBlood,
        bmi: type === "staff" ? "" : generalhealth.refBMI,
        bp: type === "staff" ? "" : generalhealth.refBP,
        accidentdetails:
          type === "staff" ? "" : generalhealth.refRecentInjuriesReason,
        breaksdetails:
          type === "staff" ? "" : generalhealth.refRecentFracturesReason,
        breaksotheractivities: type === "staff" ? "" : generalhealth.refOthers,
        genderalanything: type === "staff" ? "" : generalhealth.refElse,
        pastother: type === "staff" ? "" : presenthealth.refPastHistory,
        pastmedicaldetails:
          type === "staff" ? "" : presenthealth.refMedicalDetails,
        caredoctorname: type === "staff" ? "" : presenthealth.refDoctor,
        caredoctorhospital: type === "staff" ? "" : presenthealth.refHospital,
        backpainscale: type === "staff" ? "" : presenthealth.refBackPain,
        therapydurationproblem:
          type === "staff" ? "" : presenthealth.refProblem,
        therapypasthistory:
          type === "staff" ? "" : presenthealth.refPastHistory,
        therapyfamilyhistory:
          type === "staff" ? "" : presenthealth.refFamilyHistory,
        therapyanythingelse:
          type === "staff" ? "" : presenthealth.refAnythingelse,
        pancard: data.data.employeeDocuments
          ? data.data.employeeDocuments.panCard
          : "",
        aadhar: data.data.employeeDocuments
          ? data.data.employeeDocuments.AadharCard
          : "",
        certification: data.data.employeeDocuments
          ? data.data.employeeDocuments.Certification
          : "",
        refTimeMembersId:
          type === "staff" ? "" : refSessionData.refTimeMembersId,
        refTimeMembers: type === "staff" ? "" : refSessionData.refTimeMembers,
        refCustTimeId: type === "staff" ? "" : refSessionData.refCustTimeId,
        refCustTimeData: type === "staff" ? "" : refSessionData.refCustTimeData,
        refTime: type === "staff" ? "" : refSessionData.refTime,
        refTimeId: type === "staff" ? "" : refSessionData.refTimeId,
        refClassMode: type === "staff" ? "" : refSessionData.refClassMode,
      });
      if (data.Documents && Array.isArray(data.Documents)) {
        setMedDocData(data.Documents);
      }
    });
  };

  useEffect(() => {
    fetchSessionOptions();
    getProfileData();
  }, []);

  const calculateAge = (dob: string) => {
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < dobDate.getDate())
    ) {
      age--;
    }

    return age.toString();
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

  const fetchSessionOptions = async () => {
    Axios.get(import.meta.env.VITE_API_URL + "/profile/passRegisterData", {
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
        }
        console.log("--------------  229", data);

        if (data.success) {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
          setBranchList(data.data.branchList);
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.error("Error: ", err);
      });
  };

  const fetchMemberTypeOptions = async () => {
    console.log("sessionData?.branchId", sessionData?.branchId);
    console.log("userAge", userAge);
    Axios.post(
      import.meta.env.VITE_API_URL + "/profile/MemberList",
      {
        branchId: sessionData?.branchId || 1,
        refAge: userAge,
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
        console.log("data line ------ 275", data);
        if (data.token == false) {
          navigate("/expired");
        } else {
          setMemberList(data.data); // Make sure this updates memberList
        }
        // setpreferTiming([]);
        // setSessionType([]);
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  };

  const fetchPackageOptions = async () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/profile/sectionTime",
      {
        sectionId: parseInt(
          (sessionData as { memberTypeId: string }).memberTypeId
        ),
        branch: parseInt((sessionData as { branchId: string }).branchId),
        classType: parseInt(sessionData?.classMode == "Online" ? "1" : "2"),
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
        console.log("data line ----------- 320", data);
        if (data.token == false) {
          navigate("/expired");
        } else {
          setSessionType(data.SectionTime);
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.error("Error: ", err);
      });
  };

  const fetchTimingOptions = async (value: any) => {
    console.log("sessionData", value);
    Axios.post(
      import.meta.env.VITE_API_URL + "/profile/PackageTime",
      {
        packageId: parseInt(value),
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
        if (data.token == false) {
          navigate("/expired");
        } else {
          setpreferTiming(data.packageTiming);
        }
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  };

  const updateSessionData = async () => {
    setSessionUpdateLoad(true);
    try {
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + "/profile/SessionUpdate",
        {
          refStId: refStId,
          personalData: {
            refClassMode: parseInt(
              (sessionData as { classModeId: string }).classModeId
            ),
            refSessionMode: parseInt(
              (sessionData as { packageId: string }).packageId
            ),
            refTimingId: parseInt(
              (sessionData as { classTimeId: string }).classTimeId
            ),
            refSPreferTimeId: parseInt(
              (sessionData as { classTimeId: string }).classTimeId
            ),
            refSessionType: parseInt(
              (sessionData as { memberTypeId: string }).memberTypeId
            ),
            refBranchId: parseInt(
              (sessionData as { branchId: string }).branchId
            ),
          },
        },
        {
          headers: {
            Authorization: localStorage.getItem("JWTtoken"),
            "Content-Type": "application/json",
          },
        }
      );
      const data = decrypt(
        response.data[1],
        response.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );
      console.log("Data received:", data);
      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setEdits({
          ...edits,
          session: false,
        });
      }
    } catch (error) {
      console.error("Error updating session data:", error);
      // Handle error (e.g., showing an error message)
    } finally {
      getProfileData();
      setSessionUpdateLoad(false);
      // fetchCustomers();
    }
  };
  return (
    <>
      <div className="bg-[#fff]" id="target-container">
        <div className="py-1" />

        <TabView className="">
          <TabPanel header="Profile">
            <div className="">
              {/* Personal Information */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlepersonalinfo();
                }}
              >
                <div className="basicProfileCont p-10 shadow-lg w-[100%]">
                  <div className="w-[100%] flex justify-between items-center mb-5">
                    <div className="text-[1.2rem] lg:text-[25px] font-bold">
                      Personal Information
                    </div>
                    {/* {edits.personal ? (
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
                      editform("personal");
                    }}
                    className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                  >
                    Edit&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-pen-to-square"></i>
                  </div>
                )} */}
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

                      {/* <div className="w-[250px] flex flex-col justify-center items-center">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/png, image/jpeg" // Only accept PNG and JPG
                      onChange={handleImageChange} // Handle file change
                    />

                    {loading.changeimg ? (
                      <label className="w-[250px] bg-[#f95005] hover:bg-[#e14b04] focus:outline-none border-none py-2 px-4 rounded font-normal text-white text-[1.2rem] lg:text-[18px] text-center mt-4 cursor-pointer">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-labelledby="title-04a desc-04a"
                          aria-live="polite"
                          aria-busy="true"
                          className="w-[14px] h-[14px] animate animate-spin"
                        >
                          <title id="title-04a">Icon title</title>
                          <desc id="desc-04a">Some desc</desc>
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            className="stroke-grey-200"
                            stroke-width="4"
                          />
                          <path
                            d="M12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2"
                            className="stroke-white"
                            stroke-width="4"
                          />
                        </svg>
                      </label>
                    ) : (
                      <label
                        htmlFor="file-upload"
                        className="w-[250px] bg-[#f95005] hover:bg-[#e14b04] focus:outline-none border-none py-2 px-4 rounded font-normal text-white text-[1.2rem] lg:text-[18px] text-center mt-4 cursor-pointer"
                      >
                        Change Image
                      </label>
                    )}
                  </div> */}
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
                          <div className="w-[48%]">
                            <TextInput
                              label="Date of Birth *"
                              name="dob"
                              id="dob"
                              type="date"
                              onChange={handleInputVal}
                              value={inputs.dob}
                              readonly={!edits.personal}
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
                              label="Father / Husband Name *"
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
                              disabled={!edits.personal}
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
                                inputs.maritalstatus === "married"
                                  ? false
                                  : true
                              }
                              readonly={!edits.personal}
                              value={inputs.anniversarydate}
                              required
                            />
                          </div>
                        </div>

                        <div className="w-[100%] flex justify-between">
                          <div
                            className={
                              type === "staff" ? "w-[100%]" : "w-[48%]"
                            }
                          >
                            <TextInput
                              label="Qualification *"
                              name="qualification"
                              id="qualification"
                              type="text"
                              onChange={handleInputVal}
                              value={inputs.qualification}
                              readonly={!edits.personal}
                              required
                            />
                          </div>
                          {type === "staff" ? null : (
                            <div className="w-[48%]">
                              <TextInput
                                label="Occupation *"
                                name="occupation"
                                id="Occupation"
                                type="text"
                                onChange={handleInputVal}
                                value={inputs.occupation}
                                readonly={!edits.personal}
                                required
                              />
                            </div>
                          )}
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
                    {/* {edits.address ? (
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
                      editform("address");
                    }}
                    className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                  >
                    Edit&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-pen-to-square"></i>
                  </div>
                )} */}
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
                              readonly={!edits.address}
                              value={inputs.perstreetname}
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
                    {/* {edits.communitcation ? (
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
                      editform("communitcation");
                    }}
                    className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                  >
                    Edit&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-pen-to-square"></i>
                  </div>
                )} */}
                  </div>
                  <div className="w-[100%] flex flex-col justify-center items-center">
                    <div className="w-[100%] flex justify-between mb-[20px]">
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
                    </div>
                    <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between mb-[20px]">
                      <div className="w-[100%] md:w-[48%]">
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
                      <div className="w-[100%] md:w-[48%] flex justify-between">
                        <div className="w-[65%] md:w-[100%]">
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
                        {/* <div
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
                    </div> */}
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

              {type === "staff" ? (
                <>
                  <div className="basicProfileCont mt-10 p-[20px] lg:p-[40px] shadow-lg">
                    <div className="w-[100%] flex justify-between items-center mb-5">
                      <div className="text-[1rem] lg:text-[25px] font-bold">
                        Documentation
                      </div>
                    </div>
                    <div className="w-[100%] flex flex-col justify-center items-center">
                      <div className="w-[100%] flex flex-col lg:flex-row gap-3 justify-between mb-[20px]">
                        <div className="w-[100%] lg:w-[30%]">
                          <div className="w-[100%] flex flex-col gap-1">
                            <label className="text-[14px] text-[#f95005] font-medium font-mont leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Aadhaar Card *
                            </label>
                            {inputs.aadhar ? (
                              <Button
                                type="button"
                                severity="success"
                                onClick={() => {
                                  // Assuming `content` is your base64 string for the PDF file
                                  const content = inputs.aadhar.content;
                                  const filename = "AadhaarCard.pdf";

                                  // Decode base64 to binary and create a Blob
                                  const byteCharacters = atob(content);
                                  const byteNumbers = new Array(
                                    byteCharacters.length
                                  );
                                  for (
                                    let i = 0;
                                    i < byteCharacters.length;
                                    i++
                                  ) {
                                    byteNumbers[i] =
                                      byteCharacters.charCodeAt(i);
                                  }
                                  const byteArray = new Uint8Array(byteNumbers);
                                  const blob = new Blob([byteArray], {
                                    type: "application/pdf",
                                  });

                                  // Create a download link and trigger it
                                  const link = document.createElement("a");
                                  link.href = URL.createObjectURL(blob);
                                  link.download = filename;
                                  link.click();

                                  // Release memory
                                  URL.revokeObjectURL(link.href);
                                }}
                                label="Download"
                              />
                            ) : (
                              <label>No Documents Upload</label>
                            )}
                          </div>
                        </div>

                        <div className="w-[100%] lg:w-[30%]">
                          <div className="w-[100%] flex flex-col gap-1">
                            <label className="text-[14px] text-[#f95005] font-medium font-mont leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Pan Card *
                            </label>
                            {inputs.pancard ? (
                              <Button
                                type="button"
                                severity="success"
                                onClick={() => {
                                  // Assuming `content` is your base64 string for the PDF file
                                  const content = inputs.pancard.content;
                                  const filename = "PanCard.pdf";

                                  // Decode base64 to binary and create a Blob
                                  const byteCharacters = atob(content);
                                  const byteNumbers = new Array(
                                    byteCharacters.length
                                  );
                                  for (
                                    let i = 0;
                                    i < byteCharacters.length;
                                    i++
                                  ) {
                                    byteNumbers[i] =
                                      byteCharacters.charCodeAt(i);
                                  }
                                  const byteArray = new Uint8Array(byteNumbers);
                                  const blob = new Blob([byteArray], {
                                    type: "application/pdf",
                                  });

                                  // Create a download link and trigger it
                                  const link = document.createElement("a");
                                  link.href = URL.createObjectURL(blob);
                                  link.download = filename;
                                  link.click();

                                  // Release memory
                                  URL.revokeObjectURL(link.href);
                                }}
                                label="Download"
                              />
                            ) : (
                              <label>No Documents Upload</label>
                            )}
                          </div>
                        </div>

                        <div className="w-[100%] lg:w-[30%]">
                          <div className="w-[100%] flex flex-col gap-1">
                            <label className="text-[14px] text-[#f95005] font-medium font-mont leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Certification *
                            </label>
                            {inputs.certification ? (
                              <Button
                                type="button"
                                severity="success"
                                onClick={() => {
                                  // Assuming `content` is your base64 string for the PDF file
                                  const content = inputs.certification.content;
                                  const filename = "Certification.pdf";

                                  // Decode base64 to binary and create a Blob
                                  const byteCharacters = atob(content);
                                  const byteNumbers = new Array(
                                    byteCharacters.length
                                  );
                                  for (
                                    let i = 0;
                                    i < byteCharacters.length;
                                    i++
                                  ) {
                                    byteNumbers[i] =
                                      byteCharacters.charCodeAt(i);
                                  }
                                  const byteArray = new Uint8Array(byteNumbers);
                                  const blob = new Blob([byteArray], {
                                    type: "application/pdf",
                                  });

                                  // Create a download link and trigger it
                                  const link = document.createElement("a");
                                  link.href = URL.createObjectURL(blob);
                                  link.download = filename;
                                  link.click();

                                  // Release memory
                                  URL.revokeObjectURL(link.href);
                                }}
                                label="Download"
                              />
                            ) : (
                              <label>No Documents Upload</label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="basicProfileCont mt-10 p-[20px] lg:p-[40px] shadow-lg">
                    <div className="w-[100%] flex justify-between items-center mb-5">
                      <div className="text-[1rem] lg:text-[25px] font-bold">
                        Professional Experience
                      </div>
                    </div>
                    <div className="w-[100%] flex flex-col justify-center items-center">
                      <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                        <div className="w-[100%] lg:w-[48%]">
                          <TextInput
                            label="Year of Experience"
                            name="yearexprience"
                            id="yearexprience"
                            type="number"
                            onChange={(e) => {
                              setEmployeeData({
                                ...employeeData,
                                refExperence: e.target.value,
                              });
                            }}
                            value={employeeData.refExperence}
                            readonly={!edits.prof}
                          />
                        </div>
                        <div className="w-[100%] lg:w-[48%]">
                          <TextInput
                            label="Specialization"
                            name="specialization"
                            id="specialization"
                            type="text"
                            onChange={(e) => {
                              setEmployeeData({
                                ...employeeData,
                                refSpecialization: e.target.value,
                              });
                            }}
                            value={employeeData.refSpecialization}
                            readonly={!edits.prof}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}

              <div className="py-1"></div>
            </div>
          </TabPanel>

          {viewProfile && (
            <>
              <TabPanel header="Medical details ">
                <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                  <div className="w-[100%] flex justify-between items-center mb-5">
                    <div className="text-[1rem] lg:text-[25px] font-bold">
                      Documentation
                    </div>
                  </div>

                  <div className="w-[100%] flex justify-center items-center">
                    <div className="flex flex-wrap  items-center w-[100%]">
                      {medDocData.map((doc, index) => (
                        <div
                          key={doc.refMedDocId}
                          className="lg:basis-1/3 basis-full flex items-center justify-start lg:p-2 hover:border-2 border-[#f95005]"
                        >
                          <div className="lg:mr-5 mr-2">
                            <FaEye
                              className="w-[30px] h-[25px] text-[#f95005] cursor-pointer"
                              onClick={() =>
                                handlePreviewDocument(medDocData, index)
                              }
                            />
                          </div>
                          <div className="">
                            <h3 className="text-[20px]">{doc.refMedDocName}</h3>
                            {/* Display refMedDocName */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

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
                      {/* {edits.gendrel ? (
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
                      editform("gendrel");
                    }}
                    className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                  >
                    Edit&nbsp;&nbsp;
                    <i className="text-[15px] pi pi-pen-to-square"></i>
                  </div>
                )} */}
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
                            readonly={!edits.gendrel}
                          />
                        </div>
                      </div>

                      <div className="w-[100%] flex justify-between mb-[20px]">
                        <div className="w-[100%]">
                          <TextInput
                            label="BP"
                            name="bp"
                            id="bp"
                            type="number"
                            onChange={handleInputVal}
                            value={inputs.bp}
                            readonly={!edits.gendrel}
                          />
                        </div>
                      </div>

                      <div className="w-[100%] flex flex-col md:flex-row gap-y-[25px] justify-between mb-[25px]">
                        <div className="w-[100%] md:w-[48%]">
                          <label className="w-[100%] text-[#f95005]  text-[1.0rem] lg:text-[18px] text-start">
                            Recent injuries / Accidents / Operations *{" "}
                          </label>
                          <div className="w-[100%] flex justify-start mt-[10px]">
                            <div className="mr-10 ">
                              <RadiobuttonInput
                                id="accidentyes"
                                value="yes"
                                name="accident"
                                selectedOption={options.accident ? "yes" : ""}
                                onChange={() => {
                                  setOptions({
                                    ...options,
                                    accident: true,
                                  });
                                }}
                                label="Yes"
                                readonly={!edits.gendrel}
                                required
                              />
                            </div>
                            <div className="">
                              <RadiobuttonInput
                                id="accidentno"
                                value="no"
                                name="accident"
                                label="No"
                                onChange={() => {
                                  setOptions({
                                    ...options,
                                    accident: false,
                                  });

                                  setInputs({
                                    ...inputs,
                                    accidentdetails: "",
                                  });
                                }}
                                selectedOption={!options.accident ? "no" : ""}
                                readonly={!edits.gendrel}
                                required
                              />
                            </div>
                          </div>
                          <div className="w-[100%] mt-[20px]">
                            <div className="w-[100%]">
                              <TextInput
                                label="Details"
                                name="accidentdetails"
                                id="details"
                                type="text"
                                onChange={handleInputVal}
                                value={inputs.accidentdetails}
                                disabled={!options.accident}
                                readonly={!edits.gendrel}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="w-[100%] md:w-[48%]">
                          <label className="w-[100%] text-[#f95005]  text-[1.0rem] lg:text-[18px] text-start">
                            Recent breaks / Fractures / Sprains *
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
                          <div className="w-[100%] flex justify-between mt-[20px]">
                            <div className="w-[48%]">
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
                            <div className="w-[48%]">
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
                      </div>

                      <div className="w-[100%] flex justify-between">
                        <div className="w-[100%]">
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
                </form>

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

                        <div className="w-[100%] flex flex-col gap-y-[20px] md:flex-row justify-between">
                          <div className="w-[100%] md:w-[48%]">
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
                          <div className="w-[100%] md:w-[48%]">
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

                            <div className="w-[100%] mt-[20px]">
                              <div className="w-[100%]">
                                <SelectInput
                                  id="painscale"
                                  name="backpainscale"
                                  label="Pain Scale"
                                  onChange={handleInputVal}
                                  value={inputs.backpainscale}
                                  options={[
                                    { value: "upper", label: "Upper" },
                                    { value: "middle", label: "Middle" },
                                    { value: "lower", label: "Lower" },
                                  ]}
                                  disabled={!options.backpain || !edits.present}
                                  required
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
                  </div>
                  <div className="w-[100%] flex justify-center items-center">
                    <div className="w-[100%] justify-center items-center flex flex-col">
                      <div className="w-[100%] flex flex-col md:flex-row gap-y-[20px] justify-between mb-[20px]">
                        <div className="w-[100%] md:w-[48%]">
                          <TextInput
                            label="Duration of the Problem"
                            name="therapydurationproblem"
                            id="durationproblem"
                            type="text"
                            onChange={handleInputVal}
                            value={inputs.therapydurationproblem}
                            readonly={!edits.therapy}
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
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel header="Session details">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateSessionData();
                  }}
                >
                  <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                    <div className="w-[100%] flex justify-between items-center mb-5">
                      <div className="text-[1.2rem] lg:text-[25px] font-bold">
                        Yoga class
                      </div>
                      {edits.session ? (
                        <button
                          className={`text-[15px] outline-none py-2 border-none px-3 font-bold cursor-pointer text-white rounded ${
                            sessionUpdateLoad
                              ? "bg-gray-500 cursor-not-allowed"
                              : "bg-[#f95005]"
                          }`}
                          type="submit"
                          disabled={sessionUpdateLoad}
                        >
                          {sessionUpdateLoad ? (
                            <>
                              Loading&nbsp;&nbsp;
                              <i className="pi pi-spin pi-spinner text-[15px]"></i>
                            </>
                          ) : (
                            <>
                              Save&nbsp;&nbsp;
                              <i className="text-[15px] pi pi-check"></i>
                            </>
                          )}
                        </button>
                      ) : (
                        <div
                          onClick={() => {
                            setEdits({
                              ...edits,
                              session: true,
                            });
                          }}
                          className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                        >
                          Edit&nbsp;&nbsp;
                          <i className="text-[15px] pi pi-pen-to-square"></i>
                        </div>
                      )}
                    </div>
                    <div className="w-[100%] flex justify-center items-center">
                      {!edits.session ? (
                        <div className="w-[100%] justify-center items-center flex flex-col">
                          <div className="w-[100%] flex flex-row lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                            <div className="w-[100%] lg:w-[30%]">
                              <TextInput
                                label="Branch *"
                                name="branchName"
                                id="branch"
                                type="text"
                                value={sessionData?.branchName}
                                readonly
                              />
                            </div>
                            <div className="w-[100%] lg:w-[30%]">
                              <TextInput
                                label="Member Type *"
                                name="memberTypeName"
                                id="mtype"
                                type="text"
                                value={sessionData?.memberTypeName}
                                readonly
                              />
                            </div>
                            <div className="w-[100%] lg:w-[30%]">
                              <TextInput
                                label="Class Mode *"
                                name="classMode"
                                id="mtype"
                                type="text"
                                value={
                                  sessionData?.classMode === "1"
                                    ? "Online"
                                    : "Offline"
                                }
                                readonly
                              />
                            </div>
                          </div>
                          <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between">
                            <div className="w-[100%] lg:w-[48%]">
                              <TextInput
                                label="Package Name *"
                                id="mtype"
                                name="packageName"
                                type="text"
                                value={sessionData?.packageName}
                                readonly
                              />
                            </div>
                            <div className="w-[100%] lg:w-[48%]">
                              <TextInput
                                label="Class Timing *"
                                id="mtype"
                                name="classTime"
                                type="text"
                                value={sessionData?.classTime}
                                readonly
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-[100%] justify-center items-center flex flex-col">
                          <div className="w-[100%] flex flex-row lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                            <div className="w-[30%]">
                              <SelectInput
                                id="branch"
                                name="branchId"
                                label="Branch *"
                                options={branchOptions}
                                required
                                value={sessionData?.branchId || ""}
                                onChange={(e) => {
                                  setSessionUpdate(2);
                                  fetchMemberTypeOptions();
                                  const { name, value } = e.target;
                                  setSessionData((prevData) => ({
                                    ...prevData,
                                    [name]: value,
                                    memberTypeId: "",
                                    classModeId: "",
                                    packageId: "",
                                    classTimeId: "",
                                  }));
                                }}
                              />
                            </div>
                            <div className="w-[30%]">
                              <SelectInput
                                id="membertype"
                                name="memberTypeId"
                                label="Member Type *"
                                options={memberlistOptions}
                                disabled={sessionUpdate <= 1}
                                required
                                value={sessionData?.memberTypeId || ""}
                                onChange={(e) => {
                                  setSessionUpdate(3);
                                  const { name, value } = e.target;
                                  setSessionData((prevData) => ({
                                    ...prevData,
                                    [name]: value,
                                    classModeId: "",
                                    packageId: "",
                                    classTimeId: "",
                                  }));
                                }}
                              />
                            </div>
                            <div className="w-[30%]">
                              <SelectInput
                                id="classtype"
                                name="classModeId"
                                label="Class Type *"
                                options={[
                                  { value: "1", label: "Online" },
                                  { value: "2", label: "Offline" },
                                ]}
                                disabled={sessionUpdate <= 2}
                                required
                                value={sessionData?.classModeId || ""}
                                onChange={(e) => {
                                  setSessionUpdate(4);
                                  fetchPackageOptions();
                                  const { name, value } = e.target;
                                  setSessionData((prevData) => ({
                                    ...prevData,
                                    [name]: value,
                                    packageId: "",
                                    classTimeId: "",
                                  }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between">
                            <div className="w-[48%]">
                              <SelectInput
                                id="classtype"
                                name="packageId"
                                label="Class Package *"
                                options={sessionTypeOption}
                                disabled={sessionUpdate <= 3}
                                required
                                value={sessionData?.packageId || ""}
                                onChange={(e) => {
                                  setSessionUpdate(5);
                                  fetchTimingOptions(e.target.value);
                                  const { name, value } = e.target;
                                  console.log("value", value);
                                  console.log("name", name);

                                  setSessionData((prevData) => ({
                                    ...prevData,
                                    [name]: value,
                                    classTimeId: "",
                                  }));
                                }}
                              />
                            </div>
                            <div className="w-[48%]">
                              <SelectInput
                                id="classtype"
                                name="classTimeId"
                                label="Class Timing *"
                                options={preferTimingOption}
                                disabled={sessionUpdate <= 4}
                                required
                                value={sessionData?.classTimeId || ""}
                                onChange={(e) => {
                                  console.log("session Data", sessionData);
                                  setSessionUpdate(6);
                                  const { name, value } = e.target;
                                  setSessionData((prevData) => ({
                                    ...prevData,
                                    [name]: value,
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </TabPanel>
            </>
          )}
        </TabView>
      </div>
    </>
  );
};

export default UserProfileView;
