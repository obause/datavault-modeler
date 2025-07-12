import React from 'react';
import Icon from './Icon';

interface SplashScreenProps {
  isLoading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="text-center space-y-8">
        {/* Three main components with their colors */}
        <div className="flex items-center justify-center gap-6">
          {/* Hub */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2d2382] to-[#1e1b4b] rounded-xl flex items-center justify-center shadow-lg border border-white/10">
              <Icon name="hub" size="lg" className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-300">Hub</span>
          </div>

          {/* Link */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00aabe] to-[#0891b2] rounded-xl flex items-center justify-center shadow-lg border border-white/10">
              <Icon name="link" size="lg" className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-300">Link</span>
          </div>

          {/* Satellite */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center shadow-lg border border-white/10">
              <Icon name="satellite" size="lg" className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-300">Satellite</span>
          </div>
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-100">
            Data Vault Modeler
          </h1>
          <p className="text-slate-300 text-lg">
            Data Vault Modeling Tool
          </p>
        </div>

        {/* Simple loading indicator */}
        <div className="flex justify-center">
          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Creator credit at bottom */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-slate-500">Created by Ole Bause</p>
      </div>
    </div>
  );
};

export default SplashScreen; 