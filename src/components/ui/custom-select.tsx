"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
}

export function CustomSelect({ name, options, defaultValue, placeholder = "Select..." }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || options[0]?.value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden input to pass value in FormData */}
      <input type="hidden" name={name} value={selectedValue} />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full bg-black/40 border rounded-xl px-4 py-3 text-sm font-medium transition-all shadow-inner ${
          isOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/10 hover:border-white/20'
        }`}
      >
        <span className={selectedOption ? "text-foreground" : "text-muted"}>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-1 bg-surface-elevated/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <button
                key={opt.value}
                type="button"
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                  isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                }`}
                onClick={() => {
                  setSelectedValue(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
