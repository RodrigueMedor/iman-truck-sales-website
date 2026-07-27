"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

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
type Truck = { image: string; name: string; make: string; model: string; year: string; condition: string; type: string; mileage: string; price?: number | null };
type CmsEntry = { page: string; content_key: string; title: string; body: string; image_url: string; button_text: string; button_url: string };
type CmsLookup = (page: string, key: string, fallback: Omit<CmsEntry, "page" | "content_key">) => CmsEntry;

type Filters = { make: string; model: string; year: string; condition: string };
const emptyFilters: Filters = { make: "", model: "", year: "", condition: "" };
const listItems = (value: string) => value.split(";").map(item => item.trim()).filter(Boolean);
const columns = (value: string) => listItems(value).map(item => item.split("|").map(part => part.trim()));

function Header({ page, cms }: { page: string; cms: CmsLookup }) {
  const [open, setOpen] = useState(false);
  const current = page === "home" ? "/" : `/${page}/`;
  const header=cms("global","header",{title:"Request Appointment",body:"21902 State Road 46, Mount Dora, FL 32757|info@imanlogistics.com|888-991-4776",image_url:"/images/IMAN-Truck-Sales-White.png",button_text:"Request Appointment",button_url:"/contact-us/"});
  const [address,email,phone]=header.body.split("|");
  const navigation=cms("global","navigation",{title:"Website menu",body:"Home|/;Inventory|/inventory/;Start a Box Truck Business|/home-page/;Financing|/financing/;About us|/about-us/;Contact us|/contact-us/",image_url:"",button_text:"",button_url:""});
  const menuItems=columns(navigation.body);
  return <>
    <div className="topbar"><div className="wrap topbar-inner"><span>⌖ {address}</span><span>{email}</span><a href={`tel:${phone}`}>{phone}</a></div></div>
    <header className="header"><div className="wrap nav-wrap">
      <a className="logo" href="/" aria-label="Iman Truck Sales home"><img src={header.image_url} alt="Iman Truck Sales" /></a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open menu">☰</button>
      <nav className={open ? "nav open" : "nav"}>{menuItems.map(([label, href]) => <a key={href} className={current === href ? "active" : ""} aria-current={current === href ? "page" : undefined} href={href}>{label}</a>)}</nav>
      <a className="appointment" href={header.button_url}>{header.button_text}</a>
    </div></header>
  </>;
}

function SearchBar({ onSearch, resultCount = inventory.length, cms }: { onSearch?: (filters: Filters) => void; resultCount?: number; cms?: CmsLookup }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const update = (key: keyof Filters, value: string) => setFilters(current => ({ ...current, [key]: value }));
  const search = () => {
    if (onSearch) return onSearch(filters);
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    window.location.href = `/inventory/${query.size ? `?${query}` : ""}`;
  };
  const clear = () => { setFilters(emptyFilters); onSearch?.(emptyFilters); };
  const copy=cms?cms("inventory","search",{title:"Find your next truck",body:"Search available commercial inventory",image_url:"",button_text:"Search Trucks",button_url:""}):{title:"Find your next truck",body:"Search available commercial inventory",button_text:"Search Trucks"};
  return <div className="search-shell"><div className="search-title"><span>⌕</span><div><strong>{copy.title}</strong><small>{copy.body}</small></div></div><div className="search-panel">
    <div><label htmlFor="truck-make">Make</label><select id="truck-make" value={filters.make} onChange={event => update("make", event.target.value)}><option value="">All Makes</option><option>Freightliner</option><option>Hino</option><option>International</option></select></div>
    <div><label htmlFor="truck-model">Model</label><select id="truck-model" value={filters.model} onChange={event => update("model", event.target.value)}><option value="">All Models</option><option>M2 106</option><option>268A</option><option>MV</option></select></div>
    <div><label htmlFor="truck-year">Year</label><select id="truck-year" value={filters.year} onChange={event => update("year", event.target.value)}><option value="">All Years</option><option>2020</option><option>2019</option><option>2018</option></select></div>
    <div><label htmlFor="truck-condition">Condition</label><select id="truck-condition" value={filters.condition} onChange={event => update("condition", event.target.value)}><option value="">All Conditions</option><option>Used</option></select></div>
    <button className="search-button" type="button" onClick={search}>{copy.button_text} →</button>
  </div>{onSearch && <div className="search-feedback"><span>{resultCount} {resultCount === 1 ? "truck" : "trucks"} match your search</span><button type="button" onClick={clear}>Clear filters</button></div>}</div>;
}

