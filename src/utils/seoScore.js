// Store / listing quality scoring for the builder ("SEO Health Score").
//
// Deliberately measures COMPLETENESS and HELPFULNESS, not keyword tricks:
//  - keywords are not scored (Google ignores the keywords meta tag)
//  - repeated-word padding and ALL-CAPS text lose points, so it can't be gamed
//  - it never promises rankings; it only says how complete the pages are
//
// Pure functions, no React. Used by SeoQuality.jsx (Step 7 meter, Step 2 hint).

export const SCORE_DISCLAIMER =
  'This shows how complete and helpful your store pages are. It does not guarantee Google rankings.';

export const PRODUCT_DESC = { min: 80, good: 150 };

// \p{M} keeps combining marks (Devanagari matras etc.) inside the word instead of splitting it
const wordsOf = (s) => String(s || '').toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) || [];

// Quality of a piece of free text, 0..1, plus the problems found.
export function textQuality(text, { min, good }) {
  const t = String(text || '').trim();
  const chars = t.length;
  const issues = [];
  if (chars === 0) return { value: 0, chars, issues };

  let value;
  if (chars >= good) value = 1;
  else if (chars >= min) value = 0.6 + 0.4 * ((chars - min) / (good - min));
  else value = 0.2 * (chars / min);

  const words = wordsOf(t);
  const letters = t.replace(/[^\p{L}]/gu, '');
  const upper = letters.replace(/[^\p{Lu}]/gu, '');
  if (letters.length >= 20 && upper.length / letters.length > 0.6) {
    value *= 0.6; issues.push('shouting');          // ALL CAPS
  }
  if (words.length >= 10 && new Set(words).size / words.length < 0.5) {
    value *= 0.5; issues.push('repetitive');        // same words over and over
  }
  return { value, chars, issues };
}

// Hint that names the real problem instead of always saying "add more"
function textHint(q, empty, short) {
  if (q.chars === 0) return empty;
  if (q.issues.includes('shouting')) return 'Too many CAPITAL LETTERS. Write it in normal sentences.';
  if (q.issues.includes('repetitive')) return 'The same words repeat a lot. Describe different things instead.';
  return q.value < 0.9 ? short : '';
}

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
const digits = (s) => String(s || '').replace(/\D/g, '');

