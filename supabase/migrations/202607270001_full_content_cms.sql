alter table public.site_content add column if not exists image_url text not null default '';
alter table public.site_content add column if not exists button_text text not null default '';
alter table public.site_content add column if not exists button_url text not null default '';

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

create policy "public reads site media" on storage.objects for select using (bucket_id = 'site-media');
create policy "admins upload site media" on storage.objects for insert with check (bucket_id = 'site-media' and public.is_admin());
create policy "admins update site media" on storage.objects for update using (bucket_id = 'site-media' and public.is_admin());
create policy "admins delete site media" on storage.objects for delete using (bucket_id = 'site-media' and public.is_admin());

insert into public.site_content (page, content_key, title, body, image_url, button_text, button_url) values
('global','contact_band','Ready to move your business forward?','Tell us what you need and our team will help you plan the next step.','','Get in Touch','/contact-us/'),
('global','footer','Your trusted source for dependable commercial trucks and practical business guidance.','21902 State Road 46, Mount Dora, FL 32757|info@imanlogistics.com|888-991-4776','/images/IMAN-Truck-Sales-White.png','',''),
('home','hero','Built to Work. Ready to Earn.','Quality commercial trucks, straightforward financing guidance, and nationwide delivery from a team invested in your success.','/images/DSC01794-scaled.jpg','Browse Inventory','/inventory/'),
('home','featured','Featured Trucks','Explore dependable commercial inventory selected for serious operators.','','Explore all inventory','/inventory/'),
('home','why','A smarter way to buy your next commercial truck.','We understand that a truck is more than equipment—it is the engine behind your livelihood. Our team makes the process clear, responsive, and focused on getting you road-ready.','/images/DSC01718-scaled.jpg','Learn about our team','/about-us/'),
('inventory','hero','Truck Inventory','Explore dependable commercial vehicles selected for business owners and professional operators.','/images/DSC01718-scaled.jpg','',''),
('business','hero','Start a Box Truck Business','A practical path from buying the right truck to building a business ready for the road.','/images/DSC01718-scaled.jpg','',''),
('business','main','More than a truck. A business opportunity.','Iman Truck Sales helps aspiring owners understand the equipment, operating requirements, and decisions involved in launching a box truck business.','/images/pngtree-box-truck-isolated-on-transparent-background-png-image_15814026.png','Start the Conversation','/contact-us/'),
('financing','hero','Commercial Truck Financing','Flexible paths designed to help qualified buyers move forward with confidence.','/images/DSC01718-scaled.jpg','',''),
('financing','main','Let’s find an option that fits your plan.','Whether you are expanding a fleet or purchasing your first commercial truck, our team can help you understand available financing options and prepare your application.','','Apply for Financing','https://coach.lending.online/'),
('about','hero','About Iman Truck Sales','A business-first truck dealership serving customers in Florida and across the United States.','/images/DSC01718-scaled.jpg','',''),
('about','main','Trucks, guidance, and service you can rely on.','Iman Truck Sales connects customers with quality commercial vehicles and the information they need to make confident decisions. We believe buying a truck should feel straightforward, respectful, and focused on your goals.','/images/X31x9qWyEZGDAKlxvpYrwqLeCf7zDF6CDZeQMvEo.jpeg','Explore Inventory','/inventory/'),
('contact','hero','Contact Us','Tell us what kind of truck or business support you need. Our team is ready to help you plan the next move.','/images/DSC01718-scaled.jpg','',''),
('contact','intro','Let’s get you closer to the right truck.','Whether you are buying your first box truck, expanding a fleet, or exploring financing, send us the details. A member of our team will follow up with clear next steps.','','','')
on conflict (page, content_key) do nothing;
