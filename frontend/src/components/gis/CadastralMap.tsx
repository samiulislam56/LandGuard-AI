import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Compass,
  Info,
  ArrowRight,
  Crosshair,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  CadastralPlotGeo,
  SAMPLE_CADASTRAL_PLOTS,
  getScenarioColor,
  generateCadastralPolygon,
} from '../../lib/geo';
import {
  BANGLADESH_CENTER,
  BANGLADESH_DEFAULT_ZOOM,
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS,
  DistrictInfo,
  getDistrictsByDivision,
} from '../../lib/bangladeshAdmin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

// Fix default leaflet marker icon asset resolution in Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface CadastralMapProps {
  plots?: CadastralPlotGeo[];
  selectedParcelId?: string;
  onSelectParcel?: (plot: CadastralPlotGeo) => void;
  selectedDistrictId?: string;
  initialDistrict?: string;
  onSelectDistrict?: (district: DistrictInfo) => void;
  className?: string;
  height?: string;
  showControls?: boolean;
}

type LayerMode = 'midnight' | 'satellite' | 'survey';

export const CadastralMap: React.FC<CadastralMapProps> = ({
  plots = SAMPLE_CADASTRAL_PLOTS,
  selectedParcelId,
  onSelectParcel,
  selectedDistrictId,
  initialDistrict,
  onSelectDistrict,
  className = '',
  height = '560px',
  showControls = true,
}) => {
  const effectiveDistrictId = (selectedDistrictId || initialDistrict || 'dhaka').toLowerCase();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const districtMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<LayerMode>('midnight');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [internalDistrict, setInternalDistrict] = useState<string>(effectiveDistrictId);
  const currentDistrict = selectedDistrictId || internalDistrict;
  const [manualInspectedPlot, setManualInspectedPlot] = useState<CadastralPlotGeo | null>(null);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showDistrictPins, setShowDistrictPins] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [tileErrorCount, setTileErrorCount] = useState<number>(0);
  const lastFlownDistrictRef = useRef<string>(effectiveDistrictId);

  const activePlot =
    manualInspectedPlot ||
    (selectedParcelId ? plots.find((p) => p.parcelId === selectedParcelId) || null : null);

  // Update or switch tile layer safely with error boundary
  const updateTileLayer = useCallback((layer: LayerMode, map: L.Map) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap &copy; CARTO';
    let maxZoom = 18;

    if (layer === 'satellite') {
      // Safe Esri World Imagery (clamped to maxNativeZoom 18 to avoid 404s)
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri &mdash; High-Resolution Satellite';
      maxZoom = 18;
    } else if (layer === 'survey') {
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
      maxZoom = 18;
    }

    const newTileLayer = L.tileLayer(url, {
      attribution,
      maxZoom,
      maxNativeZoom: 18,
      subdomains: 'abcd',
      crossOrigin: true,
    });

    newTileLayer.on('tileerror', () => {
      setTileErrorCount((c) => c + 1);
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: BANGLADESH_CENTER,
      zoom: BANGLADESH_DEFAULT_ZOOM,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    updateTileLayer(activeLayer, map);

    const layerGroup = L.layerGroup().addTo(map);
    const districtGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    districtMarkerGroupRef.current = districtGroup;
    mapInstanceRef.current = map;

    // Attach ResizeObserver to automatically invalidate size when container flexes/resizes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Initial timeout to ensure map tiles render properly after DOM layout settles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeLayer, updateTileLayer]);

  // Fly to district when external prop changes (no setState in effect)
  useEffect(() => {
    if (!mapInstanceRef.current || !effectiveDistrictId) return;
    if (lastFlownDistrictRef.current === effectiveDistrictId) return;
    lastFlownDistrictRef.current = effectiveDistrictId;
    const distInfo = BANGLADESH_DISTRICTS.find((d) => d.id === effectiveDistrictId);
    if (distInfo) {
      mapInstanceRef.current.flyTo(distInfo.centroid, distInfo.zoom, { duration: 1 });
    }
  }, [effectiveDistrictId]);

  // Draw plots, cadastral boundaries, and district markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    const distGroup = districtMarkerGroupRef.current;
    if (!map || !group || !distGroup) return;

    group.clearLayers();
    distGroup.clearLayers();

    // 1. Draw Cadastral Plot Polygons
    const currentPlots = [...plots];
    if (selectedParcelId && !currentPlots.some((p) => p.parcelId === selectedParcelId)) {
      currentPlots.push(generateCadastralPolygon(selectedParcelId, 'Dhaka'));
    }

    currentPlots.forEach((plot) => {
      const isSelected = plot.parcelId === selectedParcelId || activePlot?.parcelId === plot.parcelId;
      const colors = getScenarioColor(plot.scenario);

      if (showBoundaries) {
        const polygon = L.polygon(plot.polygon as L.LatLngExpression[], {
          color: isSelected ? '#FFFFFF' : colors.stroke,
          weight: isSelected ? 3.5 : 2,
          opacity: isSelected ? 1 : 0.85,
          fillColor: isSelected ? '#25B6A0' : colors.stroke,
          fillOpacity: isSelected ? 0.65 : 0.35,
          dashArray: plot.scenario === 'conflicting_sale' ? '4, 4' : undefined,
        });

        polygon.on('click', () => {
          setManualInspectedPlot(plot);
          if (onSelectParcel) onSelectParcel(plot);
          map.flyTo(plot.center, 16, { duration: 0.8 });
        });

        polygon.bindTooltip(
          `<div class="font-mono text-xs font-semibold text-slate-100">Dag ${plot.dagNo} &bull; ${plot.areaAcres.toFixed(2)} ac</div>`,
          { permanent: false, direction: 'top', className: 'cadastral-map-tooltip' }
        );

        polygon.addTo(group);
      }

      // Draw Plot Pin / Dag Marker
      const isConflict = plot.scenario === 'conflicting_sale';
      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-bold text-white shadow-lg transition-transform hover:scale-125 ${
            isConflict
              ? 'bg-red-600 ring-4 ring-red-500/40 animate-pulse'
              : isSelected
              ? 'bg-cadastral-teal ring-4 ring-cadastral-teal/60'
              : 'bg-slate-900/90 border border-cadastral-teal/70 text-cadastral-teal'
          }">
            ${plot.dagNo % 1000}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'cadastral-pin-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(plot.center, { icon: customIcon });
      marker.on('click', () => {
        setManualInspectedPlot(plot);
        if (onSelectParcel) onSelectParcel(plot);
        map.flyTo(plot.center, 16, { duration: 0.8 });
      });
      marker.addTo(group);
    });

    // 2. Draw District Center Pins when zoomed out
    if (showDistrictPins) {
      const activeDistricts =
        selectedDivision === 'all'
          ? BANGLADESH_DISTRICTS
          : getDistrictsByDivision(selectedDivision);

      activeDistricts.forEach((dist) => {
        const isDistSelected = dist.id === currentDistrict;
        const hasData = dist.hasSyntheticCoverage;

        const pinHtml = `
          <div class="relative group cursor-pointer">
            <div class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap shadow-md transition-transform hover:scale-110 flex items-center gap-1 ${
              isDistSelected
                ? 'bg-cadastral-teal text-slate-950 ring-2 ring-white font-extrabold'
                : hasData
                ? 'bg-slate-900/90 text-cadastral-teal border border-cadastral-teal/60'
                : 'bg-slate-900/70 text-slate-400 border border-slate-700/50'
            }">
              <span class="w-1.5 h-1.5 rounded-full ${hasData ? 'bg-cadastral-teal' : 'bg-slate-500'}"></span>
              ${dist.nameEn}
              ${hasData ? `<span class="text-[9px] opacity-80">(${dist.activeParcels})</span>` : ''}
            </div>
          </div>
        `;

        const distIcon = L.divIcon({
          html: pinHtml,
          className: 'district-pin-icon',
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });

        const distMarker = L.marker(dist.centroid, { icon: distIcon });
        distMarker.on('click', () => {
          setInternalDistrict(dist.id);
          if (onSelectDistrict) onSelectDistrict(dist);
          map.flyTo(dist.centroid, dist.zoom, { duration: 1 });
        });
        distMarker.addTo(distGroup);
      });
    }

    if (selectedParcelId) {
      const match = currentPlots.find((p) => p.parcelId === selectedParcelId);
      if (match) {
        map.flyTo(match.center, 16, { duration: 0.8 });
      }
    }
  }, [
    plots,
    selectedParcelId,
    activePlot?.parcelId,
    showBoundaries,
    showDistrictPins,
    onSelectParcel,
    onSelectDistrict,
    currentDistrict,
    selectedDivision,
  ]);

  // Handle Division Selection
  const handleDivisionChange = (divId: string) => {
    setSelectedDivision(divId);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (divId === 'all') {
      map.flyTo(BANGLADESH_CENTER, BANGLADESH_DEFAULT_ZOOM, { duration: 1.2 });
    } else if (BANGLADESH_DIVISIONS[divId]) {
      const div = BANGLADESH_DIVISIONS[divId];
      map.flyTo(div.centroid, div.zoom, { duration: 1.2 });
      // Pick first district of this division
      const dists = getDistrictsByDivision(divId);
      if (dists.length > 0) {
        setInternalDistrict(dists[0].id);
        if (onSelectDistrict) onSelectDistrict(dists[0]);
      }
    }
  };

  // Handle District Selection
  const handleDistrictChange = (distId: string) => {
    setInternalDistrict(distId);
    const dist = BANGLADESH_DISTRICTS.find((d) => d.id === distId);
    if (dist) {
      setSelectedDivision(dist.divisionId);
      if (onSelectDistrict) onSelectDistrict(dist);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(dist.centroid, dist.zoom, { duration: 1.2 });
      }
    }
  };

  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (map) map.setZoom(map.getZoom() + delta);
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(BANGLADESH_CENTER, BANGLADESH_DEFAULT_ZOOM, { duration: 1 });
    setSelectedDivision('all');
  };

  const availableDistricts =
    selectedDivision === 'all'
      ? BANGLADESH_DISTRICTS
      : getDistrictsByDivision(selectedDivision);

  const activeDistrictInfo = BANGLADESH_DISTRICTS.find((d) => d.id === currentDistrict);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-cadastral-teal/30 bg-cadastral-midnight shadow-2xl font-sans transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : ''
      } ${className}`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
    >
      {/* Map Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#061215]" />

      {/* Top Floating Control Bar (High-Contrast Institutional Deck) */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Cascading Administrative Selectors */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cadastral-teal/30 shadow-xl pointer-events-auto">
            <span className="text-[11px] font-mono px-2 text-cadastral-teal font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-cadastral-teal" />
              BD ADMIN:
            </span>

            {/* Division Dropdown (All 8 Divisions) */}
            <select
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="bg-slate-900 border border-cadastral-teal/40 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-100 focus:outline-none focus:border-cadastral-teal cursor-pointer"
            >
              <option value="all">Whole Country (8 Divisions)</option>
              {Object.values(BANGLADESH_DIVISIONS).map((div) => (
                <option key={div.id} value={div.id}>
                  {div.nameEn} ({div.nameBn}) &bull; {div.totalDistricts} Dist
                </option>
              ))}
            </select>

            {/* Cascading District Dropdown (64 Districts) */}
            <select
              value={currentDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-slate-900 border border-cadastral-teal/40 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-100 focus:outline-none focus:border-cadastral-teal cursor-pointer max-w-[200px]"
            >
              {availableDistricts.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.nameEn} ({dist.nameBn}) {dist.hasSyntheticCoverage ? '⚡ [750]' : '[No Data]'}
                </option>
              ))}
            </select>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Layer Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cadastral-teal/30 shadow-xl">
              <button
                type="button"
                title="Midnight Cadastral (Deep Navy GIS)"
                onClick={() => {
                  setActiveLayer('midnight');
                  if (mapInstanceRef.current) updateTileLayer('midnight', mapInstanceRef.current);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  activeLayer === 'midnight'
                    ? 'bg-cadastral-teal text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Midnight
              </button>
              <button
                type="button"
                title="High-Res Satellite Imagery"
                onClick={() => {
                  setActiveLayer('satellite');
                  if (mapInstanceRef.current) updateTileLayer('satellite', mapInstanceRef.current);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  activeLayer === 'satellite'
                    ? 'bg-cadastral-teal text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                title="Cadastral Survey Map"
                onClick={() => {
                  setActiveLayer('survey');
                  if (mapInstanceRef.current) updateTileLayer('survey', mapInstanceRef.current);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  activeLayer === 'survey'
                    ? 'bg-cadastral-teal text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Survey
              </button>
            </div>

            {/* Layer Toggles & Fullscreen */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cadastral-teal/30 shadow-xl">
              <button
                type="button"
                onClick={() => setShowBoundaries(!showBoundaries)}
                title="Toggle Dag Boundaries"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  showBoundaries ? 'text-cadastral-teal bg-cadastral-teal/15' : 'text-slate-500'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowDistrictPins(!showDistrictPins)}
                title="Toggle District Center Pins"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  showDistrictPins ? 'text-amber-400 bg-amber-400/15' : 'text-slate-500'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
                className="p-1.5 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Zoom & Center Controls */}
      <div className="absolute right-3 bottom-8 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => handleZoom(1)}
          className="w-8 h-8 rounded-lg bg-slate-950/90 backdrop-blur-md border border-cadastral-teal/30 text-slate-100 flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-1)}
          className="w-8 h-8 rounded-lg bg-slate-950/90 backdrop-blur-md border border-cadastral-teal/30 text-slate-100 flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="w-8 h-8 rounded-lg bg-slate-950/90 backdrop-blur-md border border-cadastral-teal/30 text-slate-100 flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg"
          title="Recenter to Bangladesh"
        >
          <Crosshair className="w-4 h-4 text-cadastral-teal" />
        </button>
      </div>

      {/* Floating Property Summary Dossier (Slide-in card) */}
      {activePlot && (
        <div className="absolute left-3 bottom-8 z-20 w-84 max-w-[calc(100%-1.5rem)] rounded-xl bg-slate-950/95 backdrop-blur-md border border-cadastral-teal/40 p-4 shadow-2xl text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-cadastral-teal/20 mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cadastral-teal" />
                <span className="font-mono text-sm font-bold text-cadastral-teal">
                  {activePlot.parcelId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {activePlot.mouza}, {activePlot.upazila}, {activePlot.district}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setManualInspectedPlot(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 text-base"
            >
              &times;
            </button>
          </div>

          {/* Quick Metrics with Guaranteed Contrast */}
          <div className="grid grid-cols-3 gap-2 py-2 mb-3 bg-slate-900/80 rounded-lg p-2.5 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">DAG NO</span>
              <span className="font-mono font-bold text-slate-100 text-sm">{activePlot.dagNo}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">KHATIAN</span>
              <span className="font-mono font-bold text-slate-100 text-sm">{activePlot.khatianNo}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">AREA</span>
              <span className="font-mono font-bold text-cadastral-teal text-sm">
                {activePlot.areaAcres.toFixed(2)} ac
              </span>
            </div>
          </div>

          {/* Scenario Signal Badge */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-slate-300">Screening Signal:</span>
            <Badge
              variant={
                activePlot.scenario === 'conflicting_sale'
                  ? 'danger'
                  : activePlot.scenario === 'normal'
                  ? 'success'
                  : 'warning'
              }
            >
              {activePlot.scenario?.replace(/_/g, ' ') || 'Clear'}
            </Badge>
          </div>

          {/* Navigation Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/parcels/${activePlot.parcelId}`)}
              className="text-xs py-1.5 h-auto text-slate-100 border-cadastral-teal/40 hover:bg-cadastral-teal hover:text-slate-950 font-semibold"
            >
              Plot Dossier
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/assess/${activePlot.parcelId.replace('LG-P-', 'TX-')}-2`)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs py-1.5 h-auto"
            >
              Assess AI
            </Button>
          </div>
        </div>
      )}

      {/* Floating Active District Telemetry Badge */}
      {activeDistrictInfo && (
        <div className="absolute right-3 top-16 z-10 p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cadastral-teal/30 shadow-lg text-xs font-mono text-slate-200 max-w-xs pointer-events-none">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeDistrictInfo.hasSyntheticCoverage ? 'bg-cadastral-teal animate-pulse' : 'bg-slate-500'
                }`}
              />
              {activeDistrictInfo.nameEn} ({activeDistrictInfo.nameBn})
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                activeDistrictInfo.hasSyntheticCoverage
                  ? 'bg-cadastral-teal/20 text-cadastral-teal font-bold'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {activeDistrictInfo.hasSyntheticCoverage ? 'Active [750 plots]' : 'No Dataset'}
            </span>
          </div>
          {activeDistrictInfo.hasSyntheticCoverage && (
            <p className="text-[11px] text-slate-400 mt-1">
              Mouza: {activeDistrictInfo.activeMouza} &bull; Upazila: {activeDistrictInfo.activeUpazila}
            </p>
          )}
        </div>
      )}

      {/* Tile Error Fallback Notice */}
      {tileErrorCount > 0 && (
        <div className="absolute top-16 left-3 z-10 flex items-center gap-1.5 text-xs text-amber-300 bg-slate-950/90 border border-amber-500/30 px-3 py-1.5 rounded-lg shadow-md">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Notice: Network tiles rate-limited &bull; Offline cadastral vector fallback active</span>
        </div>
      )}

      {/* Conceptual Cadastral Projection Disclaimer */}
      <div className="absolute left-3 bottom-2 z-10 flex items-center gap-1.5 text-[10px] text-slate-300 bg-slate-950/80 backdrop-blur-sm px-2.5 py-0.5 rounded border border-cadastral-teal/20">
        <Info className="w-3 h-3 text-cadastral-teal shrink-0" />
        <span>Conceptual Cadastral Projection &bull; 8 Divisions &bull; 64 Districts Registry</span>
      </div>
    </div>
  );
};
