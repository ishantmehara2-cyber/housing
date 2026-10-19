import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface DraftSaveIndicatorProps {
  status: SaveStatus;
}

export const DraftSaveIndicator: React.FC<DraftSaveIndicatorProps> = ({ status }) => {
  if (status === 'saving') {
    return (
      <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
        <span>Autosaving draft...</span>
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div className="flex items-center space-x-1.5 text-xs text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
        <span>Draft saved</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center space-x-1.5 text-xs text-red-700 font-medium bg-red-50 px-3 py-1 rounded-full border border-red-200">
        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
        <span>Unable to save draft</span>
      </div>
    );
  }

  return null;
};
