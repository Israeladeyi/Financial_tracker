import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const [newProjectName, setNewProjectName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: projectsData } = await supabase.from('projects').select(`id, name, clients ( name )`).eq('user_id', user.id);
    setProjects(projectsData || []);

    const { data: clientsData } = await supabase.from('clients').select('id, name').eq('user_id', user.id);
    setClients(clientsData || []);

    setLoading(false);
  };

  const addProject = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('projects').insert({ name: newProjectName, client_id: selectedClientId || null, user_id: user.id });
    fetchData(); // Refetch
    setNewProjectName('');
    setSelectedClientId('');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Projects</h1>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Project</h2>
        <form onSubmit={addProject} className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Project Name</label>
            <input id="projectName" type="text" placeholder="e.g., Website Redesign" required value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700">Assign to Client (Optional)</label>
            <select id="client" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="">None</option>
              {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Add Project
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-3">
            {projects.map(project => (
              <li key={project.id} className="p-4 bg-gray-50 rounded-md">
                <Link to={`/projects/${project.id}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
                  {project.name}
                </Link>
                <p className="text-sm text-gray-500">{project.clients ? `Client: ${project.clients.name}` : 'No client assigned'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