function InventoryCards({ trucks = inventory }: { trucks?: readonly Truck[] }) {
  if (!trucks.length) return <div className="empty-inventory"><b>No trucks match those filters.</b><span>Clear the filters or contact our team so we can help locate the right vehicle.</span><a href="/contact-us/">Ask us to find a truck →</a></div>;
  return <div className="truck-grid">{trucks.map((truck, index) => <article className="truck-card" key={truck.name}>
    <a className="truck-photo" href="/inventory/"><img src={truck.image} alt={truck.name} /><span>{index === 0 ? "Featured" : "Available"}</span><b>♡</b></a>
    <div className="truck-info"><span className="tag">{truck.type}</span><h3>{truck.name}</h3><div className="specs"><span>◷ {truck.mileage}</span><span>◉ Diesel</span><span>⚙ Automatic</span></div><div className="truck-bottom"><strong>{truck.price ? `$${truck.price.toLocaleString()}` : "Call for price"}</strong><a href="/contact-us/">View details →</a></div></div>
  </article>)}</div>;
}

function Home({ trucks, cms }: { trucks: readonly Truck[]; cms: CmsLookup }) {
  const hero = cms("home","hero",{title:"Built to Work. Ready to Earn.",body:"Quality commercial trucks, straightforward financing guidance, and nationwide delivery from a team invested in your success.",image_url:"/images/DSC01794-scaled.jpg",button_text:"Browse Inventory",button_url:"/inventory/"});
  const featured = cms("home","featured",{title:"Featured Trucks",body:"Explore dependable commercial inventory selected for serious operators.",image_url:"",button_text:"Explore all inventory",button_url:"/inventory/"});
  const why = cms("home","why",{title:"A smarter way to buy your next commercial truck.",body:"We understand that a truck is more than equipment—it is the engine behind your livelihood. Our team makes the process clear, responsive, and focused on getting you road-ready.",image_url:"/images/DSC01718-scaled.jpg",button_text:"Learn about our team",button_url:"/about-us/"});
  const statistics=columns(cms("home","statistics",{title:"Homepage statistics",body:"4|Trucks available now;50|States we deliver to;3|Trusted commercial brands;1|Team focused on your goal",image_url:"",button_text:"",button_url:""}).body);
  const benefits=columns(cms("home","benefits",{title:"Why customers choose us",body:"Business-first advice|Guidance shaped around how you plan to use and grow with your truck.;Carefully selected inventory|Commercial vehicles chosen for serious operators and new owners.;Support beyond the sale|Financing direction, delivery coordination, and practical next steps.",image_url:"",button_text:"",button_url:""}).body);
  return <>
    <section className="hero" style={{backgroundImage:`linear-gradient(90deg,#07131bf7 0%,#091822de 47%,#0c1c2640 78%),linear-gradient(0deg,#08141c8c,transparent 40%),url('${hero.image_url}')`}}><div className="wrap hero-content"><div className="hero-copy"><p className="eyebrow"><span />Commercial trucks. Business support.</p><h1>{hero.title}</h1><p>{hero.body}</p><div className="hero-actions"><a className="primary" href={hero.button_url}>{hero.button_text} <span>→</span></a><a className="secondary" href="tel:8889914776">Call 888-991-4776</a></div><div className="hero-proof"><span>✓ Nationwide delivery</span><span>✓ Business-first guidance</span><span>✓ Quality inventory</span></div></div></div></section>
    <div className="wrap floating-search"><SearchBar cms={cms} /></div>
    <section className="trust-strip"><div className="wrap trust-grid">{statistics.map(([value,label])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>
    <section className="section wrap"><div className="section-heading"><div><p className="eyebrow blue">Available now</p><h2>{featured.title}</h2><p>{featured.body}</p></div><a href={featured.button_url}>{featured.button_text} →</a></div><InventoryCards trucks={trucks.slice(0,4)} /></section>
    <section className="why-section"><div className="wrap split"><div className="why-visual"><img src={why.image_url} alt={why.title} /><div className="delivery-card"><b>Nationwide</b><span>Truck delivery across the U.S.</span></div></div><div><p className="eyebrow blue">Why Iman Truck Sales</p><h2>{why.title}</h2><p>{why.body}</p><div className="benefit-list">{benefits.map(([title,description],index)=><div key={title}><b>{String(index+1).padStart(2,"0")}</b><span><strong>{title}</strong><small>{description}</small></span></div>)}</div><a className="text-link" href={why.button_url}>{why.button_text} →</a></div></div></section>
    <section className="brands"><div className="wrap brand-row"><img src="/images/Freightliner-Logo-scaled.jpg" alt="Freightliner" /><img src="/images/Hino-Logo-scaled.png" alt="Hino" /><img src="/images/International-Trucks-Logo.png" alt="International Trucks" /></div></section>
    <ContactBand cms={cms} />
  </>;
}

function PageHero({ entry }: { entry: CmsEntry }) {
  return <section className="page-hero" style={entry.image_url?{backgroundImage:`linear-gradient(90deg,#07131bf2,#0a19238c),url('${entry.image_url}')`}:undefined}><div className="wrap"><div className="breadcrumb"><a href="/">Home</a><span>/</span><b>{entry.title}</b></div><p className="eyebrow"><span />Iman Truck Sales</p><h1>{entry.title}</h1><p>{entry.body}</p></div></section>;
}

function Inventory({ trucks, cms }: { trucks: readonly Truck[]; cms: CmsLookup }) {
  const [filteredTrucks, setFilteredTrucks] = useState<readonly Truck[]>(trucks);
  useEffect(() => setFilteredTrucks(trucks), [trucks]);
  const filterInventory = (filters: Filters) => setFilteredTrucks(trucks.filter(truck =>
    (!filters.make || truck.make === filters.make) &&
    (!filters.model || truck.model === filters.model) &&
    (!filters.year || truck.year === filters.year) &&
    (!filters.condition || truck.condition === filters.condition)
  ));
  return <><PageHero entry={cms("inventory","hero",{title:"Truck Inventory",body:"Explore dependable commercial vehicles selected for business owners and professional operators.",image_url:"/images/DSC01718-scaled.jpg",button_text:"",button_url:""})} /><section className="section wrap"><SearchBar onSearch={filterInventory} resultCount={filteredTrucks.length} /><div className="results"><strong>{filteredTrucks.length} {filteredTrucks.length === 1 ? "vehicle" : "vehicles"} found</strong><span>Sort by: Newest first</span></div><InventoryCards trucks={filteredTrucks} /></section><ContactBand cms={cms} /></>;
}

function Business({cms}:{cms:CmsLookup}) {
  const main=cms("business","main",{title:"More than a truck. A business opportunity.",body:"Iman Truck Sales helps aspiring owners understand the equipment, operating requirements, and decisions involved in launching a box truck business.",image_url:"/images/pngtree-box-truck-isolated-on-transparent-background-png-image_15814026.png",button_text:"Start the Conversation",button_url:"/contact-us/"});
  return <><PageHero entry={cms("business","hero",{title:"Start a Box Truck Business",body:"A practical path from buying the right truck to building a business ready for the road.",image_url:"/images/DSC01718-scaled.jpg",button_text:"",button_url:""})} /><section className="section wrap split"><div><p className="eyebrow blue">Build your future</p><h2>{main.title}</h2><p>{main.body}</p><div className="steps">{["Choose a dependable truck for your operation","Understand registration, insurance, and compliance","Prepare a realistic operating budget","Build relationships and secure freight opportunities"].map((x,i)=><div key={x}><b>{i+1}</b><span>{x}</span></div>)}</div><a className="primary inline" href={main.button_url}>{main.button_text}</a></div><div className="business-image"><img src={main.image_url} alt={main.title} /></div></section><ContactBand cms={cms} /></>;
}

function Financing({cms}:{cms:CmsLookup}) {
  const main=cms("financing","main",{title:"Let’s find an option that fits your plan.",body:"Whether you are expanding a fleet or purchasing your first commercial truck, our team can help you understand available financing options and prepare your application.",image_url:"",button_text:"Apply for Financing",button_url:"https://coach.lending.online/"});
  return <><PageHero entry={cms("financing","hero",{title:"Commercial Truck Financing",body:"Flexible paths designed to help qualified buyers move forward with confidence.",image_url:"/images/DSC01718-scaled.jpg",button_text:"",button_url:""})} /><section className="section wrap narrow"><p className="eyebrow blue">Financing solutions</p><h2>{main.title}</h2><p>{main.body}</p><div className="feature-grid">{["Simple application process","Options for different credit profiles","Commercial vehicle expertise","Clear, responsive guidance"].map(x=><div className="feature" key={x}>✓ <strong>{x}</strong></div>)}</div><a className="primary inline" href={main.button_url} target="_blank" rel="noopener noreferrer">{main.button_text}</a></section><ContactBand cms={cms} /></>;
}

function About({cms}:{cms:CmsLookup}) {
  const main=cms("about","main",{title:"Trucks, guidance, and service you can rely on.",body:"Iman Truck Sales connects customers with quality commercial vehicles and the information they need to make confident decisions. We believe buying a truck should feel straightforward, respectful, and focused on your goals.",image_url:"/images/X31x9qWyEZGDAKlxvpYrwqLeCf7zDF6CDZeQMvEo.jpeg",button_text:"Explore Inventory",button_url:"/inventory/"});
  return <><PageHero entry={cms("about","hero",{title:"About Iman Truck Sales",body:"A business-first truck dealership serving customers in Florida and across the United States.",image_url:"/images/DSC01718-scaled.jpg",button_text:"",button_url:""})} /><section className="section wrap split"><div className="about-image"><img src={main.image_url} alt={main.title} /></div><div><p className="eyebrow blue">Who we are</p><h2>{main.title}</h2><p>{main.body}</p><a className="primary inline" href={main.button_url}>{main.button_text}</a></div></section><ContactBand cms={cms} /></>;
}

function Contact({cms}:{cms:CmsLookup}) {
  const intro=cms("contact","intro",{title:"Let’s get you closer to the right truck.",body:"Whether you are buying your first box truck, expanding a fleet, or exploring financing, send us the details. A member of our team will follow up with clear next steps.",image_url:"",button_text:"",button_url:""});
  const [submission, setSubmission] = useState("");
  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setSubmission("Online inquiries are being configured. Please call 888-991-4776.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("inquiries").insert({
      first_name: form.get("firstName"),
      last_name: form.get("lastName"),
      email: form.get("email"),
      phone: form.get("phone") || "",
      interest: form.get("interest"),
      message: form.get("message"),
    });
    setSubmission(error ? "We could not send your request. Please call 888-991-4776." : "Thank you. Your request was sent to our sales team.");
    if (!error) event.currentTarget.reset();
  };
  return <><PageHero entry={cms("contact","hero",{title:"Contact Us",body:"Tell us what kind of truck or business support you need. Our team is ready to help you plan the next move.",image_url:"/images/DSC01718-scaled.jpg",button_text:"",button_url:""})} />
    <section className="contact-page">
      <div className="wrap contact-intro">
        <div><p className="eyebrow blue">Start the conversation</p><h2>{intro.title}</h2></div>
        <p>{intro.body}</p>
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
        <form className="professional-form" onSubmit={submitInquiry}>
          <div className="form-heading"><span>Sales inquiry</span><h2>How can we help?</h2><p>Complete the form below and our team will contact you.</p></div>
          <div className="form-row"><label>First name *<input name="firstName" autoComplete="given-name" required placeholder="First name" /></label><label>Last name *<input name="lastName" autoComplete="family-name" required placeholder="Last name" /></label></div>
          <div className="form-row"><label>Email address *<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="(000) 000-0000" /></label></div>
          <label>What are you interested in? *<select name="interest" required defaultValue=""><option value="" disabled>Select one</option><option>Buying a truck</option><option>Financing</option><option>Starting a box truck business</option><option>Nationwide delivery</option><option>Other</option></select></label>
          <label>Tell us more *<textarea name="message" rows={5} required placeholder="Describe the truck, budget, timeline, or support you need." /></label>
          <label className="consent"><input type="checkbox" required /><span>I agree to be contacted by Iman Truck Sales about this request.</span></label>
          <button className="primary submit-contact" type="submit">Send My Request <span>→</span></button>
          {submission && <strong role="status">{submission}</strong>}
          <small className="privacy-note">Your information is used only to respond to this inquiry.</small>
        </form>
      </div>
    </section>
  </>;
}

