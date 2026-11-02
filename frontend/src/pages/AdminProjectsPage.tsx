/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { Building } from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const [tab, setTab] = useState<'projects' | 'developers'>('projects');
  const [projects, setProjects] = useState<unknown[]>([]);
  const [developers, setDevelopers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (tab === 'projects') {
        const res = await adminService.getProjects(1, 50);
        setProjects(res.items);
      } else {
        const data = await adminService.getDevelopers();
        setDevelopers(data);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Building className="w-6 h-6 text-brand-primary" />
            <span>Projects & Developer Organizations</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage new residential developments, builder organizations, and RERA approvals</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === 'projects' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setTab('developers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === 'developers' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Developers
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading records...</div>
        ) : tab === 'projects' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold uppercase text-gray-500">
                  <th className="py-3.5 px-4">Project Name</th>
                  <th className="py-3.5 px-4">Developer</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-bold text-gray-900">{p.name}</td>
                    <td className="py-3 px-4 text-brand-primary font-semibold">{p.developerOrganization?.companyName}</td>
                    <td className="py-3 px-4">{p.locality?.name}, {p.city?.name}</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {developers.map((d: any) => (
              <div key={d.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">{d.companyName}</p>
                  <p className="text-xs text-gray-500">{d.description || 'Developer organization'}</p>
                </div>
                <span className="text-xs font-bold text-brand-primary bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  {d._count?.projects || 0} Projects
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
