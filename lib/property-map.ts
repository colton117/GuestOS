import type { AccessPointSlug } from "@/lib/access-definitions";

export type PropertyMapFloorId =
  | "garage-b1"
  | "garage-level-1"
  | "level-1"
  | "level-2"
  | "level-3"
  | "level-4"
  | "level-5"
  | "level-6";

export type PropertyMapPoiCategory =
  | "gate"
  | "elevator"
  | "door"
  | "amenity"
  | "service"
  | "destination"
  | "utility";

export type PropertyMapPoiStatus = "available" | "restricted" | "locked" | "info";

export interface PropertyMapPhotoReference {
  alt: string;
  caption?: string;
  src?: string;
}

export interface PropertyMapNode {
  id: string;
  x: number;
  y: number;
}

export interface PropertyMapEdge {
  from: string;
  to: string;
  kind?: "corridor" | "elevator" | "stair";
}

export interface PropertyMapRouteGraph {
  startNodeId: string;
  endNodeId: string;
  nodes: PropertyMapNode[];
  edges: PropertyMapEdge[];
}

interface BaseShape {
  fill?: string;
  opacity?: number;
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
}

export interface RectShape extends BaseShape {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}

export interface CircleShape extends BaseShape {
  type: "circle";
  cx: number;
  cy: number;
  r: number;
}

export interface LineShape extends BaseShape {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PathShape extends BaseShape {
  type: "path";
  d: string;
}

export interface PolygonShape extends BaseShape {
  type: "polygon";
  points: string;
}

export interface TextShape extends BaseShape {
  type: "text";
  x: number;
  y: number;
  value: string;
  fontSize?: number;
  fontWeight?: number;
  textAnchor?: "start" | "middle" | "end";
}

export type PropertyMapShape =
  | RectShape
  | CircleShape
  | LineShape
  | PathShape
  | PolygonShape
  | TextShape;

export interface PropertyMapPoi {
  id: string;
  title: string;
  description: string;
  category: PropertyMapPoiCategory;
  status: PropertyMapPoiStatus;
  x: number;
  y: number;
  accessPoint?: AccessPointSlug;
  navigateLabel?: string;
  photo?: PropertyMapPhotoReference;
  details?: ReadonlyArray<string>;
  relatedNodeId?: string;
}

export interface PropertyMapGuestLocation {
  floorId: PropertyMapFloorId;
  x: number;
  y: number;
  headingDegrees?: number;
  label?: string;
}

export interface PropertyMapFloor {
  id: PropertyMapFloorId;
  label: string;
  subtitle: string;
  summary: string;
  canvas: {
    width: number;
    height: number;
  };
  shapes: PropertyMapShape[];
  poi: PropertyMapPoi[];
  guestLocation?: PropertyMapGuestLocation;
  graph: PropertyMapRouteGraph;
}

export const propertyMapFloorOptions: ReadonlyArray<{
  id: PropertyMapFloorId;
  label: string;
}> = [
  { id: "garage-b1", label: "Garage B1" },
  { id: "garage-level-1", label: "Garage Level 1" },
  { id: "level-1", label: "Level 1" },
  { id: "level-2", label: "Level 2" },
  { id: "level-3", label: "Level 3" },
  { id: "level-4", label: "Level 4" },
  { id: "level-5", label: "Level 5" },
  { id: "level-6", label: "Level 6" },
] as const;

const sharedGuestLocation: PropertyMapGuestLocation = {
  floorId: "garage-level-1",
  x: 360,
  y: 350,
  headingDegrees: 42,
  label: "Guest location placeholder",
};

function createFloor(
  id: PropertyMapFloorId,
  label: string,
  subtitle: string,
  summary: string,
  shapes: PropertyMapShape[],
  poi: PropertyMapPoi[],
  graph: PropertyMapRouteGraph,
  guestLocation?: PropertyMapGuestLocation,
): PropertyMapFloor {
  return {
    id,
    label,
    subtitle,
    summary,
    canvas: { width: 960, height: 720 },
    shapes,
    poi,
    graph,
    guestLocation,
  };
}

function makeGraph(nodes: PropertyMapNode[], edges: PropertyMapEdge[]): PropertyMapRouteGraph {
  return {
    startNodeId: nodes[0]?.id ?? "node-start",
    endNodeId: nodes[nodes.length - 1]?.id ?? "node-end",
    nodes,
    edges,
  };
}

const garageLevel1Nodes: PropertyMapNode[] = [
  { id: "garage-entry", x: 120, y: 520 },
  { id: "garage-drive-lane", x: 260, y: 520 },
  { id: "garage-elevator-lobby", x: 420, y: 420 },
  { id: "garage-pedestrian-lobby", x: 580, y: 370 },
  { id: "garage-stairwell", x: 730, y: 300 },
  { id: "garage-apartment", x: 840, y: 220 },
];

const level1Nodes: PropertyMapNode[] = [
  { id: "level1-entry", x: 110, y: 430 },
  { id: "level1-leasing", x: 310, y: 420 },
  { id: "level1-lobby", x: 500, y: 360 },
  { id: "level1-stair", x: 680, y: 310 },
  { id: "level1-apartment", x: 835, y: 250 },
];

const level2To6Nodes: PropertyMapNode[] = [
  { id: "upper-elevator", x: 150, y: 510 },
  { id: "upper-corridor", x: 360, y: 430 },
  { id: "upper-units", x: 610, y: 330 },
  { id: "upper-apartment", x: 820, y: 230 },
];

export const propertyMapFloors: readonly PropertyMapFloor[] = [
  createFloor(
    "garage-b1",
    "Garage B1",
    "Sub-level arrival",
    "Service access, garage circulation, and route placeholders for future pathfinding.",
    [
      { type: "rect", x: 60, y: 90, width: 840, height: 560, rx: 44, fill: "rgba(255,255,255,0.82)" },
      { type: "rect", x: 120, y: 160, width: 190, height: 84, rx: 26, fill: "rgba(31,46,39,0.06)" },
      { type: "rect", x: 340, y: 150, width: 220, height: 110, rx: 30, fill: "rgba(168,138,90,0.1)" },
      { type: "rect", x: 590, y: 170, width: 180, height: 86, rx: 26, fill: "rgba(31,46,39,0.05)" },
      { type: "path", d: "M165 340 C250 280, 335 285, 410 350 S560 430, 650 380 S800 310, 840 240", fill: "none", stroke: "rgba(31,46,39,0.18)", strokeWidth: 6 },
      { type: "path", d: "M120 520 C250 520, 330 500, 420 420 S610 320, 760 300", fill: "none", stroke: "rgba(168,138,90,0.25)", strokeWidth: 8, strokeDasharray: "12 12" },
      { type: "text", x: 130, y: 130, value: "Garage B1", fontSize: 34, fontWeight: 600, fill: "rgba(31,46,39,0.72)" },
    ],
    [
      {
        id: "garage-b1-vehicle-gate",
        title: "Vehicle Gate",
        description: "Conceptual vehicle entry point for the garage level.",
        category: "gate",
        status: "available",
        x: 160,
        y: 500,
        accessPoint: "vehicle-gate",
        navigateLabel: "Navigate here",
        photo: { alt: "Vehicle gate reference photo", caption: "Reference imagery placeholder." },
        relatedNodeId: "garage-entry",
      },
      {
        id: "garage-b1-garage-elevator",
        title: "Garage Elevator",
        description: "Primary vertical circulation from the garage level.",
        category: "elevator",
        status: "available",
        x: 440,
        y: 390,
        accessPoint: "garage-elevator",
        navigateLabel: "Navigate here",
        photo: { alt: "Garage elevator reference photo", caption: "Reference imagery placeholder." },
        relatedNodeId: "garage-elevator-lobby",
      },
      {
        id: "garage-b1-garage-pedestrian",
        title: "Garage Pedestrian Gate",
        description: "Pedestrian access into the property from the garage.",
        category: "gate",
        status: "available",
        x: 590,
        y: 330,
        accessPoint: "garage-pedestrian",
        navigateLabel: "Navigate here",
        photo: { alt: "Garage pedestrian gate reference photo" },
        relatedNodeId: "garage-pedestrian-lobby",
      },
    ],
    makeGraph(garageLevel1Nodes, [
      { from: "garage-entry", to: "garage-drive-lane", kind: "corridor" },
      { from: "garage-drive-lane", to: "garage-elevator-lobby", kind: "corridor" },
      { from: "garage-elevator-lobby", to: "garage-pedestrian-lobby", kind: "corridor" },
      { from: "garage-pedestrian-lobby", to: "garage-stairwell", kind: "stair" },
      { from: "garage-stairwell", to: "garage-apartment", kind: "elevator" },
    ]),
    sharedGuestLocation,
  ),
  createFloor(
    "garage-level-1",
    "Garage Level 1",
    "Arrival lobby",
    "Parking circulation, vehicle access, and lobby connections for the arrival workflow.",
    [
      { type: "rect", x: 50, y: 80, width: 860, height: 580, rx: 44, fill: "rgba(255,255,255,0.83)" },
      { type: "rect", x: 120, y: 170, width: 220, height: 110, rx: 30, fill: "rgba(31,46,39,0.05)" },
      { type: "rect", x: 390, y: 150, width: 250, height: 132, rx: 32, fill: "rgba(168,138,90,0.08)" },
      { type: "rect", x: 690, y: 170, width: 170, height: 86, rx: 26, fill: "rgba(31,46,39,0.05)" },
      { type: "path", d: "M120 530 C220 490, 310 470, 420 420 S620 320, 700 250 S800 220, 870 210", fill: "none", stroke: "rgba(31,46,39,0.15)", strokeWidth: 6 },
      { type: "path", d: "M180 580 C300 550, 350 470, 430 420 S570 370, 720 330", fill: "none", stroke: "rgba(168,138,90,0.26)", strokeWidth: 8, strokeDasharray: "14 12" },
      { type: "text", x: 135, y: 125, value: "Garage Level 1", fontSize: 34, fontWeight: 600, fill: "rgba(31,46,39,0.72)" },
    ],
    [
      {
        id: "garage-level-1-vehicle-gate",
        title: "Vehicle Gate",
        description: "Primary vehicle entry for arrivals into the garage.",
        category: "gate",
        status: "available",
        x: 180,
        y: 510,
        accessPoint: "vehicle-gate",
        navigateLabel: "Navigate here",
        photo: { alt: "Vehicle gate reference photo" },
        relatedNodeId: "garage-entry",
      },
      {
        id: "garage-level-1-loading-dock",
        title: "Loading Dock",
        description: "Service-side access point for deliveries and operations.",
        category: "service",
        status: "restricted",
        x: 500,
        y: 320,
        accessPoint: "loading-dock",
        navigateLabel: "Navigate here",
        photo: { alt: "Loading dock reference photo" },
        relatedNodeId: "garage-drive-lane",
      },
      {
        id: "garage-level-1-garage-elevator",
        title: "Garage Elevator",
        description: "Passenger elevator connection from the garage lobby.",
        category: "elevator",
        status: "available",
        x: 690,
        y: 230,
        accessPoint: "garage-elevator",
        navigateLabel: "Navigate here",
        photo: { alt: "Garage elevator reference photo" },
        relatedNodeId: "garage-elevator-lobby",
      },
    ],
    makeGraph(garageLevel1Nodes, [
      { from: "garage-entry", to: "garage-drive-lane", kind: "corridor" },
      { from: "garage-drive-lane", to: "garage-elevator-lobby", kind: "corridor" },
      { from: "garage-elevator-lobby", to: "garage-pedestrian-lobby", kind: "corridor" },
      { from: "garage-pedestrian-lobby", to: "garage-stairwell", kind: "stair" },
      { from: "garage-stairwell", to: "garage-apartment", kind: "elevator" },
    ]),
    {
      floorId: "garage-level-1",
      x: 352,
      y: 342,
      headingDegrees: 90,
      label: "Guest location placeholder",
    },
  ),
  createFloor(
    "level-1",
    "Level 1",
    "Lobby level",
    "Lobby entry, leasing, and arrival circulation for the property welcome floor.",
    [
      { type: "rect", x: 60, y: 90, width: 840, height: 560, rx: 44, fill: "rgba(255,255,255,0.83)" },
      { type: "rect", x: 120, y: 170, width: 220, height: 120, rx: 30, fill: "rgba(31,46,39,0.05)" },
      { type: "rect", x: 380, y: 150, width: 260, height: 140, rx: 34, fill: "rgba(168,138,90,0.08)" },
      { type: "rect", x: 700, y: 170, width: 150, height: 90, rx: 26, fill: "rgba(31,46,39,0.05)" },
      { type: "path", d: "M120 540 C250 500, 320 460, 420 410 S600 330, 740 280 S820 240, 860 220", fill: "none", stroke: "rgba(31,46,39,0.15)", strokeWidth: 6 },
      { type: "text", x: 138, y: 126, value: "Level 1", fontSize: 34, fontWeight: 600, fill: "rgba(31,46,39,0.72)" },
    ],
    [
      {
        id: "level-1-knight-pedestrian",
        title: "Knight Street Gate",
        description: "Pedestrian entry from the street-side arrival path.",
        category: "gate",
        status: "available",
        x: 180,
        y: 500,
        accessPoint: "knight-pedestrian",
        navigateLabel: "Navigate here",
        photo: { alt: "Knight Street gate reference photo" },
        relatedNodeId: "level1-entry",
      },
      {
        id: "level-1-leasing-office",
        title: "Leasing Office",
        description: "Front-of-house leasing and host support area.",
        category: "service",
        status: "info",
        x: 500,
        y: 300,
        accessPoint: "leasing-office",
        navigateLabel: "Navigate here",
        photo: { alt: "Leasing office reference photo" },
        relatedNodeId: "level1-leasing",
      },
      {
        id: "level-1-stairwell-3",
        title: "Stairwell 3",
        description: "Vertical circulation connection for guest movement.",
        category: "utility",
        status: "locked",
        x: 760,
        y: 245,
        accessPoint: "stairwell",
        navigateLabel: "Navigate here",
        photo: { alt: "Stairwell reference photo" },
        relatedNodeId: "level1-stair",
      },
    ],
    makeGraph(level1Nodes, [
      { from: "level1-entry", to: "level1-leasing", kind: "corridor" },
      { from: "level1-leasing", to: "level1-lobby", kind: "corridor" },
      { from: "level1-lobby", to: "level1-stair", kind: "stair" },
      { from: "level1-stair", to: "level1-apartment", kind: "elevator" },
    ]),
    {
      floorId: "level-1",
      x: 360,
      y: 330,
      headingDegrees: 115,
      label: "Guest location placeholder",
    },
  ),
  ...(["level-2", "level-3", "level-4", "level-5", "level-6"] as const).map((id, index) =>
    createFloor(
      id,
      `Level ${index + 2}`,
      "Residential level",
      "A reusable residence floor shell prepared for future floor-specific SVG tracing.",
      [
        { type: "rect", x: 62, y: 88, width: 836, height: 564, rx: 44, fill: "rgba(255,255,255,0.83)" },
        { type: "rect", x: 124, y: 176, width: 210, height: 112, rx: 30, fill: "rgba(31,46,39,0.05)" },
        { type: "rect", x: 386, y: 150, width: 270, height: 148, rx: 34, fill: "rgba(168,138,90,0.08)" },
        { type: "rect", x: 694, y: 174, width: 154, height: 90, rx: 26, fill: "rgba(31,46,39,0.05)" },
        { type: "path", d: "M132 534 C260 496, 318 456, 418 412 S598 334, 740 286 S822 244, 858 220", fill: "none", stroke: "rgba(31,46,39,0.15)", strokeWidth: 6 },
        { type: "text", x: 138, y: 126, value: `Level ${index + 2}`, fontSize: 34, fontWeight: 600, fill: "rgba(31,46,39,0.72)" },
      ],
      [
        {
          id: `${id}-elevator`,
          title: "Freight Elevator",
          description: "Placeholder elevator and arrival transition for the upper floors.",
          category: "elevator",
          status: "available",
          x: 530,
          y: 290,
          navigateLabel: "Navigate here",
          photo: { alt: "Freight elevator reference photo" },
          relatedNodeId: "upper-elevator",
        },
        {
          id: `${id}-apartment`,
          title: "Apartment",
          description: "Guest destination placeholder for this residential floor.",
          category: "destination",
          status: "info",
          x: 790,
          y: 240,
          navigateLabel: "Navigate here",
          photo: { alt: "Apartment reference photo" },
          relatedNodeId: "upper-apartment",
        },
      ],
      makeGraph(level2To6Nodes, [
        { from: "upper-elevator", to: "upper-corridor", kind: "corridor" },
        { from: "upper-corridor", to: "upper-units", kind: "corridor" },
        { from: "upper-units", to: "upper-apartment", kind: "corridor" },
      ]),
      {
        floorId: id,
        x: 420 + index * 8,
        y: 310 + index * 4,
        headingDegrees: 135,
        label: "Guest location placeholder",
      },
    ),
  ),
];

export function getPropertyMapFloor(
  floorId: PropertyMapFloorId,
): PropertyMapFloor | null {
  return propertyMapFloors.find((floor) => floor.id === floorId) ?? null;
}

