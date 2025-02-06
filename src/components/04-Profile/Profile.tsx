import React, { useEffect, useState } from "react";

import "./Profile.css";
import TextInput from "../../pages/Inputs/TextInput";
import SelectInput from "../../pages/Inputs/SelectInput";
import CheckboxInput from "../../pages/Inputs/CheckboxInput";
import RadiobuttonInput from "../../pages/Inputs/RadiobuttonInput";
import Axios from "axios";
import { Button } from "primereact/button";
import { ImUpload2 } from "react-icons/im";
import { Skeleton } from "primereact/skeleton";
import { FaEye } from "react-icons/fa";
import CryptoJS from "crypto-js";
import PasswordInput from "../../pages/Inputs/PasswordInput";
import ErrorMessage from "../../pages/Messages/ErrorMessage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";


interface HealthProblemData {
  presentHealthProblem: Record<string, string>;
}

interface Condition {
  label: string;
  value: number;
  checked: number;
}

type DecryptResult = any;

interface ModeOfContact {
  [key: number]: string;
}

const Profile: React.FC = () => {
  const [_formVisible, setFormVisible] = useState(false);
  const navigate = useNavigate();

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
  const [medicalIssue, setMedicalIssue] = useState<boolean>(false)

  const handleCheckboxChange = (index: any) => {
    setConditions((prevConditions: any) =>
      prevConditions.map((condition: any, i: any) =>
        i === index
          ? { ...condition, checked: condition.checked === 1 ? 0 : 1 }
          : condition
      )
    );
  };

  const [pageLoading, setPageLoading] = useState({
    verifytoken: true,
    pageData: true,
  });

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
    emergencyno:"",
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
    BackPainValue: "",
    ifbp: "",
    bpValue: "",
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
  });

  const [passwordInputs, setPasswordInputs] = useState({
    currentpass: "",
    newpass: "",
    confirmpass: "",
  });

  const handleInputPass = (event: any) => {
    setPasswordError({
      status: false,
      message: "",
    });
    const { name, value } = event.target;

    setPasswordInputs({
      ...passwordInputs,
      [name]: value,
    });
  };

  const [edits, setEdits] = useState({
    personal: false,
    address: false,
    communitcation: false,
    medicalIssue: false,
    gendrel: false,
    present: false,
    therapy: false,
    document: false,
    prof: false,
    medDoc: false,
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
    medicalIssue: false,
    bpValue: false,
    ifbp: false,
  });

  const [userdata, setuserdata] = useState({
    username: "",
    usernameid: "",
    profileimg: { contentType: "", content: "" },
  });



  useEffect(() => {
    Axios.get(import.meta.env.VITE_API_URL + "/validateTokenData", {
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
      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

        if (data.success) {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
          setuserdata({
            username:
              "" + data.data[0].refStFName + " " + data.data[0].refStLName + "",
            usernameid: data.data[0].refusertype,
            profileimg: data.profileFile,
          });

          setPageLoading({
            ...pageLoading,
            verifytoken: false,
          });
        } else {
          navigate("/expired");
        }

        setuserdata({
          username:
            "" + data.data[0].refStFName + " " + data.data[0].refStLName + "",
          usernameid: data.data[0].refusertype,
          profileimg: data.profileFile,
        });

        setPageLoading({
          ...pageLoading,
          verifytoken: false,
        });
      }
      console.log("Verify Token  Running --- ");
    });
  }, []);

  const [_modeofcontact, setModeofContact] = useState<
    ModeOfContact | undefined
  >(undefined);

  const [employeeData, setEmployeeData] = useState({
    refExperence: "",
    refSpecialization: "",
  });

  const getData = async () => {
    let url = "/staff/ProfileData";
    const id = localStorage.getItem("refUtId");

    if (id === "5" || id === "6") {
      url = "/user/profileData";
    }

    Axios.post(
      import.meta.env.VITE_API_URL + url,
      { refStId: null },
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
        console.log("data.token", data.token);
        navigate("/expired");
      } else {
        console.log("UserData Running --- ");
        console.log(data);

        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

        if (data.data.presentHealth) {
          const healthConditions = Object.entries(
            (data.data as HealthProblemData).presentHealthProblem
          ).map(
            ([value, label]): Condition => ({
              label,
              value: Number(value),
              checked: 0,
            })
          );

          const updatedConditions = healthConditions.map((condition) => {
            console.log("healthConditions", healthConditions);
            if (data.data.presentHealth.refPresentHealth == null) {
              return condition;
            }
            if (
              data.data.presentHealth.refPresentHealth.includes(condition.value)
            ) {
              return {
                ...condition,
                checked: 1,
              };
            }
            return condition;
          });
          setConditions(updatedConditions);
        } else {
          setEmployeeData({
            refExperence: data.data.EmployeeData.refExperence,
            refSpecialization: data.data.EmployeeData.refSpecialization,
          });
        }

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
          address: addressdata ? addressdata.addresstype : false,
          accident: generalhealth ? generalhealth.refRecentFractures : false,
          breaks: generalhealth ? generalhealth.refRecentInjuries : false,
          care: presenthealth ? presenthealth.refUnderPhysicalCare : false,
          backpain: presenthealth
            ? presenthealth.refBackPain === "no"
              ? false
              : true
            : false,
          ifbp: generalhealth ? generalhealth.refIfBP === "no"
            ? false
            : true
            : false,
        });

        if (personaldata.refHealthIssue) {
          setMedicalIssue(personaldata.refHealthIssue)
        }

        if (personaldata.refHealthIssue) {
          setFormVisible(true);
        } else setFormVisible(false);

        console.log("communication.refCtMobile", communication.refCtMobile);
        console.log(typeof communication.refCtMobile);

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
          emergencyno:communication.refEmerContact,
          whatsappno: communication.refCtWhatsapp,
          mode: communication.refUcPreference,
          height: generalhealth ? generalhealth.refHeight : null,
          weight: generalhealth ? generalhealth.refWeight : null,
          bloodgroup: generalhealth ? generalhealth.refBlood : null,
          bmi: generalhealth ? generalhealth.refBMI : null,
          bp: generalhealth ? generalhealth.refBP : null,
          accidentdetails: generalhealth
            ? generalhealth.refRecentInjuriesReason
            : null,
          breaksdetails: generalhealth
            ? generalhealth.refRecentFracturesReason
            : null,
          breaksotheractivities: generalhealth ? generalhealth.refOthers : null,
          genderalanything: generalhealth ? generalhealth.refElse : null,
          pastother: presenthealth ? presenthealth.refPastHistory : null,
          pastmedicaldetails: presenthealth
            ? presenthealth.refMedicalDetails
            : null,
          caredoctorname: presenthealth ? presenthealth.refDoctor : null,
          caredoctorhospital: presenthealth ? presenthealth.refHospital : null,
          backpainscale: presenthealth ? presenthealth.refBackPain : null,
          BackPainValue: presenthealth ? presenthealth.refBackPainValue : null,
          bpValue: presenthealth ? generalhealth.refBpType : null,
          ifbp: presenthealth ? generalhealth.refIfBp : null,
          therapydurationproblem: presenthealth
            ? presenthealth.refProblem
            : null,
          therapypasthistory: presenthealth
            ? presenthealth.refPastHistory
            : null,
          therapyfamilyhistory: presenthealth
            ? presenthealth.refFamilyHistory
            : null,
          therapyanythingelse: presenthealth
            ? presenthealth.refAnythingelse
            : null,
          pancard: data.data.employeeDocuments
            ? data.data.employeeDocuments.panCard
            : "",
          aadhar: data.data.employeeDocuments
            ? data.data.employeeDocuments.AadharCard
            : "",
          certification: data.data.employeeDocuments
            ? data.data.employeeDocuments.Certification
            : "",
        });

        setPageLoading({
          ...pageLoading,
          pageData: false,
        });
        if (data.Documents && Array.isArray(data.Documents)) {
          setMedDocData(data.Documents);
        }
      }
    });
  }

  useEffect(() => {
    getData();
  }, []);

  const [loading, setLoading] = useState({
    changeimg: false,
  });
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle the file input change
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoading({
      ...loading,
      changeimg: true,
    });
    const file = event.target.files?.[0] || null;

    if (file) {
      handleImageUpload(file); // Pass the file directly to the upload function
    }
  };

  // Handle the image upload
  const handleImageUpload = async (file: any) => {
    if (!file) {
      setLoading({
        ...loading,
        changeimg: false,
      });
      alert("Please select an image first.");
      return;
    }

    try {
      const response = await Axios.post(
        import.meta.env.VITE_API_URL + "/director/addProfileImage",
        { file: file },
        {
          headers: {
            Authorization: localStorage.getItem("JWTtoken"),
            "Content-Type": "multipart/form-data", // Set content type to form-data
          },
        }
      );

      const data = decrypt(
        response.data[1],
        response.data[0],
        import.meta.env.VITE_ENCRYPTION_KEY
      );
      if (data.token == false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

        console.log(data);

        setInputs({
          ...inputs,
          profilefile: data.filePath,
        });

        setuserdata({
          ...userdata,
          profileimg: data.filePath,
        });

        setLoading({
          ...loading,
          changeimg: false,
        });

        console.log("Image uploaded successfully:", data);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

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

  function calculateBMI(weight: number, height: number) {
    if (!weight || !height) return ""; // Return empty if inputs are missing
    const heightInMeters = height / 100;
    if (heightInMeters <= 0) return ""; // Avoid division by zero or negative values
    const bmi = weight / (heightInMeters ** 2);
    return bmi.toFixed(2); // Round to 2 decimal places
  }

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
      if (name === "age" && Number(value) < 20) {
        updatedInputs.maritalstatus = ""; // Set to an empty string instead of a space
      }

      if (name === "height" || name === "weight") {
        const newBMI = calculateBMI(
          name === "weight" ? parseInt(value) : parseInt(inputs.weight),
          name === "height" ? parseInt(value) : parseInt(inputs.height)
        );
        updatedInputs.bmi = newBMI;
      }

      return updatedInputs; // Return the updated inputs
    });
  };

  const handlesubmitaddress = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/user/updateProfile",

      {
        address: {
          addresstype: options.address,
          refAdFlat1: inputs.perdoorno,
          refAdArea1: inputs.perstreetname,
          refAdAdd1: inputs.peraddress,
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
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          console.log(data.success);

          if (data.success) {
            setEdits({
              ...edits,
              address: false,
            });
          }
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  const handlepersonalinfo = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/user/updateProfile",

      {
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
          refWeddingDate: inputs.anniversarydate
            ? inputs.anniversarydate
            : null,
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
        console.log("Response -----------", res);

        const data = decrypt(
          res.data[1],
          res.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          console.log(data.success);

          if (data.success) {
            setEdits({
              ...edits,
              personal: false,
            });
          }
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  const handlecommunicationtype = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/user/updateProfile",

      {
        communication: {
          refCtEmail: inputs.email,
          refCtMobile: inputs.phoneno,
          refEmerContact:inputs.emergencyno,
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
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          console.log(data.success);

          if (data.success) {
            setEdits({
              ...edits,
              communitcation: false,
            });
          }
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  const handlegenderalhealth = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/user/updateProfile",

      {
        generalhealth: {
          refBMI: inputs.bmi,
          refBP: inputs.bp,
          refBlood: inputs.bloodgroup,
          refElse: inputs.genderalanything,
          refHeight: parseInt(inputs.height),
          refOthers: inputs.breaksotheractivities,
          refRecentFractures: options.accident,
          refRecentFracturesReason: inputs.breaksdetails,
          refRecentInjuries: options.breaks,
          refRecentInjuriesReason: inputs.accidentdetails,
          refWeight: parseInt(inputs.weight),
        },
        medicalIssue: {
          refHealthIssue: options.medicalIssue
        }
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
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          console.log(data.success);

          if (data.success) {
            setEdits({
              ...edits,
              gendrel: false,
            });
          }

        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      }).finally(() => {
        getData()
      })
  };

  const handlepresenthealth = () => {
    let updatedHealthProblem: any[] = [];
    conditions.forEach((element) => {
      if (element.checked === 1) {
        updatedHealthProblem.push(element.value);
      }
    });

    Axios.post(
      import.meta.env.VITE_API_URL + "/user/updateProfile",

      {
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
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          console.log(data.success);

          if (data.success) {
            setEdits({
              ...edits,
              present: false,
            });
          }
        }
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  const [documents, setDocuments] = useState({
    aadhar: "",
    pan: "",
    certifiction: "",
  });

  const handleFileChange = (e: any) => {
    const { name } = e.target;
    const file = e.target.files[0]; // Get the selected file

    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [name]: file, // Update the specific document field
    }));
  };

  const [uploadloading, setUploadLoading] = useState(false);

  const handleDocument = (e: any) => {
    e.preventDefault();

    setUploadLoading(true);

    // Initialize FormData
    const formData = new FormData();
    formData.append("panCard", documents.pan);
    formData.append("aadharCard", documents.aadhar);
    formData.append("certification", documents.certifiction);

    Axios.post(
      import.meta.env.VITE_API_URL + "/staff/addEmployeeDocument",
      formData, // Pass the formData object
      {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"), // JWT token for authorization
          // No need for "Content-Type"; Axios sets it automatically for FormData
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
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          console.log(data);

          if (data.success) {
            toast.success(
              "Document Uploaded Successfully, Waiting for Approval",
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                // transition: Bounce,
              }
            );
            setUploadLoading(false);
            setInputs({
              ...inputs,
              pancard: data.profileFile.employeeDocuments.panCard
                ? data.profileFile.employeeDocuments.panCard
                : inputs.pancard,
              aadhar: data.profileFile.employeeDocuments.aadharCard
                ? data.profileFile.employeeDocuments.aadharCard
                : inputs.aadhar,
              certification: data.profileFile.employeeDocuments.certification
                ? data.profileFile.employeeDocuments.certification
                : inputs.certification,
            });
          } else {
            toast.warning("Something went wrong", {
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
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  const handlePassword = (event: any) => {
    event.preventDefault();

    if (passwordInputs.newpass != passwordInputs.confirmpass) {
      setPasswordError({
        status: true,
        message: "Confirm Password Dosen't Match",
      });

      return 0;
    }

    Axios.post(
      import.meta.env.VITE_API_URL + "/changePassword",

      {
        oldPassword: passwordInputs.currentpass,
        newPassword: passwordInputs.newpass,
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
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          console.log("Password Change-------------", data);

          if (data.success) {
            setPasswordInputs({
              currentpass: "",
              newpass: "",
              confirmpass: "",
            });
            setPasswordError({
              status: false,
              message: "",
            });
          } else {
            setPasswordError({
              status: true,
              message: "Invalid Current Password",
            });
          }
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  const [passwordError, setPasswordError] = useState({
    status: false,
    message: "",
  });

  const [uploadDocuments, setUploadDocuments] = useState([
    {
      refMedDocName: "",
      refMedDocPath: "",
      refMedDocFile: { contentType: "", content: "" },
      refMedDocUpload: false,
      refMedDocUpBtn: false,
    },
  ]);
  const [medDocData, setMedDocData] = useState<any>([]);

  const handleprof = () => {
    Axios.post(
      import.meta.env.VITE_API_URL + "/staff/userDataUpdate",

      {
        employeeData: {
          refExperence: employeeData.refExperence,
          refSpecialization: employeeData.refSpecialization,
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
        if (data.token == false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          if (data.success) {
            console.log("Prof---------", data);

            setEdits({
              ...edits,
              prof: false,
            });

            setEmployeeData({
              refExperence: data.data.EmployeeData.refExperence
                ? data.data.EmployeeData.refExperence
                : "",
              refSpecialization: data.data.EmployeeData.refSpecialization
                ? data.data.EmployeeData.refSpecialization
                : "",
            });
          }
        }
      })
      .catch((err) => {
        // Catching any 400 status or general errors
        console.log("Error: ", err);
      });
  };

  const handleMedDoc = () => {

    // Combine data from both states
    const medicalDocuments = [
      ...uploadDocuments.map((doc) => ({
        refMedDocName: doc.refMedDocName,
        refMedDocPath: doc.refMedDocPath,
      })),
      ...medDocData.map((doc: any) => ({
        refMedDocName: doc.refMedDocName,
        refMedDocPath: doc.refMedDocPath,
        refMedDocId: doc.refMedDocId,
      })),
    ];

    Axios.post(
      import.meta.env.VITE_API_URL + "/user/updateProfile",
      {
        refStId: "",
        medicalDocuments,
      },
      {
        headers: {
          Authorization: localStorage.getItem("JWTtoken"),
          "Content-Type": "application/json", // Ensure the content type is set
        },
      }
    )
      .then((res) => {
        console.log("Response -----------", res);

        const data = decrypt(
          res.data[1],
          res.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        );
        if (data.token === false) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

          console.log(data.success);

          if (data.success) {
            setEdits({
              ...edits,
              medDoc: false,
            });
            toast.success("Medical Document is Updated Successfully", {
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
      })
      .catch((err) => {
        toast.error("Some thing went wrong, try again after some time", {
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
        console.log("Error: ", err);
      });
  };

  const handlePreviewDocument = (dataArray: any, index: any) => {
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

  const handleAddDocument = () => {
    setUploadDocuments((prev) => [
      ...prev,
      {
        refMedDocName: "",
        refMedDocPath: "",
        refMedDocFile: { contentType: "", content: "" },
        refMedDocUpload: false,
        refMedDocUpBtn: false,
      },
    ]);
  };

  const handleRemoveDocument = (dataArray: any, index: any) => {
    if (dataArray[index]?.refMedDocId) {
      try {
        Axios.post(
          import.meta.env.VITE_API_URL + "/profile/deleteMedicalDocument",
          { refMedDocId: dataArray[index]?.refMedDocId },
          {
            headers: {
              Authorization: localStorage.getItem("JWTtoken"),
              "Content-Type": "application/json",
            },
          }
        )
          .then((res) => {
            console.log(res, "res");

            const data = decrypt(
              res.data[1],
              res.data[0],
              import.meta.env.VITE_ENCRYPTION_KEY
            );
            console.log("data", data);

            if (data.success) {
              console.log("Success delete");

              setMedDocData((prev: any) => prev.filter((_: any, idx: any) => idx !== index));
              toast.success("Medical Document Removed Successfully", {
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
              toast.warning("Some thing went wrong, try after some time", {
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
          })
          .catch((err) => {
            console.error("Error Deleting the File:", err);
          });
      } catch (error) {
        console.error("Error in Delete Document:", error);
      }
    } else if (dataArray[index].refMedDocPath == "") {
      setUploadDocuments((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      try {
        Axios.post(
          import.meta.env.VITE_API_URL + "/profile/deleteMedicalDocument",
          { filePath: dataArray[index].refMedDocPath },
          {
            headers: {
              Authorization: localStorage.getItem("JWTtoken"),
              "Content-Type": "application/json",
            },
          }
        )
          .then((res) => {
            console.log(res, "res");

            const data = decrypt(
              res.data[1],
              res.data[0],
              import.meta.env.VITE_ENCRYPTION_KEY
            );
            console.log("data", data);

            if (data.success) {
              console.log("Success delete");
              setUploadDocuments((prev) =>
                prev.filter((_, idx) => idx !== index)
              );
            }
          })
          .catch((err) => {
            console.error("Error Deleting the File:", err);
          });
      } catch (error) {
        console.error("Error in Delete Document:", error);
      }
    }
  };

  const handletherapy = () => {
    let updatedHealthProblem: any = [];
    conditions.forEach((element) => {
      if (element.checked === 1) {
        updatedHealthProblem.push(element.value);
      }
    });

    Axios.post(
      import.meta.env.VITE_API_URL + "/user/updateProfile",
      {
        presentHealth: {
          refRecentFractures: options.accident,
          refRecentFracturesReason: inputs.breaksdetails,
          refOthers: inputs.breaksotheractivities,
          refElse: inputs.genderalanything,
          refBackpain: inputs.backpainscale,
          refBackPainValue: inputs.BackPainValue,
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
        if (!data.token) {
          navigate("/expired");
        } else {
          localStorage.setItem("JWTtoken", `Bearer ${data.token}`);

          console.log(data.success);

          if (data.success) {
            setEdits((prevEdits) => ({
              ...prevEdits,
              therapy: false,
            }));
          }
        }
      })
      .catch((err) => {
        console.error("Error: ", err);
      });
  };


  const storeDocument = (index: any) => {
    console.log('index', index)
    console.log(' -> Line Number ----------------------------------- 1421',);
    const uploadDocument = uploadDocuments[index];
    console.log('Document', uploadDocument)
    console.log(' -> Line Number ----------------------------------- 1423',);
    try {
      Axios.post(
        import.meta.env.VITE_API_URL + "/profile/userHealthReportUpload",
        uploadDocument.refMedDocFile,
        {
          headers: {
            Authorization: localStorage.getItem("JWTtoken"),
            "Content-Type": "multipart/form-data",
          },
        }
      )
        .then((res) => {
          const data = decrypt(
            res.data[1],
            res.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          );
          setUploadDocuments((prev) => {
            const updatedDocuments = [...prev];
            updatedDocuments[index] = {
              ...updatedDocuments[index],
              refMedDocPath: data.filePath,
              refMedDocFile: data.file,
              refMedDocUpload: true,
            };
            return updatedDocuments;
          });
        })
        .catch((err) => {
          console.error("Error uploading file:", err);
        });
    } catch (error) {
      console.error("Error in storeDocument:", error);
    }
  };

  return (
    <>
      <div className="headerPrimary hidden md:flex">
        <h3>Profile</h3>
        <div className="quickAcces">
          {userdata.profileimg ? (
            <div className="p-link layout-topbar-button">
              <img
                id="userprofileimg"
                className="w-[45px] h-[45px] object-cover rounded-full"
                src={`data:${userdata.profileimg.contentType};base64,${userdata.profileimg.content}`}
                alt=""
              />
            </div>
          ) : (
            <div className="p-link layout-topbar-button">
              <i className="pi pi-user"></i>
            </div>
          )}
          <h3 className="text-[1rem] text-center ml-2 lg:ml-2 mr-0 lg:mr-5">
            <span>{userdata.username}</span>
            <br />
            <span className="text-[0.8rem] text-[#f95005]">
              {userdata.usernameid}
            </span>
          </h3>
        </div>{" "}
      </div>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5]">
            <div className="headerPrimary">
              <h3>PROFILE</h3>
              <div className="quickAcces">
                <Skeleton
                  shape="circle"
                  size="3rem"
                  className="mr-2"
                ></Skeleton>
                <h3 className="flex-col flex items-center justify-center text-center ml-2 lg:ml-2 mr-0 lg:mr-5">
                  <Skeleton width="7rem" className="mb-2"></Skeleton>
                  <Skeleton width="7rem" className="mb-2"></Skeleton>
                </h3>
              </div>{" "}
            </div>

            <div className="userProfilePage">
              <Skeleton
                className="lg:m-[30px] shadow-lg"
                width="95%"
                height="50vh"
                borderRadius="16px"
              ></Skeleton>
              <Skeleton
                className="lg:m-[30px] shadow-lg"
                width="95%"
                height="30vh"
                borderRadius="16px"
              ></Skeleton>
              <div className="py-1"></div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-[#f6f5f5]">

          <div className="userProfilePage">
            {/* Personal Information */}
            <ToastContainer />
            <form
              className="flex"
              onSubmit={(e) => {
                e.preventDefault();
                handlepersonalinfo();
              }}
            >
              <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                <div className="w-[100%] flex justify-between items-center mb-5">
                  <div className="text-[1.2rem] lg:text-[25px] font-bold">
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
                </div>
                <div className="w-[100%] flex flex-col lg:flex-row justify-center items-center">
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

                    <div className="w-[250px] flex flex-col justify-center items-center">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="image/png, image/jpeg" // Only accept PNG and JPG
                        onChange={handleImageChange} // Handle file change
                      />

                      {/* Styled label that looks like a button */}

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
                    </div>
                  </div>
                  <div className="w-[100%] lg:w-[65%] flex flex-col justify-center items-center">
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

                      <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                        <div className="w-[100%] lg:w-[48%]">
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
                        <div className="w-[100%] lg:w-[48%]">
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
                            disabled={edits.personal && inputs.age > '20' ? false : true }
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
                        <div
                          className={
                            localStorage.getItem("refUtId") === "5" ||
                              localStorage.getItem("refUtId") === "6"
                              ? "w-[48%]"
                              : "w-[100%]"
                          }
                        >
                          <TextInput

                            label="Qualification"
                            name="qualification"
                            id="qualification"
                            type="text"
                            disabled={inputs.age > "18" ? false : true}
                            onChange={handleInputVal}
                            value={inputs.qualification}
                            readonly={!edits.personal}
                          />
                        </div>

                        {localStorage.getItem("refUtId") === "5" ||
                          localStorage.getItem("refUtId") === "6" ? (
                          <div className="w-[48%]">
                            <TextInput
                              label="Occupation *"

                              name="occupation"
                              id="Occupation"
                              type="text"
                              disabled={inputs.age > "20" ? false : true}
                              onChange={handleInputVal}
                              value={inputs.occupation}
                              readonly={!edits.personal}
                            />
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Address */}
            <form
              className="flex"
              onSubmit={(e) => {
                e.preventDefault();
                handlesubmitaddress();
              }}
            >
              <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
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

                    <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                      <div className="w-[100%] lg:w-[48%]">
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
                      <div className="w-[100%] lg:w-[48%]">
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
                            onChange={(e) => handleInputVal(e)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                      <div className="w-[100%] lg:w-[48%]">
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
                      <div className="w-[100%] lg:w-[48%]">
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
              className="flex"
              onSubmit={(e) => {
                e.preventDefault();
                handlecommunicationtype();
              }}
            >
              <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
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
                </div>

                <div className="w-[100%] flex flex-col justify-center items-center">
                  <div className="w-[100%] gap-4   flex justify-between mb-[20px]">
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
                  <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                    <div className="w-[100%] lg:w-[40%]">
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
                    <div className="w-[100%] lg:w-[56%] flex justify-between">
                      <div className="w-[65%] lg:w-[75%]">
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
                        className="w-[30%] lg:w-[18%] text-[0.7rem] lg:text-[14px] flex justify-center items-center text-center bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
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
                  {/* 
                  <div className="w-[100%] ">
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

            {localStorage.getItem("refUtId") === "5" ||
              localStorage.getItem("refUtId") === "6" ? (
              <>
                {/* Genderal Health */}
                <form
                  className="flex"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlegenderalhealth();
                  }}
                >
                  <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
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
                      <div className="w-[100%] lg:w-[100%] my-[1%]">
                        <label className="w-[100%] text-[#f95005] font-bold text-[1.0rem] lg:text-[20px] text-start">
                          Medical Issue *{" "}
                        </label>
                        <div className="w-[100%] flex justify-start mt-[10px]">
                          <div className="mr-10">
                            <RadiobuttonInput
                              id="medicalIssueYes"
                              value="yes"
                              name="medicalIssue"
                              selectedOption={options.medicalIssue ? "yes" : ""}
                              onChange={() => {
                                setOptions({ ...options, medicalIssue: true });
                                // handleFormToggle("yes");
                              }}
                              label="Yes"
                              readonly={!edits.gendrel}
                              required
                            />
                          </div>
                          <div className="">
                            <RadiobuttonInput
                              id="medicalIssueNo"
                              value="no"
                              name="medicalIssue"
                              label="No"
                              onChange={() => {
                                setOptions({ ...options, medicalIssue: false });
                                // handleFormToggle("no");
                              }}
                              selectedOption={!options.medicalIssue ? "no" : ""}
                              readonly={!edits.gendrel}
                              required
                            />
                          </div>
                        </div>
                        {/* <div className="mt-2 text-[#ff621b] flex flex-row justify-center align-middle gap-5">
        <p>
          Note * : If you have any medical history, any medical problems, or
          feel that you have any body pain or other health issues, click 'Yes.'
          Otherwise, click 'No'.
        </p>
      </div> */}
                      </div>
                      {/* <div className="w-[90%] md:w-[100%]  mt-[20px]">
                  <label className="w-[100%] text-[#f95005]  text-[1.0rem] lg:text-[18px] text-start">
                    Recent Injuries / Accidents / Surgeries / Fractures /
                    Sprains *
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
                <div className="w-[100%] flex justify-between mb-[20px]">
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
                </div> */}


                      {/* <div className="w-[100%] flex flex-col lg:flex-row gap-y-[25px] justify-between mb-[25px]">
                        <div className="w-[100%] lg:w-[48%]">
                          <label className="w-[100%] text-[#f95005] font-bold text-[1.0rem] lg:text-[20px] text-start">
                            Recent injuries / Accidents / Operations *{" "}
                          </label>
                          <div className="w-[100%] flex justify-start mt-[10px]">
                            <div className="mr-10">
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
                        <div className="w-[100%] lg:w-[48%]">
                          <label className="w-[100%] text-[#f95005] font-bold text-[1.0rem] lg:text-[20px] text-start">
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
                      </div> */}
                    </div>
                  </div>
                </form>

                {/* Past or Present Health */}

                {medicalIssue ?
                  <>
                    <form
                      className="flex"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handlepresenthealth();
                      }}
                    >
                      <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                        <div className="w-[100%] flex justify-between items-center mb-5">
                          <div className="text-[1.2rem] lg:text-[25px] font-bold">
                            Past or Present Health Problems
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

                            <div className="w-[100%] flex flex-col lg:flex-row gap-y-[20px] justify-between mb-[20px]">
                              <div className="w-[100%] lg:w-[48%]">
                                <TextInput
                                  label="Others "
                                  name="pastother"
                                  id="others"
                                  type="text"
                                  onChange={handleInputVal}
                                  value={inputs.pastother}
                                  readonly={!edits.present}
                                />
                              </div>
                              <div className="w-[100%] lg:w-[48%]">
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
                                      name="BackPainValue"
                                      label="Additional Content (Back Pain)"
                                      disabled={!options.backpain}
                                      readonly={!edits.present}
                                      required
                                      type=""
                                      value={inputs.BackPainValue}
                                      onChange={(e) => handleInputVal(e)}
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
                                      value={inputs.bp}
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
                                      value={inputs.bpValue}
                                      onChange={(e) => handleInputVal(e)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>


                          {/* <div className="w-[100%] flex flex-col gap-y-[20px] lg:flex-row justify-between">
                          <div className="w-[100%] lg:w-[48%]">
                            <label className="w-[100%] text-[#f95005] font-bold text-[1rem] lg:text-[20px] text-start">
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
                          <div className="w-[100%] lg:w-[48%]">
                            <label className="w-[100%] text-[#f95005] font-bold text-[1rem] lg:text-[20px] text-start">
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
                        </div> */}

                        </div>
                      </div>
                    </form>
                    {/* Therapy */}
                    <form
                    className="flex"
                onSubmit={(e) => {
                  e.preventDefault();
                  handletherapy();
                }}>
                <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                  <div className="w-[100%] flex justify-between items-center mb-5">
                    <div className="text-[1.2rem] lg:text-[25px] font-bold">
                      Health Problems History
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

                      <div className="w-[100%] flex flex-col lg:flex-row gap-y-[25px] mt-3 justify-between mb-[25px]">
                        <div className="w-[100%] lg:w-[100%]">
                          <label className="w-[100%] text-[#f95005] font-bold text-[1.0rem] lg:text-[20px] text-start">
                            Recent Injuries / Accidents / Surgeries / Fractures / Sprains *
                          </label>
                          <div className="w-[100%] flex justify-start mt-[10px]">
                            <div className="mr-10">
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
                                readonly={!edits.therapy}
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
                                    breaksdetails: "",
                                    breaksotheractivities: "",
                                    genderalanything: "",

                                  });
                                }}
                                selectedOption={!options.accident ? "no" : ""}
                                readonly={!edits.therapy}
                                required
                              />
                            </div>

                          </div>


                        </div>




                      </div>
                      <div className="w-[100%] mb-[20px]">
                        <TextInput
                          label="Description"
                          name="breaksdetails"
                          id="details"
                          type="text"
                          onChange={handleInputVal}
                          value={inputs.breaksdetails}
                          disabled={!options.accident || !edits.therapy}
                          // disabled={!options.breaks}
                          // readonly={!edits.gendrel}
                          required
                        />

                      </div>
                      <div className="w-[100%] mb-[20px]">
                        <div className="w-full">
                          <TextInput
                            label="Other Activities"
                            name="breaksotheractivities"
                            id="otheractivities"
                            type="text"
                            onChange={handleInputVal}
                            value={inputs.breaksotheractivities}
                            disabled={!options.accident || !edits.therapy}
                            // disabled={!options.breaks}
                            // readonly={!edits.gendrel}
                            required
                          />

                        </div>

                      </div>
                      <div className="w-[100%] mb-[20px]">
                        <div className="w-full">
                          <TextInput
                            label="Add your Comments"
                            name="genderalanything"
                            id="otheractivities"
                            type="text"
                            onChange={handleInputVal}
                            value={inputs.genderalanything}
                            disabled={!options.accident || !edits.therapy}
                            //  disabled={!options.breaks}
                            //  readonly={!edits.gendrel}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                    </form>

                    {/* Medical Documentation */}
                    <form 
                    className="flex"
                    onSubmit={(e) => { e.preventDefault(); handleMedDoc(); }}>

                      <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                        <div className="w-[100%] flex justify-between items-center mb-5">
                          <div className="text-[1rem] lg:text-[25px] font-bold">
                            Documentation
                          </div>
                          {edits.medDoc ? (
                            <button className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded">
                              Save&nbsp;&nbsp;
                              <i className="text-[15px] pi pi-check"></i>
                            </button>
                          ) : (
                            <div
                              onClick={() => {
                                editform("medDoc");
                              }}
                              className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                            >
                              Edit&nbsp;&nbsp;
                              <i className="text-[15px] pi pi-pen-to-square"></i>
                            </div>
                          )}
                        </div>
                        {uploadDocuments.length > 0 ? (<></>

                        ) : (
                          <><div className="text-gray-500 text-center mt-5">
                            No Medical Documents Uploaded
                          </div></>
                        )}
                        {edits.medDoc ? (
                          <div className="w-full overflow-auto flex flex-col justify-center align-items-center ">
                            <div className="w-[90%] flex flex-wrap my-4 items-center justify-end gap-x- lg:gap-x-10 gap-y-4">
                              <button
                                type="button"
                                className="py-2 px-4 bg-[#f95005] text-white rounded hover:bg-[#f95005]"
                                onClick={handleAddDocument}
                              >
                                Add Document
                              </button>
                            </div>
                            <div className="w-[80%] flex justify-center"> 
                            {uploadDocuments.map((document, index) => (
                              <div
                                key={index}
                                className="w-[100%] flex flex-row items-center justify-evenly lg:p-[10px] mt-5 lg:mt-0"
                              >
                                <div>
                                  {document.refMedDocUpload && (
                                    <div className="pt-0 align-content-start">
                                      <FaEye
                                        className="w-[30px] h-[25px] text-[#f95005] cursor-pointer"
                                        onClick={() =>
                                          handlePreviewDocument(uploadDocuments, index)
                                        }
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="w-[40%] flex flex-col justify-start text-start">
                                  {/* <label className="block text-gray-700 font-medium mb-2">
                                    Enter File Name:
                                  </label> */}
                                  <TextInput
                                    label="Enter File Name:"
                                    name="medicalDocument"
                                    id="medicalDocument"
                                    type="text"
                                    onChange={(e) => {
                                      setUploadDocuments((prev) => {
                                        const updatedDocuments = [...prev];
                                        updatedDocuments[index].refMedDocName =
                                          e.target.value;
                                        return updatedDocuments;
                                      });
                                    }}
                                    value={document.refMedDocName || ""}
                                    required
                                  />

                                </div>
                                <div className="w-[40%] flex flex-col justify-start text-start ">
                                  <input
                                    type="file"
                                    accept="application/pdf,image/*"
                                    className="w-full border m-[10px]"
                                    disabled={document.refMedDocUpload}
                                    onChange={(e) => {
                                      const files = e.target?.files;
                                      if (files && files[0]) {
                                        const file = files[0];
                                        const formData = new FormData();
                                        formData.append("file", file);

                                        setUploadDocuments((prev) => {
                                          const updatedDocuments: any = [...prev];
                                          updatedDocuments[index].refMedDocFile = formData;
                                          updatedDocuments[index].refMedDocUpBtn = true;
                                          return updatedDocuments;
                                        });
                                      }
                                    }}
                                    required
                                  />
                                </div>
                                <button
                                  type="button"
                                  className={`text-[green] disabled:cursor-not-allowed p-[5px] disabled:text-slate-400 disabled:before:bg-transparent`}
                                  onClick={() => storeDocument(index)}
                                  disabled={
                                    document.refMedDocUpload === true ||
                                    document.refMedDocUpBtn === false
                                  }
                                >
                                  <ImUpload2 className="w-[30px] h-[25px]" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDocument(uploadDocuments, index)
                                  }
                                  className="text-[red]"
                                >
                                  <MdDelete className="w-[30px] h-[30px] " />
                                </button>
                              </div>
                            ))}</div>

                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="w-[100%] flex justify-center items-center">
                          <div className="flex flex-wrap  items-center w-[100%]">

                            {medDocData.map((doc: any, index: any) => (
                              <div
                                key={doc.refMedDocId}
                                className="lg:basis-1/3 basis-full flex items-center justify-start lg:p-2 hover:border-2 border-[#f95005]"
                              >
                                <div className="lg:mr-5 mr-2">
                                  <FaEye
                                    className="w-[30px] h-[25px] text-[#f95005] cursor-pointer"
                                    onClick={() =>
                                      handlePreviewDocument(medDocData, index)
                                    } // Use index for identifying the item
                                  />
                                </div>
                                <div className="">
                                  {/*  */}
                                  {edits.medDoc ? (
                                    <div className="mb-4 w-[100%] flex flex-col justify-start text-start">
                                      <label className="block text-gray-700 font-medium mb-2">
                                        Document Name:
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Enter a name for the file"
                                        className="w-full border border-gray-300 rounded px-4 py-2"
                                        value={doc.refMedDocName || ""}
                                        onChange={(e) => {
                                          setMedDocData((prev: any) => {
                                            const updatedDocuments = [...prev];
                                            medDocData[index].refMedDocName =
                                              e.target.value;
                                            return updatedDocuments;
                                          });
                                        }}
                                        required
                                      />
                                    </div>
                                  ) : (
                                    <h3 className="text-[20px]">{doc.refMedDocName}</h3>
                                  )}

                                  {/* Display refMedDocName */}
                                </div>
                                {edits.medDoc ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveDocument(medDocData, index)
                                    } // Use index for removing the item
                                    className="text-[red] lg:ml-5 ml-2"
                                  >
                                    <MdDelete className="w-[30px] h-[30px]" />
                                  </button>
                                ) : (
                                  <></>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </form>

                  </>
                  :
                  <></>
                }

              </>
            ) : (
              <>
                {localStorage.getItem("refUtId") === "7" ? (
                  <></>
                ) : (
                  <>
                    <form 
                    className="flex"
                    onSubmit={handleDocument}>
                      <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
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
                                      const byteArray = new Uint8Array(
                                        byteNumbers
                                      );
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
                                  <input
                                    id="aadhar"
                                    name="aadhar"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="flex h-10 w-full rounded-md border-2 border-input border-[#b3b4b6] px-3 py-2 text-[14px] text-[#4c4c4e] file:border-0 file:bg-[#f95005] file:text-[#fff] file:text-[14px] file:font-bold file:rounded"
                                  />
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
                                      const byteArray = new Uint8Array(
                                        byteNumbers
                                      );
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
                                  <input
                                    id="pan"
                                    name="pan"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="flex h-10 w-full rounded-md border-2 border-input border-[#b3b4b6] px-3 py-2 text-[14px] text-[#4c4c4e] file:border-0 file:bg-[#f95005] file:text-[#fff] file:text-[14px] file:font-bold file:rounded"
                                  />
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
                                      const content =
                                        inputs.certification.content;
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
                                      const byteArray = new Uint8Array(
                                        byteNumbers
                                      );
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
                                  <input
                                    id="certifiction"
                                    name="certifiction"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="flex h-10 w-full rounded-md border-2 border-input border-[#b3b4b6] px-3 py-2 text-[14px] text-[#4c4c4e] file:border-0 file:bg-[#f95005] file:text-[#fff] file:text-[14px] file:font-bold file:rounded"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {inputs.pancard &&
                          inputs.aadhar &&
                          inputs.certification ? null : (
                          <div className="w-[100%] flex justify-start">
                            {uploadloading ? (
                              <div>
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  aria-labelledby="title-04a desc-04a"
                                  aria-live="polite"
                                  aria-busy="true"
                                  className="w-10 h-10 animate animate-spin"
                                >
                                  <title id="title-04a">Icon title</title>
                                  <desc id="desc-04a">Some desc</desc>
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    className="stroke-slate-200"
                                    stroke-width="4"
                                  />
                                  <path
                                    d="M12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2"
                                    className="stroke-[#ff5000]"
                                    stroke-width="4"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <button
                                className="text-[18px] outline-none py-2 border-none px-5 bg-[#f95005] font-bold cursor-pointer text-white rounded"
                                type="submit"
                              >
                                Upload&nbsp;&nbsp;
                                <i className="text-[18px] pi pi-file-arrow-up"></i>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </form>

                    <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                      <div className="w-[100%] flex justify-between items-center mb-5">
                        <div className="text-[1rem] lg:text-[25px] font-bold">
                          Professional Exprience
                        </div>
                        {edits.prof ? (
                          <div
                            className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                            onClick={handleprof}
                          >
                            Save&nbsp;&nbsp;
                            <i className="text-[15px] pi pi-check"></i>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              editform("prof");
                            }}
                            className="text-[15px] py-2 px-3 bg-[#f95005] font-bold cursor-pointer text-[#fff] rounded"
                          >
                            Edit&nbsp;&nbsp;
                            <i className="text-[15px] pi pi-pen-to-square"></i>
                          </div>
                        )}
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
                )}
              </>
            )}

            <form 
            className="flex"
            onSubmit={handlePassword}>
              <div className="basicProfileCont m-[10px] lg:m-[30px] p-[20px] lg:p-[40px] shadow-lg">
                <div className="w-[100%] flex justify-between items-center mb-5">
                  <div className="text-[1rem] lg:text-[25px] font-bold">
                    Change Password
                  </div>
                </div>

                <div className="w-[100%] flex justify-between items-center mb-4">
                  <div className="w-[100%] flex justify-between">
                    <div className="w-[100%]">
                      <PasswordInput
                        label="Current Password"
                        name="currentpass"
                        id="currentpass"
                        onChange={handleInputPass}
                        value={passwordInputs.currentpass}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="w-[100%] flex justify-between items-center mb-4">
                  <div className="w-[100%] flex justify-between">
                    <div className="w-[48%]">
                      <PasswordInput
                        label="New Password"
                        name="newpass"
                        id="newpassword"
                        onChange={handleInputPass}
                        value={passwordInputs.newpass}
                        required
                      />
                    </div>
                    <div className="w-[48%]">
                      <PasswordInput
                        label="Confirm Password"
                        name="confirmpass"
                        id="confimpassword"
                        onChange={handleInputPass}
                        value={passwordInputs.confirmpass}
                        required
                      />
                    </div>
                  </div>
                </div>

                {passwordError.status ? (
                  <>
                    <div className="mb-4">
                      <ErrorMessage message={passwordError.message} />
                    </div>
                  </>
                ) : null}

                <div className="w-[100%] flex justify-start">
                  <button
                    className="text-[18px] outline-none py-2 border-none px-5 bg-[#f95005] font-bold cursor-pointer text-white rounded"
                    type="submit"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </form>

            <div className="py-1"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
