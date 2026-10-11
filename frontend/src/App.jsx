import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RoutineModal } from './components/RoutineModal';
import { DashboardPage } from './pages/DashboardPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProgressPage } from './pages/ProgressPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { registerServiceWorker, triggerForegroundNotification } from './services/notifications';
import { notificationAPI } from './services/api';

function MainApp() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState(null);

  // Register service worker on startup
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Foreground notification check: periodically checks if new unread due notifications arrived
  useEffect(() => {
    if (!user) return;

    let lastKnownIds = new Set();
    const checkForegroundAlerts = async () => {
      try {
        const notifs = await notificationAPI.getAll();
        if (Array.isArray(notifs)) {
          const unread = notifs.filter(n => !n.isRead);
          for (const item of unread) {
            if (!lastKnownIds.has(item.id)) {
              lastKnownIds.add(item.id);
              triggerForegroundNotification(item.title, item.message);
              showToast(`${item.title}: ${item.message}`, 'info', 6000);
            }
          }
        }
      } catch (e) {
        // quiet error
      }
    };

    const interval = setInterval(checkForegroundAlerts, 20000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleOpenAddModal = () => {
    setRoutineToEdit(null);
    setModalOpen(true);
  };

  const handleEditRoutine = (routine) => {
    setRoutineToEdit(routine);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          onQuickAdd={handleOpenAddModal}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onOpenAddModal={handleOpenAddModal}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'routines' && (
            <RoutinesPage
              onOpenAddModal={handleOpenAddModal}
              onEditRoutine={handleEditRoutine}
            />
          )}

          {currentTab === 'calendar' && <CalendarPage />}

          {currentTab === 'progress' && <ProgressPage />}

          {currentTab === 'notifications' && <NotificationsPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Routine Add / Edit Modal */}
      <RoutineModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        routineToEdit={routineToEdit}
        onSaved={() => {
          // Triggers refresh in subviews
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
