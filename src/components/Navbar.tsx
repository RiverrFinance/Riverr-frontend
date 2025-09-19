import React, { useState, useRef, MouseEvent } from "react";
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
  Globe,
  Bell,
  Bitcoin,
} from "lucide-react";

import LogoImg from "../images/Logo.svg";
import { GlowingEffect } from "./Glowing-effect";
import { GradientBackgroundForward } from "./GradientBackground";
import { CustomConnectButton, CustomConnectedButton } from "./CustomConnectButton";

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
    {
    path: "/bitcoin_integration",
    label: "Bitcoin",
    icon: <Bitcoin className="w-4 h-4" />,
  },
];

export interface NavbarProps {
  isMobile: boolean;
  isCheckIfMobileIs480: boolean;
  visible?: boolean;
  setVisible?: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isMobile, isCheckIfMobileIs480, visible: visibleProp, setVisible: setVisibleProp }) => {
  const { user, disconnect } = useAuth();
  const [internalVisible, setInternalVisible] = useState(false);
  const visible = visibleProp ?? internalVisible;
  const setVisible = setVisibleProp ?? setInternalVisible;
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
        <img src={LogoImg} className=" w-14" alt="" />
      </span>
      <span className="text-lg hidden sm:inline tracking-wider">RIVERR</span>
    </Link>
  );

  const IconContent = () => (
    <>
      {/* Language Globe Icon */}
      {/* <IconButton title="" className="" onClick={() => {}}>
        <Globe className="w-4 h-4" />
      </IconButton> */}

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
        <div className="glass rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
          <ConnectWallet
            connectButtonComponent={CustomConnectButton}
            connectedButtonComponent={(props: {connectedAccount?: string; onClick?:(e:MouseEvent<HTMLButtonElement>) => void }) => (
              <CustomConnectedButton
                {...props}
                connectedAccount={user.principal.toString()}
                onDisconnect={() => {
                  try {
                    disconnect?.();
                  } catch (e) {
                    // noop
                  }
                }}
              />
            )}
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
    <>
      <div className="h-28 fixed top-0 left-0 right-0 z-50 rounded-b-2xl">
        <div className="glass rounded-2xl relative">
          <GradientBackgroundForward />
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
                    className="w-10 h-10 flex items-center justify-center !rounded-xl transition-all duration-300 hover:!shadow-[0_3px_0_0_#0300AD] glass border border-white/10"
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
                          className={`${isActiveLink(link.path)} py-2 px-4 rounded-xl transition-all duration-300 relative group`}
                        >
                          {link.label}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0300ad50] to-[#8655f744] transition-all duration-300 group-hover:w-full rounded-sm"></span>
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
                className={`absolute top-[90%] left-0 right-0 w-full rounded-b-xl border border-white/10 bg-[#0A1022] px-0 md:px-6 py-4 overflow-hidden transition-all duration-300 ease-in-out origin-top select-none z-50 ${
                  visible ? "max-h-fit opacity-100" : "max-h-0 opacity-0"
                }`}
                style={{
                  transform: isDragging
                    ? `translate(${offsetX}px, ${offsetY}px)`
                    : undefined,
                  touchAction: "none",
                  userSelect: "none",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
              >
                {/* Drawer Handle */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full flex justify-center p-4 border-b border-white/10">
                    <div className="w-12 h-1 bg-white/30 rounded-full pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-white/50 transition-colors" />
                  </div>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-white/30 transition-colors" />
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-transparent pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-white/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-white/30 transition-colors" />
                </div>

                <div>
                  <div className="pt-12">
                    <div className="items-start">
                      <div className="px-16 pb-8 pt-4 space-y-4">
                        {navLinks.map((link) => (
                          <Menu.Item
                            as="div"
                            key={link.path}
                            className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 text-sm font-medium glass border-2 ${
                              location.pathname === link.path
                                ? "border-[#0300AD] bg-[#0300ad18]"
                                : "border-transparent hover:bg-white/5 hover:border-white/20"
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
    </>
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
    className={`group relative p-2 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD] bg-transparent hover:bg-white/5 hover:border hover:border-white/20 ${className}`}
    onClick={onClick}
  >
    {/* Content */}
    <span>{title}</span>
    <div className="relative z-10">{children}</div>
  </button>
);