export interface Status {
  id: number;
  userId: number;
  name: string;
  color: string;
  isDefault: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateStatusData {
  userId: number;
  name: string;
  color: string;
  isDefault?: boolean;
  order: number;
}

export interface UpdateStatusData {
  name?: string;
  color?: string;
  isDefault?: boolean;
  order?: number;
}

