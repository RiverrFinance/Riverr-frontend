import { Icon } from "semantic-ui-react";

export const ConnectWalletButton = () => {
  return (
    <button 
      type='button' 
      className="group relative px-3 sm:px-5 py-3 rounded-3xl flex items-center gap-2 text-lg w-full sm:w-auto justify-center overflow-hidden backdrop-blur-sm transition-all duration-300 hover:rounded-[28px_8px_28px_8px] origin-bottom-right border border-blue-500 hover:shadow-[-4px_4px_0_0_rgba(0,0,0,1)]"
    >
      {/* Glass background with hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-blue-900/50 backdrop-blur-md transition-transform duration-300 group-hover:scale-[1.6] group-hover:rotate-[-10deg]" />
      
      {/* Content */}
      <div className="relative flex items-center gap-2 z-10 pl-2">
        <Icon name="credit card outline" className="text-blue-100 text-md" /> 
        <span className="text-blue-100">Connect Wallet</span>
      </div>

      {/* Gradient border with glass effect */}
      <div className="absolute inset-0 rounded-3xl group-hover:rounded-[28px_8px_28px_8px] transition-all duration-300 p-[1px] bg-gradient-to-r from-blue-500/20 via-blue-400/40 to-blue-500/20">
        <div className="h-full w-full rounded-3xl group-hover:rounded-[28px_8px_28px_8px] transition-all duration-300 bg-black/40 backdrop-blur-xl" />
      </div>
    </button>
  );
}; 