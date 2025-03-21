import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Icon, Menu } from "semantic-ui-react";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { Identity } from "@dfinity/agent";

// Navigation links configuration
const navLinks = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <Icon name="home" className="mr-4" />,
  },
  {
    path: "/trade",
    label: "Trade",
    icon: <Icon name="chart line" className="mr-4" />,
  },
  {
    path: "/earn",
    label: "Earn",
    icon: <Icon name="money" className="mr-4" />,
  },
  {
    path: "/support",
    label: "Support",
    icon: <Icon name="help circle" className="mr-4" />,
  },
  {
    path: "/leaderboard",
    label: "Leaderboard",
    icon: <Icon name="trophy" className="mr-4" />,
  },
];

interface Props {
  Identity: Identity | null;
  setIdentity: (id: Identity) => void;
}

export const Sidebar: React.FC<Props> = ({ Identity, setIdentity }: Props) => {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

    // Redirect to dashboard if on root path
    if (location.pathname === "/") navigate("/dashboard");

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Active link styling
  const isActiveLink = (path: string): string => {
    const isActive =
      path === "/dashboard"
        ? ["/", "/dashboard"].includes(location.pathname)
        : location.pathname === path;
    return isActive
      ? "text-blue-500 font-medium text-md border border-blue-500 rounded-2xl px-4 py-1 transition-all duration-200"
      : "text-gray-400 hover:text-white transition-colors duration-200 text-md";
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
    <Link to="/" className="logo flex items-center space-x-1 p-0 md:pl-5">
      <span className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
        Q
      </span>
      <span className="text-lg hidden sm:inline tracking-wider">UOTEX</span>
    </Link>
  );

  // Header content component
  const HeaderContent = () => (
    <>
      {/* Right side with actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="block">
          <ConnectWalletButton
            isConnected={true}
            Identity={Identity}
            setIdentity={setIdentity}
          />
        </div>

        {/* Language Globe Icon */}
        <IconButton title="Language">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        </IconButton>

        {/* Notification Bell Icon */}
        <IconButton title="Notifications">
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        </IconButton>
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#13131F] text-white px-0 md:px-6 py-10 ">
      {/* Header */}
      <div className="bg-[#13131ffb] fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          {/* Mobile Header view */}
          {isMobile ? (
            <div className="container mx-auto flex items-center justify-between">
              <Logo />
              <HeaderContent />

              {/* Mobile Menu Button */}
              <div
                className="w-10 h-10 flex items-center justify-center p-2  hover:-translate-y-1 hover:shadow-[0_4px_0_0_rgba(30,58,138,0.8)] bg-transparent rounded-lg transition-all duration-300 hover:border-t hover:border-b hover:border-blue-400/50"
                onClick={() => setVisible(!visible)}
              >
                <div className="relative w-6 h-3 cursor-pointer">
                  {/* Top bar */}
                  <div
                    className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                      visible ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
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
              </div>
            </div>
          ) : (
            // Desktop Header view
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

                <HeaderContent />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Drawer */}
        {isMobile && (
          <div
            ref={drawerRef}
            className={`absolute top-full left-0 right-0 w-full bg-[#13131f] px-0 md:px-6 py-4 border border-gray-800 rounded-b-lg overflow-hidden transition-all duration-300 ease-in-out origin-top select-none ${
              visible ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
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

            <div className="px-16 pb-8 pt-12 space-y-4">
              {navLinks.map((link) => (
                <Menu.Item
                  as="div"
                  key={link.path}
                  className={`${isActiveLink(
                    link.path
                  )} block py-3 text-lg text-white-100 hover:text-blue-00 cursor-pointer`}
                  onClick={() => handleNavigation(link.path)}
                >
                  {link.icon}
                  {link.label}
                </Menu.Item>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content with Scale Animation */}
      <div
        className={`pt-20 transition-all duration-300 ease-in-out ${
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
  );
};

const IconButton = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    title={title}
    type="button"
    className="group relative p-2 rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[0_4px_0_0_rgba(30,58,138,0.8)] bg-transparent hover:border-t hover:border-b hover:border-blue-400/50"
  >
    {/* Content */}
    <div className="relative z-10">{children}</div>
  </button>
);
