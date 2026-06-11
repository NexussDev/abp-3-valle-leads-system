// 🚀 SEM IMPORTS CIRCULARES AQUI!

export interface HistoryLog {
  id: string;
  field: 'stage' | 'status' | 'create';
  oldValue?: string;
  newValue: string;
  updatedAt: string;
  responsibleName: string;
}

export interface Lead {
  id: string; 
  leadNumber?: string;
  name: string;
  avatar: string;
  car: string;
  image: string; 
  price: number;
  stage: string; 
  status: string;
  time: string; 
  date: string;
  temperatura?: 'frio' | 'morno' | 'quente';
  statusUpdatedAt?: string;
  history?: HistoryLog[]; // Aponta perfeitamente para a interface acima

  phone?: string;
  city?: string;
  origin?: string;
}