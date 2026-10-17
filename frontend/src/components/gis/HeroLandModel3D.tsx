import React, { useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Compass, Sparkles } from 'lucide-react';

interface PlotData {
  dag: string;
  nameBn: string;
  nameEn: string;
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  hoverColor: string;
  statusBn: string;
  statusEn: string;
  area: string;
}

const HERO_PLOTS: PlotData[] = [
  {
    dag: "১০১",
    nameBn: "পশ্চিম ধানক্ষেত",
    nameEn: "West Paddy",
    size: [2.2, 0.4, 2.0],
    position: [-1.4, 0.2, -1.2],
    color: "#0E8D60",
    hoverColor: "#12A873",
    statusBn: "স্বাভাবিক",
    statusEn: "Clean",
    area: "০.৮৫ একর"
  },
  {
    dag: "১০২",
    nameBn: "উত্তর মৌজা প্লট",
    nameEn: "North Plot",
    size: [2.0, 0.55, 2.4],
    position: [1.3, 0.28, -1.0],
    color: "#186E4B",
    hoverColor: "#229467",
    statusBn: "পর্যালোচনা প্রয়োজন",
    statusEn: "Review Required",
    area: "১.২০ একর"
  },
  {
    dag: "১০৩",
    nameBn: "দক্ষিণ কৃষি জমি",
    nameEn: "South Farmland",
    size: [2.5, 0.35, 1.8],
    position: [-1.2, 0.18, 1.3],
    color: "#2E7D4E",
    hoverColor: "#3B9E64",
    statusBn: "স্বাভাবিক",
    statusEn: "Clean",
    area: "০.৬৫ একর"
  },
  {
    dag: "১০৪",
    nameBn: "পূর্ব বাগান ও আবাদ",
    nameEn: "East Plantation",
    size: [2.3, 0.45, 2.1],
    position: [1.5, 0.23, 1.2],
    color: "#3F8A58",
    hoverColor: "#52B071",
    statusBn: "নামজারি যাচাইকৃত",
    statusEn: "Mutation Verified",
    area: "০.৯২ একর"
  }
];

interface PlotMeshProps {
  plot: PlotData;
  isHovered: boolean;
  onHover: (dag: string | null) => void;
  onClick: (plot: PlotData) => void;
}

const PlotMesh: React.FC<PlotMeshProps> = ({ plot, isHovered, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetY = isHovered ? plot.position[1] + 0.18 : plot.position[1];

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.damp(
        meshRef.current.position.y,
        targetY,
        8,
        delta
      );
    }
  });

  return (
    <group position={[plot.position[0], 0, plot.position[2]]}>
      {/* 3D Parcel Box */}
      <mesh
        ref={meshRef}
        position={[0, plot.position[1], 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(plot.dag);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onClick(plot);
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={plot.size} />
        <meshStandardMaterial
          color={isHovered ? plot.hoverColor : plot.color}
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* Boundary Line (Cadastral Wire) */}
      <lineSegments position={[0, targetY + plot.size[1] / 2 + 0.01, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(plot.size[0], 0.01, plot.size[2])]} />
        <lineBasicMaterial
          color={isHovered ? "#D7B677" : "#C4E8A5"}
          linewidth={2}
        />
      </lineSegments>

      {/* Plot Number Label (Floating above the plot) */}
      <Text
        position={[0, targetY + plot.size[1] / 2 + 0.35, 0]}
        fontSize={0.32}
        color={isHovered ? "#FFE699" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        {`দাগ ${plot.dag}`}
      </Text>
    </group>
  );
};

// Main Rotating Mini Land Scene
const LandScene: React.FC<{
  hoveredDag: string | null;
  onHover: (dag: string | null) => void;
  onSelect: (plot: PlotData) => void;
}> = ({ hoveredDag, onHover, onSelect }) => {
  const sceneGroupRef = useRef<THREE.Group>(null);

  // Subtle continuous camera rotation with mouse parallax dampening
  useFrame((state, delta) => {
    if (sceneGroupRef.current) {
      // Gentle automatic rotation
      sceneGroupRef.current.rotation.y += delta * 0.12;

      // Mouse parallax tilt
      const targetRotX = (state.mouse.y * 0.15);
      const targetRotZ = -(state.mouse.x * 0.15);
      sceneGroupRef.current.rotation.x = THREE.MathUtils.damp(sceneGroupRef.current.rotation.x, targetRotX, 4, delta);
      sceneGroupRef.current.rotation.z = THREE.MathUtils.damp(sceneGroupRef.current.rotation.z, targetRotZ, 4, delta);
    }
  });

  // Base Cadastral Ground Slab (Alluvial Soil)
  const groundGeo = useMemo(() => new THREE.CylinderGeometry(3.8, 4.2, 0.45, 32), []);

  return (
    <group ref={sceneGroupRef} rotation={[0.42, 0.3, 0]}>
      {/* Base Earth Pedestal */}
      <mesh geometry={groundGeo} position={[0, -0.25, 0]} receiveShadow>
        <meshStandardMaterial color="#041C16" roughness={0.8} />
      </mesh>

      {/* Boundary Ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.8, 3.88, 48]} />
        <meshBasicMaterial color="#0E8D60" transparent opacity={0.5} />
      </mesh>

      {/* Agricultural Plots */}
      {HERO_PLOTS.map((plot) => (
        <PlotMesh
          key={plot.dag}
          plot={plot}
          isHovered={hoveredDag === plot.dag}
          onHover={onHover}
          onClick={onSelect}
        />
      ))}

      {/* Pathway / Canal divider in center */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 5.2]} />
        <meshStandardMaterial color="#1A4A3D" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.3, 5.2]} />
        <meshStandardMaterial color="#1A4A3D" roughness={0.4} />
      </mesh>
    </group>
  );
};

