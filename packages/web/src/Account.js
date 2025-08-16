import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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

    return () => {
      ignore = true;
    };
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

    if (error) {
      alert(error.message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={updateProfile} className="form-widget">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="businessName">Business Name</label>
        <input
          id="businessName"
          type="text"
          required
          value={businessName || ''}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="currency">Currency</label>
        <input
          id="currency"
          type="text"
          value={currency || ''}
          onChange={(e) => setCurrency(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="paymentMethod">Preferred Payment Method</label>
        <input
          id="paymentMethod"
          type="text"
          value={paymentMethod || ''}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
      </div>

      <div>
        <button className="button block primary" type="submit" disabled={loading}>
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" type="button" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </form>
  );
}
