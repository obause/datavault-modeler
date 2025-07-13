import React, { useState, useEffect } from 'react';
import Button from './Button';
import Card from './Card';
import Icon from './Icon';
import useStore from '../store/modelStore';
import type { UpdateSettings } from '../api';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    settingsLoading,
    settingsError,
    loadSettings,
    updateSettings,
    resetSettings,
  } = useStore();

  const [formData, setFormData] = useState<UpdateSettings>({});
  const [isDirty, setIsDirty] = useState(false);

  // Load settings when component mounts or when it opens
  useEffect(() => {
    if (isOpen && !settings) {
      loadSettings();
    }
  }, [isOpen, settings, loadSettings]);

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        theme: settings.theme,
        auto_save: settings.auto_save,
        auto_save_interval: settings.auto_save_interval,
        snap_to_grid: settings.snap_to_grid,
        grid_size: settings.grid_size,
        edge_type: settings.edge_type,
        floating_edges: settings.floating_edges,
        edge_animation: settings.edge_animation,
        show_connection_points: settings.show_connection_points,
      });
      setIsDirty(false);
    }
  }, [settings]);

  const handleInputChange = (field: keyof UpdateSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (isDirty) {
      await updateSettings(formData);
      setIsDirty(false);
    }
  };

  const handleReset = async () => {
    await resetSettings();
    setIsDirty(false);
  };

  const handleCancel = () => {
    if (settings) {
      setFormData({
        theme: settings.theme,
        auto_save: settings.auto_save,
        auto_save_interval: settings.auto_save_interval,
        snap_to_grid: settings.snap_to_grid,
        grid_size: settings.grid_size,
        edge_type: settings.edge_type,
        floating_edges: settings.floating_edges,
        edge_animation: settings.edge_animation,
        show_connection_points: settings.show_connection_points,
      });
      setIsDirty(false);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-900 to-primary-800 rounded-lg flex items-center justify-center">
                <Icon name="settings" size="md" className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-surface-900">Settings</h2>
                <p className="text-sm text-surface-600">Configure your application preferences</p>
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
          {settingsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2">
                <Icon name="close" size="sm" className="text-red-500 flex-shrink-0" />
                <span className="text-red-800 text-sm">{settingsError}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {settingsLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
            </div>
          )}

          {/* Settings Form */}
          {settings && !settingsLoading && (
            <div className="space-y-6">
              {/* Display Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Display Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={formData.theme || 'light'}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Canvas Settings */}
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Canvas Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="auto_save"
                      checked={formData.auto_save || false}
                      onChange={(e) => handleInputChange('auto_save', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="auto_save" className="text-sm font-medium text-surface-700">
                      Auto-save models
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Auto-save interval (seconds)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={formData.auto_save_interval || 30}
                      onChange={(e) => handleInputChange('auto_save_interval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="snap_to_grid"
                      checked={formData.snap_to_grid || false}
                      onChange={(e) => handleInputChange('snap_to_grid', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="snap_to_grid" className="text-sm font-medium text-surface-700">
                      Snap to grid
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Grid size
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="32"
                      value={formData.grid_size || 16}
                      onChange={(e) => handleInputChange('grid_size', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_connection_points"
                      checked={formData.show_connection_points ?? true}
                      onChange={(e) => handleInputChange('show_connection_points', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="show_connection_points" className="text-sm font-medium text-surface-700">
                      Show connection points
                    </label>
                  </div>
                </div>
              </div>

              {/* Edge Settings */}
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Edge Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Edge Type
                    </label>
                    <select
                      value={formData.edge_type || 'smoothstep'}
                      onChange={(e) => handleInputChange('edge_type', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="bezier">Bezier</option>
                      <option value="straight">Straight</option>
                      <option value="step">Step</option>
                      <option value="smoothstep">Smooth Step</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="floating_edges"
                      checked={formData.floating_edges || false}
                      onChange={(e) => handleInputChange('floating_edges', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="floating_edges" className="text-sm font-medium text-surface-700">
                      Floating edges
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="edge_animation"
                      checked={formData.edge_animation || false}
                      onChange={(e) => handleInputChange('edge_animation', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="edge_animation" className="text-sm font-medium text-surface-700">
                      Edge animation
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-surface-200">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={settingsLoading}
              leftIcon={<Icon name="refresh" size="sm" />}
            >
              Reset to Defaults
            </Button>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={settingsLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!isDirty || settingsLoading}
                leftIcon={<Icon name="save" size="sm" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings; 