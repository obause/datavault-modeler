import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";

interface ModelState {
  nodes: Node[];
  edges: Edge[];
  setNodes: (changes: NodeChange[]) => void;
  setEdges: (changes: EdgeChange[]) => void;
  updateEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  saveModel: () => void;
  loadModel: (modelId: string) => void;
}

const useStore = create<ModelState>((set, get) => ({
  nodes: [],
  edges: [],
  setNodes: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  setEdges: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  updateEdges: (edges) =>
    set({ edges }),
  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),
  saveModel: () => {
    const { nodes, edges } = get();
    console.log("Saving model:", { nodes, edges });
    // TODO: Implement API call to save model
  },
  loadModel: (modelId) => {
    console.log("Loading model:", modelId);
    // TODO: Implement API call to load model
  },
}));

export default useStore; 