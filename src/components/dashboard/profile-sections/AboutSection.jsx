import React from 'react';

/* ── small primitives ── */
const Label = ({ children }) => (
  <p className="text-xs font-bold tracking-widest uppercase text-[#006d2f] mb-2">{children}</p>
);
const SectionTitle = ({ children }) => (
  <h2 className="text-2xl font-bold text-[#111a14] leading-tight mb-3">{children}</h2>
);
const SectionDesc = ({ children }) => (
  <p className="text-sm text-[#556b5c] mb-8 max-w-xl">{children}</p>
);

/* ── feature card ── */
const FeatureCard = ({ icon, title, desc, chip, chipColor }) => (
  <div className="bg-white border border-[#c8e8d2] rounded-xl p-5 flex flex-col shadow-sm">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 bg-[#dff5e8]">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-[#111a14] mb-1">{title}</h3>
    <p className="text-xs text-[#556b5c] leading-relaxed flex-1">{desc}</p>
    {chip && (
      <span className={`mt-3 self-start text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded ${chipColor}`}>
        {chip}
      </span>
    )}
  </div>
);

/* ── spotlight (2-col card) ── */
const Spotlight = ({ badge, title, desc, bullets, chip, chipColor, visual, style }) => (
  <div className="bg-white border border-[#c8e8d2] rounded-xl p-7 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-4" style={style}>
    <div>
      <span className="inline-block bg-[#dff5e8] text-[#006d2f] text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded mb-3">
        {badge}
      </span>
      <h3 className="text-base font-bold text-[#111a14] leading-snug mb-2">{title}</h3>
      <p className="text-xs text-[#556b5c] leading-relaxed mb-3">{desc}</p>
      <ul className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="text-xs text-[#556b5c] pl-5 relative before:content-['✓'] before:absolute before:left-0 before:text-[#25D366] before:font-bold">
            {b}
          </li>
        ))}
      </ul>
      {chip && (
        <span className={`mt-3 inline-block text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded ${chipColor}`}>
          {chip}
        </span>
      )}
    </div>
    {visual}
  </div>
);

/* ── WhatsApp demo chat ── */
const WaDemo = ({ title, messages }) => (
  <div className="bg-[#e8f5e9] rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#1b5e20]">
      <div className="w-2 h-2 rounded-full bg-[#25D366]" />
      {title}
    </div>
    {messages.map((m, i) => (
      <div key={i} className={`bg-white rounded-xl px-3 py-2 mb-1.5 text-xs text-[#1a1a1a] shadow-sm max-w-[88%] leading-relaxed ${m.sent ? 'ml-auto bg-[#dcf8c6] text-right rounded-br-sm' : 'rounded-bl-sm'}`}>
        <span dangerouslySetInnerHTML={{ __html: m.text }} />
        {m.time && <div className="text-[10px] text-gray-400 mt-1 text-right">{m.time}</div>}
      </div>
    ))}
    <div className="text-[10px] text-[#25D366] font-bold text-right mt-1">{messages[messages.length - 1]?.label || ''}</div>
  </div>
);

/* ── decorative QR ── */
const QrDemo = () => {
  const pattern = [
    [1,1,1,0,1,1,1],
    [1,0,1,0,1,0,1],
    [1,1,1,0,1,1,1],
    [0,0,1,1,0,0,1],
    [1,1,0,1,0,1,0],
    [1,0,1,0,1,0,1],
    [1,1,0,1,1,1,1],
  ];
  return (
    <div className="bg-[#eaf6ef] border-2 border-dashed border-[#c8e8d2] rounded-xl p-6 flex flex-col items-center gap-3">
      <div className="w-24 h-24 border-2 border-[#006d2f] rounded-lg p-2 bg-white grid gap-0.5" style={{ gridTemplateColumns: 'repeat(7,1fr)', gridTemplateRows: 'repeat(7,1fr)' }}>
        {pattern.flat().map((cell, i) => (
          <div key={i} className={`rounded-[1px] ${cell ? 'bg-[#006d2f]' : ''}`} />
        ))}
      </div>
      <p className="text-xs font-semibold text-[#006d2f]">yourstore.aapnaestore.com</p>
      <p className="text-[11px] text-[#556b5c] text-center">Table 4 · Dine-in · Scan to order</p>
      <p className="text-[10px] text-[#556b5c]">↓ Real-time in your orders dashboard</p>
    </div>
  );
};