function ContactBand({cms}:{cms:CmsLookup}) {
  const band=cms("global","contact_band",{title:"Ready to move your business forward?",body:"Tell us what you need and our team will help you plan the next step.",image_url:"",button_text:"Get in Touch",button_url:"/contact-us/"});
  return <section className="contact-band"><div className="wrap contact-band-inner"><div><p className="eyebrow">Your truck, delivered anywhere in the U.S.</p><h2>{band.title}</h2><span>{band.body}</span></div><div className="cta-actions"><a className="light-button" href={band.button_url}>{band.button_text} →</a><a href="tel:8889914776">888-991-4776</a></div></div></section>;
}

function Footer({cms}:{cms:CmsLookup}) {
  const footer=cms("global","footer",{title:"Your trusted source for dependable commercial trucks and practical business guidance.",body:"21902 State Road 46, Mount Dora, FL 32757|info@imanlogistics.com|888-991-4776",image_url:"/images/IMAN-Truck-Sales-White.png",button_text:"",button_url:""});
  const [address,email,phone]=footer.body.split("|");
  return <footer><div className="wrap footer-grid"><div><img className="footer-logo" src={footer.image_url} alt="Iman Truck Sales" /><p>{footer.title}</p></div><div><h3>Quick Links</h3>{nav.slice(0,4).map(([label,href])=><a key={href} href={href}>{label}</a>)}</div><div><h3>Get in Touch</h3><p>{address}</p><a href={`mailto:${email}`}>{email}</a><a href={`tel:${phone}`}>{phone}</a></div></div><div className="copyright">Copyright © 2026 Iman Truck Sales | Powered by Iman Truck Sales</div></footer>;
}

