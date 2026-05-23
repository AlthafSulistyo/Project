import React, { useState } from 'react';
import { Download, FileText, Search, Calendar, Filter, MoreVertical, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import clsx from 'clsx';

// Mock Data
const recordsData = [
  { id: 1, name: 'Alex Rivera', initials: 'AR', nisn: '0012345678', class: 'Grade 10A', time: '07:15 AM', status: 'Present', avatarColor: 'bg-green-500 text-white' },
  { id: 2, name: 'Sarah Jenkins', initials: 'SJ', nisn: '0012345679', class: 'Grade 10A', time: '08:05 AM', status: 'Late', avatarColor: 'bg-green-400 text-white' },
  { id: 3, name: 'Marcus Chen', initials: 'MC', nisn: '0012345680', class: 'Grade 10B', time: '-', status: 'Absent', avatarColor: 'bg-red-100 text-red-600' },
  { id: 4, name: 'Emma Watson', initials: 'EW', nisn: '0012345681', class: 'Grade 11C', time: '07:22 AM', status: 'Present', avatarColor: 'bg-green-200 text-green-800' },
  { id: 5, name: 'David Kim', initials: 'DK', nisn: '0012345682', class: 'Grade 11C', time: '07:25 AM', status: 'Present', avatarColor: 'bg-green-500 text-white' },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Present':
      return <span className="px-3 py-1 bg-[#dcfce7] text-[#166534] rounded-full text-xs font-semibold">Present</span>;
    case 'Late':
      return <span className="px-3 py-1 bg-[#fef3c7] text-[#92400e] rounded-full text-xs font-semibold">Late</span>;
    case 'Absent':
      return <span className="px-3 py-1 bg-[#fee2e2] text-[#b91c1c] rounded-full text-xs font-semibold">Absent</span>;
    default:
      return null;
  }
};

export const Records = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Records</h1>
          <p className="text-gray-500">Manage and export daily student attendance data.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors font-medium text-sm bg-white">
            <Download size={18} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm">
            <FileText size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name or NISN..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm">
            <Calendar size={16} className="text-gray-500" />
            Today, Oct 24
            <span className="text-gray-400 text-xs ml-1">▼</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm">
            <BookOpen size={16} className="text-gray-500" />
            All Classes
            <span className="text-gray-400 text-xs ml-1">▼</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm">
            <Filter size={16} className="text-gray-500" />
            Status: All
            <span className="text-gray-400 text-xs ml-1">▼</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Scan Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recordsData.map((record, index) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", record.avatarColor)}>
                        {record.initials}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{record.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.nisn}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.time}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">248</span> records
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft size={18} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-white font-medium text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-500 text-sm">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm">50</button>
            <button className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
