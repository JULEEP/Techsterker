import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";

const PopupBanner = () => {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") return;

    // Show once per visit
    // const shown = sessionStorage.getItem("popupShown");
    // if (shown) return;

    const fetchPopup = async () => {
      try {
        const res = await axios.get(
          "https://api.techsterker.com/api/admin/all"
        );

        if (res.data.success) {
          const activePopup = res.data.data.find(p => p.isActive);
          if (!activePopup) return;

          setPopup(activePopup);
          setVisible(true);
          //sessionStorage.setItem("popupShown", "true");

          // Auto close after 5 sec
          setTimeout(() => setVisible(false), 5000);
        }
      } catch (err) {
        console.error("Popup error:", err);
      }
    };

    fetchPopup();
  }, [location.pathname]);

  if (!popup || !visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-3 sm:px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-popup">

        {/* Close Button (Touch Friendly) */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 
                     bg-white/90 hover:bg-white 
                     rounded-full p-2 
                     shadow-md transition"
        >
          <X size={18} />
        </button>

        {/* Image */}
        <img
          src={`https://api.techsterker.com${popup.image}`}
          alt="Popup Banner"
          className="w-full h-auto max-h-[80vh] object-contain sm:object-cover"
        />
      </div>

      {/* Animation */}
      <style>
        {`
          @keyframes popup {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-popup {
            animation: popup 0.35s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default PopupBanner;