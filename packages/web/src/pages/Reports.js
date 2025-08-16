import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Reports() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Fetch all data
      const { data: income, error: incomeError } = await supabase.from('income').select('*').eq('user_id', user.id);
      if (incomeError) throw incomeError;

      const { data: expenses, error: expensesError } = await supabase.from('expenses').select('*').eq('user_id', user.id);
      if (expensesError) throw expensesError;

      // Combine and format data
      const dataForCsv = [
        ['Type', 'Date', 'Title', 'Category', 'Amount', 'Status', 'Project ID', 'Client ID'],
        ...income.map(i => ['Income', i.date, i.title, '', i.amount, i.status, i.project_id, i.client_id]),
        ...expenses.map(e => ['Expense', e.date, e.title, e.category, e.amount, '', e.project_id, ''])
      ];

      // Create CSV string
      const csvContent = "data:text/csv;charset=utf-8," + dataForCsv.map(e => e.join(",")).join("\n");

      // Trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
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
      <h2>Reports</h2>
      <p>Export your financial data to a CSV file.</p>
      <button onClick={handleExport} disabled={loading}>
        {loading ? 'Exporting...' : 'Export All Transactions to CSV'}
      </button>
    </div>
  );
}
