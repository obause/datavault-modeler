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
import React, { useCallback, useEffect } from 'react';
import useStore from './store/modelStore';
import Button from './components/Button';
import Card from './components/Card';
import Icon from './components/Icon';
import ModelManager from './components/ModelManager';
import DataVaultNode from './components/DataVaultNode';
import FloatingEdge from './components/FloatingEdge';
import PropertyPanel from './components/PropertyPanel';
import Settings from './components/Settings';
import NotificationContainer from './components/NotificationContainer';
import { snapToGrid } from './utils/snapToGrid';

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
    updateNodeProperty,
    settingsPanelOpen,
    openSettingsPanel,
    closeSettingsPanel,
    settings,
    loadSettings,
    updateEdgeTypes,
  } = useStore();

  // Load settings on app start
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update edge types when settings change
  useEffect(() => {
    if (settings) {
      updateEdgeTypes();
    }
  }, [settings, updateEdgeTypes]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Find the connected nodes to determine edge color
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      // Use satellite color if either node is a satellite
      const isSatelliteConnection = sourceNode?.data.type === 'SAT' || targetNode?.data.type === 'SAT';
      const edgeColor = isSatelliteConnection ? '#f59e0b' : '#2d2382';
      
      // Get edge settings
      const edgeType = settings?.edge_type || 'smoothstep';
      const isFloating = settings?.floating_edges ?? true;
      const isAnimated = settings?.edge_animation ?? true;
      
      // Create edge with proper UUID
      const newEdge: Edge = {
        id: crypto.randomUUID(),
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: isFloating ? 'floating' : edgeType,
        style: { stroke: edgeColor, strokeWidth: 3, strokeDasharray: '5,5' },
        animated: isAnimated,
      };
      const newEdges = [...edges, newEdge];
      updateEdges(newEdges);
    },
    [updateEdges, edges, nodes, settings]
  );

  const addNode = useCallback((type: 'HUB' | 'LNK' | 'SAT') => {
    const basePosition = { x: Math.random() * 500, y: Math.random() * 300 };
    
    // Apply snap to grid if enabled
    const position = settings?.snap_to_grid 
      ? snapToGrid(basePosition, settings.grid_size || 16)
      : basePosition;
    
    const newNode: Node = {
      id: crypto.randomUUID(),
      type: type.toLowerCase(),
      position,
      data: { 
        label: `${type} ${Date.now() % 1000}`,
        type: type,
      },
    };
    addNodeToStore(newNode);
  }, [addNodeToStore, settings]);

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

  // Get snap to grid settings
  const snapToGridEnabled = settings?.snap_to_grid || false;
  const gridSize = settings?.grid_size || 16;

  // Get edge settings
  const edgeType = settings?.edge_type || 'smoothstep';
  const isFloating = settings?.floating_edges ?? true;
  const isAnimated = settings?.edge_animation ?? true;

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
        snapToGrid={snapToGridEnabled}
        snapGrid={[gridSize, gridSize]}
        defaultEdgeOptions={{
          type: isFloating ? 'floating' : edgeType,
          style: { stroke: '#2d2382', strokeWidth: 3, strokeDasharray: '5,5' },
          animated: isAnimated,
        }}
      >
        <Background color="#e5e5e5" gap={gridSize} />
        <Controls className="bg-white border border-surface-200 rounded-lg shadow-sm" />
        <MiniMap 
          className="bg-white border border-surface-200 rounded-lg shadow-sm overflow-hidden"
          nodeColor={(node) => {
            if (node.data?.type === 'HUB') return '#2d2382';
            if (node.data?.type === 'LNK') return '#00aabe';
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

              {/* Settings */}
              <div className="pt-3 border-t border-surface-200">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={openSettingsPanel}
                  leftIcon={<Icon name="settings" size="sm" />}
                  fullWidth
                >
                  Settings
                </Button>
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

      {/* Settings Panel */}
      <Settings
        isOpen={settingsPanelOpen}
        onClose={closeSettingsPanel}
      />
      
      {/* Notification Container */}
      <NotificationContainer />
    </div>
  );
}

export default App;
