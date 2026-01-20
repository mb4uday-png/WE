/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface Window {
  electronAPI: {
    getEstimates: () => Promise<Estimate[]>;
    saveEstimate: (estimate: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
    updateEstimate: (estimate: Estimate) => Promise<void>;
    deleteEstimate: (id: number) => Promise<void>;
    exportToExcel: (estimates: Estimate[]) => Promise<string>;
    importFromExcel: (filePath?: string) => Promise<Estimate[]>;
  };
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

interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
