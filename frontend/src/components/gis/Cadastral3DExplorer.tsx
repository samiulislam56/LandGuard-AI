import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  AlertOctagon,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface Parcel3DData {
  id: string;
  dagNo: number;
  khatianNo: number;
  areaAcres: number;
  scenario: 'normal' | 'conflicting_sale' | 'area_mismatch' | 'owner_mismatch' | 'mutation_mismatch';
  position: [number, number, number];
  size: [number, number, number];
  district: string;
  mouza: string;
  associatedTxId?: string;
  conflictingWith?: string;
}

export const SAMPLE_3D_PARCELS: Parcel3DData[] = [
  {
    id: 'LG-P-002911',
    dagNo: 4021,
    khatianNo: 1820,
    areaAcres: 1.85,
    scenario: 'conflicting_sale',
    position: [0, 0.4, 0],
    size: [2.6, 0.8, 2.4],
    district: 'Dhaka',
    mouza: 'Tejgaon I/A',
    associatedTxId: 'TX-002911-2',
    conflictingWith: 'TX-002911-1',
  },
  {
    id: 'LG-P-002912',
    dagNo: 4022,
    khatianNo: 1821,
    areaAcres: 0.95,
    scenario: 'normal',
    position: [3.2, 0.25, -0.4],
    size: [2.0, 0.5, 1.8],
    district: 'Dhaka',
    mouza: 'Tejgaon I/A',
    associatedTxId: 'TX-002912-1',
  },
  {
    id: 'LG-P-002910',
    dagNo: 4020,
    khatianNo: 1819,
    areaAcres: 2.10,
    scenario: 'area_mismatch',
    position: [-3.4, 0.3, 0.5],
    size: [2.4, 0.6, 2.2],
    district: 'Dhaka',
    mouza: 'Tejgaon I/A',
    associatedTxId: 'TX-002910-1',
  },
  {
    id: 'LG-P-002913',
    dagNo: 4023,
    khatianNo: 1822,
    areaAcres: 1.40,
    scenario: 'normal',
    position: [0.3, 0.2, 3.2],
    size: [2.2, 0.4, 2.0],
    district: 'Dhaka',
    mouza: 'Tejgaon I/A',
    associatedTxId: 'TX-002913-1',
  },
  {
    id: 'LG-P-002914',
    dagNo: 4024,
    khatianNo: 1823,
    areaAcres: 1.15,
    scenario: 'mutation_mismatch',
    position: [-2.8, 0.35, -2.6],
    size: [2.0, 0.7, 1.9],
    district: 'Dhaka',
    mouza: 'Tejgaon I/A',
    associatedTxId: 'TX-002914-1',
  },
  {
    id: 'LG-P-002915',
    dagNo: 4025,
    khatianNo: 1824,
    areaAcres: 0.80,
    scenario: 'normal',
    position: [2.9, 0.2, 2.8],
    size: [1.8, 0.4, 1.6],
    district: 'Dhaka',
    mouza: 'Tejgaon I/A',
    associatedTxId: 'TX-002915-1',
  },
];

// Helper to get status color in 3D
function getParcelColor(scenario: Parcel3DData['scenario'], isHovered: boolean, isSelected: boolean): string {
  if (isSelected) return '#FFFFFF';
  if (isHovered) return '#C4E8A5'; // Greenfield Leaf

  switch (scenario) {
    case 'conflicting_sale':
      return '#EF4444'; // Critical Conflict
    case 'area_mismatch':
    case 'owner_mismatch':
    case 'mutation_mismatch':
      return '#D7B677'; // Greenfield Warm Gold
    case 'normal':
    default:
      return '#0E8D60'; // Greenfield Emerald
  }
}

// Single Parcel 3D Mesh Component
interface ParcelMeshProps {
  parcel: Parcel3DData;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (p: Parcel3DData) => void;
  onHover: (id: string | null) => void;
  isDark: boolean;
}

