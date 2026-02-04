import React, { useState } from "react";
import { Modal, Spinner, InputGroup, Form } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";

const DownloadSyllabusModal = ({ show, handleClose, courseId }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [downloadId, setDownloadId] = useState(null); // 🔥 backend id

  /* ---------------- DOWNLOAD PDF ---------------- */
  const handleDownload = async (url, filename = "document.pdf") => {
    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      Swal.fire("Error", "Failed to download PDF", "error");
    }
  };

  /* ---------------- FETCH COURSE ---------------- */
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://api.techsterker.com/api/coursecontroller"
      );

      if (!res.data.success) return null;

      const course = res.data.data.find((c) => c._id === courseId);
      if (!course?.pdf) {
        Swal.fire("Oops", "PDF not available", "warning");
        return null;
      }

      setPdfUrl(course.pdf);
      setFileName(`${course.name}-syllabus.pdf`);
      return course;
    } catch {
      Swal.fire("Error", "Failed to fetch course", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = async () => {
    if (!name || phone.length !== 10) {
      Swal.fire("Error", "Enter valid name & phone", "error");
      return;
    }

    try {
      setLoading(true);

      const course = await fetchCourseDetails();
      if (!course) return;

      // 🔹 CALL BACKEND CREATE API
      const createRes = await axios.post(
        "https://api.techsterker.com/api/our-mentor/createDownload",
        {
          name,
          phone,
          courseId,
          pdfUrl: course.pdf,
        }
      );

      const createdId = createRes.data?.data?._id;
      if (!createdId) {
        Swal.fire("Error", "Failed to create download record", "error");
        return;
      }

      setDownloadId(createdId);

      // 🔥 Firebase reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );

      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        window.recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setOtpSent(true);

      Swal.fire("Success", "OTP sent successfully", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message || "OTP failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) return;

    try {
      setLoading(true);

      // 🔹 Firebase OTP verify
      await confirmationResult.confirm(otp);

      // 🔹 CALL BACKEND VERIFY API
      await axios.put(
        `https://api.techsterker.com/api/our-mentor/verify/${downloadId}`
      );

      Swal.fire("Verified", "OTP verified! Downloading…", "success");

      if (pdfUrl) {
        await handleDownload(pdfUrl, fileName);
      }

      handleClose();
      setOtp("");
      setOtpSent(false);
      setDownloadId(null);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 justify-content-center">
        <Modal.Title className="fw-bold d-flex gap-2 align-items-center">
          <FaDownload /> Download Syllabus
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!otpSent ? (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <InputGroup>
                <InputGroup.Text>+91</InputGroup.Text>
                <Form.Control
                  value={phone}
                  maxLength={10}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, ""))
                  }
                />
              </InputGroup>
            </Form.Group>

            <button
              type="button"
              className="w-100 btn btn-lg bg-meroon"
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Send OTP"}
            </button>
          </Form>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Enter OTP</Form.Label>
              <Form.Control
                value={otp}
                maxLength={6}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
              />
            </Form.Group>

            <button
              type="button"
              className="w-100 btn btn-lg bg-meroon"
              onClick={verifyOtp}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Verify & Download"}
            </button>
          </Form>
        )}

        {/* 🔐 REQUIRED FOR FIREBASE */}
        <div id="recaptcha-container"></div>
      </Modal.Body>
    </Modal>
  );
};

export default DownloadSyllabusModal;