/* ── compare tables ── */
const cellStyle = (val, isUs) => {
  if (isUs) return 'font-bold text-[#006d2f]';
  if (val === '✓') return 'text-green-600';
  if (val === '✗') return 'text-red-500';
  return 'text-amber-600 text-xs';
};

const CompareTableBlock = ({ label, headers, rows }) => (
  <div className="mb-8">
    <p className="text-[10px] font-bold tracking-widest uppercase text-[#006d2f] mb-2">{label}</p>
    <div className="overflow-x-auto rounded-xl border border-[#c8e8d2] shadow-sm">
      <table className="w-full text-xs min-w-[540px] bg-white">
        <thead>
          <tr className="bg-[#006d2f] text-white">
            {headers.map((h, i) => (
              <th key={i} className={`px-4 py-3 font-semibold text-left ${i > 0 ? 'text-center' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([cap, ...vals], ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-[#f3faf5]' : 'bg-white'}>
              <td className="px-4 py-3 text-[#111a14]">{cap}</td>
              {vals.map((v, ci) => (
                <td key={ci} className={`px-4 py-3 text-center text-sm ${cellStyle(v, ci === 0)}`}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const productCompareRows = [
  ['Branded store (your name, not theirs)',    '✓','✗','✗','✓'],
  ['0% commission on all sales',               '✓','✓','✗','✓'],
  ['WhatsApp auto customer sync',              '✓','✗','✗','✗'],
  ['Abandoned cart WhatsApp recovery',         '✓','✗','✗','✗'],
  ['QR code ordering (table / counter)',       '✓','✗','~','✗'],
  ['Dine-in / restaurant mode',               '✓','✗','✓','✗'],
  ['GST invoice auto-generation',             '✓','✗','~','~'],
  ['Single POS for online + offline',         '✓','✗','✗','✗'],
  ['Direct checkout (no DMs)',                '✓','✗','✓','✓'],
  ['Payment direct to your account',          '✓','✗','✗','✓'],
  ['Guided store builder wizard',             '✓','✗','✗','~'],
];

const serviceCompareRows = [
  ['Your own branded booking page',              '✓','✗','✗','✗'],
  ['Zero booking commission',                    '✓','✗','✓','✓'],
  ['Real-time slot booking',                     '✓','✓','✗','✗'],
  ['10-min slot hold (no double-booking)',        '✓','~','✗','✗'],
  ['Staff-specific calendars',                   '✓','✓','✗','✗'],
  ['Custom service durations & working hours',   '✓','✓','✗','✗'],
  ['WhatsApp booking confirmation',              '✓','✗','~','✗'],
  ['Daily schedule PDF (print-ready)',           '✓','~','✗','✓'],
  ['Payment at time of booking (UPI/card)',      '✓','✓','✗','✗'],
  ['You own the customer relationship',          '✓','✗','✓','✓'],
];

/* ── appointment booking demo visual ── */
const BookingDemo = () => (
  <div className="bg-white border border-[#c8e8d2] rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-[#dff5e8] flex items-center justify-center text-sm">💆</div>
      <div>
        <div className="text-xs font-bold text-[#111a14]">Book Deep Tissue Massage</div>
        <div className="text-[10px] text-[#556b5c]">60 mins · ₹1,200</div>
      </div>
    </div>
    {/* date strip */}
    <div className="flex gap-1.5 mb-3 overflow-x-auto">
      {[['Thu','30 Oct'],['Fri','31 Oct'],['Sat','1 Nov']].map(([d, dt], i) => (
        <div key={d} className={`flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-lg border text-[10px] font-semibold ${i === 1 ? 'border-[#006d2f] bg-[#dff5e8] text-[#006d2f]' : 'border-[#e0e3e6] text-[#556b5c]'}`}>
          <span>{d}</span><span className="opacity-70 font-normal">{dt}</span>
        </div>
      ))}
    </div>
    {/* staff tabs */}
    <div className="flex gap-1.5 mb-2">
      {['Any Staff','Sunil','Prakhar'].map((s, i) => (
        <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${i === 2 ? 'bg-[#006d2f] text-white border-[#006d2f]' : 'text-[#556b5c] border-[#e0e3e6]'}`}>{s}</span>
      ))}
    </div>
    {/* slot grid */}
    <div className="grid grid-cols-3 gap-1.5 mb-3">
      {[['10:00','available'],['11:00','picked'],['12:00','available'],['13:00','held'],['14:00','available'],['15:00','available']].map(([t, state]) => (
        <div key={t} className={`text-center py-1.5 rounded-lg text-[10px] font-semibold border
          ${state === 'picked'   ? 'bg-[#006d2f] text-white border-[#006d2f]' :
            state === 'held'    ? 'bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]' :
                                  'bg-[#f3faf5] text-[#111a14] border-[#c8e8d2]'}`}>
          {t}{state === 'held' ? ' 🔒' : state === 'picked' ? ' ✓' : ''}
        </div>
      ))}
    </div>
    <div className="text-[10px] text-[#556b5c] flex items-center gap-3">
      <span><span className="inline-block w-2 h-2 rounded-sm bg-[#006d2f] mr-1"/>Selected</span>
      <span><span className="inline-block w-2 h-2 rounded-sm bg-[#fee2e2] border border-[#fca5a5] mr-1"/>Held by another</span>
    </div>
    <div className="mt-3 bg-[#006d2f] text-white text-xs font-bold py-2 rounded-lg text-center">
      Confirm Booking → Pay ₹1,200
    </div>
  </div>
);