export function TruckSalesSite({ page }: { page: string }) {
  const [trucks, setTrucks] = useState<readonly Truck[]>(inventory);
  const [cmsEntries,setCmsEntries]=useState<CmsEntry[]>([]);
  useEffect(() => {
    if (!supabase) return;
    supabase.from("vehicles").select("*").neq("status", "hidden").order("created_at", { ascending: false }).then(({ data }) => {
      if (data?.length) setTrucks(data.map(vehicle => ({
        image: vehicle.image_url || "/images/DSC01794-scaled.jpg", name: vehicle.name, make: vehicle.make,
        model: vehicle.model, year: String(vehicle.year), condition: vehicle.condition, type: vehicle.vehicle_type,
        mileage: `${Number(vehicle.mileage).toLocaleString()} mi`, price: vehicle.price ? Number(vehicle.price) : null,
      })));
    });
  }, []);
  useEffect(()=>{if(!supabase)return; supabase.from("site_content").select("*").then(({data})=>setCmsEntries(data||[]));},[]);
  const cms:CmsLookup=(pageName,key,fallback)=>cmsEntries.find(entry=>entry.page===pageName&&entry.content_key===key)||{page:pageName,content_key:key,...fallback};
  const content = page === "inventory" ? <Inventory trucks={trucks} cms={cms} /> : page === "home-page" ? <Business cms={cms} /> : page === "financing" ? <Financing cms={cms} /> : page === "about-us" ? <About cms={cms} /> : page === "contact-us" ? <Contact cms={cms} /> : <Home trucks={trucks} cms={cms} />;
  return <><Header page={page} cms={cms} /><main>{content}</main><Footer cms={cms} /></>;
}
