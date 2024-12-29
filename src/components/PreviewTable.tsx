import React from 'react';
import { Download } from 'lucide-react';

interface PreviewTableProps {
  data: any[];
  onDownload: () => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({ data, onDownload }) => {
  if (!data || data.length === 0) return null;

  // Define preferred column order with other_dm_name as a priority
  const priorityColumns = ['email', 'fullName', 'firstName', 'lastName', 'title', 'phone', 'mxProvider', 'other_dm_name', 'website'];
  const remainingColumns = Object.keys(data[0]).filter(col => !priorityColumns.includes(col));
  const columns = [...priorityColumns.filter(col => col in data[0]), ...remainingColumns];

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Preview ({data.length} rows processed)
        </h2>
        <button
          onClick={onDownload}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 5).map((row, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[column] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};