import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  // Form state
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`id, name, client_id, clients ( name )`)
        .eq('user_id', user.id);
      if (projectsError) throw projectsError;
      setProjects(projectsData);

      // Fetch clients for the dropdown
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id);
      if (clientsError) throw clientsError;
      setClients(clientsData);

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from('projects')
        .insert({
            name: newProjectName,
            client_id: selectedClientId || null,
            user_id: user.id
        });

      if (error) throw error;

      // Refetch all data to update list
      fetchData();
      setNewProjectName('');
      setSelectedClientId('');
      alert('Project added!');
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <p>Loading projects...</p>;

  return (
    <div>
      <h2>Manage Projects</h2>

      <h3>Add New Project</h3>
      <form onSubmit={addProject}>
        <input
          type="text"
          placeholder="Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          required
        />
        <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
        >
            <option value="">Select a Client (Optional)</option>
            {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
            ))}
        </select>
        <button type="submit">Add Project</button>
      </form>

      <hr />

      <h3>Your Projects</h3>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`}>
                {project.name} {project.clients ? `(${project.clients.name})` : ''}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
