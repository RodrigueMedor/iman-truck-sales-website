"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import "./admin.css";
import "./uploads.css";
import "./dashboard.css";
import "./inquiries.css";

type Tab = "dashboard" | "inventory" | "content" | "inquiries";
type Vehicle = {
  id: string; name: string; make: string; model: string; year: number; condition: string;
  vehicle_type: string; mileage: number; price: number | null; status: string; image_url: string;
};
type Content = { id: string; page: string; content_key: string; title: string; body: string; image_url: string; button_text: string; button_url: string };
type Inquiry = { id: string; created_at: string; first_name: string; last_name: string; email: string; phone: string; interest: string; message: string; status: string };

const emptyVehicle = { name: "", make: "", model: "", year: new Date().getFullYear(), condition: "Used", vehicle_type: "Box Truck", mileage: 0, price: null, status: "available", image_url: "" };
const emptyContent = { page: "home", content_key: "", title: "", body: "", image_url: "", button_text: "", button_url: "" };
const emptyInquiry = { first_name: "", last_name: "", email: "", phone: "", interest: "Truck purchase", message: "", status: "new" };

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [message, setMessage] = useState("");
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle>>(emptyVehicle);
  const [editingContent, setEditingContent] = useState<Partial<Content>>(emptyContent);
  const [editingInquiry, setEditingInquiry] = useState<Partial<Inquiry>>(emptyInquiry);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const load = async () => {
    if (!supabase || !session) return;
    const [v, c, i] = await Promise.all([
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("site_content").select("*").order("page").order("content_key"),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
    ]);
    setVehicles(v.data || []); setContent(c.data || []); setInquiries(i.data || []);
    const error = v.error || c.error || i.error;
    if (error) setMessage(error.message);
  };
  useEffect(() => { void load(); }, [session]);

  const stats = useMemo(() => ({
    available: vehicles.filter(v => v.status === "available").length,
    sold: vehicles.filter(v => v.status === "sold").length,
    leads: inquiries.filter(i => i.status === "new").length,
    pages: new Set(content.map(c => c.page)).size,
  }), [vehicles, inquiries, content]);

  if (!isSupabaseConfigured) return <SetupNotice />;
  if (!session) return <Login onSuccess={() => void load()} />;

  const saveVehicle = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase) return;
    const payload = { ...editingVehicle, updated_at: new Date().toISOString() };
    const result = editingVehicle.id
      ? await supabase.from("vehicles").update(payload).eq("id", editingVehicle.id)
      : await supabase.from("vehicles").insert(payload);
    setMessage(result.error?.message || "Vehicle saved successfully.");
    if (!result.error) { setEditingVehicle(emptyVehicle); await load(); }
  };
  const saveContent = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase) return;
    const payload = { ...editingContent, updated_at: new Date().toISOString() };
    const result = editingContent.id
      ? await supabase.from("site_content").update(payload).eq("id", editingContent.id)
      : await supabase.from("site_content").insert(payload);
    setMessage(result.error?.message || "Content saved successfully.");
    if (!result.error) { setEditingContent(emptyContent); await load(); }
  };
  const saveInquiry = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase) return;
    const { id, created_at, ...fields } = editingInquiry;
    const result = id
      ? await supabase.from("inquiries").update(fields).eq("id", id)
      : await supabase.from("inquiries").insert(fields);
    setMessage(result.error?.message || (id ? "Inquiry updated successfully." : "Inquiry created successfully."));
    if (!result.error) { setEditingInquiry(emptyInquiry); await load(); }
  };
  const uploadImage = async (file: File, target: "vehicle" | "content") => {
    if (!supabase) return;
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${target}/${crypto.randomUUID()}.${extension}`;
    setMessage("Uploading image…");
    const uploaded = await supabase.storage.from("site-media").upload(path, file);
    if (uploaded.error) return setMessage(uploaded.error.message);
    const { data } = supabase.storage.from("site-media").getPublicUrl(path);
    if (target === "vehicle") setEditingVehicle(current => ({ ...current, image_url: data.publicUrl }));
    else setEditingContent(current => ({ ...current, image_url: data.publicUrl }));
    setMessage("Image uploaded. Save the record to publish it.");
  };
  const remove = async (table: "vehicles" | "site_content" | "inquiries", id: string) => {
    if (!supabase || !confirm("Delete this item permanently?")) return;
    const result = await supabase.from(table).delete().eq("id", id);
    setMessage(result.error?.message || "Item deleted."); await load();
  };
  const updateInquiryStatus = async (id: string, status: string) => {
    if (!supabase) return;
    const result = await supabase.from("inquiries").update({ status }).eq("id", id);
    setMessage(result.error?.message || "Inquiry status updated.");
    if (!result.error) await load();
  };

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/"><span>IMAN</span><b>TRUCK SALES</b><small>Back Office</small></a>
      <nav>{(["dashboard","inventory","content","inquiries"] as Tab[]).map(item =>
        <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</nav>
      <a className="public-link" href="/" target="_blank">View public website ↗</a>
      <button className="signout" onClick={() => supabase?.auth.signOut()}>Sign out</button>
    </aside>
    <main className="admin-main">
      <header><div><span>Content management</span><h1>{tab}</h1></div><div className="admin-user">{session.user.email}</div></header>
      {message && <div className="admin-message"><span>{message}</span><button onClick={() => setMessage("")}>×</button></div>}
      {tab === "dashboard" && <>
        <section className="stat-grid">
          <Stat label="Available vehicles" value={stats.available}/><Stat label="Sold vehicles" value={stats.sold}/>
          <Stat label="New inquiries" value={stats.leads}/><Stat label="Managed pages" value={stats.pages}/>
        </section>
        <section className="dashboard-grid">
          <article className="dashboard-panel">
            <div className="panel-heading"><div><span>Shortcuts</span><h2>Quick actions</h2></div></div>
            <div className="quick-actions">
              <button onClick={()=>{setEditingVehicle(emptyVehicle);setTab("inventory")}}>＋ Add a vehicle</button>
              <button onClick={()=>{setEditingContent(emptyContent);setTab("content")}}>✎ Add website content</button>
              <button onClick={()=>{setEditingInquiry(emptyInquiry);setTab("inquiries")}}>◎ Add an inquiry</button>
              <a href="/" target="_blank">↗ Open public website</a>
            </div>
          </article>
          <article className="dashboard-panel">
            <div className="panel-heading"><div><span>Inventory</span><h2>Vehicle pipeline</h2></div><button onClick={()=>setTab("inventory")}>Manage</button></div>
            <div className="pipeline">
              {["available","pending","sold","hidden"].map(status=><div key={status}><span>{status}</span><strong>{vehicles.filter(v=>v.status===status).length}</strong></div>)}
            </div>
          </article>
          <article className="dashboard-panel wide-panel">
            <div className="panel-heading"><div><span>Sales desk</span><h2>Recent inquiries</h2></div><button onClick={()=>setTab("inquiries")}>View all</button></div>
            {inquiries.slice(0,5).map(i=><div className="dashboard-row" key={i.id}><div><strong>{i.first_name} {i.last_name}</strong><span>{i.interest} · {i.email}</span></div><em className={`status-${i.status}`}>{i.status}</em></div>)}
            {!inquiries.length&&<p className="empty-dashboard">New website inquiries will appear here.</p>}
          </article>
          <article className="dashboard-panel">
            <div className="panel-heading"><div><span>Website</span><h2>Content coverage</h2></div><button onClick={()=>setTab("content")}>Edit</button></div>
            <div className="coverage-list">{Array.from(new Set(content.map(c=>c.page))).map(pageName=><div key={pageName}><span>{pageName}</span><strong>{content.filter(c=>c.page===pageName).length} sections</strong></div>)}</div>
          </article>
        </section>
      </>}
      {tab === "inventory" && <section className="admin-workspace">
        <Editor title={editingVehicle.id ? "Edit vehicle" : "Add vehicle"}>
          <form onSubmit={saveVehicle} className="admin-form">
            <Input label="Listing name" value={editingVehicle.name} onChange={name => setEditingVehicle({...editingVehicle,name})}/>
            <Input label="Make" value={editingVehicle.make} onChange={make => setEditingVehicle({...editingVehicle,make})}/>
            <Input label="Model" value={editingVehicle.model} onChange={model => setEditingVehicle({...editingVehicle,model})}/>
            <Input label="Year" type="number" value={editingVehicle.year} onChange={year => setEditingVehicle({...editingVehicle,year:Number(year)})}/>
            <Input label="Mileage" type="number" value={editingVehicle.mileage} onChange={mileage => setEditingVehicle({...editingVehicle,mileage:Number(mileage)})}/>
            <Input label="Price (leave empty for call)" type="number" value={editingVehicle.price ?? ""} onChange={price => setEditingVehicle({...editingVehicle,price:price ? Number(price) : null})}/>
            <Input label="Vehicle type" value={editingVehicle.vehicle_type} onChange={vehicle_type => setEditingVehicle({...editingVehicle,vehicle_type})}/>
            <Input label="Image URL" value={editingVehicle.image_url} onChange={image_url => setEditingVehicle({...editingVehicle,image_url})}/>
            <label className="wide upload-field">Upload vehicle photo<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&void uploadImage(e.target.files[0],"vehicle")}/>{editingVehicle.image_url&&<img src={editingVehicle.image_url} alt="Vehicle preview"/>}</label>
            <label>Status<select value={editingVehicle.status} onChange={e=>setEditingVehicle({...editingVehicle,status:e.target.value})}><option value="available">Available</option><option value="pending">Pending</option><option value="sold">Sold</option><option value="hidden">Hidden</option></select></label>
            <button className="admin-primary">Save vehicle</button>
          </form>
        </Editor>
        <Records>{vehicles.map(v=><Record key={v.id} title={v.name} meta={`${v.year} ${v.make} · ${v.mileage.toLocaleString()} mi · ${v.status}`} onEdit={()=>setEditingVehicle(v)} onDelete={()=>remove("vehicles",v.id)}/>)}</Records>
      </section>}
      {tab === "content" && <section className="admin-workspace">
        <Editor title={editingContent.id ? "Edit content" : "Add content block"}>
          <form onSubmit={saveContent} className="admin-form">
            <Input label="Page" value={editingContent.page} onChange={page=>setEditingContent({...editingContent,page})}/>
            <Input label="Content key" value={editingContent.content_key} onChange={content_key=>setEditingContent({...editingContent,content_key})}/>
            <Input label="Heading" value={editingContent.title} onChange={title=>setEditingContent({...editingContent,title})}/>
            <label className="wide">Body<textarea rows={7} value={editingContent.body || ""} onChange={e=>setEditingContent({...editingContent,body:e.target.value})}/></label>
            <Input label="Button text" value={editingContent.button_text} onChange={button_text=>setEditingContent({...editingContent,button_text})}/>
            <Input label="Button link" value={editingContent.button_url} onChange={button_url=>setEditingContent({...editingContent,button_url})}/>
            <Input label="Image URL" value={editingContent.image_url} onChange={image_url=>setEditingContent({...editingContent,image_url})}/>
            <label className="wide upload-field">Upload section photo<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&void uploadImage(e.target.files[0],"content")}/>{editingContent.image_url&&<img src={editingContent.image_url} alt="Section preview"/>}</label>
            <button className="admin-primary">Save content</button>
          </form>
        </Editor>
        <Records>{content.map(c=><Record key={c.id} title={`${c.page} · ${c.title}`} meta={c.content_key} onEdit={()=>setEditingContent(c)} onDelete={()=>remove("site_content",c.id)}/>)}</Records>
      </section>}
      {tab === "inquiries" && <section className="admin-workspace">
        <Editor title={editingInquiry.id ? "Edit inquiry" : "Add inquiry"}>
          <form onSubmit={saveInquiry} className="admin-form">
            <Input label="First name" value={editingInquiry.first_name} onChange={first_name=>setEditingInquiry({...editingInquiry,first_name})}/>
            <Input label="Last name" value={editingInquiry.last_name} onChange={last_name=>setEditingInquiry({...editingInquiry,last_name})}/>
            <Input label="Email" type="email" value={editingInquiry.email} onChange={email=>setEditingInquiry({...editingInquiry,email})}/>
            <Input label="Phone" type="tel" required={false} value={editingInquiry.phone} onChange={phone=>setEditingInquiry({...editingInquiry,phone})}/>
            <label>Interest<select value={editingInquiry.interest || "Truck purchase"} onChange={e=>setEditingInquiry({...editingInquiry,interest:e.target.value})}><option>Truck purchase</option><option>Vehicle financing</option><option>Trade-in</option><option>General question</option><option>Other</option></select></label>
            <label>Status<select value={editingInquiry.status || "new"} onChange={e=>setEditingInquiry({...editingInquiry,status:e.target.value})}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option><option value="spam">Spam</option></select></label>
            <label className="wide">Message<textarea rows={6} required value={editingInquiry.message || ""} onChange={e=>setEditingInquiry({...editingInquiry,message:e.target.value})}/></label>
            <div className="form-actions wide">
              <button className="admin-primary">{editingInquiry.id ? "Update inquiry" : "Create inquiry"}</button>
              {editingInquiry.id&&<button type="button" className="admin-secondary" onClick={()=>setEditingInquiry(emptyInquiry)}>Cancel editing</button>}
            </div>
          </form>
        </Editor>
        <Records>{inquiries.map(i=><article className="record inquiry-record" key={i.id}><div><h3>{i.first_name} {i.last_name}</h3><span>{i.email} · {i.phone || "No phone"} · {i.interest} · {new Date(i.created_at).toLocaleDateString()}</span><p>{i.message}</p></div><div className="inquiry-actions"><label>Status<select value={i.status} onChange={e=>void updateInquiryStatus(i.id,e.target.value)}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option><option value="spam">Spam</option></select></label><button onClick={()=>setEditingInquiry(i)}>Edit</button><button className="danger" onClick={()=>void remove("inquiries",i.id)}>Delete</button></div></article>)}</Records>
      </section>}
    </main>
  </div>;
}

function Login({onSuccess}:{onSuccess:()=>void}) {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  const submit=async(e:FormEvent)=>{e.preventDefault(); const result=await supabase!.auth.signInWithPassword({email,password}); setError(result.error?.message||""); if(!result.error) onSuccess();};
  return <div className="admin-login"><form onSubmit={submit}><span>IMAN TRUCK SALES</span><h1>Back-office login</h1><p>Secure access for authorized website administrators.</p><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<b>{error}</b>}<button>Sign in securely</button><a href="/">← Return to website</a></form></div>;
}
function SetupNotice(){return <div className="admin-login"><div className="setup-card"><h1>Connect Supabase</h1><p>Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Netlify, then run the included Supabase migration.</p></div></div>}
function Stat({label,value}:{label:string,value:number}){return <article className="stat"><span>{label}</span><strong>{value}</strong></article>}
function Editor({title,children}:{title:string,children:ReactNode}){return <div className="editor"><h2>{title}</h2>{children}</div>}
function Records({children}:{children:ReactNode}){return <div className="records">{children}</div>}
function Record({title,meta,detail,onEdit,onDelete}:{title:string,meta:string,detail?:string,onEdit?:()=>void,onDelete?:()=>void}){return <article className="record"><div><h3>{title}</h3><span>{meta}</span>{detail&&<p>{detail}</p>}</div><div>{onEdit&&<button onClick={onEdit}>Edit</button>}{onDelete&&<button className="danger" onClick={onDelete}>Delete</button>}</div></article>}
function Input({label,value,onChange,type="text",required=true}:{label:string,value:unknown,onChange:(value:string)=>void,type?:string,required?:boolean}){return <label>{label}<input required={required && label!=="Price (leave empty for call)"} type={type} value={String(value??"")} onChange={e=>onChange(e.target.value)}/></label>}
