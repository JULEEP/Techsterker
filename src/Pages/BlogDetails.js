import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import blogData from "./BlogData";
import { FaArrowLeft, FaShareAlt, FaPrint } from "react-icons/fa";
import Header from "../Header/Header";
import Footer from "./Footer";

const BlogDetails = () => {
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const { slug } = useParams();
    const navigate = useNavigate();

    // Find blog by slug
    const blog = blogData.find((item) => item.slug === slug);

    console.log("URL SLUG:", slug);
    console.log("AVAILABLE SLUGS:", blogData.map(b => b.slug));
    console.log("MATCHED BLOG:", blog);


    if (!blog)
        return <h2 style={{ marginTop: "150px", textAlign: "center" }}>Blog Not Found</h2>;

    // SHARE
    const handleShare = async () => {
        const shareData = {
            title: blog.title,
            text: blog.description,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share canceled", err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    // PRINT
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Header />
            {/* HERO */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "1200px",
                    margin: "110px auto 30px",
                    padding: "0 20px",
                }}
            >

                {/* RESPONSIVE BACK BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#a51d34",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "20px",
                    }}
                >
                    <FaArrowLeft /> Back to Blogs
                </button>
                <div
                    style={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                    }}
                >
                    <img
                        src={blog.image}
                        alt={blog.title}
                        style={{ width: "100%", height: "450px", objectFit: "cover" }}
                    />
                </div>
            </div>

            {/* CONTENT */}
            <div
                id="print-area"
                style={{
                    maxWidth: "850px",
                    margin: "0 auto",
                    padding: "10px 20px 70px",
                    fontFamily: "Roboto, sans-serif",
                    color: "#222",
                }}
            >
                {/* BACK */}
                {/* <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#a51d34",
                        fontSize: "18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "25px",
                    }}
                >
                    <FaArrowLeft /> Back
                </button> */}

                {/* TITLE */}
                <h1
                    style={{
                        fontSize: "36px",
                        fontWeight: "700",
                        marginBottom: "16px",
                        color: "#1a1a1a",
                    }}
                >
                    {blog.title}
                </h1>

                {/* META */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "25px" }}>
                    <span style={chipStyle}>✍️ {blog.author}</span>
                    <span style={chipStyle}>📅 {blog.date}</span>
                    <span style={chipStyle}>⏱ {blog.readTime}</span>
                    <span style={{ ...chipStyle, background: "#a51d3420", color: "#a51d34" }}>
                        {blog.category}
                    </span>
                </div>

                {/* SHARE + PRINT */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    <button onClick={handleShare} style={buttonStyleRed}>
                        <FaShareAlt /> Share
                    </button>
                    <button onClick={handlePrint} style={buttonStyleBlack}>
                        <FaPrint /> Print
                    </button>
                </div>

                {/* ARTICLE */}
                <article
                    style={{
                        fontSize: "18px",
                        lineHeight: "1.75",
                        color: "#393939",
                        whiteSpace: "pre-line",
                        marginTop: "25px",
                    }}
                >
                    {blog.fullContent}
                </article>
            </div>

            <Footer />

            {/* PRINT STYLE */}
            <style>
                {`
          @media print {
            body * { visibility: hidden; }
            #print-area, #print-area * { visibility: visible; }
            #print-area {
              margin: 0;
              width: 100%;
              padding: 0;
            }
          }
        `}
            </style>
        </>
    );
};

/* Styles */
const chipStyle = {
    background: "#f6f6f6",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "14px",
    color: "#555",
};

const buttonStyleRed = {
    background: "#a51d34",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
};

const buttonStyleBlack = {
    background: "#333",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
};

export default BlogDetails;
