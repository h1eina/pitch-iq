import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FantasySquad, FantasySquadPlayer, FantasyTransfer, FantasyChip } from './types';

// Position constraints for FPL-style squad
const POSITION_LIMITS = { GKP: 2, DEF: 5, MID: 5, FWD: 3 } as const;
const SQUAD_SIZE = 15;
const STARTING_BUDGET = 100; // £100m

interface FantasyState {
  squad: FantasySquad;
  currentGameweek: number;
  isTransferMode: boolean;
  selectedPlayerSlot: number | null;
  transfersThisWeek: number;
  // Actions
  addPlayer: (playerId: string, position: 'GKP' | 'DEF' | 'MID' | 'FWD', price: number) => boolean;
  removePlayer: (slotPosition: number) => void;
  setCaptain: (playerId: string) => void;
  setViceCaptain: (playerId: string) => void;
  swapPlayers: (pos1: number, pos2: number) => void;
  setFormation: (formation: string) => void;
  activateChip: (chip: FantasyChip) => void;
  confirmTransfers: () => void;
  setTransferMode: (on: boolean) => void;
  selectPlayerSlot: (slot: number | null) => void;
  resetSquad: () => void;
  getPositionCount: (pos: 'GKP' | 'DEF' | 'MID' | 'FWD') => number;
  canAddPosition: (pos: 'GKP' | 'DEF' | 'MID' | 'FWD') => boolean;
}

function emptySquad(): FantasySquad {
  return {
    id: 'user-squad-1',
    name: 'My PitchIQ XI',
    managerName: 'Manager',
    players: [],
    bank: STARTING_BUDGET,
    totalValue: 0,
    freeTransfers: 1,
    wildcardsUsed: 0,
    benchBoostUsed: false,
    tripleCaptainUsed: false,
    freeHitUsed: false,
    totalPoints: 0,
    gameweekPoints: 0,
    overallRank: 0,
    gameweekRank: 0,
    captainId: '',
    viceCaptainId: '',
    formation: '4-4-2',
    chip: 'none',
    transferHistory: [],
  };
}

function getNextSlot(players: FantasySquadPlayer[], pos: 'GKP' | 'DEF' | 'MID' | 'FWD'): number {
  // Assign slot ranges: GKP=1-2, DEF=3-7, MID=8-12, FWD=13-15
  const ranges = { GKP: [1, 2], DEF: [3, 7], MID: [8, 12], FWD: [13, 15] };
  const [start, end] = ranges[pos];
  const usedSlots = new Set(players.map(p => p.position));
  for (let i = start; i <= end; i++) {
    if (!usedSlots.has(i)) return i;
  }
  return -1;
}

export const useFantasyStore = create<FantasyState>()(
  persist(
    (set, get) => ({
      squad: emptySquad(),
      currentGameweek: 29,
      isTransferMode: false,
      selectedPlayerSlot: null,
      transfersThisWeek: 0,

      addPlayer: (playerId, position, price) => {
        const state = get();
        const { squad } = state;
        if (squad.players.length >= SQUAD_SIZE) return false;
        if (squad.players.some(p => p.playerId === playerId)) return false;
        if (!state.canAddPosition(position)) return false;
        if (price > squad.bank) return false;

        const slot = getNextSlot(squad.players, position);
        if (slot === -1) return false;

        const newPlayer: FantasySquadPlayer = {
          playerId,
          position: slot,
          isCaptain: false,
          isViceCaptain: false,
          isBenched: slot > 11,
          purchasePrice: price,
          sellingPrice: price,
        };

        set({
          squad: {
            ...squad,
            players: [...squad.players, newPlayer],
            bank: Math.round((squad.bank - price) * 10) / 10,
            totalValue: Math.round((squad.totalValue + price) * 10) / 10,
          },
          transfersThisWeek: state.transfersThisWeek + 1,
        });
        return true;
      },

      removePlayer: (slotPosition) => {
        const { squad } = get();
        const player = squad.players.find(p => p.position === slotPosition);
        if (!player) return;
        set({
          squad: {
            ...squad,
            players: squad.players.filter(p => p.position !== slotPosition),
            bank: Math.round((squad.bank + player.sellingPrice) * 10) / 10,
            totalValue: Math.round((squad.totalValue - player.sellingPrice) * 10) / 10,
            captainId: squad.captainId === player.playerId ? '' : squad.captainId,
            viceCaptainId: squad.viceCaptainId === player.playerId ? '' : squad.viceCaptainId,
          },
        });
      },

      setCaptain: (playerId) => {
        const { squad } = get();
        set({
          squad: {
            ...squad,
            captainId: playerId,
            viceCaptainId: squad.viceCaptainId === playerId ? '' : squad.viceCaptainId,
            players: squad.players.map(p => ({
              ...p,
              isCaptain: p.playerId === playerId,
              isViceCaptain: p.playerId === playerId ? false : p.isViceCaptain,
            })),
          },
        });
      },

      setViceCaptain: (playerId) => {
        const { squad } = get();
        set({
          squad: {
            ...squad,
            viceCaptainId: playerId,
            captainId: squad.captainId === playerId ? '' : squad.captainId,
            players: squad.players.map(p => ({
              ...p,
              isViceCaptain: p.playerId === playerId,
              isCaptain: p.playerId === playerId ? false : p.isCaptain,
            })),
          },
        });
      },

      swapPlayers: (pos1, pos2) => {
        const { squad } = get();
        set({
          squad: {
            ...squad,
            players: squad.players.map(p => {
              if (p.position === pos1) return { ...p, position: pos2, isBenched: pos2 > 11 };
              if (p.position === pos2) return { ...p, position: pos1, isBenched: pos1 > 11 };
              return p;
            }),
          },
        });
      },

      setFormation: (formation) => {
        set(s => ({ squad: { ...s.squad, formation } }));
      },

      activateChip: (chip) => {
        set(s => ({ squad: { ...s.squad, chip } }));
      },

      confirmTransfers: () => {
        set(s => ({
          transfersThisWeek: 0,
          squad: { ...s.squad, freeTransfers: 1 },
        }));
      },

      setTransferMode: (on) => set({ isTransferMode: on }),
      selectPlayerSlot: (slot) => set({ selectedPlayerSlot: slot }),

      resetSquad: () => set({ squad: emptySquad(), transfersThisWeek: 0 }),

      getPositionCount: (pos) => {
        const ranges = { GKP: [1, 2], DEF: [3, 7], MID: [8, 12], FWD: [13, 15] };
        const [start, end] = ranges[pos];
        return get().squad.players.filter(p => p.position >= start && p.position <= end).length;
      },

      canAddPosition: (pos) => {
        return get().getPositionCount(pos) < POSITION_LIMITS[pos];
      },
    }),
    {
      name: 'pitchiq-fantasy',
      partialize: (state) => ({
        squad: state.squad,
        currentGameweek: state.currentGameweek,
        transfersThisWeek: state.transfersThisWeek,
      }),
    }
  )
);
