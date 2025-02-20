import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import CryptoJS from "crypto-js";
import "./ClassinfoOverview.css";
import { MultiSelect } from "primereact/multiselect";
import Axios from "axios";

import "react-toastify/dist/ReactToastify.css";

import { Nullable } from "primereact/ts-helpers";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Row } from "primereact/row";

type DecryptResult = any;
const ClassinfoOverview: React.FC = () => {
  const [toDate, _setToDate] = useState<Nullable<Date>>(new Date());

  const [packageCount, setPackageCount]: any = useState<any>([]);
  const [PreTimingCount, setPreTimingCount]: any = useState<any>([]);
  const [TherapyCount, setTherapyCount]: any = useState<any>([]);
  const [TotalCount, setTotalCount]= useState<number>();

  const [_refUtId, setUtId] = useState("");

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
  const handleDateChange = async (date: any) => {
    try {
      const formattedDate = formatDate(date.value ? date.value : new Date());

      const response = await Axios.post(
        import.meta.env.VITE_API_URL + "/classInfo/overView",
        {
          refMonth: formattedDate,
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
      console.log("Data:", data);

      if (data.token === false) {
        navigate("/expired");
      } else {
        localStorage.setItem("JWTtoken", "Bearer " + data.token + "");
        setTotalCount(data.Data.length)
        async function countPackagesWithStudentTypes(data: any[]): Promise<{
          package: {
            name: string;
            count: number;
            studentType: {
              name: string;
              count: number;
              userType: {
                name: string;
                count: number;
                Gender: { name: string; count: number }[];
              }[];
            }[];
          }[];
        }> {
          const studentTypes = ["Old", "New"];
          const userTypes = ["Kids", "Adult"];
          const genders = ["Male", "Female"];

          const packageMap: Record<
            string,
            {
              count: number;
              studentTypes: Record<
                string,
                {
                  count: number;
                  userTypes: Record<
                    string,
                    { count: number; genders: Record<string, number> }
                  >;
                }
              >;
            }
          > = {};

          data.forEach((item) => {
            const packageName = item.refPackageName;
            const studentType = item.studentType;
            const userType = item.userType;
            const gender = item.refStSex;

            if (!packageMap[packageName]) {
              packageMap[packageName] = { count: 0, studentTypes: {} };
              studentTypes.forEach((st) => {
                packageMap[packageName].studentTypes[st] = {
                  count: 0,
                  userTypes: {},
                };
                userTypes.forEach((ut) => {
                  packageMap[packageName].studentTypes[st].userTypes[ut] = {
                    count: 0,
                    genders: { Male: 0, Female: 0 },
                  };
                });
              });
            }

            packageMap[packageName].count += 1;
            packageMap[packageName].studentTypes[studentType].count += 1;
            packageMap[packageName].studentTypes[studentType].userTypes[userType].count += 1;
            packageMap[packageName].studentTypes[studentType].userTypes[userType].genders[gender] += 1;
          });

          const packageArray = Object.entries(packageMap).map(([packageName, packageDetails]) => ({
            name: packageName,
            count: packageDetails.count,
            studentType: studentTypes.map((studentTypeName) => ({
              name: studentTypeName,
              count: packageDetails.studentTypes[studentTypeName].count,
              userType: userTypes.map((userTypeName) => ({
                name: userTypeName,
                count: packageDetails.studentTypes[studentTypeName].userTypes[userTypeName].count,
                Gender: genders.map((genderName) => ({
                  name: genderName,
                  count: packageDetails.studentTypes[studentTypeName].userTypes[userTypeName].genders[genderName],
                })),
              })),
            })),
          }));

          return { package: packageArray };
        }
        const count: any = await countPackagesWithStudentTypes(data.Data);

        async function countWeekTimingsWithStudentTypes(data: any[]): Promise<{
          WeekTimings: {
            name: string;
            count: number;
            studentType: {
              name: string;
              count: number;
              userType: {
                name: string;
                count: number;
                Gender: { name: string; count: number }[];
              }[];
            }[];
          }[];
        }> {
          const studentTypes = ["Old", "New"];
          const userTypes = ["Kids", "Adult"];
          const genders = ["Male", "Female"];

          const timingMap: Record<
            string,
            {
              count: number;
              studentTypes: Record<
                string,
                {
                  count: number;
                  userTypes: Record<
                    string,
                    { count: number; genders: Record<string, number> }
                  >;
                }
              >;
            }
          > = {};

          data.forEach((item) => {
            const timings = [item.WeekDaysTiming, item.WeekEndTiming].filter(Boolean);
            const studentType = item.studentType;
            const userType = item.userType;
            const gender = item.refStSex;

            timings.forEach((timing) => {
              if (!timingMap[timing]) {
                timingMap[timing] = { count: 0, studentTypes: {} };
                studentTypes.forEach((st) => {
                  timingMap[timing].studentTypes[st] = {
                    count: 0,
                    userTypes: {},
                  };
                  userTypes.forEach((ut) => {
                    timingMap[timing].studentTypes[st].userTypes[ut] = {
                      count: 0,
                      genders: { Male: 0, Female: 0 },
                    };
                  });
                });
              }

              timingMap[timing].count += 1;
              timingMap[timing].studentTypes[studentType].count += 1;
              timingMap[timing].studentTypes[studentType].userTypes[userType].count += 1;
              timingMap[timing].studentTypes[studentType].userTypes[userType].genders[gender] += 1;
            });
          });

          const timingArray = Object.entries(timingMap).map(([timingName, timingDetails]) => ({
            name: timingName,
            count: timingDetails.count,
            studentType: studentTypes.map((studentTypeName) => ({
              name: studentTypeName,
              count: timingDetails.studentTypes[studentTypeName].count,
              userType: userTypes.map((userTypeName) => ({
                name: userTypeName,
                count: timingDetails.studentTypes[studentTypeName].userTypes[userTypeName].count,
                Gender: genders.map((genderName) => ({
                  name: genderName,
                  count: timingDetails.studentTypes[studentTypeName].userTypes[userTypeName].genders[genderName],
                })),
              })),
            })),
          }));

          return { WeekTimings: timingArray };
        }
        const count1: any = await countWeekTimingsWithStudentTypes(data.Data);

        async function countPendingTherapySessions(data: any[]): Promise<{
          Therapy: {
            name: string;
            count: number;
            userType: {
              name: string;
              count: number;
              Gender: { name: string; count: number }[];
            }[];
          }[];
        }> {
          const userTypes = ["Kids", "Adult"];
          const genders = ["Male", "Female"];
        
          const therapyMap: Record<
            string,
            {
              count: number;
              userTypes: Record<string, { count: number; genders: Record<string, number> }>;
            }
          > = {};
        
          // Process data
          data.forEach((item) => {
            const therapy = item.refTherapy;
            const totalTherapy = item.TotalThearpyClassCount ? Number(item.TotalThearpyClassCount) : 0;
            const attendTherapy = item.ThearpyAttend ? Number(item.ThearpyAttend) : 0;
            const userType = item.userType;
            const gender = item.refStSex;
        
            if (therapy === "Yes" && totalTherapy > attendTherapy) {
              if (!therapyMap[therapy]) {
                therapyMap[therapy] = { count: 0, userTypes: {} };
                userTypes.forEach((ut) => {
                  therapyMap[therapy].userTypes[ut] = { count: 0, genders: { Male: 0, Female: 0 } };
                });
              }
        
              therapyMap[therapy].count += 1;
              therapyMap[therapy].userTypes[userType].count += 1;
              therapyMap[therapy].userTypes[userType].genders[gender] += 1;
            }
          });
        
          // Convert to structured format
          const therapyArray = Object.entries(therapyMap).map(([therapyName, therapyDetails]) => ({
            name: therapyName,
            count: therapyDetails.count,
            userType: userTypes.map((userTypeName) => ({
              name: userTypeName,
              count: therapyDetails.userTypes[userTypeName].count,
              Gender: genders.map((genderName) => ({
                name: genderName,
                count: therapyDetails.userTypes[userTypeName].genders[genderName],
              })),
            })),
          }));
        
          return { Therapy: therapyArray };
        }
        
        // **Usage with `await`**
        const count2: any = await countPendingTherapySessions(data.Data);
        
        console.log('count2 line ------ 317', count2)


        setPreTimingCount(count1.WeekTimings)
        setPackageCount(count.package);
        setTherapyCount(count2.Therapy)
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("refUtId");
    if (token) {
      setUtId(token);
    }
    handleDateChange(toDate ? toDate : new Date());
  }, []);
  return (
    <div>
      <div>
        <div className="flex justify-between -mt-3">
          {" "}
          <div className="flex flex-row gap`-5">
            <Calendar
              className="h-[80%]"
              value={toDate}
              onChange={handleDateChange}
              dateFormat="MM yy"
              view="month"
              showButtonBar
              placeholder="Select Month"
            />
            <div>
              <p className="font-bold mt-2 ml-3">
                Total Class Count: {TotalCount}
              </p>
            </div>
          </div>
          <div className="font-bold mt-2 text-[#f95005] ">
            {" "}
            A-Adult , K-Kids , M-Male , F-Female
          </div>
        </div>

        <div className="-mt-2">
          <div className="flex flex-row gap-1 w-[full]">
            <div className="w-[40%] h-[max-content] bg-white shadow-lg rounded-xl p-4 ">
              <div className="card">

                {
                  packageCount.map((element: any, index: any) => (
                    <Accordion activeIndex={1}>
                      <AccordionTab
                        header={
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg text-[#f95005]">
                              {element.name}
                            </span>

                            <span className="text-gray-600 text-md">
                              Count:{" "}
                              <span className="font-semibold text-gray-600">
                                {element.count}
                              </span>
                            </span>
                          </div>
                        }
                      >
                        <div className="w-full">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-200 text-center font-bold ">
                                <th className="border border-gray-300 p-1 w-[full]" colSpan={2}>
                                  {element.studentType[0].name} - {element.studentType[0].count}
                                </th>
                                <th className="border border-gray-300 p-1 w-[full]" colSpan={2}>
                                  {element.studentType[1].name} - {element.studentType[1].count}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-gray-100 font-semibold text-center">
                                <td className="border border-gray-300 ">
                                  {element.studentType[0].userType[0].name == "Kids" ? "K" : "A"} - {element.studentType[0].userType[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[1].name == "Adult" ? "A" : "K"} - {element.studentType[0].userType[1].count}

                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[0].name == "Kids" ? "K" : "A"} - {element.studentType[1].userType[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[1].name == "Adult" ? "A" : "K"} - {element.studentType[1].userType[1].count}
                                </td>
                              </tr>
                              <tr className=" text-center">
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[0].Gender[0].name == "Male" ? "M" : "F"} - {element.studentType[0].userType[0].Gender[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[1].Gender[0].name == "Male" ? "M" : "F"} - {element.studentType[0].userType[1].Gender[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[0].Gender[0].name == "Male" ? "M" : "F"} - {element.studentType[1].userType[0].Gender[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[1].Gender[0].name == "Male" ? "M" : "F"} - {element.studentType[1].userType[1].Gender[0].count}
                                </td>
                              </tr>
                              <tr className=" text-center">
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[0].Gender[1].name == "Male" ? "M" : "F"} - {element.studentType[0].userType[0].Gender[1].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[1].Gender[1].name == "Male" ? "M" : "F"} - {element.studentType[0].userType[1].Gender[1].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[0].Gender[1].name == "Male" ? "M" : "F"} - {element.studentType[1].userType[0].Gender[1].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[1].Gender[1].name == "Male" ? "M" : "F"} - {element.studentType[1].userType[1].Gender[1].count}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>{" "}
                      </AccordionTab>
                    </Accordion>
                  ))
                }



              </div>
            </div>

            <div className="w-[40%] h-[max-content] bg-white shadow-lg rounded-xl p-4 ">
              <div className="card">
                {
                  PreTimingCount.map((element: any, index: any) => (
                    <Accordion activeIndex={1}>
                      <AccordionTab
                        header={
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg text-[#f95005]">
                              {element.name}
                            </span>

                            <span className="text-gray-600 text-md">
                              Count:{" "}
                              <span className="font-semibold text-gray-600">
                                {element.count}
                              </span>
                            </span>
                          </div>
                        }
                      >
                        <div className="w-full">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-200 text-center font-bold ">
                                <th className="border border-gray-300 p-1 w-[full]" colSpan={2}>
                                  {element.studentType[0].name} - {element.studentType[0].count}
                                </th>
                                <th className="border border-gray-300 p-1 w-[full]" colSpan={2}>
                                  {element.studentType[1].name} - {element.studentType[1].count}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-gray-100 font-semibold text-center">
                                <td className="border border-gray-300 ">
                                  {element.studentType[0].userType[0].name == "Kids" ? "K" : "A"} - {element.studentType[0].userType[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[1].name == "Adult" ? "A" : "K"} - {element.studentType[0].userType[1].count}

                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[0].name == "Kids" ? "K" : "A"} - {element.studentType[1].userType[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[1].name == "Adult" ? "A" : "K"} - {element.studentType[1].userType[1].count}
                                </td>
                              </tr>
                              <tr className=" text-center">
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[0].Gender[0].name == "Male" ? "M" : "F"} - {element.studentType[0].userType[0].Gender[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[1].Gender[0].name == "Male" ? "M" : "F"} - {element.studentType[0].userType[1].Gender[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[0].Gender[0].name == "Male" ? "M" : "F"} - {element.studentType[1].userType[0].Gender[0].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[1].Gender[0].name == "Male" ? "M" : "F"} - {element.studentType[1].userType[1].Gender[0].count}
                                </td>
                              </tr>
                              <tr className=" text-center">
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[0].Gender[1].name == "Male" ? "M" : "F"} - {element.studentType[0].userType[0].Gender[1].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[0].userType[1].Gender[1].name == "Male" ? "M" : "F"} - {element.studentType[0].userType[1].Gender[1].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[0].Gender[1].name == "Male" ? "M" : "F"} - {element.studentType[1].userType[0].Gender[1].count}
                                </td>
                                <td className="border border-gray-300 p-1">
                                  {element.studentType[1].userType[1].Gender[1].name == "Male" ? "M" : "F"} - {element.studentType[1].userType[1].Gender[1].count}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>{" "}
                      </AccordionTab>
                    </Accordion>
                  ))
                }



              </div>
            </div>
            <div className="w-[40%] h-[max-content] bg-white shadow-lg rounded-xl p-4 ">
              <div className="card">
                {
                  TherapyCount.map((element: any, index: any) => (
                    <Accordion activeIndex={1}>
                      <AccordionTab
                        header={
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg text-[#f95005]">
                              Therapy
                            </span>

                            <span className="text-gray-600 text-md">
                              Count:{" "}
                              <span className="font-semibold text-gray-600">
                                {element.count}
                              </span>
                            </span>
                          </div>
                        }
                      >
                        <div className="w-full">
                          <table className="w-full border-collapse border border-gray-300">
                            <tbody>
                              <tr className="bg-gray-100 font-semibold text-center">
                                <td className="border border-gray-300 ">
                                  {element.userType[0].name == "Kids" ? "K" : "A"} - {element.userType[0].count}
                                </td>
                                
                                <td className="border border-gray-300 p-1">
                                  {element.userType[1].name == "Kids" ? "K" : "A"} - {element.userType[1].count}
                                </td>
                               
                              </tr>
                              <tr className=" text-center">
                                <td className="border border-gray-300 p-1">
                                  {element.userType[0].Gender[0].name == "Male" ? "M" : "F"} - {element.userType[0].Gender[0].count}
                                </td>
                                
                                <td className="border border-gray-300 p-1">
                                  {element.userType[1].Gender[0].name == "Male" ? "M" : "F"} - {element.userType[1].Gender[0].count}
                                </td>
                                
                              </tr>
                              <tr className=" text-center">
                                <td className="border border-gray-300 p-1">
                                  {element.userType[0].Gender[1].name == "Male" ? "M" : "F"} - {element.userType[0].Gender[1].count}
                                </td>
                                
                                <td className="border border-gray-300 p-1">
                                  {element.userType[1].Gender[1].name == "Male" ? "M" : "F"} - {element.userType[1].Gender[1].count}
                                </td>
                                
                              </tr>
                            </tbody>
                          </table>
                        </div>{" "}
                      </AccordionTab>
                    </Accordion>
                  ))
                }



              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassinfoOverview;
