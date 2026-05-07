import { create } from "zustand";

export type ModuleName =
  | "Core"
  | "ProgramDatabase"
  | "ClientOutcomes"
  | "Documentation"
  | "Finance";

export interface OutlineWeek {
  id: string;
  weekNumber: number;
  variationNote?: string;
  goalProgression: string;
  tasksContent: string;
  locationTarget: string;
  materialsCost: string;
  staffGuide: string;
}

export interface RiskAssessmentItem {
  id: string;
  hazard: string;
  likelihood: "Rare" | "Unlikely" | "Possible" | "Likely" | "Almost Certain";
  consequence:
    | "Insignificant"
    | "Minor"
    | "Moderate"
    | "Major"
    | "Catastrophic";
  rating: "Low" | "Medium" | "High" | "Extreme";
  mitigation: string;
  responsible: string;
}

export interface ActivityOutline {
  id: string;
  activityId: string;
  title: string;
  style: "Recurring" | "Progressive";
  startDate: string;
  durationWeeks: number;
  weeks: OutlineWeek[];
  risks?: RiskAssessmentItem[];
}

export interface State {
  user: {
    id: string;
    name: string;
    role: "Admin" | "Coordinator" | "SupportWorker";
    organizationId: string;
  } | null;

  licenseKey: string | null;
  activeModules: Record<ModuleName, boolean>;

  // Stub data
  activities: any[];
  clients: any[];
  schedules: any[];
  outlines: ActivityOutline[];
  commBoards: Array<{
    id: string;
    title: string;
    isCommon: boolean;
    creatorRole: string;
    rows: number;
    cols: number;
    cells: any[];
  }>;

  // Actions
  login: (name: string, role: any) => void;
  logout: () => void;
  setRole: (role: "Admin" | "Coordinator" | "SupportWorker") => void;
  activateLicense: (key: string) => void;
  addCommBoard: (board: any) => void;
  updateCommBoard: (id: string, updates: any) => void;
  deleteCommBoard: (id: string) => void;
  updateOutline: (outline: ActivityOutline) => void;
  addOutline: (outline: ActivityOutline) => void;
}

const MOCK_ACTIVITIES = [
  {
    id: "act-1",
    name: "Community Gardening",
    category: "Outdoors",
    location: "Box Hill",
    level: "Medium Support",
    emoji: "🌱",
  },
  {
    id: "act-2",
    name: "Art Therapy",
    category: "Creative",
    location: "Onsite",
    level: "Low Support",
    emoji: "🎨",
  },
  {
    id: "act-3",
    name: "Bowling",
    category: "Physical",
    location: "Strike Eastland",
    level: "Medium Support",
    emoji: "🎳",
  },
  {
    id: "act-4",
    name: "Cooking Masterclass",
    category: "Life Skills",
    location: "Onsite Kitchen",
    level: "Medium Support",
    emoji: "🍳",
  },
];

const MOCK_OUTLINES: ActivityOutline[] = [
  {
    id: "out-1",
    activityId: "act-3",
    title: "Weekly Bowling League",
    style: "Recurring",
    startDate: "2026-05-01",
    durationWeeks: 24,
    weeks: Array.from({ length: 24 }).map((_, i) => ({
      id: `w-${i + 1}`,
      weekNumber: i + 1,
      variationNote:
        i === 7 ? "Barefoot Lawn Bowls" : i === 14 ? "Night Glow Bowling" : "",
      goalProgression: "Social participation, motor skills, turn-taking.",
      tasksContent:
        "Travel to venue. Rent shoes. 1-2 games of bowling. Lunch at venue cafe.",
      locationTarget: i === 7 ? "Local Bowls Club" : "Strike Eastland",
      materialsCost: "$15 for bowling + $10 for lunch",
      staffGuide:
        "Ensure clients are wearing appropriate socks. Assist with score entry and choosing the right weight ball.",
    })),
  },
  {
    id: "out-2",
    activityId: "act-1",
    title: "Garden to Plate Program",
    style: "Progressive",
    startDate: "2026-05-01",
    durationWeeks: 24,
    weeks: Array.from({ length: 24 }).map((_, i) => ({
      id: `w-${i + 1}`,
      weekNumber: i + 1,
      variationNote: "",
      goalProgression: `Skill building phase ${i < 8 ? "1 (Setup)" : i < 16 ? "2 (Maintenance)" : "3 (Harvest)"}`,
      tasksContent:
        i === 0
          ? "Planning the beds and buying seeds."
          : i === 12
            ? "Weeding and pest management."
            : "Harvesting and cooking preparation.",
      locationTarget: "Onsite Garden",
      materialsCost: "$5 for seeds/tools",
      staffGuide: `Week ${i + 1} focus: Ensure everyone wears gloves and sun protection. Break tasks down into 10-minute increments.`,
    })),
  },
];

