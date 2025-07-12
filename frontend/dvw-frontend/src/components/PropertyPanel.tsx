import React from 'react';
import { clsx } from 'clsx';
import Button from './Button';
import Icon from './Icon';

// Define property types for extensibility
export interface PropertyDefinition {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean' | 'list' | 'readonly-list' | 'tags';
  value: any;
  options?: { value: any; label: string }[];
  placeholder?: string;
  description?: string;
  conditional?: {
    dependsOn: string;
    value: any;
  };
}

export interface NodeTypeProperties {
  [nodeType: string]: PropertyDefinition[];
}

// Shared base properties for all node types
const baseProperties: PropertyDefinition[] = [
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    value: '',
    placeholder: 'Enter a description for this node',
    description: 'Detailed description of this Data Vault component'
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'tags',
    value: [],
    placeholder: 'Add tags (press Enter to add)',
    description: 'Tags for categorization and filtering'
  }
];

// Record source options for dropdowns
const recordSourceOptions = [
  { value: 'CRM_SALESFORCE', label: 'CRM Salesforce' },
  { value: 'ERP_SAP', label: 'ERP SAP' },
  { value: 'DWH_LEGACY', label: 'Legacy Data Warehouse' },
  { value: 'API_EXTERNAL', label: 'External API' },
  { value: 'FILE_CSV', label: 'CSV Files' },
  { value: 'DB_ORACLE', label: 'Oracle Database' },
  { value: 'DB_MYSQL', label: 'MySQL Database' },
  { value: 'STREAM_KAFKA', label: 'Kafka Stream' }
];

