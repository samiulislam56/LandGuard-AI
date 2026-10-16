// ============================================================================
// LandGuard AI — Complete Bangladesh Administrative Hierarchy (8 Divisions, 64 Districts)
// Validated with English & Bengali (বাংলা) nomenclature and geospatial centroids
// ============================================================================

export interface DivisionInfo {
  id: string;
  nameEn: string;
  nameBn: string;
  centroid: [number, number]; // [lat, lng]
  zoom: number;
  totalDistricts: number;
  hasSyntheticCoverage: boolean;
  activeParcels: number;
}

export interface DistrictInfo {
  id: string;
  nameEn: string;
  nameBn: string;
  divisionId: string;
  divisionEn: string;
  centroid: [number, number]; // [lat, lng]
  zoom: number;
  hasSyntheticCoverage: boolean;
  activeParcels: number;
  activeUpazila?: string;
  activeMouza?: string;
  samplePlotId?: string;
}

export const BANGLADESH_CENTER: [number, number] = [23.6850, 90.3563];
export const BANGLADESH_DEFAULT_ZOOM = 7;

export const BANGLADESH_DIVISIONS: Record<string, DivisionInfo> = {
  dhaka: {
    id: 'dhaka',
    nameEn: 'Dhaka',
    nameBn: 'ঢাকা',
    centroid: [23.8103, 90.4125],
    zoom: 9,
    totalDistricts: 13,
    hasSyntheticCoverage: true,
    activeParcels: 750,
  },
  chattogram: {
    id: 'chattogram',
    nameEn: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    centroid: [22.3569, 91.7832],
    zoom: 8,
    totalDistricts: 11,
    hasSyntheticCoverage: true,
    activeParcels: 750,
  },
  rajshahi: {
    id: 'rajshahi',
    nameEn: 'Rajshahi',
    nameBn: 'রাজশাহী',
    centroid: [24.3745, 88.6042],
    zoom: 9,
    totalDistricts: 8,
    hasSyntheticCoverage: true,
    activeParcels: 750,
  },
  khulna: {
    id: 'khulna',
    nameEn: 'Khulna',
    nameBn: 'খুলনা',
    centroid: [22.8456, 89.5403],
    zoom: 9,
    totalDistricts: 10,
    hasSyntheticCoverage: true,
    activeParcels: 750,
  },
  barishal: {
    id: 'barishal',
    nameEn: 'Barishal',
    nameBn: 'বরিশাল',
    centroid: [22.7010, 90.3535],
    zoom: 9,
    totalDistricts: 6,
    hasSyntheticCoverage: false,
    activeParcels: 0,
  },
  sylhet: {
    id: 'sylhet',
    nameEn: 'Sylhet',
    nameBn: 'সিলেট',
    centroid: [24.8949, 91.8687],
    zoom: 9,
    totalDistricts: 4,
    hasSyntheticCoverage: false,
    activeParcels: 0,
  },
  rangpur: {
    id: 'rangpur',
    nameEn: 'Rangpur',
    nameBn: 'রংপুর',
    centroid: [25.7439, 89.2752],
    zoom: 9,
    totalDistricts: 8,
    hasSyntheticCoverage: false,
    activeParcels: 0,
  },
  mymensingh: {
    id: 'mymensingh',
    nameEn: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    centroid: [24.7471, 90.4203],
    zoom: 9,
    totalDistricts: 4,
    hasSyntheticCoverage: false,
    activeParcels: 0,
  },
};

export const BANGLADESH_DIVISIONS_LIST: DivisionInfo[] = Object.values(BANGLADESH_DIVISIONS);

