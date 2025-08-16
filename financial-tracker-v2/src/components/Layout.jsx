import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const location = useLocation();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const linkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium";
  const activeLinkClasses = "bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium";

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <p className="text-white font-bold">FinTrack</p>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink to="/" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>Dashboard</NavLink>
                  <NavLink to="/income" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>Income</NavLink>
                  <NavLink to="/expenses" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>Expenses</NavLink>
                  <NavLink to="/projects" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>Projects</NavLink>
                  <NavLink to="/clients" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>Clients</NavLink>
                  <NavLink to="/reports" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>Reports</NavLink>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <NavLink to="/account" className={linkClasses}>My Account</NavLink>
                <button onClick={handleSignOut} className={`${linkClasses} ml-4`}>Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
