import React, { useState, useEffect } from "react";
import useStore from "../store/modelStore";
import Button from "./Button";
import Card from "./Card";
import Icon from "./Icon";

const ModelManager: React.FC = () => {
  const {
    currentModelName,
    availableModels,
    isLoading,
    error,
    setModelName,
    saveModel,
    loadModel,
    loadAvailableModels,
    createNewModel,
    deleteModel,
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [saveAsName, setSaveAsName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableModels();
    }
  }, [isOpen, loadAvailableModels]);

  useEffect(() => {
    setNewModelName(currentModelName);
  }, [currentModelName]);

  const handleSave = async () => {
    await saveModel();
    setIsOpen(false);
  };

  const handleSaveAs = async () => {
    if (saveAsName.trim()) {
      await saveModel(saveAsName.trim());
      setSaveAsName("");
      setShowSaveAs(false);
      setIsOpen(false);
    }
  };

  const handleRename = async () => {
    if (newModelName.trim() && newModelName.trim() !== currentModelName) {
      setModelName(newModelName.trim());
      await saveModel();
    }
    setIsRenaming(false);
  };

  const handleLoad = async (modelId: string) => {
    await loadModel(modelId);
    setIsOpen(false);
  };

  const handleNewModel = () => {
    createNewModel();
    setIsOpen(false);
  };

  const handleDeleteModel = async (modelId: string) => {
    await deleteModel(modelId);
    setDeleteConfirmId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Button
        variant="secondary"
        size="md"
        onClick={() => setIsOpen(true)}
        leftIcon={<Icon name="folder" size="sm" />}
        fullWidth
      >
        Manage Models
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-900 to-primary-800 rounded-lg flex items-center justify-center">
                  <Icon name="folder" size="md" className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-surface-900">Model Manager</h2>
                  <p className="text-sm text-surface-600">Save, load, and manage your Data Vault models</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="rounded-full"
              >
                <Icon name="close" size="sm" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Icon name="close" size="sm" className="text-red-500 flex-shrink-0" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Model Section */}
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <Icon name="file" size="sm" className="text-primary-600" />
                    Current Model
                  </h3>
                  <Card variant="outlined" padding="lg" className="h-full">
                    <div className="space-y-6">
                      {/* Model Name Display */}
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-3">
                          Model Name
                        </label>
                        {isRenaming ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={newModelName}
                              onChange={(e) => setNewModelName(e.target.value)}
                              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Enter new model name"
                              autoFocus
                              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                              onKeyDown={(e) => e.key === 'Escape' && setIsRenaming(false)}
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={handleRename}
                                disabled={!newModelName.trim() || newModelName.trim() === currentModelName}
                                isLoading={isLoading}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsRenaming(false);
                                  setNewModelName(currentModelName);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-surface-50 border border-surface-200 rounded-lg">
                            <span className="font-medium text-surface-900 truncate">{currentModelName}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsRenaming(true)}
                              className="text-surface-600 hover:text-surface-900"
                            >
                              <Icon name="edit" size="sm" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleSave}
                          isLoading={isLoading}
                          leftIcon={<Icon name="save" size="sm" />}
                          fullWidth
                        >
                          Save Current Model
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => setShowSaveAs(!showSaveAs)}
                          leftIcon={<Icon name="file" size="sm" />}
                          fullWidth
                        >
                          Save As Copy
                        </Button>
                        
                        <Button
                          variant="accent"
                          size="md"
                          onClick={handleNewModel}
                          leftIcon={<Icon name="plus" size="sm" />}
                          fullWidth
                        >
                          Create New Model
                        </Button>
                      </div>

                      {/* Save As Input */}
                      {showSaveAs && (
                        <div className="pt-4 border-t border-surface-200 space-y-3">
                          <label className="block text-sm font-medium text-surface-700">
                            Save As New Model
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={saveAsName}
                              onChange={(e) => setSaveAsName(e.target.value)}
                              placeholder="Enter new model name"
                              className="flex-1 px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveAs()}
                              onKeyDown={(e) => e.key === 'Escape' && setShowSaveAs(false)}
                            />
                            <Button
                              variant="secondary"
                              size="md"
                              onClick={handleSaveAs}
                              disabled={!saveAsName.trim() || isLoading}
                              isLoading={isLoading}
                            >
                              Save
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowSaveAs(false);
                              setSaveAsName("");
                            }}
                            className="text-surface-600 hover:text-surface-900"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {/* Model Stats */}
                      <div className="pt-4 border-t border-surface-200">
                        <h4 className="text-sm font-medium text-surface-700 mb-3">Model Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {availableModels.find(m => m.name === currentModelName)?.nodes.length || 0}
                            </div>
                            <div className="text-xs text-blue-700">Nodes</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {availableModels.find(m => m.name === currentModelName)?.edges.length || 0}
                            </div>
                            <div className="text-xs text-green-700">Edges</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Existing Models Section */}
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <Icon name="folder" size="sm" className="text-secondary-600" />
                    Available Models
                  </h3>
                  
                  {isLoading && (
                    <div className="text-center py-12">
                      <Icon name="refresh" size="lg" className="text-surface-400 animate-spin mx-auto mb-3" />
                      <p className="text-surface-600">Loading models...</p>
                    </div>
                  )}
                  
                  {!isLoading && availableModels.length === 0 && (
                    <Card variant="outlined" padding="lg" className="h-full">
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon name="folder" size="xl" className="text-surface-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-surface-900 mb-2">No models found</h4>
                        <p className="text-surface-600 mb-4">Create your first model to get started!</p>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleNewModel}
                          leftIcon={<Icon name="plus" size="sm" />}
                        >
                          Create First Model
                        </Button>
                      </div>
                    </Card>
                  )}
                  
                  {!isLoading && availableModels.length > 0 && (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {availableModels.map((model) => (
                        <Card 
                          key={model.id} 
                          variant="outlined" 
                          padding="md" 
                          className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                            model.name === currentModelName ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0" onClick={() => handleLoad(model.id)}>
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  model.name === currentModelName 
                                    ? 'bg-primary-600' 
                                    : 'bg-gradient-to-br from-secondary-500 to-secondary-600'
                                }`}>
                                  <Icon name="folder" size="sm" className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-surface-900 truncate flex items-center gap-2">
                                    {model.name}
                                    {model.name === currentModelName && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                        Current
                                      </span>
                                    )}
                                  </h4>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-surface-600">
                                <span>{formatDate(model.created_at)}</span>
                                <span>•</span>
                                <span>{model.nodes.length} nodes</span>
                                <span>•</span>
                                <span>{model.edges.length} edges</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {model.name !== currentModelName && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLoad(model.id)}
                                  disabled={isLoading}
                                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                                  title="Load model"
                                >
                                  <Icon name="download" size="sm" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmId(model.id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete model"
                              >
                                <Icon name="trash" size="sm" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Icon name="trash" size="md" className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">Delete Model</h3>
                  <p className="text-sm text-surface-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-surface-700 mb-6">
                Are you sure you want to delete this model? All data will be permanently removed.
              </p>
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleDeleteModel(deleteConfirmId)}
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ModelManager; 