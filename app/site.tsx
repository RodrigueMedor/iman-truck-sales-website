"use client";

import { useState } from "react";

const nav = [
  ["Home", "/"], ["Inventory", "/inventory/"], ["Start a Box Truck Business", "/home-page/"],
  ["Financing", "/financing/"], ["About us", "/about-us/"], ["Contact us", "/contact-us/"],
] as const;

const inventory = [
  { image: "/images/DSC01736-scaled.jpg", name: "2018 Freightliner M2 106", make: "Freightliner", model: "M2 106", year: "2018", condition: "Used", type: "Box Truck", mileage: "238,420 mi" },
  { image: "/images/DSC01758-scaled.jpg", name: "2019 Hino 268A", make: "Hino", model: "268A", year: "2019", condition: "Used", type: "26′ Box Truck", mileage: "214,865 mi" },
  { image: "/images/DSC01794-scaled.jpg", name: "2020 International MV", make: "International", model: "MV", year: "2020", condition: "Used", type: "Commercial Truck", mileage: "198,730 mi" },
  { image: "/images/DSC01800-scaled.jpg", name: "2019 Freightliner M2", make: "Freightliner", model: "M2 106", year: "2019", condition: "Used", type: "Straight Truck", mileage: "225,190 mi" },
] as const;

type Filters = { make: string; model: string; year: string; condition: string };
const emptyFilters: Filters = { make: "", model: "", year: "", condition: "" };

function Header({ page }: { page: string }) {
  const [open, setOpen] = useState(false);
  const current = page === "home" ? "/" : `/${page}/`;
  return <>
    <div className="topbar"><div className="wrap topbar-inner"><span>⌖ 21902 State Road 46, Mount Dora, FL 32757</span><span>info@imanlogistics.com</span><a href="tel:8889914776">888-991-4776</a></div></div>
    <header className="header"><div className="wrap nav-wrap">
      <a className="logo" href="/" aria-label="Iman Truck Sales home"><img src="/images/IMAN-Truck-Sales-White.png" alt="Iman Truck Sales" /></a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open menu">☰</button>
      <nav className={open ? "nav open" : "nav"}>{nav.map(([label, href]) => <a key={href} className={current === href ? "active" : ""} aria-current={current === href ? "page" : undefined} href={href}>{label}</a>)}</nav>
      <a className="appointment" href="/contact-us/">Request Appointment</a>
    </div></header>
  </>;
}

function SearchBar({ onSearch, resultCount = inventory.length }: { onSearch?: (filters: Filters) => void; resultCount?: number }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const update = (key: keyof Filters, value: string) => setFilters(current => ({ ...current, [key]: value }));
  const search = () => {
    if (onSearch) return onSearch(filters);
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    window.location.href = `/inventory/${query.size ? `?${query}` : ""}`;
  };
  const clear = () => { setFilters(emptyFilters); onSearch?.(emptyFilters); };
  return <div className="search-shell"><div className="search-title"><span>⌕</span><div><strong>Find your next truck</strong><small>Search available commercial inventory</small></div></div><div className="search-panel">
    <div><label htmlFor="truck-make">Make</label><select id="truck-make" value={filters.make} onChange={event => update("make", event.target.value)}><option value="">All Makes</option><option>Freightliner</option><option>Hino</option><option>International</option></select></div>
    <div><label htmlFor="truck-model">Model</label><select id="truck-model" value={filters.model} onChange={event => update("model", event.target.value)}><option value="">All Models</option><option>M2 106</option><option>268A</option><option>MV</option></select></div>
    <div><label htmlFor="truck-year">Year</label><select id="truck-year" value={filters.year} onChange={event => update("year", event.target.value)}><option value="">All Years</option><option>2020</option><option>2019</option><option>2018</option></select></div>
    <div><label htmlFor="truck-condition">Condition</label><select id="truck-condition" value={filters.condition} onChange={event => update("condition", event.target.value)}><option value="">All Conditions</option><option>Used</option></select></div>
    <button className="search-button" type="button" onClick={search}>Search Trucks →</button>
  </div>{onSearch && <div className="search-feedback"><span>{resultCount} {resultCount === 1 ? "truck" : "trucks"} match your search</span><button type="button" onClick={clear}>Clear filters</button></div>}</div>;
}

