import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectWalletButton } from './ConnectWalletButton';
import {
  SidebarPusher,
  SidebarPushable,
  MenuItem,
  GridRow,
  GridColumn,
  Button,
  Checkbox,
  Grid,
  Header,
  Icon,
  Image,
  Menu,
  Segment,
  Sidebar,
} from "semantic-ui-react";



  // Navigation links configuration
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/trade', label: 'Trade' },
    { path: '/earn', label: 'Earn' },
    { path: '/support', label: 'Support' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

export const NavBar = () => {


  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Helper function to determine if link is active
  const isActiveLink = (path: string): string => {
    return location.pathname === path ? 'text-blue-500 font-medium text-sm' : 'text-gray-400 hover:text-white transition-colors duration-200 text-sm';
  };

const HorizontalSidebar = ({ animation, direction, visible }: { animation: string, direction: string, visible: boolean }) => ( 
  <Sidebar
    as={Segment}
    animation={animation as "overlay" | "push" | "scale down" | "uncover" | "slide out" | "slide along"}
    direction={direction as "left" | "bottom" | "top" | "right"}
    visible={visible}
  >
    <Grid textAlign="center">
      <GridRow columns={1}>
        <GridColumn>
          {/* <Header as="h3">New Content Awaits</Header> */}
          <Header>
          {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${isActiveLink(link.path)} py-2`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}            
          </Header>

        </GridColumn>
      </GridRow>
      <GridRow columns={3}>
        <GridColumn>
          <Image src="https://react.semantic-ui.com/images/wireframe/media-paragraph.png" />
        </GridColumn>
        <GridColumn>
          <Image src="https://react.semantic-ui.com/images/wireframe/media-paragraph.png" />
        </GridColumn>
        <GridColumn>
          <Image src="https://react.semantic-ui.com/images/wireframe/media-paragraph.png" />
        </GridColumn>
      </GridRow>
    </Grid>
  </Sidebar>
);

function exampleReducer(state: any, action: any) {
  switch (action.type) {
    case "CHANGE_ANIMATION":
      return { ...state, animation: action.animation, visible: !state.visible };
    case "CHANGE_DIMMED":
      return { ...state, dimmed: action.dimmed };
    case "CHANGE_DIRECTION":
      return { ...state, direction: action.direction, visible: false };
    default:
      throw new Error();
  }
}


  
  const [state, dispatch] = React.useReducer(exampleReducer, {
    animation: "overlay",
    direction: "left",
    dimmed: false,
    visible: false,
  });

  const { animation, dimmed, direction, visible } = state;
  const vertical = direction === "bottom" || direction === "top";

  return (

    <div>
          <nav className="bg-[#13131F] text-white px-4 md:px-6 py-4 border-b border-gray-800 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-4 md:space-x-12">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">Q</span>
              <span className="text-lg hidden sm:inline">UOTEX</span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={isActiveLink(link.path)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Buttons and Icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden sm:block">
              <ConnectWalletButton />
            </div>
            
            {/* Language Globe Icon */}
            <button 
              title="Language" 
              type="button" 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </button>

            {/* Notification Bell Icon */}
            <button 
              title="Notifications" 
              type="button" 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 relative"
            >
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button 
              type="button"
              title="Mobile Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full mt-2 bg-[#13131F] border border-gray-800 rounded-lg shadow-lg z-50">
            {/* Drag handle with padding */}
            <div className="w-full flex justify-center p-3 border-b border-gray-800">
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Navigation links with increased padding */}
            <div className="flex flex-col space-y-2 px-6 py-4 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${isActiveLink(link.path)} py-3 text-xs`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="py-3">
                <ConnectWalletButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    
      <Checkbox
        checked={dimmed}
        label="Dim Page"
        onChange={(e, { checked }) =>
          dispatch({ type: "CHANGE_DIMMED", dimmed: checked })
        }
        toggle
      />

      <Button
        active={direction === "top"}
        onClick={() =>
          dispatch({ type: "CHANGE_DIRECTION", direction: "top" })
        }
      >
        Top
      </Button>
      <Button
        onClick={() =>
          dispatch({ type: "CHANGE_ANIMATION", animation: "scale down" })
        }
      >
        Scale Down
      </Button>
    </div>
  );
};
