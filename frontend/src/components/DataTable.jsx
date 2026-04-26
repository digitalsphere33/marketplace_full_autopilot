import React from 'react';

export default function DataTable({ columns, data, actions }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-gray-700">{col.label}</th>
            ))}
            {actions && <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-800">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
              {actions && (
                <td className="px-4 py-3">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
