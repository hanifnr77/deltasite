
import React, { useState, useEffect } from 'react';
import { fetchAllData, saveAllData } from './services/storageService';
import { Block, UserProfile, SocialLinkItem } from './types';
import { PublicView } from './components/public/PublicView';
import { AdminView } from './components/admin/AdminView';
import { LoginView } from './components/admin/LoginView';
import { Settings, ExternalLink } from 'lucide-react';
import { ToastProvider, useToast } from './components/ui/Toast';

// Internal component to use toast context logic
const AppContent: React.FC = () => {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { addToast } = useToast();
  
  // Data State
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [socials, setSocials] = useState<SocialLinkItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: '', bio: '', avatarUrl: '', themeColor: 'green', adminPassword: 'admin'
  });
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllData();
        setBlocks(data.blocks);
        setProfile(data.profile);
        setSocials(data.socials);
      } catch (error) {
        console.error("Failed to load data", error);
        addToast("Gagal memuat data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Centralized Save Function
  const persistData = async (newBlocks: Block[], newProfile: UserProfile, newSocials: SocialLinkItem[]) => {
    // Optimistic UI Update
    setBlocks(newBlocks);
    setProfile(newProfile);
    setSocials(newSocials);

    // Background Save
    setIsSaving(true);
    try {
      await saveAllData(newBlocks, newProfile, newSocials);
      // Removed generic success toast here to avoid spamming on every keystroke
      // Specific actions (like adding block) will trigger their own toasts
    } catch (err) {
      console.error("Save failed", err);
      addToast("Gagal menyimpan perubahan", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBlocks = (newBlocks: Block[]) => {
    persistData(newBlocks, profile, socials);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    persistData(blocks, newProfile, socials);
  };

  const handleUpdateSocials = (newSocials: SocialLinkItem[]) => {
    persistData(blocks, profile, newSocials);
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('public');
    addToast("Berhasil keluar", "info");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800">
        <div className="w-16 h-16 relative">
           <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-emerald-500 animate-spin"></div>
           <div className="absolute inset-2 rounded-full border-b-2 border-r-2 border-teal-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
        <p className="mt-4 font-heading font-bold text-sm animate-pulse text-emerald-700 tracking-widest">MENGHUBUNGKAN DATABASE...</p>
      </div>
    );
  }

  // Logic to determine what to show based on view state and auth
  const renderContent = () => {
    if (view === 'public') {
      return <PublicView blocks={blocks} profile={profile} socials={socials} />;
    }

    if (!isAuthenticated) {
      return <LoginView onLogin={() => { setIsAuthenticated(true); addToast("Selamat datang Admin!", "success"); }} expectedPassword={profile.adminPassword} />;
    }

    // Admin View
    return (
      <AdminView 
        blocks={blocks} 
        profile={profile}
        socials={socials}
        onUpdateBlocks={handleUpdateBlocks}
        onUpdateProfile={handleUpdateProfile}
        onUpdateSocials={handleUpdateSocials}
        onLogout={handleLogout}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* View Switcher */}
      {(!isAuthenticated || view === 'public') && (
        <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={() => setView(view === 'public' ? 'admin' : 'public')}
            className={`
              flex items-center gap-2 px-4 py-2 backdrop-blur-lg border rounded-full transition-all shadow-lg 
              ${view === 'admin' && isAuthenticated 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-white/80 text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-600'
              }
            `}
          >
            {view === 'public' ? (
              <>
                <Settings size={16} />
                <span className="font-heading font-bold text-xs">Admin</span>
              </>
            ) : (
              <>
                <ExternalLink size={16} />
                <span className="font-heading font-bold text-xs">Lihat Web</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <div className="fixed bottom-4 left-4 z-50 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-pulse">
           <div className="w-2 h-2 bg-white rounded-full"></div> Menyimpan ke Spreadsheet...
        </div>
      )}

      {/* Main Content Area */}
      <main>
        {renderContent()}
      </main>

    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
