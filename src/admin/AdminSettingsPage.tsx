import React from 'react';
import { RouteStub } from '../components/RouteStub';

export const AdminSettingsPage: React.FC = () => {
  return (
    <RouteStub
      title="Global Platform Settings & Demo Controls"
      category="System Configuration"
      path="/admin/settings"
      description="Quote lock duration (default 10 minutes), Demo speed toggle (quote lock 60s, session timeout 60s), brand name constant, and Reset Demo Data action."
      phaseIntroduced="Phase 11: Settings & Demo Speed"
      actions={[
        { label: 'View Platform Integrations', to: '/admin/platform' },
        { label: 'View Audit Log', to: '/admin/audit' },
      ]}
    />
  );
};
