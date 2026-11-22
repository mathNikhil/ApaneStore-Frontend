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

// ── Per-product ─────────────────────────────────────────────────────────────
export function scoreProduct(product, storeType = 'product') {
  const p = product || {};
  const q = textQuality(p.description, PRODUCT_DESC);
  const hasImage = Array.isArray(p.images) && p.images.length > 0;
  const noun = storeType === 'service' ? 'service' : 'product';

  const tips = [];
  if (q.chars === 0) {
    tips.push(`Add a description. Say what the ${noun} is, who it is for and what makes it different.`);
  } else if (q.chars < PRODUCT_DESC.min) {
    tips.push(`Add about ${PRODUCT_DESC.min - q.chars} more characters. Mention size, material, flavour or use.`);
  } else if (q.chars < PRODUCT_DESC.good) {
    tips.push(`Almost there: ${PRODUCT_DESC.good - q.chars} more characters would make it a strong description.`);
  }
  if (q.issues.includes('shouting')) tips.push('Too much CAPITAL LETTERS. Write it like a normal sentence.');
  if (q.issues.includes('repetitive')) tips.push('The same words repeat a lot. Describe different details instead.');
  if (!hasImage) tips.push(`Add at least one photo of the ${noun}.`);

  const score = Math.round((q.value * 0.7 + (hasImage ? 0.3 : 0)) * 100);
  return { score, descChars: q.chars, descValue: q.value, hasImage, tips };
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
  const imgShare = total ? stats.filter((x) => x.s.hasImage).length / total : 0;
  const noun = isService ? 'services' : 'products';
  const needWork = stats.filter((x) => x.s.descValue < 0.6);

  add({ key: 'productDescriptions', fieldId: null, label: `${isService ? 'Service' : 'Product'} descriptions`, weight: 25, value: descAvg, goTo: 'products',
        hint: total === 0 ? `Add your first ${noun} and describe each one.`
            : needWork.length ? `${needWork.length} of ${total} ${noun} need a longer description (80+ characters).`
            : descAvg < 1 ? `Good. A few ${noun} could use more detail.` : '' });
  add({ key: 'productImages', fieldId: null, label: `${isService ? 'Service' : 'Product'} photos`, weight: 10, value: imgShare, goTo: 'products',
        hint: total === 0 ? '' : imgShare < 1 ? `${total - stats.filter((x) => x.s.hasImage).length} of ${total} ${noun} have no photo.` : '' });

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

  return { score, label: scoreLabel(score), checks, todo, capped, productStats: { total, needWork: needWork.length } };
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
