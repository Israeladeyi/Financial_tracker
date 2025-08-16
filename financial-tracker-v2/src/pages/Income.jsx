import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Income() {
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: incomeData } = await supabase.from('income').select(`*, projects ( name ), clients ( name )`).eq('user_id', user.id);
    setIncome(incomeData || []);

    const { data: projectsData } = await supabase.from('projects').select('id, name').eq('user_id', user.id);
    setProjects(projectsData || []);

    const { data: clientsData } = await supabase.from('clients').select('id, name').eq('user_id', user.id);
    setClients(clientsData || []);

    setLoading(false);
  };

  const addIncome = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('income').insert({ title, amount, date, status, project_id: projectId || null, client_id: clientId || null, user_id: user.id });
    fetchInitialData(); // Refetch
    setTitle(''); setAmount(''); setDate(''); setStatus('pending'); setProjectId(''); setClientId('');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Income</h1>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Income</h2>
        <form onSubmit={addIncome} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Title" required value={title} onChange={e => setTitle(e.target.value)} className="md:col-span-2 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <input type="number" placeholder="Amount" required value={amount} onChange={e => setAmount(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <select value={status} onChange={e => setStatus(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="pending">Pending</option>
            <option value="received">Received</option>
          </select>
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">No Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="md:col-span-2 block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">No Client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="md:col-span-2 w-full flex justify-center py-2 px-4 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Add Income</button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Income History</h2>
        {loading ? <p>Loading...</p> : (
          <ul className="space-y-3">
            {income.map(i => (
              <li key={i.id} className="p-4 bg-gray-50 rounded-md">
                <p className="font-semibold">{i.title} - ${i.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{i.date} | Status: {i.status}</p>
                <p className="text-sm text-gray-500">Project: {i.projects?.name || 'N/A'}, Client: {i.clients?.name || 'N/A'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
