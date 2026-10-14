import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

export interface RouteStubProps {
  title: string;
  category?: string;
  path: string;
  description?: string;
  phaseIntroduced?: string;
  actions?: { label: string; to: string }[];
}

export const RouteStub: React.FC<RouteStubProps> = ({
  title,
  category = 'Store Route',
  path,
  description = 'This route is scaffolded in Phase 0 with the light design system and will be fully populated in its respective phase.',
  phaseIntroduced = 'Phase 0 Stub',
  actions = [],
}) => {
  return (
    <div className="py-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Badge variant="gold" size="sm">{category}</Badge>
        <Badge variant="neutral" size="sm">{phaseIntroduced}</Badge>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#5A4630]">
          {title}
        </h1>
        <p className="text-sm text-[#7A6A55] max-w-2xl">
          {description}
        </p>
      </div>

      <Card variant="surface" className="border-[#EADFC8]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EADFC8]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#C9A24B]" />
            <span className="text-xs font-mono text-[#5A4630] font-medium">Route Path: {path}</span>
          </div>
          <Badge variant="sage" size="sm">Light Theme Active</Badge>
        </div>

        <p className="text-xs text-[#7A6A55] leading-relaxed mb-4">
          Status: Ivory background (<code className="text-[#5A4630] font-mono">#FFFBF3</code>), Cormorant Garamond headings, tabular number formatting, zero dark theme tokens.
        </p>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {actions.map((act) => (
              <Link key={act.to} to={act.to}>
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {act.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
