"use client";
import React, { useState, useEffect, useRef, PureComponent } from "react";

import { useRouter } from "next/navigation";
import axios from "axios";

import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";

import { API_URL } from "../libs/global";

import Image from "next/image";

import { Poppins } from "next/font/google";

import ProfileImage from "@/app/assets/profile.png";
import { UserIcon } from "@heroicons/react/24/outline";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowUpRightIcon,
  ArrowsUpDownIcon,
  CalendarDaysIcon,
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/16/solid";
import Patientimg from "@/app/assets/patimg.png";
import Patcount from "@/app/assets/patcount.png";
import Doccount from "@/app/assets/doccount.png";
import Patacc from "@/app/assets/patacc.png";
import Docacc from "@/app/assets/docacc.png";
import Ascending from "@/app/assets/ascending.png";
import Descending from "@/app/assets/descending.png";
import Adminprofile from "@/app/assets/admin.png";
import Manavatar from "@/app/assets/man.png";
import Womanavatar from "@/app/assets/woman.png";

import "@/app/globals.css";

import Patientremainder from "@/app/Patientremainder/page";
import { setId } from "@material-tailwind/react/components/Tabs/TabsContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Make sure this runs only on client
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      };

      // Set initial size
      handleResize();

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return size;
};

const page = ({ isOpencomp, patient11 }) => {
  const [patient1, setpatient1] = useState();
  console.log("Patient Available", patient11);
  // When patient11 becomes available
  useEffect(() => {
    if (patient11) {
      setpatient1(patient11);
    }
  }, [patient11]); // <- Only when patient11 changes

  const { width, height } = useWindowSize();
  // console.log("Screen Width:", width, "Screen Height:", height);
  const [doctorList, setDoctorList] = useState([]);

  const [sortByStatus, setSortByStatus] = useState(true);

  const [selected, setSelected] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [userData, setUserData] = useState(null);
  const handleSelect = (index) => {
    setSelected(index);
  };

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("userData");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Retrieved user from sessionStorage:", parsedUser);

        // if (parsedUser.password === "doctor@123") {
        //   setpassopen(true);
        // }

        // Attempt to log in again using the stored credentials
        const loginWithStoredUser = async () => {
          try {
            const response = await axios.post(API_URL + "login", {
              identifier: parsedUser.identifier,
              password: parsedUser.password,
              role: parsedUser.role, // Assuming role is stored and needed
            });

            // Handle successful login response
            sessionStorage.setItem(
              "userData",
              JSON.stringify({
                identifier: parsedUser.identifier,
                password: parsedUser.password,
                role: parsedUser.role,
              })
            );

            setUserData(response.data); // Store the full response data (e.g., tokens)
            sessionStorage.setItem("uhid", response.data.user.uhid);
            console.log(
              "Successfully logged in with stored credentials",
              response.data.user.uhid
            );
          } catch (error) {
            console.error("Login failed with stored credentials", error);
            alert("Login failed. Please check your credentials.");
          }
        };

        // Call login function
        loginWithStoredUser();
      }
    }
  }, []);

  // To set this sample data in your useState

  const [patfilter, setpatFilter] = useState("All");

  const options = ["All", "PRE OP", "POST OP"];

  const postopoptions = ["ALL", "6W", "3M", "6M", "1Y", "2Y"];

  // Load selected option from sessionStorage or default to "ALL"
  const [postopfilter, setpostopFitler] = useState("ALL");

  //   { name: "Sophia", surgeryStatus: "3M", completed: 8, pending: 0 },
  //   { name: "Liam", surgeryStatus: "6M", completed: 12, pending: 3 },
  //   { name: "Olivia", surgeryStatus: "1Y", completed: 20, pending: 4 },
  //   { name: "Noah", surgeryStatus: "2Y", completed: 15, pending: 0 },
  //   { name: "Emma", surgeryStatus: "6W", completed: 9, pending: 0 },
  //   { name: "Mason", surgeryStatus: "3M", completed: 7, pending: 0 },
  //   { name: "Ava", surgeryStatus: "1Y", completed: 11, pending: 3 },
  // ];

  const [patprogressfilter, setpatprogressFilter] = useState("ALL");

  const patprogressoptions = ["ALL", "PRE OP", "POST OP"];

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenrem, setIsOpenrem] = useState(false);
  const [isOpenacc, setIsOpenacc] = useState(false);
  const [isOpenaccdoc, setIsOpenaccdoc] = useState(false);

  const [selectedDates, setSelectedDates] = useState({});
  const dateInputRefs = useRef({});

  const openDatePicker = (index) => {
    dateInputRefs.current[index]?.showPicker();
  };

  const handleDateChange = (e, index) => {
    const newDate = e.target.value;
    setSelectedDates((prev) => ({
      ...prev,
      [index]: new Date(newDate).toISOString(), // update only this questionnaire's selected date
    }));
  };

  let completedPatientsCount = 0;
  let pendingPatientsCount = 0;
  let notAssignedPatientsCount = 0;

  const [selectedLeg, setSelectedLeg] = useState("left");

  const [sortAsc, setSortAsc] = useState(true);
  const [selectedBox, setSelectedBox] = useState("patients");

  const [patientProgress, setPatientProgress] = useState([]);

  useEffect(() => {
    // Calculate progress for each patient
    const progressData = patients.map((patient) => {
      let completed = 0;
      let pending = 0;
      let notAssigned = 0;

      if (
        !patient.questionnaire_assigned ||
        patient.questionnaire_assigned.length === 0
      ) {
        notAssigned = 1; // No questionnaires assigned
      } else {
        patient.questionnaire_assigned.forEach((q) => {
          if (q.completed === 1) {
            completed++;
          } else {
            pending++;
          }
        });
      }

      // Calculate the total count for the progress
      const total = completed + pending + notAssigned;

      return {
        patientId: patient.uhid,
        completed,
        pending,
        notAssigned,
        total,
      };
    });

    setPatientProgress(progressData);
  }, [patients]);

  const filteredQuestionnairesByDate =
    selectedLeg === "left"
      ? patient1?.questionnaire_assigned_left || []
      : patient1?.questionnaire_assigned_right || [];

  console.log("Questionnaire Assigned", patient1);

  const [updateddate, setUpdateddate] = useState("");

  // Function to format ISO string to YYYY-MM-DD format for display
  const formatDateForDisplay = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding padding for months less than 10
    const day = String(date.getDate()).padStart(2, "0"); // Adding padding for days less than 10
    return `${year}-${month}-${day}`; // Return in YYYY-MM-DD format
  };

  // Place this near your other helpers
