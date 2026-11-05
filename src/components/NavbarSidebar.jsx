import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  HeartHandshake,
  FileText,
  ShieldCheck,
  BookOpen,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NavbarSidebar = ({ children }) => {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [switchingRole, setSwitchingRole] = useState(false);

  // Separate navigation items based on Role (Admin, Campaign Manager, Donor)
  const navItems = [
    {
      label: 'Reports & Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Campaign Manager', 'Donor']
    },
    {
      label: 'Fundraising Campaigns',
      path: '/campaigns',
      icon: Megaphone,
      roles: ['Admin', 'Campaign Manager', 'Donor']
    },
    {
      label: 'Donor Registry',
      path: '/donors',
      icon: Users,
      roles: ['Admin', 'Campaign Manager']
    },
    {
      label: 'Make a Donation (Form)',
      path: '/donate',
      icon: HeartHandshake,
      roles: ['Admin', 'Campaign Manager', 'Donor']
    },
    {
      label: user?.role === 'Donor' ? 'My Donations' : 'Donations Ledger',
      path: '/donations',
      icon: HeartHandshake,
      roles: ['Admin', 'Campaign Manager', 'Donor']
    },
    {
      label: user?.role === 'Donor' ? 'My 80G Receipts' : 'Tax Receipts (80G)',
      path: '/receipts',
      icon: FileText,
      roles: ['Admin', 'Campaign Manager', 'Donor']
    },
    {
      label: 'User & Role Management',
      path: '/users',
      icon: ShieldCheck,
      roles: ['Admin']
    },
    {
      label: 'Submission & ER Docs',
      path: '/submission-docs',
      icon: BookOpen,
      roles: ['Admin', 'Campaign Manager', 'Donor']
    }
  ];

  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'Donor')
  );

  // Quick Role Switcher for Viva / Evaluator convenience
  const handleQuickRoleSwitch = async (roleType) => {
    setSwitchingRole(true);
    try {
      if (roleType === 'Admin') {
        await login('admin@hopebridge.org', 'admin123');
      } else if (roleType === 'Campaign Manager') {
        await login('manager@hopebridge.org', 'manager123');
      } else {
        await login('donor@hopebridge.org', 'donor123');
        if (location.pathname === '/users' || location.pathname === '/donors') {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setSwitchingRole(false);
    }
  };

  const currentPageTitle =
    allowedNavItems.find((item) => item.path === location.pathname)?.label ||
    'Overview';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Left Sidebar Navigation (264px width on desktop) */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0 flex flex-col justify-between no-print">
        <div>
          {/* Brand Title */}
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap">
              HopeBridge NGO
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Project #23 · Donation Management
            </p>
          </div>

          {/* Role Access Summary */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200">
            <div className="text-xs text-slate-500">Logged in as</div>
            <div className="text-sm font-semibold text-slate-900 truncate mt-0.5">
              {user?.name}
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-0.5">
              Role: {user?.role} · {user?.email}
            </div>
          </div>

          {/* Role-filtered Navigation Links */}
          <nav className="p-3 space-y-1">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Viva Role Switcher & Logout Footer */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-2">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Evaluator Quick Role Switch</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
              {['Admin', 'Campaign Manager', 'Donor'].map((roleName) => (
                <button
                  key={roleName}
                  type="button"
                  disabled={switchingRole}
                  onClick={() => handleQuickRoleSwitch(roleName)}
                  className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate ${
                    user?.role === roleName
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {roleName === 'Campaign Manager' ? 'Manager' : roleName}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out ({user?.role})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb on left, 1 primary action on right */}
        <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-slate-200 no-print">
          <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
            <span className="font-medium text-slate-900 whitespace-nowrap">
              HopeBridge NGO
            </span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-500 whitespace-nowrap">
              {user?.role} Workspace
            </span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-slate-900 truncate">
              {currentPageTitle}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/donate')}
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
            >
              Make a Donation
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default NavbarSidebar;
