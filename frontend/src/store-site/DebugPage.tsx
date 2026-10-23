import React from 'react';
import { useAppStore } from '../store';
import { calculatePrice, formatINR, formatDateTime } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { RefreshCw, Activity } from 'lucide-react';

export const DebugPage: React.FC = () => {
  const {
    rates,
    providerState,
    isFeedStale,
    pricingConfig,
    products,
    tickRates,
    setProviderState,
    applyRateOverride,
    resetDemoData,
  } = useAppStore();

  return (
    <div className="py-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EADFC8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="sm">Internal Diagnostic</Badge>
            <Badge variant={isFeedStale ? 'amber' : 'sage'} size="sm">
              {isFeedStale ? 'FEED STALE (>20s delayed)' : 'ENGINE ACTIVE'}
            </Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#5A4630] flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#C9A24B]" />
            Live Rates & Price Debugger (/debug)
          </h1>
          <p className="text-xs text-[#7A6A55] mt-1">
            Real-time verification of the rate ingestion engine, dynamic price function, and stock reservation states.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={() => tickRates()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Force Rate Tick
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => resetDemoData()}
          >
            Reset Data
          </Button>
        </div>
      </div>

      {/* Live Rate Strip and Provider Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gold 24K */}
        <Card variant="surface" className="p-4 border-[#EADFC8]">
          <div className="text-xs text-[#7A6A55] font-medium uppercase tracking-wider mb-1">
            Gold 24K (999.9)
          </div>
          <div className="text-2xl font-serif font-bold text-[#5A4630] tabular-nums">
            {formatINR(rates.gold24k)}
            <span className="text-xs font-sans text-[#7A6A55] font-normal"> / gram</span>
          </div>
          <div className="text-[11px] text-[#7A6A55] mt-2 flex items-center justify-between">
            <span>Updated: {formatDateTime(rates.lastUpdated)}</span>
            <button
              onClick={() => applyRateOverride('gold24k', rates.gold24k + 100, 'Debugger')}
              className="text-[#C9A24B] hover:underline font-semibold"
            >
              +₹100
            </button>
          </div>
        </Card>

        {/* Gold 22K */}
        <Card variant="surface" className="p-4 border-[#EADFC8]">
          <div className="text-xs text-[#7A6A55] font-medium uppercase tracking-wider mb-1">
            Gold 22K (916)
          </div>
          <div className="text-2xl font-serif font-bold text-[#5A4630] tabular-nums">
            {formatINR(rates.gold22k)}
            <span className="text-xs font-sans text-[#7A6A55] font-normal"> / gram</span>
          </div>
          <div className="text-[11px] text-[#7A6A55] mt-2">
            Basis: 24K × 0.9167
          </div>
        </Card>

        {/* Silver 999 */}
        <Card variant="surface" className="p-4 border-[#EADFC8]">
          <div className="text-xs text-[#7A6A55] font-medium uppercase tracking-wider mb-1">
            Silver 999 Fine
          </div>
          <div className="text-2xl font-serif font-bold text-[#5A4630] tabular-nums">
            {formatINR(rates.silver999)}
            <span className="text-xs font-sans text-[#7A6A55] font-normal"> / gram</span>
          </div>
          <div className="text-[11px] text-[#7A6A55] mt-2 flex items-center justify-between">
            <span>Updated: {formatDateTime(rates.lastUpdated)}</span>
            <button
              onClick={() => applyRateOverride('silver999', rates.silver999 + 5, 'Debugger')}
              className="text-[#C9A24B] hover:underline font-semibold"
            >
              +₹5
            </button>
          </div>
        </Card>

        {/* Provider Controls */}
        <Card variant="surface-alt" className="p-4 border-[#EADFC8] space-y-2">
          <div className="text-xs font-bold text-[#5A4630] uppercase tracking-wider flex items-center justify-between">
            <span>Provider State:</span>
            <Badge
              variant={
                providerState === 'ok'
                  ? 'sage'
                  : providerState === 'primaryFailed'
                  ? 'amber'
                  : 'coral'
              }
              size="sm"
            >
              {providerState}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              onClick={() => setProviderState('ok')}
              className={`text-[10px] py-1 px-1.5 rounded font-medium border text-center transition-colors ${
                providerState === 'ok'
                  ? 'bg-[#DCE8D5] border-[#A4C997] text-[#2D5A27]'
                  : 'bg-white border-[#EADFC8] text-[#5A4630] hover:bg-[#F1E3BD]'
              }`}
            >
              Normal (OK)
            </button>
            <button
              onClick={() => setProviderState('primaryFailed')}
              className={`text-[10px] py-1 px-1.5 rounded font-medium border text-center transition-colors ${
                providerState === 'primaryFailed'
                  ? 'bg-[#FBE7B8] border-[#E8C26E] text-[#7A5310]'
                  : 'bg-white border-[#EADFC8] text-[#5A4630] hover:bg-[#F1E3BD]'
              }`}
            >
              Fail 1st
            </button>
            <button
              onClick={() => setProviderState('bothDown')}
              className={`text-[10px] py-1 px-1.5 rounded font-medium border text-center transition-colors ${
                providerState === 'bothDown'
                  ? 'bg-[#F7D4CF] border-[#E89E95] text-[#8C2E24]'
                  : 'bg-white border-[#EADFC8] text-[#5A4630] hover:bg-[#F1E3BD]'
              }`}
            >
              Fail Both
            </button>
          </div>

          <div className="text-[10px] text-[#7A6A55] pt-1">
            Formula: <strong>{pricingConfig.formulaVersion}</strong> | GST: <strong>3%</strong>
          </div>
        </Card>
      </div>

      {/* Product Price Matrix */}
      <Card variant="surface" className="p-0 border-[#EADFC8] overflow-hidden">
        <div className="px-6 py-4 bg-[#F8EFD9] border-b border-[#EADFC8] flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-[#5A4630]">
              All 16 Products — Real-Time Calculated Price Matrix
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Every price below is calculated live using <code className="font-mono text-[#5A4630]">calculatePrice(product, rates, config)</code>.
            </p>
          </div>
          <Badge variant="neutral" size="sm">16 Active SKUs</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EADFC8] bg-[#FFFBF3] text-[#5A4630] font-semibold">
                <th className="py-3 px-4">SKU / ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category / Model</th>
                <th className="py-3 px-4">Net Wt / Carat</th>
                <th className="py-3 px-4">Metal Value</th>
                <th className="py-3 px-4">Making</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">GST (3%)</th>
                <th className="py-3 px-4 font-bold text-[#5A4630]">Total (INR)</th>
                <th className="py-3 px-4">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFC8]">
              {products.map((product) => {
                const calc = calculatePrice(product, rates, pricingConfig);
                const isRateLinked = product.type === 'rateLinked';

                return (
                  <tr key={product.id} className="hover:bg-[#FFFBF3]/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#7A6A55]">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#5A4630]">{product.name}</div>
                      <div className="text-[10px] text-[#7A6A55]">
                        Lot: {product.lotBatchSerial}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1">
                        <Badge variant={isRateLinked ? 'gold' : 'neutral'} size="sm">
                          {isRateLinked ? 'Rate-Linked' : 'Fixed'}
                        </Badge>
                      </span>
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      {product.category === 'gemstones' || product.category === 'coloured-stones'
                        ? `${product.attributes.gemstone?.caratWeight || 0} ct`
                        : `${product.netWeightG}g`}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-[#7A6A55]">
                      {formatINR(calc.metalValue)}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-[#7A6A55]">
                      {calc.makingCharges > 0 ? formatINR(calc.makingCharges) : '—'}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-[#7A6A55]">
                      {formatINR(calc.subtotal)}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-[#7A6A55]">
                      {formatINR(calc.gstAmount)}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-bold text-sm text-[#5A4630]">
                      {formatINR(calc.total)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            product.stock <= 2
                              ? 'bg-[#E89E95]'
                              : product.stock <= 5
                              ? 'bg-[#E8C26E]'
                              : 'bg-[#A4C997]'
                          }`}
                        />
                        <span className="tabular-nums font-medium text-[#5A4630]">
                          {product.stock - product.reserved} avail
                        </span>
                        <span className="text-[10px] text-[#7A6A55]">
                          ({product.reserved} rsv)
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
