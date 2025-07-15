// Column definition types for Data Vault nodes
export interface ColumnDefinition {
  id: string;
  name: string;
  dataType: string;
  markers: ColumnMarker[];
  description?: string;
  isRequired?: boolean;
  isGlobal?: boolean; // If this column is added to all nodes globally
}

export interface ColumnMarker {
  type: 'PK' | 'BK' | 'FK' | 'NK' | 'HK' | 'HD' | 'LDTS' | 'RSRC' | 'RTS' | 'RTE' | 'CDC' | 'DEL';
  label: string;
  color: string;
  description: string;
}

export interface NodeTypeColumns {
  [nodeType: string]: ColumnDefinition[];
}

// Column marker definitions
export const COLUMN_MARKERS: Record<string, ColumnMarker> = {
  PK: { type: 'PK', label: 'PK', color: '#dc2626', description: 'Primary Key' },
  BK: { type: 'BK', label: 'BK', color: '#2563eb', description: 'Business Key' },
  FK: { type: 'FK', label: 'FK', color: '#7c3aed', description: 'Foreign Key' },
  NK: { type: 'NK', label: 'NK', color: '#059669', description: 'Natural Key' },
  HK: { type: 'HK', label: 'HK', color: '#ea580c', description: 'Hash Key' },
  HD: { type: 'HD', label: 'HD', color: '#0891b2', description: 'Hash Diff' },
  LDTS: { type: 'LDTS', label: 'LDTS', color: '#65a30d', description: 'Load Date Timestamp' },
  RSRC: { type: 'RSRC', label: 'RSRC', color: '#7c2d12', description: 'Record Source' },
  RTS: { type: 'RTS', label: 'RTS', color: '#be185d', description: 'Record Timestamp' },
  RTE: { type: 'RTE', label: 'RTE', color: '#9333ea', description: 'Record End Timestamp' },
  CDC: { type: 'CDC', label: 'CDC', color: '#c2410c', description: 'Change Data Capture' },
  DEL: { type: 'DEL', label: 'DEL', color: '#b91c1c', description: 'Delete Indicator' }
};

// Global columns that appear in all nodes (configurable in settings)
export const DEFAULT_GLOBAL_COLUMNS: ColumnDefinition[] = [
  {
    id: 'record_source',
    name: 'record_source',
    dataType: 'VARCHAR(100)',
    markers: [COLUMN_MARKERS.RSRC],
    description: 'Source system identifier',
    isRequired: true,
    isGlobal: true
  },
  {
    id: 'load_date',
    name: 'load_date',
    dataType: 'TIMESTAMP',
    markers: [COLUMN_MARKERS.LDTS],
    description: 'Date when record was loaded',
    isRequired: true,
    isGlobal: true
  }
];

// Default column configurations for each node type
export const DEFAULT_NODE_TYPE_COLUMNS: NodeTypeColumns = {
  HUB: [
    {
      id: 'hub_hashkey',
      name: 'hub_hashkey',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.HK],
      description: 'Hub hash key (primary key)',
      isRequired: true
    },
    {
      id: 'business_key',
      name: 'business_key',
      dataType: 'VARCHAR(100)',
      markers: [COLUMN_MARKERS.BK, COLUMN_MARKERS.NK],
      description: 'Natural business key',
      isRequired: true
    }
  ],
  LNK: [
    {
      id: 'link_hashkey',
      name: 'link_hashkey',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.HK],
      description: 'Link hash key (primary key)',
      isRequired: true
    },
    {
      id: 'hub1_hashkey',
      name: 'hub1_hashkey',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
      description: 'First hub hash key (foreign key)',
      isRequired: true
    },
    {
      id: 'hub2_hashkey',
      name: 'hub2_hashkey',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
      description: 'Second hub hash key (foreign key)',
      isRequired: true
    }
  ],
  SAT: [
    {
      id: 'parent_hashkey',
      name: 'parent_hashkey',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
      description: 'Parent hub/link hash key',
      isRequired: true
    },
    {
      id: 'effective_from',
      name: 'effective_from',
      dataType: 'TIMESTAMP',
      markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.LDTS],
      description: 'Effective from timestamp',
      isRequired: true
    },
    {
      id: 'hashdiff',
      name: 'hashdiff',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.HD],
      description: 'Hash difference for change detection',
      isRequired: true
    },
    {
      id: 'effective_to',
      name: 'effective_to',
      dataType: 'TIMESTAMP',
      markers: [COLUMN_MARKERS.RTE],
      description: 'Effective to timestamp',
      isRequired: false
    }
  ],
  REF: [
    {
      id: 'reference_key',
      name: 'reference_key',
      dataType: 'VARCHAR(100)',
      markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.NK],
      description: 'Reference data key',
      isRequired: true
    },
    {
      id: 'reference_value',
      name: 'reference_value',
      dataType: 'VARCHAR(255)',
      markers: [],
      description: 'Reference data value',
      isRequired: true
    }
  ],
  PIT: [
    {
      id: 'snapshot_date',
      name: 'snapshot_date',
      dataType: 'DATE',
      markers: [COLUMN_MARKERS.PK],
      description: 'Point-in-time snapshot date',
      isRequired: true
    },
    {
      id: 'hub_hashkey',
      name: 'hub_hashkey',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
      description: 'Hub hash key',
      isRequired: true
    }
  ],
  BRIDGE: [
    {
      id: 'bridge_hashkey',
      name: 'bridge_hashkey',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.HK],
      description: 'Bridge hash key (primary key)',
      isRequired: true
    },
    {
      id: 'hub1_hashkey',
      name: 'hub1_hashkey',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
      description: 'First hub hash key',
      isRequired: true
    },
    {
      id: 'hub2_hashkey',
      name: 'hub2_hashkey',
      dataType: 'BINARY(20)',
      markers: [COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
      description: 'Second hub hash key',
      isRequired: true
    },
    {
      id: 'effective_from',
      name: 'effective_from',
      dataType: 'TIMESTAMP',
      markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.LDTS],
      description: 'Effective from timestamp',
      isRequired: true
    }
  ]
};

