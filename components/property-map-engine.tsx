"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  CircleHelp,
  LockKeyhole,
  MapPinned,
  Minus,
  Navigation2,
  Plus,
  Route,
  Sparkles,
  ZoomIn,
} from "lucide-react";
import {
  propertyMapFloors,
  propertyMapFloorOptions,
  type PropertyMapFloor,
  type PropertyMapFloorId,
  type PropertyMapPoi,
} from "@/lib/property-map";

interface PropertyMapEngineProps {
  floors?: readonly PropertyMapFloor[];
  initialFloorId?: PropertyMapFloorId;
  guestName?: string;
  propertyName?: string;
  onNavigateToPoi?: (poi: PropertyMapPoi) => void;
  onPoiSelect?: (poi: PropertyMapPoi) => void;
  onUnlockPoi?: (poi: PropertyMapPoi) => void;
  /**
   * "full" (default) renders the standalone page treatment with its own
   * heading and SVG-engine badge. "embedded" renders a lighter-weight
   * treatment meant to sit inside an existing SectionCard (e.g. the
   * current-visit dashboard), dropping the duplicate heading chrome.
   */
  variant?: "full" | "embedded";
}

interface ViewportTransform {
  scale: number;
  tx: number;
  ty: number;
}

interface CanvasPoint {
  x: number;
  y: number;
}

interface PointerSnapshot extends CanvasPoint {
  pointerId: number;
}

interface GestureState {
  kind: "pan" | "pinch";
  startScale: number;
  startTx: number;
  startTy: number;
  startPoint?: CanvasPoint;
  startDistance?: number;
  anchor?: CanvasPoint;
  midpoint?: CanvasPoint;
}

const MIN_SCALE = 0.75;
const MAX_SCALE = 2.5;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function distance(a: CanvasPoint, b: CanvasPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: CanvasPoint, b: CanvasPoint): CanvasPoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function getDefaultTransform(): ViewportTransform {
  return { scale: 1, tx: 0, ty: 0 };
}

function getPoiTone(status: PropertyMapPoi["status"]) {
  switch (status) {
    case "available":
      return "text-[color:var(--gos-success)] bg-[rgba(62,107,78,0.1)]";
    case "restricted":
      return "text-[color:var(--gos-warning)] bg-[rgba(184,138,46,0.14)]";
    case "locked":
      return "text-[color:var(--gos-error)] bg-[rgba(166,70,70,0.12)]";
    default:
      return "text-[color:var(--gos-primary)] bg-[rgba(31,46,39,0.08)]";
  }
}

function getPoiCategoryLabel(category: PropertyMapPoi["category"]) {
  switch (category) {
    case "gate":
      return "Gate";
    case "elevator":
      return "Elevator";
    case "door":
      return "Door";
    case "amenity":
      return "Amenity";
    case "service":
      return "Service";
    case "destination":
      return "Destination";
    default:
      return "Utility";
  }
}

