import { create } from 'zustand';
import { CSVProcessorState, ProcessingStatus } from '../types';

const initialStatus: ProcessingStatus = {
  progress: 0,
  eta: 0,
  stage: '',
  isComplete: false
};

export const useProcessorStore = create<CSVProcessorState>((set) => ({
  status: initialStatus,
  setStatus: (newStatus) => 
    set((state) => ({ 
      status: { ...state.status, ...newStatus }
    })),
  resetStatus: () => set({ status: initialStatus })
}));