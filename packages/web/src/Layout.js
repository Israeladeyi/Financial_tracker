import { Link, Outlet } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function Layout() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', padding: '1rem' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/clients">Clients</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/income">Income</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/account">My Account</Link>
        <button onClick={handleSignOut} style={{ marginLeft: 'auto' }}>Sign Out</button>
      </nav>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
