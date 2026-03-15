import { create } from 'zustand';

export interface FindPartnerRequest {
  sport: string;
  location: { lat: number; lng: number };
  radiusKm: number;
  timeStart: string;
  timeEnd: string;
  skillMin: number;
  skillMax: number;
  playersNeeded: number;
}

export interface MatchedMember {
  userId: string;
  name: string;
  avatar: string;
  skillLevel: number;
  distanceKm: number;
}

export interface MatchedGroup {
  groupId: string;
  chatId: string;
  status: 'matched';
  members: MatchedMember[];
  sport: string;
  timeStart: string;
}

type MatchingStatus = 'idle' | 'searching' | 'matched' | 'not_found';

interface FindPartnerState {
  currentRequest: FindPartnerRequest | null;
  matchingStatus: MatchingStatus;
  matchedGroup: MatchedGroup | null;
  searchStartedAt: number | null;
  showQuickModal: boolean;

  setRequest: (req: FindPartnerRequest | null) => void;
  setMatchingStatus: (status: MatchingStatus) => void;
  setMatchedGroup: (group: MatchedGroup | null) => void;
  setSearchStartedAt: (ts: number | null) => void;
  setShowQuickModal: (show: boolean) => void;
  reset: () => void;
}

export const useFindPartnerStore = create<FindPartnerState>()((set) => ({
  currentRequest: null,
  matchingStatus: 'idle',
  matchedGroup: null,
  searchStartedAt: null,
  showQuickModal: false,

  setRequest: (req) => set({ currentRequest: req }),
  setMatchingStatus: (status) => set({ matchingStatus: status }),
  setMatchedGroup: (group) => set({ matchedGroup: group }),
  setSearchStartedAt: (ts) => set({ searchStartedAt: ts }),
  setShowQuickModal: (show) => set({ showQuickModal: show }),
  reset: () => set({
    currentRequest: null,
    matchingStatus: 'idle',
    matchedGroup: null,
    searchStartedAt: null,
  }),
}));
