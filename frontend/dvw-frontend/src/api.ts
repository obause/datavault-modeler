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
  created_at: string;
  nodes: ApiNode[];
  edges: ApiEdge[];
}

export interface ApiNode {
  id: string;
  model: string;
  type: "HUB" | "LNK" | "SAT";
  x: number;
  y: number;
  data: any;
}

export interface ApiEdge {
  id: string;
  model: string;
  source: string;
  target: string;
  data: any;
}

// Types for creating nodes/edges (without model field)
export interface CreateApiNode {
  id: string;
  type: "HUB" | "LNK" | "SAT";
  x: number;
  y: number;
  data: any;
}

export interface CreateApiEdge {
  id: string;
  source: string;
  target: string;
  data: any;
}

export interface CreateDataModel {
  name: string;
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