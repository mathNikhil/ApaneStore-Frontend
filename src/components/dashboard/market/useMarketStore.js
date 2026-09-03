import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

export default function useMarketStore() {
  const [subscription, setSubscription] = useState(null);
  const [config, setConfig]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const fetchedRef = useRef(false);

  const getTenantId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || null;
    } catch { return null; }
  };

  const tenantId = getTenantId();

  useEffect(() => {
    if (fetchedRef.current || !tenantId) { setLoading(false); return; }
    fetchedRef.current = true;
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const run = async () => {
      try {
        const [subRes, cfgRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/tenants/${tenantId}/market/subscription`, { headers }),
          fetch(`${API_BASE_URL}/api/tenants/${tenantId}/market/config`, { headers }).catch(() => null),
        ]);
        if (subRes.ok) setSubscription(await subRes.json());
        if (cfgRes && cfgRes.ok) setConfig(await cfgRes.json());
      } catch (err) {
        console.error('[useMarketStore]', err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [tenantId]);

  const refetch = () => { fetchedRef.current = false; };
  return { subscription, config, storeId: tenantId, tenantId, loading, refetch };
}
