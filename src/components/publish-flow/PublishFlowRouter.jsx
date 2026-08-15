import { Outlet } from 'react-router-dom';

// Simple pass-through router — each individual page handles its own
// navigation. No redirects here to avoid interference with the flow.
const PublishFlowRouter = () => <Outlet />;

export default PublishFlowRouter;