// Mock schedules for "Today"
const MOCK_SCHEDULES = [
  {
    id: "sch-1",
    activityId: "act-3",
    outlineId: "out-1",
    currentWeek: 8,
    time: "10:00am - 12:30pm",
    staff: ["user-1"],
    clients: ["Alice", "Bob", "Charlie"],
  },
  {
    id: "sch-2",
    activityId: "act-1",
    outlineId: "out-2",
    currentWeek: 12,
    time: "1:30pm - 3:30pm",
    staff: ["user-1"],
    clients: ["David", "Eve"],
  },
];

export const useStore = create<State>((set) => ({
  user: {
    id: "user-1",
    name: "Admin User",
    role: "Admin",
    organizationId: "org-1",
  },

  licenseKey: null,

  activeModules: {
    Core: true,
    ProgramDatabase: true,
    ClientOutcomes: true,
    Documentation: true,
    Finance: true,
  },

  activities: MOCK_ACTIVITIES,
  clients: [],
  schedules: MOCK_SCHEDULES,
  outlines: MOCK_OUTLINES,
  commBoards: [
    {
      id: "common-1",
      title: "Basic Needs",
      isCommon: true,
      creatorRole: "Admin",
      rows: 2,
      cols: 3,
      cells: [
        {
          id: 0,
          text: "Yes",
          image: "",
          bgColor: "#dcfce3",
          textColor: "#000000",
        },
        {
          id: 1,
          text: "No",
          image: "",
          bgColor: "#fee2e2",
          textColor: "#000000",
        },
        {
          id: 2,
          text: "Stop",
          image: "",
          bgColor: "#fee2e2",
          textColor: "#000000",
        },
        {
          id: 3,
          text: "More",
          image: "",
          bgColor: "#ffffff",
          textColor: "#000000",
        },
        {
          id: 4,
          text: "Drink",
          image: "",
          bgColor: "#dbeafe",
          textColor: "#000000",
        },
        {
          id: 5,
          text: "Eat",
          image: "",
          bgColor: "#fef08a",
          textColor: "#000000",
        },
      ],
    },
  ],

  login: (name, role) =>
    set({ user: { id: "user-new", name, role, organizationId: "org-1" } }),
  logout: () => set({ user: null }),
  setRole: (role) =>
    set((state) => ({ user: state.user ? { ...state.user, role } : null })),

  addCommBoard: (board) =>
    set((state) => ({ commBoards: [...state.commBoards, board] })),
  updateCommBoard: (id, updates) =>
    set((state) => ({
      commBoards: state.commBoards.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    })),
  deleteCommBoard: (id) =>
    set((state) => ({
      commBoards: state.commBoards.filter((b) => b.id !== id),
    })),

  updateOutline: (outline) =>
    set((state) => ({
      outlines: state.outlines.map((o) => (o.id === outline.id ? outline : o)),
    })),
  addOutline: (outline) =>
    set((state) => ({ outlines: [...state.outlines, outline] })),

  activateLicense: (key) =>
    set((state) => {
      // In a real app, this would validate via an API.
      // For now, any key ending in "PRO" unlocks everything.
      const isPro = key.trim().endsWith("PRO");
      return {
        licenseKey: key,
        activeModules: {
          Core: true,
          ProgramDatabase: isPro,
          ClientOutcomes: isPro,
          Documentation: isPro,
          Finance: isPro,
          ...(isPro ? {} : state.activeModules),
        },
      };
    }),
}));
