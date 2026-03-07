import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";

interface Option {
    value: string;
    label: string | React.ReactNode;
    icon?: React.ElementType;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ElementType;
    className?: string;
    label?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    icon: Icon,
    className = "",
    label
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-11 flex items-center justify-between px-4 py-2 border rounded-xl text-sm transition-all duration-300 glass hover:bg-white/5"
                style={{
                    borderColor: isOpen ? 'var(--accent-primary)' : 'var(--border-primary)',
                    color: 'var(--text-primary)'
                }}
            >
                <div className="flex items-center gap-3 truncate">
                    {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                    <span className={selectedOption ? "text-primary" : "text-muted"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="absolute z-50 w-full mt-2 py-2 border rounded-2xl shadow-2xl backdrop-blur-xl"
                        style={{
                            background: 'var(--bg-modal)',
                            borderColor: 'var(--border-primary)',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        <div className="max-h-60 overflow-y-auto scrollbar-thin">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                                    style={{
                                        color: option.value === value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        backgroundColor: option.value === value ? 'var(--accent-subtle)' : 'transparent'
                                    }}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        {option.icon && <option.icon className="w-4 h-4" />}
                                        <span>{option.label}</span>
                                    </div>
                                    {option.value === value && <IconCheck className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
