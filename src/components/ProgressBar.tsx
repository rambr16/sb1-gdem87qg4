import React from 'react';
import { useProcessorStore } from '../store/processor';

export const ProgressBar: React.FC = () => {
  const { status } = useProcessorStore();
  
  if (!status.stage) return null;
  
  return (
    <div className="w-full mt-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{status.stage}</span>
        <span className="text-sm font-medium text-gray-700">
          {status.eta > 0 && !status.isComplete
            ? `ETA: ${Math.ceil(status.eta)}s`
            : status.isComplete
            ? 'Complete'
            : ''}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${status.progress}%` }}
        />
      </div>
      {status.error && (
        <p className="mt-2 text-red-600">{status.error}</p>
      )}
    </div>
  );
};