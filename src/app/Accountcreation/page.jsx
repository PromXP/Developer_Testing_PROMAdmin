"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
} from "@heroicons/react/16/solid";
import Patientimg from "@/app/assets/patimg.png";
import Closeicon from "@/app/assets/closeicon.png";
import Search from "@/app/assets/search.png";
import Calendar from "@/app/assets/calendar.png";
import Bigcalendar from "@/app/assets/bigcalender.png";
import Clock from "@/app/assets/clock.png";
import Smallcalendar from "@/app/assets/smallcalendar.png";
import Male from "@/app/assets/male.png";
import Female from "@/app/assets/female.png";
import Othergender from "@/app/assets/transgender.png";

import "@/app/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const page = ({ isOpenacc, onCloseacc, userData }) => {
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
  const [message, setMessage] = useState("");

  const [showAlert, setShowAlert] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [uhid, setUhid] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [heightbmi, setHeightbmi] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState("");
  const [selectedGender, setSelectedGender] = useState(""); // "female" | "male" | "other"
  const [doctorAssigned, setDoctorAssigned] = useState("");
  const [adminAssigned, setAdminAssigned] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(0);
  const [selectedOptiondrop, setSelectedOptiondrop] = useState("NN");
  const [selectedDate, setSelectedDate] = useState("");

  const dateInputRef = useRef(null);

  const openDatePicker = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    console.log("Raw input value:", dateValue);

    if (dateValue) {
      const selected = new Date(dateValue);
      const today = new Date();

      // Remove time component from today's date
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);

      console.log("Selected Date:", selected.toDateString());
      console.log("Today's Date:", today.toDateString());

      if (selected >= today) {
        console.warn("Invalid birth date selected.");
        showWarning("Birth date cannot be today or a future date.");
        setSelectedDate(null);
        return;
      }

      const formattedDate = selected.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      console.log("Formatted Date:", formattedDate);
      setSelectedDate(formattedDate);
    }
  };

  const handleManualDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove all non-digits

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

    // Until full date entered, show raw value
    setSelectedDate(value);

    if (value.length === 10) {
      const [dayStr, monthStr, yearStr] = value.split("-");
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);

      const today = new Date();
      const currentYear = today.getFullYear();

      // Basic validations
      if (
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        year >= currentYear
      ) {
        showWarning("Please enter a valid date of birth.");
        setSelectedDate("");
        return;
      }

      // Check valid real date
      const manualDate = new Date(`${year}-${month}-${day}`);
      if (
        manualDate.getDate() !== day ||
        manualDate.getMonth() + 1 !== month ||
        manualDate.getFullYear() !== year
      ) {
        showWarning("Invalid date combination. Please enter a correct date.");
        setSelectedDate("");
        return;
      }

      // Check if future or today
      today.setHours(0, 0, 0, 0);
      manualDate.setHours(0, 0, 0, 0);

      if (manualDate >= today) {
        showWarning("Birth date cannot be today or a future date.");
        setSelectedDate("");
        return;
      }

      // If all valid, format as "dd Mmm yyyy"
      const formattedDate = manualDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      setSelectedDate(formattedDate);
    }
  };

  const [opendrop, setOpendrop] = useState(false);

  const optionsdrop = [
    "A+",
    "A−",
    "B+",
    "B−",
    "AB+",
    "AB−",
    "O+",
    "O−",
    "A1+",
    "A1−",
    "A2+",
    "A2−",
    "Bombay (hh)",
    "Rh-null",
    "A3",
    "B3",
    "cisAB",
    "In(Lu)",
    "i (little i)",
    "Vel−",
    "Kell+",
    "Kell−",
    "Duffy (Fy a/b)",
    "Kidd (Jk a/b)",
    "MNS (M, N, S, s, U)",
    "Lutheran (Lu a/b)",
    "Lewis (Le a/b)",
    "P1",
    "Diego",
    "Colton",
    "Yt",
    "Xg",
  ];

  const handleSelectdrop = (option) => {
    setSelectedOptiondrop(option);
    setOpendrop(false);
  };

  const clearAllFields = () => {
    setFirstName("");
    setLastName("");
    setUhid("");
    setSelectedDate("");
    setSelectedGender("");
    setSelectedOptiondrop("NN");
    setPhone("");
    setEmail("");
    setHeightbmi("");
    setWeight("");
    setBmi("");
    setMessage("");
  };

  const [alertMessage, setAlertMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leftChecked, setLeftChecked] = useState(false);
  const [rightChecked, setRightChecked] = useState(false);

  const handleSendremainder = async () => {
    console.log("DOB", selectedDate);

    if (isSubmitting) {
      showWarning("Please wait submission on progress...");
      return; // Prevent double submission
    }

    if (!firstName.trim()) return showWarning("First Name is required.");
    if (!lastName.trim()) return showWarning("Last Name is required.");
    if (!uhid.trim()) return showWarning("UHID is required.");
    if (!selectedDate.trim()) return showWarning("Date of Birth is required.");

    // Calculate age (simple version, assuming DOB format: "YYYY-MM-DD")
    const today = new Date();
    const birthDate = new Date(selectedDate);

    let age = today.getFullYear() - birthDate.getFullYear();

    // Check if the birthday has occurred yet this year
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) {
      age--;
    }

    if (age <= 0) return showWarning("Select Date of Birth Correctly");
    if (!selectedGender.trim()) return showWarning("Gender is required.");
    if (!leftChecked && !rightChecked) return showWarning("Select Leg");
    // if (selectedOptiondrop === "Select")
    //   return showWarning("Blood group must be selected.");
    if (!/^\d{10}$/.test(phone.trim())) {
      return showWarning("Phone number must be exactly 10 digits.");
    }

    if (!email.trim()) return showWarning("Email is required.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return showWarning("Please enter a valid email address.");
    }
    if (!heightbmi.trim()) return showWarning("Height is required.");
    if (!weight.trim()) return showWarning("Weight is required.");

    // Calculate BMI
    const heightInMeters = parseFloat(heightbmi) / 100;
    const bmi = parseFloat(weight) / (heightInMeters * heightInMeters);

    let currentStatus = [];

    if (leftChecked) {
      currentStatus.push("Left Leg");
    }
    if (rightChecked) {
      currentStatus.push("Right Leg");
    }

    const payload = {
      uhid: uhid,
      first_name: firstName,
      last_name: lastName,
      password: "patient@123", // change as needed
      vip: 0,
      dob: selectedDate,
      age: age,
      blood_grp: selectedOptiondrop,
      gender: selectedGender,
      height: parseFloat(heightbmi),
      weight: parseFloat(weight),
      bmi: parseFloat(bmi.toFixed(2)),
      email: email,
      phone_number: phone,
      doctor_assigned: "",
      doctor_name: "", // replace with real data
      admin_assigned: userData?.user?.email, // replace with real data
      admin_name: "",
      questionnaire_assigned_left: [],
      questionnaire_scores_left: [],
      questionnaire_assigned_right: [],
      questionnaire_scores_right: [],
      surgery_scheduled_left: {
        date: "yyyy-mm-dd", // replace with actual selected date
        time: "hh:mm AM", // replace with actual selected time
      },
      surgery_scheduled_right: {
        date: "yyyy-mm-dd", // replace with actual selected date
        time: "hh:mm AM", // replace with actual selected time
      },
      post_surgery_details_left: {
        date_of_surgery: "0001-01-01",
        surgeon: "", // replace accordingly
        surgery_name: "", // if different
        sub_doctor: "",
        procedure: "", // replace
        implant: "", // replace
        technology: "", // replace
      },
      post_surgery_details_right: {
        date_of_surgery: "0001-01-01",
        surgeon: "", // replace accordingly
        surgery_name: "", // if different
        sub_doctor: "",
        procedure: "", // replace
        implant: "", // replace
        technology: "", // replace
      },
      current_status: currentStatus.join(", "),
    };

    console.log("Patient Payload", JSON.stringify(payload, null, 2));

    setIsSubmitting(true); // 🔒 Lock submission

    try {
      const response = await fetch(API_URL + "registerpatient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("Submission successful:", payload);
      if (!response.ok) {
        throw new Error("Failed to send data.");
      }

      const result = await response.json();
      console.log("Submission successful:", result);
      onCloseacc();
      window.location.reload();
      // Optionally, show success message here
    } catch (error) {
      console.error("Error submitting data:", error);
      showWarning(
        "This UHID, email, or phone number is already used for another patient."
      );
    } finally {
      setIsSubmitting(false); // 🔓 Unlock submission
    }
  };

  // Auto calculate BMI whenever height or weight changes
  useEffect(() => {
    const h = parseFloat(heightbmi);
    const w = parseFloat(weight);

    if (h > 0 && w > 0) {
      const bmiVal = w / ((h / 100) * (h / 100));
      setBmi(bmiVal.toFixed(2));
    } else {
      setBmi("");
    }
  }, [heightbmi, weight]);

  const showWarning = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  if (!isOpenacc) return null;
  return (
    <div
      className="fixed inset-0 z-40 "
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)", // white with 50% opacity
      }}
    >
      <div
        className={`
          min-h-screen w-fit flex flex-col items-center justify-center mx-auto
          ${width < 950 ? "p-4 gap-4 " : "p-4 "}
        `}
      >
        <div
          className={`w-full bg-white rounded-2xl p-4  overflow-y-auto overflow-x-hidden max-h-[90vh] ${
            width < 1095 ? "flex flex-col gap-4" : ""
          }`}
        >
          <div
            className={`w-full bg-white  ${width < 760 ? "h-fit" : "h-[20%]"} `}
          >
            <div
              className={`w-full rounded-lg flex flex-col gap-5 ${
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
                      onCloseacc(); // if onCloserem handles popup close
                      clearAllFields();
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
                  <p className="font-bold text-5 text-black">
                    ACCOUNT CREATION
                  </p>
                  <p className="font-bold text-base text-black">PATIENT</p>
                </div>
              </div>

              <div
                className={`w-full flex  gap-4 ${
                  width < 550 ? "flex-col" : "flex-row"
                }`}
              >
                <div
                  className={`flex flex-col justify-start items-center gap-2 ${
                    width < 550 ? "w-full" : "w-1/2"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="FIRST NAME *"
                    className="w-full text-black py-2 px-4 rounded-sm text-base  outline-none"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{
                      backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                    }}
                  />
                </div>
                <div
                  className={`flex flex-col justify-center items-end gap-2 ${
                    width < 550 ? "w-full" : "w-1/2"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="LAST NAME  *"
                    className="w-full text-black py-2 px-4 rounded-sm text-base outline-none"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{
                      backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                    }}
                  />
                </div>
              </div>

              <div
                className={`w-full flex  gap-4 ${
                  width < 550 ? "flex-col" : "flex-row"
                }`}
              >
                <div
                  className={`flex flex-col justify-start items-center gap-2 ${
                    width < 550 ? "w-full" : "w-1/2"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="UHID  *"
                    className="w-full text-black py-2 px-4 rounded-sm text-base outline-none"
                    value={uhid}
                    onChange={(e) => setUhid(e.target.value)}
                    style={{
                      backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                    }}
                  />
                </div>

                <div
                  className={`flex flex-row justify-start items-center gap-4 ${
                    width < 550 ? "w-full" : "w-1/2"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Date of Birth (dd-mm-yyyy) *"
                    className="w-full text-black py-2 px-4 rounded-sm text-base outline-none"
                    value={selectedDate || ""}
                    onChange={handleManualDateChange}
                    maxLength={10} // Very important: dd-mm-yyyy is 10 characters
                    style={{
                      backgroundColor: "rgba(217, 217, 217, 0.5)",
                    }}
                  />

                  {/* <div
                    className="relative cursor-pointer"
                    onClick={openDatePicker}
                  >
                    <input
                      type="date"
                      ref={dateInputRef}
                      onChange={handleDateChange}
                      className="absolute opacity-0 pointer-events-none"
                    />
                    <Image
                      src={Smallcalendar}
                      className="w-7 h-5 "
                      alt="date of birth"
                    />
                  </div> */}
                </div>
              </div>

              <div
                className={`w-full flex  gap-4 ${
                  width < 550 ? "flex-col" : "flex-row"
                }`}
              >
                <div
                  className={`flex flex-row justify-between items-center gap-2 ${
                    width < 550 ? "w-full" : "w-1/2"
                  }`}
                >
                  {/* Female */}
                  <div
                    onClick={() => setSelectedGender("female")}
                    className={`w-17 h-19 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      selectedGender === "female"
                        ? "border-2 border-[#F5A9B8]"
                        : ""
                    }`}
                    style={{ backgroundColor: "rgba(255, 180, 216, 0.2)" }}
                  >
                    <Image
                      src={Female}
                      alt="female gender"
                      className="w-7 h-7"
                    />
                    <p className="font-medium text-sm text-[#475467]">Female</p>
                  </div>

                  {/* Male */}
                  <div
                    onClick={() => setSelectedGender("male")}
                    className={`w-17 h-19 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      selectedGender === "male"
                        ? "border-2 border-[#98ECFF]"
                        : ""
                    }`}
                    style={{ backgroundColor: "rgba(152, 236, 255, 0.2)" }}
                  >
                    <Image src={Male} alt="male gender" className="w-7 h-7" />
                    <p className="font-medium text-sm text-[#475467]">Male</p>
                  </div>

                  {/* Other */}
                  <div
                    onClick={() => setSelectedGender("other")}
                    className={`w-17 h-19 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      selectedGender === "other"
                        ? "border-2 border-[#5BCEFA]"
                        : ""
                    }`}
                    style={{
                      background: `linear-gradient(to bottom, 
      rgba(91, 206, 250, 0.2), 
      rgba(245, 169, 184, 0.2), 
      rgba(255, 255, 255, 0.2), 
      rgba(245, 169, 184, 0.2), 
      rgba(91, 206, 250, 0.2))`,
                    }}
                  >
                    <Image
                      src={Othergender}
                      alt="other gender"
                      className="w-7 h-7"
                    />
                    <p className="font-medium text-sm text-[#475467]">Other</p>
                  </div>
                </div>

                <div
                  className={`flex flex-col justify-center items-center gap-2 ${
                    width < 550 ? "w-full" : "w-1/2"
                  }`}
                >
                  <div className="w-full flex justify-between items-center gap-4 px-2">
                    <label className="w-1/2 flex items-center gap-1 cursor-pointer justify-center">
                      <input
                        type="checkbox"
                        checked={leftChecked}
                        onChange={(e) => setLeftChecked(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium text-[#475467]">
                        Left Knee
                      </span>
                    </label>

                    <label className="w-1/2 flex items-center gap-1 cursor-pointer justify-center">
                      <input
                        type="checkbox"
                        checked={rightChecked}
                        onChange={(e) => setRightChecked(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium text-[#475467]">
                        Right Knee
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div
                className={`w-full flex  gap-4 ${
                  width < 550 ? "flex-col" : "flex-row"
                }`}
              >
                
                <div
                  className={`flex flex-col justify-start items-center gap-2 ${
                    width < 550 ? "w-full" : "w-1/2"
                  }`}
                >
                  <input
                    type="tel"
                    placeholder="PHONE  *"
                    className="w-full text-black py-2 px-4 rounded-sm text-base  outline-none"
                    value={phone}
                    maxLength={10}
                    minLength={10}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                    }}
                  />
                </div>

                <div
                  className={`flex flex-col justify-center items-end gap-2 ${
                    width < 550 ? "w-full" : "w-1/2"
                  }`}
                >
                  <input
                    type="email"
                    placeholder="EMAIL  *"
                    className="w-full text-black py-2 px-4 rounded-sm text-base outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                    }}
                  />
                </div>
              </div>

              <div
                className={`w-full flex  gap-4 ${
                  width < 550 ? "flex-col" : "flex-row"
                }`}
              >
                <div
                  className={`flex flex-col justify-start items-center gap-2 ${
                    width < 550 ? "w-full" : "w-2/5"
                  }`}
                >
                  <input
                    type="number"
                    placeholder="HEIGHT (in cm)  *"
                    value={heightbmi}
                    min="0"
                    onChange={(e) =>
                      setHeightbmi(e.target.value >= 0 ? e.target.value : "")
                    }
                    className="w-full text-black py-2 px-4 rounded-sm text-base outline-none"
                    style={{ backgroundColor: "rgba(217, 217, 217, 0.5)" }}
                  />
                </div>

                <div
                  className={` flex flex-col justify-start items-center gap-2 ${
                    width < 550 ? "w-full" : "w-2/5"
                  }`}
                >
                  <input
                    type="number"
                    placeholder="WEIGHT (in Kg)  *"
                    value={weight}
                    min="0"
                    onChange={(e) =>
                      setWeight(e.target.value >= 0 ? e.target.value : "")
                    }
                    className="w-full text-black py-2 px-4 rounded-sm text-base outline-none"
                    style={{ backgroundColor: "rgba(217, 217, 217, 0.5)" }}
                  />
                </div>

                <div
                  className={`flex flex-col justify-start items-center gap-2 ${
                    width < 550 ? "w-full" : "w-1/5"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="BMI"
                    value={bmi}
                    readOnly
                    className="w-full text-black py-2 px-4 rounded-sm text-base outline-none bg-gray-200"
                  />
                </div>
              </div>

              <div className="w-full flex flex-row justify-center items-center">
                <div className="w-1/2 flex flex-row justify-start items-center">
                  <p
                    className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                    onClick={clearAllFields}
                  >
                    CLEAR ALL
                  </p>
                </div>
                <div className="w-1/2 flex flex-row justify-end items-center">
                  <p
                    className="font-semibold rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-sm border-[#005585] border-2"
                    style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                    onClick={!isSubmitting ? handleSendremainder : undefined}
                  >
                    {isSubmitting ? "CREATING..." : "CREATE"}
                  </p>
                </div>
              </div>

              {showAlert && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
                    {alertMessage}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;