/* ── how booking works steps ── */
const bookingSteps = [
  { n: '1', icon: '🏪', title: 'Customer opens your store', desc: 'They visit your branded URL — yourname.aapnaestore.com — from a WhatsApp link, Instagram bio, or QR scan.' },
  { n: '2', icon: '📅', title: 'Picks a service, date & staff', desc: 'They choose the service, pick a date from your working calendar, select a staff member if your store has multiple, and tap a time slot.' },
  { n: '3', icon: '🔒', title: 'Slot is held for 10 minutes', desc: 'The moment they select a slot it is locked for them — other customers see it as unavailable. If they don\'t pay in 10 minutes, it releases automatically.' },
  { n: '4', icon: '💳', title: 'They pay & confirm', desc: 'Checkout with UPI, card or any Razorpay method. Booking is confirmed, a WhatsApp confirmation fires to them.' },
  { n: '5', icon: '📋', title: 'You manage from store-admin', desc: 'Every appointment appears in your Appointments dashboard — filter by date, staff, or status. Download the daily schedule as a PDF for your team.' },
];

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const AboutSection = () => (
  <div className="bg-[#f3faf5] min-h-screen font-sans">

    {/* ── Hero ── */}
    <div className="max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
      <span className="inline-block bg-[#dff5e8] text-[#006d2f] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-5">
        Complete Feature Overview
      </span>
      <h1 className="text-3xl md:text-4xl font-bold text-[#111a14] leading-tight mb-4">
        Everything you need<br />to sell online —{' '}
        <span className="text-[#006d2f]">built in.</span>
      </h1>
      <p className="text-sm text-[#556b5c] max-w-lg mx-auto mb-7">
        Your own branded store, WhatsApp marketing, QR ordering, appointment booking, and a lot more.
        No commissions. No coding. Live in 20 minutes.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <a href="/dashboard" className="bg-[#25D366] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1db954] transition-colors">
          Create Your Store Free
        </a>
        <a href="https://wa.me/919818410640" target="_blank" rel="noreferrer"
           className="border border-[#c8e8d2] text-[#111a14] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#eaf6ef] transition-colors">
          Talk to Us on WhatsApp
        </a>
      </div>
    </div>

    {/* ══ TWO STORE TYPES ══ */}
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-2">
      <div className="text-center mb-6">
        <Label>Two types of stores</Label>
        <SectionTitle>What kind of business are you?</SectionTitle>
        <p className="text-sm text-[#556b5c] max-w-lg mx-auto">
          AapnaEstore works for both — products you ship, and services you book. See what's built for your type.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">

        {/* Product Store card */}
        <div className="bg-white border-2 border-[#006d2f] rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#dff5e8] flex items-center justify-center text-2xl">🛍️</div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-[#006d2f] mb-0.5">Store Type 1</div>
              <h3 className="text-base font-bold text-[#111a14]">Product Store</h3>
            </div>
          </div>
          <p className="text-xs text-[#556b5c] leading-relaxed mb-4">
            Sell physical products online. Customers browse, add to cart, pay — you ship. Built for fashion, food, electronics, grocery, handicrafts, and any product-based business.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['👗 Fashion','🍱 Food','📱 Electronics','🛒 Grocery','🎁 Gifts','🏪 Any product'].map(t=>(
              <span key={t} className="text-[10px] bg-[#f3faf5] text-[#006d2f] border border-[#c8e8d2] px-2 py-0.5 rounded-full font-medium">{t}</span>
            ))}
          </div>
          <ul className="space-y-1.5 mb-5">
            {['Branded online storefront','Inventory & stock management','UPI, cards, net banking payments','WhatsApp auto-sync & cart recovery','QR ordering + dine-in mode','GST invoice auto-generation','Bulk product import via CSV'].map(b=>(
              <li key={b} className="text-xs text-[#556b5c] pl-5 relative before:content-[\'✓\'] before:absolute before:left-0 before:text-[#25D366] before:font-bold">{b}</li>
            ))}
          </ul>
          <a href="#product-store" className="mt-auto inline-block text-center bg-[#006d2f] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#004d22] transition-colors">
            See all product store features ↓
          </a>
        </div>

        {/* Service Store card */}
        <div className="bg-white border-2 border-[#006d2f] rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#dff5e8] flex items-center justify-center text-2xl">📅</div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-[#006d2f] mb-0.5">Store Type 2</div>
              <h3 className="text-base font-bold text-[#111a14]">Service Store</h3>
            </div>
          </div>
          <p className="text-xs text-[#556b5c] leading-relaxed mb-4">
            Sell your time and expertise. Customers book appointments directly — no Practo, no Fresha, no commission. Built for salons, clinics, studios, and any service-based business.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['💇 Salons','🏥 Clinics','🧘 Yoga','💆 Spas','🦷 Dental','📸 Studios','🎓 Coaching'].map(t=>(
              <span key={t} className="text-[10px] bg-[#f3faf5] text-[#006d2f] border border-[#c8e8d2] px-2 py-0.5 rounded-full font-medium">{t}</span>
            ))}
          </div>
          <ul className="space-y-1.5 mb-5">
            {['Real-time slot booking with 10-min hold','Staff-specific scheduling & calendars','Custom service durations & working hours','Appointments dashboard (by date & staff)','WhatsApp booking confirmation','Daily schedule PDF — print-ready','Zero booking commission, ever'].map(b=>(
              <li key={b} className="text-xs text-[#556b5c] pl-5 relative before:content-[\'✓\'] before:absolute before:left-0 before:text-[#25D366] before:font-bold">{b}</li>
            ))}
          </ul>
          <a href="#service-store" className="mt-auto inline-block text-center bg-[#006d2f] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#004d22] transition-colors">
            See all service store features ↓
          </a>
        </div>

      </div>
    </div>

    {/* ══ SERVICE INDUSTRY SECTION ══ */}
    <div id="service-store" className="bg-white border-y border-[#c8e8d2] py-14">
      <div className="max-w-4xl mx-auto px-4">
        <Label>Built for service businesses</Label>
        <SectionTitle>Appointment booking — without Practo, Fresha, or any commission app</SectionTitle>
        <SectionDesc>
          If you run a salon, clinic, spa, therapy centre, fitness studio, or any service business —
          AapnaEstore gives you a complete online booking system on your own branded storefront.
          Customers book directly. No middleman. No booking fees taken from your earnings.
        </SectionDesc>

        {/* who it's for */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['💇 Salons & spas','🏥 Clinics & therapists','🧘 Yoga & fitness studios','💆 Wellness centres','🦷 Dental practices','👶 Pediatric & child care','🎨 Grooming & beauty services','🐾 Pet grooming & vet clinics','📸 Photography studios','🎓 Coaching & tutoring'].map(tag => (
            <span key={tag} className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#f3faf5] border border-[#c8e8d2] text-[#111a14]">{tag}</span>
          ))}
        </div>

        {/* spotlight: booking system */}
        <Spotlight
          badge="Appointment system"
          title="Real-time slot booking — staff-wise, live inventory, 10-min hold"
          desc="Customers pick a service, choose a date, select a staff member, and tap an available slot. The moment they pick it, it's locked for 10 minutes so two customers can't accidentally book the same appointment. No phone calls. No WhatsApp back-and-forth."
          bullets={[
            'Staff-specific scheduling — each team member has their own calendar',
            'Slot holds prevent double-bookings in real time',
            'Works across multiple services in one cart',
            'Countdown timer shows customers how long their hold lasts',
            'Auto-releases if payment isn\'t completed — slot goes back to inventory',
          ]}
          chip="Zero double-bookings"
          chipColor="bg-[#dff5e8] text-[#006d2f]"
          visual={<BookingDemo />}
        />

        {/* feature cards: service biz */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 mb-8">
          {[
            { icon: '👥', title: 'Staff Member Management', desc: 'Add each staff member with their own profile. Customers can filter slots by staff name and see real availability per person.' },
            { icon: '⏱️', title: 'Custom Service Durations', desc: 'Set the exact duration for each service. A 30-min haircut and a 90-min deep tissue massage are handled separately — no overlap.' },
            { icon: '📅', title: 'Working Hours & Break Times', desc: 'Define your store\'s working hours, lunch breaks, and gap time between appointments. The slot grid enforces it automatically.' },
            { icon: '📋', title: 'Appointments Dashboard', desc: 'See every booking by date and staff. Filter by today, tomorrow, or any date range. Know exactly who\'s coming in at what time.', chip: 'Store-admin only', chipColor: 'bg-[#dff5e8] text-[#006d2f]' },
            { icon: '🖨️', title: 'Daily Schedule PDF', desc: 'Download your team\'s full appointment schedule as a PDF — ready to print and hand to front desk staff every morning.' },
            { icon: '🔔', title: 'Booking Confirmation on WhatsApp', desc: 'Customer gets a WhatsApp confirmation the moment they book. Reduces no-shows and builds trust before they even walk in.' },
          ].map(f => <FeatureCard key={f.title} {...f} />)}
        </div>

        {/* how booking works */}
        <Label>How it works</Label>
        <SectionTitle>A customer books in under 2 minutes</SectionTitle>
        <SectionDesc>No app download. No account creation headache. Just your link — and a slot picked and paid.</SectionDesc>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {bookingSteps.map(({ n, icon, title, desc }) => (
            <div key={n} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{n}</div>
                <span className="text-lg">{icon}</span>
              </div>
              <h4 className="text-xs font-semibold text-[#111a14]">{title}</h4>
              <p className="text-[11px] text-[#556b5c] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* service vs product callout */}
        <div className="bg-[#f3faf5] border border-[#c8e8d2] rounded-xl p-5 mt-6">
          <p className="text-xs font-bold text-[#006d2f] uppercase tracking-wider mb-2">One platform, two business types</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-[#111a14] mb-1">🛍️ Product business (e-commerce)</p>
              <p className="text-xs text-[#556b5c]">Customers add items to cart, pay, and you ship. Inventory tracked per product. QR ordering for walk-ins. Bulk CSV import. GST invoices generated.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111a14] mb-1">📅 Service business (appointments)</p>
              <p className="text-xs text-[#556b5c]">Customers pick a service, choose a date and staff slot, pay — and show up at their appointment time. Your admin shows who's booked with whom, when.</p>
            </div>
          </div>
          <p className="text-[11px] text-[#006d2f] font-semibold mt-3">You can run both from the same store — a gym selling protein supplements and booking fitness sessions in one checkout.</p>
        </div>
      </div>
    </div>

    {/* ── Stat strip ── */}
    <div className="bg-white border-y border-[#c8e8d2] py-6">
      <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-around gap-2">
        {[
          { num: '0%', label: 'Commission on every sale' },
          { num: '20 min', label: 'Store live from signup' },
          { num: '∞', label: 'Products you can list' },
          { num: '8', label: 'Step guided store builder' },
        ].map(({ num, label }) => (
          <div key={label} className="text-center px-4 py-2">
            <div className="text-2xl font-bold text-[#006d2f]">{num}</div>
            <div className="text-[11px] text-[#556b5c] mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ══ LAYER 1: Core features ══ */}
    <div id="product-store" className="max-w-4xl mx-auto px-4 pt-12 pb-4">
      <Label>Layer 1 — Core platform</Label>
      <SectionTitle>Top eStore features</SectionTitle>
      <SectionDesc>The foundation every seller gets — from day one, all included.</SectionDesc>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        {[
          { icon: '🏪', title: 'Branded Online Store', desc: 'Your store, your name, your logo, your colours. Customers see your brand — not a marketplace\'s. Fully custom, zero dev work.' },
          { icon: '🛒', title: 'Direct Checkout', desc: 'Customers browse, add to cart, and pay in one flow. No DMs, no "WhatsApp karo", no back-and-forth to confirm orders.' },
          { icon: '📦', title: 'Inventory Management', desc: 'Stock auto-updates with every sale. Get low-stock alerts before you run out. Never oversell again.' },
          { icon: '💳', title: 'Multiple Payment Options', desc: 'Razorpay, Cashfree, or Stripe. UPI, cards, net banking — fully covered. Money lands directly in your account.' },
          { icon: '📊', title: 'Order Management', desc: 'All orders in one dashboard. Track status, manage fulfilment, keep customers informed — no spreadsheet juggling.' },
          { icon: '🌐', title: 'Custom Domain', desc: 'Free subdomain (yourstore.aapnaestore.com) or connect your own. Looks professional from day one.' },
          { icon: '🎨', title: 'Store Customisation', desc: 'Choose your colour theme, upload your logo, arrange categories your way. No designer needed.' },
          { icon: '📱', title: 'Mobile-Ready Store', desc: 'Looks great on every phone. Customers shop via WhatsApp link, Instagram bio, or a QR scan — it works everywhere.' },
          { icon: '☁️', title: 'Reliable Cloud Hosting', desc: 'Your store runs on AWS. Fast, secure, always online — even during Diwali sale traffic spikes.' },
          { icon: '🔐', title: 'OTP Customer Login', desc: 'Customers log in with their phone + OTP. No passwords, no friction. Higher checkout completion from returning buyers.' },
          { icon: '↩️', title: 'Return Policy Management', desc: 'Set and display your return policy clearly on every product page. Reduce disputes and build trust upfront.' },
          { icon: '🧙', title: '8-Step Store Builder Wizard', desc: 'Guided setup covers your store profile, products, cart, payments, delivery, and more. Get everything right from the start.', chip: 'Zero guesswork', chipColor: 'bg-[#dff5e8] text-[#006d2f]' },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>

    {/* ══ LAYER 2: WhatsApp ══ */}
    <div className="bg-[#eaf6ef] border-y border-[#c8e8d2] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Label>Layer 2 — WhatsApp marketing system</Label>
        <SectionTitle>WhatsApp features no competitor has</SectionTitle>
        <SectionDesc>AapnaEstore treats WhatsApp as a first-class sales and marketing channel — not an afterthought.</SectionDesc>

        <Spotlight
          badge="Only on AapnaEstore"
          title="Order placed → customer auto-saved to WhatsApp"
          desc="When a customer buys from your store, their number is synced directly to your WhatsApp contact list. No copy-paste. No CSV exports. Run your next festive broadcast and your buyers are already waiting."
          bullets={['Every buyer added automatically at checkout', 'Ready to broadcast instantly from your dashboard', 'Zero manual work — ever']}
          visual={
            <WaDemo title="WhatsApp — Auto-Sync" messages={[
              { text: '🛒 New order! Priya Sharma just bought Silk Kurti' },
              { text: '✅ Contact saved<br/><small>Priya added to broadcast list</small>', sent: true, time: 'Now' },
            ]} />
          }
        />

        <Spotlight
          badge="New feature"
          title="Abandoned cart? WhatsApp reminder sent automatically"
          desc="When a customer adds to cart but doesn't complete checkout, AapnaEstore fires a WhatsApp reminder automatically, at the right time. Most sellers lose 60–70% of carts. Now you get them back."
          bullets={['Automatic trigger — no manual follow-up needed', 'Message includes cart items and a direct checkout link', 'Runs 24/7 even while you sleep']}
          chip="Recover lost revenue"
          chipColor="bg-orange-50 text-orange-700"
          visual={
            <WaDemo title="WhatsApp — Cart Recovery" messages={[
              { text: 'Hey Rahul 👋 You left something behind!<br/>• Linen Kurta — ₹1,299<br/>• Cotton Dupatta — ₹499<br/><br/>Complete your order →' },
              { text: 'Thanks, just ordered! 🎉', sent: true, time: '2 min later' },
            ]} />
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {[
            { icon: '📣', title: 'Broadcast to All Buyers', desc: 'New collection, sale offer, festive discount — send a WhatsApp broadcast to your entire buyer list directly from your dashboard.' },
            { icon: '💸', title: '0% Commission, Always', desc: 'Every rupee from every order — WhatsApp driven or otherwise — goes straight to you. No platform cut. No hidden fees.' },
            { icon: '🔔', title: 'Order Confirmation on WhatsApp', desc: 'Customers get instant order confirmation via WhatsApp. Builds trust, reduces cancellations.' },
          ].map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>
    </div>

    {/* ══ LAYER 3: QR / POS ══ */}
    <div className="max-w-4xl mx-auto px-4 pt-12 pb-4">
      <Label>Layer 3 — QR &amp; point-of-sale system</Label>
      <SectionTitle>One QR. One POS. Online and offline, unified.</SectionTitle>
      <SectionDesc>Whether customers are at your table, your counter, or on their phone at home — the same store, the same inventory, the same orders dashboard.</SectionDesc>

      <Spotlight
        badge="QR ordering system"
        title="Scan → browse → order. No app download. No staff needed."
        desc="Generate a QR code for your store, a specific table, or a product. Customers scan it on any phone and land directly in your store. Every QR order flows into the same orders dashboard as your online orders."
        bullets={['Print QR on table cards, menu stands, or stickers', 'Table-specific QR for dine-in or counter pickup', 'Works on any phone — no app, no sign-up needed', 'Orders appear in your dashboard in real time', 'Single inventory across online + QR + POS']}
        chip="Works offline too"
        chipColor="bg-[#dff5e8] text-[#006d2f]"
        visual={<QrDemo />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
        {[
          { icon: '🍽️', title: 'Dine-In & Table Ordering', desc: 'Restaurants and cafés can assign QR codes per table. Customers scan and order from their seat.', chip: 'For restaurants', chipColor: 'bg-[#dff5e8] text-[#006d2f]' },
          { icon: '🖥️', title: 'Single POS Dashboard', desc: 'Walk-in customers, online shoppers, QR orderers — all orders land in one screen. One inventory. One place.' },
          { icon: '📍', title: 'Delivery Zone Management', desc: 'Define delivery areas and set distance-based charges. No surprises for customers at checkout.' },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>

    {/* ══ LAYER 4: Business tools ══ */}
    <div className="bg-[#eaf6ef] border-y border-[#c8e8d2] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Label>Layer 4 — Business &amp; compliance tools</Label>
        <SectionTitle>Run a real business. Paperwork handled.</SectionTitle>
        <SectionDesc>GST invoices, return policies, multi-store support — the tools serious sellers need.</SectionDesc>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🧾', title: 'GST Invoice Generation', desc: 'Auto-generate GST-compliant invoices for every order. Customers get a proper tax invoice — instantly.', chip: 'GST ready', chipColor: 'bg-[#dff5e8] text-[#006d2f]' },
            { icon: '🏬', title: 'Multi-Store Management', desc: 'Run multiple stores under one account. Separate inventories, separate order flows — single dashboard.' },
            { icon: '📋', title: 'Bulk Product Import', desc: 'Import your product catalogue via CSV. Add hundreds of products in one go — no clicking one by one.' },
            { icon: '🚀', title: 'Live in 20 Minutes', desc: 'No developer, no agency, no waiting weeks. Walk through the store builder and you\'re live — today.' },
          ].map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>
    </div>

    {/* ══ Comparison tables ══ */}
    <div className="max-w-4xl mx-auto px-4 pt-12 pb-4">
      <Label>How we compare</Label>
      <SectionTitle>AapnaEstore vs the alternatives</SectionTitle>
      <SectionDesc>Both store types — product and service — compared against the tools most Indian sellers already know.</SectionDesc>
      <CompareTableBlock
        label="🛍️ Product Store"
        headers={['Capability','AapnaEstore','WhatsApp Biz','Zomato / Meesho','Dukaan']}
        rows={productCompareRows}
      />
      <CompareTableBlock
        label="📅 Service Store"
        headers={['Capability','AapnaEstore','Practo / Fresha','WhatsApp Biz','Manual / Excel']}
        rows={serviceCompareRows}
      />
    </div>

    {/* ══ How it works ══ */}
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-10">
      <Label>Getting started</Label>
      <SectionTitle>From zero to live in 4 steps</SectionTitle>
      <SectionDesc>No technical knowledge required. If you can use WhatsApp, you can build your store.</SectionDesc>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { n: '1', title: 'Create your account', desc: 'Sign up at aapnaestore.com. Takes 2 minutes. No credit card upfront.' },
          { n: '2', title: 'Run the store wizard', desc: '8 guided steps cover your profile, branding, products, payments, delivery zones, and more.' },
          { n: '3', title: 'Add your products', desc: 'Upload photos, set prices, configure GST, set stock — or import via CSV for large catalogues.' },
          { n: '4', title: 'Share your link or QR', desc: 'Post on WhatsApp and Instagram. Print your QR for your counter. Orders start flowing in.' },
        ].map(({ n, title, desc }) => (
          <div key={n} className="flex flex-col gap-2">
            <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {n}
            </div>
            <h4 className="text-sm font-semibold text-[#111a14]">{title}</h4>
            <p className="text-xs text-[#556b5c] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* ══ CTA band ══ */}
    <div className="bg-[#006d2f] py-14">
      <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          Stop managing orders in DM chaos.<br />Your store can be live today.
        </h2>
        <p className="text-sm text-green-100 max-w-md">
          Join sellers across India who've moved their business online with AapnaEstore. Everything included, always.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="/dashboard" className="bg-white text-[#006d2f] px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors">
            Create Your Store Free
          </a>
          <a href="https://wa.me/919818410640" target="_blank" rel="noreferrer"
             className="border-2 border-white/40 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors">
            Talk to Us on WhatsApp
          </a>
        </div>
        <p className="text-[11px] text-green-200">+91 98184 10640 · Mon–Sat 9 AM–6 PM · aapnaestore@gmail.com</p>
      </div>
    </div>

    {/* ── Footer ── */}
    <div className="max-w-4xl mx-auto px-4 py-7 border-t border-[#c8e8d2]">
      <p className="text-xs text-[#556b5c]">© 2026 Nikhil Mathur HUF · AapnaEstore</p>
    </div>

  </div>
);

export default AboutSection;
