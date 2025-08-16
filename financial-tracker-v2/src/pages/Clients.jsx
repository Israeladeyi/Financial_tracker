import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Clients() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('clients').select(`id, name, contact_email`).eq('user_id', user.id);
    if (error) alert(error.message);
    else setClients(data);
    setLoading(false);
  };

  const addClient = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('clients').insert({ name: newClientName, contact_email: newClientEmail, user_id: user.id }).select();
    if (error) {
      alert(error.message);
    } else if (data) {
      setClients([...clients, ...data]);
      setNewClientName('');
      setNewClientEmail('');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Clients</h1>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Client</h2>
        <form onSubmit={addClient} className="space-y-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
            <input id="clientName" type="text" placeholder="e.g., Acme Corp" required value={newClientName} onChange={(e) => setNewClientName(e.target.value)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input id="clientEmail" type="email" placeholder="e.g., contact@acme.com" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Add Client
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Your Clients</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-3">
            {clients.map(client => (
              <li key={client.id} className="p-4 bg-gray-50 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.contact_email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
