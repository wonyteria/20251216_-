import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Heart, Map, GraduationCap, LogIn, Settings } from 'lucide-react';

interface SidebarProps {
  onLoginClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLoginClick }) => {
  const navItems = [
    { to: '/', icon: Home, label: '홈' },
    { to: '/networking', icon: Users, label: '스터디 & 네트워킹' },
    { to: '/minddate', icon: Heart, label: '마인드데이트' },
    { to: '/crew', icon: Map, label: '임장 크루' },
    { to: '/lecture', icon: GraduationCap, label: '재테크 강의' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-lg">임</span>
        </div>
        <span className="font-extrabold text-2xl text-slate-900 hidden lg:block tracking-tight">
            임풋
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={22} className={`group-hover:scale-110 transition-transform duration-200 ${item.label === '마인드데이트' ? 'text-pink-500' : ''}`} />
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
            onClick={onLoginClick}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
            <LogIn size={22} />
            <span className="hidden lg:block">로그인</span>
        </button>
        <button className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Settings size={22} />
            <span className="hidden lg:block">설정</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;