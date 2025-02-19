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

interface Customer {
  StudentBatch?: String;
  StudentClassMode?: String;
  ThearpyAttend?: String;
  TotalThearpyClassCount?: String;
  WeekDaysTiming?: String;
  WeekEndTiming?: String;
  refBranchId?: String;
  refCtEmail?: String;
  refCtMobile?: String;
  refPackageName?: String;
  refSCustId?: String;
  refStFName?: String;
  refStId?: String;
  refStLName?: String;
  refTherapy?: String;
  totalClassCount?: String;
  classAttendCount?: String;
  reCount?: String;
  // count?:object
}

type DecryptResult = any;
const ClassinfoOverview: React.FC = () => {
  const classData = [
    {
      category: "Old",
      adultMale: 25,
      adultFemale: 30,
      kids: 15,
    },
  ];
  const data = [
    { type: "Old", category: "Adult", male: 1, female: 1 },
    { type: "Old", category: "Kids", male: 1, female: 1 },
    { type: "New", category: "Adult", male: 1, female: 1 },
    { type: "New", category: "Kids", male: 1, female: 1 },
  ];
  const [toDate, _setToDate] = useState<Nullable<Date>>(new Date());

  const [packageCount, setPackageCount]:any = useState<any>([]);
  const [PreTimingCount, setPreTimingCount] = useState<any>([]);

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
        function countPackagesWithStudentTypes(data: any[]): {
          package: {
            name: string;
            count: number;
            studentType?: {
              name: string;
              count: number;
              userType?: {
                name: string;
                count: number;
                Gender?: { name: string; count: number }[];
              }[];
            }[];
          }[];
        } {
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
            }

            packageMap[packageName].count += 1;

            if (!packageMap[packageName].studentTypes[studentType]) {
              packageMap[packageName].studentTypes[studentType] = {
                count: 0,
                userTypes: {},
              };
            }

            packageMap[packageName].studentTypes[studentType].count += 1;

            if (
              !packageMap[packageName].studentTypes[studentType].userTypes[
                userType
              ]
            ) {
              packageMap[packageName].studentTypes[studentType].userTypes[
                userType
              ] = { count: 0, genders: {} };
            }

            packageMap[packageName].studentTypes[studentType].userTypes[
              userType
            ].count += 1;
            packageMap[packageName].studentTypes[studentType].userTypes[
              userType
            ].genders[gender] =
              (packageMap[packageName].studentTypes[studentType].userTypes[
                userType
              ].genders[gender] || 0) + 1;
          });

          const packageArray = Object.entries(packageMap).map(
            ([packageName, packageDetails]) => ({
              name: packageName,
              count: packageDetails.count,
              studentType: Object.entries(packageDetails.studentTypes).map(
                ([studentTypeName, studentTypeDetails]) => ({
                  name: studentTypeName,
                  count: studentTypeDetails.count,
                  userType: Object.entries(studentTypeDetails.userTypes).map(
                    ([userTypeName, userTypeDetails]) => ({
                      name: userTypeName,
                      count: userTypeDetails.count,
                      Gender: Object.entries(userTypeDetails.genders).map(
                        ([genderName, count]) => ({
                          name: genderName,
                          count,
                        })
                      ),
                    })
                  ),
                })
              ),
            })
          );

          return { package: packageArray };
        }
        const count: any = countPackagesWithStudentTypes(data.Data);
        console.log("count line ------ 222", count.package);
        setPackageCount(count.package);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Function to format date to yyyy-mm-dd
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

    console.log("********************", toDate ? toDate : new Date());
    handleDateChange(toDate ? toDate : new Date());
  }, []);
  return (
    <div>
      <div>
        <div className="flex flex justify-between -mt-3">
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
              <p className="font-bold mt-2">
                Total Class Count:{" "}
                {/* {customers.length > 0 ? customers[0].totalClassCount : "N/A"} */}
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
                  packageCount.map((element:any,index:any)=>(
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
                                Old -1
                              </th>
                              <th className="border border-gray-300 p-1 w-[full]" colSpan={2}>
                                New -1
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-gray-100 font-semibold text-center">
                              <td className="border border-gray-300 ">A - 1</td>
                              <td className="border border-gray-300 p-1">
                                K - 2{" "}
                              </td>
                              <td className="border border-gray-300 p-1">
                                A - 1
                              </td>
                              <td className="border border-gray-300 p-1">
                                K - 2{" "}
                              </td>
                            </tr>
                            <tr className=" text-center">
                              <td className="border border-gray-300 p-1">
                                M - 1
                              </td>
                              <td className="border border-gray-300 p-1">
                                M - 1
                              </td>
                              <td className="border border-gray-300 p-1">
                                M - 1
                              </td>
                              <td className="border border-gray-300 p-1">
                                M - 1
                              </td>
                            </tr>
                            <tr className=" text-center">
                              <td className="border border-gray-300 p-1">
                                F - 1
                              </td>
                              <td className="border border-gray-300 p-1">
                                F - 1
                              </td>
                              <td className="border border-gray-300 p-1">
                                F - 1
                              </td>
                              <td className="border border-gray-300 p-1">
                                F - 1
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
              <Accordion activeIndex={1}>
                <AccordionTab
                  header={
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg text-[#f95005]">
                        Class Timing
                      </span>

                      <span className="text-gray-600 text-md">
                        Count:{" "}
                        <span className="font-semibold text-gray-600">101</span>
                      </span>
                    </div>
                  }
                >
                  <div className="w-full">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-200 text-center font-bold ">
                          <th className="border border-gray-300 p-1 w-[full]">
                            Old
                          </th>
                          <th className="border border-gray-300 p-1 w-[full]">
                            Count:1
                          </th>

                          <th className="border border-gray-300 p-1">New</th>
                          <th className="border border-gray-300 p-1 ">
                            Count:1
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-100 font-semibold text-center">
                          <td className="border border-gray-300 ">A - 1</td>
                          <td className="border border-gray-300 p-1">K - 2 </td>
                          <td className="border border-gray-300 p-1">A - 1</td>
                          <td className="border border-gray-300 p-1">K - 2 </td>
                        </tr>
                        <tr className=" text-center">
                          <td className="border border-gray-300 p-1">M - 1</td>
                          <td className="border border-gray-300 p-1">M - 1</td>
                          <td className="border border-gray-300 p-1">M - 1</td>
                          <td className="border border-gray-300 p-1">M - 1</td>
                        </tr>
                        <tr className=" text-center">
                          <td className="border border-gray-300 p-1">F - 1</td>
                          <td className="border border-gray-300 p-1">F - 1</td>
                          <td className="border border-gray-300 p-1">F - 1</td>
                          <td className="border border-gray-300 p-1">F - 1</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>{" "}
                </AccordionTab>
              </Accordion>
              <Accordion activeIndex={1}>
                <AccordionTab
                  header={
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg text-[#f95005]">
                        Class Timing
                      </span>

                      <span className="text-gray-600 text-md">
                        Count:{" "}
                        <span className="font-semibold text-gray-600">101</span>
                      </span>
                    </div>
                  }
                >
                  <div className="w-full">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-200 text-center font-bold ">
                          <th className="border border-gray-300 p-1 w-[full]">
                            Old
                          </th>
                          <th className="border border-gray-300 p-1 w-[full]">
                            Count:1
                          </th>

                          <th className="border border-gray-300 p-1">New</th>
                          <th className="border border-gray-300 p-1 ">
                            Count:1
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-100 font-semibold text-center">
                          <td className="border border-gray-300 ">A - 1</td>
                          <td className="border border-gray-300 p-1">K - 2 </td>
                          <td className="border border-gray-300 p-1">A - 1</td>
                          <td className="border border-gray-300 p-1">K - 2 </td>
                        </tr>
                        <tr className=" text-center">
                          <td className="border border-gray-300 p-1">M - 1</td>
                          <td className="border border-gray-300 p-1">M - 1</td>
                          <td className="border border-gray-300 p-1">M - 1</td>
                          <td className="border border-gray-300 p-1">M - 1</td>
                        </tr>
                        <tr className=" text-center">
                          <td className="border border-gray-300 p-1">F - 1</td>
                          <td className="border border-gray-300 p-1">F - 1</td>
                          <td className="border border-gray-300 p-1">F - 1</td>
                          <td className="border border-gray-300 p-1">F - 1</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>{" "}
                </AccordionTab>
              </Accordion>
            </div>
            <div className="w-[40%] h-[max-content] bg-white shadow-lg rounded-xl p-4 ">
              <Accordion activeIndex={1}>
                <AccordionTab
                  header={
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg text-[#f95005]">
                        Therapy
                      </span>

                      <span className="text-gray-600 text-md">
                        Count:{" "}
                        <span className="font-semibold text-gray-600">101</span>
                      </span>
                    </div>
                  }
                >
                  <div className="w-full">
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr className="bg-gray-100 font-semibold text-center">
                          <td className="border border-gray-300 ">A - 1</td>
                          <td className="border border-gray-300 p-1">K - 2 </td>
                          <td className="border border-gray-300 p-1">A - 1</td>
                          <td className="border border-gray-300 p-1">K - 2 </td>
                        </tr>
                        <tr className=" text-center">
                          <td className="border border-gray-300 p-1">M - 1</td>
                          <td className="border border-gray-300 p-1">M - 1</td>
                          <td className="border border-gray-300 p-1">M - 1</td>
                          <td className="border border-gray-300 p-1">M - 1</td>
                        </tr>
                        <tr className=" text-center">
                          <td className="border border-gray-300 p-1">F - 1</td>
                          <td className="border border-gray-300 p-1">F - 1</td>
                          <td className="border border-gray-300 p-1">F - 1</td>
                          <td className="border border-gray-300 p-1">F - 1</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>{" "}
                </AccordionTab>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassinfoOverview;
