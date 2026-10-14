import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Sparkles, Calendar, Gift, ArrowRight, ShieldCheck, Gem } from 'lucide-react';

export const OccasionsPage: React.FC = () => {
  useSEO({
    title: 'Auspicious Festivals & Occasions Guide',
    description: 'Auspicious Muhurat dates for gold buying, sacred gift calendars, Dhanteras, and wedding jewellery curation.',
    canonicalPath: '/occasions',
  });

  const occasions = [
    {
      id: 'dhanteras',
      title: 'Dhanteras & Diwali Treasury',
      tagline: 'The Ultimate Auspicious Metal Buying Muhurat',
      date: 'Autumn 2026',
      description:
        'Celebrate Goddess Lakshmi and Lord Dhanvantari with 999.9 pure 24K gold coins, silver coins, and Lakshmi-Ganesh bullion bars.',
      category: 'gold',
      badge: 'High Muhurat Demand',
    },
    {
      id: 'akshaya-tritiya',
      title: 'Akshaya Tritiya Prosperity',
      tagline: 'Eternal Wealth & Inexhaustible Fortune',
      date: 'Spring 2026',
      description:
        'Purchasing gold on Akshaya Tritiya signifies unending prosperity. Choose from investment cast bars and 22K hallmark heirloom ornaments.',
      category: 'gold',
      badge: 'Annual Bullion Rush',
    },
    {
      id: 'weddings',
      title: 'Shaadi & Vivaha Splendour',
      tagline: 'Bridal Heritage & Royal Dowry Sets',
      date: 'Year-Round Auspicious Dates',
      description:
        'Handcrafted 22K royal bridal jewellery, unheated Burmese ruby sets, and Colombian emerald pendants certified by international laboratories.',
      category: 'gemstones',
      badge: 'Concierge Curation',
    },
    {
      id: 'shravan',
      title: 'Shravan Maas & Mahashivratri',
      tagline: 'Sacred Consecrated Nepali Rudraksha',
      date: 'Sacred Himalayan Calendar',
      description:
        'Empower spiritual sadhana with lab-tested Nepali 5 Mukhi and 7 Mukhi Rudraksha, capped in 999 fine silver and energized with Vedic mantras.',
      category: 'rudraksha',
      badge: 'Spiritual Alignment',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="gold" size="sm">Proposed Feature</Badge>
          <span className="text-xs uppercase tracking-wider text-[#7A6A55] font-semibold">Festive Treasury</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630]">
          Auspicious Festivals & Occasion Gifting
        </h1>
        <p className="text-sm text-[#7A6A55] mt-2 max-w-2xl">
          Curated investment bullion, astrological gemstones, and sacred heritage gifting mapped to auspicious Vedic Muhurats and milestone family celebrations.
        </p>
      </div>

      {/* Featured Occasion Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#F8EFD9] via-[#FAF3E2] to-[#F1E3BD] border border-[#C9A24B]/40 shadow-sm relative overflow-hidden">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full border border-[#C9A24B]/30 text-xs font-semibold text-[#5A4630]">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>2026 Auspicious Muhurat Calendar Active</span>
            <Badge variant="neutral" size="sm">Proposed</Badge>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A4630]">
            Pre-Lock Rates for Upcoming Festive Seasons
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6A55] leading-relaxed">
            Avoid festive market volatility. Our proprietary rate reservation system allows registered investors to reserve fine bullion up to 30 days before peak Muhurats with guaranteed tamper-proof custody.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/c/gold">
              <Button variant="primary" size="md">
                Explore Gold Bullion
              </Button>
            </Link>
            <Link to="/gifting-enquiry">
              <Button variant="secondary" size="md" className="bg-white">
                Corporate & Festive Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Occasion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {occasions.map((occ) => (
          <div
            key={occ.id}
            className="p-6 bg-white border border-[#EADFC8] rounded-xl shadow-xs hover:border-[#C9A24B] transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7A6A55]">
                <Calendar className="w-3.5 h-3.5 text-[#C9A24B]" />
                {occ.date}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="gold" size="sm">{occ.badge}</Badge>
                <Badge variant="neutral" size="sm">Proposed</Badge>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-[#5A4630]">{occ.title}</h3>
              <p className="text-xs font-semibold text-[#C9A24B] mt-0.5">{occ.tagline}</p>
            </div>

            <p className="text-xs text-[#7A6A55] leading-relaxed">
              {occ.description}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-[#EADFC8]/60">
              <Link
                to={`/c/${occ.category}`}
                className="text-xs font-bold text-[#5A4630] hover:text-[#C9A24B] flex items-center gap-1.5"
              >
                <span>Browse Curated Pieces</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C9A24B]" />
              </Link>
              <span className="text-[11px] text-[#7A6A55]">100% Insured Delivery</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Commitments */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#EADFC8]">
        <div className="p-4 bg-[#F8EFD9]/40 border border-[#EADFC8] rounded-lg text-center space-y-1">
          <ShieldCheck className="w-5 h-5 text-[#C9A24B] mx-auto" />
          <h4 className="text-xs font-bold text-[#5A4630]">Assay Certified Bullion</h4>
          <p className="text-[11px] text-[#7A6A55]">Laser-serialized tamper-proof assay cards</p>
        </div>
        <div className="p-4 bg-[#F8EFD9]/40 border border-[#EADFC8] rounded-lg text-center space-y-1">
          <Gift className="w-5 h-5 text-[#C9A24B] mx-auto" />
          <h4 className="text-xs font-bold text-[#5A4630]">Velvet Luxury Packaging</h4>
          <p className="text-[11px] text-[#7A6A55]">Complimentary satin boxes & wax-sealed certs</p>
        </div>
        <div className="p-4 bg-[#F8EFD9]/40 border border-[#EADFC8] rounded-lg text-center space-y-1">
          <Gem className="w-5 h-5 text-[#C9A24B] mx-auto" />
          <h4 className="text-xs font-bold text-[#5A4630]">Astrological Suitability</h4>
          <p className="text-[11px] text-[#7A6A55]">Consult our Vedic gemology council</p>
        </div>
      </div>
    </div>
  );
};