const ParcelMesh: React.FC<ParcelMeshProps> = ({
  parcel,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  isDark,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = useMemo(
    () => getParcelColor(parcel.scenario, isHovered, isSelected),
    [parcel.scenario, isHovered, isSelected]
  );

  // Subtle floating oscillation for highlighted/conflict parcel
  useFrame(({ clock }) => {
    if (meshRef.current && parcel.scenario === 'conflicting_sale') {
      meshRef.current.position.y =
        parcel.position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.04;
    }
  });

  return (
    <group position={parcel.position}>
      {/* 3D Elevated Plot Block */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(parcel);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(parcel.id);
        }}
        onPointerOut={() => onHover(null)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={parcel.size} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.15}
          transparent
          opacity={isSelected ? 0.95 : isHovered ? 0.9 : 0.8}
          emissive={isSelected ? '#C4E8A5' : parcel.scenario === 'conflicting_sale' ? '#EF4444' : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : parcel.scenario === 'conflicting_sale' ? 0.25 : 0}
        />
      </mesh>

      {/* Wireframe Outline / Boundary */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...parcel.size)]} />
        <lineBasicMaterial
          color={isSelected ? '#D7B677' : isDark ? '#C4E8A5' : '#0E8D60'}
          linewidth={isSelected ? 2 : 1}
        />
      </lineSegments>

      {/* 3D Label: Dag No */}
      <Text
        position={[0, parcel.size[1] / 2 + 0.15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.28}
        color={isDark ? '#F5F8F2' : '#062B22'}
        anchorX="center"
        anchorY="middle"
      >
        {`দাগ ${parcel.dagNo}`}
      </Text>
    </group>
  );
};

// 3D Arc Connection Line between Conflicting Deeds
const ConflictArc: React.FC<{ start: [number, number, number]; end: [number, number, number] }> = ({
  start,
  end,
}) => {
  const curve = useMemo(() => {
    const midX = (start[0] + end[0]) / 2;
    const midY = Math.max(start[1], end[1]) + 1.8;
    const midZ = (start[2] + end[2]) / 2;
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(midX, midY, midZ),
      new THREE.Vector3(...end)
    );
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(30), [curve]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <primitive object={new THREE.Line(lineGeometry, new THREE.LineDashedMaterial({ color: '#E46B70', dashSize: 0.2, gapSize: 0.1, linewidth: 2 }))} />
  );
};

// Main 3D Cadastral Explorer Component
export interface Cadastral3DExplorerProps {
  className?: string;
  height?: string;
  initialParcelId?: string;
  selectedParcelId?: string;
  onSelectParcel?: (parcelId: string) => void;
}

