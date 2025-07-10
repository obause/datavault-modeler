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
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState("");
  const [showSaveAs, setShowSaveAs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailableModels();
    }
  }, [isOpen, loadAvailableModels]);

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

  const handleLoad = async (modelId: string) => {
    await loadModel(modelId);
    setIsOpen(false);
  };

  const handleNewModel = () => {
    createNewModel();
    setIsOpen(false);
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
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
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

              {/* Current Model Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Current Model</h3>
                <Card variant="outlined" padding="lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Model Name
                      </label>
                      <input
                        type="text"
                        value={currentModelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter model name"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleSave}
                        isLoading={isLoading}
                        leftIcon={<Icon name="save" size="sm" />}
                      >
                        Save
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => setShowSaveAs(!showSaveAs)}
                        leftIcon={<Icon name="edit" size="sm" />}
                      >
                        Save As...
                      </Button>
                      
                      <Button
                        variant="accent"
                        size="md"
                        onClick={handleNewModel}
                        leftIcon={<Icon name="plus" size="sm" />}
                      >
                        New Model
                      </Button>
                    </div>

                    {/* Save As Input */}
                    {showSaveAs && (
                      <div className="pt-4 border-t border-surface-200">
                        <label className="block text-sm font-medium text-surface-700 mb-2">
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
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Existing Models Section */}
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Existing Models</h3>
                
                {isLoading && (
                  <div className="text-center py-8">
                    <Icon name="loading" size="lg" className="text-surface-400 animate-spin mx-auto mb-2" />
                    <p className="text-surface-600">Loading models...</p>
                  </div>
                )}
                
                {!isLoading && availableModels.length === 0 && (
                  <Card variant="outlined" padding="lg">
                    <div className="text-center py-8">
                      <Icon name="folder" size="xl" className="text-surface-400 mx-auto mb-3" />
                      <p className="text-surface-600 text-lg mb-2">No models found</p>
                      <p className="text-surface-500 text-sm">Create your first model to get started!</p>
                    </div>
                  </Card>
                )}
                
                {!isLoading && availableModels.length > 0 && (
                  <div className="space-y-3">
                    {availableModels.map((model) => (
                      <Card key={model.id} variant="outlined" padding="lg" className="hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="folder" size="sm" className="text-white" />
                              </div>
                              <h4 className="font-semibold text-surface-900 truncate">{model.name}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-surface-600">
                              <span>Created: {formatDate(model.created_at)}</span>
                              <span>•</span>
                              <span>{model.nodes.length} nodes</span>
                              <span>•</span>
                              <span>{model.edges.length} edges</span>
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleLoad(model.id)}
                            disabled={isLoading}
                            leftIcon={<Icon name="download" size="sm" />}
                          >
                            Load
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ModelManager; 