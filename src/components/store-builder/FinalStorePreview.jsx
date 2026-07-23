import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import PreviewDeviceToggle from './Preview/PreviewDeviceToggle';
import StorefrontApp from './Preview/StorefrontApp';
import { storeAPI } from '../../services/api';

const FinalStorePreview = () => {
  const navigate = useNavigate();
  const { storeId: urlStoreId } = useParams();
  const { getAllBuilderData, storeId, saveNow } = useStoreBuilder();
  const builderData = getAllBuilderData();

  const [device, setDevice] = useState('desktop');
  const [publishing, setPublishing] = useState(false);
  const [publishedInfo, setPublishedInfo] = useState(null); // { subdomain } once live

  const deviceWidths = { desktop: '1200px', tablet: '768px', mobile: '400px' };
  // Fixed device viewport heights (roughly real device screen heights) so the
  // footer nav has a stable "device" to stay pinned to the bottom of.
  const deviceHeights = { desktop: '820px', tablet: '900px', mobile: '812px' };

  const primaryColor = builderData?.brand?.colors?.primary || '#25D366';
  const secondaryColor = builderData?.brand?.colors?.secondary || '#556067';

  const handlePublish = async () => {
    if (!window.confirm('Ready to publish your store? This will make it live at its public URL.')) return;
    setPublishing(true);
    try {
      // Make sure the very latest edits are saved before flipping it live.
      const id = (await saveNow()) || storeId || urlStoreId;
      const result = await storeAPI.update(id, { status: 'published' });
      const subdomain = result?.data?.subdomain;
      setPublishedInfo({ subdomain });
    } catch (e) {
      console.error('Failed to publish store:', e);
      alert('Publishing failed — check your connection and try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col">
      {/* Top Bar - Device Toggle & Actions */}
      <div className="bg-white border-b px-4 py-3 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/store-builder/${urlStoreId}/step/7`)}
            className="text-[#556067] hover:bg-[#f2f4f7] p-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="font-semibold text-lg">Store Preview</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <PreviewDeviceToggle device={device} onChange={setDevice} />

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 rounded-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: primaryColor }}
          >
            {publishing ? 'Publishing...' : 'Ready to Publish'}
          </button>
          <button
            onClick={() => navigate(`/store-builder/${urlStoreId}/step/7`)}
            className="px-4 py-2 rounded-lg font-medium border hover:bg-[#f2f4f7] transition-colors"
            style={{ borderColor: secondaryColor, color: secondaryColor }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Store Content - Scaled to Device */}
      <div className="flex-1 overflow-y-auto bg-[#f2f4f7] p-4 flex justify-center">
        <StorefrontApp
          builderData={builderData}
          storeId={storeId || urlStoreId}
          device={device}
          className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500"
          style={{ width: '100%', maxWidth: deviceWidths[device] || '1200px', height: deviceHeights[device] || '820px' }}
        />
      </div>

      {/* Published success modal — gives the tenant the real, live link */}
      {publishedInfo && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <span className="material-symbols-outlined text-5xl text-[#006d2f] block mb-3">check_circle</span>
            <h3 className="text-xl font-bold text-[#191c1e] mb-2">Your store is live! 🎉</h3>
            <p className="text-sm text-[#556067] mb-4">
              Running locally for now — customers can visit at:
            </p>
            <div className="bg-[#f2f4f7] rounded-lg px-4 py-3 mb-6 break-all font-mono text-sm text-[#006d2f]">
              localhost:3002/?store={publishedInfo.subdomain}
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`http://localhost:3002/?store=${publishedInfo.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                Visit Your Live Store
              </a>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 rounded-xl font-semibold text-[#556067] hover:bg-[#eceef1] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalStorePreview;
