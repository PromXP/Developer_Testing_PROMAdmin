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
  PencilIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import Patientimg from "@/app/assets/patimg.png";
import Patcount from "@/app/assets/patcount.png";
import Doccount from "@/app/assets/doccount.png";
import Patacc from "@/app/assets/patacc.png";
import Docacc from "@/app/assets/docacc.png";
import Ascending from "@/app/assets/ascending.png";
import Descending from "@/app/assets/descending.png";
import Manavatar from "@/app/assets/man.png";
import Womanavatar from "@/app/assets/woman.png";
import Adminprofile from "@/app/assets/admin.png";
import Closeicon from "@/app/assets/closeicon.png";

import "@/app/globals.css";

import Patientremainder from "@/app/Patientremainder/page";

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

const page = ({
  setSelectedPatientreport,
  setIsReportOpen,
  setIsCompopen,
  setDoctorListreport,
}) => {
  const { width, height } = useWindowSize();
  // console.log("Screen Width:", width, "Screen Height:", height);
  const [doctorList, setDoctorList] = useState([]);

  const [sortByStatus, setSortByStatus] = useState(false);

  const handleViewReport = (patient) => {
    setIsReportOpen(true);
    setIsCompopen(false);
    setSelectedPatientreport(patient);
    setDoctorListreport(doctorList);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedPatient", JSON.stringify(patient));
      sessionStorage.setItem("doctorListreport", JSON.stringify(doctorList));
      sessionStorage.setItem("isReportOpen", "true");
      sessionStorage.setItem("isCompOpen", "false");
      sessionStorage.setItem("selectedTab", "1");
    }
  };

  const handleViewcomp = (patient) => {
    setIsReportOpen(false);
    setIsCompopen(true);
    setSelectedPatientreport(patient);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedPatient", JSON.stringify(patient));
      sessionStorage.setItem("isReportOpen", "false");
      sessionStorage.setItem("isCompOpen", "true");
      sessionStorage.setItem("selectedTab", "3");
    }
  };

  const [selected, setSelected] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [userData, setUserData] = useState(null);
  const handleSelect = (index) => {
    setSelected(index);
  };

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [docpat, setDocPat] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("userData");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // console.log("Retrieved user from localStorage:", parsedUser);

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
            localStorage.setItem(
              "userData",
              JSON.stringify({
                identifier: parsedUser.identifier,
                password: parsedUser.password,
                role: parsedUser.role,
              })
            );

            setUserData(response.data); // Store the full response data (e.g., tokens)
            localStorage.setItem("uhid", response.data.user.uhid);
            // console.log(
            //   "Successfully logged in with stored credentials",
            //   response.data.user.uhid
            // );
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

  const [patfilter, setpatFilter] = useState("All PATIENTS");

  const options = ["All PATIENTS", "PRE OPERATIVE", "POST OPERATIVE"];

  const postopoptions = ["ALL", "6W", "3M", "6M", "1Y", "2Y"];

  // Load selected option from localStorage or default to "ALL"
  const [postopfilter, setpostopFitler] = useState("ALL");

  //   { name: "Bennett", surgeryStatus: "6W", completed: 5, pending: 2 },
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

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  );
  const dateInputRef = useRef(null);

  const [selectedLeg, setSelectedLeg] = useState("left");

  const openDatePicker = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const selected = new Date(dateValue);
      const today = new Date();

      const isToday =
        selected.getDate() === today.getDate() &&
        selected.getMonth() === today.getMonth() &&
        selected.getFullYear() === today.getFullYear();

      if (isToday) {
        setSelectedDate("Today");
      } else {
        const formattedDate = selected.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        setSelectedDate(formattedDate);
      }
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      if (!userData?.user?.email) return;
      try {
        const res = await axios.get(
          API_URL + `patients/by-admin/${userData?.user?.email}`
        );
        const data = res.data;

        // Optional: Add any transformation or filtering logic here if needed
        setPatients(data);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      }
    };

    fetchPatients();
  }, [userData?.user?.email]);

  const [doctorCount, setDoctorCount] = useState("Loading...");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(API_URL + `getalldoctors`);
        const data = await res.json();

        // Set doctor count (length of data array)
        setDoctorCount(data.length);

        // Format doctor list to show name and email
        const formatted = data.map(
          (doc) => `${doc.doctor_name} - ${doc.email}`
        );
        setDoctorList(formatted);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctorCount("Error");
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchDoctors1 = async () => {
      try {
        const res = await axios.get(API_URL + `getalldoctors`);
        const data = res.data;

        setDoctors(data);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      }
    };

    fetchDoctors1();
  }, []);

  useEffect(() => {
    if (doctors.length > 0) {
      // console.log("Doctors after fetching:", doctors); // ✅ correct timing
    }
  }, [doctors]); // run when doctors updates

  const getCurrentPeriod = (patient, side) => {
    const optionsdrop = ["Pre Op", "6W", "3M", "6M", "1Y", "2Y"];

    const allItems = [
      "Oxford Knee Score (OKS)",
      "Short Form - 12 (SF-12)",
      "Knee Society Score (KSS)",
      "Knee Injury and Ostheoarthritis Outcome Score, Joint Replacement (KOOS, JR)",
      "Forgotten Joint Score (FJS)",
    ];

    const assignedQuestionnaires =
      side === "left"
        ? patient.questionnaire_assigned_left
        : patient.questionnaire_assigned_right;

    // ⭐ If no assigned questionnaires, default to "Pre Op"
    if (!assignedQuestionnaires || assignedQuestionnaires.length === 0) {
      return "Pre Op";
    }

    const groupedByPeriod = optionsdrop.reduce((acc, period) => {
      const assigned = assignedQuestionnaires
        .filter((q) => q.period === period)
        .map((q) => q.name);
      acc[period] = assigned;
      return acc;
    }, {});

    // console.log("status", groupedByPeriod);

    const currentPeriod = optionsdrop.find((period, index) => {
      const assigned = groupedByPeriod[period] || [];
      const anyAssigned = assigned.length > 0; // ⭐ Check if at least 1 is assigned

      const nextPeriod = optionsdrop[index + 1];
      const nextAssigned = groupedByPeriod[nextPeriod] || [];
      const nextAnyAssigned = nextAssigned.length > 0;

      return anyAssigned && !nextAnyAssigned;
    });

    return currentPeriod;
  };

  const getNearestDeadlineNotCompleted = (patient, side) => {
    const assigned =
      side === "left"
        ? patient.questionnaire_assigned_left
        : patient.questionnaire_assigned_right;

    if (!assigned || assigned.length === 0) return null;

    const now = new Date();

    // Filter where not completed and deadline is in the future
    const pending = assigned
      .filter((q) => q.completed === 0)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)); // Sort by nearest deadline

    return pending.length > 0 ? pending[0] : null;
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients
    .filter((patient) => {
      const status = patient.current_status?.toLowerCase() || "";
      const selectedFilter = patfilter.toLowerCase();
      const subFilter = postopfilter.toLowerCase();
      const selectedLegSide = selectedLeg.toLowerCase(); // "left" or "right"

      const hasLeft =
        patient.questionnaire_assigned_left &&
        patient.questionnaire_assigned_left.length > 0;
      const hasRight =
        patient.questionnaire_assigned_right &&
        patient.questionnaire_assigned_right.length > 0;

      let matchByQuestionnaire = false;
      let matchByStatus = false;

      // Always check questionnaire assigned
      if (selectedLegSide === "left" && hasLeft) {
        matchByQuestionnaire = true;
      }
      if (selectedLegSide === "right" && hasRight) {
        matchByQuestionnaire = true;
      }

      // Always check current_status
      if (status.includes("left") && selectedLegSide === "left") {
        matchByStatus = true;
      }
      if (status.includes("right") && selectedLegSide === "right") {
        matchByStatus = true;
      }

      // If neither match questionnaire nor status, don't show
      if (!matchByQuestionnaire && !matchByStatus) {
        return false;
      }

      if (selectedFilter === "all patients") {
        return true;
      }

      const period1 = getCurrentPeriod(patient, selectedLegSide).toLowerCase();
      const period = getPeriodFromSurgeryDate(
                                selectedLeg === "left"
                                  ? patient?.post_surgery_details_left?.date_of_surgery
                                  : patient?.post_surgery_details_right?.date_of_surgery, patient
                              ).toLowerCase();

      // console.log("Inside period", period);

      if (selectedFilter === "pre operative") {
        return period.includes("pre");
      }

      if (selectedFilter === "post operative") {
        if (subFilter === "all") {
          return !period.includes("pre");
        }
        return !period.includes("pre") && period.includes(subFilter);
      }

      return false;
    })
    .filter((patient) => {
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();

      const first = patient.first_name?.toLowerCase() || "";
      const last = patient.last_name?.toLowerCase() || "";
      const fullName = `${first} ${last}`.trim();

      return (
        first.includes(term) ||
        last.includes(term) ||
        fullName.includes(term) || // ✅ check "first last"
        patient.uhid?.toLowerCase().includes(term)
      );
    });

  const convertToDateString = (utcDate) => {
    const date = new Date(utcDate); // Parse the UTC date string into a Date object

    // Get the date in YYYY-MM-DD format
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed, so add 1
    const day = date.getUTCDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`; // Return the date in the format "YYYY-MM-DD"
  };

  const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const displayedPatients = [];

  let completedPatientsCount = 0;
  let pendingPatientsCount = 0;
  let notAssignedPatientsCount = 0;

  patients.forEach((patient) => {
    // console.log("Patient in filter 1", patient);

    const status = patient.current_status?.toLowerCase() || "";
    const selectedFilter = patprogressfilter.toLowerCase();

    const period1 = getCurrentPeriod(patient, selectedLeg).toLowerCase();
    const period = getPeriodFromSurgeryDate(
                                selectedLeg === "left"
                                  ? patient?.post_surgery_details_left?.date_of_surgery
                                  : patient?.post_surgery_details_right?.date_of_surgery, patient
                              ).toLowerCase();

    const statusMatch =
      selectedFilter === "all" ||
      (selectedFilter === "pre op" && period.includes("pre")) ||
      (selectedFilter === "post op" && !period.includes("pre"));

    if (!statusMatch) return;

    // Select questionnaire list based on selected leg
    const assignedQuestionnaires =
      selectedLeg === "left"
        ? patient.questionnaire_assigned_left
        : patient.questionnaire_assigned_right;

    if (!assignedQuestionnaires || assignedQuestionnaires.length === 0) return; // No assigned questionnaires for selected leg

    assignedQuestionnaires.forEach((q) => {
      const deadlineInDateFormat = convertToDateString(q.deadline);
      // console.log("Deadline", deadlineInDateFormat);

      if (
        (!selectedDate || isSameDay(deadlineInDateFormat, selectedDate)) && // Date match
        q.completed === 0 // Only incomplete
      ) {
        displayedPatients.push({
          ...patient,
          matched_deadline: deadlineInDateFormat,
          matched_questionnaire: q.name,
        });
      }
    });

    // console.log("Patient in filter 2", patient);
  });

  patients.forEach((patient) => {
    const status = patient.current_status?.toLowerCase() || "";
    const selectedFilter = patprogressfilter.toLowerCase();

    const period1 = getCurrentPeriod(patient, selectedLeg).toLowerCase();
    const period = getPeriodFromSurgeryDate(
                                selectedLeg === "left"
                                  ? patient?.post_surgery_details_left?.date_of_surgery
                                  : patient?.post_surgery_details_right?.date_of_surgery, patient
                              ).toLowerCase();

    const statusMatch =
      selectedFilter === "all" ||
      (selectedFilter === "pre op" && period.includes("pre")) ||
      (selectedFilter === "post op" && !period.includes("pre"));

    if (!statusMatch) return;

    // Select questionnaire list based on selected leg
    const assignedQuestionnaires =
      selectedLeg === "left"
        ? patient.questionnaire_assigned_left
        : patient.questionnaire_assigned_right;

    if (!assignedQuestionnaires || assignedQuestionnaires.length === 0) {
      // No questionnaires assigned
      notAssignedPatientsCount++;
      return; // No need to check further
    }

    let hasPending = false;

    // Go through each questionnaire for selected leg
    assignedQuestionnaires.forEach((q) => {
      if (q.completed === 0) {
        hasPending = true;
      }
    });

    // Count based on whether patient has pending questionnaires
    if (hasPending) {
      pendingPatientsCount++;
    } else {
      completedPatientsCount++;
    }
  });

  // console.log("Pending Patients:", pendingPatientsCount);
  // console.log("Completed Patients:", completedPatientsCount);
  // console.log("Not Assigned Patients:", notAssignedPatientsCount);

  const [sortAsc, setSortAsc] = useState(false);
  const [selectedBox, setSelectedBox] = useState("patients");
  const handleBoxClick = (boxType) => {
    setSelectedBox(boxType);
  };

  const [doctorPatientStats, setDoctorPatientStats] = useState([]);

  // Function to fetch patients by doctor email
  async function fetchPatientsByDoctor(doctorEmail) {
    const url = API_URL + `patients/by-doctor/${doctorEmail}`;
    const response = await fetch(url);

    if (response.status === 404) {
      // No patients for this doctor
      return null; // Return null to indicate no patients
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch patients for ${doctorEmail}`);
    }
    const data = await response.json();
    return data;
  }

  const [sortDirection, setSortDirection] = useState("desc"); // 'asc' or 'desc'

  const [patientProgress, setPatientProgress] = useState([]);

  useEffect(() => {
    const progressData = patients.map((patient) => {
      let completed = 0;
      let pending = 0;
      let notAssigned = 0;

      // Pick assigned questionnaires based on selected leg
      const assignedQuestionnaires =
        selectedLeg === "left"
          ? patient.questionnaire_assigned_left
          : patient.questionnaire_assigned_right;

      if (!assignedQuestionnaires || assignedQuestionnaires.length === 0) {
        notAssigned = 1; // No questionnaires assigned
      } else {
        assignedQuestionnaires.forEach((q) => {
          if (q.completed === 1) {
            completed++;
          } else {
            pending++;
          }
        });
      }

      // Calculate the total
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
  }, [patients, selectedLeg]); // 🔥 also depend on selectedLeg

  useEffect(() => {
    if (patientProgress.length > 0) {
      // console.log("Patient Compliance:", patientProgress); // ✅ correct timing
    }
  }, [patientProgress]); // run when doctors updates

  const filteredPatientsByDate = filteredPatients.filter((patient) => {
    if (selectedDate === "") {
      return true; // Show all patients by default
    }

    const assignedQuestionnaires =
      selectedLeg === "left"
        ? patient.questionnaire_assigned_left
        : patient.questionnaire_assigned_right;

    if (!assignedQuestionnaires || assignedQuestionnaires.length === 0) {
      return false; // No assigned questionnaires for selected leg
    }

    // Check if patient has any questionnaire assigned with matching deadline
    return assignedQuestionnaires.some((q) => {
      if (!q.deadline) return false;

      const qDeadline = new Date(q.deadline);
      const inputValue = dateInputRef.current?.value;
      const selected = inputValue ? new Date(inputValue) : new Date();
      console.log("Compliance date", inputValue + " " + selected);

      return (
        qDeadline.getDate() === selected.getDate() &&
        qDeadline.getMonth() === selected.getMonth() &&
        qDeadline.getFullYear() === selected.getFullYear()
      );
    });
  });

  const onlyPendingPatients = filteredPatientsByDate.filter((patient) => {
    const assigned =
      selectedLeg === "left"
        ? patient.questionnaire_assigned_left
        : patient.questionnaire_assigned_right;

    if (!assigned || assigned.length === 0) return false;

    const completedCount = assigned.filter((q) => q.completed === 1).length;
    return completedCount < assigned.length; // Only if some are incomplete
  });

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleClearDate = () => {
    setSelectedDate(""); // Clear selected date
    
      dateInputRef.current.value = ""; // Reset the <input type="date"> to empty

  };

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(50);

  const sortedPatients = onlyPendingPatients.sort((a, b) => {
    const FAR_FUTURE = new Date(9999, 11, 31);
    const now = new Date();

    const getNearestDeadline = (patient) => {
      const assigned =
        selectedLeg === "left"
          ? patient.questionnaire_assigned_left
          : patient.questionnaire_assigned_right;

      const pending = assigned
        .filter((q) => q.completed === 0)
        .map((q) => new Date(q.deadline))
        .sort((a, b) => a - b);

      return pending.length > 0 ? pending[0] : FAR_FUTURE;
    };

    const getCompletionPercent = (patient) => {
      const assigned =
        selectedLeg === "left"
          ? patient.questionnaire_assigned_left
          : patient.questionnaire_assigned_right;

      const total = assigned.length;
      const completed = assigned.filter((q) => q.completed === 1).length;

      return total > 0 ? (completed / total) * 100 : 0;
    };

    const getPatientStatus = (patient) => {
      const assigned =
        selectedLeg === "left"
          ? patient.questionnaire_assigned_left
          : patient.questionnaire_assigned_right;

      if (!assigned || assigned.length === 0) return "not_assigned";

      const completedCount = assigned.filter((q) => q.completed === 1).length;
      const total = assigned.length;

      if (completedCount === total) return "completed";
      return "pending";
    };

    const getStatusRank = (patient) => {
      const status = getPatientStatus(patient);

      if (status === "completed") return 1;
      if (status === "pending") return 2;
      return 3; // not_assigned
    };

    const deadlineA = getNearestDeadline(a);
    const deadlineB = getNearestDeadline(b);
    const isNAA = deadlineA.getTime() === FAR_FUTURE.getTime();
    const isNAB = deadlineB.getTime() === FAR_FUTURE.getTime();
    const isPastA = deadlineA < now;
    const isPastB = deadlineB < now;

    if (sortAsc) {
      // Ascending: Past < Soon < N/A
      if (isNAA && !isNAB) return -1;
      if (!isNAA && isNAB) return 1;

      if (isPastA && !isPastB) return 1;
      if (!isPastA && isPastB) return -1;
    } else {
      // Descending: N/A < Soon < Past
      if (isNAA && !isNAB) return 1;
      if (!isNAA && isNAB) return -1;

      if (isPastA && !isPastB) return -1;
      if (!isPastA && isPastB) return 1;
    }

    // If both are same group, sort by date
    if (deadlineA < deadlineB) return sortAsc ? 1 : -1;
    if (deadlineA > deadlineB) return sortAsc ? -1 : 1;

    // Then by completion %
    const compA = getCompletionPercent(a);
    const compB = getCompletionPercent(b);
    if (compA !== compB) return !sortAsc ? compA - compB : compB - compA;
  });

  // Calculate total pages and current visible patients
  const totalPages = Math.ceil(sortedPatients.length / cardsPerPage);
  const paginatedPatients = sortedPatients.slice(
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

  const getAge = (dobString) => {
    if (!dobString) return "";

    const dob = new Date(dobString); // may return Invalid Date if format is "05 May 2002"

    // Parse manually if needed
    if (isNaN(dob)) {
      const [day, monthStr, year] = dobString.split(" ");
      const monthMap = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      const month = monthMap[monthStr.slice(0, 3)];
      if (month === undefined) return "";

      dob.setFullYear(parseInt(year));
      dob.setMonth(month);
      dob.setDate(parseInt(day));
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  const [profileImages, setProfileImages] = useState({});

  useEffect(() => {
    const fetchAllImages = async () => {
      try {
        const res = await fetch(`${API_URL}get-all-profile-photos`);
        if (!res.ok) throw new Error("Failed to fetch profile photos");
        const data = await res.json();

        // Convert array to object { uhid: profile_image_url }
        const imagesMap = {};
        data.patients.forEach((p) => {
          imagesMap[p.uhid] = p.profile_image_url;
        });

        setProfileImages(imagesMap);
      } catch (err) {
        console.error("Error fetching profile images:", err);
      }
    };

    fetchAllImages();
  }, []); // empty dependency: fetch once on mount

  const [showprofile, setshowprofile] = useState(false);
  const [profpat, setprofpat] = useState([]);

  // console.log("Screen Width:", width, "Screen Height:", height);
  const [message, setMessage] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showWarning = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(profpat.email || "");
  const [tempEmail, setTempEmail] = useState(emailValue); // used for cancel action

  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [mobileValue, setMobileValue] = useState(profpat.phone_number || "");
  const [tempMobile, setTempMobile] = useState(mobileValue);

  const [isEditingAltMobile, setIsEditingAltMobile] = useState(false);
  const [altMobileValue, setAltMobileValue] = useState(
    profpat.alternatenumber || ""
  );
  const [tempAltMobile, setTempAltMobile] = useState(altMobileValue);

  const handleEditClick = () => {
    setTempEmail(emailValue); // preserve original
    setIsEditingEmail(true);
  };

  const handleSaveClick = async () => {
    setEmailValue(tempEmail);
    setIsEditingEmail(false);
    const payload = {
      uhid: profpat.uhid,
      email: tempEmail,
    };
    // TODO: Call API to save emailValue if needed

    try {
      const response = await fetch(API_URL + "update-patient-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // console.log("Submission successful:", payload);
      if (!response.ok) {
        throw new Error("Failed to send data.");
      }

      const result = await response.json();
      // console.log("Submission successful:", result);
      showWarning("Update Successfull");
      // Optionally, show success message here
    } catch (error) {
      console.error("Error submitting data:", error);
      showWarning("Update failed");
      showWarning("Update Successfull");
    }
  };

  const handleCancelClick = () => {
    setIsEditingEmail(false);
  };

  const handleEditMobile = () => {
    setTempMobile(mobileValue);
    setIsEditingMobile(true);
  };

  const handleSaveMobile = async () => {
    setMobileValue(tempMobile);
    setIsEditingMobile(false);
    // TODO: Call API to persist mobileValue
    const payload = {
      uhid: profpat.uhid,
      phone_number: altMobileValue,
    };
    try {
      const response = await fetch(API_URL + "update-patient-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // console.log("Submission successful:", payload);
      if (!response.ok) {
        throw new Error("Failed to send data.");
      }

      const result = await response.json();
      // console.log("Submission successful:", result);
      showWarning("Update Successfull");
      // Optionally, show success message here
    } catch (error) {
      console.error("Error submitting data:", error);
      showWarning("Update failed");
      showWarning("Update Successfull");
    }
  };

  const handleCancelMobile = () => {
    setIsEditingMobile(false);
  };

  const handleEditAltMobile = () => {
    setTempAltMobile(altMobileValue);
    setIsEditingAltMobile(true);
  };

  const handleSaveAltMobile = async () => {
    setAltMobileValue(tempAltMobile);
    setIsEditingAltMobile(false);
    // TODO: API call to save altMobileValue
    const payload = {
      uhid: profpat.uhid,
      alternatenumber: tempAltMobile,
    };
    // console.log("Alternate mobile number",payload);
    // return;
    try {
      const response = await fetch(API_URL + "update-patient-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // console.log("Submission successful:", payload);
      if (!response.ok) {
        throw new Error("Failed to send data.");
      }

      const result = await response.json();
      // console.log("Submission successful:", result);
      showWarning("Update Successfull");
      // Optionally, show success message here
    } catch (error) {
      console.error("Error submitting data:", error);
      showWarning("Update Failed");
      showWarning("Update failed");
    }
  };

  const handleCancelAltMobile = () => {
    setIsEditingAltMobile(false);
  };

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressValue, setAddressValue] = useState(profpat.address || "");
  const [tempAddress, setTempAddress] = useState(addressValue);

  const handleEditAddress = () => {
    setTempAddress(addressValue);
    setIsEditingAddress(true);
  };

  const handleCancelAddress = () => {
    setTempAddress(addressValue);
    setIsEditingAddress(false);
  };

  const handleSaveAddress = async () => {
    setAddressValue(tempAddress);
    setIsEditingAddress(false);

    // Optional: API call
    const payload = {
      uhid: profpat.uhid,
      address: tempAddress,
    };
    // console.log("Saving address", payload);

    try {
      const response = await fetch(API_URL + "update-patient-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // console.log("Submission successful:", payload);
      if (!response.ok) {
        throw new Error("Failed to send data.");
      }

      const result = await response.json();
      // console.log("Submission successful:", result);
      showWarning("Update Successfull");
      // Optionally, show success message here
    } catch (error) {
      console.error("Error submitting data:", error);
      showWarning("Update failed");
      showWarning("Update Successfull");
    }

    // await fetch or axios call to update if needed
  };

  const [isEditingPassport, setIsEditingPassport] = useState(false);
  const [passportvalue, setpassportvalue] = useState(
    profpat?.idproof?.PASSPORT || ""
  );
  const [temppassport, setTemppassport] = useState(passportvalue); // used for cancel action

  const [isEditingPan, setIsEditingPan] = useState(false);
  const [panvalue, setpanvalue] = useState(profpat?.idproof?.PAN || "");
  const [temppan, setTemppan] = useState(panvalue); // used for cancel action

  const [isEditingAadhaar, setIsEditingAadhaar] = useState(false);
  const [aadhaarvalue, setaadhaarvalue] = useState(
    profpat?.idproof?.AADHAAR || ""
  );
  const [tempaadhaar, setTempaadhaar] = useState(aadhaarvalue); // used for cancel action

  const [isEditingABHA, setIsEditingABHA] = useState(false);
  const [abhavalue, setabhavalue] = useState(profpat?.idproof?.ABHA || "");
  const [tempabha, setTempabha] = useState(abhavalue); // used for cancel action

  const [profileImage, setProfileImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleEditPassport = () => {
    setTemppassport(passportvalue);
    setIsEditingPassport(true);
  };

  const handleCancelPassport = () => {
    setTemppassport(passportvalue);
    setIsEditingPassport(false);
  };

  const handleSavePassport = async () => {
    setpassportvalue(temppassport);
    setIsEditingPassport(false);

    // Optional: API call
    const payload = {
      uhid: profpat.uhid,
      "idproof.PASSPORT": temppassport,
    };
    // console.log("Saving address", payload);

    try {
      const response = await fetch(API_URL + "update-patient-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // console.log("Submission successful:", payload);
      if (!response.ok) {
        throw new Error("Failed to send data.");
      }

      const result = await response.json();
      // console.log("Submission successful:", result);
      showWarning("Update Successfull");
      // Optionally, show success message here
    } catch (error) {
      console.error("Error submitting data:", error);
      showWarning("Update failed");
      showWarning("Update Successfull");
    }

    // await fetch or axios call to update if needed
  };

  const handleEditPan = () => {
    setTemppan(panvalue);
    setIsEditingPan(true);
  };

  const handleCancelPan = () => {
    setTemppan(panvalue);
    setIsEditingPan(false);
  };

  const handleSavePan = async () => {
    setpanvalue(temppan);
    setIsEditingPan(false);

    // Optional: API call
    const payload = {
      uhid: profpat.uhid,
      "idproof.PAN": temppan,
    };
    // console.log("Saving address", payload);

    try {
      const response = await fetch(API_URL + "update-patient-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // console.log("Submission successful:", payload);
      if (!response.ok) {
        throw new Error("Failed to send data.");
      }

      const result = await response.json();
      // console.log("Submission successful:", result);
      showWarning("Update Successfull");
      // Optionally, show success message here
    } catch (error) {
      console.error("Error submitting data:", error);
      showWarning("Update failed");
      showWarning("Update Successfull");
    }

    // await fetch or axios call to update if needed
  };

  const handleEditAadhaar = () => {
    setTempaadhaar(aadhaarvalue);
    setIsEditingAadhaar(true);
  };

  const handleCancelAadhaar = () => {
    setTempaadhaar(aadhaarvalue);
    setIsEditingAadhaar(false);
  };

  const handleSaveAadhaar = async () => {
    setaadhaarvalue(tempaadhaar);
    setIsEditingAadhaar(false);

    // Optional: API call
    const payload = {
      uhid: profpat.uhid,
      "idproof.AADHAAR": tempaadhaar,
    };
    // console.log("Saving address", payload);

    try {
      const response = await fetch(API_URL + "update-patient-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // console.log("Submission successful:", payload);
      if (!response.ok) {
        throw new Error("Failed to send data.");
      }

      const result = await response.json();
      // console.log("Submission successful:", result);
      showWarning("Update Successfull");
      // Optionally, show success message here
    } catch (error) {
      console.error("Error submitting data:", error);
      showWarning("Update failed");
      showWarning("Update Successfull");
    }

    // await fetch or axios call to update if needed
  };

  const handleEditABHA = () => {
    setTempabha(abhavalue);
    setIsEditingABHA(true);
  };

  const handleCancelABHA = () => {
    setTempabha(abhavalue);
    setIsEditingABHA(false);
  };

  const handleSaveABHA = async () => {
    setabhavalue(tempabha);
    setIsEditingABHA(false);

    // Optional: API call
    const payload = {
      uhid: profpat.uhid,
      "idproof.ABHA": tempabha,
    };
    // console.log("Saving address", payload);

    try {
      const response = await fetch(API_URL + "update-patient-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // console.log("Submission successful:", payload);
      if (!response.ok) {
        throw new Error("Failed to send data.");
      }

      const result = await response.json();
      // console.log("Submission successful:", result);
      showWarning("Update Successfull");
      // Optionally, show success message here
    } catch (error) {
      console.error("Error submitting data:", error);
      showWarning("Update failed");
      showWarning("Update Successfull");
    }

    // await fetch or axios call to update if needed
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && e.target.files) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSuccess("");
      setError("");
      setimgupload(true);
    }
  };

  const isBlobUrl = previewUrl && previewUrl.startsWith("blob:");

  const [showimgupload, setimgupload] = useState(false);

  const fileInputRef = useRef(null); // To programmatically trigger the file input

  const resetImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
    setSuccess("");
    setError("");

    // Optionally clear the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    setimgupload(false);
  };

  const handleUpload = async ({ uhid1, type1 }) => {
    if (!profileImage) {
      setError("Please select or capture an image.");
      return;
    }

    const formData = new FormData();
    formData.append("uhid", uhid1);
    formData.append("usertype", type1); // <-- Make sure userType is defined
    formData.append("profile_image", profileImage);

    try {
      const res = await axios.post(
        `${API_URL}upload-profile-photo`,
        formData
        // ❌ DO NOT SET HEADERS — Axios will handle Content-Type with boundaries
      );

      // console.log("Profile upload success:", res.data);
      setSuccess("Image uploaded successfully.");
      showWarning("Image Upload Successfull");
      setError("");
      setimgupload(false);
    } catch (err) {
      console.error("Profile upload failed:", err);
      setError("Upload failed.");
      showWarning("Image Upload failed");
      setSuccess("");
      setimgupload(true);
    }
  };

  const formatMaskedID = (id) => {
    if (!id || id.length <= 4) return id;
    const maskedLength = id.length - 4;
    return "*".repeat(maskedLength) + id.slice(-4);
  };

   function getPeriodFromSurgeryDate(surgeryDateStr,patient) {
    if (!surgeryDateStr) return "Not Found";

  const surgeryDate = new Date(surgeryDateStr);

  // Check for invalid or default placeholder date
  if (
    isNaN(surgeryDate) ||
    surgeryDate.getFullYear() === 1 // Covers "0001-01-01T00:00:00.000+00:00"
  ) {
    return "Not Found";
  }

    const today = new Date();
    const diffInDays = Math.floor((today - surgeryDate) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) {
      return "Pre Op";
    }

    const periodOffsets = {
      "6W": 42,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
      "2Y": 730,
    };

    const periods = Object.entries(periodOffsets)
      .map(([label, offset]) => ({
        label,
        diff: Math.abs(diffInDays - offset),
      }))
      .sort((a, b) => a.diff - b.diff);

    return periods[0]?.label || "Unknown";
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row w-[95%] gap-4 mx-auto mt-4 items-center justify-between">
        {/* Greeting Section */}
        <div className="flex flex-col lg:flex-row md:items-center md:justify-between gap-4 w-full">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-1 md:gap-4">
            <h4 className="font-medium text-black text-xl md:text-[26px]">
              Welcome
            </h4>
            <h2 className="font-bold text-[#005585] text-2xl md:text-4xl">
              {userData?.user?.admin_name
                ? `${userData.user.admin_name}`
                : "Loading..."}
            </h2>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-3/5">
            <input
              type="text"
              placeholder="Search using Name or UHID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005585]"
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
              />
            </svg>
          </div>
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
          className={` h-fit rounded-xl pt-4 px-4 flex flex-col gap-4 ${
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
                Patients Compliance
              </p>
              <div className="flex flex-row gap-2 justify-center items-center">
                <div className="flex mb-2 mt-2">
                  <div
                    className="flex items-start justify-start gap-2 text-sm font-medium text-black cursor-pointer"
                    onClick={() => {
                      setSortByStatus((prev) => !prev);
                      setSortAsc((prev) => !prev);
                      setSearchTerm("");
                    }}
                  >
                    <Image
                      src={!sortAsc ? Ascending : Descending}
                      alt="Sort"
                      className=" w-5 h-5 cursor-pointer"
                    />
                    {!sortAsc ? "Low to High" : "High to Low"}
                  </div>
                </div>

                <div className="flex flex-row">
                  <div
                    className="relative cursor-pointer"
                    onClick={openDatePicker}
                  >
                    <input
                      type="date"
                      ref={dateInputRef}
                      onChange={handleDateChange}
                      className="absolute opacity-0 pointer-events-none"
                    />
                    <p
                      className={`font-medium text-center w-[100px] p-0 ${
                        selectedDate === "Today" || selectedDate === ""
                          ? "text-[#60F881]"
                          : "text-[#60F881]"
                      }
                    ${
                      width > 1000 && width / height > 1 ? "text-sm" : "text-lg"
                    }`}
                    >
                      {selectedDate || "All Patients"}
                    </p>
                  </div>

                  {!selectedDate && (
                    <button
                      onClick={openDatePicker}
                      className="text-black text-xs underline cursor-pointer"
                    >
                      <CalendarDaysIcon className="w-4 h-4" />
                    </button>
                  )}

                  {selectedDate && (
                    <button
                      onClick={handleClearDate}
                      className="text-red-500 text-xs underline hover:text-red-700 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
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
                  {" "}
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
                          setSearchTerm("");
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

                {patfilter.toLowerCase() == "post operative" && (
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
                          setSearchTerm("");
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
            className={` mt-4 ${
              width < 650 && width >= 450
                ? patfilter.toLowerCase() === "post operative"
                  ? "h-[67%]"
                  : "h-[75%]"
                : width < 450 && width / height >= 0.5
                  ? patfilter.toLowerCase() === "post operative"
                    ? "h-[50%]"
                    : "h-[65%]"
                  : width < 450 && width / height < 0.5
                    ? patfilter.toLowerCase() === "post operative"
                      ? "h-[61%]"
                      : "h-[72%]"
                    : width >= 1000 && width < 1272 && width / height > 1
                      ? patfilter.toLowerCase() === "post operative"
                        ? "h-[75%]"
                        : "h-[77%]"
                      : patfilter.toLowerCase() === "post operative"
                        ? "h-[82.8%]"
                        : "h-[84%]"
            }`}
          >
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-1 transition-all duration-300">
                {selectedBox === "patients" &&
                  paginatedPatients
                    .map((patient) => {
                      // Find the progress data for the current patient
                      const progress = patientProgress.find(
                        (p) => p.patientId === patient.uhid
                      );

                      // If no progress data exists, set default values
                      if (progress) {
                        patient.completed = progress.completed;
                        patient.pending = progress.pending;
                        patient.notAssigned = progress.notAssigned;
                        patient.total = progress.total;
                      } else {
                        patient.completed = 0;
                        patient.pending = 0;
                        patient.notAssigned = 1;
                        patient.total = 1; // Assuming at least one questionnaire exists
                      }

                      // Check the status based on the progress data
                      if (patient.notAssigned > 0) {
                        patient.status = "notAssigned";
                      } else if (patient.completed === patient.total) {
                        patient.status = "completed";
                      } else {
                        patient.status = "pending";
                      }

                      return patient;
                    })

                    .sort((a, b) => {
                      const FAR_FUTURE = new Date(9999, 11, 31);
                      const now = new Date();

                      const getNearestDeadline = (patient) => {
                        const assigned =
                          selectedLeg === "left"
                            ? patient.questionnaire_assigned_left
                            : patient.questionnaire_assigned_right;

                        const pending = assigned
                          .filter((q) => q.completed === 0)
                          .map((q) => new Date(q.deadline))
                          .sort((a, b) => a - b);

                        return pending.length > 0 ? pending[0] : FAR_FUTURE;
                      };

                      const getCompletionPercent = (patient) => {
                        const assigned =
                          selectedLeg === "left"
                            ? patient.questionnaire_assigned_left
                            : patient.questionnaire_assigned_right;

                        const total = assigned.length;
                        const completed = assigned.filter(
                          (q) => q.completed === 1
                        ).length;

                        return total > 0 ? (completed / total) * 100 : 0;
                      };

                      const getPatientStatus = (patient) => {
                        const assigned =
                          selectedLeg === "left"
                            ? patient.questionnaire_assigned_left
                            : patient.questionnaire_assigned_right;

                        if (!assigned || assigned.length === 0)
                          return "not_assigned";

                        const completedCount = assigned.filter(
                          (q) => q.completed === 1
                        ).length;
                        const total = assigned.length;

                        if (completedCount === total) return "completed";
                        return "pending";
                      };

                      const getStatusRank = (patient) => {
                        const status = getPatientStatus(patient);

                        if (status === "completed") return 1;
                        if (status === "pending") return 2;
                        return 3; // not_assigned
                      };

                      const deadlineA = getNearestDeadline(a);
                      const deadlineB = getNearestDeadline(b);
                      const isNAA =
                        deadlineA.getTime() === FAR_FUTURE.getTime();
                      const isNAB =
                        deadlineB.getTime() === FAR_FUTURE.getTime();
                      const isPastA = deadlineA < now;
                      const isPastB = deadlineB < now;

                      if (sortAsc) {
                        // Ascending: Past < Soon < N/A
                        if (isNAA && !isNAB) return -1;
                        if (!isNAA && isNAB) return 1;

                        if (isPastA && !isPastB) return 1;
                        if (!isPastA && isPastB) return -1;
                      } else {
                        // Descending: N/A < Soon < Past
                        if (isNAA && !isNAB) return 1;
                        if (!isNAA && isNAB) return -1;

                        if (isPastA && !isPastB) return -1;
                        if (!isPastA && isPastB) return 1;
                      }

                      // If both are same group, sort by date
                      if (deadlineA < deadlineB) return sortAsc ? 1 : -1;
                      if (deadlineA > deadlineB) return sortAsc ? -1 : 1;

                      // Then by completion %
                      const compA = getCompletionPercent(a);
                      const compB = getCompletionPercent(b);
                      if (compA !== compB)
                        return !sortAsc ? compA - compB : compB - compA;
                    })

                    .map((patient) => (
                      <div
                        ref={patient.uhid ? cardRef : null}
                        key={patient.uhid}
                        style={{ backgroundColor: "rgba(0, 85, 133, 0.1)" }}
                        className={`w-full rounded-lg flex py-2 px-3 ${
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
                                : "w-[40%]"
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
                            <Image
                              src={
                                profileImages[patient.uhid] ||
                                (patient.gender === "male"
                                  ? Manavatar
                                  : Womanavatar)
                              }
                              alt={patient.uhid}
                              width={40} // or your desired width
                              height={40} // or your desired height
                              className={`rounded-full cursor-pointer ${
                                width < 530
                                  ? "w-11 h-11 flex justify-center items-center"
                                  : "w-10 h-10"
                              }`}
                              onClick={() => {
                                setshowprofile(true);
                                setprofpat(patient);
                              }}
                            />

                            <div
                              className={`w-full flex items-center ${
                                width < 710 ? "flex-col" : "flex-row"
                              }`}
                            >
                              <div
                                className={`flex  flex-col ${
                                  width < 710 ? "w-full" : "w-[50%]"
                                }`}
                              >
                                <div
                                  className={`flex items-center justify-between `}
                                >
                                  <p
                                    className={`text-[#475467] font-poppins font-medium text-base ${
                                      width < 530 ? "w-full text-center" : ""
                                    }`}
                                  >
                                    {patient.first_name +
                                      " " +
                                      patient.last_name}
                                  </p>
                                </div>
                                <p
                                  className={`font-poppins font-medium text-sm text-[#475467] ${
                                    width < 530 ? "text-center" : "text-start"
                                  }`}
                                >
                                  {getAge(patient.dob)}, {patient.gender}
                                </p>
                              </div>

                              <div
                                className={`text-sm font-normal font-poppins text-[#475467]   ${
                                  width < 710 && width >= 530
                                    ? "w-full text-start"
                                    : width < 530
                                      ? "w-full text-center"
                                      : "w-[15%] text-center"
                                }`}
                              >
                                {patient.uhid}
                              </div>

                              <div
                                className={`text-sm font-normal font-poppins text-[#475467]   ${
                                  width < 710 && width >= 530
                                    ? "w-full text-start"
                                    : width < 530
                                      ? "w-full text-center"
                                      : "w-[35%] text-end"
                                }`}
                              >
                                {getPeriodFromSurgeryDate(
                                selectedLeg === "left"
                                  ? patient?.post_surgery_details_left?.date_of_surgery
                                  : patient?.post_surgery_details_right?.date_of_surgery, patient
                              )}
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
                                : "w-[60%] flex-row"
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
                              className={` text-sm font-medium text-[#475467] ${
                                width <= 750 && width >= 530
                                  ? "w-3/4 text-center"
                                  : width < 530
                                    ? "w-full text-center"
                                    : "w-[30%] text-center"
                              }`}
                            >
                              {(() => {
                                const item = getNearestDeadlineNotCompleted(
                                  patient,
                                  selectedLeg
                                );
                                return item
                                  ? `${new Date(item.deadline).toLocaleDateString()}`
                                  : "NA";
                              })()}
                            </div>

                            <div
                              className={`text-sm font-medium text-black flex items-center justify-center ${
                                width <= 750 && width >= 530
                                  ? "w-3/4 text-center"
                                  : width < 530
                                    ? "w-full text-center"
                                    : "w-[40%] text-center"
                              }`}
                            >
                              <div className="w-1/2 flex flex-col items-center justify-center">
                                <div
                                  className={`w-full flex flex-col items-center relative group ${
                                    (selectedLeg === "left" &&
                                      (!patient.questionnaire_assigned_left ||
                                        patient.questionnaire_assigned_left
                                          .length === 0)) ||
                                    (selectedLeg === "right" &&
                                      (!patient.questionnaire_assigned_right ||
                                        patient.questionnaire_assigned_right
                                          .length === 0))
                                      ? "pointer-events-none opacity-50"
                                      : ""
                                  }`}
                                >
                                  {/* Hover Percentage Text */}
                                  <div
                                    className="absolute -top-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out text-sm font-semibold text-black
    group-hover:border-2 group-hover:border-black group-hover:px-3 group-hover:rounded-lg"
                                  >
                                    {Math.round(
                                      (patient.completed / patient.total) * 100
                                    )}
                                    %
                                  </div>

                                  {/* Progress Bar Container */}
                                  <div
                                    className="relative w-full h-3  overflow-hidden bg-white cursor-pointer"
                                    style={{
                                      backgroundSize: "20px 20px",
                                    }}
                                    onClick={() => handleViewcomp(patient)}
                                  >
                                    {/* Filled Progress */}
                                    <div
                                      className={`h-full transition-all duration-500 ${
                                        (patient.completed / patient.total) *
                                          100 >
                                        80
                                          ? "bg-green-500"
                                          : (patient.completed /
                                                patient.total) *
                                                100 >=
                                              51
                                            ? "bg-yellow-400"
                                            : (patient.completed /
                                                  patient.total) *
                                                  100 >=
                                                21
                                              ? "bg-orange-400"
                                              : (patient.completed /
                                                    patient.total) *
                                                    100 >
                                                  0
                                                ? "bg-red-500"
                                                : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${(patient.completed / patient.total) * 100 > 0 ? (patient.completed / patient.total) * 100 : 2}%`,
                                        backgroundImage:
                                          (patient.completed / patient.total) *
                                            100 >
                                          0
                                            ? "url('/stripes.svg')"
                                            : "none",
                                        backgroundRepeat: "repeat",
                                        backgroundSize: "20px 20px",
                                        animation:
                                          (patient.completed / patient.total) *
                                            100 >
                                          0
                                            ? "2s linear infinite"
                                            : "none",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`text-sm font-medium text-black ${
                                width <= 750 && width >= 530
                                  ? "w-3/4 text-center"
                                  : width < 530
                                    ? "w-full text-center"
                                    : "w-[30%] text-end"
                              }`}
                            >
                              <button
                                className={`w-2/3 rounded-full p-1 ${
                                  (patient.completed / patient.total) * 100 ===
                                    100 ||
                                  (selectedLeg === "left" &&
                                    (!patient.questionnaire_assigned_left ||
                                      patient.questionnaire_assigned_left
                                        .length === 0)) ||
                                  (selectedLeg === "right" &&
                                    (!patient.questionnaire_assigned_right ||
                                      patient.questionnaire_assigned_right
                                        .length === 0))
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#005585] cursor-pointer"
                                } text-white`}
                                onClick={() => {
                                  if (
                                    (patient.completed / patient.total) *
                                      100 !==
                                      100 &&
                                    !(
                                      (selectedLeg === "left" &&
                                        (!patient.questionnaire_assigned_left ||
                                          patient.questionnaire_assigned_left
                                            .length === 0)) ||
                                      (selectedLeg === "right" &&
                                        (!patient.questionnaire_assigned_right ||
                                          patient.questionnaire_assigned_right
                                            .length === 0))
                                    )
                                  ) {
                                    setSelectedPatient(patient);
                                    setIsOpenrem(true);
                                  }
                                }}
                                disabled={
                                  (patient.completed / patient.total) * 100 ===
                                    100 ||
                                  (selectedLeg === "left" &&
                                    (!patient.questionnaire_assigned_left ||
                                      patient.questionnaire_assigned_left
                                        .length === 0)) ||
                                  (selectedLeg === "right" &&
                                    (!patient.questionnaire_assigned_right ||
                                      patient.questionnaire_assigned_right
                                        .length === 0))
                                }
                              >
                                NOTIFY
                              </button>
                            </div>
                          </div>

                          <div
                            className={` flex flex-row justify-center items-center ${
                              width < 640 ? "w-full" : "w-[20%]"
                            }`}
                          >
                            <div
                              className={`flex flex-row gap-1 items-center ${
                                width < 640 && width >= 530
                                  ? "w-3/4 justify-center"
                                  : width < 530
                                    ? "w-full justify-center"
                                    : ""
                              }`}
                              onClick={() => handleViewReport(patient)}
                            >
                              <div className="text-sm font-medium border-b-2 text-[#476367] border-blue-gray-500 cursor-pointer">
                                Report
                              </div>
                              <ArrowUpRightIcon
                                color="blue"
                                className="w-4 h-4 cursor-pointer"
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

      {showprofile && (
        <div
          className="fixed inset-0 z-40 "
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)", // white with 50% opacity
          }}
        >
          <div
            className={`
                  min-h-screen w-5/6 flex flex-col items-center justify-center mx-auto
                  ${width < 950 ? "p-4 gap-4 " : "p-8 "}
                `}
          >
            <div
              className={`w-full bg-white rounded-2xl py-8 px-20  overflow-y-auto overflow-x-hidden max-h-[90vh] ${
                width < 1095 ? "flex flex-col gap-4" : ""
              }`}
            >
              <div
                className={`w-full bg-white  ${width < 760 ? "h-fit" : "h-[90%]"} `}
              >
                <div
                  className={`w-full h-full rounded-lg flex flex-col gap-8 ${
                    width < 760 ? "py-0" : "py-4"
                  }`}
                >
                  <div className={`relative w-full`}>
                    <div className="absolute top-0 right-0">
                      <Image
                        className={`cursor-pointer ${
                          width < 530 ? "w-4 h-4" : "w-4 h-4"
                        }`}
                        src={Closeicon}
                        alt="close"
                        onClick={() => {
                          setMessage("");
                          setshowprofile(false);
                          window.location.reload();
                        }}
                      />
                    </div>
                    <div
                      className={`w-full flex gap-4 flex-col ${
                        width < 530
                          ? "justify-center items-center"
                          : "justify-start items-start "
                      }`}
                    >
                      <p className="font-bold text-2xl text-black">
                        PATIENT PROFILE
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-full flex flex-col gap-6">
                    <div className="w-full h-full flex flex-col gap-8">
                      <div
                        className={`w-full flex  gap-4 ${
                          width < 700 ? "flex-col" : "flex-row"
                        }`}
                      >
                        <div
                          className={`flex flex-col justify-start items-center gap-2 ${
                            width < 700 ? "w-full" : "w-1/2"
                          }`}
                        >
                          <div
                            className="w-[256px] h-[256px] cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                            style={{ position: "relative" }}
                          >
                            {isBlobUrl ? (
                              // Plain <img> for blob URLs
                              <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "fill",
                                  borderRadius: 8,
                                }}
                                className="border"
                              />
                            ) : (
                              // Next.js Image for static or remote URLs
                              <Image
                                src={
                                  profileImages[profpat.uhid] ||
                                  (profpat.gender === "male"
                                    ? Manavatar
                                    : Womanavatar)
                                }
                                alt="Upload or Capture"
                                layout="fill"
                                objectFit="cover"
                                className="rounded border w-full h-full"
                              />
                            )}

                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              style={{ display: "none" }}
                              ref={fileInputRef}
                              onChange={handleImageChange}
                            />
                          </div>
                          <div>
                            {showimgupload && (
                              <div className="w-full flex flex-row justify-center items-center gap-8">
                                <div className="w-1/2 flex flex-row justify-start items-center">
                                  <p
                                    className="font-semibold italic text-[#475467] text-lg cursor-pointer"
                                    onClick={resetImage}
                                  >
                                    RESET
                                  </p>
                                </div>
                                <div className="w-1/2 flex flex-row justify-end items-center">
                                  <p
                                    className=" rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-lg font-semibold border-[#005585] border-2"
                                    style={{
                                      backgroundColor: "rgba(0, 85, 133, 0.9)",
                                    }}
                                    onClick={() => {
                                      handleUpload({
                                        uhid1: profpat.uhid,
                                        type1: "patient",
                                      });
                                    }}
                                  >
                                    UPLOAD
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div
                          className={`flex flex-col justify-between items-start gap-2 ${
                            width < 700 ? "w-full" : "w-1/2"
                          }`}
                        >
                          <div className="flex flex-row gap-4 w-full">
                            <p className="text-black text-lg font-bold w-1/2">
                              FIRST NAME
                            </p>
                            <p className="text-black text-lg font-medium w-1/2">
                              {profpat.first_name}
                            </p>
                          </div>

                          <div className="flex flex-row gap-4 w-full">
                            <p className="text-black text-lg font-bold w-1/2">
                              LAST NAME
                            </p>
                            <p className="text-black text-lg font-medium w-1/2">
                              {profpat.last_name}
                            </p>
                          </div>

                          <div className="flex flex-row gap-4 w-full">
                            <p className="text-black text-lg font-bold w-1/2">
                              DATE OF BIRTH
                            </p>
                            <p className="text-black text-lg font-medium w-1/2">
                              {profpat.dob}
                            </p>
                          </div>

                          <div className="flex flex-row gap-4 w-full">
                            <p className="text-black text-lg font-bold w-1/2">
                              GENDER
                            </p>
                            <p className="text-black text-lg font-medium w-1/2">
                              {profpat.gender}
                            </p>
                          </div>

                          <div className="flex flex-row gap-4 w-full items-center">
                            <p className="text-black text-lg font-bold w-1/2">
                              ADDRESS
                            </p>

                            {isEditingAddress ? (
                              <div className="flex w-1/2 gap-2 items-center">
                                <input
                                  className="border flex-1 bg-gray-100 text-black p-1 rounded-md text-sm"
                                  value={tempAddress}
                                  onChange={(e) =>
                                    setTempAddress(e.target.value)
                                  }
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={handleSaveAddress}
                                    className="text-green-600 text-xs cursor-pointer"
                                  >
                                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={handleCancelAddress}
                                    className="text-red-600 text-xs cursor-pointer"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex w-1/2 justify-between items-center">
                                <p className="text-black text-lg font-medium">
                                  {profpat.address ||
                                    addressValue ||
                                    "Not found"}
                                </p>
                                <button
                                  onClick={handleEditAddress}
                                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-full flex  gap-4 ${
                          width < 700 ? "flex-col" : "flex-row"
                        }`}
                      >
                        <div
                          className={`flex flex-col justify-center items-center gap-2 ${
                            width < 700 ? "w-full" : "w-1/2"
                          }`}
                        >
                          <div className="flex flex-row gap-4 w-full items-center">
                            <p className="text-black text-lg font-bold w-1/4">
                              MOBILE
                            </p>

                            {isEditingMobile ? (
                              <div className="flex w-3/4 gap-2 items-center">
                                <input
                                  className="border flex-1 bg-gray-100 text-black p-1 rounded-md text-sm"
                                  value={tempMobile}
                                  onChange={(e) =>
                                    setTempMobile(e.target.value)
                                  }
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={handleSaveMobile}
                                    className="text-green-600 text-xs cursor-pointer"
                                  >
                                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={handleCancelMobile}
                                    className="text-red-600 text-xs cursor-pointer"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex w-1/2 justify-between items-center">
                                <p className="text-black text-lg font-medium">
                                  {profpat.phone_number ||
                                    mobileValue ||
                                    "Not found"}
                                </p>
                                <button
                                  onClick={handleEditMobile}
                                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div
                          className={`flex flex-col justify-center items-center gap-2 ${
                            width < 700 ? "w-full" : "w-1/2"
                          }`}
                        >
                          <div className="flex flex-row gap-4 w-full items-center">
                            <p className="text-black text-lg font-bold w-1/2">
                              ALTERNATE MOBILE
                            </p>

                            {isEditingAltMobile ? (
                              <div className="flex w-1/2 gap-2 items-center">
                                <input
                                  className="border flex-1 bg-gray-100 text-black p-1 rounded-md text-sm"
                                  value={tempAltMobile}
                                  onChange={(e) =>
                                    setTempAltMobile(e.target.value)
                                  }
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={handleSaveAltMobile}
                                    className="text-green-600 text-xs cursor-pointer"
                                  >
                                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={handleCancelAltMobile}
                                    className="text-red-600 text-xs cursor-pointer"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex w-1/2 justify-between items-center">
                                <p className="text-black text-lg font-medium">
                                  {profpat.alternatenumber ||
                                    altMobileValue ||
                                    "Not found"}
                                </p>
                                <button
                                  onClick={handleEditAltMobile}
                                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-full flex  gap-4 ${
                          width < 700 ? "flex-col" : "flex-row"
                        }`}
                      >
                        <div
                          className={`flex flex-col justify-start items-center gap-2 ${
                            width < 700 ? "w-full" : "w-1/2"
                          }`}
                        >
                          <div className="flex flex-row gap-4 w-full items-center">
                            <p className="text-black text-lg font-bold w-1/4">
                              EMAIL
                            </p>

                            {isEditingEmail ? (
                              <div className="flex w-3/4 gap-2 items-center">
                                <input
                                  className="border flex-1 bg-gray-100 text-black p-1 rounded-md text-sm"
                                  value={tempEmail}
                                  onChange={(e) => setTempEmail(e.target.value)}
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={handleSaveClick}
                                    className="text-green-600 text-xs cursor-pointer"
                                  >
                                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={handleCancelClick}
                                    className="text-red-600 text-xs cursor-pointer"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex w-1/2 justify-between items-center">
                                <p className="text-black text-lg font-medium break-words w-full">
                                  {profpat.email || emailValue || "Not found"}
                                </p>
                                <button
                                  onClick={handleEditClick}
                                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div
                          className={`flex flex-row justify-start items-center gap-4 ${
                            width < 700 ? "w-full" : "w-1/2"
                          }`}
                        >
                          <div className="flex flex-row gap-4 w-full">
                            <p className="text-black text-lg font-bold w-1/2">
                              UHID
                            </p>
                            <p className="text-black text-lg font-semibol w-1/2">
                              {profpat.uhid || "Not found"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full flex flex-col gap-4">
                        <p className="text-black text-lg font-bold">
                          ID PROOFS:
                        </p>
                        <div
                          className={`w-full flex  gap-4 ${
                            width < 700 ? "flex-col" : "flex-row"
                          }`}
                        >
                          <div
                            className={`flex flex-col justify-start items-center gap-2 ${
                              width < 700 ? "w-full" : "w-1/2"
                            }`}
                          >
                            <div className="flex flex-row gap-4 w-full items-center">
                              <p className="text-black text-lg font-bold w-1/4">
                                PASSPORT
                              </p>

                              {isEditingPassport ? (
                                <div className="flex w-3/4 gap-2 items-center">
                                  <input
                                    className="border flex-1 bg-gray-100 text-black p-1 rounded-md text-sm"
                                    value={temppassport}
                                    onChange={(e) =>
                                      setTemppassport(e.target.value)
                                    }
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={handleSavePassport}
                                      className="text-green-600 text-xs cursor-pointer"
                                    >
                                      <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={handleCancelPassport}
                                      className="text-red-600 text-xs cursor-pointer"
                                    >
                                      <XMarkIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex w-1/2 justify-between items-center">
                                  <p className="text-black text-lg font-medium break-words w-full">
                                    {formatMaskedID(
                                      profpat?.idproof?.PASSPORT
                                    ) ||
                                      passportvalue ||
                                      "Not found"}
                                  </p>
                                  <button
                                    onClick={handleEditPassport}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className={`flex flex-row justify-start items-center gap-4 ${
                              width < 700 ? "w-full" : "w-1/2"
                            }`}
                          >
                            <div className="flex flex-row gap-4 w-full">
                              <p className="text-black text-lg font-bold w-1/2">
                                PAN
                              </p>
                              {isEditingPan ? (
                                <div className="flex w-3/4 gap-2 items-center">
                                  <input
                                    className="border flex-1 bg-gray-100 text-black p-1 rounded-md text-sm"
                                    value={temppan}
                                    onChange={(e) => setTemppan(e.target.value)}
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={handleSavePan}
                                      className="text-green-600 text-xs cursor-pointer"
                                    >
                                      <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={handleCancelPan}
                                      className="text-red-600 text-xs cursor-pointer"
                                    >
                                      <XMarkIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex w-1/2 justify-between items-center">
                                  <p className="text-black text-lg font-medium break-words w-full">
                                    {formatMaskedID(profpat?.idproof?.PAN) ||
                                      panvalue ||
                                      "Not found"}
                                  </p>
                                  <button
                                    onClick={handleEditPan}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`w-full flex  gap-4 ${
                            width < 700 ? "flex-col" : "flex-row"
                          }`}
                        >
                          <div
                            className={`flex flex-col justify-start items-center gap-2 ${
                              width < 700 ? "w-full" : "w-1/2"
                            }`}
                          >
                            <div className="flex flex-row gap-4 w-full items-center">
                              <p className="text-black text-lg font-bold w-1/4">
                                AADHAAR
                              </p>
                              {isEditingAadhaar ? (
                                <div className="flex w-3/4 gap-2 items-center">
                                  <input
                                    className="border flex-1 bg-gray-100 text-black p-1 rounded-md text-sm"
                                    value={tempaadhaar}
                                    onChange={(e) =>
                                      setTempaadhaar(e.target.value)
                                    }
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={handleSaveAadhaar}
                                      className="text-green-600 text-xs cursor-pointer"
                                    >
                                      <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={handleCancelAadhaar}
                                      className="text-red-600 text-xs cursor-pointer"
                                    >
                                      <XMarkIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex w-1/2 justify-between items-center">
                                  <p className="text-black text-lg font-medium break-words w-full">
                                    {formatMaskedID(
                                      profpat?.idproof?.AADHAAR
                                    ) ||
                                      abhavalue ||
                                      "Not found"}
                                  </p>
                                  <button
                                    onClick={handleEditAadhaar}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className={`flex flex-row justify-start items-center gap-4 ${
                              width < 700 ? "w-full" : "w-1/2"
                            }`}
                          >
                            <div className="flex flex-row gap-4 w-full">
                              <p className="text-black text-lg font-bold w-1/2">
                                ABHA
                              </p>
                              {isEditingABHA ? (
                                <div className="flex w-3/4 gap-2 items-center">
                                  <input
                                    className="border flex-1 bg-gray-100 text-black p-1 rounded-md text-sm"
                                    value={tempabha}
                                    onChange={(e) =>
                                      setTempabha(e.target.value)
                                    }
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={handleSaveABHA}
                                      className="text-green-600 text-xs cursor-pointer"
                                    >
                                      <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={handleCancelABHA}
                                      className="text-red-600 text-xs cursor-pointer"
                                    >
                                      <XMarkIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex w-1/2 justify-between items-center">
                                  <p className="text-black text-lg font-medium break-words w-full">
                                    {formatMaskedID(profpat?.idproof?.ABHA) ||
                                      abhavalue ||
                                      "Not found"}
                                  </p>
                                  <button
                                    onClick={handleEditABHA}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-full flex  gap-4 ${
                          width < 700 ? "flex-col" : "flex-row"
                        }`}
                      >
                        <div
                          className={`flex flex-col justify-start items-center gap-2 ${
                            width < 700 ? "w-full" : "w-2/5"
                          }`}
                        >
                          <div className="flex flex-row gap-4 w-full">
                            <p className="text-black text-lg font-bold w-1/2">
                              HEIGHT
                            </p>
                            <p className="text-black text-lg font-semibol w-1/2">
                              {profpat.height || "Not found"}
                            </p>
                          </div>
                        </div>

                        <div
                          className={` flex flex-col justify-start items-center gap-2 ${
                            width < 700 ? "w-full" : "w-2/5"
                          }`}
                        >
                          <div className="flex flex-row gap-4 w-full">
                            <p className="text-black text-lg font-bold w-1/2">
                              WEIGHT
                            </p>
                            <p className="text-black text-lg font-semibol w-1/2">
                              {profpat.weight || "Not found"}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex flex-col justify-start items-center gap-2 ${
                            width < 700 ? "w-full" : "w-1/5"
                          }`}
                        >
                          <div className="flex flex-row gap-4 w-full">
                            <p className="text-black text-lg font-bold w-1/2">
                              BMI
                            </p>
                            <p className="text-black text-lg font-semibol w-1/2">
                              {profpat.bmi || "Not found"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="w-full flex flex-row justify-center items-center">
                        <div className="w-1/2 flex flex-row justify-start items-center">
                          <p
                            className="font-semibold italic text-[#475467] text-lg cursor-pointer"
                            onClick={clearAllFields}
                          >
                            CLEAR ALL
                          </p>
                        </div>
                        <div className="w-1/2 flex flex-row justify-end items-center">
                          <p
                            className=" rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-lg font-semibold border-[#005585] border-2"
                            style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                            onClick={!isSubmitting ? handleSendremainder : undefined}
                          >
                            {isSubmitting ? "CREATING..." : "CREATE"}
                          </p>
                        </div>
                      </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
            {alertMessage}
          </div>
        </div>
      )}

      <Patientremainder
        isOpenrem={isOpenrem}
        onCloserem={() => setIsOpenrem(false)}
        patient={selectedPatient}
        selectedLeg={selectedLeg}
      />
    </>
  );
};

export default page;
