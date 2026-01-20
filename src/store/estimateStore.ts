import { create } from 'zustand';

interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Estimate {
  id: number;
  clientName: string;
  projectName: string;
  items: EstimateItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface EstimateStore {
  estimates: Estimate[];
  isLoading: boolean;
  error: string | null;
  selectedEstimate: Estimate | null;
  setEstimates: (estimates: Estimate[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedEstimate: (estimate: Estimate | null) => void;
  loadEstimates: () => Promise<void>;
  saveEstimate: (estimate: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEstimate: (estimate: Estimate) => Promise<void>;
  deleteEstimate: (id: number) => Promise<void>;
  exportToExcel: () => Promise<void>;
  importFromExcel: () => Promise<void>;
}

export const useEstimateStore = create<EstimateStore>((set, get) => ({
  estimates: [],
  isLoading: false,
  error: null,
  selectedEstimate: null,

  setEstimates: (estimates) => set({ estimates }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedEstimate: (estimate) => set({ selectedEstimate: estimate }),

  loadEstimates: async () => {
    try {
      set({ isLoading: true, error: null });
      const estimates = await (window as any).__TAURI__.invoke('get_estimates');
      set({ estimates, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  saveEstimate: async (estimate) => {
    try {
      set({ isLoading: true, error: null });
      await (window as any).__TAURI__.invoke('save_estimate', { estimate });
      await get().loadEstimates();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateEstimate: async (estimate) => {
    try {
      set({ isLoading: true, error: null });
      await (window as any).__TAURI__.invoke('update_estimate', { estimate });
      await get().loadEstimates();
      set({ selectedEstimate: null });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteEstimate: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await (window as any).__TAURI__.invoke('delete_estimate', { id });
      await get().loadEstimates();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  exportToExcel: async () => {
    try {
      set({ isLoading: true, error: null });
      const { estimates } = get();
      const filePath = await (window as any).__TAURI__.invoke('export_to_excel', { estimates });
      if (filePath) {
        alert(`Estimates exported successfully to:\n${filePath}`);
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  importFromExcel: async () => {
    try {
      set({ isLoading: true, error: null });
      const estimates = await (window as any).__TAURI__.invoke('import_from_excel');

      if (estimates && estimates.length > 0) {
        for (const estimate of estimates) {
          await (window as any).__TAURI__.invoke('save_estimate', { estimate });
        }
        await get().loadEstimates();
        alert(`Successfully imported ${estimates.length} estimate(s)`);
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
