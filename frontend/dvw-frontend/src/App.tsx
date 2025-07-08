import React, { useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  type Connection,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useStore from "./store/modelStore";

function App() {
  const { nodes, edges, setNodes, setEdges, updateEdges, saveModel, addNode } = useStore();

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      updateEdges(newEdges);
    },
    [updateEdges, edges]
  );

  const onAddHubNode = useCallback(() => {
    const newNode = {
      id: `hub-${Date.now()}`,
      type: "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: "Hub Node",
        type: "HUB",
      },
      style: {
        background: "#3b82f6",
        color: "white",
        border: "2px solid #1e40af",
        borderRadius: "8px",
        padding: "10px",
      },
    };
    addNode(newNode);
  }, [addNode]);

  const onAddLinkNode = useCallback(() => {
    const newNode = {
      id: `link-${Date.now()}`,
      type: "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: "Link Node",
        type: "LNK",
      },
      style: {
        background: "#10b981",
        color: "white",
        border: "2px solid #047857",
        borderRadius: "8px",
        padding: "10px",
      },
    };
    addNode(newNode);
  }, [addNode]);

  const onAddSatelliteNode = useCallback(() => {
    const newNode = {
      id: `satellite-${Date.now()}`,
      type: "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: "Satellite Node",
        type: "SAT",
      },
      style: {
        background: "#f59e0b",
        color: "white",
        border: "2px solid #d97706",
        borderRadius: "8px",
        padding: "10px",
      },
    };
    addNode(newNode);
  }, [addNode]);

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Data Vault Modeler</h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={onAddHubNode}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Hub
            </button>
            <button
              onClick={onAddLinkNode}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Link
            </button>
            <button
              onClick={onAddSatelliteNode}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Add Satellite
            </button>
            <button
              onClick={saveModel}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mt-2"
            >
              Save Model
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default App;
