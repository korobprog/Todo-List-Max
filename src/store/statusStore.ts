import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Status {
  id: string;
  userId: string;
  name: string;
  color: string;
  isDefault: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

interface StatusState {
  statuses: Status[];
  isLoading: boolean;
  
  loadStatuses: () => Promise<void>;
  createStatus: (data: { name: string; color: string; isDefault?: boolean; order: number }) => Promise<void>;
  updateStatus: (id: string, updates: { name?: string; color?: string; isDefault?: boolean; order?: number }) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
  getStatusById: (id: string) => Status | undefined;
  getDoneStatus: () => Status | undefined;
}

const convertStatusFromApi = (status: any): Status => ({
  id: status.id.toString(),
  userId: status.userId.toString(),
  name: status.name,
  color: status.color,
  isDefault: Boolean(status.isDefault),
  order: Number(status.order),
  createdAt: Number(status.createdAt),
  updatedAt: Number(status.updatedAt),
});

export const useStatusStore = create<StatusState>((set, get) => ({
  statuses: [],
  isLoading: false,

  loadStatuses: async () => {
    set({ isLoading: true });
    try {
      const statuses = await api.statuses.getAll();
      set({ statuses: statuses.map(convertStatusFromApi), isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createStatus: async (data) => {
    try {
      const newStatus = await api.statuses.create(data);
      set((state) => ({ statuses: [...state.statuses, convertStatusFromApi(newStatus)].sort((a, b) => a.order - b.order) }));
    } catch (error) {
      throw error;
    }
  },

  updateStatus: async (id: string, updates) => {
    try {
      const updatedStatus = await api.statuses.update(id, updates);
      set((state) => ({
        statuses: state.statuses.map((s) =>
          s.id === id ? convertStatusFromApi(updatedStatus) : s
        ).sort((a, b) => a.order - b.order),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteStatus: async (id: string) => {
    try {
      await api.statuses.delete(id);
      set((state) => ({
        statuses: state.statuses.filter((s) => s.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  getStatusById: (id: string) => {
    return get().statuses.find((s) => s.id === id);
  },

  getDoneStatus: () => {
    return get().statuses.find((s) => s.isDefault);
  },
}));

