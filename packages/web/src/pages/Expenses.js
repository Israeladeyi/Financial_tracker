import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Expenses() {
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Fetch existing expenses
      const { data: expensesData, error: expensesError } = await supabase.from('expenses').select('*').eq('user_id', user.id);
      if (expensesError) throw expensesError;
      setExpenses(expensesData);

      // Fetch projects for dropdown
      const { data: projectsData, error: projectsError } = await supabase.from('projects').select('id, name').eq('user_id', user.id);
      if (projectsError) throw projectsError;
      setProjects(projectsData);

    } catch (error) {
      alert(error.message);
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase.from('expenses').insert({
        title, amount, date, category,
        project_id: projectId || null,
        user_id: user.id
      });

      if (error) throw error;
      fetchInitialData(); // Refetch all data
      setTitle(''); setAmount(''); setDate(''); setCategory('Software'); setProjectId('');
      alert('Expense added!');
    } catch (error) {
      alert(error.message);
    }
  };

  const expenseCategories = ['Software', 'Marketing', 'Printing', 'Stock Assets', 'Equipment', 'Miscellaneous'];

  return (
    <div>
      <h2>Manage Expenses</h2>

      <h3>Add New Expense</h3>
      <form onSubmit={addExpense}>
        <input type="text" placeholder="Title (e.g., Adobe Subscription)" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <select value={category} onChange={e => setCategory(e.target.value)}>
            {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={projectId} onChange={e => setProjectId(e.target.value)}>
            <option value="">Select Project (Optional)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button type="submit">Add Expense</button>
      </form>

      <hr />

      <h3>Expense History</h3>
      <ul>
        {expenses.map(e => <li key={e.id}>{e.date}: {e.title} ({e.category}) - ${e.amount}</li>)}
      </ul>
    </div>
  );
}
