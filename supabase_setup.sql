-- 1. Table for Locations
CREATE TABLE public.locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  distance TEXT,
  description TEXT,
  guidance TEXT,
  phone TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

-- 2. Table for Menus
CREATE TABLE public.menus (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  cooking_method TEXT,
  price INTEGER NOT NULL,
  image_url TEXT
);

-- 3. Table for Stocks (Relation between Location and Menu)
CREATE TABLE public.location_stocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id TEXT REFERENCES public.locations(id) ON DELETE CASCADE,
  menu_id INTEGER REFERENCES public.menus(id) ON DELETE CASCADE,
  stock INTEGER DEFAULT 0,
  UNIQUE(location_id, menu_id)
);

-- 4. Table for Transactions (for Admin Stats)
CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  location_id TEXT REFERENCES public.locations(id),
  customer_name TEXT,
  total_price INTEGER,
  pickup_time TEXT,
  status TEXT DEFAULT 'Pending',
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- INSERT INITIAL MOCK DATA
-- ==========================================

INSERT INTO public.locations (id, name, distance, description, guidance, phone) VALUES
('loc1', 'Binus Bandung', 'Dalam Kampus', 'Lobby Hejo', 'Temui admin dengan tepat waktu', '62895346019419'),
('loc2', 'Marcia & Alicia', '2.5 km', 'Jln. Elang', 'Bisa langsung ambil di rak lobi kosan.', '62895346019419'),
('loc3', 'Rumah Darren', '3.8 km', 'Jln. Holis No 123', 'Titipan ada di dekat Toko, langsung ketuk pagar.', '6289618440238'),
('loc4', 'Rumah Daffa', '5.0 km', 'Apartemen Suites', 'Ambil di resepsionis Tower A.', '6289618440238');

INSERT INTO public.menus (id, name, description, long_description, cooking_method, price, image_url) VALUES
(1, 'Paket Ngebut 1', 'Cimol Keju Lumer + Es Teh Manis. Paling cepet abis!', 'Kombinasi andalan mahasiswa sibuk. Cimol isi keju lumer yang digoreng dadakan (sudah siap makan), disajikan dengan es teh manis segar untuk menghilangkan dahaga seketika.', 'Langsung santap. Cimol sudah digoreng matang sempurna dengan bumbu pedas manis rahasia Cabi.', 18000, '/assets/Cabi + Teh Manis.png'),
(2, 'Paket Hemat Nugas', 'Cimol Pedas Nampol + Air Mineral. Pas buat begadang.', 'Paket ekonomis buat kamu yang butuh temen melek ngerjain tugas. Cimol bumbu pedas nampol level 5 siap bikin mata melek, plus air mineral dingin.', 'Langsung santap. Bumbu pedas sudah diaduk merata.', 15000, '/assets/Cabi + Air Mineral.png'),
(3, 'Cabi Frozen Pack', 'Cimol beku siap goreng di kosan. Tahan lama.', 'Buat stok di kosan! 1 pack berisi 30 butir cimol isi keju premium. Sudah termasuk bumbu tabur pedas dan asin yang dipisah.', '1. Masukkan cimol ke dalam minyak yang masih DINGIN. 2. Nyalakan api kecil-sedang. 3. Goreng sambil diaduk terus hingga mengembang dan kokoh. 4. Tiriskan dan taburi bumbu.', 25000, '/assets/Menu Frozen.jpeg');

-- Insert Initial Stocks
INSERT INTO public.location_stocks (location_id, menu_id, stock) VALUES
('loc1', 1, 3), ('loc1', 2, 12), ('loc1', 3, 0),
('loc2', 1, 0), ('loc2', 2, 5),  ('loc2', 3, 10),
('loc3', 1, 15),('loc3', 2, 0),  ('loc3', 3, 5),
('loc4', 1, 10),('loc4', 2, 10), ('loc4', 3, 10);
