"use client"

import { useState } from "react"
import { Check } from "lucide-react"

export function RecaptchaWidget() {
  const [checked, setChecked] = useState(false)

  return (
    <div className="flex items-center gap-3 p-3 bg-[#1F2937] border border-[#374151] rounded-md w-full max-w-[300px]">
      <button
        type="button"
        onClick={() => setChecked(!checked)}
        className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${
          checked 
            ? "bg-[#DC2626] border-[#DC2626]" 
            : "border-[#9CA3AF] hover:border-[#F9FAFB]"
        }`}
      >
        {checked && <Check size={14} className="text-[#F9FAFB]" />}
      </button>
      <span className="text-[#9CA3AF] text-sm">No soy un robot</span>
      <div className="ml-auto flex flex-col items-center">
        <svg className="w-8 h-8" viewBox="0 0 64 64">
          <path fill="#1C3AA9" d="M32 0L0 32l32 32 32-32z"/>
          <path fill="#4285F4" d="M32 8L8 32l24 24 24-24z"/>
          <path fill="#ABABAB" d="M32 16l-16 16 16 16 16-16z"/>
        </svg>
        <span className="text-[8px] text-[#9CA3AF] mt-0.5">reCAPTCHA</span>
      </div>
    </div>
  )
}
