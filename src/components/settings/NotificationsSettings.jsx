import { useParams, useNavigate } from 'react-router-dom';

export default function NotificationsSettings() {
  const { storeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f7f5] p-6">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-sm text-[#6c7b6b] hover:text-[#191c1e] mb-5 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Dashboard
        </button>

        <h1 className="text-xl font-bold text-[#191c1e] mb-1">Order Notifications</h1>
        <p className="text-sm text-[#6c7b6b] mb-6">
          Connect your Gmail to send order updates directly from your own email to customers.
        </p>

        <div className="bg-white border border-[#e0e3e6] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#fef2f2] flex items-center justify-center text-xl">
            📧
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#191c1e]">Gmail</p>
            <p className="text-xs text-[#6c7b6b]">Not connected</p>
          </div>
          <button
            onClick={() => alert('Gmail OAuth — coming soon')}
            className="px-4 py-2 bg-[#4f46e5] text-white text-sm font-semibold rounded-xl hover:bg-[#4338ca] transition-colors"
          >
            Connect
          </button>
        </div>

        <p className="text-xs text-[#6c7b6b] mt-3 px-1">
          Once connected, order confirmations and status updates will be sent from your Gmail address. Only one Gmail can be connected per store.
        </p>
      </div>
    </div>
  );
}
