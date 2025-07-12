import React, { useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { Node, Edge } from '@xyflow/react';
import Button from './Button';
import Card from './Card';
import Icon from './Icon';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  currentModelName: string;
}

type ExportFormat = 'png' | 'json' | 'svg' | 'dbml' | 'dbt';

const ExportDialog: React.FC<ExportDialogProps> = ({ 
  isOpen, 
  onClose, 
  nodes, 
  edges,
  currentModelName 
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (nodes.length === 0) {
      setExportError('No nodes to export. Please add some components first.');
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      if (selectedFormat === 'png') {
        // Get the React Flow viewport element
        const reactFlowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
        
        if (!reactFlowElement) {
          throw new Error('Could not find React Flow viewport element');
        }

        // Hide connection points during export
        const reactFlowWrapper = document.querySelector('.react-flow') as HTMLElement;
        const originalClassName = reactFlowWrapper?.className || '';
        if (reactFlowWrapper) {
          reactFlowWrapper.className = originalClassName + ' hide-handles-for-export';
        }

        try {
          const dataUrl = await toPng(reactFlowElement, {
            backgroundColor: '#ffffff',
            pixelRatio: 2, // Higher quality
            cacheBust: true,
            // Skip font embedding to avoid CORS issues
            skipFonts: true,
            // Skip external stylesheets to avoid CORS issues
            filter: (node) => {
              // Filter out external stylesheets and fonts
              if (node.tagName === 'LINK' && node.getAttribute('href')?.includes('fonts.googleapis.com')) {
                return false;
              }
              if (node.tagName === 'STYLE' && node.textContent?.includes('@import')) {
                return false;
              }
              // Hide React Flow handles during export
              if (node.nodeType === 1 && (node as Element).classList.contains('react-flow__handle')) {
                return false;
              }
              return true;
            }
          });

          // Create download link
          const link = document.createElement('a');
          link.download = `${currentModelName || 'data-vault-model'}.png`;
          link.href = dataUrl;
          link.click();
                 } finally {
           // Restore connection points visibility
           if (reactFlowWrapper) {
             reactFlowWrapper.className = originalClassName;
           }
         }
      } else if (selectedFormat === 'json') {
        // Export as JSON
        const exportData = {
          name: currentModelName || 'Untitled Model',
          version: '1.0',
          exportedAt: new Date().toISOString(),
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.data.type,
            position: node.position,
            data: node.data
          })),
          edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            type: edge.type,
            style: edge.style,
            animated: edge.animated,
            data: edge.data
          }))
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `${currentModelName || 'data-vault-model'}.json`;
        link.href = url;
        link.click();
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [nodes, edges, selectedFormat, currentModelName, onClose]);

  const formatOptions = [
    { value: 'png' as const, label: 'PNG Image', description: 'High quality raster image', disabled: false },
    { value: 'json' as const, label: 'JSON File', description: 'Model data for import/backup', disabled: false },
    { value: 'svg' as const, label: 'SVG Vector', description: 'Scalable vector graphics', disabled: true },
    { value: 'dbml' as const, label: 'DBML Schema', description: 'Database Markup Language', disabled: true },
    { value: 'dbt' as const, label: 'dbt Models', description: 'Data Vault 4 dbt templates', disabled: true },
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
                <Icon name="download" size="md" className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-surface-900">Export Model</h2>
                <p className="text-sm text-surface-600">Download your Data Vault model</p>
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

          {/* Error Alert */}
          {exportError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Icon name="close" size="sm" className="text-red-500 flex-shrink-0" />
                <span className="text-red-800 text-sm">{exportError}</span>
              </div>
            </div>
          )}

          {/* Export Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-surface-700 mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              {formatOptions.map((format) => (
                <label
                  key={format.value}
                  className={`flex items-center p-3 border rounded-lg transition-colors ${
                    format.disabled
                      ? 'border-surface-200 bg-surface-50 cursor-not-allowed opacity-60'
                      : selectedFormat === format.value
                      ? 'border-primary-500 bg-primary-50 cursor-pointer'
                      : 'border-surface-300 hover:border-surface-400 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format.value}
                    checked={selectedFormat === format.value}
                    onChange={(e) => !format.disabled && setSelectedFormat(e.target.value as ExportFormat)}
                    disabled={format.disabled}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${format.disabled ? 'text-surface-500' : 'text-surface-900'}`}>
                      {format.label}
                      {format.disabled && <span className="ml-2 text-xs text-surface-400">(Coming Soon)</span>}
                    </div>
                    <div className={`text-sm ${format.disabled ? 'text-surface-400' : 'text-surface-600'}`}>
                      {format.description}
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    format.disabled
                      ? 'border-surface-300 bg-surface-100'
                      : selectedFormat === format.value
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-surface-300'
                  }`}>
                    {selectedFormat === format.value && !format.disabled && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Model Info */}
          <div className="mb-6 p-3 bg-surface-50 rounded-lg">
            <h3 className="font-medium text-surface-900 mb-2">Model Information</h3>
            <div className="text-sm text-surface-600 space-y-1">
              <div>Name: {currentModelName || 'Untitled Model'}</div>
              <div>Nodes: {nodes.length}</div>
              <div>Edges: {edges.length}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isExporting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExport}
              disabled={isExporting || nodes.length === 0 || formatOptions.find(f => f.value === selectedFormat)?.disabled}
              isLoading={isExporting}
              leftIcon={<Icon name="download" size="sm" />}
              className="flex-1"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExportDialog; 