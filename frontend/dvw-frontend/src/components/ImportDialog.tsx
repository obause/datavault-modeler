import React, { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';
import Button from './Button';
import Card from './Card';
import Icon from './Icon';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (nodes: Node[], edges: Edge[], modelName: string) => void;
}

type ImportSource = 'json' | 'dbml' | 'dbt';

interface ImportData {
  name: string;
  version?: string;
  exportedAt?: string;
  nodes: any[];
  edges: any[];
}

const ImportDialog: React.FC<ImportDialogProps> = ({ 
  isOpen, 
  onClose, 
  onImport 
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ImportData | null>(null);
  const [selectedSource, setSelectedSource] = useState<ImportSource>('json');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manifestInputRef = useRef<HTMLInputElement>(null);
  const catalogInputRef = useRef<HTMLInputElement>(null);

  const validateImportData = (data: any): ImportData => {
    // Basic validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid file format. Please select a valid JSON file.');
    }

    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid file format. Missing or invalid nodes array.');
    }

    if (!data.edges || !Array.isArray(data.edges)) {
      throw new Error('Invalid file format. Missing or invalid edges array.');
    }

    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Invalid file format. Missing or invalid model name.');
    }

    // Validate nodes structure
    for (const node of data.nodes) {
      if (!node.id || !node.type || !node.position || !node.data) {
        throw new Error('Invalid node structure in import file.');
      }
    }

    // Validate edges structure
    for (const edge of data.edges) {
      if (!edge.id || !edge.source || !edge.target) {
        throw new Error('Invalid edge structure in import file.');
      }
    }

    return data as ImportData;
  };

  const transformImportedNodes = (importedNodes: any[]): Node[] => {
    return importedNodes.map(node => ({
      id: node.id,
      type: node.type.toLowerCase(),
      position: node.position,
      data: node.data
    }));
  };

  const transformImportedEdges = (importedEdges: any[]): Edge[] => {
    return importedEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type || 'floating',
      style: edge.style || { stroke: '#2d2382', strokeWidth: 3, strokeDasharray: '5,5' },
      animated: edge.animated ?? true,
      data: edge.data || {}
    }));
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setPreviewData(null);

    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setImportError('Please select a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        const validatedData = validateImportData(data);
        setPreviewData(validatedData);
      } catch (error) {
        console.error('Error parsing import file:', error);
        setImportError(error instanceof Error ? error.message : 'Failed to parse import file.');
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };

    reader.readAsText(file);
  }, []);

  const handleImport = useCallback(() => {
    if (!previewData) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const transformedNodes = transformImportedNodes(previewData.nodes);
      const transformedEdges = transformImportedEdges(previewData.edges);

      onImport(transformedNodes, transformedEdges, previewData.name);
      onClose();
    } catch (error) {
      console.error('Error during import:', error);
      setImportError(error instanceof Error ? error.message : 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  }, [previewData, onImport, onClose]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setImportError('Please select a valid JSON file.');
      return;
    }

    // Simulate file input change
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const resetDialog = useCallback(() => {
    setImportError(null);
    setPreviewData(null);
    setSelectedSource('json');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (manifestInputRef.current) {
      manifestInputRef.current.value = '';
    }
    if (catalogInputRef.current) {
      catalogInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    resetDialog();
    onClose();
  }, [resetDialog, onClose]);

  const importSourceOptions = [
    { value: 'json' as const, label: 'JSON File', description: 'Model exported from Data Vault Modeler', disabled: false },
    { value: 'dbml' as const, label: 'DBML Schema', description: 'Database Markup Language file', disabled: true },
    { value: 'dbt' as const, label: 'dbt Project', description: 'dbt manifest.json and catalog.json files', disabled: true },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-900 to-primary-800 rounded-lg flex items-center justify-center">
                <Icon name="upload" size="md" className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-surface-900">Import Model</h2>
                <p className="text-sm text-surface-600">Load a Data Vault model from file</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="rounded-full"
            >
              <Icon name="close" size="sm" />
            </Button>
          </div>

          {/* Error Alert */}
          {importError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Icon name="close" size="sm" className="text-red-500 flex-shrink-0" />
                <span className="text-red-800 text-sm">{importError}</span>
              </div>
            </div>
          )}

          {/* Import Source Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-surface-700 mb-3">
              Import Source
            </label>
            <div className="space-y-2">
              {importSourceOptions.map((source) => (
                <label
                  key={source.value}
                  className={`flex items-center p-3 border rounded-lg transition-colors ${
                    source.disabled
                      ? 'border-surface-200 bg-surface-50 cursor-not-allowed opacity-60'
                      : selectedSource === source.value
                      ? 'border-primary-500 bg-primary-50 cursor-pointer'
                      : 'border-surface-300 hover:border-surface-400 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="importSource"
                    value={source.value}
                    checked={selectedSource === source.value}
                    onChange={(e) => !source.disabled && setSelectedSource(e.target.value as ImportSource)}
                    disabled={source.disabled}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${source.disabled ? 'text-surface-500' : 'text-surface-900'}`}>
                      {source.label}
                      {source.disabled && <span className="ml-2 text-xs text-surface-400">(Coming Soon)</span>}
                    </div>
                    <div className={`text-sm ${source.disabled ? 'text-surface-400' : 'text-surface-600'}`}>
                      {source.description}
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    source.disabled
                      ? 'border-surface-300 bg-surface-100'
                      : selectedSource === source.value
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-surface-300'
                  }`}>
                    {selectedSource === source.value && !source.disabled && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload Area */}
          {!previewData && selectedSource === 'json' && (
            <div className="mb-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  importError 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-surface-300 hover:border-primary-400 hover:bg-primary-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center">
                    <Icon name="upload" size="lg" className="text-surface-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">
                      Drop your JSON file here, or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-600 hover:text-primary-700 underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-surface-600 mt-1">
                      Supports .json files exported from Data Vault Modeler
                    </p>
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* DBML File Upload Area */}
          {!previewData && selectedSource === 'dbml' && (
            <div className="mb-6">
              <div className="border-2 border-dashed border-surface-300 bg-surface-50 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center">
                    <Icon name="file" size="lg" className="text-surface-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-500">
                      DBML Import Coming Soon
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      Support for .dbml files will be available in a future update
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* dbt Project Upload Area */}
          {!previewData && selectedSource === 'dbt' && (
            <div className="mb-6">
              <div className="border-2 border-dashed border-surface-300 bg-surface-50 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center">
                    <Icon name="folder" size="lg" className="text-surface-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-500">
                      dbt Project Import Coming Soon
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      Support for manifest.json and catalog.json files will be available in a future update
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Data */}
          {previewData && (
            <div className="mb-6">
              <h3 className="font-medium text-surface-900 mb-3">Import Preview</h3>
              <div className="p-4 bg-surface-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">Model Name:</span>
                  <span className="font-medium text-surface-900">{previewData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">Nodes:</span>
                  <span className="font-medium text-surface-900">{previewData.nodes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">Edges:</span>
                  <span className="font-medium text-surface-900">{previewData.edges.length}</span>
                </div>
                {previewData.version && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600">Version:</span>
                    <span className="font-medium text-surface-900">{previewData.version}</span>
                  </div>
                )}
                {previewData.exportedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600">Exported:</span>
                    <span className="font-medium text-surface-900">
                      {new Date(previewData.exportedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetDialog}
                  leftIcon={<Icon name="refresh" size="sm" />}
                >
                  Choose Different File
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isImporting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleImport}
              disabled={isImporting || !previewData || selectedSource !== 'json'}
              isLoading={isImporting}
              leftIcon={<Icon name="upload" size="sm" />}
              className="flex-1"
            >
              {isImporting ? 'Importing...' : 'Import Model'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ImportDialog; 