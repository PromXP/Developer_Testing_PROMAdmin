"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "../context/WebSocketContext";
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
  ArrowsRightLeftIcon,
} from "@heroicons/react/16/solid";
import Patientimg from "@/app/assets/patimg.png";
import Closeicon from "@/app/assets/closeicon.png";
import Search from "@/app/assets/search.png";
import Calendar from "@/app/assets/calendar.png";
import Bigcalendar from "@/app/assets/bigcalender.png";
import Clock from "@/app/assets/clock.png";

import "@/app/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const page = ({ isOpenrem, onCloserem, patient, selectedLeg }) => {
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

  const completedItems = [];
  const pendingItems = [];
  const period = [];

  const [contentswitch, setcontentswitch] = useState(false);
  const [followupcontent, setfollowupcontent] = useState([]);

  if (selectedLeg === "left") {
    if (patient?.questionnaire_assigned_left?.length > 0) {
      patient.questionnaire_assigned_left.forEach((q) => {
        if (q.completed === 1) {
          completedItems.push(q.name);
        } else {
          pendingItems.push(q.name);
          period.push(q.period);
        }
      });
    }
  }
  if (selectedLeg === "right") {
    if (patient?.questionnaire_assigned_right?.length > 0) {
      patient.questionnaire_assigned_right.forEach((q) => {
        if (q.completed === 1) {
          completedItems.push(q.name);
        } else {
          pendingItems.push(q.name);
          period.push(q.period);
        }
      });
    }
  }

  const [message, setMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleSendremainder = async () => {
    if (message.trim() === "") {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2500);
      return;
    }

    console.log(
      "Reminder data",
      JSON.stringify({
        // message:
        //   "Hey User\nHope Your doing well !\n" +
        //   message +
        //   "\nThank you with love,\nXolabsHealth ",
        user_name: patient?.first_name + " " + patient?.last_name,
        message: message,
        phone_number: "+91" + patient.phone_number,
      })
    );
    // return;

    // sendRealTimeMessage();
    try {
      const res = await fetch(API_URL + "send/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: patient.first_name + " " + patient.last_name,
          email: patient.email,
          subject: "Questionnaire Pending Reminder",
          message: message + "<br>Thank you with love,<br>XolabsHealth",
        }),
      });

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "Invalid JSON response", raw: text };
      }

      console.log("Email API response:", data);

      if (res.ok) {
        // alert("Email sent (check console for details)");
        // showWarning("Email sent Successfully");
        // sendRealTimeMessage();
      } else {
        showWarning("Failed to send email. Check logs.");
      }
      sendwhatsapp();
    } catch (error) {
      console.error("Error sending email:", error);
      showWarning("Failed to send email.");
    }
  };

  const [newFollowup, setNewFollowup] = useState("");


  const handleAddFollowup = async () => {
    if (newFollowup.trim() === "") {
      showWarning("Enter comment");
      return;
    }
    try {
      const response = await axios.patch(
        `${API_URL}patients/${patient.uhid}/followup/add`,
        JSON.stringify(newFollowup), // match backend param name
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Follow-up comment added:", response.data);

      if (response.data.added_comment) {
        // Update UI instantly without page reload
        setfollowupcontent("");
        setNewFollowup("");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding follow-up comment:", error);
    }
  };

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert1, setShowAlert1] = useState(false);

  const showWarning = (message) => {
    setAlertMessage(message);
    setShowAlert1(true);
    setTimeout(() => setShowAlert1(false), 4000);
  };

  const socket = useWebSocket();

  const sendRealTimeMessage = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("⚠️ WebSocket is not open. Cannot send message.");
      return;
    }

    const payload = {
      uhid: patient.uhid,
      email: patient.email,
      phone_number: patient.phone_number || "N/A",
      message: message,
    };

    socket.send(JSON.stringify(payload));
    console.log("📤 Sent via WebSocket:", payload);
    onCloserem();
  };

  const sendwhatsapp = async () => {
    const res = await fetch(API_URL + "send-whatsapp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // message:
        //   "Hey User\nHope Your doing well !\n" +
        //   message +
        //   "\nThank you with love,\nXolabsHealth ",
        user_name: patient?.first_name + " " + patient?.last_name,
        phone_number: "+91" + patient.phone_number,
        message: message,
        flag: 0,
      }),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "Invalid JSON response", raw: text };
    }

    showWarning("Reminder Sent Successfully");
    window.location.reload();
  };

  const templates = [
    "Your appointment is scheduled for tomorrow. Please be on time.",
    "Reminder: Please complete your pending questionnaire.",
    "Don't forget to bring your medical reports to the clinic.",
    "Your surgery follow-up is scheduled next week.",
    "Please update your contact information in the portal.",
  ];

  if (!isOpenrem) return null;
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
                      onCloserem(); // if onCloserem handles popup close
                    }}
                  />
                </div>
                <div
                  className={`w-full flex gap-4 justify-start items-center ${
                    width < 530
                      ? "flex-col justify-center items-center"
                      : "flex-row"
                  }`}
                >
                  <p className="font-bold text-5 text-black">
                    {!contentswitch
                      ? "COMPLIANCE STATUS"
                      : "COMPLIANCE FOLLOW UP"}
                  </p>
                  <ArrowsRightLeftIcon
                    className={`w-5 h-5 cursor-pointer text-black`}
                    onClick={() => {
                      setcontentswitch(!contentswitch);
                      setfollowupcontent(patient?.follow_up_comments||[]);
                    }}
                  />
                </div>
              </div>

              {!contentswitch && (
                <>
                  <div className="w-full flex flex-row">
                    <div className="w-full flex flex-col justify-center items-center gap-2">
                      <p className="font-semibold text-4 text-[#FFB978]">
                        PENDING
                      </p>
                      <div className="flex flex-col gap-1 items-center">
                        <div className="overflow-x-auto w-full">
                          <table className="min-w-full ">
                            <thead className="bg-gray-100 shadow-md">
                              <tr>
                                <th className="px-4 py-2 text-left text-black font-semibold">
                                  S. NO
                                </th>
                                <th className="px-4 py-2 text-left text-black font-semibold">
                                  Questionnaire Name
                                </th>
                                <th className="px-4 py-2 text-left text-black font-semibold">
                                  Period
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingItems.length > 0 ? (
                                pendingItems.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2 text-black text-center">
                                      {index + 1}
                                    </td>
                                    <td className="px-4 py-2 text-black">
                                      {item}
                                    </td>
                                    <td className="px-4 py-2 text-black text-center">
                                      {period[index]}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="3"
                                    className="p-2 text-center text-black"
                                  >
                                    No Pending Questionnaires
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-3xl flex flex-col gap-2">
                    <p className="font-medium text-black text-base">
                      REMINDER MESSAGE
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {templates.map((template, index) => (
                        <div
                          key={index}
                          onClick={() => setMessage(template)}
                          className={`border rounded-md px-4 py-3 text-sm text-black cursor-pointer hover:bg-blue-100 ${
                            message === template
                              ? "bg-blue-200 border-blue-500"
                              : "bg-gray-100"
                          }`}
                        >
                          {template}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full flex flex-row justify-center items-center">
                    <div className="w-1/2 flex flex-row justify-start items-center">
                      <p
                        className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                        onClick={() => setMessage("")}
                      >
                        CLEAR MESSAGE
                      </p>
                    </div>
                    <div className="w-1/2 flex flex-row justify-end items-center">
                      <p
                        className="font-semibold rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-sm border-[#005585] border-2"
                        style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                        onClick={handleSendremainder}
                      >
                        SEND
                      </p>
                    </div>
                  </div>
                </>
              )}
              {contentswitch && (
                <>
                  {followupcontent.length > 0 && (
                    <div className="w-3xl">
                      {" "}
                      {/* Increased width */}
                      <div className="mt-6 max-h-48 overflow-auto">
                        <table className="w-full border-collapse text-black text-sm table-fixed">
                          <thead className="bg-gray-100 text-black">
                            <tr>
                              <th className="px-2 py-1 w-2/5">
                                Date
                              </th>
                              <th className="px-2 py-1 w-3/5">
                                Comment
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {followupcontent.length > 0 ? (
                              followupcontent.map((comment, idx) => {
                                const parts = comment
                                  .split(",")
                                  .map((p) => p.trim());
                                const utcDate = new Date(parts[0]);

                                const datePart = utcDate
                                  .toLocaleDateString("en-GB", {
                                    timeZone: "Asia/Kolkata",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                  .replace(/\//g, "-");

                                const timePart = utcDate.toLocaleTimeString(
                                  "en-GB",
                                  {
                                    timeZone: "Asia/Kolkata",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  }
                                );

                                return (
                                  <tr key={idx} className="text-black text-center w-full">
                                    <td className=" px-2 py-1 w-2/5">{`${datePart} / ${timePart}`}</td>
                                    <td className=" px-2 py-1 whitespace-normal break-words w-3/5">
                                      {parts.slice(1).join(", ")}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan="2"
                                  className="text-center text-gray-500 py-2"
                                >
                                  No follow-up comments
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="w-3xl max-w-6xl flex flex-col gap-2">
                    {" "}
                    {/* Increased width */}
                    <p className="font-medium text-black text-base">
                      FOLLOW UP COMMENT
                    </p>
                    <div className="flex gap-2 mt-4">
                      <textarea
                        value={newFollowup}
                        rows={5}
                        onChange={(e) => setNewFollowup(e.target.value)}
                        placeholder="Enter follow-up comment..."
                        className="w-full border border-gray-300 rounded p-2 text-black"
                      />
                    </div>
                  </div>

                  <div className="w-3xl flex flex-row justify-center items-center">
                    <div className="w-1/2 flex flex-row justify-start items-center">
                      <p
                        className="font-semibold italic text-[#475467] text-sm cursor-pointer"
                        onClick={() => setNewFollowup("")}
                      >
                        CLEAR MESSAGE
                      </p>
                    </div>
                    <div className="w-1/2 flex flex-row justify-end items-center">
                      <p
                        className="font-semibold rounded-full px-3 py-[1px] cursor-pointer text-center text-white text-sm border-[#005585] border-2"
                        style={{ backgroundColor: "rgba(0, 85, 133, 0.9)" }}
                        onClick={handleAddFollowup}
                      >
                        SAVE
                      </p>
                    </div>
                  </div>
                </>
              )}

              {showAlert1 && (
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
