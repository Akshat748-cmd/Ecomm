import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { SearchX } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-12 max-w-2xl mx-auto">
      <EmptyState
        icon={<SearchX className="w-8 h-8 stroke-[1.5]" />}
        title="Page Not Found (404)"
        description="The precious item or page you are looking for does not exist or may have been relocated. Please check the web address or browse our collections."
        actionLabel="Return to Storefront"
        onAction={() => {
          window.location.href = '/';
        }}
      />
      <div className="mt-6 text-center text-xs text-[#7A6A55]">
        Need assistance? <Link to="/support" className="text-[#C9A24B] underline">Contact Customer Concierge</Link>
      </div>
    </div>
  );
};
