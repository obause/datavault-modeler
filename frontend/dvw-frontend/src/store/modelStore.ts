import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import { modelAPI, type DataModel, type ApiNode, type ApiEdge } from "../api";

// localStorage key for persisting current model
const STORAGE_KEY = 'datavault-current-model';

// Interface for persisted model data
interface PersistedModelData {
  nodes: Node[];
  edges: Edge[];
  currentModelId: string | null;
  currentModelName: string;
  lastModified: number;
}

// Save current model state to localStorage
const persistModelState = (state: {
  nodes: Node[];
  edges: Edge[];
  currentModelId: string | null;
  currentModelName: string;
}) => {
  try {
    const persistedData: PersistedModelData = {
      ...state,
      lastModified: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData));
  } catch (error) {
    console.warn('Failed to persist model state:', error);
  }
};

// Load model state from localStorage
const loadPersistedModelState = (): Partial<PersistedModelData> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PersistedModelData;
      // Return the persisted state
      return {
        nodes: parsed.nodes || [],
        edges: parsed.edges || [],
        currentModelId: parsed.currentModelId,
        currentModelName: parsed.currentModelName || "Untitled Model",
      };
    }
  } catch (error) {
    console.warn('Failed to load persisted model state:', error);
  }
  return {};
};

// Clear persisted state
const clearPersistedModelState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear persisted model state:', error);
  }
};

interface ModelState {
  nodes: Node[];
  edges: Edge[];
  currentModelId: string | null;
  currentModelName: string;
  availableModels: DataModel[];
  isLoading: boolean;
  error: string | null;
  selectedNodeId: string | null;
  propertyPanelOpen: boolean;
  setNodes: (changes: NodeChange[]) => void;
  setEdges: (changes: EdgeChange[]) => void;
  updateEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  updateNodeProperty: (nodeId: string, propertyKey: string, value: any) => void;
  deleteNode: (nodeId: string) => void;
  cloneNode: (nodeId: string) => void;
  saveModel: (modelName?: string) => Promise<void>;
  loadModel: (modelId: string) => Promise<void>;
  loadAvailableModels: () => Promise<void>;
  createNewModel: () => void;
  setModelName: (name: string) => void;
  deleteModel: (modelId: string) => Promise<void>;
  openPropertyPanel: (nodeId: string) => void;
  closePropertyPanel: () => void;
  clearPersistedState: () => void;
}

// Transform API node to React Flow format
const transformNodeFromApi = (apiNode: ApiNode): Node => ({
  id: apiNode.id,
  type: apiNode.type.toLowerCase(),
  position: { x: apiNode.x, y: apiNode.y },
  data: {
    label: apiNode.data.label || `${apiNode.type} Node`,
    type: apiNode.type,
    ...apiNode.data
  },
});



// Transform API edge to React Flow format
const transformEdgeFromApi = (apiEdge: ApiEdge): Edge => ({
  id: apiEdge.id,
  source: apiEdge.source,
  target: apiEdge.target,
  type: 'floating',
  style: { stroke: '#2d2382', strokeWidth: 3, strokeDasharray: '5,5' },
  animated: true,
  data: apiEdge.data
});

// Load initial state from localStorage
const persistedState = loadPersistedModelState();

// Log if we loaded persisted data
if (persistedState.nodes && persistedState.nodes.length > 0) {
  console.log(`Restored model "${persistedState.currentModelName}" with ${persistedState.nodes.length} nodes and ${persistedState.edges?.length || 0} edges`);
} else if (persistedState.currentModelName && persistedState.currentModelName !== "Untitled Model") {
  console.log(`Restored model "${persistedState.currentModelName}" (empty)`);
}

