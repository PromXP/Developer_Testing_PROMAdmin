"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "../context/WebSocketContext";
import axios from "axios";
import Image from "next/image";

import { API_URL } from "../libs/global";

import { Poppins } from "next/font/google";

import ProfileImage from "@/app/assets/profile.png";
import { UserIcon } from "@heroicons/react/24/outline";
import {
  ChevronRightIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MinusCircleIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";

import Minus from "@/app/assets/minus.png";
import Delete from "@/app/assets/delete.png";

import Patientimg from "@/app/assets/patimg.png";
import Closeicon from "@/app/assets/closeicon.png";
import Search from "@/app/assets/search.png";
import Calendar from "@/app/assets/calendar.png";
import Bigcalendar from "@/app/assets/bigcalender.png";
import Clock from "@/app/assets/clock.png";
import Manavatar from "@/app/assets/man.png";
import Womanavatar from "@/app/assets/woman.png";

import "@/app/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const page = ({ isOpen, onClose, patient1, doctor }) => {
  // const parsedUser = JSON.parse(patient);

  const useWindowSize = () => {
    const [size, setSize] = useState({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      const updateSize = () => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      updateSize(); // set initial size
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }, []);

    return size;
  };

  const { width, height } = useWindowSize();
  // console.log("Screen Width:", width, "Screen Height:", height);

  // console.log("Patient" + patient1?.uhid + " " + patient1?.password);

  if (typeof window !== "undefined") {
    sessionStorage.setItem("uhid", patient1.uhid);
    sessionStorage.setItem("password", patient1.password);
  }

  const [patient, setuserdata] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = sessionStorage.getItem("uhid");
      const pass = sessionStorage.getItem("password");
      // console.log("user from localStorage1 :", uid + " " + pass);

      if (uid && pass) {
        console.log("user from localStorage 2:", uid + " " + pass);

        // Attempt to log in again using the stored credentials
        const loginWithStoredUser = async () => {
          try {
            const response = await axios.post(API_URL + "login", {
              identifier: uid,
              password: pass,
              role: "patient", // Assuming role is stored and needed
            });

            setuserdata(response.data.user); // Store the full response data (e.g., tokens)
            // console.log("API Response:", response.data.user);
          } catch (error) {
            console.error("Login failed with stored credentials", error);
          }
        };

        // Call login function
        loginWithStoredUser();
      }
    }
  }, []);

  // console.log("Surgery date " + patient?.surgery_scheduled?.date);

  const periodPriority = ["pre-op", "6w", "3m", "6m", "1y", "2y"];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qisSubmitting, qsetIsSubmitting] = useState(false);
  const [sisSubmitting, ssetIsSubmitting] = useState(false);

  const [leftChecked, setLeftChecked] = useState(false);
  const [rightChecked, setRightChecked] = useState(false);
  const [surgleftChecked, setsurgLeftChecked] = useState(false);
  const [surgrightChecked, setsurgRightChecked] = useState(false);

  const getLatestPeriod = (questionnaires = []) => {
    let latest = null;
    let maxIndex = -1;

    for (const q of questionnaires) {
      const period = q.period?.toLowerCase(); // Normalize casing
      const index = periodPriority.indexOf(period);
      if (index > maxIndex) {
        maxIndex = index;
        latest = q.period; // Return original casing if needed
      }
    }

    return latest || "Not Available";
  };

  // Usage:
  const latestPeriod = getLatestPeriod(patient?.questionnaire_assigned);
  // console.log("Latest period:", patient?.questionnaire_assigned);

  const [opendrop, setOpendrop] = useState(false);
  const [selectedOptiondrop, setSelectedOptiondrop] = useState("Period");

  const optionsdrop = ["Pre Op", "6W", "3M", "6M", "1Y", "2Y"];

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split("T")[0];
  });
  const dateInputRef = useRef(null);

  const handleSelectdrop = (option) => {
    setSelectedOptiondrop(option);
    setOpendrop(false);
  };

  const openDatePicker = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    if (dateValue) {
      // const formattedDate = new Date(dateValue).toLocaleDateString("en-GB", {
      //   day: "2-digit",
      //   month: "short",
      //   year: "numeric",
      // });
      setSelectedDate(dateValue);
    }
  };

  const [selectedItems, setSelectedItems] = useState([]);
  const allItems = [
    "Oxford Knee Score (OKS)",
    "Short Form - 12 (SF-12)",
    "Knee Society Score (KSS)",
    "Knee Injury and Ostheoarthritis Outcome Score, Joint Replacement (KOOS, JR)",
    "Forgotten Joint Score (FJS)",
  ];

  const handleCheckboxChange = (item) => {
    setSelectedItems(
      (prevSelected) =>
        prevSelected.includes(item)
          ? prevSelected.filter((i) => i !== item) // remove if already selected
          : [...prevSelected, item] // add if not
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(allItems);
  };

  const [selectedOption, setSelectedOption] = useState("Select Period");

  const handleClearAll = () => {
    setSelectedOption("Select Period");
    setSelectedItems([]);
    setSelectedDate(() => {
      const today = new Date();
      today.setDate(today.getDate() + 3);
      return today.toISOString().split("T")[0];
    });
    // setSelectedOptiondrop("Selected Period"); // or whatever the default option is
  };

  const [searchTerm, setSearchTerm] = useState("");

  const [warning, setWarning] = useState("");
  const questionnaire_assigned_left =
    patient?.questionnaire_assigned_left || [];
  const questionnaire_assigned_right =
    patient?.questionnaire_assigned_right || [];

  const [leftcurrentstatus, setLeftCurrentStatus] = useState("");
  const [rightcurrentstatus, setRightCurrentStatus] = useState("");

  const getCurrentPeriod = (side) => {
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
        ? questionnaire_assigned_left
        : questionnaire_assigned_right;

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

  useEffect(() => {
    const leftPeriod = getCurrentPeriod("left");
    const rightPeriod = getCurrentPeriod("right");

    if (leftPeriod) {
      setLeftCurrentStatus(leftPeriod);
    } else if (patient?.current_status?.includes("Left Leg")) {
      setLeftCurrentStatus("Pre Op");
    }

    if (rightPeriod) {
      setRightCurrentStatus(rightPeriod);
    } else if (patient?.current_status?.includes("Right Leg")) {
      setRightCurrentStatus("Pre Op");
    }
  }, [questionnaire_assigned_left, questionnaire_assigned_right, patient]);

  const getNextPeriod = (side) => {
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
        ? questionnaire_assigned_left
        : questionnaire_assigned_right;

    const groupedByPeriod = optionsdrop.reduce((acc, period) => {
      const assigned = assignedQuestionnaires
        .filter((q) => q.period === period)
        .map((q) => q.name);
      acc[period] = assigned;
      return acc;
    }, {});

    const currentPeriod = optionsdrop.find((period, index) => {
      const assigned = groupedByPeriod[period] || [];
      const allAssigned = allItems.every((item) => assigned.includes(item));

      const nextPeriod = optionsdrop[index + 1];
      const nextAssigned = groupedByPeriod[nextPeriod] || [];
      const nextAllAssigned = allItems.every((item) =>
        nextAssigned.includes(item)
      );

      return allAssigned && !nextAllAssigned;
    });

    const nextPeriod = currentPeriod
      ? optionsdrop[optionsdrop.indexOf(currentPeriod) + 1] || currentPeriod
      : optionsdrop[0];

    return nextPeriod;
  };

  const handleAssign = async () => {
    if (qisSubmitting) {
      showWarning("Please wait, assigning is in progress...");
      return;
    }

    if (!leftChecked && !rightChecked) {
      showWarning("Select Leg");
      return;
    }

    // showWarning(selectedOption);

    const selected = new Date(selectedDate);
    const now = new Date();

    // Remove time component to compare only date
    selected.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // if (selected < now) {
    //   showWarning("Deadline cannot be a past date.");
    //   setTimeout(() => {
    //     setWarning(""); // Clear warning after 2.5 seconds
    //   }, 2500);
    //   return; // prevent submission
    // }

    if (selectedOption === "Select Period") {
      showWarning("Please select a Time Period");
      return;
    }

    if (selectedItems.length === 0) {
      showWarning("Please select at least one questionnaire.");
      return;
    }

    if (!selectedDate) {
      setWarning("Please select a deadline.");
      return;
    }
    // Block any further submission attempts now
    qsetIsSubmitting(true);
    setWarning(""); // Clear any existing warning

    try {
      if (leftChecked) {
        const payloadLeft = {
          uhid: patient?.uhid,
          questionnaire_assigned_left: selectedItems.map((item) => ({
            name: item,
            period: selectedOption,
            assigned_date: new Date().toISOString(),
            deadline: new Date(selectedDate).toISOString(),
            completed: 0,
          })),
        };

        const responseLeft = await fetch(API_URL + "add-questionnaire-left", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payloadLeft),
        });

        const resultLeft = await responseLeft.json();

        if (!responseLeft.ok) {
          // console.error("Left API Error:", resultLeft);
          qsetIsSubmitting(false);
          showWarning("Something went wrong with Left leg. Please try again.");
          return;
        }

        if (
          resultLeft.message === "No new questionnaire(s) to add" ||
          resultLeft.message === "No changes made"
        ) {
          showWarning(
            "Left Leg questionnaires are already added for selected Period"
          );
          qsetIsSubmitting(false);

          return;
        }

        // console.log("Successfully assigned for Left leg:", resultLeft);
      }

      if (rightChecked) {
        const payloadRight = {
          uhid: patient?.uhid,
          questionnaire_assigned_right: selectedItems.map((item) => ({
            name: item,
            period: selectedOption,
            assigned_date: new Date().toISOString(),
            deadline: new Date(selectedDate).toISOString(),
            completed: 0,
          })),
        };

        const responseRight = await fetch(API_URL + "add-questionnaire-right", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payloadRight),
        });

        const resultRight = await responseRight.json();

        if (!responseRight.ok) {
          // console.error("Right API Error:", resultRight);
          showWarning("Something went wrong with Right leg. Please try again.");
          qsetIsSubmitting(false);

          return;
        }

        if (
          resultRight.message === "No new questionnaire(s) to add" ||
          resultRight.message === "No changes made"
        ) {
          showWarning(
            "Right Leg questionnaires are already added for selected Period"
          );
          qsetIsSubmitting(false);

          return;
        }

        // console.log("Successfully assigned for Right leg:", resultRight);
      }

      // After both succeed
      handleSendremainder();
      // sendwhatsapp();
      setSelectedItems([]);
      setSelectedOptiondrop("Selected Period");
      setSelectedOption("Select Period");
      setSelectedDate("");
      showWarning("Questionnaires successfully assigned!");
      setTimeout(() => setWarning(""), 3000);
    } catch (err) {
      console.error("Network error:", err);
      showWarning("Network error. Please try again.");
      qsetIsSubmitting(false);
    }
  };

  const socket = useWebSocket();

  const handleSendremainder = async () => {
    if (!patient?.email) {
      showWarning("Patient email is missing.");
      return;
    }

    try {
      const res = await fetch(API_URL + "send/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: patient?.email,
          subject: "New Questionnaire Assigned",
          message: "Questionnaire Assigned",
        }),
      });

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "Invalid JSON response", raw: text };
      }

      // console.log("Email send response:", data);
      sendwhatsapp();

      if (!res.ok) {
        showWarning("Failed to send email.");
        // alert("Failed to send email.");
        qsetIsSubmitting(false);

        return;
      }

      // alert("✅ Email sent (check console for details)");
      showWarning("✅ Email sent Successfull");
      // sendRealTimeMessage();
    } catch (error) {
      console.error("❌ Error sending email:", error);
      showWarning("Failed to send email.");
    } finally {
      qsetIsSubmitting(false);
      window.location.reload();
    }
  };

  const sendRealTimeMessage = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("⚠️ WebSocket is not open. Cannot send message.");
      qsetIsSubmitting(true);
      return;
    }

    const payload = {
      uhid: patient?.uhid,
      email: patient?.email,
      phone_number: patient?.phone_number || "N/A",
      message: `Questionaire Assigned`,
    };

    socket.send(JSON.stringify(payload));
    window.location.reload();
    console.log("📤 Sent via WebSocket:", payload);
    // sendwhatsapp();

    qsetIsSubmitting(true);
    window.location.reload();
  };

  const sendwhatsapp = async () => {
    console.log(
      "Whatsapp contact",
      JSON.stringify({
        user_name: patient?.first_name + " " + patient?.last_name,
        phone_number: "+91" + patient?.phone_number,
        message: "",
        flag: 1,
      })
    );

    // return;

    const res = await fetch(API_URL + "send-whatsapp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: patient?.first_name + " " + patient?.last_name,
        phone_number: "+91" + patient?.phone_number,
        message: "",
        flag: 1,
      }),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
      qsetIsSubmitting(true);
    } catch {
      data = { error: "Invalid JSON response", raw: text };
    }
    qsetIsSubmitting(false);
    window.location.reload();
  };

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // console.log("Retrieved user from localStorage:", parsedUser);
      setUserData(parsedUser);
    }
  }, []);

  const [searchTermdoc, setSearchTermdoc] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleCheckboxChangedoc = (item) => {
    setSelectedDoctor(item);
  };

  const handleClearAlldoc = () => {
    setSelectedDoctor("");
  };

  const showWarning = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const handleAssigndoc = async () => {
    if (isSubmitting) {
      showWarning("Please wait Assigning on progress...");
      return; // Prevent double submission
    }

    if (!selectedDoctor) {
      // setShowAlert(true);
      showWarning("Please select a doctor.");
      // setTimeout(() => setShowAlert(false), 2500);
      return;
    }

    const doctorName = selectedDoctor.split(" - ")[1]; // Extract doctor name
    const patientUhid = patient?.uhid; // Selected patient value

    if (!patientUhid) {
      console.error("No patient selected for assignment.");
      return;
    }

    const payload = {
      uhid: patient?.uhid,
      doctor_assigned: doctorName,
    };
    // console.log("Doctor assign " + payload);

    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL + "update-doctor", {
        method: "PUT", // or "PUT" depending on your backend
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      // console.log("Doctor assigned successfully:", result);

      window.location.reload();

      // Show an alert box indicating that the UI will update soon
      showWarning("Doctor assigned. The changes will reflect soon.");

      // Optionally refresh the data or trigger a UI update
    } catch (error) {
      // console.error("Error assigning doctor:", error);
      showWarning("Error assigning doctor, please try again.");
    } finally {
      isSubmitting(false);
    }
  };

  const [selectedDatesurgery, setSelectedDateSurgery] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleManualDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits

    // Format as dd-mm-yyyy
    if (value.length >= 3 && value.length <= 4) {
      value = value.slice(0, 2) + "-" + value.slice(2);
    } else if (value.length > 4 && value.length <= 8) {
      value =
        value.slice(0, 2) + "-" + value.slice(2, 4) + "-" + value.slice(4);
    } else if (value.length > 8) {
      value = value.slice(0, 8);
      value =
        value.slice(0, 2) + "-" + value.slice(2, 4) + "-" + value.slice(4);
    }

    setSelectedDateSurgery(value); // your state for date

    if (value.length === 10) {
      const [dayStr, monthStr, yearStr] = value.split("-");
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);

      if (
        isNaN(day) ||
        isNaN(month) ||
        isNaN(year) ||
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12
      ) {
        showWarning("Invalid date format.");
        setSelectedDateSurgery("");
        return;
      }

      const dateObj = new Date(`${year}-${month}-${day}`);
      if (
        dateObj.getDate() !== day ||
        dateObj.getMonth() + 1 !== month ||
        dateObj.getFullYear() !== year
      ) {
        showWarning("Invalid date. Please enter a real date.");
        setSelectedDateSurgery("");
        return;
      }

      // Optional: format it consistently if you want (or keep raw)
      const formattedDate = `${dayStr.padStart(2, "0")}-${monthStr.padStart(2, "0")}-${yearStr}`;
      setSelectedDateSurgery(formattedDate);
    }
  };

  const handleManualTimeChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, ""); // Only digits

    if (value.length >= 3 && value.length <= 4) {
      value = value.slice(0, 2) + ":" + value.slice(2);
    } else if (value.length > 4) {
      value = value.slice(0, 4);
      value = value.slice(0, 2) + ":" + value.slice(2);
    }

    setSelectedTime(value);

    if (value.length === 5) {
      const [hourStr, minuteStr] = value.split(":");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (
        isNaN(hour) ||
        isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        showWarning("Please enter a valid 24-hour time (HH:MM).");
        setSelectedTime("");
      }
    }
  };

  // Refs for hidden inputs
  const dateInputRefsurgery = useRef(null);
  const timeInputRef = useRef(null);

  const handleCalendarClick = () => {
    dateInputRefsurgery.current?.showPicker(); // First open date
  };

  const handleClockClick = () => {
    timeInputRef.current?.showPicker(); // First open date
  };

  const handleDateChangesurgery = (e) => {
    const selectedDate = e.target.value;

    if (!selectedDate) return;

    const today = new Date();
    const selected = new Date(selectedDate);

    // Set time to 00:00:00 to compare only the date part
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      showWarning("Please select a valid future or current date.");
      return;
    }

    setSelectedDateSurgery(selectedDate);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleClearAllsurgery = () => {
    setSelectedDateSurgery("");
    setSelectedTime("");
  };

  const handleAssignsurgery = async () => {
    if (sisSubmitting) {
      showWarning("Please wait Assigning on progress...");
      return; // Prevent double submission
    }

    if (!selectedDatesurgery || !selectedTime) {
      showWarning("Please select both date and time.");
      return;
    }

    const selectedDateTime = new Date(`${selectedDatesurgery}T${selectedTime}`);
    const now = new Date();

    if (selectedDateTime < now) {
      showWarning("Selected date and time cannot be in the past.");
      return;
    }

    if (!patient?.uhid) {
      console.error("No patient selected for surgery scheduling.");
      return;
    }

    if (surgleftChecked) {
      const payload = {
        uhid: patient?.uhid,
        surgery_scheduled_left: {
          date: selectedDatesurgery,
          time: selectedTime,
        },
      };

      ssetIsSubmitting(true);

      try {
        const response = await fetch(API_URL + "update-surgery-schedule-left", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        // console.log("Surgery scheduled successfully:", result);
        showWarning("Surgery scheduled successfully");
        window.location.reload();
        // Optionally reset form or show success feedback
      } catch (error) {
        console.error("Error scheduling surgery:", error);
      } finally {
        ssetIsSubmitting(true);
      }
    }

    if (surgrightChecked) {
      const payload = {
        uhid: patient?.uhid,
        surgery_scheduled_right: {
          date: selectedDatesurgery,
          time: selectedTime,
        },
      };

      ssetIsSubmitting(true);

      try {
        const response = await fetch(
          API_URL + "update-surgery-schedule-right",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        // console.log("Surgery scheduled successfully:", result);
        // window.location.reload();
        // Optionally reset form or show success feedback
      } catch (error) {
        console.error("Error scheduling surgery:", error);
      } finally {
        ssetIsSubmitting(true);
      }

      window.location.reload();
    }
  };

  const columns = ["SCORE", "Pre Op", "6W", "3M", "6M", "1Y", "2Y"];
  const periodMap = {
    PreOP: "Preop",
    "Pre Op": "Preop",
    "pre op": "Preop",
    "6W": "6W",
    "3M": "3M",
    "6M": "6M",
    "1Y": "1Y",
    "2Y": "2Y",
  };

  const [selectedLeg, setSelectedLeg] = useState("left");

  let leftlegdata = [];
  let rightlegdata = [];

  if (
    patient?.questionnaire_scores_left ||
    patient?.questionnaire_assigned_left
  ) {
    const scoreMap = {};

    // STEP 1: Add scores
    patient?.questionnaire_scores_left?.forEach((entry) => {
      const name = entry.name;
      const period = periodMap[entry.period] || entry.period;
      const score = entry.score[0];
      const others = entry.others || [];

      if (!scoreMap[name]) scoreMap[name] = {};
      scoreMap[name][period] = { score, others };
    });

    // STEP 2: Add assigned if not already scored
    patient?.questionnaire_assigned_left?.forEach((entry) => {
      const name = entry.name;
      const period = periodMap[entry.period] || entry.period;
      const isCompleted = entry.completed === 1;

      if (!scoreMap[name]) scoreMap[name] = {};
      if (scoreMap[name][period] === undefined) {
        scoreMap[name][period] = {
          score: isCompleted ? "" : "N/A",
          others: [],
        };
      }
    });

    // STEP 3: Format data
    leftlegdata = Object.entries(scoreMap).map(([name, valuesObj]) => {
      const values = columns.slice(1).map((period) => {
        const key = period === "Pre Op" ? "Preop" : period;
        const entry = valuesObj[key];
        return entry?.score ?? "";
      });

      const othersMap = {};
      columns.slice(1).forEach((period) => {
        const key = period === "Pre Op" ? "Preop" : period;
        const entry = valuesObj[key];
        if (entry?.others?.length) {
          othersMap[key] = entry.others;
        }
      });

      return { label: name, values, others: othersMap };
    });

    console.log("Left Leg Combined Data", leftlegdata);
  }

  if (
    patient?.questionnaire_scores_right ||
    patient?.questionnaire_assigned_right
  ) {
    const scoreMap = {};

    // STEP 1: Map scores with others
    patient?.questionnaire_scores_right?.forEach((entry) => {
      const name = entry.name;
      const period = periodMap[entry.period] || entry.period;
      const score = entry.score[0];
      const others = entry.others || [];

      if (!scoreMap[name]) scoreMap[name] = {};
      scoreMap[name][period] = { score, others };
    });

    // STEP 2: Map assigned but not completed
    patient?.questionnaire_assigned_right?.forEach((entry) => {
      const name = entry.name;
      const period = periodMap[entry.period] || entry.period;
      const isCompleted = entry.completed === 1;

      if (!scoreMap[name]) scoreMap[name] = {};
      if (scoreMap[name][period] === undefined) {
        scoreMap[name][period] = {
          score: isCompleted ? "" : "N/A",
          others: [],
        };
      }
    });

    // STEP 3: Format for table rows
    rightlegdata = Object.entries(scoreMap).map(([name, valuesObj]) => {
      const values = columns.slice(1).map((period) => {
        const key = period === "Pre Op" ? "Preop" : period;
        const entry = valuesObj[key];
        return entry?.score ?? "";
      });

      const othersMap = {};
      columns.slice(1).forEach((period) => {
        const key = period === "Pre Op" ? "Preop" : period;
        const entry = valuesObj[key];
        if (entry?.others?.length) {
          othersMap[key] = entry.others;
        }
      });

      return { label: name, values, others: othersMap };
    });

    console.log("Right Leg Combined Data", rightlegdata);
  }

  const scoreRanges = {
    "Oxford Knee Score": [0, 48, false],
    "SHORT FORM 12": [0, 100, false],
    "KOOS, JR.": [0, 28, true], // reverse: 0 good, 28 poor (flip colors)
    "Knee Society Score": [0, 100, false],
    "Forgotten Joint Score": [0, 48, false],
  };

  const getColor = (val, minVal = 0, maxVal = 100, reverse = false) => {
    const number = parseFloat(val);
    if (isNaN(number)) return "#B0C4C7";

    let normalized = Math.min(
      Math.max((number - minVal) / (maxVal - minVal), 0),
      1
    );
    if (reverse) normalized = 1 - normalized; // flip for reverse scale

    const colorStops = [
      { stop: 0, color: [255, 70, 70] }, // Red
      { stop: 0.33, color: [255, 170, 50] }, // Orange
      { stop: 0.66, color: [255, 255, 80] }, // Yellow
      { stop: 1, color: [30, 150, 30] }, // Dark Green
    ];

    let lower = colorStops[0];
    let upper = colorStops[colorStops.length - 1];

    for (let i = 0; i < colorStops.length - 1; i++) {
      if (
        normalized >= colorStops[i].stop &&
        normalized <= colorStops[i + 1].stop
      ) {
        lower = colorStops[i];
        upper = colorStops[i + 1];
        break;
      }
    }

    const progress = (normalized - lower.stop) / (upper.stop - lower.stop);
    const r = Math.round(
      lower.color[0] + (upper.color[0] - lower.color[0]) * progress
    );
    const g = Math.round(
      lower.color[1] + (upper.color[1] - lower.color[1]) * progress
    );
    const b = Math.round(
      lower.color[2] + (upper.color[2] - lower.color[2]) * progress
    );

    return `rgb(${r},${g},${b})`;
  };

  const getTextColor = (rgbString) => {
    const [r, g, b] = rgbString.match(/\d+/g).map(Number);
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    return brightness > 160 ? "#222" : "#fff";
  };

  useEffect(() => {
    if (warning) {
      const timer = setTimeout(() => setWarning(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [warning]);

  const [showPopupques, setShowPopupques] = useState(false);
  const [showPopupdoc, setShowPopupdoc] = useState(false);
  const [showPopupsurg, setShowPopupsurg] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [deletepopupOpen, setdeletePopupOpen] = useState(false);

  const handleMinusClick = (label) => {
    setSelectedLabel(label);
    setPopupOpen(true);
  };
  const handleDeleteClick = (label) => {
    setSelectedLabel(label);
    setdeletePopupOpen(true);
  };

  const handleYesClick = async () => {
    const patientUhid = patient?.uhid; // Selected patient value

    if (!patientUhid) {
      console.error("Kindly Reload and Try Again");
      return;
    }

    // const quest_period = questionnaire_assigned_left

    if (selectedLeg === "left") {
      const filteredQuestionnairesleft = questionnaire_assigned_left.filter(
        (item) => item.period === selectedLabel
      );

      // console.log(filteredQuestionnairesleft);

      // console.log("Reset",questionnaire_assigned_left);

      const payloadLeft = {
        period: selectedLabel,
        questionnaires: filteredQuestionnairesleft.map((item) => item.name),
      };
      console.log("Left leg reset " + JSON.stringify(payloadLeft, null, 2));

      try {
        const response = await fetch(
          API_URL +
            "patients/" +
            patientUhid +
            "/reset-questionnaires-by-period-left",
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
        // console.log("Left Leg questionnaire Reset successfully:", result);

        window.location.reload();

        // Show an alert box indicating that the UI will update soon
        showWarning(
          "Left Leg questionnaire Reset successfully. The changes will reflect soon."
        );

        // Optionally refresh the data or trigger a UI update
      } catch (error) {
        console.error("Error reseting Left leg questionnaire:", error);
        showWarning("Error reseting Left leg questionnaire, please try again.");
      } finally {
      }
    }

    if (selectedLeg === "right") {
      const filteredQuestionnairesright = questionnaire_assigned_right.filter(
        (item) => item.period === selectedLabel
      );

      const payloadRight = {
        period: selectedLabel,
        questionnaires: filteredQuestionnairesright.map((item) => item.name),
      };
      try {
        const response = await fetch(
          API_URL +
            "patients/" +
            patientUhid +
            "/reset-questionnaires-by-period-right",
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
        // console.log("Right Leg questionnaire Reset successfully:", result);

        window.location.reload();

        // Show an alert box indicating that the UI will update soon
        showWarning(
          "Right Leg questionnaire Reset successfully. The changes will reflect soon."
        );

        // Optionally refresh the data or trigger a UI update
      } catch (error) {
        // console.error("Error reseting Right leg questionnaire:", error);
        showWarning(
          "Error reseting Right leg questionnaire, please try again."
        );
      } finally {
      }
    }

    console.log(`Resetting questionnaire for: ${selectedLabel}`);
    // Do your reset logic here...

    // Close popup after action
    setPopupOpen(false);
  };

  const handleYesDeleteClick = async () => {
    const patientUhid = patient?.uhid; // Selected patient value

    if (!patientUhid) {
      showWarning("Patient ID Not found. Kindly Reload");
      return;
    }

    // const quest_period = questionnaire_assigned_left

    if (selectedLeg === "left") {
      const filteredQuestionnairesleft = questionnaire_assigned_left.filter(
        (item) => item.period === selectedLabel
      );
      const payloadLeft = {
        period: selectedLabel,
        questionnaires: filteredQuestionnairesleft.map((item) => item.name),
      };
      console.log("Left leg reset " + JSON.stringify(payloadLeft, null, 2));
      try {
        const response = await fetch(
          API_URL +
            "patients/" +
            patientUhid +
            "/delete-questionnaires-by-period-left",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payloadLeft), // DELETE with a body is allowed, but some servers may reject it
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        window.location.reload();

        showWarning(
          "Left Leg questionnaires deleted successfully. The changes will reflect soon."
        );
      } catch (error) {
        console.error("Error deleting Left leg questionnaires:", error);
        showWarning(
          "Error deleting Left leg questionnaires, please try again."
        );
      }
    }

    if (selectedLeg === "right") {
      const filteredQuestionnairesright = questionnaire_assigned_right.filter(
        (item) => item.period === selectedLabel
      );

      // console.log(filteredQuestionnairesleft);

      // console.log("Reset",questionnaire_assigned_left);

      const payloadRight = {
        period: selectedLabel,
        questionnaires: filteredQuestionnairesright.map((item) => item.name),
      };
      console.log("Right leg reset " + JSON.stringify(payloadRight, null, 2));
      try {
        const response = await fetch(
          API_URL +
            "patients/" +
            patientUhid +
            "/delete-questionnaires-by-period-right",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payloadRight), // DELETE with a body is allowed, but some servers may reject it
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        window.location.reload();

        showWarning(
          "Right Leg questionnaires deleted successfully. The changes will reflect soon."
        );
      } catch (error) {
        console.error("Error deleting Right leg questionnaires:", error);
        showWarning(
          "Error deleting Right leg questionnaires, please try again."
        );
      }
    }
  };

  const getCompletionPercentage = (leg) => {
    const data =
      leg === "left"
        ? patient?.questionnaire_assigned_left
        : patient?.questionnaire_assigned_right;
    if (!data || data.length === 0) return 0;

    const total = data.length;
    const completed = data.filter((q) => q.completed === 1).length;
    return Math.round((completed / total) * 100);
  };

  const getComplianceColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const [hoveredNotes, setHoveredNotes] = React.useState(null); // null or array of strings

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

  const [profileImages, setProfileImages] = useState("");

  useEffect(() => {
    const fetchPatientImage = async () => {
      try {
        const uhid = sessionStorage.getItem("uhid");
        const res = await fetch(
          `${API_URL}get-profile-photo/${encodeURIComponent(uhid)}`
        );

        if (!res.ok) throw new Error("Failed to fetch profile photos");
        const data = await res.json();

        setProfileImages(data.profile_image_url);
      } catch (err) {
        console.error("Error fetching profile images:", err);
      }
    };

    fetchPatientImage();
  }, []); // empty dependency: fetch once on mount

  if (!isOpen) return null;

  return (
    <>
      {patient ? (
        <div
          className={`
          h-full w-full flex flex-col items-center
          ${width < 950 ? "gap-4 justify-center" : "justify-center"}
        `}
        >
          <div
            className={`w-full bg-white rounded-2xl px-4  overflow-y-auto overflow-x-hidden h-full ${
              width < 1095 ? "flex flex-col gap-4" : ""
            }`}
          >
            <div
              className={`w-full bg-white  ${width < 760 ? "h-fit" : "h-[15%]"} `}
            >
              <div
                className={`w-full rounded-lg flex ${
                  width < 760 ? "py-0" : "py-2"
                }`}
              >
                <div className={`relative w-full`}>
                  {/* <div className="absolute top-0 right-0">
                    <Image
                      className={`cursor-pointer ${
                        width < 530 ? "w-4 h-4" : "w-4 h-4"
                      }`}
                      src={Closeicon}
                      alt="close"
                      onClick={() => {
                        onClose();
                        handleClearAll();
                        handleClearAlldoc();
                        handleClearAllsurgery();
                      }}
                    />
                  </div> */}
                  <div
                    className={`flex gap-4  flex-col justify-center items-center ${
                      width < 760 ? "" : "py-0"
                    }`}
                  >
                    <div
                      className={`w-full flex gap-4 justify-center items-center ${
                        width < 530
                          ? "flex-col justify-center items-center"
                          : "flex-row"
                      }`}
                    >
                      <Image
                        src={
                          profileImages ||
                          (patient.gender === "male" ? Manavatar : Womanavatar)
                        }
                        alt={patient.uhid}
                        width={40} // or your desired width
                        height={40} // or your desired height
                        className={`rounded-full cursor-pointer ${
                          width < 530
                            ? "w-11 h-11 flex justify-center items-center"
                            : "w-10 h-10"
                        }`}
                      />

                      <div
                        className={`w-full flex items-center ${
                          width < 760
                            ? "flex-col gap-2 justify-center"
                            : "flex-row"
                        }`}
                      >
                        <div
                          className={`flex  flex-col gap-3 ${
                            width < 760 ? "w-full" : "w-2/5"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-2 flex-row ${
                              width < 530 ? "justify-center" : ""
                            }`}
                          >
                            <p
                              className={`text-[#475467] font-poppins font-semibold text-base ${
                                width < 530 ? "text-start" : ""
                              }`}
                            >
                              Patient Name |
                            </p>
                            <p
                              className={`text-black font-poppins font-bold text-base ${
                                width < 530 ? "text-start" : ""
                              }`}
                            >
                              {patient?.first_name + " " + patient?.last_name}
                            </p>
                          </div>
                          <div
                            className={`flex flex-row  ${
                              width < 710 && width >= 530
                                ? "w-full justify-between"
                                : ""
                            }`}
                          >
                            <p
                              className={`font-poppins font-semibold text-sm text-[#475467] ${
                                width < 530 ? "text-center" : "text-start"
                              }
                          w-1/2`}
                            >
                              {getAge(patient?.dob)}, {patient?.gender}
                            </p>
                            <div
                              className={`text-sm font-normal font-poppins text-[#475467] w-1/2 ${
                                width < 530 ? "text-center" : ""
                              }`}
                            >
                              UHID {patient?.uhid}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`flex   ${
                            width < 760 ? "w-full" : "w-3/5 justify-center"
                          }
                      ${
                        width < 530
                          ? "flex-col gap-4 justify-center items-center"
                          : "flex-row"
                      }`}
                        >
                          <div
                            className={` flex flex-col gap-3 ${
                              width < 530
                                ? "justify-center items-center w-full"
                                : "w-[20%]"
                            }`}
                          >
                            <p className="text-[#475467] font-semibold text-5">
                              BMI
                            </p>
                            <p className="text-[#04CE00] font-bold text-6">
                              {patient?.bmi}
                            </p>
                          </div>
                          <div
                            className={` flex flex-col gap-3 ${
                              width < 530
                                ? "justify-center items-center w-full"
                                : "w-[40%]"
                            }`}
                          >
                            <p className="text-[#475467] font-semibold text-5">
                              DOCTOR ASSIGNED
                            </p>
                            <p className="text-black font-bold text-6">
                              {patient?.doctor_name
                                ? patient?.doctor_name
                                : "-"}
                            </p>
                          </div>
                          <div
                            className={` flex flex-col gap-3 ${
                              width < 530
                                ? "justify-center items-center w-full"
                                : "w-[30%]"
                            }`}
                          >
                            <p className="text-[#475467] font-semibold text-5">
                              STATUS
                            </p>
                            <p className="text-[#FFB978] font-bold text-6">
                              <>
                                {leftcurrentstatus && (
                                  <>
                                    <span className="text-red-500">L: </span>{" "}
                                    {leftcurrentstatus}
                                  </>
                                )}
                                {leftcurrentstatus && rightcurrentstatus && " "}
                                {rightcurrentstatus && (
                                  <>
                                    <span className="text-red-500">R: </span>{" "}
                                    {rightcurrentstatus}
                                  </>
                                )}
                              </>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-[#005585] h-[1.5px]" />
                  </div>
                </div>
              </div>
            </div>
            {questionnaire_assigned_left.length === 0 &&
              questionnaire_assigned_right.length === 0 && (
                <div
                  className={`w-full  flex  ${
                    width < 1095
                      ? "h-fit flex-col justify-between gap-8"
                      : "h-[45%] flex-row"
                  }`}
                >
                  <div
                    className={` bg-white shadow-lg rounded-2xl px-4 py-2 flex flex-col mr-1 justify-between  ${
                      width < 1095 ? "w-full  gap-2" : "w-2/5 gap-0"
                    }`}
                  >
                    <h2 className="font-bold text-black text-7">
                      ASSIGN QUESTIONNAIRES
                    </h2>

                    <div
                      className={`w-full flex  ${
                        width < 470
                          ? "flex-col justify-center items-center gap-2"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-[65%] flex flex-row  ${
                          width < 470 ? "justify-between" : "gap-4"
                        }`}
                      >
                        <div className="w-[50%] flex flex-row justify-between items-center">
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-2 py-1 text-sm w-full text-black outline-none"
                          />
                          <Image
                            src={Search}
                            alt="search"
                            className="w-3 h-3 "
                          />
                        </div>

                        {/* Dropdown */}
                        <select
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 text-[#475467] bg-white"
                        >
                          <option value="Select Period">Select Period</option>
                          <option value="Pre Op">Pre Op</option>
                          <option value="6W">6 W</option>
                          <option value="3M">3 M</option>
                          <option value="6M">6 M</option>
                          <option value="1Y">1 Y</option>
                          <option value="2Y">2 Y</option>
                        </select>
                      </div>

                      <div
                        className={`flex flex-row items-center gap-2 cursor-pointer ${
                          width < 470
                            ? "w-full justify-center"
                            : "w-[35%] justify-between"
                        }`}
                      >
                        <div className="w-[50%] flex justify-center items-center text-center md:w-1/2  gap-1">
                          <p className="font-medium text-sm text-[#475467]">
                            Selected
                          </p>
                          <p className="font-semibold text-sm text-black">
                            {selectedItems.length}
                          </p>
                        </div>

                        {/* Date Picker */}
                        <div
                          onClick={openDatePicker}
                          className="flex items-center gap-2 w-[50%]"
                        >
                          <p className="font-medium italic text-[#475467] text-sm">
                            {selectedDate
                              ? new Date(
                                  selectedDate + "T00:00:00"
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "DEADLINE"}
                          </p>
                          <div className="relative">
                            <input
                              type="date"
                              ref={dateInputRef}
                              value={selectedDate}
                              // min={new Date().toISOString().split("T")[0]}
                              onChange={handleDateChange}
                              className="absolute opacity-0 pointer-events-none"
                            />
                            <Image
                              src={Calendar}
                              className="w-3 h-3"
                              alt="Calendar"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-full  overflow-y-auto border rounded-md ${
                        width < 1095 ? "h-36" : "h-[65%]"
                      }`}
                    >
                      <div className="flex flex-wrap gap-2 h-full">
                        {allItems
                          .filter((item) =>
                            item
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          )
                          .map((item, index) => (
                            <label
                              key={index}
                              className="flex items-center gap-2 font-medium  px-4 py-1 text-sm text-black cursor-pointer hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item)}
                                onChange={() => handleCheckboxChange(item)}
                                className="accent-[#475467]"
                              />
                              {item}
                            </label>
                          ))}
                      </div>
                    </div>

                    {warning && (
                      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
                          {warning}
                        </div>
                      </div>
                    )}

                    <div className="w-full flex flex-wrap md:flex-row justify-center items-center gap-y-3">
                      <div className="w-1/2 md:w-1/4 flex justify-center md:justify-between items-center">
                        <p
                          className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                          onClick={handleClearAll}
                        >
                          CLEAR ALL
                        </p>
                      </div>
                      <div className="w-1/2 md:w-1/4 flex justify-center md:justify-between items-center">
                        <p
                          className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                          onClick={handleSelectAll}
                        >
                          SELECT ALL
                        </p>
                      </div>
                      <div className="w-1/2 md:w-1/4 flex justify-center items-center gap-4">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={leftChecked}
                            onChange={(e) => setLeftChecked(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-medium text-[#475467]">
                            Left
                          </span>
                        </label>

                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rightChecked}
                            onChange={(e) => setRightChecked(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-medium text-[#475467]">
                            Right
                          </span>
                        </label>
                      </div>

                      <div className="w-1/2 md:w-1/4 flex justify-center md:justify-end items-center">
                        <p
                          className="font-semibold rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-sm border-[#005585] border-2"
                          style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                          onClick={!qisSubmitting ? handleAssign : undefined}
                        >
                          {qisSubmitting ? "ASSIGNING..." : "ASSIGN"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={` bg-white shadow-lg rounded-2xl px-4 py-2 flex flex-col ml-1 mr-1 justify-between ${
                      width < 1095 ? "w-full gap-2" : "w-2/5 gap-0"
                    }`}
                  >
                    {showAlert && (
                      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
                          Please Select Doctor
                        </div>
                      </div>
                    )}
                    <h2 className="font-bold text-black text-7">
                      ASSIGN DOCTOR
                    </h2>
                    <div className="w-full">
                      <div className="w-[40%] flex flex-row justify-between items-center">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTermdoc}
                          onChange={(e) => setSearchTermdoc(e.target.value)}
                          className="px-2 py-1 text-sm w-full text-black outline-none"
                        />
                        <Image src={Search} alt="search" className="w-3 h-3 " />
                      </div>
                    </div>
                    <div
                      className={`w-full overflow-y-auto border rounded-md ${
                        width < 1095 ? "h-36" : "h-[65%]"
                      }`}
                    >
                      <div className="flex flex-wrap gap-2">
                        {doctor
                          .filter((item) =>
                            item
                              .toLowerCase()
                              .includes(searchTermdoc.toLowerCase())
                          )
                          .map((item, index) => {
                            const [name, designation] = item.split(" - ");
                            const isSelected = selectedDoctor === item;

                            return (
                              <label
                                key={index}
                                onClick={() => handleCheckboxChangedoc(item)}
                                className={`flex items-center gap-2 justify-center font-medium px-3 py-1 text-sm text-black cursor-pointer hover:bg-gray-50 flex-shrink-0 max-w-fit ${
                                  isSelected ? "bg-gray-100" : ""
                                }`}
                              >
                                <div className="w-4 h-4 border-2 rounded-full flex items-center justify-center border-[#475467] mt-1">
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-[#005585]" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{name}</span>
                                  <span className="text-xs text-gray-500">
                                    {designation}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                    <div className="w-full flex flex-row justify-center items-center">
                      <div className="w-1/2 flex flex-row justify-start items-center">
                        <p
                          className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                          onClick={handleClearAlldoc}
                        >
                          CLEAR SELECTION
                        </p>
                      </div>
                      <div className="w-1/2 flex flex-row justify-end items-center">
                        <p
                          className="font-semibold rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-sm border-[#005585] border-2"
                          style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                          onClick={!isSubmitting ? handleAssigndoc : undefined}
                        >
                          {isSubmitting ? "ASSIGNING..." : "ASSIGN"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`bg-white shadow-lg rounded-2xl px-4 py-2 flex flex-col ml-1 mr-1 justify-between ${
                      width < 1095 ? "w-full gap-4" : "w-1/5 gap-4"
                    }`}
                  >
                    <h2 className="font-bold text-black text-7 w-full text-center">
                      SURGERY SCHEDULER
                    </h2>
                    <div className="w-full flex justify-center items-center gap-4">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={surgleftChecked}
                          onChange={(e) => setsurgLeftChecked(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm font-medium text-[#475467]">
                          Left
                        </span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={surgrightChecked}
                          onChange={(e) =>
                            setsurgRightChecked(e.target.checked)
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-sm font-medium text-[#475467]">
                          Right
                        </span>
                      </label>
                    </div>
                    <div className="w-full flex flex-col gap-6">
                      <div
                        className={`w-full flex flex-row  ${
                          width < 1095 ? "gap-10" : ""
                        }`}
                      >
                        <div
                          className={`flex flex-col ${
                            width < 1095 ? "w-1/2 items-end" : "w-2/3"
                          }`}
                        >
                          <p className="font-medium text-sm text-[#475467]">
                            DATE
                          </p>
                          <input
                            type="text"
                            placeholder="dd-mm-yyyy"
                            value={selectedDatesurgery}
                            onChange={handleManualDateChange}
                            maxLength={10}
                            className="text-sm italic font-semibold text-[#475467] border border-gray-300 rounded px-2 py-1 w-full "
                          />
                        </div>
                        <div
                          className={`flex flex-col  relative gap-4 ${
                            width < 1095
                              ? "w-1/2 justify-center items-start"
                              : "w-1/3 justify-center items-center"
                          }`}
                        >
                          <Image
                            src={Bigcalendar}
                            alt="clock"
                            className="w-8 h-8 pointer-events-none"
                            // onClick={handleCalendarClick}
                          />
                        </div>
                      </div>
                      <div
                        className={`w-full flex flex-row ${
                          width < 1095 ? "gap-10" : ""
                        }`}
                      >
                        <div
                          className={`flex flex-col ${
                            width < 1095 ? "w-1/2 items-end" : "w-2/3"
                          }`}
                        >
                          <p className="font-medium text-sm text-[#475467]">
                            TIME
                          </p>
                          <input
                            type="text"
                            placeholder="HH:MM (24 hrs)"
                            value={selectedTime}
                            onChange={handleManualTimeChange}
                            className="text-sm italic font-semibold text-[#475467] border border-gray-300 rounded px-2 py-1 w-full"
                            maxLength={5}
                          />
                        </div>
                        <div
                          className={`flex flex-col relative gap-4 ${
                            width < 1095
                              ? "w-1/2 justify-center items-start"
                              : "w-1/3 justify-center items-center"
                          }`}
                        >
                          <Image
                            src={Clock}
                            alt="clock"
                            className="w-8 h-8 pointer-events-none"
                            // onClick={handleClockClick}
                          />
                        </div>
                      </div>
                    </div>

                    {warning && (
                      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
                          {warning}
                        </div>
                      </div>
                    )}
                    <div
                      className={`w-full flex flex-row justify-center items-center ${
                        width < 1095 ? "gap-10" : ""
                      }`}
                    >
                      <div
                        className={`w-1/2 flex flex-row  items-center ${
                          width < 1095 ? "justify-end" : "justify-start"
                        }`}
                      >
                        <p
                          className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                          onClick={handleClearAllsurgery}
                        >
                          CLEAR ALL
                        </p>
                      </div>
                      <div
                        className={`w-1/2 flex flex-row  items-center ${
                          width < 1095 ? "justify-start" : "justify-end"
                        }`}
                      >
                        <p
                          className="font-semibold rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-sm border-[#005585] border-2"
                          style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                          onClick={() => {
                            if (!patient?.doctor_name) {
                              showWarning("Please assign a doctor first");
                              return;
                            }
                            if (!sisSubmitting) {
                              handleAssignsurgery();
                            } else {
                              undefined;
                            }
                          }}
                        >
                          {sisSubmitting ? "SCHEDULING..." : "SCHEDULE"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {(questionnaire_assigned_left.length > 0 ||
              questionnaire_assigned_right.length > 0) && (
              <div
                className={`w-full  flex  ${
                  width < 1095
                    ? "h-fit flex-col justify-between gap-8"
                    : "h-[10%] flex-row justify-center"
                }`}
              >
                <div
                  className={`  px-4 py-2 flex flex-col mx-auto justify-between items-center ${
                    width < 1095 ? "w-full  gap-2" : "w-1/3 gap-0"
                  }`}
                >
                  <button
                    className={`w-2/3 rounded-full p-1 bg-[#005585] cursor-pointer text-white`}
                    onClick={() => setShowPopupques(true)}
                  >
                    ASSIGN QUESTIONNAIRE
                  </button>
                </div>

                <div
                  className={` px-4 py-2 flex flex-col ml-1 mr-1 justify-between items-center ${
                    width < 1095 ? "w-full gap-2" : "w-1/3 gap-0"
                  }`}
                >
                  <button
                    className={`w-2/3 rounded-full p-1 bg-[#005585] cursor-pointer text-white`}
                    onClick={() => setShowPopupdoc(true)}
                  >
                    ASSIGN DOCTOR
                  </button>
                </div>

                <div
                  className={`px-4 py-2 flex flex-col ml-1 mr-1 justify-between items-center ${
                    width < 1095 ? "w-full gap-4" : "w-1/3 gap-4"
                  }`}
                >
                  <button
                    className={`w-2/3 rounded-full p-1 bg-[#005585] cursor-pointer text-white`}
                    onClick={() => setShowPopupsurg(true)}
                  >
                    SURGERY SCHEDULER
                  </button>
                </div>
              </div>
            )}

            <div
              className={`w-full  flex  gap-4 ${
                width < 760
                  ? "h-fit"
                  : questionnaire_assigned_left.length > 0 ||
                      questionnaire_assigned_right.length > 0
                    ? "h-[75%] mt-2"
                    : "h-[45%] mt-2"
              }
            ${
              width < 970 ? "flex-col justify-center items-center" : "flex-col"
            }`}
            >
              <div
                className={`bg-white rounded-2xl px-4 py-4 flex flex-col gap-4 shadow-lg h-[75%] ${
                  width < 970 ? "w-full" : "w-full"
                }`}
              >
                <div
                  className={`w-full flex justify-between items-center ${width < 950 ? " flex-col gap-4" : " flex-row"}`}
                >
                  <p
                    className={`font-bold text-[#005585] tracking-[6px] ${width < 950 ? "w-full text-center" : "w-1/3 "}`}
                  >
                    PATIENT REPORTED OUTCOMES
                  </p>
                  <p
                    className={`text-center text-lg font-semibold ${getComplianceColor(
                      getCompletionPercentage(selectedLeg)
                    )} ${width < 950 ? "w-full" : "w-1/3 "}`}
                  >
                    COMPLIANCE: {getCompletionPercentage(selectedLeg)}%
                  </p>

                  <div
                    className={`flex  gap-2 items-center ${width < 950 ? "w-full justify-center" : "w-1/3 justify-end"}`}
                  >
                    <button
                      onClick={() => setSelectedLeg("left")}
                      disabled={!leftlegdata || leftlegdata.length === 0}
                      className={`px-4 py-[0.5px] rounded-full font-semibold ${
                        !leftlegdata || leftlegdata.length === 0
                          ? "bg-gray-300 text-black opacity-50 cursor-not-allowed"
                          : selectedLeg === "left"
                            ? "bg-[#005585] text-white cursor-pointer"
                            : "bg-gray-300 text-black cursor-pointer"
                      }`}
                    >
                      Left
                    </button>

                    <button
                      onClick={() => setSelectedLeg("right")}
                      disabled={!rightlegdata || rightlegdata.length === 0}
                      className={`px-4 py-[0.5px] rounded-full font-semibold ${
                        !rightlegdata || rightlegdata.length === 0
                          ? "bg-gray-300 text-black opacity-50 cursor-not-allowed"
                          : selectedLeg === "right"
                            ? "bg-[#005585] text-white cursor-pointer"
                            : "bg-gray-300 text-black cursor-pointer"
                      }`}
                    >
                      Right
                    </button>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="min-w-full table-fixed border-separate border-spacing-y-2">
                    <thead className=" text-[#475467] text-[16px] font-medium text-center">
                      <tr>
                        <th
                          colSpan={columns.length}
                          className="text-left text-sm text-black font-semibold pb-2 pr-2"
                        >
                          *N/A – Questionnaire Not Answered
                        </th>
                      </tr>
                      <tr>
                        {columns.map((col, idx) => (
                          <th
                            key={idx}
                            className={`px-4 py-3 bg-[#D9D9D9] text-center whitespace-nowrap ${idx === 0 ? "w-3/5" : ""}`}
                          >
                            {idx === 0 ? (
                              col
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-[#475467]">
                                  <Image
                                    src={Delete}
                                    alt="reset"
                                    className="w-5 h-5 min-w-[20px] min-h-[20px] font-bold cursor-pointer"
                                    onClick={() => handleDeleteClick(col)}
                                  />
                                </span>{" "}
                                <span>{col}</span>
                                <span className="text-[#475467]">
                                  <Image
                                    src={Minus}
                                    alt="reset"
                                    className="w-5 h-5 min-w-[20px] min-h-[20px] font-bold cursor-pointer"
                                    onClick={() => handleMinusClick(col)}
                                  />
                                </span>{" "}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white text-[16px] font-semibold">
                      {(selectedLeg === "left" ? leftlegdata : rightlegdata)
                        .length > 0 ? (
                        (selectedLeg === "left"
                          ? leftlegdata
                          : rightlegdata
                        ).map((row, idx) => {
                          // Check if any value is below the critical threshold
                          const isCritical = row.values.some(
                            (val) => typeof val === "number" && val < 50
                          );

                          console.log("Score Map left", row.others);

                          return (
                            <tr key={idx}>
                              <td
                                className={`px-4 py-2 text-[#1F2937] ${isCritical ? "border-l-4 border-red-500 rounded-sm" : ""}`}
                              >
                                {row.label}
                              </td>
                              {row.values.map((val, vIdx) => {
                                const isEmpty =
                                  val === "" ||
                                  val === null ||
                                  val === undefined;
                                const isNA = val === "N/A";
                                const isNumeric = !isEmpty && !isNA;

                                // Determine the questionnaire name for this column (example: from columns array)
                                const questionnaireName = columns[vIdx];

                                // Get range info or default
                                const [minVal, maxVal, reverse] = scoreRanges[
                                  questionnaireName
                                ] || [0, 100, false];

                                // Get background color based on value and questionnaire range
                                const bgColor = isNumeric
                                  ? getColor(val, minVal, maxVal, reverse)
                                  : "transparent";

                                const periodKey =
                                  columns[vIdx] === "Pre Op"
                                    ? "Preop"
                                    : columns[vIdx];
                                const otherNotes =
                                  row.others?.[periodKey] || [];

                                const filteredNotes = [];
                                for (let i = 0; i < otherNotes.length; i++) {
                                  const currentLine = otherNotes[i];

                                  // If current line contains 'self' (case-insensitive), skip the next line
                                  if (/self/i.test(currentLine)) {
                                    filteredNotes.push(currentLine);
                                    i++; // Skip next line
                                    continue;
                                  }

                                  // If current line contains 'no' (case-insensitive), skip the next line
                                  if (/no/i.test(currentLine)) {
                                    filteredNotes.push(currentLine);
                                    i++; // Skip next line
                                    continue;
                                  }

                                  filteredNotes.push(currentLine);
                                }

                                console.log("📝 Period:", periodKey);
                                console.log(
                                  "📦 Others for cell:",
                                  otherNotes.length
                                );

                                return (
                                  <td
                                    key={vIdx}
                                    className=" px-4 py-3 text-center align-middle"
                                  >
                                    <div className=" relative group  min-w-[36px] min-h-[36px]">
                                      {isEmpty ? (
                                        <span className="text-sm text-black font-medium"></span>
                                      ) : isNA ? (
                                        <span className="text-sm text-black font-medium">
                                          N/A
                                        </span>
                                      ) : (
                                        <div
                                          className="relative inline-flex cursor-pointer items-center justify-center rounded-full shadow-sm"
                                          style={{
                                            backgroundColor: bgColor,
                                            color: "#000",
                                            width: "36px",
                                            height: "36px",
                                            fontWeight: "600",
                                            fontSize: "0.875rem",
                                            margin: "auto",
                                          }}
                                          onMouseEnter={() => {
                                            if (
                                              filteredNotes &&
                                              filteredNotes.length > 0
                                            )
                                              setHoveredNotes(filteredNotes);
                                          }}
                                          onMouseLeave={() =>
                                            setHoveredNotes(null)
                                          }
                                        >
                                          {val}
                                        </div>
                                      )}

                                      {filteredNotes &&
                                        filteredNotes.length > 0 && (
                                          <div
                                            className="absolute -top-[40px] -left-[70px] transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out
    text-sm font-semibold text-black pz-2 py-2.5 rounded-lg bg-white whitespace-pre-wrap z-50"
                                            style={{
                                              maxWidth: "300px",
                                              minWidth: "120px",
                                              boxShadow:
                                                "0 4px 8px rgba(0, 0, 0, 0.1)",
                                            }}
                                          >
                                            {filteredNotes.map((line, i) => (
                                              <p key={i} className="w-full">
                                                {line}
                                              </p>
                                            ))}
                                          </div>
                                        )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="px-4 py-4 text-center text-[#9CA3AF]"
                          >
                            No questionnaires assigned
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {popupOpen && (
                    <div
                      className="fixed inset-0 flex items-center justify-center z-50"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.7)", // white with 50% opacity
                      }}
                    >
                      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md relative">
                        {/* Close Icon */}
                        <button
                          onClick={() => setPopupOpen(false)}
                          className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer"
                        >
                          ❌
                        </button>

                        {/* Popup Content */}
                        <h2 className="text-xl text-black font-bold mb-4 text-center">
                          CONFIRMATION
                        </h2>
                        <p className="text-gray-700 text-center mb-6">
                          Are you sure you want to reset the questionnaires of{" "}
                          <span className="font-bold text-black">
                            {selectedLabel}
                          </span>{" "}
                          period?
                        </p>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={handleYesClick}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setPopupOpen(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {deletepopupOpen && (
                    <div
                      className="fixed inset-0 flex items-center justify-center z-50"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.7)", // white with 50% opacity
                      }}
                    >
                      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md relative">
                        {/* Close Icon */}
                        <button
                          onClick={() => setdeletePopupOpen(false)}
                          className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer"
                        >
                          ❌
                        </button>

                        {/* Popup Content */}
                        <h2 className="text-xl text-black font-bold mb-4 text-center">
                          CONFIRMATION
                        </h2>
                        <p className="text-gray-700 text-center mb-6">
                          Are you sure you want to delete the questionnaires of{" "}
                          <span className="font-bold text-black">
                            {selectedLabel}
                          </span>{" "}
                          period?
                        </p>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={handleYesDeleteClick}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setdeletePopupOpen(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full h-[25%] flex flex-col justify-center space-y-2 p-2">
                {/* Heatmap Bar */}
                <div
                  className="w-full h-3 rounded-full"
                  style={{
                    background:
                      "linear-gradient(to right, red, orange, yellow, green)",
                  }}
                ></div>

                {/* Labels */}
                <div className="w-full flex justify-between text-xs sm:text-sm md:text-base text-gray-700 font-semibold px-1 sm:px-2">
                  <span className="whitespace-nowrap">Severe</span>
                  <span className="whitespace-nowrap">Moderate</span>
                  <span className="whitespace-nowrap">Mild</span>
                  <span className="whitespace-nowrap">Optimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading patient data...</p>
      )}

      {showPopupques && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)", // white with 50% opacity
          }}
        >
          <div
            className={`bg-white p-6 rounded-lg overflow-y-auto overflow-x-hidden  ${width < 1000 ? "w-3/4 h-3/4" : " w-1/2 h-1/2"}`}
          >
            {/* Close Button */}

            <div
              className={` flex flex-col mr-1 justify-between h-full ${
                width < 1095 ? "w-full  gap-2" : "w-full gap-0"
              }`}
            >
              <div className="w-full flex flex-row justify-between h-[5%]">
                <h2 className="font-bold text-black text-7">
                  ASSIGN QUESTIONNAIRES
                </h2>
                <button
                  onClick={() => setShowPopupques(false)}
                  className="text-black cursor-pointer"
                >
                  ✖
                </button>
              </div>

              <div
                className={`w-full flex h-[15%] ${
                  width < 470
                    ? "flex-col justify-center items-center gap-2"
                    : "flex-row"
                }`}
              >
                <div
                  className={`w-[65%] flex flex-row  ${
                    width < 470 ? "justify-between" : "gap-6"
                  }`}
                >
                  <div className="w-[50%] flex flex-row justify-between items-center">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-2 py-1 text-sm w-full text-black outline-none"
                    />
                    <Image src={Search} alt="search" className="w-3 h-3 " />
                  </div>

                  {/* Dropdown */}
                  <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 text-[#475467] bg-white w-[50%]"
                  >
                    <option value="Select Period">Select Period</option>
                    <option value="Pre Op">Pre Op</option>
                    <option value="6W">6 W</option>
                    <option value="3M">3 M</option>
                    <option value="6M">6 M</option>
                    <option value="1Y">1 Y</option>
                    <option value="2Y">2 Y</option>
                  </select>
                </div>

                <div
                  className={`flex flex-row  items-center  cursor-pointer ${
                    width < 470
                      ? "w-full gap-4 justify-center"
                      : "w-[35%] justify-center gap-4"
                  }`}
                  onClick={openDatePicker}
                >
                  <div className="w-[50%] flex justify-center items-center text-center md:w-full  gap-1">
                    <p className="font-medium text-sm text-[#475467]">
                      Selected
                    </p>
                    <p className="font-semibold text-sm text-black">
                      {selectedItems.length}
                    </p>
                  </div>

                  <div
                    onClick={openDatePicker}
                    className="flex items-center gap-2"
                  >
                    <p className="font-medium italic text-[#475467] text-sm">
                      {selectedDate
                        ? new Date(
                            selectedDate + "T00:00:00"
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "DEADLINE"}
                    </p>
                    <div className="relative">
                      <input
                        type="date"
                        ref={dateInputRef}
                        value={selectedDate}
                        // min={new Date().toISOString().split("T")[0]}
                        onChange={handleDateChange}
                        className="absolute opacity-0 pointer-events-none"
                      />
                      <Image
                        src={Calendar}
                        className="w-3 h-3"
                        alt="Calendar"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`w-full  overflow-y-auto border rounded-md h-[65%] ${
                  width < 1095 ? "h-36" : "h-[65%]"
                }`}
              >
                <div className="flex flex-wrap gap-2 h-full">
                  {allItems
                    .filter((item) =>
                      item.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-2 font-medium  px-4 py-1 text-sm text-black cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item)}
                          onChange={() => handleCheckboxChange(item)}
                          className="accent-[#475467]"
                        />
                        {item}
                      </label>
                    ))}
                </div>
              </div>

              {warning && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
                    {warning}
                  </div>
                </div>
              )}

              <div className="w-full flex flex-wrap md:flex-row justify-center items-center gap-y-3 h-[15%]">
                <div className="w-1/2 md:w-1/4 flex justify-center md:justify-between items-center">
                  <p
                    className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                    onClick={handleClearAll}
                  >
                    CLEAR ALL
                  </p>
                </div>
                <div className="w-1/2 md:w-1/4 flex justify-center md:justify-between items-center">
                  <p
                    className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                    onClick={handleSelectAll}
                  >
                    SELECT ALL
                  </p>
                </div>
                <div className="w-1/2 md:w-1/4 flex justify-center items-center gap-4">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={leftChecked}
                      onChange={(e) => setLeftChecked(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium text-[#475467]">
                      Left
                    </span>
                  </label>

                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rightChecked}
                      onChange={(e) => setRightChecked(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium text-[#475467]">
                      Right
                    </span>
                  </label>
                </div>

                <div className="w-1/2 md:w-1/4 flex justify-center md:justify-end items-center">
                  <p
                    className="font-semibold rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-sm border-[#005585] border-2"
                    style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                    onClick={!qisSubmitting ? handleAssign : undefined}
                  >
                    {qisSubmitting ? "ASSIGNING..." : "ASSIGN"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPopupdoc && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)", // white with 50% opacity
          }}
        >
          <div
            className={`bg-white p-6 rounded-lg overflow-y-auto overflow-x-hidden  ${width < 1000 ? "w-3/4 h-3/4" : " w-1/2 h-1/2"}`}
          >
            <div
              className={` flex flex-col ml-1 mr-1 justify-between h-full ${
                width < 1095 ? "w-full gap-2" : "w-full gap-0"
              }`}
            >
              {showAlert && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
                    Please Select Doctor
                  </div>
                </div>
              )}
              <div className="w-full flex flex-row justify-between h-[10%]">
                <h2 className="font-bold text-black text-7">ASSIGN DOCTOR</h2>
                <button
                  onClick={() => setShowPopupdoc(false)}
                  className="text-black cursor-pointer"
                >
                  ✖
                </button>
              </div>

              <div className="w-full h-[10%]">
                <div className="w-[40%] flex flex-row justify-between items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTermdoc}
                    onChange={(e) => setSearchTermdoc(e.target.value)}
                    className="px-2 py-1 text-sm w-full text-black outline-none"
                  />
                  <Image src={Search} alt="search" className="w-3 h-3 " />
                </div>
              </div>

              <div
                className={`w-full overflow-y-auto border rounded-md h-[70%]`}
              >
                <div className="flex flex-wrap gap-2">
                  {doctor
                    .filter((item) =>
                      item.toLowerCase().includes(searchTermdoc.toLowerCase())
                    )
                    .map((item, index) => {
                      const [name, designation] = item.split(" - ");
                      const isSelected = selectedDoctor === item;

                      return (
                        <label
                          key={index}
                          onClick={() => handleCheckboxChangedoc(item)}
                          className={`flex items-center gap-2 justify-center font-medium px-3 py-1 text-sm text-black cursor-pointer hover:bg-gray-50 flex-shrink-0 max-w-fit ${
                            isSelected ? "bg-gray-100" : ""
                          }`}
                        >
                          <div className="w-4 h-4 border-2 rounded-full flex items-center justify-center border-[#475467] mt-1">
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-[#005585]" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold">{name}</span>
                            <span className="text-xs text-gray-500">
                              {designation}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="w-full flex flex-row justify-center items-center h-[10%]">
                <div className="w-1/2 flex flex-row justify-start items-center">
                  <p
                    className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                    onClick={handleClearAlldoc}
                  >
                    CLEAR SELECTION
                  </p>
                </div>
                <div className="w-1/2 flex flex-row justify-end items-center">
                  <p
                    className="font-semibold rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-sm border-[#005585] border-2"
                    style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                    onClick={!isSubmitting ? handleAssigndoc : undefined}
                  >
                    {isSubmitting ? "ASSIGNING..." : "ASSIGN"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPopupsurg && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)", // white with 50% opacity
          }}
        >
          <div
            className={`bg-white p-6 rounded-lg overflow-y-auto overflow-x-hidden  ${width < 1000 ? "w-3/5 h-1/2" : " w-1/3 h-1/2"}`}
          >
            <div
              className={`flex flex-col ml-1 mr-1 justify-between h-full ${
                width < 1095 ? "w-full gap-4" : "w-full gap-4"
              }`}
            >
              <div className="w-full flex flex-row justify-between h-[10%] items-center">
                <h2 className="font-bold text-black text-7">
                  SURGERY SCHEDULER
                </h2>
                <button
                  onClick={() => {
                    setShowPopupsurg(false);
                    setsurgLeftChecked(false);
                    setsurgRightChecked(false);
                  }}
                  className="text-black cursor-pointer"
                >
                  ✖
                </button>
              </div>

              <div className="w-full flex justify-center items-center gap-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={surgleftChecked}
                    onChange={(e) => setsurgLeftChecked(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-[#475467]">
                    Left
                  </span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={surgrightChecked}
                    onChange={(e) => setsurgRightChecked(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-[#475467]">
                    Right
                  </span>
                </label>
              </div>

              <div className="w-full flex flex-col gap-6 h-[80%] justify-center">
                <div
                  className={`w-full flex flex-row  ${
                    width < 1095 ? "gap-10" : ""
                  }`}
                >
                  <div
                    className={`flex flex-col ${
                      width < 1095 ? "w-1/2 items-end" : "w-2/3"
                    }`}
                  >
                    <p className="font-medium text-sm text-[#475467]">DATE</p>
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={selectedDatesurgery}
                      onChange={handleManualDateChange}
                      maxLength={10}
                      className="text-sm italic font-semibold text-[#475467] border border-gray-300 rounded px-2 py-1 w-full "
                    />
                  </div>
                  <div
                    className={`flex flex-col  relative gap-4 ${
                      width < 1095
                        ? "w-1/2 justify-center items-start"
                        : "w-1/3 justify-center items-center"
                    }`}
                  >
                    {/* <input
                      type="date"
                      ref={dateInputRefsurgery}
                      className="absolute opacity-0 pointer-events-none"
                      onChange={handleDateChangesurgery}
                    /> */}
                    <Image
                      src={Bigcalendar}
                      alt="clock"
                      className="w-8 h-8 pointer-events-none"
                      // onClick={handleCalendarClick}
                    />
                  </div>
                </div>
                <div
                  className={`w-full flex flex-row ${
                    width < 1095 ? "gap-10" : ""
                  }`}
                >
                  <div
                    className={`flex flex-col ${
                      width < 1095 ? "w-1/2 items-end" : "w-2/3"
                    }`}
                  >
                    <p className="font-medium text-sm text-[#475467]">TIME</p>
                    <input
                      type="text"
                      placeholder="HH:MM (24 hrs)"
                      value={selectedTime}
                      onChange={handleManualTimeChange}
                      className="text-sm italic font-semibold text-[#475467] border border-gray-300 rounded px-2 py-1 w-full"
                      maxLength={5}
                    />
                  </div>
                  <div
                    className={`flex flex-col relative gap-4 ${
                      width < 1095
                        ? "w-1/2 justify-center items-start"
                        : "w-1/3 justify-center items-center"
                    }`}
                  >
                    {/* <input
                      type="time"
                      ref={timeInputRef}
                      className="absolute opacity-0 pointer-events-none"
                      onChange={handleTimeChange}
                    /> */}

                    <Image
                      src={Clock}
                      alt="clock"
                      className="w-8 h-8 pointer-events-none"
                      // onClick={handleClockClick}
                    />
                  </div>
                </div>
              </div>

              {warning && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
                    {warning}
                  </div>
                </div>
              )}
              <div
                className={`w-full flex flex-row justify-between items-center h-[10%]${
                  width < 1095 ? "gap-10" : ""
                }`}
              >
                <div
                  className={`w-1/2 flex flex-row  items-center ${
                    width < 1095 ? "justify-center" : "justify-start"
                  }`}
                >
                  <p
                    className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                    onClick={handleClearAllsurgery}
                  >
                    CLEAR ALL
                  </p>
                </div>
                <div
                  className={`w-1/2 flex flex-row  items-center ${
                    width < 1095 ? "justify-center" : "justify-end"
                  }`}
                >
                  <p
                    className="font-semibold rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-sm border-[#005585] border-2"
                    style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                    onClick={() => {
                      if (!patient?.doctor_name) {
                        showWarning("Please assign a doctor first");
                        return;
                      }
                      if (!sisSubmitting) {
                        handleAssignsurgery();
                      } else {
                        undefined;
                      }
                    }}
                  >
                    {sisSubmitting ? "SCHEDULING..." : "SCHEDULE"}
                  </p>
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
    </>
  );
};

export default page;
