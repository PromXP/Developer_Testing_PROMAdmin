"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import axios from "axios";

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
import LeftKnee from "@/app/assets/leftknee.png";
import RightKnee from "@/app/assets/rightknee.png";
import UploadProfile from "@/app/assets/uploadprofile.png";

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
  const [address, setAddress] = useState("");
  const [uhid, setUhid] = useState("");
  const [phone, setPhone] = useState("");
  const [alterphone, setalterPhone] = useState("");
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
  const [surgerydate, setsurgeryDate] = useState("");
  const [surgeryname, setsurgeryname] = useState("");
  const [surgerydatel, setsurgeryDatel] = useState("");
  const [surgerynamel, setsurgerynamel] = useState("");
  const [surgerydater, setsurgeryDater] = useState("");
  const [surgerynamer, setsurgerynamer] = useState("");

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

  const handleManualsurgeryDateChange = (e) => {
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
    setsurgeryDate(value);

    if (value.length === 10) {
      const [dayStr, monthStr, yearStr] = value.split("-");
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);

      const today = new Date();
      const currentYear = today.getFullYear();

      // Basic validations
      if (day < 1 || day > 31 || month < 1 || month > 12) {
        showWarning("Please enter a valid surgery date");
        setS("");
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
        setsurgeryDate("");
        return;
      }

      // Check if future or today
      today.setHours(0, 0, 0, 0);
      manualDate.setHours(0, 0, 0, 0);

      // If all valid, format as "dd Mmm yyyy"
      const formattedDate = manualDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "numeric",
        year: "numeric",
      });

      // Final validated date components
      const isoDate = `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      setsurgeryDate(isoDate); // This avoids time zone issues
    }
  };

  const [selectedIDs, setSelectedIDs] = useState({});
  const idOptions = ["PASSPORT", "PAN", "AADHAAR", "ABHA"];

  const [selectedFunding, setSelectedFunding] = useState("");
  const [otherFunding, setOtherFunding] = useState("");

  const fundingOptions = [
    "SELF",
    "CGHS",
    "INSURANCE",
    "INSURANCE+CASH",
    "OTHER",
  ];

  const handleFundingChange = (value) => {
    setSelectedFunding(value);
    if (value !== "OTHER") setOtherFunding(""); // Clear other input if not selected
  };

  const handleCheckboxChange = (id) => {
    setSelectedIDs((prev) => {
      const updated = { ...prev };
      if (id in updated) {
        delete updated[id]; // uncheck: remove
      } else {
        updated[id] = ""; // check: add with empty string
      }
      return updated;
    });
  };

  const handleInputChange = (id, value) => {
    setSelectedIDs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const [selectedKnees, setSelectedKnees] = useState([]); // e.g., ["left", "right"]

  const toggleKnee = (knee) => {
    setSelectedKnees((prev) =>
      prev.includes(knee) ? prev.filter((k) => k !== knee) : [...prev, knee]
    );
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

  const [profileImage, setProfileImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && e.target.files) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSuccess("");
      setError("");
    }
  };

  const isBlobUrl = previewUrl && previewUrl.startsWith("blob:");

  const fileInputRef = useRef(null); // To programmatically trigger the file input

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
    setsurgeryDate("");
    setAddress("");
    setsurgeryname("");
    setSelectedKnees([]);
    setalterPhone("");
    setSelectedIDs({});
    setSelectedFunding("");
    setOtherFunding("");
  };

  const [alertMessage, setAlertMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leftChecked, setLeftChecked] = useState(false);
  const [rightChecked, setRightChecked] = useState(false);

  const handleSendremainder = async () => {
    // handleUpload();


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
    if (!address.trim()) return showWarning("Address is Required");
    // if (!leftChecked && !rightChecked) return showWarning("Select Leg");
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

    const hasEmptyIdNumber = Object.entries(selectedIDs).some(
      ([id, val]) => val.trim() === ""
    );

    if (hasEmptyIdNumber) {
      // some selected ID has empty input
      return showWarning("ID Proof Required");
    }

    if (selectedKnees.length === 0) return showWarning("Select the Knee");
    if (!surgeryname.trim()) return showWarning("Enter Surgery Name");
    if (!surgerydate.trim()) return showWarning("Surgery date is required.");

    if (!selectedFunding) {
      // No funding selected at all
      return showWarning("Please select a funding option");
    } else if (selectedFunding === "OTHER" && otherFunding.trim() === "") {
      // OTHER selected but no input provided
      return showWarning("Please specify other funding source");
    }

    if (!address.trim()) return showWarning("Address is required.");
    for (const id of idOptions) {
      if (selectedIDs[id] && selectedIDs[id].trim() === "") {
        return showWarning(`${id} cannot be empty.`);
      }
    }
    if (!surgeryname.trim()) return showWarning("Surgery Name is required.");
    if (!selectedFunding.trim()) return showWarning("Funding Type is required.");
    if (selectedFunding === "OTHER" && !otherFunding.trim()) return showWarning("Please specify the other funding.");

    // return;

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

    if(selectedKnees.includes("Left")){
        setsurgeryDatel(surgerydate);
        setsurgerynamel(surgeryname);
    }
    if(selectedKnees.includes("Right")){
        setsurgeryDater(surgerydate);
        setsurgerynamer(surgeryname);
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
      address: address,
      alternatenumber: alterphone,
      idproof: selectedIDs,
      doctor_assigned: "",
      doctor_name: "", // replace with real data
      admin_assigned: userData?.user?.email, // replace with real data
      admin_name: "",
      questionnaire_assigned_left: [],
      questionnaire_scores_left: [],
      questionnaire_assigned_right: [],
      questionnaire_scores_right: [],
      surgery_scheduled_left: {
        date: "dd-mm-yyyy", // replace with actual selected date
        time: "hh:mm AM", // replace with actual selected time
      },
      surgery_scheduled_right: {
        date: "dd-mm-yyyy", // replace with actual selected date
        time: "hh:mm AM", // replace with actual selected time
      },
       post_surgery_details_left: {
        date_of_surgery: selectedKnees.includes("Left Knee") ? surgerydate : "0001-01-01T00:00:00.000+00:00",
        surgeon: "", // replace accordingly
        surgery_name: selectedKnees.includes("Left Knee") ? surgeryname : "", // if different
        sub_doctor: "",
        procedure: "", // replace
        implant: "", // replace
        technology: "", // replace
      },
      post_surgery_details_right: {
        date_of_surgery: selectedKnees.includes("Right Knee") ? surgerydate :"0001-01-01T00:00:00.000+00:00",
        surgeon: "", // replace accordingly
        surgery_name: selectedKnees.includes("Right Knee") ? surgeryname : "", // if different
        sub_doctor: "",
        procedure: "", // replace
        implant: "", // replace
        technology: "", // replace
      },
      operationfundion: selectedFunding,
      otherfunding: otherFunding,
      current_status: selectedKnees.join(", "),
    };

        console.log("Patient Payload", JSON.stringify(payload, null, 2));

    handleUpload();


    // return;
    setIsSubmitting(true); // 🔒 Lock submission

    try {
      const response = await fetch(API_URL + "registerpatientoverall", {
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

  const handleUpload = async () => {
    if (!profileImage) {
      setError("Please select or capture an image.");
      return;
    }

    const formData = new FormData();
    formData.append("uhid", uhid);
    formData.append("usertype", "patient"); // <-- Make sure userType is defined
    formData.append("profile_image", profileImage);

    try {
      const res = await axios.post(
        `${API_URL}upload-profile-photo`,
        formData
        // ❌ DO NOT SET HEADERS — Axios will handle Content-Type with boundaries
      );

      console.log("Profile upload success:", res.data);
      setSuccess("Image uploaded successfully.");
      setError("");
    } catch (err) {
      console.error("Profile upload failed:", err);
      setError("Upload failed.");
      setSuccess("");
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
            className={`w-full bg-white  ${width < 760 ? "h-fit" : "h-[80%]"} `}
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
                  <p className="font-bold text-2xl text-black">
                    PATIENT ACCOUNT CREATION
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
                            src={previewUrl || UploadProfile}
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

                      <div
                        className={`flex flex-row justify-between items-between gap-2 ${
                          width < 700 ? "w-full" : "w-full"
                        }`}
                      >
                        {/* Female */}
                        <div
                          onClick={() => setSelectedGender("female")}
                          className={`w-1/3 h-fit rounded-lg py-2 flex flex-col items-center justify-center gap-2 cursor-pointer ${
                            selectedGender === "female"
                              ? "border-2 border-[#F5A9B8]"
                              : ""
                          }`}
                          style={{
                            backgroundColor: "rgba(255, 180, 216, 0.2)",
                          }}
                        >
                          <Image
                            src={Female}
                            alt="female gender"
                            className="w-8 h-8"
                          />
                          <p className="font-semibold text-lg text-[#475467]">
                            Female
                          </p>
                        </div>

                        {/* Male */}
                        <div
                          onClick={() => setSelectedGender("male")}
                          className={`w-1/3 h-fit rounded-lg py-2 flex flex-col items-center justify-center gap-2 cursor-pointer ${
                            selectedGender === "male"
                              ? "border-2 border-[#98ECFF]"
                              : ""
                          }`}
                          style={{
                            backgroundColor: "rgba(152, 236, 255, 0.2)",
                          }}
                        >
                          <Image
                            src={Male}
                            alt="male gender"
                            className="w-8 h-8"
                          />
                          <p className="font-semibold text-lg text-[#475467]">
                            Male
                          </p>
                        </div>

                        {/* Other */}
                        <div
                          onClick={() => setSelectedGender("other")}
                          className={`w-1/3 h-fit rounded-lg py-2 flex flex-col items-center justify-center gap-2 cursor-pointer ${
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
                            className="w-8 h-8"
                          />
                          <p className="font-semibold text-lg text-[#475467]">
                            Other
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex flex-col justify-between items-end gap-2 ${
                        width < 700 ? "w-full" : "w-1/2"
                      }`}
                    >
                      <input
                        type="text"
                        placeholder="FIRST NAME  *"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={{
                          backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                        }}
                      />
                      <input
                        type="text"
                        placeholder="LAST NAME  *"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={{
                          backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Date of Birth (dd-mm-yyyy) *"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        value={selectedDate || ""}
                        onChange={handleManualDateChange}
                        maxLength={10} // Very important: dd-mm-yyyy is 10 characters
                        style={{
                          backgroundColor: "rgba(217, 217, 217, 0.5)",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="ADDRESS  *"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{
                          backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                        }}
                      />
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
                      <input
                        type="tel"
                        placeholder="PHONE NUMBER *"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold  outline-none"
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
                        width < 700 ? "w-full" : "w-1/2"
                      }`}
                    >
                      <input
                        type="tel"
                        placeholder="ALTERNATE NUMBER"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold  outline-none"
                        value={alterphone}
                        maxLength={10}
                        minLength={10}
                        onChange={(e) => setalterPhone(e.target.value)}
                        style={{
                          backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                        }}
                      />
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
                      <input
                        type="email"
                        placeholder="EMAIL  *"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                        }}
                      />
                    </div>

                    <div
                      className={`flex flex-row justify-start items-center gap-4 ${
                        width < 700 ? "w-full" : "w-1/2"
                      }`}
                    >
                      <input
                        type="text"
                        placeholder="UHID  *"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        value={uhid}
                        onChange={(e) => setUhid(e.target.value)}
                        style={{
                          backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
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
                      width < 700 ? "flex-col" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex flex-col justify-start items-center gap-2 ${
                        width < 700 ? "w-full" : "w-2/5"
                      }`}
                    >
                      <input
                        type="number"
                        placeholder="HEIGHT (in cm)  *"
                        value={heightbmi}
                        min="0"
                        onChange={(e) =>
                          setHeightbmi(
                            e.target.value >= 0 ? e.target.value : ""
                          )
                        }
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        style={{ backgroundColor: "rgba(217, 217, 217, 0.5)" }}
                      />
                    </div>

                    <div
                      className={` flex flex-col justify-start items-center gap-2 ${
                        width < 700 ? "w-full" : "w-2/5"
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
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        style={{ backgroundColor: "rgba(217, 217, 217, 0.5)" }}
                      />
                    </div>

                    <div
                      className={`flex flex-col justify-start items-center gap-2 ${
                        width < 700 ? "w-full" : "w-1/5"
                      }`}
                    >
                      <input
                        type="text"
                        placeholder="BMI"
                        value={bmi}
                        readOnly
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none bg-gray-200"
                      />
                    </div>
                  </div>

                  <div
                    className={`w-full flex  gap-4 ${
                      width < 700 ? "flex-col" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex flex-col justify-center items-start gap-2 ${
                        width < 700 ? "w-fit" : "w-1/5"
                      }`}
                    >
                      <p className="font-bold text-lg text-black">
                        ID PROOFS: *
                      </p>
                    </div>

                    <div
                      className={`flex flex-col justify-center items-start gap-4 text-black text-lg font-semibold ${
                        width < 700 ? "w-full" : "w-4/5"
                      }`}
                    >
                      <div className="flex flex-row justify-between w-full flex-wrap gap-4">
                        {idOptions.map((id) => (
                          <label
                            key={id}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={id in selectedIDs}
                              onChange={() => handleCheckboxChange(id)}
                            />
                            {id}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Conditionally render input fields */}
                  <div className="flex flex-col gap-3 w-full text-black text-lg font-semibold">
                    {Object.keys(selectedIDs).map((id) => (
                      <div key={id} className="flex flex-col gap-1 w-full">
                        <label className="text-lg">{id} Number:</label>
                        <input
                          type="text"
                          value={selectedIDs[id]}
                          onChange={(e) =>
                            handleInputChange(id, e.target.value)
                          }
                          className="border px-2 py-1 rounded w-full"
                          placeholder={`Enter your ${id} number`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full h-full flex flex-col gap-8">
                  <p className="text-black text-2xl font-bold">
                    SURGERY DETAILS
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
                      <div
                        className={`flex flex-row justify-between items-between gap-6 px-6  ${
                          width < 700 ? "w-full" : "w-full"
                        }`}
                      >
                        {/* Left Knee */}
                        <div
                          onClick={() => toggleKnee("Left Knee")}
                          className={`w-1/2 h-fit py-2 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer ${
                            selectedKnees.includes("Left Knee")
                              ? "border-2 border-black"
                              : ""
                          }`}
                        >
                          <Image
                            src={LeftKnee}
                            alt="Left Knee"
                            className="w-12 h-12"
                          />
                          <p className="font-semibold text-lg text-black">
                            Left Knee
                          </p>
                        </div>

                        {/* Right Knee */}
                        <div
                          onClick={() => toggleKnee("Right Knee")}
                          className={`w-1/2 h-fit py-2 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer ${
                            selectedKnees.includes("Right Knee")
                              ? "border-2 border-black"
                              : ""
                          }`}
                        >
                          <Image
                            src={RightKnee}
                            alt="Right Knee"
                            className="w-12 h-12"
                          />
                          <p className="font-semibold text-lg text-black">
                            Right Knee
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex flex-col justify-between items-end gap-2 ${
                        width < 700 ? "w-full" : "w-1/2"
                      }`}
                    >
                      <input
                        type="text"
                        placeholder="SURGERY NAME  *"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        value={surgeryname}
                        onChange={(e) => setsurgeryname(e.target.value)}
                        style={{
                          backgroundColor: "rgba(217, 217, 217, 0.5)", // white with 50% opacity
                        }}
                      />
                      <input
                        type="text"
                        placeholder="SURGERY DATE (dd-mm-yyyy) *"
                        className="w-full text-black py-2 px-4 rounded-sm text-lg font-semibold outline-none"
                        value={surgerydate || ""}
                        onChange={handleManualsurgeryDateChange}
                        maxLength={10} // Very important: dd-mm-yyyy is 10 characters
                        style={{
                          backgroundColor: "rgba(217, 217, 217, 0.5)",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={`w-full flex  gap-4 ${
                      width < 550 ? "flex-col" : "flex-col"
                    }`}
                  >
                    <div
                      className={`flex flex-col justify-between items-end gap-2 ${
                        width < 550 ? "w-full" : "w-full"
                      }`}
                    >
                      <p className="w-full text-black font-bold text-lg">
                        OPERATION FUNDING
                      </p>
                      <div className="flex flex-col gap-4 w-full text-lg text-black font-semibold">
                        <div className="flex flex-row justify-between flex-wrap gap-4 w-full">
                          {fundingOptions.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="funding"
                                value={option}
                                checked={selectedFunding === option}
                                onChange={() => handleFundingChange(option)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>

                        {/* Show input box if OTHER is selected */}
                        {selectedFunding === "OTHER" && (
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor="otherFunding"
                              className="text-lg font-semibold"
                            >
                              Please specify:
                            </label>
                            <input
                              type="text"
                              id="otherFunding"
                              value={otherFunding}
                              onChange={(e) => setOtherFunding(e.target.value)}
                              className="border px-2 py-1 rounded w-full"
                              placeholder="Enter funding source"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-row justify-center items-center">
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
