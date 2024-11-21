import React, { useState, useEffect } from "react";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
// import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import StaffDatas from "../../pages/Datatable/StaffData";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import axios from "axios"; // Import axios for API calls
import { Skeleton } from "primereact/skeleton";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// interface City {
//   name: string;
//   code: string;
// }
type DecryptResult = any;

const StaffData: React.FC = () => {
  const [pageLoading, setPageLoading] = useState({
    verifytoken: true,
    pageData: true,
  });

  const [userdata, setuserdata] = useState({
    username: "",
    usernameid: "",
    profileimg: { contentType: "", content: "" },
  });

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

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/validateTokenData", {
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

        console.log("Verify Token  Running --- ");
      });
  }, []);

  // const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [visibleRight, setVisibleRight] = useState<boolean>(false); // Sidebar visibility state
  const [staffName, setStaffName] = useState<string>(""); // State for staff name
  const [staffRole, setStaffRole] = useState<string>(""); // State for staff role
  const [dob, setDob] = useState<Date | null>(null); // Date of birth state
  const [dropdownValue, setDropdownValue] = useState<string>("");
  const [dropdownValueBranch, setDropdownValueBranch] = useState<string>(""); // Dropdown state
  const [email, setEmail] = useState<string>(""); // Email state
  const [mobile, setMobile] = useState<string>(""); // Mobile state
  const [panCard, setPanCard] = useState<string>(""); // PAN card state
  const [aadharCard, setAadharCard] = useState<string>(""); // Aadhar card state

  const [dropdownOptions, setDropdownOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const [dropdownOptionsBranch, setDropdownOptionsBranch] = useState<
    { label: string; value: number }[]
  >([]);

  const fetchUserTypeLabel = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/director/userTypeLabel`,
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

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      console.log(data);

      if (data.success) {
        // Update state with the fetched dropdown options
        setDropdownOptions(
          data.userTypeLabel.map((item: any) => ({
            label: item.refUserType,
            value: item.refUtId,
          }))
        );

        setDropdownOptionsBranch(
          data.branch.map((item: any) => ({
            label: item.refBranchName,
            value: item.refbranchId,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching user type labels:", error);
    }
  };

  useEffect(() => {
    fetchUserTypeLabel();
  }, []);

  // const cities: City[] = [
  //   { name: "All", code: "LDN" },
  //   { name: "Front Office", code: "NY" },
  //   { name: "Instructor", code: "RM" },
  //   { name: "Finance", code: "IST" },
  // ];

  // const handlePlusButtonClick = async () => {
  //   try {
  //     // const response = await axios.get(
  //     //   import.meta.env.VITE_API_URL + `/director/userTypeLabel`
  //     // );
  //     // console.log("response", response);
  //     // setUserTypes(response.data);
  //     setVisibleRight(true);
  //   } catch (error) {
  //     console.error("Error fetching user types:", error);
  //   }
  // };

  const [changes,setChnages] = useState(false);

  const handleAddStaff = async () => {
    try {
      const staffData = {
        refFName: staffName,
        refLName: staffRole,
        refDob: dob,
        refUserType: dropdownValue,
        refbranchId: dropdownValueBranch,
        refEmail: email,
        refPhone: mobile,
        refPanCard: panCard,
        refAadharCard: aadharCard,
      };

      // Making the POST request to the API
      const response = await axios.post(
        import.meta.env.VITE_API_URL + `/director/addEmployee`,
        staffData,
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

      localStorage.setItem("JWTtoken", "Bearer " + data.token + "");

      setVisibleRight(false);
      setStaffName("");
      setStaffRole("");
      setDob(null);
      setDropdownValue("");
      setDropdownValueBranch("");
      setEmail("");
      setMobile("");
      setPanCard("");
      setAadharCard("");

      setChnages(!changes)

      toast.success("New Staff Added", {
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

      fetchUserTypeLabel();
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  };

  return (
    <>
      {pageLoading.verifytoken && pageLoading.pageData ? (
        <>
          <div className="bg-[#f6f5f5]">
            <div className="headerPrimary">
              <h3>STAFF DETAILS</h3>
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
                height="80vh"
                borderRadius="16px"
              ></Skeleton>
              <div className="py-1"></div>
            </div>
          </div>
        </>
      ) : (
        <div className="usersTable">
          <ToastContainer />
          <div className="headerPrimary">
            <h3>STAFF DETAILS</h3>
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
          <div className="routesCont">
            <div className="routeContents">
              <div className="filterHeaders">
                <div className="flex justify-end">
                  <Button
                    severity="success"
                    label="Add New Staff"
                    onClick={() => {
                      setVisibleRight(true);
                    }}
                  />
                </div>
              </div>
              <Divider />

              <StaffDatas changes={changes} />
            </div>
          </div>

          <Sidebar
            visible={visibleRight}
            onHide={() => setVisibleRight(false)}
            position="right"
            style={{ width: "60vw" }}
          >
            <h2>Add New Staff</h2>

            {/* Form content starts here */}
            <div className="p-fluid grid" style={{ justifyContent: "center" }}>
              {/* First Name and Last Name */}
              <div className="field col-5">
                <span className="p-float-label">
                  <InputText
                    id="firstName"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                  />
                  <label htmlFor="firstName">First Name</label>
                </span>
              </div>
              <div className="field col-5">
                <span className="p-float-label">
                  <InputText
                    id="lastName"
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                  />
                  <label htmlFor="lastName">Last Name</label>
                </span>
              </div>

              {/* Date of Birth and Dropdown */}
              <div className="field col-5">
                <span className="p-float-label">
                  <Calendar
                    id="dob"
                    value={dob}
                    onChange={(e) => setDob(e.value as Date)}
                    dateFormat="dd/mm/yy"
                  />
                  <label htmlFor="dob">Date of Birth</label>
                </span>
              </div>
              <div className="field col-5">
                <span className="p-float-label">
                  <Dropdown
                    id="dropdown"
                    value={dropdownValue}
                    options={dropdownOptions}
                    optionLabel="label"
                    optionValue="value"
                    onChange={(e) => setDropdownValue(e.value)}
                    placeholder="Select Option"
                  />
                  <label htmlFor="dropdown">Select Role</label>
                </span>
              </div>

              {/* Email and Mobile */}
              <div className="field col-5">
                <span className="p-float-label">
                  <InputText
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email">Email</label>
                </span>
              </div>
              <div className="field col-5">
                <span className="p-float-label">
                  <InputText
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <label htmlFor="mobile">Mobile</label>
                </span>
              </div>

              {/* PAN Card and Aadhar Card */}
              <div className="field col-5">
                <span className="p-float-label">
                  <InputText
                    id="panCard"
                    value={panCard}
                    onChange={(e) => setPanCard(e.target.value)}
                  />
                  <label htmlFor="panCard">PAN Card</label>
                </span>
              </div>
              <div className="field col-5">
                <span className="p-float-label">
                  <InputText
                    id="aadharCard"
                    value={aadharCard}
                    onChange={(e) => setAadharCard(e.target.value)}
                  />
                  <label htmlFor="aadharCard">Aadhar Card</label>
                </span>
              </div>

              <div className="field col-5">
                <span className="p-float-label">
                  <Dropdown
                    id="dropdownbranch"
                    value={dropdownValueBranch}
                    options={dropdownOptionsBranch}
                    optionLabel="label"
                    optionValue="value"
                    onChange={(e) => setDropdownValueBranch(e.value)}
                    placeholder="Select Branch"
                  />
                  <label htmlFor="dropdown">Select Branch</label>
                </span>
              </div>
            </div>
            <div
              className="buttons"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                label="Success"
                severity="success"
                raised
                onClick={handleAddStaff}
              />
            </div>
          </Sidebar>
        </div>
      )}
    </>
  );
};

export default StaffData;
