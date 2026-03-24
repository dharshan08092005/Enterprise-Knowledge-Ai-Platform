import React, { useState, useEffect } from "react";
import { getMyChannels, createChannel } from "../../services/channelService";
import { getOrganizationDirectory } from "../../services/userService";
import { Link } from "react-router-dom";
import { Hash, Plus, Sparkles, Building, Lock, MessageSquare } from "lucide-react";

interface Channel {
    _id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    members: { _id: string, firstName: string, lastName: string }[];
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

const ChannelList: React.FC = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [directory, setDirectory] = useState<User[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    
    // Form state
    const [channelType, setChannelType] = useState<"team" | "dm">("team");
    const [newChannelName, setNewChannelName] = useState("");
    const [newChannelDesc, setNewChannelDesc] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");

    const currentUserStr = localStorage.getItem("user");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    useEffect(() => {
        fetchChannels();
        fetchUsers();
    }, []);

    const fetchChannels = async () => {
        try {
            const data = await getMyChannels();
            setChannels(data);
        } catch (err) {
            console.error("Failed to fetch channels");
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await getOrganizationDirectory();
            setDirectory(data.filter((u: User) => u._id !== currentUser?.userId));
        } catch (err) {
            console.error("Failed to fetch directory");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let finalName = newChannelName;
            let members = [currentUser?.userId];
            let privateFlag = isPrivate;

            if (channelType === "dm" && selectedUserId) {
                // Determine DM channel name securely if needed or leave blank.
                // We'll generate a generic name and isPrivate=true.
                const otherUser = directory.find(u => u._id === selectedUserId);
                finalName = `dm_${currentUser?.userId}_${selectedUserId}`;
                members.push(selectedUserId);
                privateFlag = true;
            }

            await createChannel({
                name: finalName,
                description: channelType === "dm" ? "Direct Message" : newChannelDesc,
                isPrivate: privateFlag,
                members
            });
            
            setIsCreating(false);
            setNewChannelName("");
            setNewChannelDesc("");
            setIsPrivate(false);
            setSelectedUserId("");
            setChannelType("team");
            fetchChannels();
        } catch (err) {
            console.error("Failed to create channel");
        }
    };

    // Helper to format channel names nicely (especially DMs)
    const getChannelDisplayName = (channel: Channel) => {
        if (channel.name.startsWith("dm_")) {
            const otherMember = channel.members.find(m => m._id !== currentUser?.userId);
            return otherMember ? `${otherMember.firstName} ${otherMember.lastName}` : "Direct Message";
        }
        return channel.name;
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building className="w-6 h-6 text-blue-500" />
                        Team Channels & Messages
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Collaborate securely with department members or direct message colleagues.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> New Conversation
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
                    <div className="flex gap-4 mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
                        <button 
                            type="button"
                            onClick={() => setChannelType("team")}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${channelType === "team" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white dark:bg-white/5"}`}
                        >
                            <Hash className="w-4 h-4" /> Team Channel
                        </button>
                        <button 
                            type="button"
                            onClick={() => setChannelType("dm")}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${channelType === "dm" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white dark:bg-white/5"}`}
                        >
                            <MessageSquare className="w-4 h-4" /> Direct Message
                        </button>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        {channelType === "team" ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channel Name</label>
                                    <input 
                                        required
                                        value={newChannelName}
                                        onChange={e => setNewChannelName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="e.g. engineering-team"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <input 
                                        value={newChannelDesc}
                                        onChange={e => setNewChannelDesc(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="What is this channel about?"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <input 
                                        type="checkbox"
                                        id="isPrivate"
                                        checked={isPrivate}
                                        onChange={e => setIsPrivate(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isPrivate" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        Make this channel Private <Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Colleague</label>
                                <select 
                                    required
                                    value={selectedUserId}
                                    onChange={e => setSelectedUserId(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                                >
                                    <option value="" disabled>Search organization directory...</option>
                                    {directory.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName} ({user.email}) - {user.role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-3 justify-end pt-2">
                            <button 
                                type="button" 
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                            >
                                {channelType === "team" ? "Create Channel" : "Start Chatting"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map(channel => {
                    const isDM = channel.name.startsWith("dm_");
                    return (
                    <Link 
                        key={channel._id} 
                        to={`/channels/${channel._id}`}
                        className="group flex flex-col bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-gray-900 dark:text-white transition-colors">
                                {isDM ? <MessageSquare className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
                            </div>
                            {channel.isPrivate && <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {getChannelDisplayName(channel)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                            {isDM ? "Private direct message" : (channel.description || "No description provided.")}
                        </p>
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">@KnowledgeBot Enabled</span>
                        </div>
                    </Link>
                )})}
            </div>
            
            {channels.length === 0 && !isCreating && (
                <div className="text-center py-20 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400">No channels yet! Create one to start collaborating.</p>
                </div>
            )}
        </div>
    );
};

export default ChannelList;