// ── Per-product report card ─────────────────────────────────────────────────
// Rows mirror what a tenant can actually do in Step 2. Each row has its own
// max points; rows that don't apply (e.g. "options" on a one-option product)
// are left out and the total is scaled to 100.
export function scoreProduct(product, storeType = 'product') {
  const p = product || {};
  const noun = storeType === 'service' ? 'service' : 'product';
  const rows = [];
  const row = (key, label, max, value, hint) =>
    rows.push({ key, label, max, earned: Math.round(max * value), value, hint: value >= 0.999 ? '' : hint,
                status: value >= 0.999 ? 'done' : value > 0 ? 'partial' : 'todo' });

  // 1. Name
  const nameWords = wordsOf(String(p.name || '').trim()).length;
  const nameVal = nameWords >= 3 ? 1 : nameWords === 2 ? 0.67 : nameWords === 1 ? 0.33 : 0;
  row('name', 'Name (3+ words)', 15, nameVal,
      nameWords === 0 ? `Give the ${noun} a name.`
      : nameWords === 1 ? 'A one-word name is hard to find. Add the type, flavour, size or material.'
      : 'One more word helps, e.g. the size, colour or flavour.');

  // 2 & 3. Photos (first image is the main one)
  const imgs = Array.isArray(p.images) ? p.images.length : 0;
  row('mainPhoto', 'Main photo', 15, imgs >= 1 ? 1 : 0, `Add a clear main photo of the ${noun}.`);
  const extra = Math.max(0, imgs - 1);
  row('morePhotos', 'More photos (2 or more)', 15, extra >= 2 ? 1 : extra === 1 ? 0.53 : 0,
      extra === 1 ? 'Add 1 more photo from a different angle.' : 'Add 2 more photos from different angles.');

  // 4. Price with unit, for every option the customer can buy
  const sizes = (Array.isArray(p.variations) ? p.variations : []).flatMap((v) => (v && v.sizes) || []);
  const okSize = (z) => Number(z.price) > 0 && String(z.unit || '').trim() !== '' && String(z.size || '').trim() !== '';
  const goodSizes = sizes.filter(okSize).length;
  row('price', 'Price with unit', 15, sizes.length ? goodSizes / sizes.length : 0,
      sizes.length === 0 ? 'Add a price.'
      : `${sizes.length - goodSizes} of ${sizes.length} options are missing a price, size or unit (e.g. 500 g, 1 piece).`);

  // 5. Description (biggest weight: it is the text Google and customers read)
  const dq = textQuality(p.description, PRODUCT_DESC);
  row('description', `Description (${PRODUCT_DESC.good}+ characters)`, 30, dq.value,
      dq.chars === 0 ? `Say what the ${noun} is, who it is for and what makes it different.`
      : dq.issues.includes('shouting') ? 'Too many CAPITAL LETTERS. Write it in normal sentences.'
      : dq.issues.includes('repetitive') ? 'The same words repeat a lot. Describe different details instead.'
      : dq.chars < PRODUCT_DESC.min ? `Add about ${PRODUCT_DESC.min - dq.chars} more characters. Mention size, material, flavour or use.`
      : `${PRODUCT_DESC.good - dq.chars} more characters would make it a strong description.`);

  // 6. Options (only when there is more than one to tell apart)
  const vars = Array.isArray(p.variations) ? p.variations : [];
  if (vars.length > 1) {
    const named = vars.filter((v) => String(v.name || '').trim() !== '').length / vars.length;
    const pics = vars.filter((v) => v.image).length / vars.length;
    row('options', 'Options named, with photos', 10, 0.6 * named + 0.4 * pics,
        named < 1 ? 'Name every option (e.g. Paneer, Aloo) so customers and Google can tell them apart.'
                  : 'Add a photo for each option.');
  }

  const max = rows.reduce((a, r) => a + r.max, 0);
  const earned = rows.reduce((a, r) => a + r.earned, 0);
  const score = Math.round((earned / max) * 100);
  const tips = rows.filter((r) => r.status !== 'done').sort((a, b) => (b.max - b.earned) - (a.max - a.earned)).map((r) => r.hint);

  return { score, earned, max, rows, tips, descChars: dq.chars, descValue: dq.value, hasImage: imgs >= 1 };
}

