import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Account({ session }) {
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from('profiles')
        .select(`business_name, currency, payment_method`)
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (error) {
          console.warn(error);
        } else if (data) {
          setBusinessName(data.business_name);
          setCurrency(data.currency);
          setPaymentMethod(data.payment_method);
        }
      }

      setLoading(false);
    }

    getProfile();
    return () => { ignore = true; };
  }, [session]);

  async function updateProfile(event) {
    event.preventDefault();
    setLoading(true);
    const { user } = session;

    const updates = {
      id: user.id,
      business_name: businessName,
      currency: currency,
      payment_method: paymentMethod,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) alert(error.message);
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <form onSubmit={updateProfile} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="email" type="text" value={session.user.email} disabled
                 className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
        </div>
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            id="businessName"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={businessName || ''}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
          <input
            id="currency"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={currency || ''}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Preferred Payment Method</label>
          <input
            id="paymentMethod"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={paymentMethod || ''}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </div>
        <div>
          <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