export const BANGLADESH_DISTRICTS: DistrictInfo[] = [
  // --------------------------------------------------------------------------
  // Dhaka Division (13 Districts)
  // --------------------------------------------------------------------------
  {
    id: 'dhaka',
    nameEn: 'Dhaka',
    nameBn: 'ঢাকা',
    divisionId: 'dhaka',
    divisionEn: 'Dhaka',
    centroid: [23.9036, 90.3242],
    zoom: 13,
    hasSyntheticCoverage: true,
    activeParcels: 750,
    activeUpazila: 'Savar',
    activeMouza: 'Ashulia',
    samplePlotId: 'LG-P-002911',
  },
  { id: 'gazipur', nameEn: 'Gazipur', nameBn: 'গাজীপুর', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [24.0023, 90.4267], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'kishoreganj', nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [24.4449, 90.7766], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'manikganj', nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [23.8617, 90.0003], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'munshiganj', nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [23.5422, 90.5305], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'narayanganj', nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [23.6238, 90.5000], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'narsingdi', nameEn: 'Narsingdi', nameBn: 'নরসিংদী', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [23.9322, 90.7154], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'tangail', nameEn: 'Tangail', nameBn: 'টাঙ্গাইল', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [24.2513, 89.9167], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'faridpur', nameEn: 'Faridpur', nameBn: 'ফরিদপুর', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [23.6071, 89.8429], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'gopalganj', nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [23.0051, 89.8266], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'madaripur', nameEn: 'Madaripur', nameBn: 'মাদারীপুর', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [23.1641, 90.1897], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'rajbari', nameEn: 'Rajbari', nameBn: 'রাজবাড়ী', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [23.7574, 89.6445], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'shariatpur', nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর', divisionId: 'dhaka', divisionEn: 'Dhaka', centroid: [23.2423, 90.4348], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },

  // --------------------------------------------------------------------------
  // Chattogram Division (11 Districts)
  // --------------------------------------------------------------------------
  {
    id: 'chattogram',
    nameEn: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    divisionId: 'chattogram',
    divisionEn: 'Chattogram',
    centroid: [22.2965, 91.9841],
    zoom: 13,
    hasSyntheticCoverage: true,
    activeParcels: 750,
    activeUpazila: 'Patiya',
    activeMouza: 'Haidgaon',
    samplePlotId: 'LG-P-000002',
  },
  { id: 'coxsbazar', nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [21.4272, 92.0058], zoom: 10, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'cumilla', nameEn: 'Cumilla', nameBn: 'কুমিল্লা', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [23.4682, 91.1788], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'feni', nameEn: 'Feni', nameBn: 'ফেনী', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [23.0159, 91.3976], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'brahmanbaria', nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [23.9571, 91.1119], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'chandpur', nameEn: 'Chandpur', nameBn: 'চাঁদপুর', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [23.2333, 90.6667], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'noakhali', nameEn: 'Noakhali', nameBn: 'নোয়াখালী', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [22.8696, 91.0998], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'lakshmipur', nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [22.9425, 90.8412], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'khagrachhari', nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [23.1193, 91.9847], zoom: 10, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'rangamati', nameEn: 'Rangamati', nameBn: 'রাঙ্গামাটি', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [22.7324, 92.2985], zoom: 10, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'bandarban', nameEn: 'Bandarban', nameBn: 'বান্দরবান', divisionId: 'chattogram', divisionEn: 'Chattogram', centroid: [22.1953, 92.2184], zoom: 10, hasSyntheticCoverage: false, activeParcels: 0 },

  // --------------------------------------------------------------------------
  // Rajshahi Division (8 Districts)
  // --------------------------------------------------------------------------
  {
    id: 'rajshahi',
    nameEn: 'Rajshahi',
    nameBn: 'রাজশাহী',
    divisionId: 'rajshahi',
    divisionEn: 'Rajshahi',
    centroid: [24.4172, 88.5529],
    zoom: 13,
    hasSyntheticCoverage: true,
    activeParcels: 750,
    activeUpazila: 'Paba',
    activeMouza: 'Haripur',
    samplePlotId: 'LG-P-000001',
  },
  { id: 'bogura', nameEn: 'Bogura', nameBn: 'বগুড়া', divisionId: 'rajshahi', divisionEn: 'Rajshahi', centroid: [24.8465, 89.3770], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'joypurhat', nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট', divisionId: 'rajshahi', divisionEn: 'Rajshahi', centroid: [25.1015, 89.0277], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'naogaon', nameEn: 'Naogaon', nameBn: 'নওগাঁ', divisionId: 'rajshahi', divisionEn: 'Rajshahi', centroid: [24.7936, 88.9318], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'natore', nameEn: 'Natore', nameBn: 'নাটোর', divisionId: 'rajshahi', divisionEn: 'Rajshahi', centroid: [24.4206, 89.0003], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'chapainawabganj', nameEn: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', divisionId: 'rajshahi', divisionEn: 'Rajshahi', centroid: [24.5965, 88.2776], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'pabna', nameEn: 'Pabna', nameBn: 'পাবনা', divisionId: 'rajshahi', divisionEn: 'Rajshahi', centroid: [24.0064, 89.2372], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'sirajganj', nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', divisionId: 'rajshahi', divisionEn: 'Rajshahi', centroid: [24.4534, 89.7008], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },

  // --------------------------------------------------------------------------
  // Khulna Division (10 Districts)
  // --------------------------------------------------------------------------
  {
    id: 'khulna',
    nameEn: 'Khulna',
    nameBn: 'খুলনা',
    divisionId: 'khulna',
    divisionEn: 'Khulna',
    centroid: [22.8124, 89.4318],
    zoom: 13,
    hasSyntheticCoverage: true,
    activeParcels: 750,
    activeUpazila: 'Dumuria',
    activeMouza: 'Raghunathpur',
    samplePlotId: 'LG-P-000003',
  },
  { id: 'bagerhat', nameEn: 'Bagerhat', nameBn: 'বাগেরহাট', divisionId: 'khulna', divisionEn: 'Khulna', centroid: [22.6516, 89.7859], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'chuadanga', nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', divisionId: 'khulna', divisionEn: 'Khulna', centroid: [23.6402, 88.8418], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'jashore', nameEn: 'Jashore', nameBn: 'যশোর', divisionId: 'khulna', divisionEn: 'Khulna', centroid: [23.1664, 89.2115], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'jhenaidah', nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ', divisionId: 'khulna', divisionEn: 'Khulna', centroid: [23.5448, 89.1539], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'kushtia', nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া', divisionId: 'khulna', divisionEn: 'Khulna', centroid: [23.9013, 89.1204], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'magura', nameEn: 'Magura', nameBn: 'মাগুরা', divisionId: 'khulna', divisionEn: 'Khulna', centroid: [23.4873, 89.4199], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'meherpur', nameEn: 'Meherpur', nameBn: 'মেহেরপুর', divisionId: 'khulna', divisionEn: 'Khulna', centroid: [23.7622, 88.6318], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'narail', nameEn: 'Narail', nameBn: 'নড়াইল', divisionId: 'khulna', divisionEn: 'Khulna', centroid: [23.1725, 89.5127], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'satkhira', nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা', divisionId: 'khulna', divisionEn: 'Khulna', centroid: [22.7185, 89.0705], zoom: 10, hasSyntheticCoverage: false, activeParcels: 0 },

  // --------------------------------------------------------------------------
  // Barishal Division (6 Districts)
  // --------------------------------------------------------------------------
  { id: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল', divisionId: 'barishal', divisionEn: 'Barishal', centroid: [22.7010, 90.3535], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'barguna', nameEn: 'Barguna', nameBn: 'বরগুনা', divisionId: 'barishal', divisionEn: 'Barishal', centroid: [22.0953, 90.1121], zoom: 10, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'bhola', nameEn: 'Bhola', nameBn: 'ভোলা', divisionId: 'barishal', divisionEn: 'Barishal', centroid: [22.6859, 90.6481], zoom: 10, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'jhalokati', nameEn: 'Jhalokati', nameBn: 'ঝালকাঠি', divisionId: 'barishal', divisionEn: 'Barishal', centroid: [22.6406, 90.1987], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'patuakhali', nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', divisionId: 'barishal', divisionEn: 'Barishal', centroid: [22.3596, 90.3299], zoom: 10, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'pirojpur', nameEn: 'Pirojpur', nameBn: 'পিরোজপুর', divisionId: 'barishal', divisionEn: 'Barishal', centroid: [22.5841, 89.9720], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },

  // --------------------------------------------------------------------------
  // Sylhet Division (4 Districts)
  // --------------------------------------------------------------------------
  { id: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট', divisionId: 'sylhet', divisionEn: 'Sylhet', centroid: [24.8949, 91.8687], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'habiganj', nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ', divisionId: 'sylhet', divisionEn: 'Sylhet', centroid: [24.3749, 91.4155], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'moulvibazar', nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', divisionId: 'sylhet', divisionEn: 'Sylhet', centroid: [24.4829, 91.7774], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'sunamganj', nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ', divisionId: 'sylhet', divisionEn: 'Sylhet', centroid: [25.0658, 91.3950], zoom: 10, hasSyntheticCoverage: false, activeParcels: 0 },

  // --------------------------------------------------------------------------
  // Rangpur Division (8 Districts)
  // --------------------------------------------------------------------------
  { id: 'rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর', divisionId: 'rangpur', divisionEn: 'Rangpur', centroid: [25.7439, 89.2752], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'dinajpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর', divisionId: 'rangpur', divisionEn: 'Rangpur', centroid: [25.6217, 88.6355], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'gaibandha', nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা', divisionId: 'rangpur', divisionEn: 'Rangpur', centroid: [25.3288, 89.5281], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'kurigram', nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম', divisionId: 'rangpur', divisionEn: 'Rangpur', centroid: [25.8054, 89.6362], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'lalmonirhat', nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট', divisionId: 'rangpur', divisionEn: 'Rangpur', centroid: [25.9923, 89.2847], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'nilphamari', nameEn: 'Nilphamari', nameBn: 'নীলফামারী', divisionId: 'rangpur', divisionEn: 'Rangpur', centroid: [25.9318, 88.8560], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'panchagarh', nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়', divisionId: 'rangpur', divisionEn: 'Rangpur', centroid: [26.3411, 88.5542], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'thakurgaon', nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', divisionId: 'rangpur', divisionEn: 'Rangpur', centroid: [26.0337, 88.4617], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },

  // --------------------------------------------------------------------------
  // Mymensingh Division (4 Districts)
  // --------------------------------------------------------------------------
  { id: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', divisionId: 'mymensingh', divisionEn: 'Mymensingh', centroid: [24.7471, 90.4203], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'jamalpur', nameEn: 'Jamalpur', nameBn: 'জামালপুর', divisionId: 'mymensingh', divisionEn: 'Mymensingh', centroid: [24.9375, 89.9378], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'netrokona', nameEn: 'Netrokona', nameBn: 'নেত্রকোণা', divisionId: 'mymensingh', divisionEn: 'Mymensingh', centroid: [24.8709, 90.7279], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
  { id: 'sherpur', nameEn: 'Sherpur', nameBn: 'শেরপুর', divisionId: 'mymensingh', divisionEn: 'Mymensingh', centroid: [25.0205, 90.0153], zoom: 11, hasSyntheticCoverage: false, activeParcels: 0 },
];

export function getDistrictsByDivision(divisionId: string): DistrictInfo[] {
  if (!divisionId || divisionId === 'all') return BANGLADESH_DISTRICTS;
  return BANGLADESH_DISTRICTS.filter((d) => d.divisionId.toLowerCase() === divisionId.toLowerCase());
}

export function getDistrictById(id: string): DistrictInfo | undefined {
  return BANGLADESH_DISTRICTS.find((d) => d.id.toLowerCase() === id.toLowerCase());
}

export function searchDistricts(query: string): DistrictInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return BANGLADESH_DISTRICTS;
  return BANGLADESH_DISTRICTS.filter(
    (d) =>
      d.nameEn.toLowerCase().includes(q) ||
      d.nameBn.includes(q) ||
      d.divisionEn.toLowerCase().includes(q)
  );
}
