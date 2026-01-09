import { useState, useEffect } from 'react';
import { Bell, User, ChevronDown, Shield } from 'lucide-react';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <header className="h-16 bg-[#0f1420] border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="size-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Shield className="size-6 text-white" />
        </div>
        <div>
          <div className="text-sm text-gray-400">School Security System</div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-white text-lg">{formatTime(currentTime)}</div>
        <div className="text-xs text-gray-400">{formatDate(currentTime)}</div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="size-5" />
          <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
          <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="size-4 text-white" />
          </div>
          <div className="text-sm">
            <div className="text-white">Admin</div>
          </div>
          <ChevronDown className="size-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
