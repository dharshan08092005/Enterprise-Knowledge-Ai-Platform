"use client";
import { cn } from "../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
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

export const SidebarBody = (
  props: Omit<React.ComponentProps<typeof motion.div>, "children"> & {
    children?: React.ReactNode;
  }
) => {
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
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & {
  children?: React.ReactNode;
}) => {
  const { open, animate } = useSidebar();

  return (
    <motion.div
      className={cn(
        "h-screen hidden md:flex md:flex-col flex-shrink-0 sticky top-0 overflow-visible",
        className
      )}
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-secondary)' }}
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
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  children?: React.ReactNode;
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 flex flex-row md:hidden items-center justify-between fixed top-0 left-0 right-0 z-50"
        )}
        style={{ background: 'var(--bg-navbar)', borderBottom: '1px solid var(--border-secondary)' }}
        {...props}
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Enterprise AI</span>
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
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
                className
              )}
              style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-secondary)' }}
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg border"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
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
        "flex items-center gap-3 py-3 mx-3 rounded-lg transition-all duration-200",
        "group/sidebar relative overflow-hidden",
        open ? "px-4" : "px-0 justify-center",
        className
      )}
      style={{
        ...(isActive
          ? { background: 'var(--sidebar-active-bg)', color: 'var(--text-primary)' }
          : { color: 'var(--text-muted)' })
      }}
      {...props}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
           layoutId="activeIndicator"
           className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-accent"
           transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 transition-colors duration-200",
        isActive ? "text-accent" : "group-hover/sidebar:text-accent"
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
            className="ml-auto px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded-full border border-accent/30"
          >
            {link.badge}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

export const SidebarLogo = ({ open }: { open: boolean }) => {
  const { setOpen } = useSidebar();

  return (
    <div className="flex items-center gap-3 px-6 py-5">
      <motion.div
        className="relative w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center shadow-accent flex-shrink-0 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-white font-bold text-lg">E</span>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
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
            <Link to="/">
              <h1 className="text-lg font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                Enterprise
              </h1>
              <p className="text-xs -mt-0.5 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>AI Platform</p>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
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
    <div className="mt-auto p-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg border" style={{ background: 'var(--accent-subtle)', borderColor: 'var(--badge-border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Need help?</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Check our documentation or contact support
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-3 w-full py-2 text-xs font-medium rounded-lg transition-colors"
                style={{ color: 'var(--accent-primary)', background: 'var(--badge-bg)', border: '1px solid var(--badge-border)' }}
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
              className="text-xs overflow-hidden whitespace-nowrap" style={{ color: 'var(--text-muted)' }}
            >
              All systems operational
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
