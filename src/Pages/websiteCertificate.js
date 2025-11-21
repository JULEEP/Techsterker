// src/components/CertificateDetails.jsx
import React from "react";

const WebsiteCertificate = () => {
  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "20px auto",
        padding: "10px",
      }}
    >
      {/* TOP HEADING */}
      <h2
        style={{
          textAlign: "center",
          fontSize: "30px",
          fontWeight: "700",
          fontFamily: "'Times New Roman', serif",
          marginBottom: "15px",
          textTransform: "uppercase",
        }}
      >
        <span className="textcolor">Certification</span> Details
      </h2>

      {/* OUTER WRAPPER */}
      <div
        style={{
          background: "#faf7ef",
          borderRadius: "10px",
          padding: "12px",
          border: "5px solid #7A0A1A",
        }}
      >
        {/* INNER FRAME */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "20px",
            border: "2px solid #7A0A1A",
          }}
        >
          {/* TITLE */}
          <h1
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "26px",
              fontWeight: "700",
              textAlign: "center",
              color: "#000",
              marginBottom: "10px",
            }}
          >
            Information Security Compliance Certification
          </h1>

          {/* SUBTITLE */}
          <p
            style={{
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "10px",
              color: "#555",
              marginBottom: "25px",
              padding: "0px 5px",
            }}
          >
            HICAP EDTECH PRIVATE LIMITED has been found in compliance with the requirements of the Information Security Management System (ISMS) ISO/IEC 27001:2022.
          </p>

          {/* COMPANY NAME */}
          <h2
            className="fw-bold"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "20px",
              textAlign: "center",
              color: "#000",
              marginBottom: "20px",
            }}
          >
            HICAP EDTECH PRIVATE LIMITED
          </h2>

          {/* DETAILS */}
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "15px",
              color: "#333",
              lineHeight: "1.6",
              textAlign: "center",
            }}
          >
            <p>
              <span style={{ color: "#7A0A1A" }}>Certificate Code:</span>{" "}
              <span className="fw-bold text-black">QCC/94AF/1125</span>
            </p>

            <p>
              <span style={{ color: "#7A0A1A" }}>Issued On:</span>{" "}
              <span className="fw-bold text-black">03 November 2025</span>
            </p>
          </div>
        </div>
      </div>

      {/* MOBILE RESPONSIVE CSS */}
      <style>
        {`
          @media (max-width: 480px) {
            h1 { font-size: 22px !important; }
            h2 { font-size: 18px !important; }
            p, span { font-size: 13px !important; }
          }
        `}
      </style>
    </div>
  );
};

export default WebsiteCertificate;
