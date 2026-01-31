import React, { useState, useEffect, useRef } from "react";
import CourseEnquiryModal from "../components/EnrollModal";
import DemoRequestModal from "../models/DemoRequestModal";

const PREFIX = "Begin your Career with ";
const TYPE_SPEED = 80;
const HOLD_TIME = 5000;

const HeroPage = () => {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [displayPrefix, setDisplayPrefix] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFirstBannerLoop, setIsFirstBannerLoop] = useState(true);

  const typingRef = useRef(null);
  const holdRef = useRef(null);

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    fetch("https://api.techsterker.com/api/hero-banners")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length) {
          setBanners(data.data);
          setActiveIndex(0);
          setIsFirstBannerLoop(true);
        }
      })
      .catch(console.error);
  }, []);

  /* ---------- TYPEWRITER LOGIC ---------- */
  useEffect(() => {
    if (!banners.length) return;

    clearInterval(typingRef.current);
    clearTimeout(holdRef.current);

    const title = banners[activeIndex].title;
    let index = 0;

    setTypedTitle("");
    setIsTyping(true);

    // Determine what to type based on the banner index
    const shouldTypePrefix = activeIndex === 0 && isFirstBannerLoop;
    
    if (shouldTypePrefix) {
      // First banner in the first loop: type both PREFIX + Title
      setDisplayPrefix("");
      
      typingRef.current = setInterval(() => {
        index++;
        
        if (index <= PREFIX.length) {
          // Typing the PREFIX
          setDisplayPrefix(PREFIX.slice(0, index));
        } else if (index <= PREFIX.length + title.length) {
          // Typing the Title
          const titleIndex = index - PREFIX.length;
          setTypedTitle(title.slice(0, titleIndex));
        } else {
          // Finished typing
          clearInterval(typingRef.current);
          setIsTyping(false);
          
          holdRef.current = setTimeout(() => {
            const nextIndex = activeIndex === banners.length - 1 ? 0 : activeIndex + 1;
            setActiveIndex(nextIndex);
            if (nextIndex === 0) {
              setIsFirstBannerLoop(false);
            }
          }, HOLD_TIME);
        }
      }, TYPE_SPEED);
    } else {
      // Subsequent banners or subsequent loops: PREFIX stays static, only type Title
      setDisplayPrefix(PREFIX);
      
      typingRef.current = setInterval(() => {
        index++;
        
        if (index <= title.length) {
          setTypedTitle(title.slice(0, index));
        } else {
          clearInterval(typingRef.current);
          setIsTyping(false);
          
          holdRef.current = setTimeout(() => {
            const nextIndex = activeIndex === banners.length - 1 ? 0 : activeIndex + 1;
            setActiveIndex(nextIndex);
          }, HOLD_TIME);
        }
      }, TYPE_SPEED);
    }

    return () => {
      clearInterval(typingRef.current);
      clearTimeout(holdRef.current);
    };
  }, [activeIndex, banners, isFirstBannerLoop]);

  if (!banners.length) return null;
  const banner = banners[activeIndex];

  return (
    <section className="container relative min-h-[80vh] mt-10 px-4 sm:px-6 lg:px-16 flex items-center overflow-hidden">

      {/* WEB DESIGN BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* Large Circle */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border-[40px] border-red-100 opacity-65"></div>

        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border-[40px] border-red-100 opacity-65"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 grid-rows-12 w-full h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border-r border-b border-red-200"></div>
            ))}
          </div>
        </div>
        
        {/* Code Brackets */}
        <div className="absolute top-1/4 left-10 text-red-100 opacity-10 text-7xl font-mono transform -rotate-12">
          {'</>'}
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute bottom-1/4 right-20 w-64 h-64">
          <div className="absolute top-0 left-0 w-32 h-32 border-8 border-red-100 rounded-full opacity-65"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-8 border-red-200 rounded-full opacity-65"></div>
          {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-8 border-red-300 opacity-25 rotate-45"></div> */}
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-1/4 w-12 h-12 border-4 border-red-100 opacity-10 rounded-lg animate-float-slow"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 border-4 border-red-200 opacity-15 rounded-full animate-float-medium"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 border-4 border-red-300 opacity-20 rounded-lg animate-float-fast"></div>
        
        {/* Connection Lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg width="100%" height="100%" className="opacity-5">
            <path d="M0,100 Q300,50 400,200 T800,100" stroke="#a51d34" strokeWidth="2" fill="none" />
            <path d="M100,0 Q200,300 500,150 T900,300" stroke="#8B1E3F" strokeWidth="2" fill="none" />
            <path d="M50,300 Q400,100 700,250 T1200,50" stroke="#c53030" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>

      {/* FLEX CONTAINER - Reversed order for desktop */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-12 w-full">

        {/* TEXT SECTION - LEFT SIDE ON DESKTOP, BELOW IMAGE ON MOBILE */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="text-2xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            <span className="text-gray-900">{displayPrefix}</span>
            {/* Quotation marks added here */}
            {!isTyping && typedTitle.length > 0 && (
              <span className="text-gray-400 font-normal ml-1">❝</span>
            )}
            <span className="text-maroon font-extrabold">
              {typedTitle}
            </span>
            {/* Right quotation mark */}
            {!isTyping && typedTitle.length > 0 && (
              <span className="text-gray-400 font-normal ml-1">❞</span>
            )}
            
            {isTyping && (
              <span className="ml-1 animate-pulse text-red-500">|</span>
            )}
            
          </h1>

          <p className="text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8 text-sm sm:text-base md:text-lg leading-relaxed">
            {banner.content}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-center">
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-5 py-2 rounded-full bg-meroon text-white text-sm font-semibold hover:bg-red-700 transition"
            >
              Enquiry Now
            </button>

            <button
              onClick={() => setShowDemoModal(true)}
              className="px-5 py-2 rounded-full border border-gray-900 text-gray-900 text-sm font-semibold hover:bg-gray-900 hover:text-white transition"
            >
              Book a Demo
            </button>
          </div>
        </div>

        {/* IMAGE SECTION - RIGHT SIDE ON DESKTOP, TOP ON MOBILE */}
        <div className="w-full p-3 lg:w-1/2 flex justify-center order-first lg:order-last">
          <img
            key={banner.image}
            src={banner.image}
            alt={banner.title}
            className="w-full max-h-[550px] object-cover rounded-2xl animate-imageFade"
          />
        </div>

      </div>

      {/* MODALS */}
      <CourseEnquiryModal
        show={showEnquiryModal}
        handleClose={() => setShowEnquiryModal(false)}
      />
      <DemoRequestModal
        show={showDemoModal}
        handleClose={() => setShowDemoModal(false)}
      />

      {/* STYLES */}
      <style>{`
        .text-maroon {
          color: #8B1E3F;
        }
        
        .bg-meroon {
          background-color: #a51d34;
        }

        @keyframes imageFade {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-imageFade {
          animation: imageFade 0.7s ease-in-out;
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
        
        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(180deg);
          }
        }
        
        @keyframes float-fast {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.1);
          }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroPage;