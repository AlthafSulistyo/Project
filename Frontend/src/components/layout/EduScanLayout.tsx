import React from 'react';
import { EduScanSidebar } from './EduScanSidebar';
import { Outlet } from 'react-router-dom';

export const EduScanLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <EduScanSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