function InventoryCards({ trucks = inventory }: { trucks?: readonly (typeof inventory)[number][] }) {
  if (!trucks.length) return <div className="empty-inventory"><b>No trucks match those filters.</b><span>Clear the filters or contact our team so we can help locate the right vehicle.</span><a href="/contact-us/">Ask us to find a truck →</a></div>;
  return <div className="truck-grid">{trucks.map((truck, index) => <article className="truck-card" key={truck.name}>
    <a className="truck-photo" href="/inventory/"><img src={truck.image} alt={truck.name} /><span>{index === 0 ? "Featured" : "Available"}</span><b>♡</b></a>
    <div className="truck-info"><span className="tag">{truck.type}</span><h3>{truck.name}</h3><div className="specs"><span>◷ {truck.mileage}</span><span>◉ Diesel</span><span>⚙ Automatic</span></div><div className="truck-bottom"><strong>Call for price</strong><a href="/contact-us/">View details →</a></div></div>
  </article>)}</div>;
}

function Home() {
  return <>
    <section className="hero"><div className="wrap hero-content"><div className="hero-copy"><p className="eyebrow"><span />Commercial trucks. Business support.</p><h1>Built to Work.<br /><em>Ready to Earn.</em></h1><p>Quality commercial trucks, straightforward financing guidance, and nationwide delivery from a team invested in your success.</p><div className="hero-actions"><a className="primary" href="/inventory/">Browse Inventory <span>→</span></a><a className="secondary" href="tel:8889914776">Call 888-991-4776</a></div><div className="hero-proof"><span>✓ Nationwide delivery</span><span>✓ Business-first guidance</span><span>✓ Quality inventory</span></div></div></div></section>
    <div className="wrap floating-search"><SearchBar /></div>
    <section className="trust-strip"><div className="wrap trust-grid"><div><strong>4</strong><span>Trucks available now</span></div><div><strong>50</strong><span>States we deliver to</span></div><div><strong>3</strong><span>Trusted commercial brands</span></div><div><strong>1</strong><span>Team focused on your goal</span></div></div></section>
    <section className="section wrap"><div className="section-heading"><div><p className="eyebrow blue">Available now</p><h2>Featured Trucks</h2></div><a href="/inventory/">Explore all inventory →</a></div><InventoryCards /></section>
    <section className="why-section"><div className="wrap split"><div className="why-visual"><img src="/images/DSC01718-scaled.jpg" alt="Commercial truck at Iman Truck Sales" /><div className="delivery-card"><b>Nationwide</b><span>Truck delivery across the U.S.</span></div></div><div><p className="eyebrow blue">Why Iman Truck Sales</p><h2>A smarter way to buy your next commercial truck.</h2><p>We understand that a truck is more than equipment—it is the engine behind your livelihood. Our team makes the process clear, responsive, and focused on getting you road-ready.</p><div className="benefit-list">{[["01","Business-first advice","Guidance shaped around how you plan to use and grow with your truck."],["02","Carefully selected inventory","Commercial vehicles chosen for serious operators and new owners."],["03","Support beyond the sale","Financing direction, delivery coordination, and practical next steps."]].map(([n,t,d])=><div key={n}><b>{n}</b><span><strong>{t}</strong><small>{d}</small></span></div>)}</div><a className="text-link" href="/about-us/">Learn about our team →</a></div></div></section>
    <section className="brands"><div className="wrap brand-row"><img src="/images/Freightliner-Logo-scaled.jpg" alt="Freightliner" /><img src="/images/Hino-Logo-scaled.png" alt="Hino" /><img src="/images/International-Trucks-Logo.png" alt="International Trucks" /></div></section>
    <ContactBand />
  </>;
}

function PageHero({ title, text }: { title: string; text: string }) {
  return <section className="page-hero"><div className="wrap"><div className="breadcrumb"><a href="/">Home</a><span>/</span><b>{title}</b></div><p className="eyebrow"><span />Iman Truck Sales</p><h1>{title}</h1><p>{text}</p></div></section>;
}

