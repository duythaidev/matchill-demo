import { create } from 'zustand';

export interface MatchRequest {
  sport: string;
  target?: 'teammate' | 'opponent';
  location: { lat: number; lng: number };
  radiusKm: number;
  timeStart: string;
  timeEnd: string | null;
  skillMin: number;
  skillMax: number;
  playersNeeded: number;
  description?: string;
  postToDiscover?: boolean;
  flexibleTime?: boolean;
}

export interface MatchSuggestion {
  userId: string;
  fullName: string;
  avatar: string;
  skillLevel: number;
  distanceKm: number;
  sports: string[];
  sportMatchScore: number;
  timeMatchScore: number;
  matchScore: number;
  isAvailable: boolean;
  bio?: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  avatar: string;
  skill: number;
}

export interface OpenTeam {
  requestId: string;
  leaderId: string;
  leaderName: string;
  leaderAvatar: string;
  sport: string;
  timeStart: string;
  timeEnd: string;
  skillAvg: number;
  slotsLeft: number;
  totalSlots: number;
  members: TeamMember[];
  description?: string;
  distanceKm: number;
}

export interface MatchFilters {
  sport: string;
  maxDistance: number;
  date: string;
  timeRange: string;
}

interface MatchState {
  currentRequest: MatchRequest | null;
  suggestions: MatchSuggestion[];
  allPlayers: MatchSuggestion[];
  openTeams: OpenTeam[];
  requestId: string | null;
  isLoading: boolean;
  hasMatchedFromRequest: boolean;
  activeTab: 'open-teams' | 'suggested';
  filters: MatchFilters;
  setCurrentRequest: (request: MatchRequest | null) => void;
  setSuggestions: (suggestions: MatchSuggestion[]) => void;
  setAllPlayers: (players: MatchSuggestion[]) => void;
  setOpenTeams: (teams: OpenTeam[]) => void;
  setRequestId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHasMatchedFromRequest: (val: boolean) => void;
  setActiveTab: (tab: 'open-teams' | 'suggested') => void;
  setFilters: (filters: Partial<MatchFilters>) => void;
  reset: () => void;
  addOpenTeam: (team: OpenTeam) => void;

}

const defaultFilters: MatchFilters = {
  sport: 'all',
  maxDistance: 20,
  date: new Date().toISOString().split('T')[0],
  timeRange: 'any',
};

export const useMatchStore = create<MatchState>()((set) => ({
  currentRequest: null,
  suggestions: [],
  allPlayers: [],
  openTeams: [],
  requestId: null,
  isLoading: false,
  hasMatchedFromRequest: false,
  activeTab: 'open-teams',
  filters: defaultFilters,
  setCurrentRequest: (request) => set({ currentRequest: request }),
  setSuggestions: (suggestions) => set({ suggestions }),
  setAllPlayers: (players) => set({ allPlayers: players }),
  setOpenTeams: (teams) => set({ openTeams: teams }),
  setRequestId: (id) => set({ requestId: id }),
  setLoading: (loading) => set({ isLoading: loading }),
  setHasMatchedFromRequest: (val) => set({ hasMatchedFromRequest: val }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  reset: () =>
    set({ currentRequest: null, suggestions: [], requestId: null, hasMatchedFromRequest: false }),
  addOpenTeam: (team) => set((state) => ({ openTeams: [team, ...state.openTeams] })),
}));