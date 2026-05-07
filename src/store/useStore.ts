import { create } from 'zustand'

export type ModuleName = 
  | 'Core' 
  | 'ProgramDatabase' 
  | 'ClientOutcomes' 
  | 'Documentation' 
  | 'Finance'

export interface State {
  user: {
    id: string
    name: string
    role: 'Admin' | 'Coordinator' | 'SupportWorker'
    organizationId: string
  } | null
  
  licenseKey: string | null
  activeModules: Record<ModuleName, boolean>

  // Stub data
  activities: any[]
  clients: any[]
  schedules: any[]

  // Actions
  login: (name: string, role: any) => void
  logout: () => void
  setRole: (role: 'Admin' | 'Coordinator' | 'SupportWorker') => void
  activateLicense: (key: string) => void
}

export const useStore = create<State>((set) => ({
  user: {
    id: 'user-1',
    name: 'Admin User',
    role: 'Admin',
    organizationId: 'org-1'
  },
  
  licenseKey: null,
  
  activeModules: {
    Core: true,
    ProgramDatabase: true,
    ClientOutcomes: true,
    Documentation: true,
    Finance: true
  },

  activities: [],
  clients: [],
  schedules: [],

  login: (name, role) => set({ user: { id: 'user-new', name, role, organizationId: 'org-1' } }),
  logout: () => set({ user: null }),
  setRole: (role) => set((state) => ({ user: state.user ? { ...state.user, role } : null })),
  
  activateLicense: (key) => set((state) => {
    // In a real app, this would validate via an API.
    // For now, any key ending in "PRO" unlocks everything.
    const isPro = key.trim().endsWith('PRO')
    return {
      licenseKey: key,
      activeModules: {
        Core: true,
        ProgramDatabase: isPro,
        ClientOutcomes: isPro,
        Documentation: isPro,
        Finance: isPro,
        ...(isPro ? {} : state.activeModules)
      }
    }
  })
}))
