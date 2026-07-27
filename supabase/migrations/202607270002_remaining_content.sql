insert into public.site_content (page, content_key, title, body, image_url, button_text, button_url) values
('global','header','Request Appointment','21902 State Road 46, Mount Dora, FL 32757|info@imanlogistics.com|888-991-4776','/images/IMAN-Truck-Sales-White.png','Request Appointment','/contact-us/'),
('global','navigation','Website menu','Home|/;Inventory|/inventory/;Start a Box Truck Business|/home-page/;Financing|/financing/;About us|/about-us/;Contact us|/contact-us/','','',''),
('home','statistics','Homepage statistics','4|Trucks available now;50|States we deliver to;3|Trusted commercial brands;1|Team focused on your goal','','',''),
('home','benefits','Why customers choose us','Business-first advice|Guidance shaped around how you plan to use and grow with your truck.;Carefully selected inventory|Commercial vehicles chosen for serious operators and new owners.;Support beyond the sale|Financing direction, delivery coordination, and practical next steps.','','',''),
('inventory','search','Find your next truck','Search available commercial inventory','','Search Trucks',''),
('business','steps','Business preparation steps','Choose a dependable truck for your operation;Understand registration, insurance, and compliance;Prepare a realistic operating budget;Build relationships and secure freight opportunities','','',''),
('financing','features','Financing benefits','Simple application process;Options for different credit profiles;Commercial vehicle expertise;Clear, responsive guidance','','',''),
('contact','cards','Contact options','Call our sales team|888-991-4776|Speak directly with someone who understands commercial trucks.;Email us|info@imanlogistics.com|Send vehicle questions, trade details, or financing inquiries.;Visit the dealership|Mount Dora, Florida|21902 State Road 46, Mount Dora, FL 32757','','',''),
('contact','process','What happens next','We review your request|Tell us about the truck, financing, or business support you need.;A specialist contacts you|Our team will follow up to clarify your priorities and timeline.;We plan your next step|Review available vehicles, financing direction, or delivery options.','','',''),
('contact','hours','Business hours','Monday–Friday · 9:00 AM–6:00 PM;Saturday · By appointment;Sunday · Closed','','',''),
('contact','form','How can we help?','Complete the form below and our team will contact you.','','Send My Request','')
on conflict (page, content_key) do nothing;
