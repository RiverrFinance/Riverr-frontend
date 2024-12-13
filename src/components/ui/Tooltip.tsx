"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className="
      z-50 
      overflow-hidden 
      rounded-lg 
      bg-[#1C1C28] 
      px-3 
      py-1.5 
      text-xs
      font-normal
      text-white
      shadow-md
      border
      border-blue-500/20
      backdrop-blur-sm
      animate-in 
      fade-in-50 
      data-[side=bottom]:slide-in-from-top-2 
      data-[side=left]:slide-in-from-right-2 
      data-[side=right]:slide-in-from-left-2 
      data-[side=top]:slide-in-from-bottom-2
      select-none
    "
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }