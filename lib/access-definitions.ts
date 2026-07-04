export type AccessPointSlug =
  | "vehicle-gate"
  | "pool-gate"
  | "loading-dock"
  | "garage-pedestrian"
  | "knight-pedestrian"
  | "garage-elevator"
  | "leasing-office"
  | "stairwell";

export type AccessVisitFlag =
  | "parkingRequired"
  | "buildingAccessRequired"
  | "apartmentAccessRequired";

export interface AccessPointDefinition {
  slug: AccessPointSlug;
  title: string;
  description: string;
  requiredVisitFlags: readonly AccessVisitFlag[];
  defaultHomeAssistantAction: string;
}

const accessPoints: readonly AccessPointDefinition[] = [
  {
    slug: "vehicle-gate",
    title: "Vehicle Gate",
    description: "Premium vehicle access for entering the property.",
    requiredVisitFlags: ["parkingRequired"],
    defaultHomeAssistantAction: "door.second_floor_vehicle_gate",
  },
  {
    slug: "pool-gate",
    title: "Pool Gate",
    description: "Shared amenity access for the pool area.",
    requiredVisitFlags: ["apartmentAccessRequired"],
    defaultHomeAssistantAction: "door.pool",
  },
  {
    slug: "loading-dock",
    title: "Loading Dock",
    description: "Service-side access for deliveries and loading.",
    requiredVisitFlags: ["buildingAccessRequired"],
    defaultHomeAssistantAction: "door.loading_dock",
  },
  {
    slug: "garage-pedestrian",
    title: "Garage Pedestrian",
    description: "Walk-in access from the garage level.",
    requiredVisitFlags: ["parkingRequired"],
    defaultHomeAssistantAction: "door.garage_pedestrian_gate",
  },
  {
    slug: "knight-pedestrian",
    title: "Knight Pedestrian",
    description: "Pedestrian access from the Knight St side.",
    requiredVisitFlags: ["buildingAccessRequired"],
    defaultHomeAssistantAction: "door.knight_st_pedestrian_gate",
  },
  {
    slug: "garage-elevator",
    title: "Garage Elevator",
    description: "Elevator access from the garage level.",
    requiredVisitFlags: ["parkingRequired"],
    defaultHomeAssistantAction: "door.retail_garage_lobby_elevator",
  },
  {
    slug: "leasing-office",
    title: "Leasing Office",
    description: "Front-desk and leasing office access.",
    requiredVisitFlags: ["buildingAccessRequired"],
    defaultHomeAssistantAction: "door.leasing_office",
  },
  {
    slug: "stairwell",
    title: "Stairwell",
    description: "Stairwell access for building circulation.",
    requiredVisitFlags: ["buildingAccessRequired"],
    defaultHomeAssistantAction: "door.stairwell",
  },
] as const;

export function getAccessPointDefinitions(): readonly AccessPointDefinition[] {
  return accessPoints;
}

export function isAccessPointSlug(value: string): value is AccessPointSlug {
  return accessPoints.some((accessPoint) => accessPoint.slug === value);
}

export function getAccessPointDefinition(
  slug: AccessPointSlug,
): AccessPointDefinition | null {
  return accessPoints.find((accessPoint) => accessPoint.slug === slug) ?? null;
}
