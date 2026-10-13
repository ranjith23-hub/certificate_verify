-- Sample data for testing (run AFTER schema.sql). Names, numbers and addresses are made up,
-- except the first certificate, which mirrors your real sample.

insert into customers (name, address, phone, gstin, dealer) values
 ('M/S. S.G.AGENCY',         'S.F NO: 417/2, GUDIYATHAM MAIN ROAD, VELLORE, TAMILNADU - 632006.', '9000000001', '33AAAAA0001A1Z5', 'BPCL'),
 ('M/S. SRI MURUGAN FUELS',  '12, TRICHY ROAD, COIMBATORE, TAMILNADU - 641018.',                  '9000000002', '33AAAAA0002A1Z5', 'IOCL'),
 ('M/S. KAVERI PETROLEUM',   'NH 44, SALEM MAIN ROAD, NAMAKKAL, TAMILNADU - 637001.',             '9000000003', '33AAAAA0003A1Z5', 'HPCL'),
 ('M/S. APOLLO TYRES - ERODE','45, PERUNDURAI ROAD, ERODE, TAMILNADU - 638011.',                  '9000000004', '33AAAAA0004A1Z5', 'Apollo'),
 ('M/S. LAKSHMI SERVICE STATION','7, MADURAI BYPASS ROAD, THENI, TAMILNADU - 625531.',            '9000000005', '33AAAAA0005A1Z5', 'IOCL');

insert into products (item_description, item_model, item_range, id_no) values
 ('Digital Nitrogen Tyre Inflator', 'NITROJET 6000 LCV [4H+]', '0-100 psi', 'P-22120690375'),
 ('Digital Nitrogen Tyre Inflator', 'NITROJET 4000 PCV',       '0-60 psi',  'P-22120690412'),
 ('Digital Nitrogen Tyre Inflator', 'NITROJET 6000 LCV [4H+]', '0-100 psi', 'P-23030710518'),
 ('Airojet',                        'AIROJET 2000',            '0-12 bar',  'A-23060810201'),
 ('Airojet',                        'AIROJET 3000',            '0-16 bar',  'A-24010910334'),
 ('Digital Nitrogen Tyre Inflator', 'NITROJET 4000 PCV',       '0-60 psi',  'P-24021010677');

insert into master_calibrators (name, make, model, serial_number, certificate_number) values
 ('DIGITAL PRESSURE GAUGE', 'ICON EMBEDED CONTROLS', 'IEC-PC-16-B', '20100280009', 'SLT/24/11/680/004'),
 ('DIGITAL PRESSURE GAUGE', 'ICON EMBEDED CONTROLS', 'IEC-PC-16-A', '20100280015', 'SLT/24/11/680/007');

insert into standard_calibrators (name, make, id_sl_no, reference_standard, certificate_number) values
 ('DIGITAL MASTER PRESSURE GAUGE', 'R&D INSTRUMENTS', 'ESLT120', 'DKD R-6-1:2014 Sequence C', 'CS/24/LB/MP/139-01'),
 ('DIGITAL MASTER PRESSURE GAUGE', 'R&D INSTRUMENTS', 'ESLT121', 'DKD R-6-1:2014 Sequence C', 'CS/24/LB/MP/139-02');

-- Certificates: 6 pending, 2 already verified
insert into certificates
  (cert_no, customer_id, item_id, master_calibrator_id, standard_calibrator_id,
   env_condition, cal_date, next_cal_date, result_text, done_by, is_verified, confirmed_by, verified_at)
select v.cert_no,
  (select id from customers where phone = v.phone),
  (select item_id from products where id_no = v.id_no),
  (select id from master_calibrators   where serial_number = v.msn),
  (select id from standard_calibrators where id_sl_no = v.ssn),
  'Temp: 30±3°C RH: 35-65%', v.cal, v.cal + 365,
  'The pressure measured and displayed on the product has been verified with Master Calibrator and found to be correct.',
  v.done_by, v.ver, v.conf, v.ver_at
from (values
  ('25051024271', '9000000001', 'P-22120690375', '20100280009', 'ESLT120', current_date - 3,  'Mr. M. KUMAR', false, null,          null::timestamptz),
  ('SAMPLE-002',  '9000000002', 'P-22120690412', '20100280009', 'ESLT120', current_date - 3,  'Mr. M. KUMAR', false, null,          null),
  ('SAMPLE-003',  '9000000003', 'P-23030710518', '20100280015', 'ESLT121', current_date - 2,  'Mr. R. RAJA',  false, null,          null),
  ('SAMPLE-004',  '9000000004', 'A-23060810201', '20100280015', 'ESLT121', current_date - 2,  'Mr. R. RAJA',  false, null,          null),
  ('SAMPLE-005',  '9000000005', 'A-24010910334', '20100280009', 'ESLT120', current_date - 1,  'Mr. M. KUMAR', false, null,          null),
  ('SAMPLE-006',  '9000000001', 'P-24021010677', '20100280015', 'ESLT121', current_date,      'Mr. R. RAJA',  false, null,          null),
  ('SAMPLE-007',  '9000000002', 'P-22120690375', '20100280009', 'ESLT120', current_date - 20, 'Mr. M. KUMAR', true,  'Reviewer One', now() - interval '19 days'),
  ('SAMPLE-008',  '9000000003', 'A-24010910334', '20100280015', 'ESLT121', current_date - 15, 'Mr. R. RAJA',  true,  'Reviewer Two', now() - interval '14 days')
) as v(cert_no, phone, id_no, msn, ssn, cal, done_by, ver, conf, ver_at);
