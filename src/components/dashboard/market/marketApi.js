// Central API service for all Market feature calls
// All methods return data directly — no .data wrapper needed

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
const DAILY_LIMIT = 75;

const getToken = () => localStorage.getItem('token') || '';

const request = async (method, url, data, isFormData = false) => {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
};

export const marketApi = {
  // Messages
  getMessages:  (tid) => request('GET',    `/api/tenants/${tid}/market/messages`),
  createMessage:(tid, d) => request('POST', `/api/tenants/${tid}/market/messages`, d),
  saveDraft:    (tid, d) => request('POST', `/api/tenants/${tid}/market/messages/draft`, d),
  updateMessage:(tid, id, d) => request('PUT', `/api/tenants/${tid}/market/messages/${id}`, d),
  deleteMessage:(tid, id) => request('DELETE', `/api/tenants/${tid}/market/messages/${id}`),

  // Groups
  getGroups:   (tid) => request('GET',    `/api/tenants/${tid}/market/groups`),
  createGroup: (tid, d) => request('POST', `/api/tenants/${tid}/market/groups`, d),
  deleteGroup: (tid, id) => request('DELETE', `/api/tenants/${tid}/market/groups/${id}`),

  // Contacts
  getContacts:   (tid) => request('GET',    `/api/tenants/${tid}/market/contacts`),
  createContact: (tid, d) => request('POST', `/api/tenants/${tid}/market/contacts`, d),
  deleteContact: (tid, id) => request('DELETE', `/api/tenants/${tid}/market/contacts/${id}`),

  // Media upload
  uploadPhoto: async (tid, file) => {
    const fd = new FormData();
    fd.append('image', file);
    return request('POST', `/api/tenants/${tid}/market/media/upload`, fd, true);
  },

  // WhatsApp connection
  getStatus:    (tid) => request('GET',  `/api/tenants/${tid}/market/connect/status`),
  generateQR:   (tid) => request('POST', `/api/tenants/${tid}/market/connect/qr`),
  disconnect:   (tid) => request('POST', `/api/tenants/${tid}/market/connect/disconnect`),

  // Subscription
  getSubscription: (tid) => request('GET',  `/api/tenants/${tid}/market/subscription`),
  getConfig:       (tid) => request('GET',  `/api/tenants/${tid}/market/config`),
  saveConfig:      (tid, d) => request('PUT', `/api/tenants/${tid}/market/config`, d),

  // Addon plans
  getPlans: () => request('GET', `/api/addon-plans?addon_type=whatsapp_market`),
  subscribe:(tid, d) => request('POST', `/api/addon-plans/subscribe`, { store_id: tid, ...d }),
};

export { DAILY_LIMIT };