function renderShape(
  shape:
    | { type: "rect"; x: number; y: number; width: number; height: number; rx?: number; fill?: string; opacity?: number; stroke?: string; strokeDasharray?: string; strokeWidth?: number }
    | { type: "circle"; cx: number; cy: number; r: number; fill?: string; opacity?: number; stroke?: string; strokeDasharray?: string; strokeWidth?: number }
    | { type: "line"; x1: number; y1: number; x2: number; y2: number; fill?: string; opacity?: number; stroke?: string; strokeDasharray?: string; strokeWidth?: number }
    | { type: "path"; d: string; fill?: string; opacity?: number; stroke?: string; strokeDasharray?: string; strokeWidth?: number }
    | { type: "polygon"; points: string; fill?: string; opacity?: number; stroke?: string; strokeDasharray?: string; strokeWidth?: number }
    | { type: "text"; x: number; y: number; value: string; fill?: string; opacity?: number; fontSize?: number; fontWeight?: number; textAnchor?: "start" | "middle" | "end" },
) {
  switch (shape.type) {
    case "rect":
      return (
        <rect
          key={`${shape.type}-${shape.x}-${shape.y}-${shape.width}-${shape.height}`}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.rx ?? 0}
          fill={shape.fill ?? "none"}
          opacity={shape.opacity}
          stroke={shape.stroke}
          strokeDasharray={shape.strokeDasharray}
          strokeWidth={shape.strokeWidth}
        />
      );
    case "circle":
      return (
        <circle
          key={`${shape.type}-${shape.cx}-${shape.cy}-${shape.r}`}
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={shape.fill ?? "none"}
          opacity={shape.opacity}
          stroke={shape.stroke}
          strokeDasharray={shape.strokeDasharray}
          strokeWidth={shape.strokeWidth}
        />
      );
    case "line":
      return (
        <line
          key={`${shape.type}-${shape.x1}-${shape.y1}-${shape.x2}-${shape.y2}`}
          x1={shape.x1}
          y1={shape.y1}
          x2={shape.x2}
          y2={shape.y2}
          fill={shape.fill ?? "none"}
          opacity={shape.opacity}
          stroke={shape.stroke}
          strokeDasharray={shape.strokeDasharray}
          strokeWidth={shape.strokeWidth}
        />
      );
    case "path":
      return (
        <path
          key={`${shape.type}-${shape.d}`}
          d={shape.d}
          fill={shape.fill ?? "none"}
          opacity={shape.opacity}
          stroke={shape.stroke}
          strokeDasharray={shape.strokeDasharray}
          strokeWidth={shape.strokeWidth}
        />
      );
    case "polygon":
      return (
        <polygon
          key={`${shape.type}-${shape.points}`}
          points={shape.points}
          fill={shape.fill ?? "none"}
          opacity={shape.opacity}
          stroke={shape.stroke}
          strokeDasharray={shape.strokeDasharray}
          strokeWidth={shape.strokeWidth}
        />
      );
    case "text":
      return (
        <text
          key={`${shape.type}-${shape.x}-${shape.y}-${shape.value}`}
          x={shape.x}
          y={shape.y}
          fill={shape.fill ?? "currentColor"}
          opacity={shape.opacity}
          fontSize={shape.fontSize ?? 18}
          fontWeight={shape.fontWeight ?? 500}
          textAnchor={shape.textAnchor ?? "start"}
        >
          {shape.value}
        </text>
      );
    default:
      return null;
  }
}

