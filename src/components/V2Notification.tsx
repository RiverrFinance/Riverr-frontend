import React, { useState } from 'react';
import { AlertTriangle, X, Sparkles, Zap } from 'lucide-react';

interface UpgradeNotificationProps {
  isVisible?: boolean;
  onDismiss?: () => void;
}

export const UpgradeNotification: React.FC<UpgradeNotificationProps> = ({
  isVisible = true,
  onDismiss,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  const message = "Version 2.0 coming soon! Due to upgrades in progress, some functions may be temporarily unavailable.";

  return (
    <div className="lg:relative absolute -top-7 left-0 lg:w-full w-full overflow-hidden bg-gradient-to-r from-[#c7a835] via-[#ad612b] to-[#ab4242] shadow-lg z-50">

      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-8 w-8 h-8 bg-white rounded-full animate-bounce animation-delay-300"></div>
        <div className="absolute -bottom-2 left-1/3 w-16 h-16 bg-white rounded-full animate-pulse animation-delay-700"></div>
      </div>
      
      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">

            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 bg-white rounded-full opacity-30 animate-ping"></div>
              <div className="relative bg-white rounded-full p-2 shadow-lg">
                <AlertTriangle 
                  className="h-5 w-5 text-orange-600 animate-pulse" 
                  aria-hidden="true" 
                />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="h-4 w-4 text-white animate-spin" />
                <span className="text-white font-bold text-sm uppercase tracking-wide">System Upgrade</span>
                <Zap className="h-4 w-4 text-yellow-200 animate-bounce" />
              </div>
              <p className="text-white font-extralight uppercase lg:text-base text-xs leading-relaxed drop-shadow-sm">
                {message}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleDismiss}
            className="ml-4 group relative inline-flex items-center justify-center w-8 h-8  rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4 text-white group-hover:text-gray-100 transition-colors duration-200" />
            <div className="absolute inset-0 rounded-full transition-opacity duration-200"></div>
          </button>
        </div>
      </div>
      
      <div className="h-1 bg-gradient-to-r from-yellow-300 via-red-300 to-red-300">
        <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse opacity-60"></div>
      </div>
    </div>
  );
};
