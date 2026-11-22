import React, { useState } from 'react';
import Card from '../Common/Card';
import { scoreStore, scoreProduct, scoreColor, SCORE_DISCLAIMER } from '../../utils/seoScore';

const ICON = { done: 'check_circle', partial: 'timelapse', todo: 'radio_button_unchecked' };
const ICON_COLOR = { done: '#006d2f', partial: '#d99a00', todo: '#8e9eab' };

// Step 7: whole-store meter with a checklist. Updates live as the tenant types.
export function SeoHealthMeter({ profile, productData, storeType, onGoToProducts }) {
  const [showAll, setShowAll] = useState(false);
  const r = scoreStore(profile, productData, storeType);
  const color = scoreColor(r.score);
  const rows = showAll ? r.checks : r.todo.slice(0, 3);

  const goTo = (c) => {
    if (c.fieldId) {
      const el = document.getElementById(c.fieldId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { try { el.focus({ preventScroll: true }); } catch (_) {} }, 350);
      }
    } else if (c.goTo === 'products' && onGoToProducts) {
      onGoToProducts();
    }
  };

  return (
    <Card className="mb-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="font-headline-md text-headline-md text-[#191c1e] uppercase text-base">Store Quality Score</h2>
          <p className="text-xs text-[#556067] mt-1">
            Complete, helpful pages are easier for customers to trust and for Google to understand.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-bold leading-none" style={{ color }}>{r.score}<span className="text-base">%</span></div>
          <div className="text-xs font-semibold mt-1" style={{ color }}>{r.label}</div>
        </div>
      </div>

      <div
        className="h-2.5 rounded-full bg-[#e0e3e6] overflow-hidden"
        role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.score}
        aria-label={`Store quality score ${r.score} percent, ${r.label}`}
      >
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.score}%`, backgroundColor: color }} />
      </div>

      {r.capped ? (
        <p className="text-xs text-[#8a5a00] bg-[#fff8e6] rounded-lg px-3 py-2 mt-3">
          {r.capped === 'no-products'
            ? 'The score stays low until you add products.'
            : 'The score stays below "Good" until most of your products have a proper description.'}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-sm text-[#006d2f] mt-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">verified</span>
          Everything is filled in. Nice work.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((c) => (
            <li key={c.key} className="flex items-start gap-2">
              <span className="material-symbols-outlined text-lg mt-0.5" style={{ color: ICON_COLOR[c.status] }}>{ICON[c.status]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#191c1e]">{c.label}</p>
                {c.hint ? <p className="text-xs text-[#556067]">{c.hint}</p> : null}
              </div>
              {c.status !== 'done' && (c.fieldId || c.goTo) ? (
                <button
                  type="button"
                  onClick={() => goTo(c)}
                  className="shrink-0 text-xs font-semibold text-[#006d2f] border border-[#bbcbb9] rounded-lg px-3 py-1.5 hover:bg-[#f0faf4] transition-colors"
                >
                  {c.goTo === 'products' ? 'Go to products' : 'Fix'}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e0e3e6]">
        <button type="button" onClick={() => setShowAll(!showAll)} className="text-xs font-semibold text-[#3c4a3d] hover:underline">
          {showAll ? 'Show only what is missing' : 'Show all checks'}
        </button>
        <p className="text-[11px] text-[#8e9eab] text-right max-w-[60%]">{SCORE_DISCLAIMER}</p>
      </div>
    </Card>
  );
}

// Step 2: small bar + one tip under a product's description box.
export function ProductQualityHint({ product, storeType }) {
  const r = scoreProduct(product, storeType);
  const color = scoreColor(r.score);
  const tip = r.tips[0];
  return (
    <div className="mt-1.5" aria-live="polite">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#556067] whitespace-nowrap">Listing quality</span>
        <div className="flex-1 h-1.5 rounded-full bg-[#e0e3e6] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${r.score}%`, backgroundColor: color }} />
        </div>
        <span className="text-[11px] font-semibold" style={{ color }}>{r.score}%</span>
      </div>
      {tip ? <p className="text-xs text-[#556067] mt-1">{tip}</p> : null}
    </div>
  );
}
