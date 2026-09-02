import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';

export default function useMarketStore() {
  const [subscription, setSubscription] = useState(null);
  const [config, setConfig]             = useState(null);
  const [loading, setLoading]           = useState(true);

  const getStoreId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.storeId || user.store_id || localStorage.getItem('storeId') || null;
    } catch { return null; }
  };

  const fetchAll = useCallback(async () => {
    const storeId = getStoreId();
    if (!storeId) { setLoading(false); return; }
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    setLoading(true);
    try {
      const [subRes, cfgRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/stores/${storeId}/market/subscription`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/stores/${storeId}/market/config`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ ok: false })),
      ]);
      if (subRes.ok) setSubscription(await subRes.json());
      if (cfgRes.ok) setConfig(await cfgRes.json());
    } catch (err) {
      console.error('[useMarketStore]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { subscription, config, loading, refetch: fetchAll };
}
