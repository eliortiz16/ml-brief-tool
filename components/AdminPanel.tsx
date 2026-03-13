import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, FileText, Activity, Globe, Filter } from 'lucide-react';

interface AdminPanelProps {
  user: { name: string; email: string; picture: string; role?: string };
  onBack: () => void;
}

interface Brief {
  id: string;
  brand: string;
  country: string;
  campaignName: string;
  owner: string;
  status: string;
  updatedAt?: string;
  createdAt: string;
}

interface UserData {
  name: string;
  email: string;
  role: string;
  domain: string;
  lastLogin: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack }) => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [briefsRes, usersRes] = await Promise.all([
          fetch('/api/briefs'),
          fetch('/api/users')
        ]);
        
        if (briefsRes.ok) {
          const briefsData = await briefsRes.json();
          setBriefs(briefsData);
        }
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const stats = {
    total: briefs.length,
    draft: briefs.filter(b => b.status === 'Draft').length,
    inProgress: briefs.filter(b => b.status === 'In Progress').length,
    submitted: briefs.filter(b => b.status === 'Submitted').length,
  };

  const briefsByCountry = briefs.reduce((acc, brief) => {
    acc[brief.country] = (acc[brief.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueCountries = ['All', ...Array.from(new Set(briefs.map(b => b.country).filter(Boolean)))];
  const uniqueBrands = ['All', ...Array.from(new Set(briefs.map(b => b.brand).filter(Boolean)))];
  const uniqueStatuses = ['All', ...Array.from(new Set(briefs.map(b => b.status).filter(Boolean)))];

  const filteredBriefs = briefs.filter(brief => {
    const matchCountry = countryFilter === 'All' || brief.country === countryFilter;
    const matchBrand = brandFilter === 'All' || brief.brand === brandFilter;
    const matchStatus = statusFilter === 'All' || brief.status === statusFilter;
    return matchCountry && matchBrand && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3483FA]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Volver al Dashboard
          </button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1.5">System overview and management</p>
        </div>

        {/* Section 1: System Overview */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-[#3483FA]" />
            System Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Briefs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-gray-500 mb-1">Draft</p>
              <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-gray-500 mb-1">Submitted</p>
              <p className="text-3xl font-bold text-gray-900">{stats.submitted}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Briefs by Country */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-[#3483FA]" />
            Briefs by Country
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="space-y-3">
              {Object.entries(briefsByCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
                <div key={country} className="flex items-center text-gray-700">
                  <span className="font-medium">{country || 'Unknown'}</span>
                  <span className="mx-2 text-gray-400">—</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
              {Object.keys(briefsByCountry).length === 0 && (
                <div className="text-gray-500">No data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: All Briefs */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-[#3483FA]" />
            All Briefs
          </h2>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-[#3483FA] focus:ring focus:ring-[#3483FA] focus:ring-opacity-50"
              >
                {uniqueCountries.map(c => <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>)}
              </select>
              
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-[#3483FA] focus:ring focus:ring-[#3483FA] focus:ring-opacity-50"
              >
                {uniqueBrands.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-[#3483FA] focus:ring focus:ring-[#3483FA] focus:ring-opacity-50"
              >
                {uniqueStatuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBriefs.map((brief) => (
                    <tr key={brief.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brief.campaignName || 'Untitled'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brief.brand || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brief.country || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brief.owner}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${brief.status === 'Submitted' ? 'bg-green-100 text-green-800' : 
                            brief.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                            brief.status === 'Archived' ? 'bg-gray-100 text-gray-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {brief.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(brief.updatedAt || brief.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {filteredBriefs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                        No briefs found matching the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 4: Users List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#3483FA]" />
            Users List
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Domain</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a href={`mailto:${u.email}`} className="text-[#3483FA] hover:underline">{u.email}</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.domain}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
