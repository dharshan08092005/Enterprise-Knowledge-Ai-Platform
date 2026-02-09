"use client";
import { cn } from "../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useLocation, Link } from "react-router-dom";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  badge?: string | number;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(true); // Default to open

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.div
      className={cn(
        "h-screen hidden md:flex md:flex-col flex-shrink-0 sticky top-0",
        "bg-gradient-to-b from-[#0f0f1a] via-[#141428] to-[#0f0f1a]",
        "border-r border-white/5",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "80px") : "280px",
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      {...props}
    >
      {/* Gradient overlay at top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {children}
      </div>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="absolute top-6 -right-3 z-50 w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/30 transition-all duration-200 shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {open ? (
          <IconChevronLeft className="w-3 h-3" />
        ) : (
          <IconChevronRight className="w-3 h-3" />
        )}
      </motion.button>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 flex flex-row md:hidden items-center justify-between fixed top-0 left-0 right-0 z-50",
          "bg-gradient-to-r from-[#0f0f1a] to-[#141428] border-b border-white/5"
        )}
        {...props}
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-white font-semibold">Enterprise AI</span>
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400"
        >
          <IconMenu2 className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Spacer for fixed header on mobile */}
      <div className="h-14 md:hidden" />

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] md:hidden"
            />
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              className={cn(
                "fixed h-full w-[280px] inset-y-0 left-0 z-[100] flex flex-col",
                "bg-gradient-to-b from-[#0f0f1a] via-[#141428] to-[#0f0f1a]",
                "border-r border-white/5",
                className
              )}
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                >
                  <IconX className="w-5 h-5" />
                </motion.button>
              </div>
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  const location = useLocation();
  const isActive = location.pathname === link.href;

  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center gap-3 py-3 mx-3 rounded-xl transition-all duration-200",
        "group/sidebar relative overflow-hidden",
        open ? "px-4" : "px-0 justify-center",
        isActive
          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white"
          : "text-gray-400 hover:text-white hover:bg-white/5",
        className
      )}
      {...props}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-purple-500 to-pink-500"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 transition-colors duration-200",
        isActive ? "text-purple-400" : "group-hover/sidebar:text-purple-400"
      )}>
        {link.icon}
      </div>

      {/* Label */}
      <AnimatePresence>
        {(open || !animate) && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-sm font-medium whitespace-nowrap overflow-hidden",
              "transition-all duration-200 group-hover/sidebar:translate-x-1"
            )}
          >
            {link.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge */}
      <AnimatePresence>
        {link.badge && (open || !animate) && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="ml-auto px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30"
          >
            {link.badge}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

export const SidebarLogo = ({ open }: { open: boolean }) => {
  return (
    <Link to="/" className="flex items-center gap-3 px-6 py-5">
      <motion.div
        className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0"
      >
        <span className="text-white font-bold text-lg">E</span>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <h1 className="text-lg font-bold text-white whitespace-nowrap">
              Enterprise
            </h1>
            <p className="text-xs text-gray-400 -mt-0.5 whitespace-nowrap">AI Platform</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
};

export const SidebarSection = ({
  title,
  children,
  open,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
}) => {
  return (
    <div className="mt-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 mb-2 overflow-hidden"
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {title}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
};

export const SidebarFooter = ({ open }: { open: boolean }) => {
  return (
    <div className="mt-auto border-t border-white/5 p-4">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <p className="text-sm font-medium text-white">Need help?</p>
              <p className="text-xs text-gray-400 mt-1">
                Check our documentation or contact support
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-3 w-full py-2 text-xs font-medium text-purple-300 bg-purple-500/20 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
              >
                View Documentation
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={cn(
        "flex items-center gap-2 mt-4",
        open ? "px-2 justify-start" : "justify-center"
      )}>
        <div className="w-2 h-2 rounded-full status-online flex-shrink-0" />
        <AnimatePresence>
          {open && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xs text-gray-500 overflow-hidden whitespace-nowrap"
            >
              All systems operational
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
