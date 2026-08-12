import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import PublishDomainSelection from './PublishDomainSelection';
import PublishHostingChoice from './PublishHostingChoice';
import PublishOwnHostingConfig from './PublishOwnHostingConfig';
import PublishHostingSuccess from './PublishHostingSuccess';
import PublishDnsRequired from './PublishDnsRequired';
import PublishDnsSuccess from './PublishDnsSuccess';
import PublishPayment from './PublishPayment';
import PublishCongratulations from './PublishCongratulations';
import PublishAlreadyLive from './PublishAlreadyLive';

// ✅ Publish flow: domain -> hosting -> (own hosting config | DNS) -> payment
// -> congratulations. Each screen decides where "Continue" goes next based
// on the domain/hosting choice already saved — see the design discussion
// for the exact skip logic (subdomain skips hosting+DNS entirely; custom
// domain + own hosting skips DNS; only custom domain + our hosting needs
// the DNS screens).
const ResumeRedirect = ({ storeId }) => {
    const [target, setTarget] = useState(null);

    useEffect(() => {
        const resolve = async () => {
            try {
                const result = await storeAPI.getPublishFlowState(storeId);
                if (!result.success) {
                    setTarget('domain');
                    return;
                }
                const { domainConfig, subscription } = result.data;

                if (subscription && subscription.payment_status === 'paid') {
                    setTarget('success');
                } else if (!domainConfig) {
                    setTarget('domain');
                } else if (domainConfig.domain_type === 'subdomain') {
                    setTarget('payment');
                } else if (domainConfig.hosting_type === 'own') {
                    setTarget('payment');
                } else if (domainConfig.dns_status === 'verified') {
                    setTarget('payment');
                } else {
                    setTarget('dns');
                }
            } catch (err) {
                console.error('Failed to resolve publish flow resume step:', err);
                setTarget('domain');
            }
        };
        resolve();
    }, [storeId]);

    if (!target) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
            </div>
        );
    }
    return <Navigate to={`/store-builder/publish/${target}?storeId=${storeId}`} replace />;
};

const PublishFlowRouter = () => {
    const [searchParams] = useSearchParams();
    const storeId = searchParams.get('storeId');

    // 🔒 Post-payment lock: once a store is live, domain/hosting/plan are
    // frozen until the tenant unpublishes. Checked once here, at the top
    // of the router, so a direct URL to any sub-route (e.g. typing
    // /publish/domain?storeId=.. while live) can't bypass it — every path
    // under this router collapses to PublishAlreadyLive instead.
    const [checkingLock, setCheckingLock] = useState(true);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        if (!storeId) return;
        const checkLock = async () => {
            try {
                const result = await storeAPI.getById(storeId);
                if (result.success && result.data.status === 'published') {
                    setIsLive(true);
                }
            } catch (err) {
                console.error('Failed to check store publish status:', err);
            } finally {
                setCheckingLock(false);
            }
        };
        checkLock();
    }, [storeId]);

    if (!storeId) {
        return <Navigate to="/dashboard" replace />;
    }

    if (checkingLock) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
            </div>
        );
    }

    if (isLive) {
        return <PublishAlreadyLive storeId={storeId} />;
    }

    return (
        <Routes>
            <Route path="/" element={<ResumeRedirect storeId={storeId} />} />
            <Route path="/domain" element={<PublishDomainSelection />} />
            <Route path="/hosting" element={<PublishHostingChoice />} />
            <Route path="/own-hosting" element={<PublishOwnHostingConfig />} />
            <Route path="/hosting-success" element={<PublishHostingSuccess />} />
            <Route path="/dns" element={<PublishDnsRequired />} />
            <Route path="/dns-success" element={<PublishDnsSuccess />} />
            <Route path="/payment" element={<PublishPayment />} />
            <Route path="/success" element={<PublishCongratulations />} />
            <Route path="*" element={<Navigate to={`/store-builder/publish?storeId=${storeId}`} replace />} />
        </Routes>
    );
};

export default PublishFlowRouter;
