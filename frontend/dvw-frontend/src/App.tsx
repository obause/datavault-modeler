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
import React, { useCallback, useEffect, useState } from 'react';
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
import ExportDialog from './components/ExportDialog';
import ImportDialog from './components/ImportDialog';
import SplashScreen from './components/SplashScreen';
import AboutDialog from './components/AboutDialog';
import { snapToGrid } from './utils/snapToGrid';

const nodeTypes = {
  hub: DataVaultNode,
  link: DataVaultNode,
  satellite: DataVaultNode,
  lnk: DataVaultNode,
  sat: DataVaultNode,
  ref: DataVaultNode,
  pit: DataVaultNode,
  bridge: DataVaultNode,
  HUB: DataVaultNode,
  LNK: DataVaultNode,
  SAT: DataVaultNode,
  REF: DataVaultNode,
  PIT: DataVaultNode,
  BRIDGE: DataVaultNode,
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
    deleteEdge,
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
    importModel,
  } = useStore();

  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // About dialog state
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  
  // Loading state for splash screen
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadSettings();
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setIsLoading(false);
      }
    };
    
    initializeApp();
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
      
      // Determine edge color based on connected nodes
      const isSatelliteConnection = sourceNode?.data.type === 'SAT' || targetNode?.data.type === 'SAT';
      const isReferenceConnection = sourceNode?.data.type === 'REF' || targetNode?.data.type === 'REF';
      const isPitConnection = sourceNode?.data.type === 'PIT' || targetNode?.data.type === 'PIT';
      const isBridgeConnection = sourceNode?.data.type === 'BRIDGE' || targetNode?.data.type === 'BRIDGE';
      
      let edgeColor = '#2d2382'; // default blue
      if (isSatelliteConnection) {
        edgeColor = '#f59e0b'; // orange for satellite connections
      } else if (isReferenceConnection) {
        edgeColor = '#10b981'; // green for reference connections
      } else if (isPitConnection) {
        edgeColor = '#8b5cf6'; // violet for PIT connections
      } else if (isBridgeConnection) {
        edgeColor = '#9333ea'; // purple for bridge connections
      }
      
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

  const addNode = useCallback((type: 'HUB' | 'LNK' | 'SAT' | 'REF' | 'PIT' | 'BRIDGE') => {
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
        properties: type === 'SAT' ? { satelliteType: 'standard' } : 
                     type === 'REF' ? { referenceType: 'table' } : {},
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

  const onAddReferenceNode = useCallback(() => {
    addNode("REF");
  }, [addNode]);

  const onAddPitNode = useCallback(() => {
    addNode("PIT");
  }, [addNode]);

  const onAddBridgeNode = useCallback(() => {
    addNode("BRIDGE");
  }, [addNode]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // React Flow will handle the selection automatically
    // We just need to open the property panel
    const { openPropertyPanel } = useStore.getState();
    openPropertyPanel(node.id);
  }, []);

  const handleImport = useCallback((importedNodes: Node[], importedEdges: Edge[], modelName: string) => {
    importModel(importedNodes, importedEdges, modelName);
  }, [importModel]);

  // Handle keyboard events for edge deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedEdge = edges.find(edge => edge.selected);
        if (selectedEdge) {
          event.preventDefault();
          deleteEdge(selectedEdge.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [edges, deleteEdge]);

  // Get snap to grid settings
  const snapToGridEnabled = settings?.snap_to_grid || false;
  const gridSize = settings?.grid_size || 16;

  // Get edge settings
  const edgeType = settings?.edge_type || 'smoothstep';
  const isFloating = settings?.floating_edges ?? true;
  const isAnimated = settings?.edge_animation ?? true;

  return (
    <>
      <SplashScreen isLoading={isLoading} />
      <div className="w-screen h-screen bg-gradient-to-br from-surface-50 to-surface-100">
        <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeDoubleClick={(event, edge) => {
          event.stopPropagation();
          deleteEdge(edge.id);
        }}
        fitView
        className="bg-transparent"
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={snapToGridEnabled}
        snapGrid={[gridSize, gridSize]}
        elementsSelectable={true}
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
            if (node.data?.type === 'REF') return '#10b981';
            if (node.data?.type === 'PIT') return '#8b5cf6';
            if (node.data?.type === 'BRIDGE') return '#9333ea';
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
                  
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onAddReferenceNode}
                    leftIcon={<Icon name="archive" size="sm" />}
                    fullWidth
                    className="!bg-green-600 hover:!bg-green-700 !text-white !border-green-600"
                  >
                    Add Reference Data
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onAddPitNode}
                    leftIcon={<Icon name="pit" size="sm" />}
                    fullWidth
                    className="!bg-violet-500 hover:!bg-violet-600 !text-white !border-violet-500"
                  >
                    Add PIT Table
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onAddBridgeNode}
                    leftIcon={<Icon name="bridge" size="sm" />}
                    fullWidth
                    className="!bg-violet-600 hover:!bg-violet-700 !text-white !border-violet-600"
                  >
                    Add Bridge Table
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

              {/* Export/Import */}
              <div className="pt-3 border-t border-surface-200 space-y-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setExportDialogOpen(true)}
                  leftIcon={<Icon name="download" size="sm" />}
                  fullWidth
                >
                  Export Model
                </Button>
                
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setImportDialogOpen(true)}
                  leftIcon={<Icon name="upload" size="sm" />}
                  fullWidth
                >
                  Import Model
                </Button>
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
      
      {/* About Button - Bottom of Page */}
      <div className="fixed bottom-4 left-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAboutDialogOpen(true)}
          className="bg-white/80 backdrop-blur-sm border border-surface-200 shadow-sm hover:bg-white/90"
        >
          <Icon name="info" size="sm" className="text-surface-600" />
        </Button>
      </div>
      
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
      
      {/* Export Dialog */}
      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        nodes={nodes}
        edges={edges}
        currentModelName={currentModelName}
      />
      
      {/* Import Dialog */}
      <ImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />
      
      {/* About Dialog */}
      <AboutDialog
        isOpen={aboutDialogOpen}
        onClose={() => setAboutDialogOpen(false)}
      />
      
      {/* Notification Container */}
      <NotificationContainer />
    </div>
    </>
  );
}

export default App;
