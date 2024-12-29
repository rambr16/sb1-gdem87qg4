export interface ProcessingStatus {
  progress: number;
  eta: number;
  stage: string;
  isComplete: boolean;
  error?: string;
  processedData?: any[];
}

export interface AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface CSVProcessorState {
  status: ProcessingStatus;
  setStatus: (status: Partial<ProcessingStatus>) => void;
  resetStatus: () => void;
}

export interface EmailData {
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phone?: string;
  mxProvider?: string;
  otherDmName?: string;
  [key: string]: any;
}