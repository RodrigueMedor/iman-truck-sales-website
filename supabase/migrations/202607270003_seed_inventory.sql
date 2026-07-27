insert into public.vehicles (
  name, make, model, year, condition, vehicle_type, mileage, price, status, image_url
)
select
  vehicle.name, vehicle.make, vehicle.model, vehicle.year, vehicle.condition,
  vehicle.vehicle_type, vehicle.mileage, null, 'available', vehicle.image_url
from (
  values
    ('2018 Freightliner M2 106', 'Freightliner', 'M2 106', 2018, 'Used', 'Box Truck', 238420, '/images/DSC01736-scaled.jpg'),
    ('2019 Hino 268A', 'Hino', '268A', 2019, 'Used', '26′ Box Truck', 214865, '/images/DSC01758-scaled.jpg'),
    ('2020 International MV', 'International', 'MV', 2020, 'Used', 'Commercial Truck', 198730, '/images/DSC01794-scaled.jpg'),
    ('2019 Freightliner M2', 'Freightliner', 'M2 106', 2019, 'Used', 'Straight Truck', 225190, '/images/DSC01800-scaled.jpg')
) as vehicle(name, make, model, year, condition, vehicle_type, mileage, image_url)
where not exists (
  select 1
  from public.vehicles existing
  where existing.name = vehicle.name and existing.year = vehicle.year
);
