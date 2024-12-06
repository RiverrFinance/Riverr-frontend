import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Menu } from 'semantic-ui-react';

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    if ('touches' in e) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(e.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = currentY - startY;
    
    if (diff > 0) { // Only allow dragging downwards
      setOffsetY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offsetY > 50) { // If dragged more than 50px, close the drawer
      setVisible(false);
    }
    setOffsetY(0);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setVisible(false);
    }
  };

  const HeaderContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
        <Icon name="question circle" size="large" inverted />
        <span className="text-white text-xl font-bold ml-1">UOTEX</span>
      </div>

      {/* Right side with actions */}
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Connect wallet
        </button>
        <Icon name="globe" inverted style={{ cursor: 'pointer' }} />
        <Icon name="bell outline" inverted style={{ cursor: 'pointer' }} />
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
          <Icon name="user" inverted />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#13131F]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between p-4 bg-[#1C1C28]">
          {isMobile ? (
            <div className="container mx-auto flex items-center justify-between">
              <HeaderContent />
              <div className="relative w-6 h-3 cursor-pointer" onClick={() => setVisible(!visible)}>
                {/* Top bar */}
                <div className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                  visible 
                    ? 'top-1/2 -translate-y-1/2 rotate-45' 
                    : 'top-0'
                }`} />
                
                {/* Bottom bar */}
                <div className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                  visible 
                    ? 'top-1/2 -translate-y-1/2 -rotate-45' 
                    : 'bottom-0'
                }`} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-8">
                <HeaderContent />
                
                {/* Primary Navigation */}
                <div className="flex space-x-6">
                  <span className="text-blue-500 cursor-pointer hover:text-blue-400" onClick={() => handleNavigation('/trade')}>
                    Trade
                  </span>
                  <span className="text-gray-400 cursor-pointer hover:text-white" onClick={() => handleNavigation('/markets')}>
                    Markets
                  </span>
                  <span className="text-gray-400 cursor-pointer hover:text-white" onClick={() => handleNavigation('/leaderboard')}>
                    Leaderboard
                  </span>
                  <span className="text-gray-400 cursor-pointer hover:text-white" onClick={() => handleNavigation('/support')}>
                    Support
                  </span>
                  <span className="text-gray-400 cursor-pointer hover:text-white" onClick={() => handleNavigation('/doc')}>
                    Doc
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Drawer */}
        {isMobile && (
          <div 
            ref={drawerRef}
            className={`absolute top-full left-0 right-0 w-full bg-[#1C1C28] overflow-hidden transition-all duration-300 ease-in-out origin-top ${
              visible 
                ? 'max-h-[400px] opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
            style={{
              transform: isDragging ? `translateY(${offsetY}px)` : undefined
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
            <div className="w-full flex justify-center p-4 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors" />
            </div>

            <div className="px-16 pb-8 space-y-4">
              <Menu.Item as="div" className="block py-3 text-lg text-white hover:text-blue-400 cursor-pointer" onClick={() => handleNavigation('/')}>
                <Icon name="home" className="mr-4" />
                Dashboard
              </Menu.Item>
              <Menu.Item as="div" className="block py-3 text-lg text-white hover:text-blue-400 cursor-pointer" onClick={() => handleNavigation('/trade')}>
                <Icon name="chart line" className="mr-4" />
                Trade
              </Menu.Item>
              <Menu.Item as="div" className="block py-3 text-lg text-white hover:text-blue-400 cursor-pointer" onClick={() => handleNavigation('/markets')}>
                <Icon name="globe" className="mr-4" />
                Markets
              </Menu.Item>
              <Menu.Item as="div" className="block py-3 text-lg text-white hover:text-blue-400 cursor-pointer" onClick={() => handleNavigation('/leaderboard')}>
                <Icon name="trophy" className="mr-4" />
                Leaderboard
              </Menu.Item>
              <Menu.Item as="div" className="block py-3 text-lg text-white hover:text-blue-400 cursor-pointer" onClick={() => handleNavigation('/support')}>
                <Icon name="help circle" className="mr-4" />
                Support
              </Menu.Item>
              <Menu.Item as="div" className="block py-3 text-lg text-white hover:text-blue-400 cursor-pointer" onClick={() => handleNavigation('/doc')}>
                <Icon name="book" className="mr-4" />
                Doc
              </Menu.Item>
            </div>
          </div>
        )}
      </div>

      {/* Main Content with Scale Animation */}
      <div 
        className={`pt-20 transition-all duration-300 ease-in-out ${
          visible && isMobile 
            ? 'transform scale-95 opacity-50' 
            : 'transform scale-100 opacity-100'
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