function Inventory() {
  const [filteredTrucks, setFilteredTrucks] = useState<readonly (typeof inventory)[number][]>(inventory);
  const filterInventory = (filters: Filters) => setFilteredTrucks(inventory.filter(truck =>
    (!filters.make || truck.make === filters.make) &&
    (!filters.model || truck.model === filters.model) &&
    (!filters.year || truck.year === filters.year) &&
    (!filters.condition || truck.condition === filters.condition)
  ));
  return <><PageHero title="Truck Inventory" text="Explore dependable commercial vehicles selected for business owners and professional operators." /><section className="section wrap"><SearchBar onSearch={filterInventory} resultCount={filteredTrucks.length} /><div className="results"><strong>{filteredTrucks.length} {filteredTrucks.length === 1 ? "vehicle" : "vehicles"} found</strong><span>Sort by: Newest first</span></div><InventoryCards trucks={filteredTrucks} /></section><ContactBand /></>;
}

function Business() {
  return <><PageHero title="Start a Box Truck Business" text="A practical path from buying the right truck to building a business ready for the road." /><section className="section wrap split"><div><p className="eyebrow blue">Build your future</p><h2>More than a truck. A business opportunity.</h2><p>Iman Truck Sales helps aspiring owners understand the equipment, operating requirements, and decisions involved in launching a box truck business.</p><div className="steps">{["Choose a dependable truck for your operation","Understand registration, insurance, and compliance","Prepare a realistic operating budget","Build relationships and secure freight opportunities"].map((x,i)=><div key={x}><b>{i+1}</b><span>{x}</span></div>)}</div><a className="primary inline" href="/contact-us/">Start the Conversation</a></div><div className="business-image"><img src="/images/pngtree-box-truck-isolated-on-transparent-background-png-image_15814026.png" alt="White box truck" /></div></section><ContactBand /></>;
}

function Financing() {
  return <><PageHero title="Commercial Truck Financing" text="Flexible paths designed to help qualified buyers move forward with confidence." /><section className="section wrap narrow"><p className="eyebrow blue">Financing solutions</p><h2>Let’s find an option that fits your plan.</h2><p>Whether you are expanding a fleet or purchasing your first commercial truck, our team can help you understand available financing options and prepare your application.</p><div className="feature-grid">{["Simple application process","Options for different credit profiles","Commercial vehicle expertise","Clear, responsive guidance"].map(x=><div className="feature" key={x}>✓ <strong>{x}</strong></div>)}</div><a className="primary inline" href="https://coach.lending.online/" target="_blank" rel="noopener noreferrer">Apply for Financing</a></section><ContactBand /></>;
}

function About() {
  return <><PageHero title="About Iman Truck Sales" text="A business-first truck dealership serving customers in Florida and across the United States." /><section className="section wrap split"><div className="about-image"><img src="/images/X31x9qWyEZGDAKlxvpYrwqLeCf7zDF6CDZeQMvEo.jpeg" alt="Iman Truck Sales team" /></div><div><p className="eyebrow blue">Who we are</p><h2>Trucks, guidance, and service you can rely on.</h2><p>Iman Truck Sales connects customers with quality commercial vehicles and the information they need to make confident decisions. We believe buying a truck should feel straightforward, respectful, and focused on your goals.</p><p>From selecting a vehicle to arranging delivery anywhere in the United States, our team is ready to support your next move.</p><a className="primary inline" href="/inventory/">Explore Inventory</a></div></section><ContactBand /></>;
}

