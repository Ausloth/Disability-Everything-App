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

export interface ClientRisk {
  id: string;
  category: "Medical / Health" | "Behavioural" | "Environmental" | "Mobility / Safety" | "Other";
  hazard: string;
  level: "Low" | "Medium" | "High" | "Extreme";
  mitigation: string;
  lastReviewed: string;
  nextReview: string;
}

export interface ClientGoal {
  id: string;
  title: string;
  type: "NDIS" | "Personal";
  description: string;
  status: "Active" | "Completed" | "On Hold";
}

export interface ClientMedication {
  id: string;
  name: string;
  dose: string;
  route: string;
  schedule: string;
  prn: boolean;
  prescribingDoctor?: string;
  notes?: string;
  hasRisks?: boolean; // Can be used to show warning if not in risk assessment
}

export interface ClientContact {
  id: string;
  name: string;
  relationship: "Emergency Contact" | "Family" | "Carer" | "OT" | "Speech Pathologist" | "Physiotherapist" | "Behaviour Support Practitioner" | "Other";
  phone: string;
  email?: string;
  isEmergency: boolean;
}

export interface BehaviourStrategy {
  id: string;
  trigger: string;
  strategy: string;
  isFormal: boolean; // True if from BSP
  effectiveness?: "Low" | "Medium" | "High";
}

export interface BehaviourSupportPlan {
  fileName?: string;
  uploadDate?: string;
  version?: string;
  strategies: BehaviourStrategy[];
}

export interface SupportPlan {
  communicationPreferences: string;
  triggers: string;
  motivators: string;
  whatWorks: string;
  whatDoesntWork: string;
  mealtimePlan?: string;
}

export interface Client {
  id: string;
  name: string;
  preferredName?: string;
  age?: number;
  ndisNumber?: string;
  photoUrl?: string;
  tags?: string[];
  supportLevel?: string;
  risks?: ClientRisk[];
  goals?: ClientGoal[];
  medications?: ClientMedication[];
  bsp?: BehaviourSupportPlan;
  supportPlan?: SupportPlan;
  contacts?: ClientContact[];
}

export interface JournalNote {
  id: string;
  timestamp: string;
  staffId: string;
  clientIds: string[];
  noteType: string;
  subject: string;
  content: string;
  linkedGoalIds: string[];

  // Activity specific
  scheduleId?: string;
  activityId?: string;
  outlineId?: string;
  currentWeek?: number;

  // Barriers
  barriers?: {
    physical: string;
    sensory: string;
    cognitive: string;
    social: string;
    strategies: string;
    impact: "Low" | "Medium" | "High" | "";
  };

  medicationData?: {
    medNames: string;
    medDoseTime: string;
    medRoute: string;
    medAdministeredBy: string;
    medMissed: boolean;
    medMissReason: string;
    medSideEffects: string;
    medPrn: string;
  };

  mealtimeData?: {
    mealType: string;
    mealOffered: string;
    mealConsumed: string;
    mealAssistance: string;
    mealChoking: string;
    mealRefusal: string;
    mealFluid: string;
    mealNotes: string;
  };
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
  clients: Client[];
  schedules: any[];
  outlines: ActivityOutline[];
  notes: JournalNote[];
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
  updateClient: (client: Client) => void;
  addJournalNote: (note: JournalNote) => void;
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

const MOCK_CLIENTS: Client[] = [
  {
    id: "Alice",
    name: "Alice",
    age: 24,
    supportLevel: "Medium",
    tags: ["Autism", "Non-verbal", "High Energy"],
    ndisNumber: "430582910",
    risks: [
      {
        id: "1",
        category: "Medical / Health",
        hazard: "Peanut Allergy",
        level: "Extreme",
        mitigation: "Carry EpiPen at all times. Staff must be trained.",
        lastReviewed: "2026-01-01",
        nextReview: "2027-01-01",
      },
    ],
    goals: [
      {
        id: "g1",
        title: "Improve social participation",
        type: "NDIS",
        description: "Engage with peers in group settings",
        status: "Active",
      },
    ],
    medications: [
      {
        id: "m1",
        name: "Risperidone",
        dose: "1mg",
        route: "Oral",
        schedule: "08:00 AM",
        prn: false,
        hasRisks: true,
      }
    ],
    bsp: {
      fileName: "Alice_BSP_2025.pdf",
      uploadDate: "2025-11-15",
      version: "1.2",
      strategies: [
        {
          id: "bs1",
          trigger: "Loud unexpected noises",
          strategy: "Offer noise-cancelling headphones and redirect to a quiet zone.",
          isFormal: true,
          effectiveness: "High",
        }
      ]
    },
    supportPlan: {
      communicationPreferences: "Uses AAC device on iPad. Responds well to visual schedules.",
      triggers: "Sudden changes to routine without warning.",
      motivators: "Trains, drawing, music time.",
      whatWorks: "Giving a 5-minute and 1-minute warning before transitions.",
      whatDoesntWork: "Rushing her or speaking loudly.",
      mealtimePlan: "Texture modified diet - Soft & Bite Sized (Level 6). Requires setup."
    },
    contacts: [
      {
        id: "c1",
        name: "Jane Doe",
        relationship: "Family",
        phone: "0400 123 456",
        isEmergency: true,
      }
    ]
  },
  {
    id: "Bob",
    name: "Bob",
    age: 30,
    supportLevel: "High",
    risks: [
      {
        id: "2",
        category: "Behavioural",
        hazard: "Wandering",
        level: "High",
        mitigation: "Keep in line of sight when in community.",
        lastReviewed: "2026-03-01",
        nextReview: "2026-09-01",
      },
    ],
    goals: [],
  },
  { id: "Charlie", name: "Charlie", goals: [], risks: [] },
  { id: "David", name: "David", goals: [], risks: [] },
  { id: "Eve", name: "Eve", goals: [], risks: [] },
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
  clients: MOCK_CLIENTS,
  schedules: MOCK_SCHEDULES,
  outlines: MOCK_OUTLINES,
  notes: [],
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

  updateClient: (client) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === client.id ? client : c)),
    })),
  addJournalNote: (note) => set((state) => ({ notes: [...state.notes, note] })),

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
