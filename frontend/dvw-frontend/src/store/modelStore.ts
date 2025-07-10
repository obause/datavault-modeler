import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import { modelAPI, type DataModel, type ApiNode, type ApiEdge } from "../api";

interface ModelState {
  nodes: Node[];
  edges: Edge[];
  currentModelId: string | null;
  currentModelName: string;
  availableModels: DataModel[];
  isLoading: boolean;
  error: string | null;
  setNodes: (changes: NodeChange[]) => void;
  setEdges: (changes: EdgeChange[]) => void;
  updateEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  saveModel: (modelName?: string) => Promise<void>;
  loadModel: (modelId: string) => Promise<void>;
  loadAvailableModels: () => Promise<void>;
  createNewModel: () => void;
  setModelName: (name: string) => void;
}

// Transform API node to React Flow format
const transformNodeFromApi = (apiNode: ApiNode): Node => ({
  id: apiNode.id,
  type: "default",
  position: { x: apiNode.x, y: apiNode.y },
  data: {
    label: apiNode.data.label || `${apiNode.type} Node`,
    type: apiNode.type,
    ...apiNode.data
  },
  style: getNodeStyle(apiNode.type),
});

// Get node styling based on type
const getNodeStyle = (type: "HUB" | "LNK" | "SAT") => {
  const styles = {
    HUB: {
      background: "#3b82f6",
      color: "white",
      border: "2px solid #1e40af",
      borderRadius: "8px",
      padding: "10px",
    },
    LNK: {
      background: "#10b981",
      color: "white",
      border: "2px solid #047857",
      borderRadius: "8px",
      padding: "10px",
    },
    SAT: {
      background: "#f59e0b",
      color: "white",
      border: "2px solid #d97706",
      borderRadius: "8px",
      padding: "10px",
    },
  };
  return styles[type];
};

// Transform API edge to React Flow format
const transformEdgeFromApi = (apiEdge: ApiEdge): Edge => ({
  id: apiEdge.id,
  source: apiEdge.source,
  target: apiEdge.target,
  data: apiEdge.data
});

const useStore = create<ModelState>((set, get) => ({
  nodes: [],
  edges: [],
  currentModelId: null,
  currentModelName: "Untitled Model",
  availableModels: [],
  isLoading: false,
  error: null,
  setNodes: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  setEdges: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  updateEdges: (edges) =>
    set({ edges }),
  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),
  
  setModelName: (name) => set({ currentModelName: name }),

  saveModel: async (modelName) => {
    const { nodes, edges, currentModelId, currentModelName } = get();
    const finalModelName = modelName || currentModelName;
    
    set({ isLoading: true, error: null });
    
    try {
      // Transform nodes and edges to API format
      const apiNodes = nodes.map(node => ({
        id: node.id,
        type: node.data.type as "HUB" | "LNK" | "SAT",
        x: node.position.x,
        y: node.position.y,
        data: {
          label: node.data.label,
          ...node.data
        }
      }));

      const apiEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: edge.data || {}
      }));

      const modelData = {
        name: finalModelName,
        nodes: apiNodes,
        edges: apiEdges,
      };
      
      if (currentModelId) {
        // Update existing model
        const response = await modelAPI.updateModel(currentModelId, modelData);
        console.log("Model updated:", response.data);
      } else {
        // Create new model
        const response = await modelAPI.createModel(modelData);
        
        const modelId = response.data.id;
        set({ currentModelId: modelId, currentModelName: finalModelName });
        console.log("New model created:", response.data);
      }
      
      console.log("Model saved successfully");
    } catch (error) {
      console.error("Error saving model:", error);
      set({ error: "Failed to save model" });
    } finally {
      set({ isLoading: false });
    }
  },

  loadModel: async (modelId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await modelAPI.getModel(modelId);
      const model = response.data;
      
      const transformedNodes = model.nodes.map(transformNodeFromApi);
      const transformedEdges = model.edges.map(transformEdgeFromApi);
      
      set({
        nodes: transformedNodes,
        edges: transformedEdges,
        currentModelId: model.id,
        currentModelName: model.name,
      });
      
      console.log("Model loaded successfully:", model.name);
    } catch (error) {
      console.error("Error loading model:", error);
      set({ error: "Failed to load model" });
    } finally {
      set({ isLoading: false });
    }
  },

  loadAvailableModels: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await modelAPI.getAllModels();
      set({ availableModels: response.data });
    } catch (error) {
      console.error("Error loading available models:", error);
      set({ error: "Failed to load available models" });
    } finally {
      set({ isLoading: false });
    }
  },

  createNewModel: () => {
    set({
      nodes: [],
      edges: [],
      currentModelId: null,
      currentModelName: "Untitled Model",
      error: null,
    });
  },
}));

export default useStore; 