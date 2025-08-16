import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Reports() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: income } = await supabase.from('income').select('*').eq('user_id', user.id);
      const { data: expenses } = await supabase.from('expenses').select('*').eq('user_id', user.id);

      const dataForCsv = [
        ['Type', 'Date', 'Title', 'Category', 'Amount', 'Status', 'Project ID', 'Client ID'],
        ...(income || []).map(i => ['Income', i.date, i.title, '', i.amount, i.status, i.project_id, i.client_id]),
        ...(expenses || []).map(e => ['Expense', e.date, e.title, e.category, e.amount, '', e.project_id, ''])
      ];

      const csvContent = "data:text/csv;charset=utf-8," + dataForCsv.map(e => e.join(",")).join("\n");

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "financial_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <p className="mb-4 text-gray-600">Export all of your income and expense data to a single CSV file. You can use this file for your own records or for tax purposes.</p>
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
        >
          {loading ? 'Exporting...' : 'Export All Transactions to CSV'}
        </button>
      </div>
    </div>
  );
}
