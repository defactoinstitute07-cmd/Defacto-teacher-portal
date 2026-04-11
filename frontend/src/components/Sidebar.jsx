import {
    LayoutDashboard,
    BookOpen,
    UserCheck,
    FileText,
    Settings,
    LogOut,
    X
} from "lucide-react";

const Sidebar = ({
    isOpen,
    onClose,
    activeTab,
    setActiveTab,
    teacher,
    onLogout
}) => {

    // 🔥 Reusable Nav Button
    const NavButton = ({ tab, icon: Icon, label }) => (
        <button
            onClick={() => {
                setActiveTab(tab);
                if (window.innerWidth < 1024) onClose();
            }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === tab
                ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg scale-[1.02]"
                : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    return (
        <aside
            className={`fixed top-0 left-0 h-full w-[280px]
      bg-[linear-gradient(135deg,#000000,#0f172a,#000000)]
      text-white z-50 transform transition-transform duration-300 ease-in-out
      flex flex-col shadow-2xl overflow-hidden ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
        >

            {/* 🔲 Grid Overlay */}
            <div className="absolute inset-0 
      bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),
      linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]
      bg-[size:20px_20px] opacity-20"></div>

            {/* 🔝 Header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <img
                        src="https://www.defactoinstitute.in/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdmswb6fya%2Fimage%2Fupload%2Fv1775635083%2Ferp_uploads%2Ffwp2aeerokjfljm2aw2a.png&w=256&q=75"
                        alt="Defacto Logo"
                        className="h-10 object-contain"
                    />

                </div>

                <button
                    onClick={onClose}
                    className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 📚 Navigation */}
            <nav className="relative z-10 flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
                <p className="px-3 py-2 text-xs uppercase text-white/40 font-bold">
                    Main Menu
                </p>

                <NavButton tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavButton tab="subject" icon={BookOpen} label="Subject" />
                <NavButton tab="attendance" icon={UserCheck} label="Attendance" />
                <NavButton tab="exams" icon={FileText} label="Exams & Results" />
                <NavButton tab="settings" icon={Settings} label="Settings" />
            </nav>

            {/* 👤 Footer */}
            <div className="relative z-10 p-4 border-t border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-3">
                    {teacher?.profileImage ? (
                        <img
                            src={teacher.profileImage}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs">
                            {teacher?.name?.charAt(0) || "?"}
                        </div>
                    )}

                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-bold truncate">
                            {teacher?.name}
                        </span>
                        <span className="text-xs text-white/50 truncate">
                            {teacher?.email || teacher?.regNo}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl 
          text-red-400 font-bold hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;