function Contact() {
  return <><PageHero title="Contact Us" text="Tell us what kind of truck or business support you need. Our team is ready to help you plan the next move." />
    <section className="contact-page">
      <div className="wrap contact-intro">
        <div><p className="eyebrow blue">Start the conversation</p><h2>Let’s get you closer to the right truck.</h2></div>
        <p>Whether you are buying your first box truck, expanding a fleet, or exploring financing, send us the details. A member of our team will follow up with clear next steps.</p>
      </div>
      <div className="wrap contact-card-grid">
        <a className="contact-card" href="tel:8889914776"><span>01</span><div><small>Call our sales team</small><strong>888-991-4776</strong><p>Speak directly with someone who understands commercial trucks.</p></div><b>→</b></a>
        <a className="contact-card" href="mailto:info@imanlogistics.com"><span>02</span><div><small>Email us</small><strong>info@imanlogistics.com</strong><p>Send vehicle questions, trade details, or financing inquiries.</p></div><b>→</b></a>
        <a className="contact-card" href="https://maps.google.com/?q=21902+State+Road+46+Mount+Dora+Florida+32757" target="_blank" rel="noopener noreferrer"><span>03</span><div><small>Visit the dealership</small><strong>Mount Dora, Florida</strong><p>21902 State Road 46, Mount Dora, FL 32757</p></div><b>→</b></a>
      </div>
      <div className="wrap contact-main">
        <aside className="contact-aside">
          <p className="eyebrow">What happens next</p><h2>A simple, responsive process.</h2>
          <div className="response-steps"><div><b>1</b><span><strong>We review your request</strong><small>Tell us about the truck, financing, or business support you need.</small></span></div><div><b>2</b><span><strong>A specialist contacts you</strong><small>Our team will follow up to clarify your priorities and timeline.</small></span></div><div><b>3</b><span><strong>We plan your next step</strong><small>Review available vehicles, financing direction, or delivery options.</small></span></div></div>
          <div className="business-hours"><strong>Business hours</strong><span>Monday–Friday · 9:00 AM–6:00 PM</span><span>Saturday · By appointment</span><span>Sunday · Closed</span></div>
        </aside>
        <form className="professional-form">
          <div className="form-heading"><span>Sales inquiry</span><h2>How can we help?</h2><p>Complete the form below and our team will contact you.</p></div>
          <div className="form-row"><label>First name *<input name="firstName" autoComplete="given-name" required placeholder="First name" /></label><label>Last name *<input name="lastName" autoComplete="family-name" required placeholder="Last name" /></label></div>
          <div className="form-row"><label>Email address *<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="(000) 000-0000" /></label></div>
          <label>What are you interested in? *<select name="interest" required defaultValue=""><option value="" disabled>Select one</option><option>Buying a truck</option><option>Financing</option><option>Starting a box truck business</option><option>Nationwide delivery</option><option>Other</option></select></label>
          <label>Tell us more *<textarea name="message" rows={5} required placeholder="Describe the truck, budget, timeline, or support you need." /></label>
          <label className="consent"><input type="checkbox" required /><span>I agree to be contacted by Iman Truck Sales about this request.</span></label>
          <button className="primary submit-contact" type="submit">Send My Request <span>→</span></button>
          <small className="privacy-note">Your information is used only to respond to this inquiry.</small>
        </form>
      </div>
    </section>
  </>;
}

function ContactBand() {
  return <section className="contact-band"><div className="wrap contact-band-inner"><div><p className="eyebrow">Your truck, delivered anywhere in the U.S.</p><h2>Ready to move your business forward?</h2><span>Tell us what you need and our team will help you plan the next step.</span></div><div className="cta-actions"><a className="light-button" href="/contact-us/">Get in Touch →</a><a href="tel:8889914776">888-991-4776</a></div></div></section>;
}

function Footer() {
  return <footer><div className="wrap footer-grid"><div><img className="footer-logo" src="/images/IMAN-Truck-Sales-White.png" alt="Iman Truck Sales" /><p>Your trusted source for dependable commercial trucks and practical business guidance.</p></div><div><h3>Quick Links</h3>{nav.slice(0,4).map(([label,href])=><a key={href} href={href}>{label}</a>)}</div><div><h3>Get in Touch</h3><p>21902 State Road 46<br />Mount Dora, FL 32757</p><a href="mailto:info@imanlogistics.com">info@imanlogistics.com</a><a href="tel:8889914776">888-991-4776</a></div></div><div className="copyright">Copyright © 2026 Iman Truck Sales | Powered by Iman Truck Sales</div></footer>;
}

export function TruckSalesSite({ page }: { page: string }) {
  const content = page === "inventory" ? <Inventory /> : page === "home-page" ? <Business /> : page === "financing" ? <Financing /> : page === "about-us" ? <About /> : page === "contact-us" ? <Contact /> : <Home />;
  return <><Header page={page} /><main>{content}</main><Footer /></>;
}
