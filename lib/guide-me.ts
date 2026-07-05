import type { LucideIcon } from "lucide-react";
import {
  CarFront,
  DoorOpen,
  MapPinned,
  ParkingSquare,
  PersonStanding,
  Waypoints,
  Building2,
  Layers3,
} from "lucide-react";
import type { AccessPointSlug } from "@/lib/access-definitions";

export type ArrivalMode = "driving" | "walking";

export type GuideFloorOption =
  | "Garage B1"
  | "Garage G"
  | "Level 1"
  | "Level 2"
  | "Level 3"
  | "Level 4"
  | "Level 5"
  | "Level 6";

export type GuideStepAction =
  | {
      kind: "open_maps";
      label: string;
      destination: string;
    }
  | {
      kind: "open_access";
      label: string;
      accessPoint: AccessPointSlug;
      autoComplete: true;
    }
  | {
      kind: "complete";
      label: string;
      autoComplete: true;
    };

export interface GuideStepDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action: GuideStepAction;
  floorPrompt?: string;
  completionLabel?: string;
}

export interface GuideFlowDefinition {
  mode: ArrivalMode;
  title: string;
  subtitle: string;
  intro: string;
  steps: GuideStepDefinition[];
}

export interface GuideSessionState {
  mode: ArrivalMode | null;
  completedStepIds: string[];
  selectedFloor: GuideFloorOption | null;
}

export const guideFloorOptions: GuideFloorOption[] = [
  "Garage B1",
  "Garage G",
  "Level 1",
  "Level 2",
  "Level 3",
  "Level 4",
  "Level 5",
  "Level 6",
];

const drivingSteps: GuideStepDefinition[] = [
  {
    id: "drive-navigate",
    title: "Navigate to Property",
    description: "Open Apple Maps and head to the property at a calm pace.",
    icon: MapPinned,
    action: {
      kind: "open_maps",
      label: "Open Apple Maps",
      destination: "4123 Cedar Springs",
    },
  },
  {
    id: "drive-open-gate",
    title: "Open Residential Vehicle Gate",
    description: "Use the vehicle gate when you arrive on property.",
    icon: ParkingSquare,
    action: {
      kind: "open_access",
      label: "Open Gate",
      accessPoint: "vehicle-gate",
      autoComplete: true,
    },
  },
  {
    id: "drive-park",
    title: "Park Vehicle",
    description: "Park in the designated guest area before continuing inside.",
    icon: CarFront,
    action: {
      kind: "complete",
      label: "Mark Complete",
      autoComplete: true,
    },
  },
  {
    id: "drive-walk-lobby",
    title: "Walk to Garage Elevator Lobby",
    description: "Move from the garage to the elevator lobby using the safest route.",
    icon: Waypoints,
    action: {
      kind: "complete",
      label: "Mark Complete",
      autoComplete: true,
    },
  },
  {
    id: "drive-open-elevator-lobby",
    title: "Open Garage Elevator Lobby Door",
    description: "Open the lobby door at the garage elevator entrance.",
    icon: DoorOpen,
    action: {
      kind: "open_access",
      label: "Open Door",
      accessPoint: "garage-elevator",
      autoComplete: true,
    },
  },
  {
    id: "drive-take-elevator",
    title: "Take Elevator",
    description: "Select your floor and ride up to the apartment level.",
    icon: Building2,
    floorPrompt: "What floor are you on?",
    action: {
      kind: "complete",
      label: "Mark Complete",
      autoComplete: true,
    },
  },
  {
    id: "drive-walk-apartment",
    title: "Walk to Apartment",
    description: "Follow the final indoor path to your apartment door.",
    icon: Layers3,
    action: {
      kind: "complete",
      label: "Mark Complete",
      autoComplete: true,
    },
  },
];

const walkingSteps: GuideStepDefinition[] = [
  {
    id: "walk-navigate",
    title: "Navigate to Knight Street Pedestrian Gate",
    description: "Open Apple Maps and head to the pedestrian entrance.",
    icon: MapPinned,
    action: {
      kind: "open_maps",
      label: "Open Apple Maps",
      destination: "Knight Street Pedestrian Gate",
    },
  },
  {
    id: "walk-open-gate",
    title: "Open Pedestrian Gate",
    description: "Use the pedestrian gate when you reach the property.",
    icon: PersonStanding,
    action: {
      kind: "open_access",
      label: "Open Gate",
      accessPoint: "knight-pedestrian",
      autoComplete: true,
    },
  },
  {
    id: "walk-lobby",
    title: "Walk to Lobby",
    description: "Continue through the property to the lobby.",
    icon: Waypoints,
    action: {
      kind: "complete",
      label: "Mark Complete",
      autoComplete: true,
    },
  },
  {
    id: "walk-take-elevator",
    title: "Take Elevator",
    description: "Choose your floor before the elevator ride begins.",
    icon: Building2,
    floorPrompt: "What floor are you on?",
    action: {
      kind: "complete",
      label: "Mark Complete",
      autoComplete: true,
    },
  },
  {
    id: "walk-apartment",
    title: "Walk to Apartment",
    description: "Finish the final indoor walk to your apartment door.",
    icon: Layers3,
    action: {
      kind: "complete",
      label: "Mark Complete",
      autoComplete: true,
    },
  },
];

export const guideFlows: Record<ArrivalMode, GuideFlowDefinition> = {
  driving: {
    mode: "driving",
    title: "Driving",
    subtitle: "Vehicle arrival",
    intro: "Step through the garage route in a calm sequence. GuestOS will keep the journey guided and minimal.",
    steps: drivingSteps,
  },
  walking: {
    mode: "walking",
    title: "Walking / Uber",
    subtitle: "Pedestrian arrival",
    intro: "Follow the pedestrian entrance route with a focused, hotel-style arrival flow.",
    steps: walkingSteps,
  },
};

export const guideModeChoices: Array<{
  mode: ArrivalMode;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    mode: "driving",
    title: "Driving",
    description: "Use the vehicle gate and garage elevator path.",
    icon: CarFront,
  },
  {
    mode: "walking",
    title: "Walking / Uber",
    description: "Use the Knight Street pedestrian entrance.",
    icon: PersonStanding,
  },
];

export function getGuideFlow(mode: ArrivalMode | null) {
  return mode ? guideFlows[mode] : null;
}

export function getGuideStepStatus(
  stepIndex: number,
  completedStepIds: string[],
): "completed" | "current" | "upcoming" {
  if (stepIndex < completedStepIds.length) {
    return "completed";
  }

  if (stepIndex === completedStepIds.length) {
    return "current";
  }

  return "upcoming";
}

export function getNextGuideStep(
  mode: ArrivalMode | null,
  completedStepIds: string[],
) {
  const flow = getGuideFlow(mode);

  if (!flow) {
    return null;
  }

  return flow.steps[completedStepIds.length] ?? null;
}

/** Every step across every flow, for admin UIs that manage per-step data (e.g. reference photos) independent of any one guest's session. */
export function getAllGuideSteps(): Array<{
  stepId: string;
  title: string;
  mode: ArrivalMode;
  flowTitle: string;
}> {
  return (Object.values(guideFlows) as GuideFlowDefinition[]).flatMap((flow) =>
    flow.steps.map((step) => ({
      stepId: step.id,
      title: step.title,
      mode: flow.mode,
      flowTitle: flow.title,
    })),
  );
}
