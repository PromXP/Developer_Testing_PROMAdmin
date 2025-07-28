"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_URL } from "./libs/global";

import Image from "next/image";

import { Poppins } from "next/font/google";

import Adm from "@/app/assets/adminlogincover.png";
import Admbg from "@/app/assets/adminloginbg.png";
import Admbgsm from "@/app/assets/adminloginbgsmall.png";

import "@/app/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export default function Home() {
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
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setshowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { identifier, password, role } = JSON.parse(userData);

      // Optional: verify credentials with backend again if needed
      axios
        .post(API_URL + "login", { identifier, password, role })
        .then(() => {
          router.replace("/Landing");
        })
        .catch(() => {
          // If login fails, clear stale credentials
          localStorage.removeItem("userData");
        });
    }
  }, []);

  const handleLogin = async () => {
    if (typeof window !== "undefined") {
      setLoading(true);
      try {
        const response = await axios.post(API_URL + "login", {
          identifier,
          password,
          role: "admin",
        });

        // Store only identifier, password, and role in localStorage
        localStorage.setItem(
          "userData",
          JSON.stringify({
            identifier,
            password,
            role: "admin",
          })
        );

        router.replace("/Landing");
      } catch (error) {
        showWarning("Login failed. Please check your credentials.");
        // alert("Login failed. Please check your credentials.");
      } finally {
        setLoading(false);
      }
    }
  };

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const showWarning = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetUhid, setResetUhid] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const handleResetPassword = async () => {
    if (!resetUhid || !resetEmail) {
      showWarning("Please enter both UHID and Email.");
      // alert("Please enter both UHID and Email.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}request_password_reset?uhid=${encodeURIComponent(
          resetUhid
        )}&email=${encodeURIComponent(resetEmail)}`
      );

      showWarning("Password reset link sent to your email!");
      // alert("Password reset link sent to your email!");
      setShowForgotModal(false);
      setResetUhid("");
      setResetEmail("");
    } catch (err) {
      showWarning("User Not found with the provided credentials");
      console.error("Reset password error:", err);
    }
  };

  return (
    <>
      {width > height && (
        <>
          <div
            className={`${poppins.className} w-screen h-screen bg-white flex md:flex-row`}
          >
            {/* Left Section - Takes Full Width in Portrait Mode */}
            <div
              className={`${
                height > width
                  ? "w-full h-full flex items-center justify-center px-6"
                  : "w-[55%] min-h-screen px-12"
              } flex flex-col gap-12 items-center justify-center`}
            >
              <div
                className={`w-full max-w-lg text-center  ${
                  height > width ? "text-center" : "md:text-left"
                }`}
              >
                <p className="font-bold text-3xl md:text-5xl text-black">
                  ADMIN
                </p>
                <p className="font-semibold text-2xl md:text-4xl text-[#005585]">
                  Login
                </p>
              </div>

              {/* Input Fields */}
              <form
                className="w-full max-w-lg flex flex-col gap-8"
                onSubmit={(e) => {
                  e.preventDefault(); // Prevent default form submission
                  handleLogin(); // Call your login function
                }}
              >
                <div className="relative w-full">
                  <label className="absolute left-4 -top-2 bg-white px-1 text-[#005585] text-sm">
                    Email / Phone / UEID
                  </label>
                  <input
                    type="text"
                    className="w-full text-black py-3 px-4 border-[1.6px] border-[#79747E] rounded-sm text-lg focus:border-[#005585] outline-none"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>

                <div className="relative w-full">
                  <label className="absolute left-4 -top-2 bg-white px-1 text-[#005585] text-sm">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full text-black py-3 px-4 border-[1.6px] border-[#79747E] rounded-sm text-lg focus:border-[#005585] outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#005585] focus:outline-none cursor-pointer"
                    onClick={() => setshowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="text-left">
                  <button
                    type="button"
                    className="text-sm text-[#005585] hover:underline focus:outline-none cursor-pointer"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#005585] text-lg text-white py-2.5 rounded-lg cursor-pointer"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>

            {/* Right Section - Image*/}
            <div className="hidden md:flex w-[45%] min-h-screen relative rounded-l-[50px] overflow-hidden">
              <Image
                src={Admbg}
                alt="Coverbackground"
                className="absolute w-full h-full object-cover"
              />
              <Image
                src={Adm}
                alt="Cover"
                className="absolute w-[80%] h-[90%] left-1/2 bottom-0 transform -translate-x-1/2 object-cover"
              />
            </div>
          </div>
          {showForgotModal && (
            <div
              className="fixed inset-0 flex justify-center items-center z-50"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)", // white with 50% opacity
              }}
            >
              <div className="bg-white w-[90%] max-w-md p-6 rounded-lg shadow-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-[#005585] text-center">
                  Reset Password
                </h2>

                <div>
                  <label className="text-sm text-gray-700">UHID</label>
                  <input
                    type="text"
                    value={resetUhid}
                    onChange={(e) => setResetUhid(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-[#005585] text-black"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-[#005585] text-black"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    className="text-sm px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 cursor-pointer"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="text-sm px-4 py-2 rounded-md bg-[#005585] text-white hover:bg-[#00446e] cursor-pointer"
                    onClick={handleResetPassword}
                  >
                    Submit
                  </button>
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
      )}

      {width <= height && (
        <>
          <div
            className={`${poppins.className} w-screen h-screen bg-white flex flex-col`}
          >
            {/* Left Section - Takes Full Width in Portrait Mode */}
            <div
              className={`${
                height > width
                  ? "w-full h-full flex items-center justify-center px-6"
                  : "w-[55%] min-h-screen px-12"
              } flex flex-col gap-12 items-center justify-center`}
            >
              <div
                className={`w-full max-w-lg text-center  ${
                  height > width ? "text-center" : "md:text-left"
                }`}
              >
                <p className="font-bold text-3xl md:text-5xl text-black">
                  ADMIN
                </p>
                <p className="font-semibold text-2xl md:text-4xl text-[#005585]">
                  Login
                </p>
              </div>

              {/* Input Fields */}
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // prevent page reload
                  handleLogin(); // call login
                }}
                className="w-full max-w-lg flex flex-col gap-8"
              >
                <div className="relative w-full">
                  <label className="absolute left-4 -top-2 bg-white px-1 text-[#005585] text-sm">
                    Email / Phone / UHID
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full text-black py-3 px-4 border-[1.6px] border-[#79747E] rounded-sm text-lg focus:border-[#005585] outline-none"
                  />
                </div>

                <div className="relative w-full">
                  <label className="absolute left-4 -top-2 bg-white px-1 text-[#005585] text-sm">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full text-black py-3 px-4 border-[1.6px] border-[#79747E] rounded-sm text-lg focus:border-[#005585] outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#005585] focus:outline-none cursor-pointer"
                    onClick={() => setshowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="text-left">
                  <button
                    type="button"
                    className="text-sm text-[#005585] hover:underline focus:outline-none cursor-pointer"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#005585] text-lg text-white py-2.5 rounded-lg cursor-pointer"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>

            {/* Right Section - Image*/}
            <div
              className={`relative overflow-hidden ${
                height / width <= 1.5 &&
                height / width >= 1.3 &&
                height - width >= 200
                  ? "flex w-full h-full justify-center items-end p-0"
                  : "hidden"
              } `}
            >
              <Image
                src={Admbgsm}
                alt="Coverbackground"
                className="absolute w-[50%] h-[70%] object-fit left-1/4 top-1.5"
              />
              <Image
                src={Adm}
                alt="Cover"
                className="absolute w-[80%] h-[100%] object-fit"
              />
            </div>
          </div>
          {showForgotModal && (
            <div
              className="fixed inset-0  flex justify-center items-center z-50"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)", // white with 50% opacity
              }}
            >
              <div className="bg-white w-[90%] max-w-md p-6 rounded-lg shadow-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-[#005585] text-center">
                  Reset Password
                </h2>

                <div>
                  <label className="text-sm text-gray-700">UHID</label>
                  <input
                    type="text"
                    value={resetUhid}
                    onChange={(e) => setResetUhid(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-[#005585] text-black"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-[#005585] text-black"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    className="text-sm px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 cursor-pointer"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="text-sm px-4 py-2 rounded-md bg-[#005585] text-white hover:bg-[#00446e] cursor-pointer"
                    onClick={handleResetPassword}
                  >
                    Submit
                  </button>
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
      )}
    </>
  );
}
