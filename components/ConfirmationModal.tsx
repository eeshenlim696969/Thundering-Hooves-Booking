import React, { useState, useMemo } from 'react';
import { SeatData, SeatStatus, SeatTier, SeatDetail } from '../types';
import { Search, Download, Trash2, RefreshCw, X, Check, Edit2, Save, Filter, Mail, Phone } from 'lucide-react';

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
  seats, onSelectSeat, onReset, onApprove, onLogout, onPreviewAura, currentPrices, onUpdatePrices 
}) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SeatStatus | 'ALL'>('ALL');
  const [prices, setPrices] = useState(currentPrices);
  const [isEditingPrices, setIsEditingPrices] = useState(false);

  const stats = useMemo(() => {
    return {
      total: seats.length,
      available: seats.filter(s => s.status === SeatStatus.AVAILABLE).length,
      sold: seats.filter(s => s.status === SeatStatus.SOLD).length,
      revenue: seats.reduce((acc, s) => acc + (s.status === SeatStatus.SOLD ? s.price : 0), 0)
    };
  }, [seats]);

  const filteredSeats = useMemo(() => {
    return seats.filter(s => {
      const matchSearch = 
        s.id.toLowerCase().includes(filter.toLowerCase()) ||
        s.paymentInfo?.studentName.toLowerCase().includes(filter.toLowerCase()) ||
        s.paymentInfo?.studentId?.toLowerCase().includes(filter.toLowerCase()) ||
        s.paymentInfo?.icNumber?.toLowerCase().includes(filter.toLowerCase()) ||
        s.paymentInfo?.email?.toLowerCase().includes(filter.toLowerCase()); // Added Email Search
      
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [seats, filter, statusFilter]);

  const handleExportCSV = () => {
    const headers = ['Seat ID', 'Table', 'Seat', 'Status', 'Tier', 'Price', 'Name', 'Category', 'ID / IC', 'Car Plate', 'Email', 'Phone', 'Member?', 'Vegan?'];
    const rows = seats.map(s => [
      s.id,
      s.tableId === 4 ? '3A' : (s.tableId === 14 ? '13A' : s.tableId),
      s.seatNumber,
      s.status,
      s.tier,
      s.price,
      s.paymentInfo?.studentName || '-',
      s.paymentInfo?.category || '-',
      s.paymentInfo?.studentId || s.paymentInfo?.icNumber || '-',
      s.paymentInfo?.carPlate || '-',
      s.paymentInfo?.email || '-',        // Added to CSV
      s.paymentInfo?.phoneNumber || '-',  // Added to CSV
      s.paymentInfo?.isMember ? 'Yes' : 'No',
      s.paymentInfo?.isVegan ? 'Yes' : 'No'
    ]);

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
          <div className="flex gap-4">
             <button onClick={onLogout} className="px-6 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors">
               Log Out
             </button>
          </div>
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
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="text-stone-400 text-[10px] uppercase tracking-widest border-b border-stone-100">
              <th className="pb-4 pl-4">Seat</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Guest Name</th>
              <th className="pb-4">Category</th>
              <th className="pb-4">Contact</th> {/* Merged Email/Phone column for space */}
              <th className="pb-4">Details</th> {/* ID/IC/Car */}
              <th className="pb-4 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-stone-600 font-medium">
            {filteredSeats.map(seat => (
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
                  {seat.paymentInfo ? (
                    <div className="font-bold text-stone-800">{seat.paymentInfo.studentName}</div>
                  ) : (
                    <span className="text-stone-300 italic">-</span>
                  )}
                </td>
                <td className="py-4">
                  {seat.paymentInfo?.category || '-'}
                </td>
                <td className="py-4">
                  {/* NEW CONTACT COLUMN */}
                  {seat.paymentInfo?.email || seat.paymentInfo?.phoneNumber ? (
                    <div className="flex flex-col gap-1 text-xs">
                      {seat.paymentInfo.email && (
                        <div className="flex items-center gap-1.5 text-stone-500">
                          <Mail className="w-3 h-3" /> <span className="truncate max-w-[150px]">{seat.paymentInfo.email}</span>
                        </div>
                      )}
                      {seat.paymentInfo.phoneNumber && (
                        <div className="flex items-center gap-1.5 text-stone-500">
                          <Phone className="w-3 h-3" /> {seat.paymentInfo.phoneNumber}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-stone-300">-</span>
                  )}
                </td>
                <td className="py-4">
                  <div className="flex flex-col gap-1 text-xs">
                    {seat.paymentInfo?.icNumber && <span>IC: {seat.paymentInfo.icNumber}</span>}
                    {seat.paymentInfo?.studentId && <span>ID: {seat.paymentInfo.studentId}</span>}
                    {seat.paymentInfo?.carPlate && <span className="text-amber-600 font-bold">Car: {seat.paymentInfo.carPlate}</span>}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
