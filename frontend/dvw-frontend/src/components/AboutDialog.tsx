import React, { useState, useEffect } from 'react';
import Card from './Card';
import Icon from './Icon';
import Button from './Button';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  const [easterEggTriggered, setEasterEggTriggered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Reset easter egg when dialog opens
  useEffect(() => {
    if (isOpen) {
      setEasterEggTriggered(false);
      setClickCount(0);
    }
  }, [isOpen]);

  const handleEasterEggClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) {
      setEasterEggTriggered(true);
      // Reset after 5 seconds
      setTimeout(() => setEasterEggTriggered(false), 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card variant="elevated" className="w-96 max-w-[90vw] max-h-[90vh] overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-surface-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-900 to-primary-800 rounded-lg flex items-center justify-center">
                <Icon name="info" size="sm" className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-surface-900">About</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-surface-500 hover:text-surface-700"
            >
              <Icon name="close" size="sm" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* App Info */}
            <div className="text-center space-y-3">
              <div className="flex justify-center gap-4 mb-4">
                {/* Hub Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-primary-900 to-primary-800 rounded-lg flex items-center justify-center">
                  <Icon name="hub" size="sm" className="text-white" />
                </div>
                {/* Link Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-600 to-secondary-700 rounded-lg flex items-center justify-center">
                  <Icon name="link" size="sm" className="text-white" />
                </div>
                {/* Satellite Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg flex items-center justify-center">
                  <Icon name="satellite" size="sm" className="text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-surface-900">Data Vault Modeler</h3>
              <p className="text-surface-600 text-sm">
                A powerful tool for creating and managing Data Vault models with an intuitive interface.
              </p>
            </div>

            {/* Author Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">
                Created by
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">OB</span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Ole Bause</p>
                    <p className="text-sm text-surface-600">BI Consultant @ Scalefree</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <a 
                    href="mailto:ole@bause.me"
                    className="flex items-center gap-2 p-2 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                  >
                    <Icon name="mail" size="sm" />
                    <span className="text-sm">ole@bause.me</span>
                  </a>
                  <a 
                    href="https://bause.me" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                  >
                    <Icon name="external-link" size="sm" />
                    <span className="text-sm">bause.me</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Easter Egg Trigger */}
            <div 
              className="text-center cursor-pointer"
              onClick={handleEasterEggClick}
            >
              <p className="text-xs text-surface-400 hover:text-surface-600 transition-colors">
                Click me {clickCount > 0 ? `${5 - clickCount} more times` : '5 times'}
              </p>
            </div>
          </div>
        </div>

        {/* Easter Egg Animation */}
        {easterEggTriggered && (
          <div className="fixed inset-0 pointer-events-none z-[60]">
            {/* Floating Data Vault Icons - Bigger and More */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${1.5 + Math.random() * 3}s`,
                }}
              >
                <div className={`
                  w-16 h-16 rounded-xl flex items-center justify-center shadow-lg
                  ${i % 3 === 0 ? 'bg-gradient-to-br from-primary-900 to-primary-800' : ''}
                  ${i % 3 === 1 ? 'bg-gradient-to-br from-secondary-600 to-secondary-700' : ''}
                  ${i % 3 === 2 ? 'bg-gradient-to-br from-warning-500 to-warning-600' : ''}
                `}>
                  <Icon 
                    name={i % 3 === 0 ? 'hub' : i % 3 === 1 ? 'link' : 'satellite'} 
                    size="lg" 
                    className="text-white" 
                  />
                </div>
              </div>
            ))}
            
            {/* Large Floating Icons - Even Bigger */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`large-${i}`}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              >
                <div className={`
                  w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl
                  ${i % 3 === 0 ? 'bg-gradient-to-br from-primary-800 to-primary-900' : ''}
                  ${i % 3 === 1 ? 'bg-gradient-to-br from-secondary-500 to-secondary-600' : ''}
                  ${i % 3 === 2 ? 'bg-gradient-to-br from-warning-400 to-warning-500' : ''}
                `}>
                  <Icon 
                    name={i % 3 === 0 ? 'hub' : i % 3 === 1 ? 'link' : 'satellite'} 
                    size="xl" 
                    className="text-white" 
                  />
                </div>
              </div>
            ))}
            
            {/* Confetti - Much More */}
            {[...Array(80)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${4 + Math.random() * 8}px`,
                  height: `${4 + Math.random() * 8}px`,
                  backgroundColor: ['#2d2382', '#00aabe', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][Math.floor(Math.random() * 6)],
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${1.5 + Math.random() * 3}s`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                }}
              />
            ))}
            
            {/* Sparkles */}
            {[...Array(50)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  backgroundColor: '#ffffff',
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                  borderRadius: '50%',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                }}
              />
            ))}
            
            {/* Floating Text Elements */}
            {[...Array(15)].map((_, i) => (
              <div
                key={`text-${i}`}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <div className="text-2xl font-bold text-white drop-shadow-lg">
                  {['🎉', '✨', '🚀', '💫', '⭐', '🌟', '🎊', '🎈', '🎁', '🏆', '💎', '🔥', '⚡', '🌈', '🎯'][i]}
                </div>
              </div>
            ))}
            
            {/* Success Message - Bigger and More Prominent */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-surface-200 animate-pulse">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <p className="text-xl font-bold text-surface-900 mb-2">You found the easter egg!</p>
                  <p className="text-sm text-surface-600">Data Vault magic is everywhere!</p>
                </div>
              </div>
            </div>
            
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-warning-500/20 animate-pulse"></div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AboutDialog; 