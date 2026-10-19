import React, { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { ProjectDetail } from '@housing-clone/shared';
import { FolderGit2, ShieldCheck, MapPin } from 'lucide-react';

export const ProjectsDashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService
      .getProjects()
      .then((data) => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Developer Organization Projects</h1>
          <p className="text-xs text-gray-500 font-medium">Manage corporate real estate developments & RERA registrations</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <FolderGit2 className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-xs font-bold">No developer projects registered</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {projects.map((proj) => (
            <div key={proj.id} className="py-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">{proj.name}</h3>
                {proj.reraId && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>RERA: {proj.reraId}</span>
                  </span>
                )}
              </div>

              <p className="text-gray-500 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{proj.address}, {proj.locality.name}, {proj.city.name}</span>
              </p>

              <div className="flex items-center space-x-3 text-gray-600 font-semibold pt-1">
                <span>Developer: {proj.developerOrganization.companyName}</span>
                <span>•</span>
                <span>Status: {proj.constructionStatus}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
