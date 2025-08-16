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
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from('clients')
        .select(`id, name, contact_email`)
        .eq('user_id', user.id);

      if (error) throw error;
      setClients(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from('clients')
        .insert({ name: newClientName, contact_email: newClientEmail, user_id: user.id })
        .select();

      if (error) throw error;

      setClients([...clients, ...data]);
      setNewClientName('');
      setNewClientEmail('');
      alert('Client added!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Manage Clients</h2>

      <h3>Add New Client</h3>
      <form onSubmit={addClient}>
        <input
          type="text"
          placeholder="Client Name"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Contact Email"
          value={newClientEmail}
          onChange={(e) => setNewClientEmail(e.target.value)}
        />
        <button type="submit">Add Client</button>
      </form>

      <hr />

      <h3>Your Clients</h3>
      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <ul>
          {clients.map(client => (
            <li key={client.id}>{client.name} ({client.contact_email})</li>
          ))}
        </ul>
      )}
    </div>
  );
}
