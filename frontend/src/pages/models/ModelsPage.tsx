import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    IconBrain,
    IconCheck,
    IconLoader2,
    IconAlertTriangle,
    IconChevronDown,
} from "@tabler/icons-react";
import { getMyOrganization, updateMyOrgSettings, testAiConfig } from "@/services/organizationService";

const CustomSelect = ({ value, onChange, options }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find((opt: any) => opt.value === value);

    return (
        <div className="relative group">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent/50 transition-all hover:bg-white/[0.08]"
            >
                <span className="font-medium">{selectedOption?.label || "Select option"}</span>
                <IconChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 z-20 mt-2 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-xl"
                        >
                            <div className="p-1.5 space-y-0.5">
                                {options.map((opt: any) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${
                                            value === opt.value 
                                            ? "bg-accent text-white shadow-accent" 
                                            : "text-gray-600 dark:text-gray-300 hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                    >
                                        <span className="font-medium">{opt.label}</span>
                                        {value === opt.value && <IconCheck className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormField = ({ label, type = "text", value, onChange, placeholder, helperText, options }: any) => (
    <div className="space-y-2 text-left">
        <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        {type === "select" ? (
            <CustomSelect value={value} onChange={onChange} options={options} />
        ) : type === "textarea" ? (
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent/50 min-h-[100px] transition-all hover:bg-white/[0.08]"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent/50 transition-all hover:bg-white/[0.08]"
            />
        )}
        {helperText && <p className="text-[10px] text-gray-500 dark:text-slate-500">{helperText}</p>}
    </div>
);

export default function ModelsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [orgSettings, setOrgSettings] = useState({
        defaultModel: "gemini-1.5-flash",
        provider: "google",
        apiKey: "",
        embeddingProvider: "ollama",
        embeddingApiKey: "",
        embeddingModel: "nomic-embed-text",
        systemPrompt: "You are a helpful assistant for high-enterprise employees.",
    });

    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        getMyOrganization().then(org => {
            setOrgSettings({
                ...orgSettings,
                defaultModel: org.aiSettings?.model || "gemini-1.5-flash",
                provider: org.aiSettings?.provider || "google",
                apiKey: org.aiSettings?.apiKey || "",
                embeddingProvider: org.embeddingSettings?.provider || "ollama",
                embeddingApiKey: org.embeddingSettings?.apiKey || "",
                embeddingModel: org.embeddingSettings?.model || "nomic-embed-text",
            });
        }).catch(err => console.error("Failed to fetch org settings", err));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateMyOrgSettings({
                provider: orgSettings.provider,
                apiKey: orgSettings.apiKey,
                model: orgSettings.defaultModel,
                embeddingProvider: orgSettings.embeddingProvider,
                embeddingApiKey: orgSettings.embeddingApiKey,
                embeddingModel: orgSettings.embeddingModel,
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            alert("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await testAiConfig({
                provider: orgSettings.provider,
                apiKey: orgSettings.apiKey,
                model: orgSettings.defaultModel
            });
            setTestResult({ success: true, message: res.message });
        } catch (err: any) {
            setTestResult({ success: false, message: err.response?.data?.message || "Connection failed" });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-left mb-8 flex items-center justify-between">
                <div>
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <IconBrain className="w-8 h-8 text-accent" />
                        AI Models & Infrastructure
                    </h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-2">Manage your "Bring Your Own Key" (BYOK) AI and Embedding configurations.</p>
                </div>
                
                 <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-accent-gradient rounded-xl text-sm font-bold text-white shadow-accent flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <IconLoader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <IconCheck className="w-4 h-4" /> : "Save All Changes"}
                </motion.button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Generation Model */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-3xl p-8"
                >
                    <div className="text-left mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chat & Generation Model</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure the engine behind every search and chat response.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField 
                                label="AI Provider" 
                                type="select" 
                                value={orgSettings.provider} 
                                onChange={(v: string) => setOrgSettings({...orgSettings, provider: v})}
                                options={[
                                    { label: "Google Gemini", value: "google" },
                                    { label: "OpenAI", value: "openai" },
                                    { label: "Anthropic", value: "anthropic" },
                                ]}
                            />
                            <FormField 
                                label="Custom Model ID" 
                                value={orgSettings.defaultModel} 
                                onChange={(v: string) => setOrgSettings({...orgSettings, defaultModel: v})}
                                placeholder="e.g. gemini-1.5-flash"
                            />
                        </div>

                        <div className="relative">
                            <FormField 
                                label="API Key" 
                                type="password"
                                value={orgSettings.apiKey} 
                                onChange={(v: string) => setOrgSettings({...orgSettings, apiKey: v})}
                                placeholder="••••••••••••••••"
                                helperText="Your API key is encrypted at rest and never exposed to other users."
                            />
                            <button 
                                onClick={handleTestConnection}
                                disabled={isTesting || !orgSettings.apiKey}
                                className="absolute right-3 top-9 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 rounded-lg text-xs font-semibold text-accent transition-all disabled:opacity-30 flex items-center gap-2 whitespace-nowrap"
                            >
                                {isTesting ? <IconLoader2 className="w-3.5 h-3.5 animate-spin" /> : "Test Generation"}
                            </button>
                        </div>
                        {testResult && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                                    testResult.success ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}
                            >
                                {testResult.success ? <IconCheck className="w-4 h-4" /> : <IconAlertTriangle className="w-4 h-4" />}
                                {testResult.message}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Embedding Model */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-3xl p-8"
                >
                    <div className="text-left mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Embedding Configuration</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage the vector model used for your Private Knowledge Base.</p>
                        </div>
                        <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                            <IconAlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-500 uppercase">Use with Caution</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-6 text-left">
                        <p className="text-[11px] text-amber-600/90 leading-relaxed font-medium">
                            <span className="font-bold">Important:</span> Changing your embedding model after documents are indexed will make existing documents unsearchable. 
                            You must re-index your entire knowledge base if you change this setting.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField 
                            label="Embedding Provider" 
                            type="select" 
                            value={orgSettings.embeddingProvider} 
                            onChange={(v: string) => setOrgSettings({...orgSettings, embeddingProvider: v})}
                            options={[
                                { label: "Local Ollama", value: "ollama" },
                                { label: "Google Gemini Embeddings", value: "google" },
                            ]}
                        />
                        <FormField 
                            label="Embedding Model ID" 
                            value={orgSettings.embeddingModel} 
                            onChange={(v: string) => setOrgSettings({...orgSettings, embeddingModel: v})}
                            placeholder="e.g. nomic-embed-text"
                        />
                    </div>

                    <div className="mt-6">
                        <FormField 
                            label="Embedding API Key" 
                            type="password"
                            value={orgSettings.embeddingApiKey} 
                            onChange={(v: string) => setOrgSettings({...orgSettings, embeddingApiKey: v})}
                            placeholder="••••••••••••••••"
                            helperText="Only required if using an external cloud provider like Google."
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