export function PropertyMapEngine({
  floors = [],
  initialFloorId,
  guestName,
  propertyName,
  onNavigateToPoi,
  onPoiSelect,
  onUnlockPoi,
  variant = "full",
}: PropertyMapEngineProps) {
  const isEmbedded = variant === "embedded";
  const availableFloors = floors.length > 0 ? floors : propertyMapFloors;
  const defaultFloorId =
    initialFloorId && availableFloors.some((floor) => floor.id === initialFloorId)
      ? initialFloorId
      : availableFloors[0]?.id ?? propertyMapFloorOptions[0].id;

  const [selectedFloorId, setSelectedFloorId] = useState<PropertyMapFloorId>(defaultFloorId);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportTransform>(getDefaultTransform);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pointersRef = useRef<Map<number, PointerSnapshot>>(new Map());
  const gestureRef = useRef<GestureState | null>(null);

  const selectedFloor = useMemo(
    () => availableFloors.find((floor) => floor.id === selectedFloorId) ?? availableFloors[0] ?? null,
    [availableFloors, selectedFloorId],
  );

  const selectedPoi = useMemo(() => {
    if (!selectedFloor || !selectedPoiId) {
      return null;
    }

    return selectedFloor.poi.find((poi) => poi.id === selectedPoiId) ?? null;
  }, [selectedFloor, selectedPoiId]);

  useEffect(() => {
    setSelectedPoiId(null);
    setViewport(getDefaultTransform());
    gestureRef.current = null;
    pointersRef.current = new Map();
    setStatusMessage(null);
  }, [selectedFloorId]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setStatusMessage(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  function pointFromEvent(event: ReactPointerEvent<SVGSVGElement>): CanvasPoint {
    const svg = svgRef.current;
    if (!svg) {
      return { x: 0, y: 0 };
    }

    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * (selectedFloor?.canvas.width ?? 960);
    const y = ((event.clientY - rect.top) / rect.height) * (selectedFloor?.canvas.height ?? 720);
    return { x, y };
  }

  function updatePointer(event: ReactPointerEvent<SVGSVGElement>) {
    pointersRef.current.set(event.pointerId, {
      pointerId: event.pointerId,
      ...pointFromEvent(event),
    });
  }

  function releasePointer(event: ReactPointerEvent<SVGSVGElement>) {
    pointersRef.current.delete(event.pointerId);
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    updatePointer(event);

    const pointerCount = pointersRef.current.size;
    if (pointerCount === 1) {
      const startPoint = pointersRef.current.get(event.pointerId);
      if (!startPoint) {
        return;
      }

      gestureRef.current = {
        kind: "pan",
        startScale: viewport.scale,
        startTx: viewport.tx,
        startTy: viewport.ty,
        startPoint,
      };
      return;
    }

    if (pointerCount >= 2) {
      const [first, second] = Array.from(pointersRef.current.values()).slice(0, 2);
      const startDistance = distance(first, second);
      const startMidpoint = midpoint(first, second);
      const anchor = {
        x: (startMidpoint.x - viewport.tx) / viewport.scale,
        y: (startMidpoint.y - viewport.ty) / viewport.scale,
      };

      gestureRef.current = {
        kind: "pinch",
        startScale: viewport.scale,
        startTx: viewport.tx,
        startTy: viewport.ty,
        startDistance,
        midpoint: startMidpoint,
        anchor,
      };
    }
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }

    updatePointer(event);
    const gesture = gestureRef.current;
    if (!gesture) {
      return;
    }

    if (gesture.kind === "pan" && gesture.startPoint) {
      const currentPoint = pointFromEvent(event);
      const dx = currentPoint.x - gesture.startPoint.x;
      const dy = currentPoint.y - gesture.startPoint.y;

      setViewport({
        scale: gesture.startScale,
        tx: gesture.startTx + dx / gesture.startScale,
        ty: gesture.startTy + dy / gesture.startScale,
      });
      return;
    }

    if (gesture.kind === "pinch" && gesture.midpoint && gesture.anchor && gesture.startDistance) {
      const [first, second] = Array.from(pointersRef.current.values()).slice(0, 2);
      if (!first || !second) {
        return;
      }

      const currentDistance = distance(first, second);
      const nextScale = clamp(
        gesture.startScale * (currentDistance / gesture.startDistance),
        MIN_SCALE,
        MAX_SCALE,
      );

      setViewport({
        scale: nextScale,
        tx: gesture.midpoint.x - gesture.anchor.x * nextScale,
        ty: gesture.midpoint.y - gesture.anchor.y * nextScale,
      });
    }
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    releasePointer(event);
    const remaining = Array.from(pointersRef.current.values());

    if (remaining.length === 1) {
      const [nextPointer] = remaining;
      gestureRef.current = {
        kind: "pan",
        startScale: viewport.scale,
        startTx: viewport.tx,
        startTy: viewport.ty,
        startPoint: {
          x: nextPointer.x,
          y: nextPointer.y,
        },
      };
      return;
    }

    if (remaining.length >= 2) {
      const [first, second] = remaining;
      gestureRef.current = {
        kind: "pinch",
        startScale: viewport.scale,
        startTx: viewport.tx,
        startTy: viewport.ty,
        startDistance: distance(first, second),
        midpoint: midpoint(first, second),
        anchor: {
          x: (midpoint(first, second).x - viewport.tx) / viewport.scale,
          y: (midpoint(first, second).y - viewport.ty) / viewport.scale,
        },
      };
      return;
    }

    gestureRef.current = null;
  }

  function zoomBy(nextScale: number) {
    if (!svgRef.current || !selectedFloor) {
      return;
    }

    const canvasCenter = {
      x: selectedFloor.canvas.width / 2,
      y: selectedFloor.canvas.height / 2,
    };
    const safeScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    const anchor = {
      x: (canvasCenter.x - viewport.tx) / viewport.scale,
      y: (canvasCenter.y - viewport.ty) / viewport.scale,
    };

    setViewport({
      scale: safeScale,
      tx: canvasCenter.x - anchor.x * safeScale,
      ty: canvasCenter.y - anchor.y * safeScale,
    });
  }

  function handleWheel(event: React.WheelEvent<SVGSVGElement>) {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * (selectedFloor?.canvas.width ?? 960);
    const y = ((event.clientY - rect.top) / rect.height) * (selectedFloor?.canvas.height ?? 720);
    const zoomIntensity = event.deltaY > 0 ? 0.92 : 1.08;
    const nextScale = clamp(viewport.scale * zoomIntensity, MIN_SCALE, MAX_SCALE);
    const anchor = {
      x: (x - viewport.tx) / viewport.scale,
      y: (y - viewport.ty) / viewport.scale,
    };

    setViewport({
      scale: nextScale,
      tx: x - anchor.x * nextScale,
      ty: y - anchor.y * nextScale,
    });
  }

  function selectPoi(poi: PropertyMapPoi) {
    setSelectedPoiId(poi.id);
    setStatusMessage(`Selected ${poi.title}.`);
    onPoiSelect?.(poi);
  }

  function openPoiUnlock(poi: PropertyMapPoi) {
    if (!poi.accessPoint) {
      return;
    }

    setStatusMessage(`Ready to unlock ${poi.title}.`);
    onUnlockPoi?.(poi);
  }

  function navigateToPoi(poi: PropertyMapPoi) {
    setSelectedPoiId(poi.id);
    setStatusMessage(`Directions set to ${poi.title}.`);
    onNavigateToPoi?.(poi);
  }

  if (!selectedFloor) {
    return (
      <div className="gos-card p-6">
        <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
          The property map isn&apos;t available right now.
        </p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--gos-muted)]">
          No floor data was found.
        </p>
      </div>
    );
  }

  const Wrapper = isEmbedded ? "div" : "section";

  return (
    <div className="space-y-5 lg:space-y-6">
      <Wrapper className={isEmbedded ? "overflow-hidden" : "gos-card overflow-hidden"}>
        <div
          className={
            isEmbedded
              ? "pb-4"
              : "border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5"
          }
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-2">
              {isEmbedded ? null : (
                <>
                  <p className="gos-section-title text-[0.72rem] font-semibold">Current Visit</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-3xl">
                      Property Map
                    </h1>
                    <span className="gos-badge bg-[rgba(168,138,90,0.12)] text-[color:var(--gos-accent)]">
                      Interactive
                    </span>
                  </div>
                </>
              )}
              <p className="max-w-3xl text-sm leading-6 text-[color:var(--gos-muted)] sm:text-base">
                {propertyName ?? "GuestOS"} {guestName ? `for ${guestName}` : ""}. Pan around, zoom in,
                and tap a point on the map to see more.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => zoomBy(viewport.scale - 0.18)}
                className="gos-button-secondary text-sm"
                aria-label="Zoom out"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => zoomBy(viewport.scale + 0.18)}
                className="gos-button-secondary text-sm"
                aria-label="Zoom in"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewport(getDefaultTransform())}
                className="gos-button-secondary text-sm"
              >
                <MapPinned className="h-4 w-4" />
                Reset view
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {availableFloors.map((floor) => (
              <button
                key={floor.id}
                type="button"
                onClick={() => setSelectedFloorId(floor.id)}
                className={`gos-chip whitespace-nowrap transition-all duration-200 ${
                  floor.id === selectedFloorId
                    ? "bg-[color:var(--gos-primary)] text-white shadow-[0_16px_40px_rgba(31,46,39,0.18)]"
                    : "bg-[rgba(31,46,39,0.05)] text-[color:var(--gos-primary)] hover:bg-[rgba(31,46,39,0.08)]"
                }`}
              >
                {floor.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="border-b border-[rgba(31,46,39,0.08)] bg-[rgba(250,248,245,0.72)] xl:border-b-0 xl:border-r">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f3ee]">
              <div className="absolute inset-0 pointer-events-none bg-[rgba(31,46,39,0.02)]" />
              <svg
                ref={svgRef}
                viewBox={`0 0 ${selectedFloor.canvas.width} ${selectedFloor.canvas.height}`}
                className="h-full w-full touch-none select-none"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                aria-label={`${selectedFloor.label} property map`}
                role="img"
              >
                <rect x="0" y="0" width={selectedFloor.canvas.width} height={selectedFloor.canvas.height} fill="#f7f3ee" />

                <g transform={`matrix(${viewport.scale} 0 0 ${viewport.scale} ${viewport.tx} ${viewport.ty})`}>
                  {selectedFloor.shapes.map((shape) => renderShape(shape))}

                  {selectedFloor.graph.edges.map((edge) => {
                    const from = selectedFloor.graph.nodes.find((node) => node.id === edge.from);
                    const to = selectedFloor.graph.nodes.find((node) => node.id === edge.to);

                    if (!from || !to) {
                      return null;
                    }

                    return (
                      <line
                        key={`${edge.from}-${edge.to}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={
                          edge.kind === "elevator"
                            ? "rgba(168,138,90,0.42)"
                            : edge.kind === "stair"
                              ? "rgba(166,70,70,0.28)"
                              : "rgba(31,46,39,0.16)"
                        }
                        strokeWidth={edge.kind === "elevator" ? 9 : 6}
                        strokeDasharray={edge.kind === "corridor" ? "12 12" : undefined}
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {selectedFloor.graph.nodes.map((node) => (
                    <circle
                      key={node.id}
                      cx={node.x}
                      cy={node.y}
                      r={8}
                      fill="#ffffff"
                      stroke="rgba(31,46,39,0.22)"
                      strokeWidth={3}
                    />
                  ))}

                  {selectedFloor.poi.map((poi) => {
                    const isSelected = poi.id === selectedPoiId;

                    return (
                      <g
                        key={poi.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${poi.title}. ${poi.description}`}
                        transform={`translate(${poi.x} ${poi.y})`}
                        className="cursor-pointer transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--gos-accent)]"
                        onClick={() => selectPoi(poi)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            selectPoi(poi);
                          }
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        <circle
                          cx={0}
                          cy={0}
                          r={isSelected ? 24 : 20}
                          fill={isSelected ? "rgba(31,46,39,0.18)" : "rgba(255,255,255,0.82)"}
                          stroke={isSelected ? "rgba(31,46,39,0.36)" : "rgba(31,46,39,0.14)"}
                          strokeWidth={2}
                        />
                        <circle
                          cx={0}
                          cy={0}
                          r={8}
                          fill={
                            poi.status === "available"
                              ? "rgba(62,107,78,0.9)"
                              : poi.status === "restricted"
                                ? "rgba(184,138,46,0.9)"
                                : poi.status === "locked"
                                  ? "rgba(166,70,70,0.9)"
                                  : "rgba(31,46,39,0.85)"
                          }
                        />
                        <text
                          x={0}
                          y={-30}
                          textAnchor="middle"
                          fill="rgba(31,46,39,0.84)"
                          fontSize={14}
                          fontWeight={600}
                        >
                          {poi.title}
                        </text>
                        <text
                          x={0}
                          y={38}
                          textAnchor="middle"
                          fill="rgba(107,114,128,0.9)"
                          fontSize={11}
                          fontWeight={500}
                        >
                          {getPoiCategoryLabel(poi.category)}
                        </text>
                      </g>
                    );
                  })}

                  {selectedFloor.guestLocation?.floorId === selectedFloor.id ? (
                    <g transform={`translate(${selectedFloor.guestLocation.x} ${selectedFloor.guestLocation.y})`}>
                      <circle r={15} fill="rgba(168,138,90,0.16)" />
                      <circle r={8} fill="rgba(168,138,90,0.95)" stroke="#ffffff" strokeWidth={3} />
                      {selectedFloor.guestLocation.headingDegrees ? (
                        <path
                          d="M 0 -18 L 6 -2 L -6 -2 Z"
                          fill="rgba(168,138,90,0.95)"
                          transform={`rotate(${selectedFloor.guestLocation.headingDegrees})`}
                        />
                      ) : null}
                    </g>
                  ) : null}
                </g>
              </svg>

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-[color:var(--gos-primary)] shadow-sm ring-1 ring-[rgba(31,46,39,0.08)]">
                <ZoomIn className="h-3.5 w-3.5" />
                Pan, zoom, tap
              </div>
            </div>
          </div>

          <aside className="space-y-4 p-5 sm:p-6">
            <div className="gos-panel p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(31,46,39,0.06)] text-[color:var(--gos-primary)]">
                  <Navigation2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--gos-muted)]">
                    Selected floor
                  </p>
                  <p className="text-lg font-semibold text-[color:var(--gos-primary)]">
                    {selectedFloor.label}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[color:var(--gos-muted)]">
                {selectedFloor.subtitle}. {selectedFloor.summary}
              </p>

              {statusMessage ? (
                <div className="mt-4 rounded-[24px] bg-[rgba(168,138,90,0.12)] px-4 py-3 text-sm text-[color:var(--gos-primary)]">
                  {statusMessage}
                </div>
              ) : null}
            </div>

            <div className="gos-panel p-5">
              <div className="flex items-center gap-3">
                <Route className="h-5 w-5 text-[color:var(--gos-accent)]" />
                <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                  Route info
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MetaPill label="Start node" value={selectedFloor.graph.startNodeId} />
                <MetaPill label="End node" value={selectedFloor.graph.endNodeId} />
                <MetaPill label="Nodes" value={String(selectedFloor.graph.nodes.length)} />
                <MetaPill label="Edges" value={String(selectedFloor.graph.edges.length)} />
              </div>
            </div>

            {selectedPoi ? (
              <div className="gos-card overflow-hidden">
                <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="gos-section-title text-[0.72rem] font-semibold">
                        Point of interest
                      </p>
                      <h2 className="text-xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
                        {selectedPoi.title}
                      </h2>
                    </div>
                    <span className={`gos-badge border border-transparent ${getPoiTone(selectedPoi.status)}`}>
                      {selectedPoi.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="gos-badge bg-[rgba(31,46,39,0.06)] text-[color:var(--gos-primary)]">
                      {getPoiCategoryLabel(selectedPoi.category)}
                    </span>
                    {selectedPoi.accessPoint ? (
                      <span className="gos-badge bg-[rgba(168,138,90,0.12)] text-[color:var(--gos-accent)]">
                        Access point
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
                    {selectedPoi.description}
                  </p>

                  {selectedPoi.details?.length ? (
                    <div className="space-y-2">
                      {selectedPoi.details.map((detail) => (
                        <div
                          key={detail}
                          className="rounded-[20px] bg-[rgba(31,46,39,0.04)] px-4 py-3 text-sm text-[color:var(--gos-text)]"
                        >
                          {detail}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="rounded-[24px] border border-dashed border-[rgba(31,46,39,0.12)] bg-[rgba(255,255,255,0.72)] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--gos-primary)]">
                      <Sparkles className="h-4 w-4 text-[color:var(--gos-accent)]" />
                      Photo
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--gos-muted)]">
                      {selectedPoi.photo?.caption ?? "A photo of this spot will be added soon."}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[color:var(--gos-muted)]">
                      {selectedPoi.photo?.alt}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedPoi.accessPoint ? (
                      <button
                        type="button"
                        onClick={() => openPoiUnlock(selectedPoi)}
                        className="gos-button-secondary justify-center text-sm"
                      >
                        <LockKeyhole className="h-4 w-4" />
                        Unlock
                      </button>
                    ) : (
                      <div className="rounded-full bg-[rgba(31,46,39,0.04)] px-4 py-3 text-sm text-[color:var(--gos-muted)]">
                        This spot can&apos;t be unlocked remotely.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => navigateToPoi(selectedPoi)}
                      className="gos-button-primary justify-center text-sm"
                    >
                      <Navigation2 className="h-4 w-4" />
                      {selectedPoi.navigateLabel ?? "Navigate here"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="gos-panel p-5">
                <div className="flex items-center gap-3">
                  <CircleHelp className="h-5 w-5 text-[color:var(--gos-accent)]" />
                  <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                    Select a point of interest
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--gos-muted)]">
                  Tap any gate, elevator, destination, or amenity to see more about it.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-[24px] bg-[rgba(31,46,39,0.04)] px-4 py-3 text-sm text-[color:var(--gos-muted)]">
                  <LockKeyhole className="h-4 w-4" />
                  Unlock and navigation controls are coming soon.
                </div>
              </div>
            )}
          </aside>
        </div>
      </Wrapper>
    </div>
  );
}

function MetaPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-[rgba(31,46,39,0.04)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-medium text-[color:var(--gos-primary)]">{value}</p>
    </div>
  );
}
