import React from "react";
import { FaShareAlt } from "react-icons/fa";
import Header from "../Header/Header";
import Footer from "./Footer";
import blogData from "./BlogData";
import { useNavigate } from "react-router-dom";

const BlogPage = () => {
  const navigate = useNavigate();



  // SHARE
  const handleShare = async (slug) => {
  const blog = blogData.find((item) => item.slug === slug);

  // create blog detail URL dynamically
  const shareUrl = `${window.location.origin}/blog/${slug}`;

  const shareData = {
    title: blog.title,
    text: blog.description,
    url: shareUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error("Share canceled", err);
    }
  } else {
    navigator.clipboard.writeText(shareUrl);
    alert("Blog link copied to clipboard!");
  }
};


  return (
    <>
      <Header />

      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "120px 24px 60px",
          fontFamily: "Roboto",
        }}
      >
        {/* Heading */}
        <div className="text-left mb-12">
          <h1 className="font-bold text-4xl text-black">
            Our Latest{" "}
            <span style={{ color: "#a51d34" }}>Blogs</span>
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            Stay updated with the latest trends, insights & knowledge.
          </p>
        </div>

        {/* Blog Grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "30px",
            justifyContent: "space-between",
          }}
        >
          {blogData.map((blog, index) => (
            <div
              key={index}
              style={{
                width: "387px",
                height: "430px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              className="blog-card"
            >
              {/* Image with hover zoom effect */}
              <div style={{ overflow: "hidden" }}>
                <img
                  src={blog.image}
                  alt="Blog"
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                  className="blog-image"
                />
              </div>

              <div style={{ padding: "18px", paddingBottom: "60px" }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "10px",
                    color: "#222",
                  }}
                >
                  {blog.title}
                </h2>

                <p
                  style={{
                    fontSize: "15px",
                    color: "#555",
                    lineHeight: "1.6",
                    marginBottom: "16px",
                  }}
                >
                  {blog.description.length > 120
                    ? blog.description.slice(0, 120) + "..."
                    : blog.description}
                </p>

                {/* Read More button */}
                <button
                  style={{
                    backgroundColor: "#a51d34",
                    color: "white",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                  onClick={() => navigate(`/blog/${blog.slug}`)}

                >
                  Read More
                </button>
              </div>

              {/* Share Icon */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "20px",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
                title="Share this blog"
                onClick={()=>handleShare(blog.slug)}
              >
                <FaShareAlt style={{ color: "#a51d34" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />

      {/* Hover Animation Styles */}
      <style>{`
        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0px 12px 20px rgba(0,0,0,0.15);
        }
        .blog-card:hover .blog-image {
          transform: scale(1.06);
        }
      `}</style>
    </>
  );
};

export default BlogPage;