// ── Whole store ─────────────────────────────────────────────────────────────
export function scoreStore(profile, productData, storeType = 'product') {
  const pr = profile || {};
  const isService = storeType === 'service';
  const checks = [];
  const add = (c) => checks.push(c);

  const about = textQuality(pr.aboutUs, { min: 80, good: 200 });
  add({ key: 'aboutUs', fieldId: 'field-aboutUs', label: 'About Us', weight: 20, value: about.value,
        hint: textHint(about,
          'Tell customers who you are, what you sell and where you are based (2 to 3 sentences).',
          'Add a little more: your story, what makes you different, who you sell to.') });

  if (!isService) {
    const ret = textQuality(pr.returnPolicy, { min: 40, good: 100 });
    add({ key: 'returnPolicy', fieldId: 'field-returnPolicy', label: 'Return & Exchange Policy', weight: 10, value: ret.value,
          hint: textHint(ret,
            'Say how many days customers have to return or exchange, and the conditions. It builds trust.',
            'Add the time limit and the condition the item must be in.') });

    const ship = textQuality(pr.shippingInfo, { min: 40, good: 100 });
    add({ key: 'shippingInfo', fieldId: 'field-shippingInfo', label: 'Shipping Information', weight: 10, value: ship.value,
          hint: textHint(ship,
            'Say how long delivery takes, where you ship and any free-shipping limit.',
            'Add delivery time and charges.') });
  }

  const titleLen = String(pr.seoTitle || '').trim().length;
  const titleVal = titleLen === 0 ? 0 : titleLen < 30 ? 0.5 : titleLen <= 60 ? 1 : 0.6;
  add({ key: 'seoTitle', fieldId: 'field-seoTitle', label: 'Search title', weight: 8, value: titleVal,
        hint: titleLen === 0 ? 'Write a title of 30 to 60 characters. Without one, a generic "Shop Online" title is used.'
            : titleLen < 30 ? 'A little short. Aim for 30 to 60 characters, e.g. what you sell + your city.'
            : titleLen > 60 ? 'Too long: Google cuts titles after about 60 characters.' : '' });

  const dLen = String(pr.seoDescription || '').trim().length;
  const dVal = dLen === 0 ? 0 : dLen < 80 ? 0.5 : dLen <= 160 ? 1 : 0.7;
  add({ key: 'seoDescription', fieldId: 'field-seoDescription', label: 'Search description', weight: 7, value: dVal,
        hint: dLen === 0 ? 'Describe your store in 80 to 160 characters. This is the text shown under your name on Google.'
            : dLen < 80 ? 'Add a bit more. Aim for 80 to 160 characters.'
            : dLen > 160 ? 'Too long: Google cuts it after about 160 characters.' : '' });

  const hasContact = isEmail(pr.supportEmail) || digits(pr.officeNumber).length >= 10;
  add({ key: 'contact', fieldId: 'field-supportEmail', label: 'Contact details', weight: 5, value: hasContact ? 1 : 0,
        hint: hasContact ? '' : 'Add a support email or phone number so customers know how to reach you.' });

  const addrParts = [String(pr.storeAddress || '').trim().length >= 10,
                     String(pr.storeCity || '').trim().length > 0,
                     digits(pr.storePincode).length === 6];
  const addrVal = addrParts.filter(Boolean).length / 3;
  add({ key: 'address', fieldId: 'field-storeAddress', label: 'Store address', weight: 5, value: addrVal,
        hint: addrVal === 1 ? '' : 'Add your address, city and pincode so local customers can trust and find you.' });

  // Products
  const products = [];
  ((productData && productData.categories) || []).forEach((c) =>
    (c.products || []).forEach((p) => { if (!p._archived) products.push(p); }));
  const stats = products.map((p) => ({ p, s: scoreProduct(p, storeType) }));
  const total = stats.length;
  const descAvg = total ? stats.reduce((a, x) => a + x.s.descValue, 0) / total : 0;
  const listingAvg = total ? stats.reduce((a, x) => a + x.s.score, 0) / total / 100 : 0;
  const weak = stats.filter((x) => x.s.score < 60);
  const noun = isService ? 'services' : 'products';

  add({ key: 'productListings', fieldId: null, label: `${isService ? 'Service' : 'Product'} listings`, weight: 35, value: listingAvg, goTo: 'products',
        hint: total === 0 ? `Add your first ${noun} and describe each one.`
            : weak.length ? `${weak.length} of ${total} ${noun} score under 60. Open Products and check each SEO score.`
            : listingAvg < 0.9 ? `Good. Open Products to polish the weaker listings.` : '' });

  const totalWeight = checks.reduce((a, c) => a + c.weight, 0);
  const earned = checks.reduce((a, c) => a + c.weight * c.value, 0);
  let score = Math.round((earned / totalWeight) * 100);
  let capped = null;
  if (total === 0) { score = Math.min(score, 39); capped = 'no-products'; }
  else if (descAvg < 0.5) { score = Math.min(score, 69); capped = 'thin-products'; }

  checks.forEach((c) => { c.status = c.value >= 0.9 ? 'done' : c.value > 0 ? 'partial' : 'todo'; });
  // biggest missing points first
  const todo = checks.filter((c) => c.status !== 'done')
    .sort((a, b) => b.weight * (1 - b.value) - a.weight * (1 - a.value));

  return { score, label: scoreLabel(score), checks, todo, capped, productStats: { total, needWork: weak.length } };
}

export function scoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 40) return 'Getting there';
  return 'Needs work';
}

export function scoreColor(score) {
  if (score >= 90) return '#006d2f';
  if (score >= 70) return '#2e9e4f';
  if (score >= 40) return '#d99a00';
  return '#ba1a1a';
}
