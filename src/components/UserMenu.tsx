import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Shield,
  ChevronDown,
  LogOut,
  UserPlus,
  Building2,
  Settings,
  Sparkles,
  CheckCircle2,
  Users,
  LogIn,
} from 'lucide-react';
import { AppUser } from '../types/hospital';
import { AuthService } from '../services/authService';

interface UserMenuProps {
  currentUser: AppUser | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onSwitchUser: (user: AppUser) => void;
  onOpenSettingsTab: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onSwitchUser,
  onOpenSettingsTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allUsers = AuthService.getAllUsers();

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenAuth('login')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Login</span>
        </button>
        <button
          onClick={() => onOpenAuth('signup')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Sign Up</span>
        </button>
      </div>
    );
  }

  // Get initials for avatar
  const initials = currentUser.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'MS';

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 transition-all text-left shadow-xs focus:outline-hidden"
      >
        {currentUser.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-1 ring-white/20">
            {initials}
          </div>
        )}
        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[140px]">
            {currentUser.fullName}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium leading-tight truncate max-w-[140px]">
            {currentUser.role}
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn text-slate-800">
          {/* Header Profile Summary */}
          <div className="p-4 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                  {initials}
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white truncate">{currentUser.fullName}</h4>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                    {currentUser.role}
                  </span>
                  {currentUser.authProvider === 'google' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-950 text-blue-300 border border-blue-700/50">
                      Google OAuth
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{currentUser.hospitalSettings?.hospitalName || 'Govt Hospital'}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-b border-slate-100 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettingsTab();
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
            >
              <Settings className="w-4 h-4 text-blue-600" />
              <span>Hospital Master Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuth('signup');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Sign Up New User & Hospital</span>
            </button>
          </div>

          {/* Switch User Accounts Section */}
          <div className="p-2 border-b border-slate-100">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              <span>Switch User Account:</span>
            </span>

            <div className="mt-1 max-h-36 overflow-y-auto space-y-1">
              {allUsers.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setIsOpen(false);
                      onSwitchUser(u);
                    }}
                    className={`w-full px-3 py-1.5 text-left rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{u.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">{u.role}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer / Logout */}
          <div className="p-2 bg-slate-50">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
