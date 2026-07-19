-- Cars4you :: seed reference data for local dev (runs on `supabase db reset`)
-- India-first catalog: a handful of popular makes/models/variants + major cities.

-- Cities ---------------------------------------------------------------------
insert into public.cities (name, state, slug) values
  ('Mumbai', 'Maharashtra', 'mumbai'),
  ('Delhi', 'Delhi', 'delhi'),
  ('Bengaluru', 'Karnataka', 'bengaluru'),
  ('Hyderabad', 'Telangana', 'hyderabad'),
  ('Chennai', 'Tamil Nadu', 'chennai'),
  ('Pune', 'Maharashtra', 'pune'),
  ('Kolkata', 'West Bengal', 'kolkata'),
  ('Ahmedabad', 'Gujarat', 'ahmedabad');

-- Makes ----------------------------------------------------------------------
insert into public.car_makes (name, slug) values
  ('Maruti Suzuki', 'maruti-suzuki'),
  ('Hyundai', 'hyundai'),
  ('Tata', 'tata'),
  ('Mahindra', 'mahindra'),
  ('Honda', 'honda'),
  ('Toyota', 'toyota'),
  ('Kia', 'kia'),
  ('Volkswagen', 'volkswagen');

-- Models (a representative subset) -------------------------------------------
insert into public.car_models (make_id, name, slug, body_type)
select id, m.name, m.slug, m.body::body_type
from public.car_makes mk
join (values
  ('Maruti Suzuki', 'Swift', 'maruti-swift', 'hatchback'),
  ('Maruti Suzuki', 'Baleno', 'maruti-baleno', 'hatchback'),
  ('Maruti Suzuki', 'Dzire', 'maruti-dzire', 'sedan'),
  ('Maruti Suzuki', 'Brezza', 'maruti-brezza', 'suv'),
  ('Hyundai', 'i20', 'hyundai-i20', 'hatchback'),
  ('Hyundai', 'Creta', 'hyundai-creta', 'suv'),
  ('Hyundai', 'Venue', 'hyundai-venue', 'suv'),
  ('Tata', 'Nexon', 'tata-nexon', 'suv'),
  ('Tata', 'Punch', 'tata-punch', 'suv'),
  ('Mahindra', 'XUV700', 'mahindra-xuv700', 'suv'),
  ('Mahindra', 'Thar', 'mahindra-thar', 'suv'),
  ('Honda', 'City', 'honda-city', 'sedan'),
  ('Toyota', 'Innova Crysta', 'toyota-innova-crysta', 'muv'),
  ('Kia', 'Seltos', 'kia-seltos', 'suv'),
  ('Volkswagen', 'Virtus', 'vw-virtus', 'sedan')
) as m(make_name, name, slug, body) on mk.name = m.make_name;

-- A few variants for the most common models ----------------------------------
insert into public.car_variants (model_id, name, fuel, transmission)
select md.id, v.name, v.fuel::fuel_type, v.trans::transmission_type
from public.car_models md
join (values
  ('maruti-swift', 'VXi', 'petrol', 'manual'),
  ('maruti-swift', 'ZXi AMT', 'petrol', 'amt'),
  ('hyundai-creta', 'SX(O) Diesel AT', 'diesel', 'automatic'),
  ('hyundai-creta', 'E Petrol', 'petrol', 'manual'),
  ('tata-nexon', 'XZ+ Petrol', 'petrol', 'manual'),
  ('honda-city', 'VX CVT', 'petrol', 'cvt')
) as v(model_slug, name, fuel, trans) on md.slug = v.model_slug;
