import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useCallback } from 'react';
import useStore from './store/modelStore';
import Button from './components/Button';
import Card from './components/Card';
import Icon from './components/Icon';
import ModelManager from './components/ModelManager';
import DataVaultNode from './components/DataVaultNode';
import FloatingEdge from './components/FloatingEdge';
import PropertyPanel from './components/PropertyPanel';

const nodeTypes = {
  hub: DataVaultNode,
  link: DataVaultNode,
  satellite: DataVaultNode,
  lnk: DataVaultNode,
  sat: DataVaultNode,
  HUB: DataVaultNode,
  LNK: DataVaultNode,
  SAT: DataVaultNode,
  default: DataVaultNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

function App() {
  const { 
    nodes, 
    edges, 
    setNodes, 
    setEdges, 
    updateEdges, 
    addNode: addNodeToStore, 
    currentModelName, 
    error,
    selectedNodeId,
    propertyPanelOpen,
    closePropertyPanel,
    updateNodeProperty
  } = useStore();

  const onConnect = useCallback(
    (params: Connection) => {
      // Create edge with proper UUID
      const newEdge: Edge = {
        id: crypto.randomUUID(),
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'floating',
        style: { stroke: '#2d2382', strokeWidth: 3, strokeDasharray: '5,5' },
        animated: true,
      };
      const newEdges = [...edges, newEdge];
      updateEdges(newEdges);
    },
    [updateEdges, edges]
  );

  const addNode = useCallback((type: 'HUB' | 'LNK' | 'SAT') => {
    const newNode: Node = {
      id: crypto.randomUUID(),
      type: type.toLowerCase(),
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: { 
        label: `${type} ${Date.now() % 1000}`,
        type: type,
      },
    };
    addNodeToStore(newNode);
  }, [addNodeToStore]);

  const onAddHubNode = useCallback(() => {
    addNode("HUB");
  }, [addNode]);

  const onAddLinkNode = useCallback(() => {
    addNode("LNK");
  }, [addNode]);

  const onAddSatelliteNode = useCallback(() => {
    addNode("SAT");
  }, [addNode]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // React Flow will handle the selection automatically
    // We just need to open the property panel
    const { openPropertyPanel } = useStore.getState();
    openPropertyPanel(node.id);
  }, []);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-surface-50 to-surface-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        className="bg-transparent"
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'floating',
          style: { stroke: '#2d2382', strokeWidth: 3, strokeDasharray: '5,5' },
          animated: true,
        }}
      >
        <Background color="#e5e5e5" gap={16} />
        <Controls className="bg-white border border-surface-200 rounded-lg shadow-sm" />
        <MiniMap 
          className="bg-white border border-surface-200 rounded-lg shadow-sm overflow-hidden"
          nodeColor={(node) => {
            if (node.data?.type === 'HUB') return '#2d2382';
            if (node.data?.type === 'LNK') return '#00aabe';
            if (node.data?.type === 'SAT') return '#4747ff';
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
      
      {/* Property Panel */}
      <PropertyPanel
        nodeId={selectedNodeId}
        nodeData={selectedNodeId ? nodes.find(node => node.id === selectedNodeId)?.data : null}
        isOpen={propertyPanelOpen}
        onClose={closePropertyPanel}
        onPropertyChange={updateNodeProperty}
        allNodes={nodes}
        allEdges={edges}
      />
    </div>
  );
}

export default App;
