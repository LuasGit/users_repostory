"use client"

import { Film } from "lucide-react"

interface CinenovaLogoProps {
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
}

export function CinenovaLogo({ size = "md", showIcon = true }: CinenovaLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl"
  }

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40
  }

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <Film 
          size={iconSizes[size]} 
          className="text-[#DC2626]" 
          strokeWidth={2.5}
        />
      )}
      <span className={`font-bold tracking-tight ${sizeClasses[size]}`}>
        <span className="text-[#F9FAFB]">CINE</span>
        <span className="text-[#DC2626]">NOVA</span>
      </span>
    </div>
  )
}