// Default property definitions for each node type
export const defaultNodeProperties: NodeTypeProperties = {
  HUB: [
    ...baseProperties,
    {
      key: 'relatedSatellites',
      label: 'Related Satellites',
      type: 'readonly-list',
      value: [],
      description: 'Satellites connected to this hub'
    },
    {
      key: 'relatedLinks',
      label: 'Related Links',
      type: 'readonly-list',
      value: [],
      description: 'Links connected to this hub'
    },
    {
      key: 'recordSources',
      label: 'Record Sources',
      type: 'multiselect',
      value: [],
      options: recordSourceOptions,
      description: 'Source systems providing data to this hub'
    },
    {
      key: 'businessKey',
      label: 'Business Key',
      type: 'text',
      value: '',
      placeholder: 'Enter business key definition',
      description: 'The unique business identifier for this hub'
    },
    {
      key: 'hashkeyName',
      label: 'Hashkey Name',
      type: 'text',
      value: '',
      placeholder: 'e.g., hub_customer_hashkey',
      description: 'Name of the hashkey column'
    }
  ],
  LNK: [
    ...baseProperties,
    {
      key: 'relatedHubs',
      label: 'Related Hubs',
      type: 'readonly-list',
      value: [],
      description: 'Hubs connected to this link'
    },
    {
      key: 'relatedSatellites',
      label: 'Related Satellites',
      type: 'readonly-list',
      value: [],
      description: 'Satellites connected to this link'
    },
    {
      key: 'recordSources',
      label: 'Record Sources',
      type: 'multiselect',
      value: [],
      options: recordSourceOptions,
      description: 'Source systems providing data to this link'
    },
    {
      key: 'hashkeyName',
      label: 'Hashkey Name',
      type: 'text',
      value: '',
      placeholder: 'e.g., link_customer_order_hashkey',
      description: 'Name of the hashkey column'
    },
    {
      key: 'dependentChildKey',
      label: 'Dependent Child Key',
      type: 'text',
      value: '',
      placeholder: 'Enter dependent child key',
      description: 'Dependent child key for this link'
    },
    {
      key: 'isTransactional',
      label: 'Transactional Link',
      type: 'boolean',
      value: false,
      description: 'Whether this link represents transactional data'
    },
    {
      key: 'attributes',
      label: 'Attributes',
      type: 'list',
      value: [],
      placeholder: 'Add attribute',
      description: 'Attributes stored in this transactional link',
      conditional: {
        dependsOn: 'isTransactional',
        value: true
      }
    }
  ],
  SAT: [
    ...baseProperties,
    {
      key: 'satelliteType',
      label: 'Satellite Type',
      type: 'select',
      value: 'standard',
      options: [
        { value: 'standard', label: 'Standard Satellite' },
        { value: 'multi-active', label: 'Multi-Active Satellite' },
        { value: 'effectivity', label: 'Effectivity Satellite' },
        { value: 'record-tracking', label: 'Record-Tracking Satellite' },
        { value: 'non-historized', label: 'Non-Historized Satellite' }
      ],
      description: 'Type of satellite functionality'
    },
    {
      key: 'relatedHub',
      label: 'Related Hub',
      type: 'readonly-list',
      value: [],
      description: 'Hub or Link this satellite is connected to'
    },
    {
      key: 'recordSource',
      label: 'Record Source',
      type: 'select',
      value: '',
      options: recordSourceOptions,
      description: 'Source system providing data to this satellite'
    },
    {
      key: 'hashdiffName',
      label: 'Hashdiff Name',
      type: 'text',
      value: '',
      placeholder: 'e.g., sat_customer_hashdiff',
      description: 'Name of the hashdiff column (not applicable for non-historized satellites)'
    },
    {
      key: 'multiActiveKey',
      label: 'Multi-Active Key',
      type: 'text',
      value: '',
      placeholder: 'e.g., ma_customer_product_key',
      description: 'Key for multi-active satellite pattern',
      conditional: {
        dependsOn: 'satelliteType',
        value: 'multi-active'
      }
    },
    {
      key: 'trackedColumn',
      label: 'Tracked Column',
      type: 'text',
      value: '',
      placeholder: 'e.g., deleted_flag',
      description: 'Name of the column inside the source that should be tracked for deletes',
      conditional: {
        dependsOn: 'satelliteType',
        value: ['effectivity', 'record-tracking']
      }
    },
    {
      key: 'attributes',
      label: 'Attributes',
      type: 'list',
      value: [],
      placeholder: 'Add attribute',
      description: 'Attributes tracked in this satellite'
    },
    {
      key: 'containsPII',
      label: 'Contains PII Data',
      type: 'boolean',
      value: false,
      description: 'Whether this satellite contains personally identifiable information'
    }
  ],
  REF: [
    ...baseProperties,
    {
      key: 'referenceType',
      label: 'Reference Type',
      type: 'select',
      value: 'table',
      options: [
        { value: 'table', label: 'Reference Table' },
        { value: 'hub', label: 'Reference Hub' },
        { value: 'satellite', label: 'Reference Satellite' }
      ],
      description: 'Type of reference data functionality'
    },
    {
      key: 'relatedNodes',
      label: 'Related Nodes',
      type: 'readonly-list',
      value: [],
      description: 'Nodes connected to this reference data'
    },
    {
      key: 'recordSource',
      label: 'Record Source',
      type: 'select',
      value: '',
      options: recordSourceOptions,
      description: 'Source system providing reference data',
      conditional: {
        dependsOn: 'referenceType',
        value: ['table', 'hub']
      }
    },
    {
      key: 'referenceKeys',
      label: 'Reference Keys',
      type: 'list',
      value: [],
      placeholder: 'Add reference key',
      description: 'Key columns for reference data lookup',
      conditional: {
        dependsOn: 'referenceType',
        value: ['table', 'hub']
      }
    },
    {
      key: 'parentReferenceKeys',
      label: 'Parent Reference Keys',
      type: 'readonly-list',
      value: [],
      description: 'Reference keys inherited from connected reference hub (not editable)',
      conditional: {
        dependsOn: 'referenceType',
        value: 'satellite'
      }
    }
  ],
  PIT: [
    ...baseProperties,
    {
      key: 'trackedEntity',
      label: 'Tracked Entity',
      type: 'readonly-list',
      value: [],
      description: 'Hub or Link that this PIT table tracks (automatically determined)'
    },
    {
      key: 'relatedSatellites',
      label: 'Related Satellites',
      type: 'readonly-list',
      value: [],
      description: 'All satellites of the tracked hub/link (automatically determined)'
    },
    {
      key: 'dimensionKeyName',
      label: 'Dimension Key Name',
      type: 'text',
      value: '',
      placeholder: 'e.g., pit_customer_dimension_key',
      description: 'Name of the dimension key column in the PIT table'
    },
    {
      key: 'logarithmicPIT',
      label: 'Logarithmic PIT',
      type: 'boolean',
      value: false,
      description: 'Whether this PIT table uses logarithmic approach for optimization'
    }
  ],
  BRIDGE: [
    ...baseProperties,
    {
      key: 'relatedNodes',
      label: 'Related Nodes',
      type: 'readonly-list',
      value: [],
      description: 'Nodes that this bridge table connects (automatically determined)'
    }
  ]
};

