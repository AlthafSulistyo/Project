import React from 'react';
import { 
  LayoutDashboard, 
  ScanLine, 
  BarChart3, 
  Users, 
  HelpCircle, 
  LogOut,
  PlusCircle
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';

export const EduScanSidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Scanner', path: '/scanner', icon: ScanLine },
    { name: 'Records', path: '/records', icon: BarChart3 },
    { name: 'Students', path: '/students', icon: Users },
  ];

  return (
    <aside className="w-[280px] h-screen bg-[#f4f5f7] border-r border-gray-200 flex flex-col items-center py-8 relative">
      {/* Brand Profile */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
          MA
        </div>
        <h1 className="text-primary font-bold text-lg tracking-tight">Main Academy</h1>
        <p className="text-gray-500 text-sm font-medium">Admin Terminal</p>
      </div>

      {/* Navigation */}
      <nav className="w-full px-6 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path) || (item.name === 'Records' && location.pathname === '/');
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={clsx(
                    "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="w-full px-6 mt-auto flex flex-col gap-4">
        <button className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-3 flex items-center justify-center gap-2 font-semibold text-sm transition-colors shadow-sm">
          <PlusCircle size={18} />
          Quick Scan
        </button>

        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
          <button className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <HelpCircle size={20} />
            Help
          </button>
          <button className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