// Helper function to get all columns for a node type (global + specific)
export const getNodeTypeColumns = (nodeType: string, globalColumns: ColumnDefinition[]): ColumnDefinition[] => {
  const specificColumns = DEFAULT_NODE_TYPE_COLUMNS[nodeType] || [];
  return [...globalColumns, ...specificColumns];
};

// Dynamic column generation based on actual node properties and connections
export const generateNodeColumns = (
  nodeId: string,
  nodeData: any,
  nodeType: string,
  globalColumns: ColumnDefinition[],
  allNodes: any[] = [],
  allEdges: any[] = []
): ColumnDefinition[] => {
  const columns: ColumnDefinition[] = [];
  const properties = nodeData.properties || {};

  // Add global columns first (excluding load_date for PIT and BRIDGE)
  if (!['PIT', 'BRIDGE'].includes(nodeType)) {
    columns.push(...globalColumns);
  } else {
    // PIT and BRIDGE only get record_source, not load_date
    columns.push(...globalColumns.filter(col => col.id !== 'load_date'));
  }

  switch (nodeType) {
    case 'HUB':
      // Hub hashkey
      const hubHashkeyName = properties.hashkeyName || `hk_${nodeData.label.toLowerCase().replace(/\s+/g, '_')}_h`;
      columns.push({
        id: 'hub_hashkey',
        name: hubHashkeyName,
        dataType: 'BINARY(20)',
        markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.HK],
        description: 'Hub hash key (primary key)',
        isRequired: true
      });
      
      // Business keys
      if (properties.businessKeys && Array.isArray(properties.businessKeys) && properties.businessKeys.length > 0) {
        properties.businessKeys.forEach((bk: string, index: number) => {
          columns.push({
            id: `business_key_${index}`,
            name: bk,
            dataType: 'VARCHAR(100)',
            markers: [COLUMN_MARKERS.BK, COLUMN_MARKERS.NK],
            description: `Business key ${index + 1}`,
            isRequired: true
          });
        });
      } else {
        // Add generic business key if none defined
        columns.push({
          id: 'business_key',
          name: 'business_key',
          dataType: 'VARCHAR(100)',
          markers: [COLUMN_MARKERS.BK, COLUMN_MARKERS.NK],
          description: 'Natural business key',
          isRequired: true
        });
      }
      break;

    case 'LNK':
      // Link hashkey
      const linkHashkeyName = properties.hashkeyName || `hk_${nodeData.label.toLowerCase().replace(/\s+/g, '_')}_l`;
      columns.push({
        id: 'link_hashkey',
        name: linkHashkeyName,
        dataType: 'BINARY(20)',
        markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.HK],
        description: 'Link hash key (primary key)',
        isRequired: true
      });

      // Connected hub hashkeys
      const connectedHubs = getConnectedHubs(nodeId, allNodes, allEdges);
      if (connectedHubs.length > 0) {
        connectedHubs.forEach((hub, index) => {
          const hubHashkey = hub.properties?.hashkeyName || `hk_${hub.label.toLowerCase().replace(/\s+/g, '_')}_h`;
          columns.push({
            id: `hub_hashkey_${index}`,
            name: hubHashkey,
            dataType: 'BINARY(20)',
            markers: [COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
            description: `${hub.label} hash key (foreign key)`,
            isRequired: true
          });
        });
      } else {
        // Add placeholder hub hashkeys if no hubs connected
        ['hk_hub1_h', 'hk_hub2_h'].forEach((hashkey, index) => {
          columns.push({
            id: `hub_hashkey_${index}`,
            name: hashkey,
            dataType: 'BINARY(20)',
            markers: [COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
            description: `Hub ${index + 1} hash key (foreign key)`,
            isRequired: true
          });
        });
      }

      // Attributes for transactional links
      if (properties.isTransactional && properties.attributes && Array.isArray(properties.attributes)) {
        properties.attributes.forEach((attr: string, index: number) => {
          columns.push({
            id: `attribute_${index}`,
            name: attr,
            dataType: 'VARCHAR(255)',
            markers: [],
            description: `Transactional attribute: ${attr}`,
            isRequired: false
          });
        });
      }
      break;

    case 'SAT':
      // Parent hashkey from connected hub/link
      const parentNode = getConnectedParent(nodeId, allNodes, allEdges);
      if (parentNode) {
        // Use configured hashkey name or generate placeholder based on parent type
        let parentHashkey;
        if (parentNode.properties?.hashkeyName) {
          parentHashkey = parentNode.properties.hashkeyName;
        } else if (parentNode.type === 'HUB') {
          parentHashkey = `hk_${parentNode.label.toLowerCase().replace(/\s+/g, '_')}_h`;
        } else if (parentNode.type === 'LNK') {
          parentHashkey = `hk_${parentNode.label.toLowerCase().replace(/\s+/g, '_')}_l`;
        } else {
          parentHashkey = `${parentNode.label.toLowerCase().replace(/\s+/g, '_')}_hashkey`;
        }
        columns.push({
          id: 'parent_hashkey',
          name: parentHashkey,
          dataType: 'BINARY(20)',
          markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
          description: `Parent ${parentNode.type.toLowerCase()} hash key`,
          isRequired: true
        });
      } else {
        // Add generic parent hashkey if no parent connected
        columns.push({
          id: 'parent_hashkey',
          name: 'hk_parent_h',
          dataType: 'BINARY(20)',
          markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
          description: 'Parent hub/link hash key',
          isRequired: true
        });
      }

      // Satellite type specific columns
      const satelliteType = properties.satelliteType || 'standard';
      
      if (satelliteType === 'effectivity') {
        // Effectivity satellite
        if (properties.effectiveFromColumn) {
          columns.push({
            id: 'effective_from',
            name: properties.effectiveFromColumn,
            dataType: 'TIMESTAMP',
            markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.LDTS],
            description: 'Effective from timestamp',
            isRequired: true
          });
        }
        if (properties.effectiveToColumn) {
          columns.push({
            id: 'effective_to',
            name: properties.effectiveToColumn,
            dataType: 'TIMESTAMP',
            markers: [COLUMN_MARKERS.RTE],
            description: 'Effective to timestamp',
            isRequired: false
          });
        }
      } else if (satelliteType === 'record-tracking') {
        // Record tracking satellite
        if (properties.isDeletedColumn) {
          columns.push({
            id: 'is_deleted',
            name: properties.isDeletedColumn,
            dataType: 'BOOLEAN',
            markers: [COLUMN_MARKERS.DEL],
            description: 'Deletion tracking flag',
            isRequired: true
          });
        }
      } else if (satelliteType !== 'non-historized') {
        // Standard and multi-active satellites
        const hashdiffName = properties.hashdiffName || `hd_${nodeData.label.toLowerCase().replace(/\s+/g, '_')}_s`;
        columns.push({
          id: 'hashdiff',
          name: hashdiffName,
          dataType: 'BINARY(20)',
          markers: [COLUMN_MARKERS.HD],
          description: 'Hash difference for change detection',
          isRequired: true
        });
        
        // Note: Standard and multi-active satellites do NOT have effective_from columns
        // Only effectivity satellites have effective_from/effective_to columns
      }

      // Multi-active key
      if (satelliteType === 'multi-active' && properties.multiActiveKey) {
        columns.push({
          id: 'multi_active_key',
          name: properties.multiActiveKey,
          dataType: 'VARCHAR(100)',
          markers: [COLUMN_MARKERS.PK],
          description: 'Multi-active key',
          isRequired: true
        });
      }

      // Attributes
      if (properties.attributes && Array.isArray(properties.attributes)) {
        properties.attributes.forEach((attr: string, index: number) => {
          columns.push({
            id: `attribute_${index}`,
            name: attr,
            dataType: 'VARCHAR(255)',
            markers: [],
            description: `Satellite attribute: ${attr}`,
            isRequired: false
          });
        });
      }
      break;

    case 'REF':
      const refType = properties.referenceType || 'table';
      
      // Reference keys
      if (properties.referenceKeys && Array.isArray(properties.referenceKeys) && properties.referenceKeys.length > 0) {
        properties.referenceKeys.forEach((key: string, index: number) => {
          columns.push({
            id: `reference_key_${index}`,
            name: key,
            dataType: 'VARCHAR(100)',
            markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.NK],
            description: `Reference key ${index + 1}`,
            isRequired: true
          });
        });
      } else {
        // Add generic reference key if none defined
        columns.push({
          id: 'reference_key',
          name: 'reference_key',
          dataType: 'VARCHAR(100)',
          markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.NK],
          description: 'Reference data key',
          isRequired: true
        });
      }

      // Reference satellite specific
      if (refType === 'satellite') {
        const refHashdiffName = properties.hashdiffName || `hd_${nodeData.label.toLowerCase().replace(/\s+/g, '_')}_s`;
        columns.push({
          id: 'hashdiff',
          name: refHashdiffName,
          dataType: 'BINARY(20)',
          markers: [COLUMN_MARKERS.HD],
          description: 'Hash difference for change detection',
          isRequired: true
        });
      }

      // Descriptive attributes
      if (properties.descriptiveAttributes && Array.isArray(properties.descriptiveAttributes)) {
        properties.descriptiveAttributes.forEach((attr: string, index: number) => {
          columns.push({
            id: `descriptive_attr_${index}`,
            name: attr,
            dataType: 'VARCHAR(255)',
            markers: [],
            description: `Descriptive attribute: ${attr}`,
            isRequired: false
          });
        });
      }
      break;

    case 'PIT':
      // Dimension key
      const dimensionKeyName = properties.dimensionKeyName || `${nodeData.label.toLowerCase().replace(/\s+/g, '_')}_key`;
      columns.push({
        id: 'dimension_key',
        name: dimensionKeyName,
        dataType: 'BIGINT',
        markers: [COLUMN_MARKERS.PK],
        description: 'Dimension key',
        isRequired: true
      });

      // Hub/Link hashkey
      const pitParent = getConnectedParent(nodeId, allNodes, allEdges);
      if (pitParent) {
        let parentHashkey;
        if (pitParent.properties?.hashkeyName) {
          parentHashkey = pitParent.properties.hashkeyName;
        } else if (pitParent.type === 'HUB') {
          parentHashkey = `hk_${pitParent.label.toLowerCase().replace(/\s+/g, '_')}_h`;
        } else if (pitParent.type === 'LNK') {
          parentHashkey = `hk_${pitParent.label.toLowerCase().replace(/\s+/g, '_')}_l`;
        } else {
          parentHashkey = `${pitParent.label.toLowerCase().replace(/\s+/g, '_')}_hashkey`;
        }
        columns.push({
          id: 'parent_hashkey',
          name: parentHashkey,
          dataType: 'BINARY(20)',
          markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
          description: `${pitParent.type} hash key`,
          isRequired: true
        });
      } else {
        // Add generic parent hashkey if no parent connected
        columns.push({
          id: 'parent_hashkey',
          name: 'hk_hub_h',
          dataType: 'BINARY(20)',
          markers: [COLUMN_MARKERS.PK, COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
          description: 'Parent hub/link hash key',
          isRequired: true
        });
      }

      // Snapshot date
      const snapshotDateName = properties.snapshotDateColumn || 'snapshot_date';
      columns.push({
        id: 'snapshot_date',
        name: snapshotDateName,
        dataType: 'DATE',
        markers: [COLUMN_MARKERS.PK],
        description: 'Point-in-time snapshot date',
        isRequired: true
      });

      // Satellite columns (ldts and rsrc for each connected satellite)
      const connectedSatellites = getConnectedSatellites(pitParent?.id, allNodes, allEdges);
      connectedSatellites.forEach((sat) => {
        const satName = sat.label.toLowerCase().replace(/\s+/g, '_');
        columns.push({
          id: `sat_${satName}_ldts`,
          name: `sat_${satName}_ldts`,
          dataType: 'TIMESTAMP',
          markers: [COLUMN_MARKERS.LDTS],
          description: `${sat.label} load date timestamp`,
          isRequired: false
        });
        columns.push({
          id: `sat_${satName}_rsrc`,
          name: `sat_${satName}_rsrc`,
          dataType: 'VARCHAR(100)',
          markers: [COLUMN_MARKERS.RSRC],
          description: `${sat.label} record source`,
          isRequired: false
        });
      });
      break;

    case 'BRIDGE':
      // Connected hub/link hashkeys
      const connectedNodes = getConnectedNodes(nodeId, allNodes, allEdges);
      if (connectedNodes.length > 0) {
        connectedNodes.forEach((node, index) => {
          let hashkey;
          if (node.properties?.hashkeyName) {
            hashkey = node.properties.hashkeyName;
          } else if (node.type === 'HUB') {
            hashkey = `hk_${node.label.toLowerCase().replace(/\s+/g, '_')}_h`;
          } else if (node.type === 'LNK') {
            hashkey = `hk_${node.label.toLowerCase().replace(/\s+/g, '_')}_l`;
          } else {
            hashkey = `${node.label.toLowerCase().replace(/\s+/g, '_')}_hashkey`;
          }
          columns.push({
            id: `node_hashkey_${index}`,
            name: hashkey,
            dataType: 'BINARY(20)',
            markers: [COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
            description: `${node.label} hash key`,
            isRequired: true
          });
        });
      } else {
        // Add placeholder node hashkeys if no nodes connected
        ['hk_hub1_h', 'hk_hub2_h'].forEach((hashkey, index) => {
          columns.push({
            id: `node_hashkey_${index}`,
            name: hashkey,
            dataType: 'BINARY(20)',
            markers: [COLUMN_MARKERS.FK, COLUMN_MARKERS.HK],
            description: `Node ${index + 1} hash key`,
            isRequired: true
          });
        });
      }

      // Snapshot date
      const bridgeSnapshotDateName = properties.snapshotDateColumn || 'snapshot_date';
      columns.push({
        id: 'snapshot_date',
        name: bridgeSnapshotDateName,
        dataType: 'DATE',
        markers: [COLUMN_MARKERS.PK],
        description: 'Bridge snapshot date',
        isRequired: true
      });

      // Computed attributes
      if (properties.computedAttributes && Array.isArray(properties.computedAttributes)) {
        properties.computedAttributes.forEach((attr: string, index: number) => {
          columns.push({
            id: `computed_attr_${index}`,
            name: attr,
            dataType: 'VARCHAR(255)',
            markers: [],
            description: `Computed attribute: ${attr}`,
            isRequired: false
          });
        });
      }
      break;
  }

  return columns;
};

