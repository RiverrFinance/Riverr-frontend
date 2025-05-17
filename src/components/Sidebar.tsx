import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import {
  ConnectWallet,
  ConnectWalletButton,
  ConnectedWalletButton,
  ConnectWalletDropdownMenu,
  useAuth,
} from "@nfid/identitykit/react";
import {
  Home,
  BarChart2,
  PiggyBank,
  HelpCircle,
  Trophy,
  Globe,
  Bell,
} from "lucide-react";

import LogoImg from "../images/Logo.png";
import { BackgroundBeams } from "./Background-beams";
import { GlowingEffect } from "./Glowing-effect";

// Navigation links configuration
const navLinks = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <Home className="w-4 h-4" />,
  },
  {
    path: "/trade",
    label: "Trade",
    icon: <BarChart2 className="w-4 h-4" />,
  },
  {
    path: "/earn",
    label: "Earn",
    icon: <PiggyBank className="w-4 h-4" />,
  },
];

export interface Props {
  children: React.ReactNode;
}

export const Sidebar: React.FC<Props> = ({ children }: Props) => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCheckIfMobileIs480, setIsCheckIfMobileIs480] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
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

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active link styling
  const isActiveLink = (path: string): string => {
    const isActive =
      path === "/dashboard"
        ? ["/", "/dashboard"].includes(location.pathname)
        : location.pathname === path;
    return isActive ? "text-white" : "text-gray-400 hover:text-white";
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    if ("touches" in e) {
      setStartY(e.touches[0].clientY);
      setStartX(e.touches[0].clientX);
    } else {
      setStartY(e.clientY);
      setStartX(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;

    const currentY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const currentX = "touches" in e ? e.touches[0].clientX : e.clientX;

    const diffY = currentY - startY;
    const diffX = currentX - startX;

    if (diffY > 0) {
      // Dragging downwards
      setOffsetY(diffY);
    }
    if (Math.abs(diffX) > 0) {
      // Horizontal dragging
      setOffsetX(diffX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offsetY > 50 || Math.abs(offsetX) > 100) {
      // Close if dragged down or sideways enough
      setVisible(false);
    }
    setOffsetY(0);
    setOffsetX(0);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setVisible(false);
    }
  };

  // Logo component
  const Logo = () => (
    <Link
      to="/"
      className="logo flex items-center gap-3 p-0 md:pl-5 text-white"
    >
      <span className="text-5xl font-bold bg-gradient-to-r from-white to-white bg-clip-text text-transparent text-white">
        <img src={LogoImg} alt="" />
      </span>
      <span className="text-lg hidden sm:inline tracking-wider">QUOTEX</span>
    </Link>
  );

  const IconContent = () => (
    <>
      {/* Language Globe Icon */}
      <IconButton title="" className="" onClick={() => {}}>
        <Globe className="w-4 h-4" />
      </IconButton>

      {/* Notification Bell Icon */}
      <IconButton title="" className="" onClick={() => {}}>
        <div className="relative">
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          <Bell className="w-4 h-4" />
        </div>
      </IconButton>
    </>
  );

  // Navbar content component
  const NavBarContent = () => (
    <>
      {/* Right side with actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="bg-[#0300AD] hover:bg-[#02007a] rounded-md flex justify-items-center items-center gap-2 px-5">
          <ConnectWallet
            connectButtonComponent={ConnectWalletButton}
            connectedButtonComponent={
              // ConnectedWalletButton
              () => {
                return ConnectedWalletButton({
                  connectedAccount: `${user.principal.toString()}`,
                });
              }
            }
            dropdownMenuComponent={ConnectWalletDropdownMenu}
          />
        </div>

        {!isCheckIfMobileIs480 && (
          <div className="flex gap-2 items-center">
            <IconContent />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen h-full w-full overflow-x-hidden bg-[#000000] text-white pt-10 pb-5 space-y-28">
      <BackgroundBeams className="opacity-70" />
      <div className="">
        {/* Navbar */}
        <div
          className={` h-28 fixed top-0 left-0 right-0 z-50 rounded-b-2xl  ${
            isScrolled ? "backdrop-blur-0 bg-none" : "bg-transparent backdrop-blur-3xl "
          }`}
        >
          <div
            className={`bg-[#18191d] border-2 border-opacity-40 border-dashed border-[#363c52] ${
              isScrolled ? "top-0" : "top-5"
            } left-0 right-0 rounded-b-2xl z-50 relative `}
          >
            <GlowingEffect
              spread={2}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <div>
              <div className="flex items-center justify-between p-6">
                {/* Mobile Navbar view */}
                {isMobile ? (
                  <div className="container mx-auto flex items-center justify-between">
                    <Logo />
                    <NavBarContent />

                    {/* Mobile Menu Button */}
                    <IconButton
                      className="w-10 h-10 flex items-center justify-center !rounded-lg transition-all duration-300 hover:!shadow-[0_3px_0_0_#0300AD]"
                      onClick={() => setVisible(!visible)}
                      title=""
                    >
                      <div className="relative w-6 h-3 cursor-pointer">
                        {/* Top bar */}
                        <div
                          className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                            visible
                              ? "top-1/2 -translate-y-1/2 rotate-45"
                              : "top-0"
                          }`}
                        />

                        {/* Bottom bar */}
                        <div
                          className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                            visible
                              ? "top-1/2 -translate-y-1/2 -rotate-45"
                              : "bottom-0"
                          }`}
                        />
                      </div>
                    </IconButton>
                  </div>
                ) : (
                  // Desktop Navbar view
                  <div className="w-full">
                    <div className="flex items-center justify-between space-x-10">
                      <Logo />
                      {/* Primary Navigation */}
                      <div className="flex items-center space-x-10">
                        {navLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            className={`${isActiveLink(link.path)} py-2`}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>

                      <NavBarContent />
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Drawer */}
              {isMobile && (
                <div
                  ref={drawerRef}
                  className={`absolute top-[90%] left-0 right-0 w-full bg-[#18191D] px-0 md:px-6 py-4 border border-[#18191de9] rounded-b-lg overflow-hidden transition-all duration-300 ease-in-out origin-top select-none ${
                    visible ? "max-h-fit opacity-100" : "max-h-0 opacity-0"
                  }`}
                  style={{
                    transform: isDragging
                      ? `translate(${offsetX}px, ${offsetY}px)`
                      : undefined,
                    touchAction: "none", // Prevents default touch behaviors
                    userSelect: "none", // Prevents text selection
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleTouchStart}
                  onMouseMove={handleTouchMove}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                >
                  {/* Drawer Handle - add handles on all sides */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full flex justify-center p-4 border-b border-gray-800">
                      <div className="w-12 h-1 bg-gray-600 rounded-full pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-gray-500 transition-colors" />
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-gray-500 transition-colors" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-transparent pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-gray-500 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-gray-500 transition-colors" />
                  </div>

                  <div>
                    <div className="pt-12">
                      <div className="items-start">
                        <div className="px-16 pb-8 pt-4 space-y-4 bg-[#18191de9]">
                          {navLinks.map((link) => (
                            <Menu.Item
                              as="div"
                              key={link.path}
                              className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 text-sm font-medium ${
                                location.pathname === link.path
                                  ? "bg-[#0300ad18] border-2 border-[#0300AD] border-dashed"
                                  : "border-2 border-transparent hover:bg-[#0300ad18]"
                              }`}
                              onClick={() => handleNavigation(link.path)}
                            >
                              {link.icon}
                              <span className={isActiveLink(link.path)}>
                                {link.label}
                              </span>
                            </Menu.Item>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        {isCheckIfMobileIs480 && (
                          <div className="flex gap-5">
                            <IconContent />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content with Scale Animation */}
        <div
          className={`md:mx-6 mx-4 transition-all duration-300 ease-in-out z-20 ${
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

export const IconButton = ({
  children,
  title,
  className,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  className: string;
  onClick: () => void;
}) => (
  <button
    title={title}
    type="button"
    className={`group relative p-2 rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_0_0_#0300AD] bg-transparent hover:border-t hover:border-b hover:border-blue-400/50 ${className}`}
    onClick={onClick}
  >
    {/* Content */}
    <span>{title}</span>
    <div className="relative z-10">{children}</div>
  </button>
);
