import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

export default function useMarketStore() {
  const [subscription, setSubscription] = useState(null);
  const [config, setConfig]             = useState(null);
  const [loading, setLoading]           = useState(true);

  const getTenantId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || null;
    } catch { return null; }
  };

  const fetchAll = useCallback(async () => {
    const tenantId = getTenantId();
    const token    = localStorage.getItem('token');
    if (!tenantId || !token) { setLoading(false); return; }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
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
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const tenantId = getTenantId();
  return { subscription, config, tenantId, loading, refetch: fetchAll };
}
