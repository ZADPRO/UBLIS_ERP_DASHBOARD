import Axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { Skeleton } from "primereact/skeleton";
import PrintPDF from "../PrintPDF/PrintPDF";
import { Stepper } from 'primereact/stepper';

import { StepperPanel } from 'primereact/stepperpanel';
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import {
    InputNumber,
} from "primereact/inputnumber";
import { Button } from "primereact/button";
// import { Divider } from "primereact/divider";
// import { FloatLabel } from "primereact/floatlabel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
// import { Console } from "console";

// type UserDetails = {
//     refBatchId: number;
//     refBranchId: number;
//     refFees: number;
//     refPaId: number;
//     refPackageName: string;
//     refSCustId: string;
//     refStFName: string;
//     refStId: number;
//     refWTimingId: string;
//     refWeTimingId: string;
//     weekDaysTiming: string | null;
//     weekEndTiming: string | null;
// };

declare global {
    interface Window {
        Razorpay: any;
    }
}


interface PackageUserData {
    new_User: boolean;
    nextMonth: string;
    refBranchId: number;
    refCtEmail: string;
    refName: string;
    refPackageName: string;
    refSCustId: string;
    refStId: number;
    refTimeMembers: string;
    refCtMobile: number

}

interface PackageDetails {
    refPackageName: string;
    new_User: string;
    case: string;
    refBranchName: string;
    refDaysArray: string[];
    refFeesType: string;
    refFees: any;
    refClsDuration: string;
    refClsCount: string;
}

interface CustomPackageDetails {
    refCustomPaId: number;
    refBranchId: number;
    refFeesAmt: number;
}

interface TherapyCounts {
    Payed_Count: number;
    Total_Therapy_Count: number;
    Pending_Count: number;
    Therapy_Fees: number;
}

interface OfferDetailsProps {
    refEndDate: string;
    refExDate: string;
    refFees: number;
    refOfferId: number;
    refOfferName: string;
    refOfferType: number;
    refOfferValue: number;
    refStartDate: string;
}

interface ExtraOffer {
    points_Need: string;
    total_points: string;
    use_Offer: boolean;
}

type DecryptResult = any;

// Define the type for the props
interface PriceSidebarProps {
    refStId?: any;
    closePayment?: any
}

type TableDataType =
    | {
        month: string;
        count: any;
        monthFees: string;
    }
    | {
        month: string;
        count: string;
        monthFees: string;
        therapyAllocated: number;
        paidClasses: number;
        pendingClasses: number;
        therapyFees: string;
        totalPendingFee: number;
        isTotal: boolean;
    };