const useStore = create<ModelState>((set, get) => ({
  // Initialize with persisted state or defaults
  nodes: persistedState.nodes || [],
  edges: persistedState.edges || [],
  currentModelId: persistedState.currentModelId || null,
  currentModelName: persistedState.currentModelName || "Untitled Model",
  availableModels: [],
  isLoading: false,
  error: null,
  selectedNodeId: null,
  propertyPanelOpen: false,
  setNodes: (changes) =>
    set((state) => {
      const newState = { nodes: applyNodeChanges(changes, state.nodes) };
      persistModelState({
        nodes: newState.nodes,
        edges: state.edges,
        currentModelId: state.currentModelId,
        currentModelName: state.currentModelName,
      });
      return newState;
    }),
  setEdges: (changes) =>
    set((state) => {
      const newState = { edges: applyEdgeChanges(changes, state.edges) };
      persistModelState({
        nodes: state.nodes,
        edges: newState.edges,
        currentModelId: state.currentModelId,
        currentModelName: state.currentModelName,
      });
      return newState;
    }),
  updateEdges: (edges) =>
    set((state) => {
      persistModelState({
        nodes: state.nodes,
        edges,
        currentModelId: state.currentModelId,
        currentModelName: state.currentModelName,
      });
      return { edges };
    }),
  addNode: (node) =>
    set((state) => {
      const newNodes = [...state.nodes, node];
      persistModelState({
        nodes: newNodes,
        edges: state.edges,
        currentModelId: state.currentModelId,
        currentModelName: state.currentModelName,
      });
      return { nodes: newNodes };
    }),
  
  updateNodeData: (nodeId, newData) =>
    set((state) => {
      const newNodes = state.nodes.map(node =>
        node.id === nodeId ? { ...node, data: newData } : node
      );
      persistModelState({
        nodes: newNodes,
        edges: state.edges,
        currentModelId: state.currentModelId,
        currentModelName: state.currentModelName,
      });
      return { nodes: newNodes };
    }),

  updateNodeProperty: (nodeId, propertyKey, value) =>
    set((state) => {
      const newNodes = state.nodes.map(node =>
        node.id === nodeId 
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                properties: { 
                  ...(node.data.properties || {}), 
                  [propertyKey]: value 
                } 
              } 
            } 
          : node
      );
      persistModelState({
        nodes: newNodes,
        edges: state.edges,
        currentModelId: state.currentModelId,
        currentModelName: state.currentModelName,
      });
      return { nodes: newNodes };
    }),

  deleteNode: (nodeId) =>
    set((state) => {
      const newNodes = state.nodes.filter(node => node.id !== nodeId);
      const newEdges = state.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      );
      persistModelState({
        nodes: newNodes,
        edges: newEdges,
        currentModelId: state.currentModelId,
        currentModelName: state.currentModelName,
      });
      return { nodes: newNodes, edges: newEdges };
    }),

  cloneNode: (nodeId) =>
    set((state) => {
      const nodeToClone = state.nodes.find(node => node.id === nodeId);
      if (!nodeToClone) return state;
      
      const newNode = {
        ...nodeToClone,
        id: crypto.randomUUID(),
        position: {
          x: nodeToClone.position.x + 50,
          y: nodeToClone.position.y + 50,
        },
        data: {
          ...nodeToClone.data,
          label: `${(nodeToClone.data as any)?.label || 'Node'} (Copy)`,
        },
      };
      
      const newNodes = [...state.nodes, newNode];
      persistModelState({
        nodes: newNodes,
        edges: state.edges,
        currentModelId: state.currentModelId,
        currentModelName: state.currentModelName,
      });
      return { nodes: newNodes };
    }),

  setModelName: (name) => 
    set((state) => {
      persistModelState({
        nodes: state.nodes,
        edges: state.edges,
        currentModelId: state.currentModelId,
        currentModelName: name,
      });
      return { currentModelName: name };
    }),

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
        const newState = { currentModelId: modelId, currentModelName: finalModelName };
        set(newState);
        
        // Persist the updated model ID
        persistModelState({
          nodes,
          edges,
          currentModelId: modelId,
          currentModelName: finalModelName,
        });
        
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
      
      const newState = {
        nodes: transformedNodes,
        edges: transformedEdges,
        currentModelId: model.id,
        currentModelName: model.name,
      };
      
      set(newState);
      
      // Persist the loaded model
      persistModelState({
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
    const newState = {
      nodes: [],
      edges: [],
      currentModelId: null,
      currentModelName: "Untitled Model",
      error: null,
    };
    
    set(newState);
    
    // Persist the new empty model
    persistModelState({
      nodes: [],
      edges: [],
      currentModelId: null,
      currentModelName: "Untitled Model",
    });
  },

  deleteModel: async (modelId) => {
    const { currentModelId } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      await modelAPI.deleteModel(modelId);
      
      // If the deleted model was the current model, create a new one
      if (currentModelId === modelId) {
        const newState = {
          nodes: [],
          edges: [],
          currentModelId: null,
          currentModelName: "Untitled Model",
        };
        
        set(newState);
        
        // Persist the new empty model
        persistModelState({
          nodes: [],
          edges: [],
          currentModelId: null,
          currentModelName: "Untitled Model",
        });
      }
      
      // Refresh the available models list
      const response = await modelAPI.getAllModels();
      set({ availableModels: response.data });
      
      console.log("Model deleted successfully");
    } catch (error) {
      console.error("Error deleting model:", error);
      set({ error: "Failed to delete model" });
    } finally {
      set({ isLoading: false });
    }
  },

  openPropertyPanel: (nodeId) => {
    set({ selectedNodeId: nodeId, propertyPanelOpen: true });
  },

  closePropertyPanel: () => {
    set({ selectedNodeId: null, propertyPanelOpen: false });
  },

  clearPersistedState: () => {
    clearPersistedModelState();
    console.log("Persisted model state cleared");
  },
}));

export default useStore; 