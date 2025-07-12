import { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { clsx } from 'clsx';
import Button from './Button';
import Icon from './Icon';
import useStore from '../store/modelStore';

interface DataVaultNodeData {
  label: string;
  type: 'HUB' | 'LNK' | 'SAT' | 'REF';
  description?: string;
  properties?: {
    [key: string]: any;
  };
  satelliteType?: 'standard' | 'multi-active' | 'effectivity' | 'record-tracking' | 'non-historized';
  referenceType?: 'table' | 'hub' | 'satellite';
}

interface DataVaultNodeProps {
  id: string;
  data: DataVaultNodeData;
  selected?: boolean;
}

const DataVaultNode = ({ id, data, selected }: DataVaultNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [showToolbar, setShowToolbar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { updateNodeData, deleteNode, cloneNode } = useStore();

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Show toolbar when node is selected
  useEffect(() => {
    setShowToolbar(selected || false);
  }, [selected]);

  const handleLabelSave = useCallback(() => {
    if (editValue.trim()) {
      updateNodeData(id, { ...data, label: editValue.trim() });
      setIsEditing(false);
    }
  }, [id, data, editValue, updateNodeData]);

  const handleLabelCancel = useCallback(() => {
    setEditValue(data.label);
    setIsEditing(false);
  }, [data.label]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSave();
    } else if (e.key === 'Escape') {
      handleLabelCancel();
    }
  }, [handleLabelSave, handleLabelCancel]);

  const handleDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  const handleClone = useCallback(() => {
    cloneNode(id);
  }, [id, cloneNode]);

  const handleRename = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Check if this is a transactional link
  const isTransactionalLink = data.type === 'LNK' && data.properties?.isTransactional === true;
  
  // Get hashkey property if available
  const hashkeyName = data.properties?.hashkeyName || data.properties?.hashdiffName;

  // Get satellite type from node data
  const satelliteType = data.properties?.satelliteType || 'standard';
  
  // Get reference type from node data
  const referenceType = data.properties?.referenceType || 'table';
  
  // Get node styling based on type and properties
  const getNodeStyle = (type: 'HUB' | 'LNK' | 'SAT' | 'REF', isTransactional: boolean = false, satType: string = 'standard', refType: string = 'table') => {
    const getSatelliteTitle = (satType: string) => {
      switch (satType) {
        case 'multi-active':
          return 'Multi-Active Satellite';
        case 'effectivity':
          return 'Effectivity Satellite';
        case 'record-tracking':
          return 'Record-Tracking Satellite';
        case 'non-historized':
          return 'Non-Historized Satellite';
        default:
          return 'Satellite';
      }
    };
    
    const getReferenceTitle = (refType: string) => {
      switch (refType) {
        case 'hub':
          return 'Reference Hub';
        case 'satellite':
          return 'Reference Satellite';
        default:
          return 'Reference Table';
      }
    };
    
    const styles = {
      HUB: {
        background: 'linear-gradient(135deg, #2d2382 0%, #1a1850 100%)',
        border: '2px solid #2d2382',
        color: 'white',
        icon: 'hub' as const,
        title: 'Hub',
      },
      LNK: {
        background: 'linear-gradient(135deg, #00aabe 0%, #0088a3 100%)',
        border: '2px solid #00aabe',
        color: 'white',
        icon: 'link' as const,
        title: isTransactional ? 'Non-historized Link' : 'Link',
      },
      SAT: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        border: '2px solid #f59e0b',
        color: 'white',
        icon: 'satellite' as const,
        title: getSatelliteTitle(satType),
      },
      REF: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        border: '2px solid #10b981',
        color: 'white',
        icon: 'archive' as const,
        title: getReferenceTitle(refType),
      },
    };
    return styles[type];
  };

  const nodeStyle = getNodeStyle(data.type, isTransactionalLink, satelliteType, referenceType);

  return (
    <div className="relative">
      {/* Connection Handles - visible for creating connections, floating edges handle positioning */}
      {data.type === 'SAT' && (
        // Satellite nodes: Only one connection point (to Links)
        <Handle 
          type="target" 
          position={Position.Top} 
          id="sat-input"
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white hover:!bg-orange-400 transition-colors"
        />
      )}
      
      {data.type === 'HUB' && (
        // Hub nodes: Multiple connection points (to Links)
        <>
          <Handle 
            type="source" 
            position={Position.Top} 
            id="hub-output-top"
            className="w-3 h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-400 transition-colors"
          />
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="hub-output-bottom"
            className="w-3 h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-400 transition-colors"
          />
          <Handle 
            type="source" 
            position={Position.Left} 
            id="hub-output-left"
            className="w-3 h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-400 transition-colors"
          />
          <Handle 
            type="source" 
            position={Position.Right} 
            id="hub-output-right"
            className="w-3 h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-400 transition-colors"
          />
        </>
      )}
      
      {data.type === 'LNK' && (
        // Link nodes: Multiple connection points (can connect to Hubs from any side, and to Satellites)
        <>
          <Handle 
            type="target" 
            position={Position.Top} 
            id="link-input-top"
            className="w-3 h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-400 transition-colors"
          />
          <Handle 
            type="target" 
            position={Position.Left} 
            id="link-input-left"
            className="w-3 h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-400 transition-colors"
          />
          <Handle 
            type="target" 
            position={Position.Bottom} 
            id="link-input-bottom"
            className="w-3 h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-400 transition-colors"
          />
          <Handle 
            type="target" 
            position={Position.Right} 
            id="link-input-right"
            className="w-3 h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-400 transition-colors"
          />
          <Handle 
            type="source" 
            position={Position.Top} 
            id="link-output-top"
            className="w-3 h-3 !bg-teal-500 !border-2 !border-white hover:!bg-teal-400 transition-colors"
          />
          <Handle 
            type="source" 
            position={Position.Left} 
            id="link-output-left"
            className="w-3 h-3 !bg-teal-500 !border-2 !border-white hover:!bg-teal-400 transition-colors"
          />
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="link-output-bottom"
            className="w-3 h-3 !bg-teal-500 !border-2 !border-white hover:!bg-teal-400 transition-colors"
          />
          <Handle 
            type="source" 
            position={Position.Right} 
            id="link-output-right"
            className="w-3 h-3 !bg-teal-500 !border-2 !border-white hover:!bg-teal-400 transition-colors"
          />
        </>
      )}
      
      {data.type === 'REF' && (
        // Reference nodes: Connection points depend on reference type
        <>
          {(referenceType === 'table' || referenceType === 'hub') && (
            // Reference Tables and Reference Hubs: Source handles (provide reference data)
            <>
              <Handle 
                type="source" 
                position={Position.Top} 
                id="ref-output-top"
                className="w-3 h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-400 transition-colors"
              />
              <Handle 
                type="source" 
                position={Position.Bottom} 
                id="ref-output-bottom"
                className="w-3 h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-400 transition-colors"
              />
              <Handle 
                type="source" 
                position={Position.Left} 
                id="ref-output-left"
                className="w-3 h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-400 transition-colors"
              />
              <Handle 
                type="source" 
                position={Position.Right} 
                id="ref-output-right"
                className="w-3 h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-400 transition-colors"
              />
            </>
          )}
          {referenceType === 'satellite' && (
            // Reference Satellites: Target handle (connected to reference hubs)
            <Handle 
              type="target" 
              position={Position.Top} 
              id="ref-sat-input"
              className="w-3 h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-400 transition-colors"
            />
          )}
        </>
      )}

      {/* Node Body */}
      <div 
        className={clsx(
          'px-4 rounded-lg shadow-md transition-all duration-200 min-w-[140px] cursor-pointer hover:shadow-lg relative',
          selected && 'ring-2 ring-primary-500 ring-offset-2',
          hashkeyName ? 'py-2 pb-6' : 'py-2'
        )}
        style={{
          background: nodeStyle.background,
          border: nodeStyle.border,
          color: nodeStyle.color,
        }}
      >
        {/* Node Content with Icon on Left */}
        <div className="flex items-center gap-3">
          {/* Left Icon */}
          <div className="flex-shrink-0 relative">
            <Icon name={nodeStyle.icon} size="xl" className="opacity-90" />
            {/* Transactional Link Indicator */}
            {isTransactionalLink && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-800">T</span>
              </div>
            )}
            {/* Satellite Type Indicators */}
            {data.type === 'SAT' && satelliteType !== 'standard' && (
              <div className="absolute -top-1 -right-1 w-6 h-4 bg-white/90 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-800">
                  {satelliteType === 'multi-active' && 'MA'}
                  {satelliteType === 'effectivity' && 'E'}
                  {satelliteType === 'record-tracking' && 'RTS'}
                  {satelliteType === 'non-historized' && 'NH'}
                </span>
              </div>
            )}
            {/* Reference Type Indicators */}
            {data.type === 'REF' && referenceType !== 'table' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-800">
                  {referenceType === 'hub' && 'H'}
                  {referenceType === 'satellite' && 'S'}
                </span>
              </div>
            )}
          </div>
          
          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Node Type */}
            <div className="text-xs font-light tracking-wide opacity-90 mb-1">
              {nodeStyle.title}
            </div>

            {/* Editable Label */}
            <div className="mb-1">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleLabelSave}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded px-2 py-1 text-sm font-medium text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/50"
                  placeholder="Enter node name"
                />
              ) : (
                <div
                  className="text-sm font-medium cursor-pointer hover:bg-white/10 rounded px-1 py-0.5 transition-colors"
                  onDoubleClick={() => setIsEditing(true)}
                  title="Double-click to edit"
                >
                  {data.label}
                </div>
              )}
            </div>

            {/* Description (if available) */}
            {data.description && (
              <div className="text-xs opacity-75 line-clamp-2">
                {data.description}
              </div>
            )}
          </div>
        </div>

        {/* Hashkey Display - bottom right */}
        {hashkeyName && (
          <div className="absolute bottom-1.5 right-2 text-xs font-light opacity-70">
            {hashkeyName}
          </div>
        )}
      </div>

      {/* Toolbar - appears when selected */}
      {showToolbar && !isEditing && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-surface-200 p-1 flex gap-1 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRename}
            title="Rename node"
            className="!p-1.5"
          >
            <Icon name="edit" size="md" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClone}
            title="Clone node"
            className="!p-1.5"
          >
            <Icon name="plus" size="md" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            title="Delete node"
            className="!p-1.5 hover:!bg-red-50 hover:!text-red-600"
          >
            <Icon name="trash" size="md" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataVaultNode; 