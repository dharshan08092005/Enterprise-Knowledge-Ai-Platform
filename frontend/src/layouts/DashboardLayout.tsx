import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/SideBar";
import {
  IconHome,
  IconDeviceLaptop,
  IconDatabase,
  IconSettings,
} from "@tabler/icons-react";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Home", href: "/", icon: <IconHome /> },
    { label: "Models", href: "/models", icon: <IconDeviceLaptop /> },
    { label: "Data", href: "/data", icon: <IconDatabase /> },
    { label: "Settings", href: "/settings", icon: <IconSettings /> },
  ];

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="h-full">
          <div className="flex flex-col h-full">
            <div className="px-4 py-4 text-lg font-semibold">
              Enterprise AI
            </div>

            <nav className="flex flex-col gap-1 mt-4">
              {links.map((link) => (
                <SidebarLink key={link.href} link={link} />
              ))}
            </nav>

            <div className="mt-auto px-4 py-4 text-sm text-neutral-500">
              v0.1.0
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col">
        <header className="h-14 px-6 flex items-center border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-sm font-medium">Welcome</div>
        </header>

        {/* ✅ Nested route pages render here */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}