import { useEffect } from 'react';
import { BRAND_NAME } from './constants';

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
}

export function useSEO({ title, description, canonicalPath }: SEOProps): void {
  useEffect(() => {
    // 1. Set Title
    document.title = `${title} | ${BRAND_NAME}`;

    // 2. Set Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Set Canonical URL
    const canonicalUrl = `https://aurum.internal${canonicalPath || window.location.pathname}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
  }, [title, description, canonicalPath]);
}
