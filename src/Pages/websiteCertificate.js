// src/components/CertificateDetails.jsx
import React from "react";

const WebsiteCertificate = () => {
  const qrCodeImage = "/home/certificateqr.png"; // QR CODE PATH

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
          border: "5px solid #b8860b",
        }}
      >
        {/* INNER FRAME */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "20px",
            border: "2px solid #d4af37",
          }}
        >
          {/* TITLE */}
          <h1
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "26px",
              fontWeight: "700",
              textAlign: "center",
              color: "#7A0A1A",
              marginBottom: "10px",
            }}
          >
            Certificate of Registration
          </h1>

          {/* SUBTITLE */}
          <p
            style={{
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "14px",
              color: "#555",
              marginBottom: "25px",
              padding: "0px 5px",
            }}
          >
            This certificate confirms the registration and certification of the
            organization listed below.
          </p>

          {/* COMPANY NAME */}
          <h2
            style={{
              fontFamily: "'Times New Roman', serif",
              fontSize: "20px",
              textAlign: "center",
              color: "#7A0A1A",
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
            }}
          >
            <p>
              <strong style={{ color: "#7A0A1A" }}>Certificate Code:</strong>{" "}
              QCC/94AF/1125
            </p>

            <p>
              <strong style={{ color: "#7A0A1A" }}>Issued On:</strong> 03
              November 2025
            </p>

            <p style={{ marginTop: "10px" }}>
              <strong style={{ color: "#7A0A1A" }}>Verification Link:</strong>{" "}
              <a
                href="https://qccertification.com/Client.aspx"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#7A0A1A",
                  textDecoration: "underline",
                  fontWeight: "600",
                }}
              >
                https://qccertification.com/Client.aspx
              </a>
            </p>
          </div>

          {/* QR CODE */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={qrCodeImage}
              alt="QR Code"
              style={{
                height: "120px",
                width: "120px",
                objectFit: "contain",
                border: "3px solid #d4af37",
                padding: "6px",
                borderRadius: "8px",
              }}
            />
            <p
              style={{
                marginTop: "8px",
                fontFamily: "Georgia, serif",
                fontSize: "13px",
                color: "#7A0A1A",
              }}
            >
              Scan to Verify Certificate
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
            img { height: 100px !important; width: 100px !important; }
          }
        `}
      </style>
    </div>
  );
};

export default WebsiteCertificate;
