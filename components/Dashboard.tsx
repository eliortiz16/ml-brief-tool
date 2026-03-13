import React, { useEffect, useState, useRef } from 'react';
import { Plus, FileText, Clock, CheckCircle, User, LogOut, Edit2, Trash2, ExternalLink, Filter, Archive, AlertTriangle, Settings, Shield, ChevronDown, Search, X } from 'lucide-react';
import { calculateProgress } from '../utils';

interface Brief {
  id: string;
  brand: string;
  country: string;
  campaignName: string;
  owner: string;
  status: 'Draft' | 'In Progress' | 'Ready to Submit' | 'Submitted' | 'Archived';
  createdAt: string;
  updatedAt?: string;
  data: any;
}

interface DashboardProps {
  user: { name: string; email: string; picture: string; role?: string };
  onCreateNew: () => void;
  onOpenBrief: (briefData: any) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenAdminPanel?: () => void;
}

type FilterStatus = 'All' | 'Draft' | 'In Progress' | 'Submitted' | 'Archived';

const timeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "just now";
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onCreateNew, onOpenBrief, onLogout, onOpenSettings, onOpenAdminPanel }) => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'lastEdited' | 'campaignName' | 'country' | 'status'>('lastEdited');
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [briefToDelete, setBriefToDelete] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBriefs = async () => {
    try {
      const res = await fetch('/api/briefs');
      if (res.ok) {
        const data = await res.json();
        setBriefs(data);
      }
    } catch (err) {
      console.error('Failed to fetch briefs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefs();
  }, []);

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBriefToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!briefToDelete) return;
    try {
      const res = await fetch(`/api/briefs/${briefToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setBriefs(briefs.filter(b => b.id !== briefToDelete));
      } else {
        alert('No tienes permiso para eliminar este brief o ocurrió un error.');
      }
    } catch (err) {
      console.error('Failed to delete brief', err);
    } finally {
      setDeleteModalOpen(false);
      setBriefToDelete(null);
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/briefs/${id}/archive`, { method: 'POST' });
      if (res.ok) {
        setBriefs(briefs.map(b => b.id === id ? { ...b, status: 'Archived' } : b));
      } else {
        alert('No tienes permiso para archivar este brief o ocurrió un error.');
      }
    } catch (err) {
      console.error('Failed to archive brief', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Submitted</span>;
      case 'Ready to Submit':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">Ready to Submit</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">In Progress</span>;
      case 'Archived':
        return <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-medium">Archived</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">Draft</span>;
    }
  };

  const uniqueCountries = ['All', ...Array.from(new Set(briefs.map(b => b.country).filter(Boolean)))];
  const uniqueBrands = ['All', ...Array.from(new Set(briefs.map(b => b.brand).filter(Boolean)))];
  const uniqueOwners = ['All', ...Array.from(new Set(briefs.map(b => b.owner).filter(Boolean)))];

  const filteredBriefs = briefs.filter(brief => {
    const matchStatus = statusFilter === 'All' ? brief.status !== 'Archived' : brief.status === statusFilter;
    const matchCountry = countryFilter === 'All' || brief.country === countryFilter;
    const matchBrand = brandFilter === 'All' || brief.brand === brandFilter;
    const matchOwner = ownerFilter === 'All' || brief.owner === ownerFilter;
    const matchSearch = (brief.campaignName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (brief.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchCountry && matchBrand && matchOwner && matchSearch;
  });

  filteredBriefs.sort((a, b) => {
    if (sortBy === 'lastEdited') {
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    }
    if (sortBy === 'campaignName') {
      return (a.campaignName || '').localeCompare(b.campaignName || '');
    }
    if (sortBy === 'country') {
      return (a.country || '').localeCompare(b.country || '');
    }
    if (sortBy === 'status') {
      return (a.status || '').localeCompare(b.status || '');
    }
    return 0;
  });

  const stats = {
    total: briefs.length,
    draft: briefs.filter(b => b.status === 'Draft').length,
    inProgress: briefs.filter(b => b.status === 'In Progress').length,
    submitted: briefs.filter(b => b.status === 'Submitted').length,
  };

  // Mock activity data
  const activities = [
    { id: 1, text: 'Ana created "Hot Sale Argentina"', time: '10 minutes ago' },
    { id: 2, text: 'Pedro updated Strategy in "Cyber Week MX"', time: '1 hour ago' },
    { id: 3, text: 'Maria added collaborator to "Summer Campaign"', time: '2 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#FFF159] rounded flex items-center justify-center font-bold text-blue-900 text-xs">
              ML
            </div>
            <span className="font-semibold text-sm tracking-tight text-gray-800">ML LATAM Media Brief Tool</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search briefs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
              />
            </div>

            <button
              onClick={onCreateNew}
              className="bg-black text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} />
              New Brief
            </button>

            <button 
              onClick={() => setIsActivityPanelOpen(true)}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors relative"
              title="Activity"
            >
              <Clock size={16} />
            </button>

            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-md transition-colors"
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200 text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { setIsUserMenuOpen(false); onOpenSettings(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Settings size={14} className="text-gray-400" />
                    Settings
                  </button>
                  
                  {user.role === 'Admin' && onOpenAdminPanel && (
                    <button 
                      onClick={() => { setIsUserMenuOpen(false); onOpenAdminPanel(); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Shield size={14} className="text-blue-500" />
                      Admin Panel
                    </button>
                  )}
                  
                  <div className="h-px bg-gray-100 my-1"></div>
                  
                  <button 
                    onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Briefs</span>
                <span className="text-2xl font-semibold text-gray-900">{stats.total}</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Draft</span>
                <span className="text-2xl font-semibold text-gray-900">{stats.draft}</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">In Progress</span>
                <span className="text-2xl font-semibold text-gray-900">{stats.inProgress}</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Submitted</span>
                <span className="text-2xl font-semibold text-gray-900">{stats.submitted}</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex space-x-1">
                {(['All', 'Draft', 'In Progress', 'Submitted', 'Archived'] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      statusFilter === status 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-700 text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country === 'All' ? 'All Countries' : country}</option>
                  ))}
                </select>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-700 text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand === 'All' ? 'All Brands' : brand}</option>
                  ))}
                </select>
                <select
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-700 text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {uniqueOwners.map(owner => (
                    <option key={owner} value={owner}>{owner === 'All' ? 'All Owners' : owner.split('@')[0]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sorting */}
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-gray-900 font-medium focus:ring-0 cursor-pointer p-0"
                >
                  <option value="lastEdited">Last edited</option>
                  <option value="campaignName">Campaign name</option>
                  <option value="country">Country</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                Loading workspace...
              </div>
            ) : briefs.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center flex flex-col items-center shadow-sm">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No briefs yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Create your first campaign brief for Mercado Libre LATAM.
                </p>
                <button
                  onClick={onCreateNew}
                  className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Create New Brief
                </button>
              </div>
            ) : filteredBriefs.length === 0 ? (
              <div className="py-20 text-center text-gray-500 text-sm">
                No briefs match the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBriefs.map((brief) => {
                  const progress = calculateProgress(brief.data);
                  const lastEdited = new Date(brief.updatedAt || brief.createdAt);
                  
                  return (
                    <div 
                      key={brief.id} 
                      onClick={() => onOpenBrief(brief)}
                      className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex flex-col h-full relative p-5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        {getStatusBadge(brief.status || 'Draft')}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(user.role === 'Admin' || (brief.status !== 'Submitted' && brief.status !== 'Archived')) && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onOpenBrief(brief); }}
                              className="text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {(brief.owner === user.email || user.role === 'Admin') && (brief.status === 'Draft' || brief.status === 'In Progress') && (
                            <button 
                              onClick={(e) => confirmDelete(e, brief.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                        {brief.campaignName || 'Untitled Campaign'}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span>{brief.brand || 'No Brand'}</span>
                        <span>•</span>
                        <span>{brief.country || 'No Country'}</span>
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-gray-500 font-medium">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-1 rounded-full transition-all duration-500 ${
                                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600 uppercase">
                              {brief.owner.charAt(0)}
                            </div>
                            <span className="text-xs text-gray-600 truncate max-w-[100px]" title={brief.owner}>
                              {brief.owner.split('@')[0]}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {timeAgo(lastEdited)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Activity Panel (Right Side) */}
        {isActivityPanelOpen && (
          <div className="w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col absolute right-0 top-0 bottom-0 z-30 animate-in slide-in-from-right-full duration-200">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={14} /> Activity Log
              </h3>
              <button 
                onClick={() => setIsActivityPanelOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 leading-snug">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Brief</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to delete this brief? This action cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setBriefToDelete(null);
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

