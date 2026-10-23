import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import {
  ChevronRight,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const BlogPage: React.FC = () => {
  useSEO({
    title: 'Editorial Blog & Market Insights',
    description: 'Precious metal market insights, Dhanteras traditions, and gemstone heritage editorials.',
    canonicalPath: '/blog',
  });

  const articles = [
    {
      id: 'dhanteras-gold-accumulation',
      title: 'Dhanteras & Diwali 2026: Why Sovereign 24K Coins Outperform Paper Gold',
      category: 'Market Trends',
      date: '12 Oct 2026',
      readTime: '4 min read',
      excerpt:
        'As festive auspicious buying reaches its annual peak, we analyze physical bullion holding advantages, hallmark transparency, and refinery assay guarantees.',
    },
    {
      id: 'muzo-emerald-geology',
      title: 'The Verdant Mystique of Colombian Muzo Emeralds',
      category: 'Gemology',
      date: '04 Oct 2026',
      readTime: '6 min read',
      excerpt:
        'Delving into the hydrothermal geological formations that produce the world’s most coveted deep green beryls and traditional cedarwood stabilization.',
    },
    {
      id: 'sacred-rudraksha-science',
      title: 'Vedic Botany: The Electromagnetic Properties of Authentic Nepali Rudraksha',
      category: 'Sacred Traditions',
      date: '28 Sep 2026',
      readTime: '5 min read',
      excerpt:
        'Scientific research into the inductive capacitor qualities and bio-electric balancing properties of authentic Himalayan Elaeocarpus ganitrus beads.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Editorial Blog</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="sm">Journal & Market Insights</Badge>
          <Badge variant="neutral" size="sm">Proposed Feature</Badge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630]">
          AURUM & CO Editorial
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6A55]">
          Curated perspectives on precious commodity fundamentals, festive traditions, and heritage craftsmanship.
        </p>
      </div>

      {/* Article List */}
      <div className="space-y-6">
        {articles.map((art) => (
          <Card key={art.id} variant="surface" className="p-6 border-[#EADFC8] space-y-3 hover:border-[#C9A24B] transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#C9A24B] uppercase tracking-wider">{art.category}</span>
              <div className="flex items-center gap-3 text-[11px] text-[#7A6A55]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {art.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {art.readTime}
                </span>
                <Badge variant="neutral" size="sm">Proposed</Badge>
              </div>
            </div>

            <h2 className="font-serif text-xl font-bold text-[#5A4630] hover:text-[#C9A24B] transition-colors cursor-pointer">
              {art.title}
            </h2>

            <p className="text-xs text-[#7A6A55] leading-relaxed">
              {art.excerpt}
            </p>

            <div className="pt-2 text-xs font-semibold text-[#5A4630] flex items-center gap-1 cursor-pointer hover:text-[#C9A24B]">
              <span>Read Full Article</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
