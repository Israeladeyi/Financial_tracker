import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Expenses() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Software');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: expensesData } = await supabase.from('expenses').select(`*, projects ( name )`).eq('user_id', user.id);
    setExpenses(expensesData || []);

    const { data: projectsData } = await supabase.from('projects').select('id, name').eq('user_id', user.id);
    setProjects(projectsData || []);

    setLoading(false);
  };

  const addExpense = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('expenses').insert({ title, amount, date, category, project_id: projectId || null, user_id: user.id });
    fetchInitialData(); // Refetch
    setTitle(''); setAmount(''); setDate(''); setCategory('Software'); setProjectId('');
  };

  const expenseCategories = ['Software', 'Marketing', 'Printing', 'Stock Assets', 'Equipment', 'Miscellaneous'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Expenses</h1>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Expense</h2>
        <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Title" required value={title} onChange={e => setTitle(e.target.value)} className="md:col-span-2 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <input type="number" placeholder="Amount" required value={amount} onChange={e => setAmount(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <select value={category} onChange={e => setCategory(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md">
            {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">No Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button type="submit" className="md:col-span-2 w-full flex justify-center py-2 px-4 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Add Expense</button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Expense History</h2>
        {loading ? <p>Loading...</p> : (
          <ul className="space-y-3">
            {expenses.map(e => (
              <li key={e.id} className="p-4 bg-gray-50 rounded-md">
                <p className="font-semibold">{e.title} - ${e.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{e.date} | Category: {e.category}</p>
                <p className="text-sm text-gray-500">Project: {e.projects?.name || 'N/A'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
