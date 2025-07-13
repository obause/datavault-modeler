import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import { modelAPI, settingsAPI, type DataModel, type ApiNode, type ApiEdge, type Settings, type UpdateSettings } from "../api";
import { showNotification } from "./notificationStore";

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
  // Settings state
  settings: Settings | null;
  settingsLoading: boolean;
  settingsError: string | null;
  settingsPanelOpen: boolean;
  // Auto-save state
  autoSaveTimer: number | null;
  lastSaveTime: number | null;
  hasUnsavedChanges: boolean;
  setNodes: (changes: NodeChange[]) => void;
  setEdges: (changes: EdgeChange[]) => void;
  updateEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  updateNodeProperty: (nodeId: string, propertyKey: string, value: any) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
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
  // Settings actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: UpdateSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  openSettingsPanel: () => void;
  closeSettingsPanel: () => void;
  // Auto-save actions
  startAutoSave: () => void;
  stopAutoSave: () => void;
  triggerAutoSave: () => Promise<void>;
  markUnsavedChanges: () => void;
  // Edge update actions
  updateEdgeTypes: () => void;
  // Import actions
  importModel: (nodes: Node[], edges: Edge[], modelName: string) => void;
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
const transformEdgeFromApi = (apiEdge: ApiEdge, settings?: Settings | null): Edge => {
  const edgeType = settings?.edge_type || 'smoothstep';
  const isFloating = settings?.floating_edges ?? true;
  const isAnimated = settings?.edge_animation ?? true;
  
  return {
    id: apiEdge.id,
    source: apiEdge.source,
    target: apiEdge.target,
    type: isFloating ? 'floating' : edgeType,
    style: { stroke: '#2d2382', strokeWidth: 3, strokeDasharray: '5,5' },
    animated: isAnimated,
    data: apiEdge.data
  };
};

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
  // Settings state
  settings: null,
  settingsLoading: false,
  settingsError: null,
  settingsPanelOpen: false,
  // Auto-save state
  autoSaveTimer: null,
  lastSaveTime: null,
  hasUnsavedChanges: false,
  setNodes: (changes) =>
    set((state) => {
      const newState = { 
        nodes: applyNodeChanges(changes, state.nodes),
        hasUnsavedChanges: true
      };
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
      const newState = { 
        edges: applyEdgeChanges(changes, state.edges),
        hasUnsavedChanges: true
      };
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
      return { nodes: newNodes, edges: newEdges, hasUnsavedChanges: true };
    }),

  deleteEdge: (edgeId) =>
    set((state) => {
      const newEdges = state.edges.filter(edge => edge.id !== edgeId);
      persistModelState({
        nodes: state.nodes,
        edges: newEdges,
        currentModelId: state.currentModelId,
        currentModelName: state.currentModelName,
      });
      return { edges: newEdges, hasUnsavedChanges: true };
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
    
    // Determine if this is a manual save (user-initiated) vs auto-save
    const isAutoSave = modelName === "__AUTO_SAVE__";
    const finalModelName = isAutoSave ? currentModelName : (modelName || currentModelName);
    
    set({ isLoading: true, error: null });
    
    // Show loading notification for manual saves
    if (!isAutoSave) {
      showNotification.info("Saving...", "Saving model to server", 3000); // Auto-dismiss after 3 seconds
    }
    
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
      
      // If a new name is provided and we have an existing model, create a new model instead of updating
      const shouldCreateNew = modelName && modelName !== currentModelName && currentModelId;
      
      if (currentModelId && !shouldCreateNew) {
        // Update existing model
        const response = await modelAPI.updateModel(currentModelId, modelData);
        console.log("Model updated:", response.data);
        
        if (!isAutoSave) {
          showNotification.success("Model Updated", `"${finalModelName}" has been saved successfully`, 5000);
        }
      } else {
        // Create new model (either no existing model or save as with new name)
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
        
        if (!isAutoSave) {
          showNotification.success("Model Created", `"${finalModelName}" has been created successfully`, 5000);
        }
      }
      
      set({ hasUnsavedChanges: false, lastSaveTime: Date.now() });
      
      // Show auto-save notification for automatic saves
      if (isAutoSave) {
        showNotification.success("Auto-saved", "Model saved automatically", 2000); // Auto-dismiss after 2 seconds
      }
      
      console.log("Model saved successfully");
    } catch (error) {
      console.error("Error saving model:", error);
      set({ error: "Failed to save model" });
      
      if (!isAutoSave) {
        showNotification.error("Save Failed", "Failed to save the model to server", 8000);
      } else {
        showNotification.error("Auto-save failed", "Failed to automatically save the model", 5000);
      }
      throw error; // Re-throw for auto-save error handling
    } finally {
      set({ isLoading: false });
    }
  },

  loadModel: async (modelId) => {
    set({ isLoading: true, error: null });
    
    // Show loading notification
    showNotification.info("Loading...", "Loading model from server", 3000); // Auto-dismiss after 3 seconds
    
    try {
      const response = await modelAPI.getModel(modelId);
      const model = response.data;
      
      const transformedNodes = model.nodes.map(transformNodeFromApi);
      const transformedEdges = model.edges.map(apiEdge => transformEdgeFromApi(apiEdge, get().settings));
      
      const newState = {
        nodes: transformedNodes,
        edges: transformedEdges,
        currentModelId: model.id,
        currentModelName: model.name,
        hasUnsavedChanges: false, // Reset unsaved changes when loading
      };
      
      set(newState);
      
      // Persist the loaded model
      persistModelState({
        nodes: transformedNodes,
        edges: transformedEdges,
        currentModelId: model.id,
        currentModelName: model.name,
      });
      
      showNotification.success("Model Loaded", `"${model.name}" has been loaded successfully`, 5000);
      console.log("Model loaded successfully:", model.name);
    } catch (error) {
      console.error("Error loading model:", error);
      set({ error: "Failed to load model" });
      showNotification.error("Load Failed", "Failed to load the model from server", 8000);
    } finally {
      set({ isLoading: false });
    }
  },

  loadAvailableModels: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await modelAPI.getAllModels();
      set({ availableModels: response.data });
      console.log(`Loaded ${response.data.length} models from server`);
    } catch (error) {
      console.error("Error loading available models:", error);
      set({ error: "Failed to load available models" });
      showNotification.error("Load Failed", "Failed to load available models from server", 8000);
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
    const { currentModelId, availableModels } = get();
    
    // Find the model name for better notification
    const modelToDelete = availableModels.find(model => model.id === modelId);
    const modelName = modelToDelete?.name || "Unknown Model";
    
    set({ isLoading: true, error: null });
    
    // Show loading notification
    showNotification.info("Deleting...", `Deleting "${modelName}" from server`, 3000); // Auto-dismiss after 3 seconds
    
    try {
      await modelAPI.deleteModel(modelId);
      
      // If the deleted model was the current model, create a new one
      if (currentModelId === modelId) {
        const newState = {
          nodes: [],
          edges: [],
          currentModelId: null,
          currentModelName: "Untitled Model",
          hasUnsavedChanges: false,
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
      
      showNotification.success("Model Deleted", `"${modelName}" has been deleted successfully`, 5000);
      console.log("Model deleted successfully");
    } catch (error) {
      console.error("Error deleting model:", error);
      set({ error: "Failed to delete model" });
      showNotification.error("Delete Failed", `Failed to delete "${modelName}" from server`, 8000);
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

  // Settings actions
  loadSettings: async () => {
    set({ settingsLoading: true, settingsError: null });
    try {
      const response = await settingsAPI.getSettings();
      set({ settings: response.data, settingsLoading: false });
      
      // Start auto-save if enabled
      const { startAutoSave } = get();
      startAutoSave();
      
      console.log("Settings loaded successfully");
    } catch (error) {
      console.error("Error loading settings:", error);
      set({ settingsError: "Failed to load settings", settingsLoading: false });
      showNotification.error("Settings Load Failed", "Failed to load settings from server", 8000);
    }
  },
  updateSettings: async (settings) => {
    set({ settingsLoading: true, settingsError: null });
    
    // Show loading notification
    showNotification.info("Updating...", "Saving settings to server", 3000); // Auto-dismiss after 3 seconds
    
    try {
      const response = await settingsAPI.updateSettings(settings);
      set({ settings: response.data, settingsLoading: false });
      
      // Restart auto-save with new settings
      const { startAutoSave, stopAutoSave, updateEdgeTypes } = get();
      stopAutoSave();
      startAutoSave();
      
      // Update existing edges with new settings
      updateEdgeTypes();
      
      showNotification.success("Settings Saved", "Your preferences have been saved successfully", 5000);
      console.log("Settings updated:", response.data);
    } catch (error) {
      console.error("Error updating settings:", error);
      set({ settingsError: "Failed to update settings", settingsLoading: false });
      showNotification.error("Settings Update Failed", "Failed to save settings to server", 8000);
    }
  },
  resetSettings: async () => {
    set({ settingsLoading: true, settingsError: null });
    
    // Show loading notification
    showNotification.info("Resetting...", "Resetting settings to defaults", 3000); // Auto-dismiss after 3 seconds
    
    try {
      const response = await settingsAPI.resetSettings();
      set({ settings: response.data, settingsLoading: false });
      
      // Restart auto-save with reset settings
      const { startAutoSave, stopAutoSave, updateEdgeTypes } = get();
      stopAutoSave();
      startAutoSave();
      
      // Update existing edges with reset settings
      updateEdgeTypes();
      
      showNotification.success("Settings Reset", "All settings have been reset to defaults", 5000);
      console.log("Settings reset:", response.data);
    } catch (error) {
      console.error("Error resetting settings:", error);
      set({ settingsError: "Failed to reset settings", settingsLoading: false });
      showNotification.error("Settings Reset Failed", "Failed to reset settings on server", 8000);
    }
  },
  openSettingsPanel: () => {
    set({ settingsPanelOpen: true });
  },
  closeSettingsPanel: () => {
    set({ settingsPanelOpen: false });
  },
  
  // Auto-save actions
  startAutoSave: () => {
    const state = get();
    if (state.autoSaveTimer) {
      clearInterval(state.autoSaveTimer);
    }
    
    // Only start auto-save if settings are loaded and auto-save is enabled
    if (state.settings?.auto_save) {
      const interval = (state.settings.auto_save_interval || 30) * 1000; // Convert to milliseconds
      const timer = window.setInterval(() => {
        const currentState = get();
        if (currentState.hasUnsavedChanges) {
          currentState.triggerAutoSave();
        }
      }, interval);
      
      set({ autoSaveTimer: timer });
    }
  },
  
  stopAutoSave: () => {
    const state = get();
    if (state.autoSaveTimer) {
      clearInterval(state.autoSaveTimer);
      set({ autoSaveTimer: null });
    }
  },
  
  triggerAutoSave: async () => {
    const state = get();
    try {
      await state.saveModel("__AUTO_SAVE__"); // Special flag to indicate auto-save
      set({ 
        lastSaveTime: Date.now(), 
        hasUnsavedChanges: false 
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
      // Error notifications are handled in saveModel
    }
  },
  
  markUnsavedChanges: () => {
    set({ hasUnsavedChanges: true });
  },
  
  // Edge update actions
  updateEdgeTypes: () => {
    const state = get();
    if (!state.settings) return;
    
    const edgeType = state.settings.edge_type || 'smoothstep';
    const isFloating = state.settings.floating_edges ?? true;
    const isAnimated = state.settings.edge_animation ?? true;
    
    // Update existing edges with new settings
    const updatedEdges = state.edges.map(edge => {
      // Find the connected nodes to determine edge color
      const sourceNode = state.nodes.find(n => n.id === edge.source);
      const targetNode = state.nodes.find(n => n.id === edge.target);
      
      // Use satellite color if either node is a satellite
      const isSatelliteConnection = sourceNode?.data.type === 'SAT' || targetNode?.data.type === 'SAT';
      const edgeColor = isSatelliteConnection ? '#f59e0b' : '#2d2382';
      
      return {
        ...edge,
        type: isFloating ? 'floating' : edgeType,
        style: { stroke: edgeColor, strokeWidth: 3, strokeDasharray: '5,5' },
        animated: isAnimated,
      };
    });
    
    set({ edges: updatedEdges, hasUnsavedChanges: true });
    
    // Persist the updated edges
    persistModelState({
      nodes: state.nodes,
      edges: updatedEdges,
      currentModelId: state.currentModelId,
      currentModelName: state.currentModelName,
    });
  },
  
  // Import actions
  importModel: (nodes, edges, modelName) => {
    const state = get();
    
    // Stop auto-save during import
    state.stopAutoSave();
    
    // Update the model state with imported data
    const newState = {
      nodes,
      edges,
      currentModelId: null, // Reset model ID since this is a new import
      currentModelName: modelName,
      hasUnsavedChanges: true, // Mark as having unsaved changes
      error: null,
    };
    
    set(newState);
    
    // Persist the imported model
    persistModelState({
      nodes,
      edges,
      currentModelId: null,
      currentModelName: modelName,
    });
    
    // Restart auto-save
    state.startAutoSave();
    
    // Show success notification
    showNotification.success("Model Imported", `"${modelName}" has been imported successfully`, 5000);
    
    console.log(`Model "${modelName}" imported with ${nodes.length} nodes and ${edges.length} edges`);
  },
}));

export default useStore; 