
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Heart, Map, GraduationCap, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: '홈' },
    { to: '/networking', icon: Users, label: '네트워킹' },
    { to: '/minddate', icon: Heart, label: '마인드' },
    { to: '/crew', icon: Map, label: '임장' },
    { to: '/mypage', icon: User, label: 'MY' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40 lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
                isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
                <>
                    <item.icon 
                        size={24} 
                        className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''} ${item.label === '마인드' && isActive ? 'text-pink-500 fill-pink-500' : ''}`} 
                        strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="text-[10px]">{item.label}</span>
                </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
