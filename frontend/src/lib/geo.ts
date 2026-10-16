// ============================================================================
// LandGuard AI — Cadastral Geographic Coordinate & Plot Boundary Utilities
// Synthetic Demonstration Data Coordinates for Bangladesh Cadastral Divisions
// ============================================================================

export interface MouzaCenter {
  district: string;
  upazila: string;
  mouza: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const MOUZA_CENTERS: Record<string, MouzaCenter> = {
  Dhaka: {
    district: 'Dhaka',
    upazila: 'Savar',
    mouza: 'Ashulia',
    lat: 23.9036,
    lng: 90.3242,
    zoom: 15,
  },
  Chattogram: {
    district: 'Chattogram',
    upazila: 'Patiya',
    mouza: 'Haidgaon',
    lat: 22.2965,
    lng: 91.9841,
    zoom: 15,
  },
  Rajshahi: {
    district: 'Rajshahi',
    upazila: 'Paba',
    mouza: 'Haripur',
    lat: 24.4172,
    lng: 88.5529,
    zoom: 15,
  },
  Khulna: {
    district: 'Khulna',
    upazila: 'Dumuria',
    mouza: 'Raghunathpur',
    lat: 22.8124,
    lng: 89.4318,
    zoom: 15,
  },
};

export const BANGLADESH_CENTER: [number, number] = [23.6850, 90.3563];

export interface CadastralPlotGeo {
  parcelId: string;
  district: string;
  upazila: string;
  mouza: string;
  dagNo: number;
  khatianNo: number;
  areaAcres: number;
  center: [number, number];
  polygon: [number, number][];
  scenario?: string;
}

/**
 * Deterministically projects a synthetic cadastral plot polygon (Dag boundary)
 * based on the parcel ID, Dag number, and recorded acreage.
 * This guarantees reproducible spatial geometry across re-renders.
 */
export function generateCadastralPolygon(
  parcelId: string,
  district: string = 'Dhaka',
  dagNo: number = 101,
  khatianNo: number = 1001,
  areaAcres: number = 0.5,
  scenario: string = 'normal'
): CadastralPlotGeo {
  const mouza = MOUZA_CENTERS[district] || MOUZA_CENTERS.Dhaka;

  // Pseudo-random offset based on parcel ID and Dag number
  let hash = 0;
  const seed = `${parcelId}-${dagNo}-${khatianNo}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalizedHashX = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.024;
  const normalizedHashY = ((Math.abs(hash >> 3) % 1000) / 1000 - 0.5) * 0.024;

  const centerLat = mouza.lat + normalizedHashX;
  const centerLng = mouza.lng + normalizedHashY;

  // Scale polygon radius roughly with square root of acreage
  const baseScale = Math.max(0.00035, Math.min(0.0016, Math.sqrt(areaAcres) * 0.00085));

  // Generate a realistic 5-sided irregular cadastral boundary
  const angles = [0.2, 1.4, 2.7, 4.1, 5.3];
  const polygon: [number, number][] = angles.map((angle, idx) => {
    const jitter = 0.85 + (((Math.abs(hash + idx * 37) % 100) / 100) * 0.3);
    const lat = centerLat + Math.cos(angle) * baseScale * jitter;
    const lng = centerLng + (Math.sin(angle) * baseScale * jitter * 1.15); // Adjust for longitude aspect ratio
    return [lat, lng];
  });

  return {
    parcelId,
    district,
    upazila: mouza.upazila,
    mouza: mouza.mouza,
    dagNo,
    khatianNo,
    areaAcres,
    center: [centerLat, centerLng],
    polygon,
    scenario,
  };
}

/**
 * Curated demonstration cluster of cadastral plots surrounding reference parcel LG-P-002911
 * and surrounding plots for interactive map exploration.
 */
export const SAMPLE_CADASTRAL_PLOTS: CadastralPlotGeo[] = [
  // Primary dispute parcel from SRS (LG-P-002911 in Dhaka, Savar, Ashulia)
  {
    ...generateCadastralPolygon('LG-P-002911', 'Dhaka', 2911, 4820, 1.85, 'conflicting_sale'),
    center: [23.9042, 90.3235],
    polygon: [
      [23.9048, 90.3228],
      [23.9051, 90.3242],
      [23.9038, 90.3246],
      [23.9034, 90.3233],
      [23.9041, 90.3225],
    ],
  },
  // Adjacent Dag plots in the same mouza
  {
    ...generateCadastralPolygon('LG-P-002910', 'Dhaka', 2910, 4819, 1.20, 'normal'),
    center: [23.9056, 90.3238],
    polygon: [
      [23.9061, 90.3231],
      [23.9064, 90.3245],
      [23.9052, 90.3248],
      [23.9049, 90.3234],
    ],
  },
  {
    ...generateCadastralPolygon('LG-P-002912', 'Dhaka', 2912, 4821, 0.95, 'owner_mismatch'),
    center: [23.9031, 90.3248],
    polygon: [
      [23.9036, 90.3244],
      [23.9039, 90.3258],
      [23.9026, 90.3261],
      [23.9023, 90.3247],
    ],
  },
  {
    ...generateCadastralPolygon('LG-P-002913', 'Dhaka', 2913, 4822, 2.40, 'area_mismatch'),
    center: [23.9045, 90.3255],
    polygon: [
      [23.9050, 90.3249],
      [23.9054, 90.3265],
      [23.9040, 90.3268],
      [23.9036, 90.3252],
    ],
  },
  {
    ...generateCadastralPolygon('LG-P-002914', 'Dhaka', 2914, 4823, 0.75, 'normal'),
    center: [23.9025, 90.3230],
    polygon: [
      [23.9030, 90.3224],
      [23.9033, 90.3238],
      [23.9021, 90.3241],
      [23.9018, 90.3227],
    ],
  },
  // Chattogram sample plot
  {
    ...generateCadastralPolygon('LG-P-000002', 'Chattogram', 102, 1002, 2.87, 'normal'),
    center: [22.2968, 91.9845],
    polygon: [
      [22.2975, 91.9838],
      [22.2978, 91.9855],
      [22.2961, 91.9858],
      [22.2958, 91.9841],
    ],
  },
  // Rajshahi sample plot
  {
    ...generateCadastralPolygon('LG-P-000001', 'Rajshahi', 101, 1001, 0.45, 'document_tamper'),
    center: [24.4175, 88.5532],
    polygon: [
      [24.4180, 88.5526],
      [24.4183, 88.5539],
      [24.4170, 88.5542],
      [24.4167, 88.5529],
    ],
  },
  // Khulna sample plot
  {
    ...generateCadastralPolygon('LG-P-000003', 'Khulna', 103, 1003, 1.15, 'incomplete'),
    center: [22.8128, 89.4322],
    polygon: [
      [22.8134, 89.4315],
      [22.8137, 89.4330],
      [22.8122, 89.4333],
      [22.8119, 89.4318],
    ],
  },
];

/**
 * Returns color tokens according to cadastral scenario
 */
export function getScenarioColor(scenario?: string): { stroke: string; fill: string; badge: string } {
  switch (scenario) {
    case 'conflicting_sale':
      return { stroke: '#B74445', fill: 'rgba(183, 68, 69, 0.45)', badge: 'Alert Red' };
    case 'area_mismatch':
    case 'owner_mismatch':
    case 'mutation_mismatch':
    case 'document_tamper':
      return { stroke: '#E8A94D', fill: 'rgba(232, 169, 77, 0.40)', badge: 'Review Amber' };
    case 'legitimate_resale':
    case 'normal':
    default:
      return { stroke: '#25B6A0', fill: 'rgba(37, 182, 160, 0.35)', badge: 'Signal Teal' };
  }
}