// Helper functions for node connections
function getConnectedHubs(nodeId: string, allNodes: any[], allEdges: any[]): any[] {
  const connectedNodeIds = allEdges
    .filter(edge => edge.source === nodeId || edge.target === nodeId)
    .map(edge => edge.source === nodeId ? edge.target : edge.source);
  
  const connectedHubs = allNodes.filter(node => 
    connectedNodeIds.includes(node.id) && node.data.type === 'HUB'
  ).map(node => node.data);
  
  return connectedHubs;
}

function getConnectedParent(nodeId: string, allNodes: any[], allEdges: any[]): any | null {
  const connectedNodeIds = allEdges
    .filter(edge => edge.target === nodeId) // Node is target, so source is parent
    .map(edge => edge.source);
  
  const parentNode = allNodes.find(node => 
    connectedNodeIds.includes(node.id) && ['HUB', 'LNK'].includes(node.data.type)
  );
  
  return parentNode?.data || null;
}

function getConnectedSatellites(parentNodeId: string | undefined, allNodes: any[], allEdges: any[]): any[] {
  if (!parentNodeId) return [];
  
  const connectedNodeIds = allEdges
    .filter(edge => edge.source === parentNodeId) // Parent is source, satellites are targets
    .map(edge => edge.target);
  
  return allNodes
    .filter(node => 
      connectedNodeIds.includes(node.id) && node.data.type === 'SAT'
    )
    .map(node => node.data);
}

function getConnectedNodes(nodeId: string, allNodes: any[], allEdges: any[]): any[] {
  const connectedNodeIds = allEdges
    .filter(edge => edge.source === nodeId || edge.target === nodeId)
    .map(edge => edge.source === nodeId ? edge.target : edge.source);
  
  return allNodes
    .filter(node => connectedNodeIds.includes(node.id))
    .map(node => node.data);
}

// Helper function to get columns with markers
export const getColumnsWithMarkers = (columns: ColumnDefinition[]): ColumnDefinition[] => {
  return columns.filter(col => col.markers.length > 0);
};

// Helper function to format column display
export const formatColumnDisplay = (column: ColumnDefinition): string => {
  const markers = column.markers.map(marker => marker.label).join(', ');
  return markers ? `${column.name} (${markers})` : column.name;
}; 