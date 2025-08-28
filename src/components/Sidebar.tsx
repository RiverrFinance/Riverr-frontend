import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BackgroundBeams } from "./Background-beams";
import { Navbar } from "./Navbar";

export interface Props {
  children: React.ReactNode;
}

export const Sidebar: React.FC<Props> = ({ children }: Props) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCheckIfMobileIs480, setIsCheckIfMobileIs480] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 1000);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    const mobileIs480 = () => setIsCheckIfMobileIs480(window.innerWidth <= 480);
    mobileIs480();
    window.addEventListener("resize", mobileIs480);

    // Redirect to dashboard if on root path
    if (location.pathname === "/") navigate("/dashboard");

    return () => {
      window.removeEventListener("resize", checkIfMobile);
      window.removeEventListener("resize", mobileIs480);
    };
  }, [location.pathname, navigate]);

  // Update visible state based on mobile menu
  useEffect(() => {
    if (!isMobile) {
      setVisible(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen h-full w-full overflow-x-hidden text-white pt-10 pb-5 space-y-24">
      {/* <BackgroundBeams className="opacity-70" /> */}
      <div className="">
        {/* Navbar Component */}
        <Navbar
          isMobile={isMobile}
          isCheckIfMobileIs480={isCheckIfMobileIs480}
          visible={visible}
          setVisible={setVisible}
        />

        {/* Main Content with Scale Animation */}
        <div
          className={`md:mx-6 mx-1 mt-20 transition-all duration-300 ease-in-out z-20 ${
            visible && isMobile
              ? "transform scale-90 opacity-50"
              : "transform scale-100 opacity-100"
          }`}
        >
          {children}
        </div>

        {/* Overlay */}
        {isMobile && visible && (
          <div
            className="fixed inset-0 bg-black transition-opacity duration-300 ease-in-out opacity-50 z-40"
            onClick={() => setVisible(false)}
          />
        )}
      </div>
    </div>
  );
};