export const Cadastral3DExplorer: React.FC<Cadastral3DExplorerProps> = ({
  className = '',
  height = '560px',
  initialParcelId = 'LG-P-002911',
  selectedParcelId,
  onSelectParcel,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasWebGlError, setHasWebGlError] = useState(false);

  const activeId = selectedParcelId || userSelectedId || initialParcelId;

  const selectedParcel = useMemo(() => {
    return SAMPLE_3D_PARCELS.find((p) => p.id === activeId) || SAMPLE_3D_PARCELS[0];
  }, [activeId]);

  // OrbitControls camera ref to trigger reset
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (hasWebGlError) {
    return (
      <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-6 text-center space-y-3">
        <AlertOctagon className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="font-bold text-sm text-atlas-textPrimary">{t('explorer3d.webglError')}</h3>
        <p className="text-xs text-atlas-textMuted max-w-md mx-auto">
          {t('explorer3d.conceptualNotice')}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border border-emerald-800/40 bg-[#062B22] relative overflow-hidden flex flex-col shadow-2xl select-none ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      } ${className}`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
    >
      {/* Top Floating Control Strip */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Title & Conceptual Notice Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#062B22]/90 backdrop-blur-md border border-emerald-500/30 text-white flex items-center gap-2 shadow-xl">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span className="font-extrabold text-xs tracking-tight text-emerald-100">
              {t('explorer3d.title')}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#C4E8A5] border border-emerald-500/30 text-[10px] font-mono font-bold">
              {t('explorer3d.conceptualBadge')}
            </span>
          </div>
        </div>

        {/* Right Action Tools: Reset Camera, Fullscreen */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleResetCamera}
            className="px-3 py-1.5 rounded-2xl bg-[#062B22]/90 backdrop-blur-md border border-emerald-500/30 text-emerald-100 text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-emerald-800/60 transition-colors shadow-lg"
            title={t('explorer3d.resetCamera')}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C4E8A5]" />
            <span className="hidden sm:inline">{t('explorer3d.resetCamera')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-2xl bg-[#062B22]/90 backdrop-blur-md border border-emerald-500/30 text-emerald-100 hover:bg-emerald-800/60 transition-colors shadow-lg"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#C4E8A5]" /> : <Maximize2 className="w-4 h-4 text-[#C4E8A5]" />}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="flex-1 w-full h-full relative bg-gradient-to-b from-[#062B22] to-[#031813]">
        <Canvas
          shadows
          camera={{ position: [6, 7, 8], fov: 42 }}
          onCreated={({ gl }) => {
            gl.setClearColor(isDark ? '#062B22' : '#F5F8F2');
          }}
          onError={() => setHasWebGlError(true)}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={isDark ? 0.7 : 0.9} />
            <directionalLight
              position={[10, 15, 10]}
              intensity={isDark ? 1.4 : 1.6}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />

            {/* Base Grid Plane (Ground Foundation) */}
            <gridHelper
              args={[16, 16, isDark ? '#0E8D60' : '#0E8D60', isDark ? '#0F3E32' : '#D9E6DF']}
              position={[0, -0.01, 0]}
            />

            {/* 3D Procedural Parcel Blocks */}
            {SAMPLE_3D_PARCELS.map((p) => (
              <ParcelMesh
                key={p.id}
                parcel={p}
                isSelected={selectedParcel?.id === p.id}
                isHovered={hoveredId === p.id}
                onSelect={(selected) => {
                  setUserSelectedId(selected.id);
                  onSelectParcel?.(selected.id);
                }}
                onHover={setHoveredId}
                isDark={isDark}
              />
            ))}

            {/* Conflict Deed Connection Arc (TX-002911-2 to Adjacent Block) */}
            <ConflictArc
              start={[0, 0.8, 0]}
              end={[-3.4, 0.6, 0.5]}
            />

            {/* Orbit Camera Controls */}
            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.08}
              minDistance={4}
              maxDistance={22}
              maxPolarAngle={Math.PI / 2.1} // Prevent going under the ground grid
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom Floating Legend & Interaction Hint */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none flex flex-col gap-1.5 max-w-sm">
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#062B22]/95 backdrop-blur-md border border-emerald-500/30 text-white shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 pb-1.5 border-b border-emerald-800/40 text-[11px] font-mono font-bold text-[#C4E8A5]">
            <Layers className="w-3.5 h-3.5" />
            <span>{t('explorer3d.legendTitle')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0E8D60] ring-1 ring-emerald-300/40" />
              <span className="text-emerald-100">{t('explorer3d.legendClean')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-1 ring-red-400/40" />
              <span className="text-emerald-100">{t('explorer3d.legendConflict')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D7B677] ring-1 ring-amber-300/40" />
              <span className="text-emerald-100">{t('explorer3d.legendMismatch')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF] ring-2 ring-[#C4E8A5]" />
              <span className="text-emerald-100">{t('explorer3d.legendSelected')}</span>
            </div>
          </div>
          <p className="text-[9px] text-emerald-300/70 mt-2 font-mono leading-tight">
            {t('explorer3d.orbitHint')}
          </p>
        </div>
      </div>

      {/* Floating Selected Parcel Dossier (Bottom Right) */}
      {selectedParcel && (
        <div className="absolute bottom-3 right-3 z-10 w-80 max-w-[calc(100%-1.5rem)] rounded-2xl bg-[#062B22]/95 backdrop-blur-md border border-emerald-500/40 p-4 shadow-2xl text-slate-100 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between pb-2 border-b border-emerald-800/40">
            <div>
              <span className="font-mono text-xs font-bold text-[#C4E8A5] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {selectedParcel.id}
              </span>
              <p className="text-[11px] text-emerald-200/80">
                {selectedParcel.mouza}, {selectedParcel.district}
              </p>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                selectedParcel.scenario === 'conflicting_sale'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-emerald-500/20 text-[#C4E8A5] border border-emerald-500/40'
              }`}
            >
              {selectedParcel.scenario}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 my-3 text-center text-[10px] font-mono bg-[#031813]/80 rounded-xl p-2.5 border border-emerald-900/50">
            <div>
              <span className="text-emerald-400/70 block">DAG</span>
              <span className="font-bold text-white text-xs">{selectedParcel.dagNo}</span>
            </div>
            <div>
              <span className="text-emerald-400/70 block">KHATIAN</span>
              <span className="font-bold text-white text-xs">{selectedParcel.khatianNo}</span>
            </div>
            <div>
              <span className="text-emerald-400/70 block">AREA</span>
              <span className="font-bold text-[#D7B677] text-xs">{selectedParcel.areaAcres.toFixed(2)} ac</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-emerald-900/60">
            <button
              type="button"
              onClick={() => navigate(`/parcels/${selectedParcel.id}`)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-[#C4E8A5] hover:text-white text-xs font-bold font-mono transition-all text-center border border-emerald-500/40"
            >
              {t('explorer3d.launchDossier')}
            </button>
            {selectedParcel.associatedTxId && (
              <button
                type="button"
                onClick={() => navigate(`/assess/${selectedParcel.associatedTxId}`)}
                className="py-1.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-bold font-mono transition-all text-center border border-red-500/40"
                title="Audit Assessment"
              >
                Audit &rarr;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