const PriceSidebar: React.FC<PriceSidebarProps> = ({ refStId, closePayment }) => {

    const decrypt = (
        encryptedData: string,
        iv: string,
        key: string
    ): DecryptResult => {
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

        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        return JSON.parse(decryptedString);
    };

    const [pageLoading, setPageLoading] = useState({
        verifytoken: false,
        pageData: false,
    });

    const stepperRef = useRef<Stepper | null>(null);
    const [packageUserDetails, setPackageUserDetails] =
        useState<PackageUserData | null>();
    const [_date, setDate] = useState<Nullable<Date>>(null);
    const [extraOfferDetails, setExtraOfferDetails] =
        useState<ExtraOffer | null>();
    const [onlineCountPackage, setOnlineCountPackage] = useState("");
    const [offlineCountPackage, setOfflineCountPackage] = useState("");
    const [packageDetailsUsers, setPackageDetailsUsers] =
        useState<PackageDetails>();
    const [customPackageDetails, setCustomPackageDetails] =
        useState<CustomPackageDetails | null>();
    const [userTherapyCount, setUserTherapyCount] =
        useState<TherapyCounts | null>();
    const [offerDetails, setOfferDetails] = useState<OfferDetailsProps | null>();
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const navigate = useNavigate();

    const [numClasses, setNumClasses] = useState<any>(0);

    const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    const [toDate, setTodate] = useState<Nullable<Date>>(null);
    const [minDate, setMinDate] = useState<Date | undefined>(undefined);

    const [tableData, setTableData] = useState<TableDataType[]>([]); const [totalAmount, setTotalAmount] = useState(0);

    const [userdata, setuserdata] = useState({
        username: "",
        usernameid: "",
        profileimg: { contentType: "", content: "" },
    });

    const [orderId, setOrderId] = useState<string>()
    const [freeClass, setFreeClass] = useState<boolean>(false)
    const [payInOnline, setPayInOnline] = useState<number>(0);
    const [payInCash, setPayInCash] = useState<number>(0)

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
        });
        if (fromDate && toDate) {
            generateTableData();
        }
    }, [fromDate, toDate]);

    useEffect(() => {
        if (packageDetailsUsers) {
            setSelectedPackage("packageDetails");
        } else if (customPackageDetails) {
            setSelectedPackage("customPackage");
        }
    }, [packageDetailsUsers, customPackageDetails]);



    const [_sessionCounts, setSessionCounts] = useState<{ month: string; count: number }[]>([]);
    const [classCount, _setClassCount] = useState<number[]>([])

    const generateTableData = () => {

        const monthsData = [];
        let sessionCountsArray = [];
        let totalFee = 0;

        const startDate = fromDate ? new Date(fromDate) : new Date();
        const endDate = toDate ? new Date(toDate) : new Date();
        const today = new Date();

        startDate.setDate(1);
        endDate.setDate(1);


        console.log('packageDetailsUsers --> line 241', packageDetailsUsers)

        if (packageDetailsUsers?.refFeesType === "2") {

            const startDateObj = new Date(startDate);

            let endDateObj = new Date(startDateObj); // Default to start date
            if (packageDetailsUsers?.refClsDuration) {
                const duration = parseInt(packageDetailsUsers.refClsDuration, 10);
                endDateObj.setMonth(startDateObj.getMonth() + duration - 1);
            }

            const start = startDateObj.toLocaleString("en-US", {
                month: "long",
                year: "numeric",
            });
            const end = endDateObj.toLocaleString("en-US", {
                month: "long",
                year: "numeric",
            });

            setTodate(endDateObj);

            const monthName = `${start} to ${end}`;

            monthsData.push({
                month: monthName,
                count: packageDetailsUsers?.refClsCount,
                monthFees: `₹ ${packageDetailsUsers?.refFees.toFixed(2)}`,
            });

            totalFee = packageDetailsUsers?.refFees ?? 0;

        }
        else {
            if (selectedPackage === "customPackage") {
                const monthName = startDate.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                });


                monthsData.push({
                    month: monthName,
                    count: numClasses,
                    monthFees: `₹ ${((customPackageDetails?.refFeesAmt || 0) * (parseInt(numClasses))).toFixed(2)}`,
                });
                classCount.push(parseInt(numClasses))

                sessionCountsArray.push({ month: monthName, count: parseInt(numClasses) });

                totalFee = parseInt(((customPackageDetails?.refFeesAmt || 0) * (parseInt(numClasses))).toFixed(2));

            }
            else {

                while (startDate <= endDate) {
                    const monthName = startDate.toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                    });

                    let monthFees = parseFloat(packageDetailsUsers?.refFees) || 0;
                    let sessionCount = 0;

                    const daysInMonth = new Date(
                        startDate.getFullYear(),
                        startDate.getMonth() + 1,
                        0
                    ).getDate();

                    for (let day = 1; day <= daysInMonth; day++) {
                        const currentDay = new Date(
                            startDate.getFullYear(),
                            startDate.getMonth(),
                            day
                        );
                        const dayName = currentDay.toLocaleString("en-US", { weekday: "long" });

                        if (packageDetailsUsers?.refDaysArray.includes(dayName)) {
                            sessionCount++;
                        }
                    }

                    // Store session count in the array
                    sessionCountsArray.push({ month: monthName, count: sessionCount });
                    console.log('sessionCountsArray line ----- 397', sessionCountsArray)

                    if (
                        packageDetailsUsers?.new_User &&
                        startDate.getMonth() === today.getMonth() &&
                        startDate.getFullYear() === today.getFullYear()
                    ) {
                        monthFees = (monthFees / sessionCount) * sessionCount * 0.5; // Reduce fees by 50%
                    }

                    monthsData.push({
                        month: monthName,
                        count: sessionCount,
                        monthFees: `₹ ${monthFees.toFixed(2)}`,
                    });
                    classCount.push(sessionCount)
                    console.log('classCount line ----- 413', classCount)

                    console.log('monthsData line ------ 415', monthsData)
                    totalFee += monthFees;
                    startDate.setMonth(startDate.getMonth() + 1);
                }
            }
        }





        // Store the session counts array in state or log it for later use
        console.log("Session Counts Array:", sessionCountsArray);
        setSessionCounts(sessionCountsArray);

        // Add total row
        monthsData.push({
            month: "Total",
            count: "",
            monthFees: `₹ ${totalFee.toFixed(2)}`,
            therapyAllocated: userTherapyCount?.Total_Therapy_Count || 0,
            paidClasses: userTherapyCount?.Payed_Count || 0,
            pendingClasses: userTherapyCount?.Pending_Count || 0,
            therapyFees: `₹ ${userTherapyCount?.Therapy_Fees || 0}`,
            totalPendingFee:
                (userTherapyCount?.Pending_Count || 0) *
                (userTherapyCount?.Therapy_Fees || 0),
            isTotal: true,
        });

        setTotalAmount(totalFee);
        setTableData(monthsData);
        // setClassCount
    };


    const fetchData = async () => {

        console.log('refStId', refStId)

        try {
            const response = await Axios.post(
                import.meta.env.VITE_API_URL + "/userPayment/PayFromDate",
                {
                    refStId: refStId,
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

            console.log("Payfrom date", data);
            setPackageUserDetails(data.data.UserData[0]);
            setDate(new Date(data.data.UserData[0].nextMonth));
            setOnlineCountPackage(data.data.Online_Count);
            setOfflineCountPackage(data.data.Offline_Count);
            setPackageDetailsUsers(data.data.Package[0]);
            setCustomPackageDetails(data.data.Package[1]);
            setUserTherapyCount(data.data.threapyCount);
            console.log('data.data.threapyCount line -------- 450', data.data.threapyCount)
            const nextMonthDate = new Date(data.data.UserData[0].nextMonth);
            setFromDate(nextMonthDate);
            setTodate(nextMonthDate)
            setMinDate(nextMonthDate);

            if (data.token === false) {
                navigate("/expired");
                return;
            }

            localStorage.setItem("JWTtoken", "Bearer " + data.token);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {

        fetchData();
    }, []);

    // useEffect(() => {
    //     if (packageUserDetails?.nextMonth) {
    //         const nextMonthDate = new Date(packageUserDetails.nextMonth);
    //         setFromDate(nextMonthDate);
    //         setMinDate(nextMonthDate);
    //     }
    // }, [packageUserDetails]);

    const fetchUserDetails = async (newDate: any) => {
        console.log("newDate", newDate);
        try {
            const response = await Axios.post(
                import.meta.env.VITE_API_URL + "/userPayment/PayFromDate",
                {
                    StartMonth: newDate,
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

            console.log("Payfrom date", data);
            setPackageUserDetails(data.data.UserData[0]);
            setDate(new Date(data.data.UserData[0].nextMonth));
            setOnlineCountPackage(data.data.Online_Count);
            setOfflineCountPackage(data.data.Offline_Count);
            setPackageDetailsUsers(data.data.Package[0]);
            setCustomPackageDetails(data.data.Package[1]);
            setUserTherapyCount(data.data.threapyCount);

            if (data.token === false) {
                navigate("/expired");
                return;
            }

            localStorage.setItem("JWTtoken", "Bearer " + data.token);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const moveToNextStep = async () => {
        try {
            const response = await Axios.post(
                import.meta.env.VITE_API_URL + "/userPayment/offerPointsValidation",
                {
                    refStId: packageUserDetails?.refStId,
                    refStartDate: formatDate(fromDate),
                    refEndDate: formatDate(toDate),
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
            console.log("data =>>>>>>>>>", data);
            if (data.success) {
                setExtraOfferDetails(data.data[0]);
            }
            if (data.token === false) {
                navigate("/expired");
                return;
            }

            localStorage.setItem("JWTtoken", "Bearer " + data.token);
            stepperRef.current?.nextCallback();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // const formatDate = (date?: Date | null) => {
    //     if (!date) return ""; 
    //     return new Date(date).toISOString().split("T")[0];
    // };

    const formatDate = (date: any): string => {
        return new Intl.DateTimeFormat("en-CA").format(date); // 'en-CA' gives YYYY-MM-DD format
    };

    const [couponValue, setCouponValue] = useState("");
    // const [couponMessage, setCouponMessage] = useState("");
    const [offerApplied, setOfferApplied] = useState<number>()
    const validateTokenFunc = async () => {
        console.log("couponValue", couponValue);
        try {
            const response = await Axios.post(
                import.meta.env.VITE_API_URL + "/userPayment/verifyCoupon",
                {
                    refCoupon: couponValue,
                    refFees: totalAmount,
                    refStartDate: formatDate(fromDate),
                    refEndDate: formatDate(toDate),
                    refStId: 20,
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

            console.log("Offer Details line ------ 630", data);

            if (data.token === false) {
                navigate("/expired");
                return;
            }
            localStorage.setItem("JWTtoken", "Bearer " + data.token);
            if (data.success) {
                setOfferApplied(1)
                setOfferDetails(data.data);
                toast.success("Coupon Code Applied Successfully", {
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
                // setCouponMessage("Invalid Coupon Data");
                toast.error("Invalid or Expire Coupon Code", {
                    position: "top-right",
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    // transition: Bounce,
                });
            }




        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleDateChange = (e: any) => {

        if (e.value instanceof Date) {
            setFromDate(e.value);
            setTodate(e.value)
            fetchUserDetails(e.value);
        }
    };

    const subTotal =
        (offerDetails?.refFees ?? totalAmount) +
        (userTherapyCount?.Pending_Count && userTherapyCount?.Therapy_Fees
            ? userTherapyCount.Pending_Count * userTherapyCount.Therapy_Fees
            : 0);

    const gst = subTotal * 0.18; // 18% GST

    const grandTotal = (subTotal + gst).toFixed(2);

    const confirmPayment = (amount: GLfloat) => {
        setPayInOnline(parseFloat(grandTotal) - amount)
        confirmDialog({
            message: `Are you sure you want to proceed with the payment? In Cash: ₹ ${amount}, Online: ₹ ${parseFloat(grandTotal) - amount}.`,
            header: 'Payment Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                handlePayment(parseFloat(grandTotal) - amount);
            },
            reject: () => console.log("Payment cancelled"),
        });
    };


    const handlePayment = (amount: any) => {

        const FinalAmount = amount

        if (selectedPaymentMethod === "credit_card") {
            let finalAmount = parseFloat(payInOnline.toString());

            if (selectedPaymentMethod === "credit_card") {
                finalAmount += finalAmount * 0.03;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: Math.round(finalAmount * 100),
                currency: "INR",
                name: "Ublisyoga",
                description: "Payment for services",
                handler: function (response: any) {

                    paymentToBackend(
                        response.razorpay_payment_id,
                        Math.round(finalAmount * 100),
                        Math.round(finalAmount * 100),
                        (finalAmount / 100) * 3
                    );
                    stepperRef.current?.nextCallback();
                },
                prefill: {
                    name: packageUserDetails?.refName,
                    email: packageUserDetails?.refCtEmail,
                    contact: packageUserDetails?.refCtMobile,
                },
                method: {
                    upi: false,
                    card: true,
                    netbanking: false,
                    wallet: false,
                },
                theme: {
                    color: "#f95005",
                },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } else if (selectedPaymentMethod === "debit_card") {
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: FinalAmount * 100,
                currency: "INR",
                name: "Ublisyoga",
                description: "Payment for services",
                handler: function (response: any) {

                    paymentToBackend(response.razorpay_payment_id, FinalAmount, FinalAmount);

                    stepperRef.current?.nextCallback();
                },
                prefill: {
                    name: packageUserDetails?.refName,
                    email: packageUserDetails?.refCtEmail,
                    contact: packageUserDetails?.refCtMobile,
                },
                method: {
                    upi: false,
                    card: true,
                    netbanking: false,
                    wallet: false,
                },
                theme: {
                    color: "#f95005",
                },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } else if (selectedPaymentMethod === "upi") {
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: FinalAmount * 100,
                currency: "INR",
                name: "Ublisyoga",
                description: "Payment for services",
                handler: function (response: any) {

                    paymentToBackend(response.razorpay_payment_id, FinalAmount, FinalAmount);

                    stepperRef.current?.nextCallback();
                },
                prefill: {
                    name: packageUserDetails?.refName,
                    email: packageUserDetails?.refCtEmail,
                    contact: packageUserDetails?.refCtMobile,
                },
                method: {
                    upi: true,
                    card: false,
                    netbanking: false,
                    wallet: false,
                },
                theme: {
                    color: "#f95005",
                },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } else if (selectedPaymentMethod === "net_banking") {
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: FinalAmount * 100,
                currency: "INR",
                name: "Ublisyoga",
                description: "Payment for services",
                handler: function (response: any) {
                    paymentToBackend(response.razorpay_payment_id, FinalAmount, FinalAmount);

                    stepperRef.current?.nextCallback();
                },
                prefill: {
                    name: packageUserDetails?.refName,
                    email: packageUserDetails?.refCtEmail,
                    contact: packageUserDetails?.refCtMobile,
                },
                method: {
                    upi: false,
                    card: false,
                    netbanking: true,
                    wallet: false,
                },
                theme: {
                    color: "#f95005",
                },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        }
        else if (selectedPaymentMethod === "cash_online") {
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: FinalAmount * 100,
                currency: "INR",
                name: "Ublisyoga",
                description: "Payment for services",
                handler: function (response: any) {

                    paymentToBackend(response.razorpay_payment_id, FinalAmount, FinalAmount);

                    stepperRef.current?.nextCallback();
                },
                prefill: {
                    name: packageUserDetails?.refName,
                    email: packageUserDetails?.refCtEmail,
                    contact: packageUserDetails?.refCtMobile,
                },
                method: {
                    upi: true,
                    card: false,
                    netbanking: true,
                    wallet: true,
                },
                theme: {
                    color: "#f95005",
                },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        }

    };



    const paymentToBackend = async (transactionId: string, amountPaid: any, onlineCashPay?: any, paymentCharge?: any) => {
        console.log('amountPaid', amountPaid)

        stepperRef.current?.nextCallback()
        try {
            const pendingCount = userTherapyCount?.Pending_Count ?? 0;
            const therapyFees = userTherapyCount?.Therapy_Fees ?? 0;


            const requestData: any = {
                refStId: packageUserDetails?.refStId,
                refTransId: transactionId,
                refFeesType: 1,
                refFeesPaid: grandTotal,
                refCollectedBy: 20,
                refPayStatus: true,
                refPaymentCharge: paymentCharge || 0,
                refOnlineCashAmt: onlineCashPay || 0,
                refOfflineCashAmt: payInCash,
                refPaymentMethod: selectedPaymentMethod,
                classPackage: {
                    refPackage: packageDetailsUsers?.refPackageName,
                    refPayFrom: formatDate(fromDate),
                    refPayTo: formatDate(toDate),
                    refPagExp: formatDate(toDate),
                    refOffId: offerDetails?.refOfferId,
                    refOffType: offerDetails?.refOfferType,
                    refPagFees: totalAmount,
                    refTotalClassCount: classCount,
                    refPayTyId: 2,
                    refCustomClass: false,
                    refClimedFreeCourse: freeClass,
                },
                ...(pendingCount > 0 && {
                    Therapy: {
                        refOffId: null,
                        refOffType: null,
                        refPagFees: pendingCount * therapyFees,
                        refTotalClassCount: pendingCount,
                        refPayTyId: 3,
                    },
                }),
            };

            console.log('requestData line ----- 818', requestData)
            const response = await Axios.post(
                import.meta.env.VITE_API_URL + "/userPayment/newPayment",
                requestData,
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

            if (data.success) {
                console.log("Payment success", data);
                setOrderId(data.orderId)
            }
            // else {
            //     setCouponMessage("Payment store failed");
            // }

            if (data.token === false) {
                navigate("/expired");
                return;
            }

            localStorage.setItem("JWTtoken", "Bearer " + data.token);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };



    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const denominations = [500, 200, 100, 50, 20, 10, "Coins"];
    const [collectedCash, setCollectedCash] = useState(
        denominations.map((denomination) => ({
            cashType: denomination,
            count: 0,
        }))
    );
    const [returnedCash, setReturnedCash] = useState(
        denominations.map((denomination) => ({
            cashType: denomination,
            count: 0,
        }))
    );

    const handleCountChange = (value: number, rowData: any) => {
        const updatedData = collectedCash.map((item) =>
            item.cashType === rowData.cashType ? { ...item, count: value } : item
        );
        setCollectedCash(updatedData);
    };
    const handleReturnedCountChange = (value: number, rowData: any) => {
        const updatedData = returnedCash.map((item) =>
            item.cashType === rowData.cashType ? { ...item, count: value } : item
        );
        setReturnedCash(updatedData);
    };

    const calculateTotal = () => {
        return collectedCash.reduce((total, item) => {
            const amount = item.cashType === "Coins"
                ? item.count * 1
                : Number(item.cashType) * item.count;
            return total + amount;
        }, 0);
    };

    const calculateReturnedTotal = () => {
        return returnedCash.reduce((total, item) => {
            const amount = item.cashType === "Coins"
                ? item.count * 1 :
                Number(item.cashType) * item.count;
            return total + amount;
        }, 0);
    };

    const dataTableValues = [
        {
            description: "Grand Total",
            amount: (
                Math.round(
                    (offerDetails?.refFees ?? totalAmount) +
                    (userTherapyCount?.Pending_Count && userTherapyCount?.Therapy_Fees
                        ? userTherapyCount.Pending_Count * userTherapyCount.Therapy_Fees
                        : 0) +
                    ((offerDetails?.refFees ?? totalAmount) +
                        (userTherapyCount?.Pending_Count &&
                            userTherapyCount?.Therapy_Fees
                            ? userTherapyCount.Pending_Count * userTherapyCount.Therapy_Fees
                            : 0)) * 0.18
                )
            ).toFixed(2),
        },
        {
            description: "Amount Collected in Cash",
            amount: (calculateTotal() - calculateReturnedTotal()).toFixed(2),
        },
        {
            description: "Balance Amount",
            amount: (
                (calculateTotal() - calculateReturnedTotal()) -
                (
                    Math.round(
                        (offerDetails?.refFees ?? totalAmount) +
                        (userTherapyCount?.Pending_Count && userTherapyCount?.Therapy_Fees
                            ? userTherapyCount.Pending_Count * userTherapyCount.Therapy_Fees
                            : 0) +
                        ((offerDetails?.refFees ?? totalAmount) +
                            (userTherapyCount?.Pending_Count &&
                                userTherapyCount?.Therapy_Fees
                                ? userTherapyCount.Pending_Count * userTherapyCount.Therapy_Fees
                                : 0)) * 0.18
                    )
                )
            ).toFixed(2),
        },
    ];
    useEffect(() => {
        const cashEntry = dataTableValues.find(item => item.description === "Amount Collected in Cash");
        if (cashEntry) {
            setPayInCash(parseFloat(cashEntry.amount));  // Convert string to number
        }
    }, [dataTableValues]);
    return (
        <div>
            <ToastContainer />

            {pageLoading.verifytoken && pageLoading.pageData ? (
                <>
                    <div className="bg-[#f6f5f5]">
                        <div className="headerPrimary">
                            <h3>Payment</h3>
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
                <div>
                    <div className="lg:block hidden">
                        <div className="headerPrimary fixed w-[95.5%]">
                            <h3>Payment</h3>
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
                    </div>

                    <div className="lg:mt-[70px]">
                        <Stepper ref={stepperRef} style={{ flexBasis: "50rem" }}>
                            <StepperPanel header="Basic Details">
                                <div className="flex flex-column">
                                    <div className="border-2  surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium lg:pb-0 pb-3">
                                        <div className="card w-[100%] flex lg:flex-row flex-col align-items-center justify-center">
                                            <div className="lg:w-[50%] flex flex-col align-items-center justify-center mt-4">
                                                <div className="lg:w-[100%] flex flex-col align-items-center">
                                                    {packageUserDetails && (
                                                        <div className="border-3 border-white rounded-lg lg:w-[80%] lg:p-3 p-2 ">
                                                            <p><b>Customer Id : </b>{packageUserDetails.refSCustId}</p>
                                                            <p><b>Name : </b>{packageUserDetails.refName}</p>
                                                            <p>
                                                                <b>Batch : </b>{packageUserDetails.refTimeMembers}{" "}
                                                            </p>
                                                            <p>
                                                                <b>Package : </b> {packageUserDetails.refPackageName}{" "}
                                                            </p>
                                                        </div>
                                                    )}

                                                </div>
                                                <div className="w-[90%] flex flex-col my-3 justify-center align-items-center text-center">
                                                    <b className="my-2">Select Starting Payment Month</b>
                                                    <Calendar
                                                        value={fromDate}
                                                        placeholder="From Date"
                                                        onChange={handleDateChange}
                                                        view="month"
                                                        dateFormat="mm/yy"
                                                        minDate={minDate}
                                                        className="lg:w-[40%]"
                                                    />

                                                    <p>
                                                        Total Class Attended for the Selected Month is
                                                        <b> {Number(onlineCountPackage) + Number(offlineCountPackage)}</b>
                                                    </p>
                                                    <div className="flex lg:flex-row flex-col w-[100%] justify-between">
                                                        <p>Online Class Attended Count : <b>{onlineCountPackage}</b></p>
                                                        <p>Offline Class Attended Count : <b>{offlineCountPackage}</b></p></div>

                                                </div>
                                            </div>
                                            <div className="lg:w-[50%]">
                                                {/* Package Selection as Radio Buttons */}
                                                <div className="flex flex-col gap-2">
                                                    <h3>Select Package</h3>

                                                    {packageDetailsUsers && (
                                                        <div className="border-2 border-white rounded-lg lg:w-[80%] lg:px-3 lg:py-3 py-3 px-5 lg:ml-5 ">
                                                            <input
                                                                type="radio"
                                                                id="packageDetails"
                                                                name="package"
                                                                value="packageDetails"
                                                                checked={selectedPackage === "packageDetails"}
                                                                onChange={() => { setNumClasses(""); setSelectedPackage("packageDetails") }}
                                                            />
                                                            <label htmlFor="packageDetails">
                                                                {packageDetailsUsers.refPackageName}
                                                            </label>

                                                            {selectedPackage === "packageDetails" && (
                                                                <div style={{ marginLeft: "20px", marginTop: "10px" }} className="flex  flex-col lg:gap-1">
                                                                    <div className="flex flex-row justify-between"><p>
                                                                        <strong>Branch:</strong>{" "}
                                                                        {packageDetailsUsers.refBranchName}
                                                                    </p>
                                                                        <p>
                                                                            <strong>Fees:</strong> ₹
                                                                            {packageDetailsUsers.refFees}{" "}
                                                                            {packageDetailsUsers.refFeesType === "0"
                                                                                ? "Per Month"
                                                                                : packageDetailsUsers.refFeesType === "1"
                                                                                    ? "Per Day"
                                                                                    : "Custom"}
                                                                        </p></div>
                                                                    <div className="flex justify-between"> {packageDetailsUsers.refClsDuration && parseInt(packageDetailsUsers.refFeesType) == 2 && (
                                                                        <p>
                                                                            <strong>Class Duration:</strong>{" "}
                                                                            {packageDetailsUsers.refClsDuration}
                                                                        </p>
                                                                    )}
                                                                        {packageDetailsUsers.refClsCount && parseInt(packageDetailsUsers.refFeesType) == 2 && (
                                                                            <p>
                                                                                <strong>Class Count:</strong>{" "}
                                                                                {packageDetailsUsers.refClsCount}
                                                                            </p>
                                                                        )}</div>


                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {customPackageDetails && !packageUserDetails?.new_User && (
                                                        <div className="border-2 border-white rounded-lg lg:w-[80%] lg:px-3 lg:py-3 py-3 px-5 lg:ml-5 ">
                                                            <input
                                                                type="radio"
                                                                id="customPackage"
                                                                name="package"
                                                                value="customPackage"
                                                                checked={selectedPackage === "customPackage"}
                                                                onChange={() => setSelectedPackage("customPackage")}
                                                            />
                                                            <label htmlFor="customPackage">Custom Package</label>

                                                            {selectedPackage === "customPackage" && (
                                                                <div>
                                                                    <p>
                                                                        <strong>Per Day Fee:</strong> ₹
                                                                        {customPackageDetails.refFeesAmt}
                                                                    </p>
                                                                    <div className="w-[60%]"><InputText
                                                                        type="number"
                                                                        placeholder="Enter number of classes"
                                                                        value={numClasses}
                                                                        onInput={(e: any) => {
                                                                            setNumClasses(e.target.value)
                                                                        }}

                                                                    /></div>


                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {userTherapyCount?.Pending_Count == 0 ?
                                                    <></>
                                                    :
                                                    <><p>
                                                        <b>Therapy</b>
                                                    </p>
                                                        <p>
                                                            Total Therapy Session Allocated :{" "}
                                                            {userTherapyCount?.Total_Therapy_Count}
                                                        </p>
                                                        <p>Paid Classes : {userTherapyCount?.Payed_Count}</p>
                                                        <p>Pending Classes : {userTherapyCount?.Pending_Count}</p>
                                                        <p>Individual Class Fee : {userTherapyCount?.Therapy_Fees}</p>
                                                        <p>
                                                            Total Pending Fee :{" "}
                                                            {userTherapyCount?.Pending_Count &&
                                                                userTherapyCount?.Therapy_Fees
                                                                ? userTherapyCount.Pending_Count *
                                                                userTherapyCount.Therapy_Fees
                                                                : 0}
                                                        </p></>}
                                            </div>




                                        </div>{" "}
                                    </div>
                                </div>
                                <div className="flex pt-4 justify-content-end">
                                    <Button
                                        label="Next"
                                        icon="pi pi-arrow-right"
                                        iconPos="right"
                                        onClick={() => { generateTableData(); stepperRef.current && stepperRef.current.nextCallback() }}
                                    />
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Package Details">
                                <div className="border-2 w-[100%]  surface-border border-round surface-ground flex lg:flex-row flex-col justify-content-center align-items-center font-medium ">
                                    <div className="flex flex-column lg:w-[40%] w-[95%] my-5 justify-center align-items-center">
                                        <div className="w-[100%]">{packageUserDetails && (
                                            <div className="border-3 border-white rounded-lg lg:w-[80%] lg:p-3 p-2 ">
                                                <p><b>Customer Id : </b>{packageUserDetails.refSCustId}</p>
                                                <p><b>Name : </b>{packageUserDetails.refName}</p>
                                                <p>
                                                    <b>Batch : </b>{packageUserDetails.refTimeMembers}{" "}
                                                </p>
                                                <p>
                                                    <b>Package : </b> {packageUserDetails.refPackageName}{" "}
                                                </p>
                                            </div>
                                        )}</div>
                                        <div className="my-4 w-[100%]">
                                            <div className="paymentSection flex lg:flex-row flex-col lg:gap-3 lg:py-3">
                                                <div className="flex-1">
                                                    <div className="flex flex-col lg:w-[70%]">
                                                        <label htmlFor="fromDate" className="text-[1rem] my-2">From date</label>

                                                        <Calendar
                                                            inputId="fromDate"
                                                            disabled
                                                            value={fromDate}
                                                            view="month"
                                                            dateFormat="mm/yy"
                                                            onChange={(e) => setFromDate(e.value ?? undefined)}
                                                            className="30%"
                                                            placeholder="From Date"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col lg:w-[70%]">
                                                        <label htmlFor="fromDate" className="text-[1rem] my-2">To date</label>
                                                        <Calendar
                                                            inputId="toDate"
                                                            value={toDate}
                                                            view="month"
                                                            dateFormat="mm/yy"
                                                            minDate={fromDate}
                                                            onChange={(e) => setTodate(e.value)}
                                                            placeholder="To Date"
                                                            disabled={selectedPackage === "customPackage" || packageDetailsUsers?.refFeesType === "2"} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    {/* <Divider /> */}
                                    <div className="lg:w-[50%] w-[90%] lg:mb-0 mb-3">

                                        <p className="my-2"><b>Payment Calculation</b></p>
                                        <DataTable value={tableData} showGridlines>
                                            <Column
                                                header="Month"
                                                field="month"
                                                body={(rowData) =>
                                                    rowData.isTotal ? (
                                                        <strong>{rowData.month}</strong>
                                                    ) : (
                                                        rowData.month
                                                    )
                                                }
                                            />
                                            <Column
                                                header="Count"
                                                field="count"
                                                body={(rowData) => (rowData.isTotal ? "" : rowData.count)}
                                            />
                                            <Column
                                                header="Fees"
                                                field="monthFees"
                                                body={(rowData) =>
                                                    rowData.isTotal ? (
                                                        <strong>{rowData.monthFees}</strong>
                                                    ) : (
                                                        rowData.monthFees
                                                    )
                                                }
                                            />
                                        </DataTable>

                                        {userTherapyCount?.Pending_Count == 0 ? <></> :
                                            <>
                                                <DataTable className="mt-5" value={userTherapyCount ? [userTherapyCount] : []} showGridlines>
                                                    <Column
                                                        header="Therapy"
                                                        field="Total_Therapy_Count"
                                                    />
                                                    <Column header="Paid" field="Payed_Count" />
                                                    <Column header="Pending" field="Pending_Count" />
                                                    <Column header="Fee" field="Therapy_Fees" />
                                                    <Column
                                                        header="Total Fee"
                                                        body={() =>
                                                            userTherapyCount?.Pending_Count &&
                                                                userTherapyCount?.Therapy_Fees
                                                                ? `₹ ${userTherapyCount.Pending_Count *
                                                                userTherapyCount.Therapy_Fees
                                                                }`
                                                                : "₹ 0"
                                                        }
                                                    />
                                                </DataTable>
                                            </>}
                                    </div>

                                </div>


                                <div className="flex pt-4 justify-content-between">
                                    <Button
                                        label="Back"
                                        severity="secondary"
                                        icon="pi pi-arrow-left"
                                        onClick={() => stepperRef.current?.prevCallback()}
                                    />
                                    <Button
                                        label="Next"
                                        icon="pi pi-arrow-right"
                                        iconPos="right"
                                        onClick={() => moveToNextStep()}
                                    />
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Offers Details">
                                <div className="pt-4">
                                    <div className="border-2 p-2 surface-border border-round w-[100%] surface-ground lg:flex-row flex-col flex  font-medium lg:align-items-center">
                                        <div className="lg:w-[50%]">
                                            <p><b>Offers</b></p>
                                            <div className="lg:w-[80%]">
                                                <div className="p-inputgroup flex-1">
                                                    <InputText
                                                        placeholder="Apply Coupon"
                                                        value={couponValue}
                                                        disabled={offerApplied == 1 || offerApplied == 2}
                                                        onChange={(e) => setCouponValue(e.target.value)}
                                                    />
                                                    <span
                                                        className="p-inputgroup-addon bg-green-500 text-white"
                                                        onClick={validateTokenFunc}
                                                    >
                                                        Validate
                                                    </span>
                                                </div>
                                                {offerApplied == 1 ? <><p className="text-green-600">Offer applied Successfully</p></> : <></>}

                                            </div>
                                            <div className="lg:w-[80%] flex flex-col align-items-center">
                                                <p className="text-center"><b>Note : </b>If you make <b>10 bill payments within 12 months</b>, you will be eligible for <b> 1 month free</b>. However, if you miss <b>2 or more payments </b> during this period, the coupon will not be applicable and will reset.</p>
                                                {(parseInt(extraOfferDetails?.total_points ?? "0") < 10) ? <>                                                <p>Currently, you have completed <b>{extraOfferDetails?.total_points} months</b>, so you need <b>{extraOfferDetails?.points_Need} </b>more months to qualify for the offer.</p>
                                                </> : <> <p className="text-center">Currently, you have completed <b>{extraOfferDetails?.total_points} months </b>including this payment, so you can clime this offer now.</p>
                                                </>}
                                                <button
                                                    className={`text-white border-none rounded-md w-[40%] py-2 px-10 ${(parseInt(extraOfferDetails?.total_points ?? "0") < 10 || offerApplied === 1 || offerApplied === 2)
                                                        ? "bg-gray-500"
                                                        : "bg-green-500"
                                                        }`}
                                                    disabled={parseInt(extraOfferDetails?.total_points ?? "0") < 10 || offerApplied === 1 || offerApplied === 2}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFreeClass(true);
                                                        setOfferApplied(2);
                                                        setOfferDetails((prev) =>
                                                            prev
                                                                ? {
                                                                    ...prev, refOfferName: "Anual Free Class Offer", refFees: totalAmount, refOfferType: 3,
                                                                    refOfferValue: 1, refExDate: `${toDate}`
                                                                }
                                                                : {
                                                                    refEndDate: `${toDate}`,
                                                                    refExDate: `${toDate}`,
                                                                    refFees: totalAmount,
                                                                    refOfferId: 0,
                                                                    refOfferName: "Anual Free Class Offer",
                                                                    refOfferType: 3,
                                                                    refOfferValue: 1,
                                                                    refStartDate: `${fromDate}`,
                                                                }
                                                        );


                                                    }}
                                                >
                                                    Claim Offer
                                                </button>

                                                {offerApplied == 2 ? <><p className="text-green-600">Offer applied Successfully</p></> : <></>}

                                                {offerApplied ? <><p className="text-red-500"><b>Note : </b> You can use only one offer at a time</p>
                                                </> : <></>
                                                }

                                            </div>

                                        </div>

                                        <div className="lg:w-[2px] w-[80vw] lg:h-[45vh] h-[2px] bg-gray-400"></div>                                        <div className="flex flex-col justify-center items-center lg:w-[50%]">
                                            <table className="w-full border border-gray-400 border-collapse">
                                                <tbody>
                                                    <tr className="border border-gray-400">
                                                        <td className="font-bold border border-gray-400 p-2">Regular Class</td>
                                                        <td className="border border-gray-400 p-2">
                                                            <b>Total Fees: ₹ {totalAmount} /-</b>
                                                        </td>
                                                    </tr>
                                                    <tr className="border border-gray-400">
                                                        <td className="font-bold border border-gray-400 p-2">Offer Type</td>
                                                        <td className="border border-gray-400 p-2">
                                                            {offerDetails?.refOfferName ?? "null"}
                                                        </td>
                                                    </tr>
                                                    <tr className="border border-gray-400">
                                                        <td className="font-bold border border-gray-400 p-2">Offer Value</td>
                                                        <td className="border border-gray-400 p-2">
                                                            {offerDetails?.refOfferValue}{" "}
                                                            {offerDetails?.refOfferType === 1
                                                                ? "%"
                                                                : offerDetails?.refOfferType === 2
                                                                    ? "Rupees"
                                                                    : offerDetails?.refOfferType === 3
                                                                        ? "Month"
                                                                        : "null"}
                                                        </td>
                                                    </tr>
                                                    <tr className="border border-gray-400">
                                                        <td className="font-bold border border-gray-400 p-2">Sub Total</td>
                                                        <td className="border border-gray-400 p-2">
                                                            ₹ {offerDetails?.refFees ?? totalAmount} /-
                                                        </td>
                                                    </tr>

                                                    {(userTherapyCount?.Pending_Count ?? 0) > 0 && (
                                                        <tr className="border border-gray-400">
                                                            <td className="font-bold border border-gray-400 p-2">Therapy</td>
                                                            <td className="border border-gray-400 p-2">
                                                                <b>
                                                                    Total Fees: ₹{" "}
                                                                    {(userTherapyCount?.Pending_Count ?? 0) * (userTherapyCount?.Therapy_Fees ?? 0)}{" "}
                                                                    /-
                                                                </b>
                                                            </td>
                                                        </tr>
                                                    )}





                                                    <tr className="border border-gray-400">
                                                        <td className="font-bold border border-gray-400 p-2">Denomination</td>
                                                        <td className="border border-gray-400 p-2">
                                                            <b>Total Fees: ₹{" "}
                                                                {(offerDetails?.refFees ?? totalAmount) +
                                                                    (userTherapyCount?.Pending_Count &&
                                                                        userTherapyCount?.Therapy_Fees
                                                                        ? userTherapyCount.Pending_Count *
                                                                        userTherapyCount.Therapy_Fees
                                                                        : 0)}{" "}
                                                                /-</b>
                                                        </td>
                                                    </tr>
                                                    <tr className="border border-gray-400">
                                                        <td className="font-bold border border-gray-400 p-2">CGST (9%)</td>
                                                        <td className="border border-gray-400 p-2">
                                                            ₹{" "}
                                                            {(
                                                                ((offerDetails?.refFees ?? totalAmount) +
                                                                    (userTherapyCount?.Pending_Count &&
                                                                        userTherapyCount?.Therapy_Fees
                                                                        ? userTherapyCount.Pending_Count *
                                                                        userTherapyCount.Therapy_Fees
                                                                        : 0)) *
                                                                0.09
                                                            ).toFixed(2)}{" "}
                                                            /-
                                                        </td>
                                                    </tr>
                                                    <tr className="border border-gray-400">
                                                        <td className="font-bold border border-gray-400 p-2">SGST (9%)</td>
                                                        <td className="border border-gray-400 p-2">
                                                            ₹{" "}
                                                            {(
                                                                ((offerDetails?.refFees ?? totalAmount) +
                                                                    (userTherapyCount?.Pending_Count &&
                                                                        userTherapyCount?.Therapy_Fees
                                                                        ? userTherapyCount.Pending_Count *
                                                                        userTherapyCount.Therapy_Fees
                                                                        : 0)) *
                                                                0.09
                                                            ).toFixed(2)}{" "}
                                                            /-
                                                        </td>
                                                    </tr>
                                                    <tr className="border border-gray-400">
                                                        <td className="font-bold border border-gray-400 p-2">Grand Total</td>
                                                        <td className="border border-gray-400 p-2">
                                                            <b>₹{" "}
                                                                {(
                                                                    (offerDetails?.refFees ?? totalAmount) +
                                                                    (userTherapyCount?.Pending_Count &&
                                                                        userTherapyCount?.Therapy_Fees
                                                                        ? userTherapyCount.Pending_Count *
                                                                        userTherapyCount.Therapy_Fees
                                                                        : 0) +
                                                                    ((offerDetails?.refFees ?? totalAmount) +
                                                                        (userTherapyCount?.Pending_Count &&
                                                                            userTherapyCount?.Therapy_Fees
                                                                            ? userTherapyCount.Pending_Count *
                                                                            userTherapyCount.Therapy_Fees
                                                                            : 0)) *
                                                                    0.18
                                                                ).toFixed(2)}{" "}
                                                                /-</b>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>


                                        </div>

                                    </div>

                                    <div className="mt-0 w-[100%] flex flex-col align-items-center">
                                        <p className="font-bold">Choose Payment Method</p>
                                        {localStorage.getItem("refUtId") === "4" || localStorage.getItem("refUtId") === "7" || localStorage.getItem("refUtId") === "12" ?
                                            <>
                                                <Dropdown
                                                    value={selectedPaymentMethod}
                                                    options={[
                                                        { label: "Credit Card (3% extra)", value: "credit_card" },
                                                        { label: "Debit Card", value: "debit_card" },
                                                        { label: "UPI", value: "upi" },
                                                        { label: "Net Banking", value: "net_banking" },
                                                        { label: "Cash", value: "cash" },
                                                        { label: "Cash + Online", value: "cash_online" },

                                                    ]}
                                                    onChange={(e) => setSelectedPaymentMethod(e.value)}
                                                    placeholder="Select Payment Method"
                                                    className="w-full md:w-20rem"
                                                /></>
                                            :
                                            <>
                                                <Dropdown
                                                    value={selectedPaymentMethod}
                                                    options={[
                                                        { label: "Credit Card (3% extra)", value: "credit_card" },
                                                        { label: "Debit Card", value: "debit_card" },
                                                        { label: "UPI", value: "upi" },
                                                        { label: "Net Banking", value: "net_banking" }

                                                    ]}
                                                    onChange={(e) => setSelectedPaymentMethod(e.value)}
                                                    placeholder="Select Payment Method"
                                                    className="w-full md:w-20rem"
                                                />
                                            </>}

                                    </div>
                                    <div>

                                    </div>

                                    <div className="flex justify-content-between mt-3">
                                        <Button
                                            label="Back"
                                            severity="danger"
                                            icon="pi pi-arrow-left"
                                            onClick={() => stepperRef.current?.prevCallback()}
                                        />
                                        {selectedPaymentMethod ?
                                            <>{selectedPaymentMethod === "cash" || selectedPaymentMethod === "cash_online" ?
                                                <>
                                                    <Button
                                                        label="Next"
                                                        icon="pi pi-arrow-right"
                                                        iconPos="right"
                                                        onClick={() => moveToNextStep()}
                                                    />
                                                </>
                                                :
                                                <>
                                                    <Button
                                                        label="Pay"
                                                        icon="pi pi-check"
                                                        severity="success"
                                                        iconPos="right"
                                                        onClick={() => {
                                                            setPayInOnline(parseFloat(grandTotal))
                                                            handlePayment(grandTotal)
                                                        }}
                                                    />
                                                </>
                                            }
                                            </>
                                            :
                                            <>
                                            </>
                                        }


                                    </div>


                                </div>
                            </StepperPanel>
                            {(localStorage.getItem("refUtId") === "4" || localStorage.getItem("refUtId") === "7" || localStorage.getItem("refUtId") === "12") && (selectedPaymentMethod === "cash" || selectedPaymentMethod === "cash_online") && (

                                <StepperPanel header="Cash Collection">
                                    <div className="flex flex-col w-[100%] justify-center align-items-center">
                                        <div className="w-[100%] flex flex-row justify-around">
                                            <div className="w-[45%] flex flex-col justify-center ">
                                                <p className="font-bold text-[1rem]">Cash Collected</p>
                                                <DataTable value={[...collectedCash, { cashType: "Total", count: "", amount: calculateTotal() }]} showGridlines className="w-[100%]">
                                                    <Column field="cashType" header="Cash Type" className="text-center" headerClassName="text-center" />
                                                    <Column
                                                        field="count"
                                                        header="Cash Count"
                                                        className="text-center"
                                                        headerClassName="text-center"
                                                        body={(rowData) =>
                                                            rowData.cashType !== "Total" ? (
                                                                <InputNumber
                                                                    value={rowData.count}
                                                                    onChange={(e) => {
                                                                        handleCountChange(e.value || 0, rowData)
                                                                    }}
                                                                    min={0}
                                                                />
                                                            ) : (
                                                                ""
                                                            )
                                                        }
                                                    />
                                                    <Column
                                                        field="amount"
                                                        header="Amount (₹)"
                                                        className="text-center"
                                                        headerClassName="text-center"
                                                        body={(rowData) =>
                                                            rowData.cashType === "Total" ? (
                                                                <strong>₹{rowData.amount}</strong>
                                                            ) : (
                                                                rowData.cashType === "Coins"
                                                                    ? `₹${rowData.count * 1}`
                                                                    : `₹${rowData.cashType * rowData.count}`
                                                            )
                                                        }
                                                    />
                                                </DataTable>
                                            </div>
                                            <div className="w-[45%] flex justify-center flex-col">
                                                <p className="font-bold text-[1rem]">cash Returned</p>
                                                <DataTable value={[...returnedCash, { cashType: "Total", count: "", amount: calculateReturnedTotal() }]} showGridlines className="w-[100%]">
                                                    <Column field="cashType" header="Cash Type" className="text-center" headerClassName="text-center" />
                                                    <Column
                                                        field="count"
                                                        header="Cash Count"
                                                        className="text-center"
                                                        headerClassName="text-center"
                                                        body={(rowData) =>
                                                            rowData.cashType !== "Total" ? (
                                                                <InputNumber
                                                                    value={rowData.count}
                                                                    onChange={(e) => handleReturnedCountChange(e.value ?? 0, rowData)}
                                                                    min={0}

                                                                />
                                                            ) : (
                                                                ""
                                                            )
                                                        }
                                                    />
                                                    <Column
                                                        field="amount"
                                                        header="Amount (₹)"
                                                        className="text-center"
                                                        headerClassName="text-center"
                                                        body={(rowData) =>
                                                            rowData.cashType === "Total" ? (
                                                                <strong>₹{rowData.amount}</strong>
                                                            ) : (
                                                                rowData.cashType === "Coins"
                                                                    ? `₹${rowData.count * 1}`
                                                                    : `₹${rowData.cashType * rowData.count}`
                                                            )
                                                        }
                                                    />
                                                </DataTable>
                                            </div>
                                        </div>
                                        <div className="w-[40%] m-5 ">
                                            <DataTable value={dataTableValues} showGridlines className="w-[100%] m-5 border-2 border-gray-400 p-2">
                                                <Column field="description" header="Description" className="text-center" />
                                                <Column
                                                    field="amount"
                                                    header="Amount (₹)"
                                                    className="text-center"
                                                    body={(rowData) => {
                                                        const amount = parseFloat(rowData.amount);
                                                        let textColor = "text-black";

                                                        if (rowData.description === "Balance Amount") {
                                                            textColor =
                                                                amount === 0 ? "text-green-500" :
                                                                    amount > 0 ? "text-yellow-500" :
                                                                        "text-red-500";
                                                        }

                                                        return <span className={`${textColor}`}>₹ {Math.abs(amount)}</span>;
                                                    }}
                                                />
                                            </DataTable>



                                        </div>
                                        <div className="flex justify-content-between mt-3 w-[100%]">
                                            <Button
                                                label="Back"
                                                severity="danger"
                                                icon="pi pi-arrow-left"
                                                onClick={() => stepperRef.current?.prevCallback()}
                                            />

                                            {selectedPaymentMethod ?
                                                <>
                                                    {(selectedPaymentMethod === "cash") && ((calculateTotal() - calculateReturnedTotal()) -
                                                        (
                                                            Math.round(
                                                                (offerDetails?.refFees ?? totalAmount) +
                                                                (userTherapyCount?.Pending_Count && userTherapyCount?.Therapy_Fees
                                                                    ? userTherapyCount.Pending_Count * userTherapyCount.Therapy_Fees
                                                                    : 0) +
                                                                ((offerDetails?.refFees ?? totalAmount) +
                                                                    (userTherapyCount?.Pending_Count &&
                                                                        userTherapyCount?.Therapy_Fees
                                                                        ? userTherapyCount.Pending_Count * userTherapyCount.Therapy_Fees
                                                                        : 0)) * 0.18
                                                            )
                                                        ) == 0) ? <><Button
                                                            label="Pay"
                                                            icon="pi pi-check"
                                                            severity="success"
                                                            iconPos="right"
                                                            onClick={() => paymentToBackend("Cash", calculateTotal() - calculateReturnedTotal(), 0)}
                                                        />
                                                    </> : <></>}

                                                    {selectedPaymentMethod === "cash_online" ? <>
                                                        <ConfirmDialog />
                                                        <Button
                                                            label="Pay"
                                                            icon="pi pi-check"
                                                            severity="success"
                                                            iconPos="right"
                                                            onClick={() => confirmPayment(payInCash)}
                                                        />
                                                    </> : <></>}
                                                </>
                                                :
                                                <>
                                                </>}



                                        </div>
                                    </div>


                                </StepperPanel>
                            )
                            }


                            <StepperPanel header="Payment">
                                <div className="flex flex-col w-[100%] justify-center align-items-center">

                                    <MdOutlineVerifiedUser size={"10rem"} color="green" />
                                    <p className="font-bold text-[2rem] text-green-600">Payment Successfull</p>
                                </div>
                                <div className="flex justify-content-center mt-3">


                                    <PrintPDF
                                        closePayment={() => closePayment()}
                                        refOrderId={orderId}
                                    />

                                </div>
                            </StepperPanel>

                        </Stepper>
                    </div>
                </div>



            )}
        </div>
    );
};

export default PriceSidebar;
