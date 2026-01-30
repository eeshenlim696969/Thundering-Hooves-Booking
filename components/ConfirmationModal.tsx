import React, { useState, useMemo } from 'react';
import { SeatData, SeatStatus, SeatTier } from '../types';
import { Search, Download, Trash2, Check, Edit2, Filter, Mail, Phone, User } from 'lucide-react';

interface AdminDashboardProps {
  seats: SeatData[];
  onSelectSeat: (seat: SeatData) => void;
  onReset: (id: string) => Promise<void>;
  onApprove: (seat: SeatData) => Promise<void>;
  onLogout: () => void;
  onPreviewAura: (tier: SeatTier) => void;
  currentPrices: Record<SeatTier, number>;
  onUpdatePrices: (prices: Record<SeatTier, number>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  seats, onSelectSeat, onReset, onApprove, onLogout 
}) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SeatStatus | 'ALL'>('ALL');

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      total: seats.length,
      available: seats.filter(s => s.status === SeatStatus.AVAILABLE).length,
      sold: seats.filter(s => s.status === SeatStatus.SOLD).length,
      revenue: seats.reduce((acc, s) => acc + (s.status === SeatStatus.SOLD ? s.price : 0), 0)
    };
  }, [seats]);

  // Filtering Logic
  const filteredSeats = useMemo(() => {
    return seats.filter(s => {
      const info = s.paymentInfo;
      const searchLower = filter.toLowerCase();

      // Search by Name, ID, IC, Email, or Car Plate
      const matchSearch = 
        s.id.toLowerCase().includes(searchLower) ||
        (info?.studentName && info.studentName.toLowerCase().includes(searchLower)) ||
        (info?.studentId && info.studentId.toLowerCase().includes(searchLower)) ||
        (info?.icNumber && info.icNumber.toLowerCase().includes(searchLower)) ||
        (info?.email && info.email.toLowerCase().includes(searchLower)) ||
        (info?.carPlate && info.carPlate.toLowerCase().includes(searchLower));
      
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [seats, filter, statusFilter]);

  // CSV Export Function
  const handleExportCSV = () => {
    // 1. Define Headers (Added Email & Phone)
    const headers = [
      'Seat ID', 'Table', 'Seat', 'Status', 'Price', 'Category', 'Guest Name', 
      'ID / IC', 'Email', 'Phone', 'Car Plate', 'Club Member?', 'Vegan?'
    ];

    // 2. Map Data Rows
    const rows = seats.map(s => {
      const info = s.paymentInfo;
      return [
        s.id,
        s.tableId === 4 ? '3A' : (s.tableId === 14 ? '13A' : s.tableId),
        s.seatNumber,
        s.status,
        s.price,
        info?.category || '-',
        info?.studentName || '-',
        info?.studentId || info?.icNumber || '-',
        info?.email || '-',           // <--- Added Email
        info?.phoneNumber || '-',     // <--- Added Phone
        info?.carPlate || '-',
        info?.isMember ? 'Yes' : 'No',
        info?.isVegan ? 'Yes' : 'No'
      ];
    });

    // 3. Generate File
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "thundering_hooves_guestlist.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden min-h-[80vh] flex flex-col">
      {/* Header & Stats */}
      <div className="p-8 bg-stone-900 text-white shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-widest text-[#d4af37]">Command Center</h2>
            <p className="text-stone-400 font-serif italic">Event Overview & Management</p>
          </div>
          <button onClick={onLogout} className="px-6 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors">
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
            <div className="text-stone-400 text-xs uppercase tracking-widest font-black">Total Seats</div>
            <div className="text-2xl font-black text-white">{stats.total}</div>
          </div>
          <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
            <div className="text-green-400 text-xs uppercase tracking-widest font-black">Available</div>
            <div className="text-2xl font-black text-green-300">{stats.available}</div>
          </div>
          <div className="bg-[#d4af37]/10 p-4 rounded-2xl border border-[#d4af37]/20">
            <div className="text-[#d4af37] text-xs uppercase tracking-widest font-black">Sold</div>
            <div className="text-2xl font-black text-[#fcd34d]">{stats.sold}</div>
          </div>
          <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
            <div className="text-blue-400 text-xs uppercase tracking-widest font-black">Revenue</div>
            <div className="text-2xl font-black text-blue-300">RM {stats.revenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-stone-50">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search name, ID, email..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#d4af37]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#d4af37] appearance-none bg-white cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value={SeatStatus.AVAILABLE}>Available</option>
              <option value={SeatStatus.SOLD}>Sold</option>
              <option value={SeatStatus.CHECKOUT}>Checkout</option>
            </select>
          </div>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-2.5 bg-[#d4af37] text-stone-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#b5952f] transition-colors shadow-lg">
          <Download className="w-4 h-4" /> Export Excel
        </button>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="text-stone-400 text-[10px] uppercase tracking-widest border-b border-stone-100">
              <th className="pb-4 pl-4">Seat</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Guest</th>
              <th className="pb-4">Category</th>
              <th className="pb-4">Contact</th> {/* Added Contact Header */}
              <th className="pb-4">Details</th>
              <th className="pb-4 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-stone-600 font-medium">
            {filteredSeats.map(seat => {
              const info = seat.paymentInfo;
              return (
                <tr key={seat.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors group">
                  <td className="py-4 pl-4">
                    <div className="flex flex-col">
                      <span className="font-black text-stone-900">T-{seat.tableId === 4 ? '3A' : (seat.tableId === 14 ? '13A' : seat.tableId)}</span>
                      <span className="text-xs">Seat {seat.seatNumber}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                      seat.status === SeatStatus.SOLD ? 'bg-green-100 text-green-700 border-green-200' : 
                      seat.status === SeatStatus.CHECKOUT ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                      'bg-stone-100 text-stone-400 border-stone-200'
                    }`}>
                      {seat.status}
                    </span>
                  </td>
                  <td className="py-4">
                    {info ? (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-stone-400" />
                        <span className="font-bold text-stone-800">{info.studentName}</span>
                      </div>
                    ) : <span className="text-stone-300">-</span>}
                  </td>
                  <td className="py-4">
                    {info?.category || '-'}
                  </td>
                  
                  {/* --- NEW CONTACT COLUMN (Displays Email/Phone) --- */}
                  <td className="py-4">
                    {info ? (
                      <div className="flex flex-col gap-1 text-xs text-stone-500">
                        {info.email && (
                          <div className="flex items-center gap-1.5" title={info.email}>
                            <Mail className="w-3 h-3 text-stone-400" /> 
                            <span className="truncate max-w-[140px]">{info.email}</span>
                          </div>
                        )}
                        {info.phoneNumber && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-stone-400" /> 
                            <span>{info.phoneNumber}</span>
                          </div>
                        )}
                        {!info.email && !info.phoneNumber && <span className="text-stone-300 text-[10px]">No info</span>}
                      </div>
                    ) : <span className="text-stone-300">-</span>}
                  </td>

                  <td className="py-4">
                    <div className="flex flex-col gap-1 text-xs text-stone-500">
                      {info?.icNumber && <span>IC: {info.icNumber}</span>}
                      {info?.studentId && <span>ID: {info.studentId}</span>}
                      {info?.carPlate && <span className="text-amber-600 font-bold">Car: {info.carPlate}</span>}
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {seat.status !== SeatStatus.AVAILABLE && (
                        <button onClick={() => onReset(seat.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Reset Seat">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {seat.status === SeatStatus.CHECKOUT && (
                        <button onClick={() => onApprove(seat)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Approve Payment">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => onSelectSeat(seat)} className="p-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200" title="View Details">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
