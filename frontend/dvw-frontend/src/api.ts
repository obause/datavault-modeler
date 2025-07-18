import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface DataModel {
  id: string;
  name: string;
  description: string;
  version: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  nodes: ApiNode[];
  edges: ApiEdge[];
  // Enhanced Data Vault components
  hubs: any[];
  links: any[];
  satellites: any[];
  references: any[];
  point_in_times: any[];
  bridges: any[];
}

export interface ApiNode {
  id: string;
  model: string;
  type: "HUB" | "LNK" | "SAT" | "REF" | "PIT" | "BRIDGE";
  x: number;
  y: number;
  data: any;
  name: string;
  table_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ApiEdge {
  id: string;
  model: string;
  source: string;
  target: string;
  data: any;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  auto_save: boolean;
  auto_save_interval: number;
  snap_to_grid: boolean;
  grid_size: number;
  edge_type: 'bezier' | 'straight' | 'step' | 'smoothstep';
  floating_edges: boolean;
  edge_animation: boolean;
  show_connection_points: boolean;
  global_columns: GlobalColumn[];
  created_at: string;
  updated_at: string;
}

export interface GlobalColumn {
  id: string;
  name: string;
  dataType: string;
  markers: string[];
  description?: string;
  isRequired?: boolean;
  isEnabled?: boolean;
}

export interface UpdateSettings {
  theme?: 'light' | 'dark' | 'auto';
  auto_save?: boolean;
  auto_save_interval?: number;
  snap_to_grid?: boolean;
  grid_size?: number;
  edge_type?: 'bezier' | 'straight' | 'step' | 'smoothstep';
  floating_edges?: boolean;
  edge_animation?: boolean;
  show_connection_points?: boolean;
  global_columns?: GlobalColumn[];
}

// Types for creating nodes/edges (without model field)
export interface CreateApiNode {
  id: string;
  type: "HUB" | "LNK" | "SAT" | "REF" | "PIT" | "BRIDGE";
  x: number;
  y: number;
  data: any;
  name?: string;
  table_name?: string;
  description?: string;
}

export interface CreateApiEdge {
  id: string;
  source: string;
  target: string;
  data: any;
  name?: string;
  description?: string;
}

export interface CreateDataModel {
  name: string;
  description?: string;
  version?: string;
  tags?: string[];
  nodes?: CreateApiNode[];
  edges?: CreateApiEdge[];
}

export const modelAPI = {
  getAllModels: () => api.get<DataModel[]>("/models/"),
  getModel: (id: string) => api.get<DataModel>(`/models/${id}/`),
  createModel: (model: CreateDataModel) => api.post<DataModel>("/models/", model),
  updateModel: (id: string, model: Partial<CreateDataModel>) => api.put<DataModel>(`/models/${id}/`, model),
  deleteModel: (id: string) => api.delete(`/models/${id}/`),
};

export const settingsAPI = {
  getSettings: () => api.get<Settings>("/settings/"),
  updateSettings: (settings: UpdateSettings) => api.patch<Settings>("/settings/", settings),
  resetSettings: () => api.post<Settings>("/settings/reset/"),
}; 