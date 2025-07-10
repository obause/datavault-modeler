import { useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useStore from "./store/modelStore";
import ModelManager from "./components/ModelManager";
import Button from "./components/Button";
import Card from "./components/Card";
import Icon from "./components/Icon";

function App() {
  const { nodes, edges, setNodes, setEdges, updateEdges, addNode, currentModelName, error } = useStore();

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
        fontSize: "14px",
        fontWeight: "500",
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
        fontSize: "14px",
        fontWeight: "500",
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
        fontSize: "14px",
        fontWeight: "500",
      },
    };
    addNode(newNode);
  }, [addNode]);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-surface-50 to-surface-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
        onConnect={onConnect}
        fitView
        className="bg-transparent"
      >
        <Background color="#e5e5e5" gap={16} />
        <Controls className="bg-white border border-surface-200 rounded-lg shadow-sm" />
        <MiniMap 
          className="bg-white border border-surface-200 rounded-lg shadow-sm overflow-hidden"
          nodeColor={(node) => {
            if (node.data?.type === 'HUB') return '#3b82f6';
            if (node.data?.type === 'LNK') return '#10b981';
            if (node.data?.type === 'SAT') return '#f59e0b';
            return '#94a3b8';
          }}
        />
        
        <Panel position="top-left">
          <Card variant="elevated" className="w-72 min-w-0">
            <div className="space-y-4">
              {/* Header */}
              <div className="border-b border-surface-200 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-900 to-primary-800 rounded-lg flex items-center justify-center">
                    <Icon name="hub" size="sm" className="text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-surface-900">
                    Data Vault Modeler
                  </h1>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-surface-600">
                  <Icon name="folder" size="sm" />
                  <span className="font-medium truncate">{currentModelName}</span>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="close" size="sm" className="text-red-500 flex-shrink-0" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Node Creation */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">
                  Add Components
                </h2>
                
                <div className="space-y-2">
                  <Button
                    variant="hub"
                    size="md"
                    onClick={onAddHubNode}
                    leftIcon={<Icon name="hub" size="sm" />}
                    fullWidth
                  >
                    Add Hub
                  </Button>
                  
                  <Button
                    variant="link"
                    size="md"
                    onClick={onAddLinkNode}
                    leftIcon={<Icon name="link" size="sm" />}
                    fullWidth
                  >
                    Add Link
                  </Button>
                  
                  <Button
                    variant="satellite"
                    size="md"
                    onClick={onAddSatelliteNode}
                    leftIcon={<Icon name="satellite" size="sm" />}
                    fullWidth
                  >
                    Add Satellite
                  </Button>
                </div>
              </div>

              {/* Model Management */}
              <div className="pt-3 border-t border-surface-200">
                <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wide mb-3">
                  Model Management
                </h2>
                <ModelManager />
              </div>
            </div>
          </Card>
        </Panel>

        {/* Stats Panel */}
        <Panel position="top-right">
          <Card variant="glass" className="min-w-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-600">Nodes:</span>
                <span className="font-semibold text-surface-900">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-600">Edges:</span>
                <span className="font-semibold text-surface-900">{edges.length}</span>
              </div>
            </div>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default App;
