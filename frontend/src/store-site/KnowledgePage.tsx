import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import {
  BookOpen,
  Award,
  Gem,
  Flame,
  ChevronRight,
} from 'lucide-react';

export const KnowledgePage: React.FC = () => {
  useSEO({
    title: 'Knowledge Center & Buying Guides',
    description: 'Expert buying and care guides for 24K bullion, BIS hallmarked jewellery, GIA certified gemstones, and Nepali Rudraksha.',
    canonicalPath: '/knowledge',
  });

  const buyingGuides = [
    {
      id: 'gold-guide',
      title: 'Gold Purity, Assay Standards & BIS Hallmarking',
      description: 'Understanding 24K (999.9 pure investment grade) vs 22K (916 hallmark jewellery). How laser assay cards and HUID codes protect investors from adulteration.',
      icon: <Award className="w-6 h-6 text-[#C9A24B]" />,
      tag: 'Bullion Guide',
    },
    {
      id: 'gemstone-guide',
      title: 'Gemstone Grading: Carat, Origin & Treatment Disclosures',
      description: 'Why unheated Burmese rubies and Colombian Muzo emeralds command prestige. How GIA and IGI reports disclose oiling, heat treatments, and geographic origins.',
      icon: <Gem className="w-6 h-6 text-[#2D5A27]" />,
      tag: 'Gemstone Guide',
    },
    {
      id: 'rudraksha-guide',
      title: 'Sacred Rudraksha: Mukhi Classification & Sanctification',
      description: 'Selecting authentic 1 to 21 Mukhi Nepali beads according to Vedic traditions. Botanical authenticity tests, natural internal chambers, and consecration ceremonies.',
      icon: <Flame className="w-6 h-6 text-[#8C3A2D]" />,
      tag: 'Rudraksha Guide',
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Knowledge Center</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="sm">Collector Education</Badge>
          <Badge variant="neutral" size="sm">Proposed Feature</Badge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630] flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[#C9A24B]" />
          Knowledge Center & Buying Guides
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed max-w-2xl">
          Empowering discerning collectors and investors with transparent knowledge on precious metal purity, gemstone geology, and Vedic traditions.
        </p>
      </div>

      {/* 3 Buying Guide Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#5A4630]">
            Expert Buying Guides
          </h2>
          <Badge variant="neutral" size="sm">3 Guides (Proposed)</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {buyingGuides.map((guide) => (
            <Card key={guide.id} variant="surface" className="p-6 border-[#EADFC8] flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-full bg-[#FFFBF3] border border-[#EADFC8] flex items-center justify-center">
                    {guide.icon}
                  </div>
                  <Badge variant="gold" size="sm">{guide.tag}</Badge>
                </div>
                <h3 className="font-serif text-base font-bold text-[#5A4630] leading-snug">
                  {guide.title}
                </h3>
                <p className="text-xs text-[#7A6A55] leading-relaxed">
                  {guide.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#EADFC8] flex items-center justify-between text-xs font-semibold text-[#C9A24B]">
                <span>Read Full Guide</span>
                <Badge variant="neutral" size="sm">Proposed</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Gemstone & Rudraksha Care Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Card variant="surface-alt" className="p-6 border-[#EADFC8] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
              <Gem className="w-5 h-5 text-[#2D5A27]" />
              Natural Gemstone Preservation Guide
            </span>
            <Badge variant="neutral" size="sm">Proposed</Badge>
          </div>
          <p className="text-xs text-[#7A6A55] leading-relaxed">
            Essential care protocols for untreated rubies, emeralds, and sapphires: Avoid ultrasonic cleaners for oiled emeralds, store separately to prevent facet abrasions, and clean gently with mild lukewarm soapy water.
          </p>
        </Card>

        <Card variant="surface-alt" className="p-6 border-[#EADFC8] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#8C3A2D]" />
              Sacred Rudraksha Maintenance & Sanctity
            </span>
            <Badge variant="neutral" size="sm">Proposed</Badge>
          </div>
          <p className="text-xs text-[#7A6A55] leading-relaxed">
            Periodic conditioning of authentic Himalayan beads: Clean periodically with soft bristle brush, nourish with organic sandalwood or sesame oil, and preserve consecration through sacred mantra repetition.
          </p>
        </Card>
      </div>
    </div>
  );
};