// Fallback when WebGL is unsupported or loading
const WebGLFallback: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#062B22] to-[#041C16] rounded-3xl border border-emerald-500/20 text-emerald-200">
    <Compass className="w-12 h-12 text-emerald-400 mb-3 animate-spin" />
    <p className="text-xs font-semibold">৩ডি ক্যাডাস্ট্রাল মডেল লোড হচ্ছে...</p>
    <p className="text-[10px] text-emerald-400/70 mt-1">Interactive 3D Cadastral Land Visualization</p>
  </div>
);

// Error boundary state helper
class ErrorBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export const HeroLandModel3D: React.FC = () => {
  const [hoveredDag, setHoveredDag] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(HERO_PLOTS[0]);

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#062B22]/60 via-[#041C16]/80 to-[#031410] border border-emerald-500/30 shadow-2xl backdrop-blur-xl group">
      
      {/* 3D Canvas */}
      <ErrorBoundary fallback={<WebGLFallback />}>
        <Suspense fallback={<WebGLFallback />}>
          <Canvas
            shadows
            camera={{ position: [0, 5.2, 7.2], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            {/* Natural Sunlight & Ambient Lighting */}
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[6, 9, 4]}
              intensity={1.2}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-4, 3, -3]} intensity={0.4} color="#C4E8A5" />

            <LandScene
              hoveredDag={hoveredDag}
              onHover={setHoveredDag}
              onSelect={setSelectedPlot}
            />
          </Canvas>
        </Suspense>
      </ErrorBoundary>

      {/* Floating Interactive Plot Inspector Overlay (Bottom-left) */}
      {selectedPlot && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs p-3.5 rounded-2xl bg-[#062B22]/95 border border-emerald-500/40 backdrop-blur-md shadow-lg text-xs space-y-1.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              দাগ নং: {selectedPlot.dag}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              {selectedPlot.area}
            </span>
          </div>
          <p className="text-[11px] text-emerald-200/90 font-medium">
            {selectedPlot.nameBn} ({selectedPlot.nameEn})
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-emerald-900/40">
            <span>স্ট্যাটাস: <strong className="text-emerald-300">{selectedPlot.statusBn}</strong></span>
            <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">ক্লিক করে দেখুন →</span>
          </div>
        </div>
      )}

      {/* Disclaimer Badge (Mandatory Requirement) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30 text-[10px] text-emerald-300/90 font-medium">
        <Sparkles className="w-3 h-3 text-amber-300" />
        <span>ধারণামূলক ত্রিমাত্রিক মডেল — সরকারি জরিপ নয়</span>
      </div>

    </div>
  );
};
