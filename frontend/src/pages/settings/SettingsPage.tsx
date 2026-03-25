import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    IconUser,
    IconBuilding,
    IconPalette,
    IconWorld,
    IconCheck,
    IconLoader2,
    IconCamera,
    IconChevronRight,
    IconShieldLock,
} from "@tabler/icons-react";
import { getUserFromToken } from "@/lib/auth";
import { getMyOrganization, updateMyOrgSettings } from "@/services/organizationService";
import { getMe, updateMe } from "@/services/userService";
import { useTheme } from "@/lib/ThemeContext";



const SettingsSection = ({ title, subtitle, icon: Icon, active = false, onClick }: any) => (
    <motion.button
        onClick={onClick}
        whileHover={{ x: 4 }}
        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
            active 
            ? "bg-accent/10 border border-accent/30" 
            : "hover:bg-white/[0.05] border border-transparent"
        }`}
    >
        <div className={`p-2.5 rounded-lg ${active ? "bg-accent text-white" : "bg-white/5 text-gray-400"}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="text-left flex-1">
            <h3 className={`text-sm font-semibold ${active ? "text-accent" : "text-gray-900 dark:text-white"}`}>{title}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <IconChevronRight className={`w-4 h-4 transition-transform ${active ? "rotate-90 text-accent" : "text-gray-700"}`} />
    </motion.button>
);

const FormField = ({ label, type = "text", value, onChange, placeholder, helperText }: any) => (
    <div className="space-y-2 text-left">
        <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={!onChange}
            className={`w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent/50 transition-all ${!onChange ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.08]'}`}
        />
        {helperText && <p className="text-[10px] text-gray-500 dark:text-slate-500">{helperText}</p>}
    </div>
);

export default function SettingsPage() {
    const user = getUserFromToken();
    const isOrgAdmin = user?.role === "ORG_ADMIN" || user?.role === "ADMIN";
    
    const { updateBranding } = useTheme();
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [profile, setProfile] = useState({
        name: user?.name || "User",
        email: user?.email || "",
    });

    const [orgSettings, setOrgSettings] = useState({
        name: "",
        domain: "",
        themeColor: "",
    });

    useEffect(() => {
        getMe().then(u => {
            setProfile({
                name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email.split('@')[0],
                email: u.email
            });
        }).catch(err => console.error("Failed to fetch profile", err));

        if (isOrgAdmin) {
            getMyOrganization().then(org => {
                setOrgSettings({
                    name: org.name,
                    domain: org.slug,
                    themeColor: org.themeColor || "#2563eb",
                });
            }).catch(err => console.error("Failed to fetch org settings", err));
        }
    }, [isOrgAdmin]);

    // Live preview theme color
    useEffect(() => {
        if (isOrgAdmin && orgSettings.themeColor) {
            updateBranding(orgSettings.themeColor);
        }
    }, [isOrgAdmin, orgSettings.themeColor, updateBranding]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === "profile") {
                const parts = profile.name.split(" ");
                const firstName = parts[0];
                const lastName = parts.slice(1).join(" ");
                await updateMe({ firstName, lastName, email: profile.email });
            } else if (activeTab === "org-general") {
                await updateMyOrgSettings({
                    name: orgSettings.name,
                    themeColor: orgSettings.themeColor,
                });
            }
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            alert("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-4">
            <div className="flex flex-col md:flex-row gap-8">
                
                {/* Sidebar Navigation */}
                <div className="w-full md:w-80 space-y-2">
                    <h2 className="px-4 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest mb-4 text-left">User Settings</h2>
                    <SettingsSection 
                        title="Profile" 
                        subtitle="Personal information" 
                        icon={IconUser}
                        active={activeTab === "profile"}
                        onClick={() => setActiveTab("profile")}
                    />
                    <SettingsSection 
                        title="Security" 
                        subtitle="Password & auth" 
                        icon={IconShieldLock}
                        active={activeTab === "security"}
                        onClick={() => setActiveTab("security")}
                    />

                    {isOrgAdmin && (
                        <>
                            <h2 className="px-4 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest mt-8 mb-4 text-left">Organization Settings</h2>
                            <SettingsSection 
                                title="Organization Identity" 
                                subtitle="Branding & basic info" 
                                icon={IconBuilding}
                                active={activeTab === "org-general"}
                                onClick={() => setActiveTab("org-general")}
                            />
                             <SettingsSection 
                                title="Domain Policy" 
                                subtitle="SSO & restrictions" 
                                icon={IconWorld}
                                active={activeTab === "org-auth"}
                                onClick={() => setActiveTab("org-auth")}
                            />
                        </>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 text-left">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm h-full"
                    >
                        <AnimatePresence mode="wait">
                            {/* Profile Tab */}
                            {activeTab === "profile" && (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} key="profile" className="space-y-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your public information</p>
                                        </div>
                                        <div className="relative group">
                                            <div className="w-20 h-20 rounded-2xl bg-accent-gradient flex items-center justify-center text-3xl font-bold text-white shadow-accent uppercase">
                                                {profile.name.charAt(0)}
                                            </div>
                                            <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-[#1a1a2e] rounded-lg border border-gray-200 dark:border-white/10 shadow-lg text-gray-500 hover:text-accent transition-colors">
                                                <IconCamera className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField label="Full Name" value={profile.name} onChange={(v: string) => setProfile({...profile, name: v})} />
                                        <FormField label="Email Address" value={profile.email} onChange={(v: string) => setProfile({...profile, email: v})} />
                                    </div>
                                </motion.div>
                            )}

                            {/* Org General Tab */}
                            {activeTab === "org-general" && (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} key="org" className="space-y-6">
                                    <div className="text-left">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Identity</h2>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure company branding</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        <div className="space-y-6">
                                            <FormField label="Organization Name" value={orgSettings.name} onChange={(v: string) => setOrgSettings({...orgSettings, name: v})} />
                                            <FormField label="Tenant Slug" value={orgSettings.domain} placeholder="acme" helperText="Used for your unique URL (Internal)" />
                                        </div>
                                        
                                        <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <IconPalette className="w-4 h-4 text-accent" />
                                                Theme Customization
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div 
                                                    className="w-12 h-12 rounded-lg" 
                                                    style={{ backgroundColor: orgSettings.themeColor }}
                                                />
                                                <input 
                                                    type="color" 
                                                    value={orgSettings.themeColor}
                                                    onChange={e => setOrgSettings({...orgSettings, themeColor: e.target.value})}
                                                    className="bg-transparent border-0 w-8 h-8 cursor-pointer"
                                                />
                                                <span className="text-xs text-gray-500 font-mono uppercase">{orgSettings.themeColor}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500/80">Sets the primary accent color across the platform for your organization.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Security Tab */}
                            {activeTab === "security" && (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} key="sec" className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Security</h2>
                                    <div className="space-y-4 pt-4">
                                        <FormField label="Current Password" type="password" placeholder="••••••••" />
                                        <FormField label="New Password" type="password" placeholder="••••••••" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Actions */}
                        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-accent rounded-xl text-sm font-bold text-white shadow-accent flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <IconLoader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <IconCheck className="w-4 h-4" /> : "Save Changes"}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