interface PropertyPanelProps {
  nodeId: string | null;
  nodeData: any;
  isOpen: boolean;
  onClose: () => void;
  onPropertyChange: (nodeId: string, propertyKey: string, value: any) => void;
  allNodes?: any[];
  allEdges?: any[];
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  nodeId,
  nodeData,
  isOpen,
  onClose,
  onPropertyChange,
  allNodes = [],
  allEdges = []
}) => {
  // Move all hooks to the top level to avoid conditional hook calls
  const [tagInputs, setTagInputs] = React.useState<{[key: string]: string}>({});
  const [listInputs, setListInputs] = React.useState<{[key: string]: string}>({});

  if (!isOpen || !nodeId || !nodeData) {
    return null;
  }

  const nodeType = nodeData.type as 'HUB' | 'LNK' | 'SAT' | 'REF' | 'PIT' | 'BRIDGE';
  
  // Calculate related nodes dynamically
  const getRelatedNodes = () => {
    const connectedNodeIds = new Set<string>();
    
    // Find all edges connected to this node
    allEdges.forEach(edge => {
      if (edge.source === nodeId) {
        connectedNodeIds.add(edge.target);
      } else if (edge.target === nodeId) {
        connectedNodeIds.add(edge.source);
      }
    });

    // Group connected nodes by type
    const connectedNodes = allNodes.filter(node => connectedNodeIds.has(node.id));
    const relatedHubs = connectedNodes.filter(node => node.data.type === 'HUB');
    const relatedLinks = connectedNodes.filter(node => node.data.type === 'LNK');
    const relatedSatellites = connectedNodes.filter(node => node.data.type === 'SAT');
    const relatedReference = connectedNodes.filter(node => node.data.type === 'REF');
    const relatedPIT = connectedNodes.filter(node => node.data.type === 'PIT');
    const relatedBridge = connectedNodes.filter(node => node.data.type === 'BRIDGE');

    return { relatedHubs, relatedLinks, relatedSatellites, relatedReference, relatedPIT, relatedBridge };
  };

  const { relatedHubs, relatedLinks, relatedSatellites, relatedReference, relatedPIT, relatedBridge } = getRelatedNodes();

  // Update properties with calculated relationships
  const properties = defaultNodeProperties[nodeType]?.map(prop => {
    if (prop.key === 'relatedHubs') {
      return { ...prop, value: relatedHubs.map(n => n.data.label) };
    } else if (prop.key === 'relatedLinks') {
      return { ...prop, value: relatedLinks.map(n => n.data.label) };
    } else if (prop.key === 'relatedSatellites') {
      if (nodeType === 'PIT') {
        // For PIT tables, show satellites connected to the tracked hub/link
        const trackedNode = [...relatedHubs, ...relatedLinks][0];
        if (trackedNode) {
          // Find all satellites connected to the tracked hub/link
          const trackedNodeSatellites = allNodes.filter(node => {
            if (node.data.type !== 'SAT') return false;
            return allEdges.some(edge => 
              (edge.source === trackedNode.id && edge.target === node.id) ||
              (edge.target === trackedNode.id && edge.source === node.id)
            );
          });
          return { ...prop, value: trackedNodeSatellites.map(n => n.data.label) };
        }
        return { ...prop, value: [] };
      } else {
        return { ...prop, value: relatedSatellites.map(n => n.data.label) };
      }
    } else if (prop.key === 'relatedHub') {
      // For satellites, show the hub or link it's connected to
      const parentNode = [...relatedHubs, ...relatedLinks][0];
      return { ...prop, value: parentNode ? [parentNode.data.label] : [] };
    } else if (prop.key === 'relatedNodes') {
      // For reference data and bridge tables, show all connected nodes
      const allRelatedNodes = [...relatedHubs, ...relatedLinks, ...relatedSatellites, ...relatedReference, ...relatedPIT, ...relatedBridge];
      return { ...prop, value: allRelatedNodes.map(n => n.data.label) };
    } else if (prop.key === 'trackedEntity') {
      // For PIT tables, show the hub or link they track
      const trackedNode = [...relatedHubs, ...relatedLinks][0];
      return { ...prop, value: trackedNode ? [trackedNode.data.label] : [] };
    }
    return prop;
  }) || [];

  const handlePropertyChange = (propertyKey: string, value: any) => {
    onPropertyChange(nodeId, propertyKey, value);
  };

  const renderPropertyInput = (property: PropertyDefinition) => {
    const currentValue = nodeData.properties?.[property.key] ?? property.value;

    switch (property.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
            placeholder={property.placeholder}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentValue}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
            placeholder={property.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        );

      case 'select':
        return (
          <select
            value={currentValue}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select an option...</option>
            {property.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {(currentValue || []).map((value: string, index: number) => {
                const option = property.options?.find(opt => opt.value === value);
                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                  >
                    {option?.label || value}
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = currentValue.filter((_: any, i: number) => i !== index);
                        handlePropertyChange(property.key, newValue);
                      }}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <Icon name="close" size="xs" />
                    </button>
                  </span>
                );
              })}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !currentValue?.includes(e.target.value)) {
                  handlePropertyChange(property.key, [...(currentValue || []), e.target.value]);
                }
              }}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Add record source...</option>
              {property.options?.filter(opt => !currentValue?.includes(opt.value)).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'tags':
        const tagInput = tagInputs[property.key] || '';
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {(currentValue || []).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = currentValue.filter((_: any, i: number) => i !== index);
                      handlePropertyChange(property.key, newValue);
                    }}
                    className="text-secondary-600 hover:text-secondary-800"
                  >
                    <Icon name="close" size="xs" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInputs(prev => ({...prev, [property.key]: e.target.value}))}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault();
                  if (!currentValue?.includes(tagInput.trim())) {
                    handlePropertyChange(property.key, [...(currentValue || []), tagInput.trim()]);
                  }
                  setTagInputs(prev => ({...prev, [property.key]: ''}));
                }
              }}
              placeholder={property.placeholder}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        );

      case 'list':
        const listInput = listInputs[property.key] || '';
        return (
          <div className="space-y-2">
            <div className="space-y-2">
              {(currentValue || []).map((item: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-surface-50 rounded border"
                >
                  <span className="text-sm">{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = currentValue.filter((_: any, i: number) => i !== index);
                      handlePropertyChange(property.key, newValue);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={listInput}
                onChange={(e) => setListInputs(prev => ({...prev, [property.key]: e.target.value}))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && listInput.trim()) {
                    e.preventDefault();
                    handlePropertyChange(property.key, [...(currentValue || []), listInput.trim()]);
                    setListInputs(prev => ({...prev, [property.key]: ''}));
                  }
                }}
                placeholder={property.placeholder}
                className="flex-1 px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (listInput.trim()) {
                    handlePropertyChange(property.key, [...(currentValue || []), listInput.trim()]);
                    setListInputs(prev => ({...prev, [property.key]: ''}));
                  }
                }}
                disabled={!listInput.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        );

      case 'readonly-list':
        return (
          <div className="space-y-2">
            {(property.value || []).length === 0 ? (
              <p className="text-sm text-surface-500 italic">No connections found</p>
            ) : (
              <div className="space-y-1">
                {property.value.map((item: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center p-2 bg-surface-50 rounded border"
                  >
                    <Icon name="link" size="sm" className="text-surface-400 mr-2" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handlePropertyChange(property.key, parseInt(e.target.value) || 0)}
            placeholder={property.placeholder}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentValue}
              onChange={(e) => handlePropertyChange(property.key, e.target.checked)}
              className="sr-only"
            />
            <div className={clsx(
              'relative w-11 h-6 rounded-full transition-colors',
              currentValue ? 'bg-primary-600' : 'bg-surface-300'
            )}>
              <div className={clsx(
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                currentValue && 'translate-x-5'
              )} />
            </div>
            <span className="ml-3 text-sm text-surface-700">
              {currentValue ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <div className={clsx(
      'fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200 bg-surface-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-900 to-primary-800 rounded-lg flex items-center justify-center">
              <Icon name="settings" size="md" className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900">Node Properties</h2>
              <p className="text-sm text-surface-600">
                {nodeType === 'HUB' ? 'Hub' : 
                 nodeType === 'LNK' ? 'Link' : 
                 nodeType === 'SAT' ? 'Satellite' : 
                 'Reference Data'}: {nodeData.label}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full"
          >
            <Icon name="close" size="sm" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Name field (shared) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-surface-900">
                Name
              </label>
              <input
                type="text"
                value={nodeData.label || ''}
                onChange={(e) => handlePropertyChange('label', e.target.value)}
                placeholder="Enter node name"
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-surface-500">
                The display name for this {nodeType === 'REF' ? 'reference data' : nodeType.toLowerCase()}
              </p>
            </div>

                         {properties.map((property) => {
               // Handle conditional rendering
               if (property.conditional) {
                 const dependentValue = nodeData.properties?.[property.conditional.dependsOn] ?? 
                   properties.find(p => p.key === property.conditional?.dependsOn)?.value;
                 
                 // Handle array of values for conditional rendering
                 if (Array.isArray(property.conditional.value)) {
                   if (!property.conditional.value.includes(dependentValue)) {
                     return null;
                   }
                 } else if (dependentValue !== property.conditional.value) {
                   return null;
                 }
               }

              return (
                <div key={property.key} className="space-y-2">
                  <label className="block text-sm font-medium text-surface-900">
                    {property.label}
                    {property.type === 'readonly-list' && (
                      <span className="text-xs text-surface-400 ml-2">(auto-calculated)</span>
                    )}
                  </label>
                  {renderPropertyInput(property)}
                  {property.description && (
                    <p className="text-xs text-surface-500">{property.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-200 bg-surface-50">
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              Apply Changes
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel; 