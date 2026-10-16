import React, { useState } from 'react';
import { Share2, FileText, Layers } from 'lucide-react';
import { Transaction } from '../../types/api';

interface AssetNetworkGraphProps {
  parcelId: string;
  transactions?: Transaction[];
  onSelectTransaction?: (txId: string) => void;
  className?: string;
}

export const AssetNetworkGraph: React.FC<AssetNetworkGraphProps> = ({
  parcelId,
  transactions = [],
  onSelectTransaction,
  className = '',
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // If no transactions provided, render demonstration deed network for LG-P-002911
  const displayTxs = transactions.length > 0 ? transactions : [
    {
      transaction_id: 'TX-002911-1',
      parcel_id: parcelId,
      transaction_date: '2024-03-12',
      seller_alias: 'AL-H-00192',
      buyer_alias: 'AL-B-00812',
      sale_area_acres: 1.85,
      claimed_share: 1.0,
      registered: 1,
      prior_transaction_exists: 0,
      legitimate_resale_evidence: 0,
      seller_owner_mismatch: 0,
      area_mismatch: 0,
      mutation_mismatch: 0,
      document_hash_mismatch: 0,
      overlapping_claim: 0,
      missing_evidence: 1,
      scenario: 'incomplete',
      data_origin: 'SYNTHETIC',
    },
    {
      transaction_id: 'TX-002911-2',
      parcel_id: parcelId,
      transaction_date: '2025-08-20',
      seller_alias: 'AL-H-00192',
      buyer_alias: 'AL-B-00945',
      sale_area_acres: 1.85,
      claimed_share: 1.0,
      registered: 1,
      prior_transaction_exists: 1,
      legitimate_resale_evidence: 0,
      seller_owner_mismatch: 0,
      area_mismatch: 0,
      mutation_mismatch: 0,
      document_hash_mismatch: 0,
      overlapping_claim: 1,
      missing_evidence: 0,
      scenario: 'conflicting_sale',
      data_origin: 'SYNTHETIC',
    },
    {
      transaction_id: 'TX-002911-3',
      parcel_id: parcelId,
      transaction_date: '2026-02-15',
      seller_alias: 'AL-B-00945',
      buyer_alias: 'AL-B-01021',
      sale_area_acres: 1.85,
      claimed_share: 1.0,
      registered: 1,
      prior_transaction_exists: 1,
      legitimate_resale_evidence: 1,
      seller_owner_mismatch: 0,
      area_mismatch: 0,
      mutation_mismatch: 0,
      document_hash_mismatch: 0,
      overlapping_claim: 0,
      missing_evidence: 0,
      scenario: 'legitimate_resale',
      data_origin: 'SYNTHETIC',
    },
  ];

  // SVG canvas dimensions
  const width = 560;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;

  // Node layout: Central parcel node, with transactions radiating outward
  const nodes = [
    {
      id: parcelId,
      type: 'parcel',
      label: parcelId,
      sub: 'Cadastral Plot',
      x: centerX,
      y: centerY,
      color: '#25B6A0',
    },
  ];

  // Calculate transaction nodes in an orbit
  const txNodes = displayTxs.map((tx, index) => {
    const angle = (index * (2 * Math.PI)) / displayTxs.length - Math.PI / 2;
    const radius = 95;
    const isConflict = tx.scenario === 'conflicting_sale';
    return {
      id: tx.transaction_id,
      type: 'tx',
      label: tx.transaction_id,
      sub: `${tx.transaction_date}`,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      color: isConflict ? '#B74445' : tx.scenario === 'normal' ? '#25B6A0' : '#E8A94D',
      scenario: tx.scenario,
      seller: tx.seller_alias,
      buyer: tx.buyer_alias,
    };
  });

  return (
    <div className={`rounded-xl border border-cadastral-teal/20 bg-cadastral-midnight/90 p-4 shadow-cadastral-lg font-sans relative ${className}`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cadastral-teal/15 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cadastral-teal/10 flex items-center justify-center text-cadastral-teal">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Asset Lineage &amp; Deed Network
            </h4>
            <p className="text-[10px] text-cadastral-paper/60">
              Interactive topological relationship graph across deed transfers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            Conflicting Sale
          </span>
          <span className="flex items-center gap-1 text-cadastral-teal">
            <span className="w-2 h-2 rounded-full bg-cadastral-teal inline-block" />
            Deed Node
          </span>
        </div>
      </div>

      {/* SVG Topological Graph Canvas */}
      <div className="relative flex justify-center items-center overflow-hidden py-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px] select-none"
        >
          {/* Subtle background radar circles */}
          <circle cx={centerX} cy={centerY} r="95" fill="none" stroke="rgba(37, 182, 160, 0.12)" strokeDasharray="3 3" />
          <circle cx={centerX} cy={centerY} r="140" fill="none" stroke="rgba(37, 182, 160, 0.06)" />

          {/* Connection Lines from Parcel to Transactions */}
          {txNodes.map((node) => {
            const isConflict = node.scenario === 'conflicting_sale';
            const isHovered = hoveredNode === node.id;
            return (
              <g key={`edge-${node.id}`}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={node.x}
                  y2={node.y}
                  stroke={isConflict ? '#B74445' : node.color}
                  strokeWidth={isHovered ? 3 : isConflict ? 2.5 : 1.5}
                  strokeDasharray={isConflict ? '4 3' : undefined}
                  opacity={isHovered ? 1 : 0.75}
                />
              </g>
            );
          })}

          {/* Central Parcel Node */}
          <g
            className="cursor-pointer transition-transform"
            onMouseEnter={() => setHoveredNode(nodes[0].id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle
              cx={nodes[0].x}
              cy={nodes[0].y}
              r="34"
              fill="#10282B"
              stroke="#25B6A0"
              strokeWidth="2.5"
              className="transition-all hover:stroke-white"
            />
            <circle
              cx={nodes[0].x}
              cy={nodes[0].y}
              r="28"
              fill="rgba(37, 182, 160, 0.18)"
            />
            <text
              x={nodes[0].x}
              y={nodes[0].y - 3}
              textAnchor="middle"
              className="fill-white font-mono text-[9px] font-bold"
            >
              {parcelId}
            </text>
            <text
              x={nodes[0].x}
              y={nodes[0].y + 10}
              textAnchor="middle"
              className="fill-cadastral-teal text-[8px] font-semibold"
            >
              PARCEL
            </text>
          </g>

          {/* Transaction Nodes */}
          {txNodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            return (
              <g
                key={node.id}
                className="cursor-pointer group"
                onClick={() => onSelectTransaction && onSelectTransaction(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 26 : 22}
                  fill="#0B2023"
                  stroke={node.color}
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 18 : 15}
                  fill={`${node.color}22`}
                />
                <text
                  x={node.x}
                  y={node.y - 2}
                  textAnchor="middle"
                  className="fill-white font-mono text-[8px] font-bold"
                >
                  {node.label.replace('TX-', 'TX-')}
                </text>
                <text
                  x={node.x}
                  y={node.y + 9}
                  textAnchor="middle"
                  className="fill-cadastral-paper/70 font-mono text-[7px]"
                >
                  {node.sub}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Information Overlay */}
        {hoveredNode && (
          <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-cadastral-deep/95 border border-cadastral-teal/30 p-2 text-xs flex items-center justify-between text-cadastral-paper animate-in fade-in">
            {hoveredNode.startsWith('TX-') ? (
              <>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-cadastral-teal" />
                  <span className="font-mono font-bold">{hoveredNode}</span>
                  <span className="text-[10px] text-cadastral-paper/70">
                    Click to review forensic assessment
                  </span>
                </div>
                <span className="text-[10px] text-cadastral-teal font-mono">
                  Inspect &rarr;
                </span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cadastral-teal" />
                <span>Central Cadastral Boundary Anchor: <strong className="font-mono">{parcelId}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