const getActualDeadlineForDisplay = (ques, patient1, selectedLeg) => {
  let date;
  const period = ques.period.toLowerCase();

  if (period.includes("pre")) {
    // Pre Op: 1 day before surgery date
    const surgeryDateStr =
      selectedLeg === "left"
        ? patient1?.post_surgery_details_left?.date_of_surgery
        : patient1?.post_surgery_details_right?.date_of_surgery;
    if (!surgeryDateStr) return "";
    date = new Date(surgeryDateStr);
    date.setDate(date.getDate() - 1);
  } else {
    // Post Op: deadline + 14 days
    date = new Date(ques.deadline);
    date.setDate(date.getDate() + 14);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
};

  const [editingIndex, setEditingIndex] = useState(null);

  const filteredQuestionnaire = filteredQuestionnairesByDate.filter((ques) => {
    const status = ques.period.toLowerCase();
    const selectedFilter = patfilter.toLowerCase();
    const subFilter = postopfilter.toLowerCase();

    if (selectedFilter === "all") {
      return true;
    }

    if (selectedFilter === "pre op") {
      return status.includes("pre");
    }

    // Anything not "pre" is treated as post-operative
    if (selectedFilter === "post op") {
      if (subFilter === "all") {
        return !status.includes("pre");
      }
      return !status.includes("pre") && status.includes(subFilter);
    }

    return false;
  });

  const sortedQuestionnaires = filteredQuestionnaire.sort((a, b) => {
    // Sorting by completion status or deadline
    if (sortByStatus) {
      // First, sort by completion status (Pending = "0", Completed = "1")
      if (a.completed !== b.completed) {
        return a.completed === 0 ? (sortAsc ? -1 : 1) : sortAsc ? 1 : -1; // Pending first (ascending or descending)
      }
    }

    // If both are the same (either both completed or both pending), sort by deadline
    const deadlineA = new Date(a.deadline);
    const deadlineB = new Date(b.deadline);

    // console.log("Deadline Comparison", deadlineA + " / " + deadlineB);

    // Sort by deadline in ascending or descending order
    return sortAsc ? deadlineA - deadlineB : deadlineB - deadlineA;
  });

  const handleReschedule = async (ques, index) => {
    const patientUhid = patient1?.uhid; // Selected patient value

    if (!selectedDates[index]) {
      alert("Kindly select the date");
      return;
    }

    console.log("PatientUHID reschedule", patientUhid);

    if (!patientUhid) {
      console.error("No patient selected for assignment.");
      return;
    }

      if (ques.period.toLowerCase().includes("pre")) {
    alert("Pre Op period cannot be rescheduled.");
    return;
  }

    // const quest_period = questionnaire_assigned_left

    if (selectedLeg === "left") {
      let adjustedDeadline = selectedDates[index];
  if (ques.period.toLowerCase().includes("w") ||
      ques.period.toLowerCase().includes("m") ||
      ques.period.toLowerCase().includes("y") ||
      ques.period.toLowerCase() === "post op") {
    // Subtract 14 days for post-op
    const dateObj = new Date(selectedDates[index]);
    dateObj.setDate(dateObj.getDate() - 14);
    adjustedDeadline = dateObj.toISOString();
  }

  const payloadLeft = {
    name: ques.name,
    period: ques.period,
    assigned_date: ques.assigned_date,
    deadline: adjustedDeadline,
    completed: 0,
  };
      console.log("Left leg reset " + JSON.stringify(payloadLeft, null, 2));

      console.log(
        "API URL",
        API_URL +
          "patients/" +
          patientUhid +
          "/update-assigned-and-remove-score-left"
      );

      try {
        const response = await fetch(
          API_URL +
            "patients/" +
            patientUhid +
            "/update-assigned-and-remove-score-left",
          {
            method: "PUT", // or "PUT" depending on your backend
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payloadLeft),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Left Leg questionnaire Reset successfully:", result);

        window.location.reload();

        // Show an alert box indicating that the UI will update soon
        alert(
          "Left Leg questionnaire Reset successfully. The changes will reflect soon."
        );

        // Optionally refresh the data or trigger a UI update
      } catch (error) {
        console.error("Error reseting Left leg questionnaire:", error);
        alert("Error reseting Left leg questionnaire, please try again.");
      } finally {
      }
    }

    if (selectedLeg === "right") {
      let adjustedDeadline = selectedDates[index];
  if (ques.period.toLowerCase().includes("w") ||
      ques.period.toLowerCase().includes("m") ||
      ques.period.toLowerCase().includes("y") ||
      ques.period.toLowerCase() === "post op") {
    // Subtract 14 days for post-op
    const dateObj = new Date(selectedDates[index]);
    dateObj.setDate(dateObj.getDate() - 14);
    adjustedDeadline = dateObj.toISOString();
  }
  else{

  }
      const payloadRight = {
        name: ques.name,
        period: ques.period,
        assigned_date: ques.assigned_date,
        deadline: adjustedDeadline,
        completed: 0,
      };

      console.log("Left leg reset " + JSON.stringify(payloadRight, null, 2));

      console.log(
        "API URL",
        API_URL +
          "patients/" +
          patientUhid +
          "/update-assigned-and-remove-score-right"
      );

      try {
        const response = await fetch(
          API_URL +
            "patients/" +
            patientUhid +
            "/update-assigned-and-remove-score-right",
          {
            method: "PUT", // or "PUT" depending on your backend
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payloadRight),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Right Leg questionnaire Reset successfully:", result);

        window.location.reload();

        // Show an alert box indicating that the UI will update soon
        alert(
          "Right Leg questionnaire Reset successfully. The changes will reflect soon."
        );

        // Optionally refresh the data or trigger a UI update
      } catch (error) {
        console.error("Error reseting Right leg questionnaire:", error);
        alert("Error reseting Right leg questionnaire, please try again.");
      } finally {
      }
    }
  };

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      if (!patient1?.uhid || !patient1?.password) return;

      try {
        const response = await axios.post(API_URL + "login", {
          identifier: patient1?.uhid,
          password: patient1?.password,
          role: "patient",
        });
        const data = response.data;

        console.log("Patient login inside", data);
        setpatient1(data.user);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      }
    };

    fetchPatients();
  }, [patient1?.uhid, patient1?.password]);
  // ^ only when email is ready, fetch patient

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(50);

  // Calculate total pages and current visible patients
  const totalPages = Math.ceil(sortedQuestionnaires.length / cardsPerPage);
  const paginatedPatients = sortedQuestionnaires.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  // Dynamically calculate cards per page
  useEffect(() => {
    const updateCardsPerPage = () => {
      if (containerRef.current && cardRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const cardHeight = cardRef.current.clientHeight;
        const gap = 16; // tailwind gap-4
        const fit = Math.floor(containerHeight / (cardHeight + gap));
        setCardsPerPage(fit - 1 || 1);
      }
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  const scrollRef = useRef(null);

  const scrollByAmount = (amount) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!isOpencomp) return null;

  return (
    <>
      <div className="flex flex-col lg:flex-row w-[95%] gap-4 mx-auto mt-4 items-center justify-between">
        {/* Greeting Section */}
        <div className="flex flex-col lg:flex-row items-center md:items-end gap-1 md:gap-4">
          <h4 className="font-medium text-black text-xl md:text-[26px]">
            Welcome
          </h4>
          <h2 className="font-bold text-[#005585] text-2xl md:text-4xl">
            {userData?.user?.admin_name
              ? `${userData.user.admin_name}`
              : "Loading..."}
          </h2>
        </div>

        {/* Right Side: Icons + Profile */}
        <div className="flex items-center mt-3 md:mt-0 gap-3 md:gap-6">
          {/* Notification Bell Icon */}
          <button className="hidden focus:outline-none w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <svg
              width="27"
              height="27"
              viewBox="0 0 27 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.6293 19.374C24.2478 18.2471 24.5782 16.9848 24.5911 15.6993C24.604 14.4139 24.299 13.1452 23.7032 12.0061C23.1074 10.867 22.2394 9.8928 21.1762 9.17017C20.113 8.44754 18.8877 7.99888 17.6093 7.86411C17.2035 6.88667 16.6031 6.00203 15.8446 5.26404C15.086 4.52605 14.1853 3.95014 13.197 3.57137C12.2088 3.19259 11.1539 3.01888 10.0964 3.06081C9.03894 3.10274 8.00105 3.35942 7.04594 3.81524C6.09082 4.27106 5.23845 4.91648 4.54072 5.71221C3.84299 6.50794 3.31449 7.43734 2.98739 8.44383C2.66028 9.45032 2.54142 10.5128 2.63804 11.5667C2.73466 12.6206 3.04474 13.6438 3.54939 14.5741L2.9094 16.824C2.85171 17.0292 2.84971 17.2461 2.90361 17.4523C2.95751 17.6585 3.06536 17.8466 3.21608 17.9974C3.36679 18.1481 3.55493 18.2559 3.76114 18.3098C3.96735 18.3637 4.1842 18.3617 4.38939 18.304L6.63937 17.664C7.54467 18.1636 8.54099 18.4764 9.56936 18.584C9.98593 19.6005 10.6125 20.5175 11.4081 21.2749C12.2036 22.0324 13.1502 22.6133 14.1858 22.9796C15.2214 23.3459 16.3227 23.4893 17.4176 23.4005C18.5125 23.3116 19.5763 22.9925 20.5393 22.464L22.7893 23.104C22.9948 23.1652 23.213 23.1697 23.4209 23.117C23.6288 23.0644 23.8185 22.9565 23.9702 22.8049C24.1218 22.6533 24.2296 22.4635 24.2823 22.2556C24.3349 22.0478 24.3304 21.8295 24.2693 21.624L23.6293 19.374ZM6.71937 16.4141C6.66134 16.4135 6.6037 16.4236 6.54937 16.4441L4.05939 17.154L4.76939 14.6641C4.79435 14.5861 4.80191 14.5036 4.79154 14.4224C4.78118 14.3412 4.75313 14.2633 4.70939 14.1941C3.89109 12.8131 3.60498 11.1809 3.90475 9.60397C4.20453 8.02701 5.06958 6.61368 6.33752 5.6293C7.60546 4.64492 9.1891 4.15717 10.7912 4.25762C12.3932 4.35807 13.9035 5.03981 15.0386 6.17486C16.1736 7.30991 16.8554 8.82022 16.9558 10.4223C17.0563 12.0243 16.5685 13.608 15.5841 14.8759C14.5998 16.1439 13.1864 17.0089 11.6095 17.3087C10.0325 17.6085 8.40034 17.3223 7.01937 16.5041C6.93021 16.4456 6.82598 16.4143 6.71937 16.4141V16.4141ZM22.4093 19.464L23.1193 21.954L20.6293 21.244C20.5513 21.2191 20.4688 21.2115 20.3876 21.2219C20.3064 21.2322 20.2285 21.2603 20.1593 21.304C19.3811 21.7642 18.5168 22.0599 17.6199 22.1727C16.7229 22.2856 15.8123 22.2133 14.9444 21.9602C14.0764 21.7072 13.2697 21.2787 12.5739 20.7015C11.8782 20.1242 11.3082 19.4103 10.8993 18.604C12.8741 18.4723 14.7251 17.5957 16.0784 16.1515C17.4316 14.7073 18.1861 12.8032 18.1893 10.8241C18.187 10.2556 18.1233 9.68894 17.9993 9.1341C19.0432 9.33017 20.0245 9.77491 20.86 10.4307C21.6955 11.0864 22.3608 11.9338 22.7993 12.9012C23.2379 13.8686 23.4368 14.9274 23.3794 15.988C23.3219 17.0486 23.0098 18.0797 22.4693 18.994C22.4255 19.0632 22.3975 19.1412 22.3871 19.2224C22.3768 19.3036 22.3843 19.3861 22.4093 19.464V19.464Z"
                fill="#0D0D0D"
                fillOpacity="0.75"
              />
            </svg>
          </button>

          {/* Message Icon */}
          <button className="hidden focus:outline-none w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <svg
              width="26"
              height="27"
              viewBox="0 0 26 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9632 23.8898C13.6238 23.8907 14.2682 23.6857 14.8069 23.3033C15.3456 22.921 15.7518 22.3804 15.9691 21.7565H9.95737C10.1746 22.3804 10.5808 22.921 11.1195 23.3033C11.6582 23.6857 12.3026 23.8907 12.9632 23.8898ZM20.4298 15.9816V11.0899C20.4298 7.65847 18.0992 4.76783 14.9419 3.8985C14.6293 3.1113 13.8656 2.55664 12.9632 2.55664C12.0608 2.55664 11.2971 3.1113 10.9846 3.8985C7.82725 4.76889 5.4966 7.65847 5.4966 11.0899V15.9816L3.67581 17.8024C3.57657 17.9013 3.49786 18.0188 3.44423 18.1483C3.39059 18.2777 3.36308 18.4164 3.36328 18.5565V19.6232C3.36328 19.9061 3.47566 20.1774 3.6757 20.3774C3.87574 20.5775 4.14705 20.6899 4.42994 20.6899H21.4965C21.7794 20.6899 22.0507 20.5775 22.2507 20.3774C22.4508 20.1774 22.5632 19.9061 22.5632 19.6232V18.5565C22.5634 18.4164 22.5359 18.2777 22.4822 18.1483C22.4286 18.0188 22.3499 17.9013 22.2506 17.8024L20.4298 15.9816Z"
                fill="#0D0D0D"
                fillOpacity="0.75"
              />
              <circle cx="19.0022" cy="5.63308" r="2.80496" fill="#F9A135" />
            </svg>
          </button>

          {/* Profile Box */}
          <div className="h-12 w-36 md:w-40 bg-white border-[#D9D9D9] border-[1.5px] rounded-2xl px-3">
            <div className="h-full flex flex-row gap-3 items-center justify-center">
              <Image
                src={Adminprofile}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <p className="text-sm font-medium text-[#0D0D0D] whitespace-nowrap">
                {userData?.user?.admin_name
                  ? `${userData.user.admin_name}`
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={` h-[85%] mx-auto flex  mt-5 ${
          width >= 1000 && width / height > 1
            ? "w-[95%] flex-row"
            : "w-full flex-col"
        }`}
      >
        <div
          className={`h-fit rounded-xl pt-4 px-4 ${
            width >= 1000 && width / height > 1 ? "w-full" : "w-full"
          }`}
          style={{
            boxShadow: "0 0px 10px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div
            className={`flex  ${
              width < 650 && width >= 530
                ? "flex-col justify-center items-start gap-3"
                : width < 530
                  ? "flex-col justify-center items-center gap-3"
                  : "flex-row justify-between items-start"
            }`}
          >
            <div className="flex flex-col justify-between">
              <p className="text-black text-2xl font-poppins font-semibold">
                {patient1?.first_name + " " + patient1?.last_name}'s Compliance
              </p>
              <div className="flex flex-row gap-2 justify-start items-center">
                <div className="flex mb-2 mt-2">
                  <div
                    className="flex items-start justify-start gap-2 text-sm font-medium text-black cursor-pointer"
                    onClick={() => {
                      setSortAsc((prev) => !prev); // Only toggle sort order
                    }}
                  >
                    <Image
                      src={sortAsc ? Ascending : Descending}
                      alt="Sort"
                      className=" w-5 h-5 cursor-pointer"
                    />
                    {sortAsc ? "Low to High" : "High to Low"}
                  </div>
                </div>
              </div>
            </div>

            {selectedBox === "patients" && (
              <div
                className={`gap-1  cursor-pointer flex flex-col ${
                  width < 650 && width >= 530
                    ? "items-start"
                    : width < 530
                      ? "items-center"
                      : "items-end"
                }`}
              >
                <div
                  className={`w-full flex  justify-between items-center gap-4 ${
                    width < 650 && width >= 530
                      ? "flex-col"
                      : width < 530
                        ? "flex-col"
                        : "flex-row"
                  }`}
                >
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedLeg("left")}
                      className={`px-4 py-0.5 rounded-full font-semibold ${
                        selectedLeg === "left"
                          ? "bg-[#005585] text-white"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => setSelectedLeg("right")}
                      className={`px-4 py-0.5 rounded-full font-semibold ${
                        selectedLeg === "right"
                          ? "bg-[#005585] text-white"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      Right
                    </button>
                  </div>

                  <div className="flex bg-[#282B30] rounded-full p-1 w-fit items-center justify-center">
                    {options.map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setpatFilter(option);
                          setSortByStatus(true);
                        }}
                        className={` cursor-pointer  font-semibold transition-all duration-200 rounded-full text-center
                ${
                  patfilter === option
                    ? "bg-gradient-to-b from-[#484E56] to-[#3B4048] text-white shadow-md"
                    : "text-gray-300"
                }
                ${width < 530 ? "text-[8px] px-2 py-1" : "text-xs px-3 py-1"}
              `}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                {patfilter.toLowerCase() == "post op" && (
                  <div
                    className={` bg-[#F5F5F5] rounded-lg py-0.5 px-[3px] w-fit border-2 border-[#191A1D] gap-2 mt-2 ${
                      width < 450 ? "grid grid-cols-3" : "flex"
                    }`}
                  >
                    {postopoptions.map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setpostopFitler(option);
                          setSortByStatus(true);
                        }}
                        className={`px-2 py-1 cursor-pointer text-xs font-semibold transition-all duration-200 rounded-lg
                ${
                  postopfilter === option
                    ? "bg-gradient-to-b from-[#484E56] to-[#3B4048] text-white shadow-md"
                    : "text-gray-500"
                }
              `}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full flex justify-center items-center mt-4">
            {totalPages > 1 && selectedBox === "patients" && (
              <div className="flex items-center gap-2 max-w-full">
                {/* Left Arrow */}

                <ChevronLeftIcon
                  className="w-8 h-8 text-red-600 cursor-pointer"
                  onClick={() => scrollByAmount(-150)}
                />

                {/* Scrollable Page Buttons */}
                <div
                  ref={scrollRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1"
                  style={{ maxWidth: "70vw" }}
                >
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border rounded cursor-pointer shrink-0 transition-all ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white"
                          : "bg-white text-blue-500"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                {/* Right Arrow */}

                <ChevronRightIcon
                  className="w-8 h-8 text-red-600 cursor-pointer"
                  onClick={() => scrollByAmount(150)}
                />
              </div>
            )}
          </div>

          <div
            ref={containerRef}
            className={`pr-2 mt-4 ${
              width < 650 && width >= 450
                ? patfilter.toLowerCase() === "post op"
                  ? "h-[67%]"
                  : "h-[75%]"
                : width < 450 && width / height >= 0.5
                  ? patfilter.toLowerCase() === "post op"
                    ? "h-[50%]"
                    : "h-[65%]"
                  : width < 450 && width / height < 0.5
                    ? patfilter.toLowerCase() === "post op"
                      ? "h-[61%]"
                      : "h-[72%]"
                    : width >= 1000 && width < 1272 && width / height > 1
                      ? patfilter.toLowerCase() === "post op"
                        ? "h-[75%]"
                        : "h-[77%]"
                      : patfilter.toLowerCase() === "post op"
                        ? "h-[82.8%]"
                        : "h-[84%]"
            }`}
          >
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-1 transition-all duration-300">
                {selectedBox === "patients" &&
                  paginatedPatients.map((ques, index) => (
                    <div
                      key={index}
                      style={{ backgroundColor: "rgba(0, 85, 133, 0.1)" }}
                      className={`w-full rounded-lg flex  my-1 py-2 px-3 ${
                        width < 530
                          ? "flex-col justify-center items-center"
                          : "flex-row justify-between items-center"
                      }
                    ${width < 1000 ? "mb-2" : "mb-6"}`}
                    >
                      <div
                        className={`${
                          width < 640 && width >= 530
                            ? "w-3/5"
                            : width < 530
                              ? "w-full"
                              : "w-[50%]"
                        }`}
                      >
                        <div
                          className={`flex gap-4 py-0  items-center  ${
                            width < 710 && width >= 640
                              ? "px-0 flex-row"
                              : width < 530
                                ? "flex-col justify-center items-center"
                                : "px-2 flex-row"
                          }`}
                        >
                          <div
                            className={`w-full flex items-center ${
                              width < 710 ? "flex-col" : "flex-row"
                            }`}
                          >
                            <div
                              className={`flex  flex-col ${
                                width < 710 ? "w-full" : "w-[70%]"
                              }`}
                            >
                              <div
                                className={`flex items-center justify-between `}
                              >
                                <p
                                  className={`text-black font-poppins font-medium text-base ${
                                    width < 530 ? "w-full text-center" : ""
                                  }`}
                                >
                                  {ques.name}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`text-sm font-normal font-poppins text-[#475467]   ${
                                width < 710 && width >= 530
                                  ? "w-full text-start"
                                  : width < 530
                                    ? "w-full text-center"
                                    : "w-[30%] text-center"
                              }`}
                            >
                              {ques.period}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex ${
                          width < 640 && width >= 530
                            ? "w-2/5 flex-col text-start"
                            : width < 530
                              ? "w-full flex-col text-start"
                              : "w-[50%] flex-row"
                        }`}
                      >
                        <div
                          className={` flex ${
                            width <= 750 && width >= 530
                              ? "flex-col items-center justify-center gap-2"
                              : width < 530
                                ? "flex-col items-center gap-2"
                                : "flex-row items-center"
                          } 
                        ${width < 640 ? "w-full justify-end" : "w-[80%]"}`}
                        >
                          <div
                            className={` text-sm font-medium text-black ${
                              width <= 750 && width >= 530
                                ? "w-3/4 text-center"
                                : width < 530
                                  ? "w-full text-center"
                                  : "w-1/3 text-center"
                            }`}
                          >
                            {ques.completed === 1 ? "Completed" : "Pending"}
                          </div>

                          <div
                            className={`text-sm font-medium text-black flex items-center justify-center ${
                              width <= 750 && width >= 530
                                ? "w-3/4 text-center"
                                : width < 530
                                  ? "w-full text-center"
                                  : "w-2/3 text-center"
                            }${ques.completed === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <div
                              className={`w-1/2 flex flex-row items-center gap-6 justify-center relative ${ques.completed === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <div
                                className={`flex flex-col items-start ${ques.completed === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                <p className="font-medium text-black">
                                  DEADLINE
                                </p>
                                <p className="font-medium text-[#476367]">
                                  {selectedDates[index]
                                    ? formatDateForDisplay(selectedDates[index]) // Format the ISO string for display
                                    : getActualDeadlineForDisplay(ques, patient1, selectedLeg)}
                                </p>
                              </div>

                              <input
                                type="date"
                                ref={(el) =>
                                  (dateInputRefs.current[index] = el)
                                }
                                // min={new Date().toISOString().split("T")[0]} // 👈 disables past dates
                                onChange={(e) => handleDateChange(e, index)}
                                className="absolute opacity-0 pointer-events-none"
                              />

                              {/* ICONS SECTION */}
                              {editingIndex === index ? (
                                <div className="flex flex-row gap-2 items-center ml-2">
                                  <CalendarDaysIcon
                                    className={`w-4 h-4  ${ques.completed === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                    onClick={() => {
                                      if (ques.completed !== 1)
                                        openDatePicker(index);
                                    }}
                                  />
                                  <XMarkIcon
                                    className="w-4 h-4 cursor-pointer text-red-500"
                                    onClick={() => {
                                      if (ques.completed !== 1) {
                                        setEditingIndex(null);
                                        setSelectedDates((prev) => {
                                          const updated = { ...prev };
                                          delete updated[index];
                                          return updated;
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <PencilSquareIcon
                                  className={`w-4 h-4 ml-2 ${ques.completed === 1 || ques.period.toLowerCase().includes("pre") ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  onClick={() => {
                                    if (ques.completed !== 1)
                                      setEditingIndex(index);
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className={` flex flex-row justify-center items-center ${
                            width < 640 ? "w-full" : "w-[20%]"
                          } ${ques.completed === 1 || ques.period.toLowerCase().includes("pre") ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <div
                            className={`flex flex-row gap-1 items-center ${
                              width < 640 && width >= 530
                                ? "w-3/4 justify-center"
                                : width < 530
                                  ? "w-full justify-center"
                                  : ""
                            } ${ques.completed === 1 || ques.period.toLowerCase().includes("pre")  ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => {
                              if (ques.completed !== 1)
                                handleReschedule(ques, index);
                            }}
                          >
                            <div className="text-sm font-medium border-b-2 text-[#476367] border-blue-gray-500">
                              Reschedule
                            </div>
                            <ArrowUpRightIcon
                              color="blue"
                              className="w-4 h-4"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Patientremainder
        isOpenrem={isOpenrem}
        onCloserem={() => setIsOpenrem(false)}
        patient={selectedPatient}
      />
    </>
  );
};

export default page;
