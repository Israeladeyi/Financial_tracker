import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Income() {
  const [income, setIncome] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [projectId, setProjectId] = useState('');
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Fetch existing income
      const { data: incomeData, error: incomeError } = await supabase.from('income').select('*').eq('user_id', user.id);
      if (incomeError) throw incomeError;
      setIncome(incomeData);

      // Fetch projects for dropdown
      const { data: projectsData, error: projectsError } = await supabase.from('projects').select('id, name').eq('user_id', user.id);
      if (projectsError) throw projectsError;
      setProjects(projectsData);

      // Fetch clients for dropdown
      const { data: clientsData, error: clientsError } = await supabase.from('clients').select('id, name').eq('user_id', user.id);
      if (clientsError) throw clientsError;
      setClients(clientsData);

    } catch (error) {
      alert(error.message);
    }
  };

  const addIncome = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase.from('income').insert({
        title, amount, date, status,
        project_id: projectId || null,
        client_id: clientId || null,
        user_id: user.id
      });

      if (error) throw error;
      fetchInitialData(); // Refetch all data
      setTitle(''); setAmount(''); setDate(''); setStatus('pending'); setProjectId(''); setClientId('');
      alert('Income added!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Manage Income</h2>

      <h3>Add New Income</h3>
      <form onSubmit={addIncome}>
        <input type="text" placeholder="Title (e.g., Logo Design)" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
        </select>
        <select value={projectId} onChange={e => setProjectId(e.target.value)}>
            <option value="">Select Project (Optional)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">Select Client (Optional)</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit">Add Income</button>
      </form>

      <hr />

      <h3>Income History</h3>
      <ul>
        {income.map(i => <li key={i.id}>{i.date}: {i.title} - ${i.amount} ({i.status})</li>)}
      </ul>
    </div>
  );
}
