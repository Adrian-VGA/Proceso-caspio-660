import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ProjectionView from './components/ProjectionView';
import InternalView from './components/InternalView';
import RemoteAdmin from './components/RemoteAdmin';
import MobileRemoteControl from './components/MobileRemoteControl';
import ParticipantDatabase from './components/ParticipantDatabase';
import { SurveyData } from './types/survey';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'projection' | 'internal' | 'remote' | 'database'>('main');
  const [isProjectionMode, setIsProjectionMode] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    'G6-8': 0,
    'G9-11': 0,
    'G12-14': 0,
    'G15-18': 0,
    'G19+': 0,
    'STAFF': 0
  });

  const goals = {
    'G6-8': 30,
    'G9-11': 46,
    'G12-14': 41,
    'G15-18': 46,
    'G19+': 44,
    'STAFF': 14
  };

  // Check URL parameters for projection mode and authentication
  const handleLogin = async (success: boolean, username?: string) => {
    if (!success || !username) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const auth = urlParams.get('auth');
    const user = urlParams.get('user') || currentUser;
    
    if (mode === 'projection' && auth === 'true') {
      setIsAuthenticated(true);
      setIsProjectionMode(true);
      setCurrentView('projection');
      
      // Load data from URL parameters
      const dataParam = urlParams.get('data');
      if (dataParam) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(dataParam));
          setSurveyData(decodedData);
        } catch (error) {
          console.error('Error parsing data from URL:', error);
        }
      }
      const savedData = localStorage.getItem(`surveyData_${user}`);
    } else if (mode === 'remote') {
      const sessionId = urlParams.get('session');
      if (sessionId) {
        setCurrentView('remote');
        // Load data for remote session
        const savedData = localStorage.getItem('surveyData');
        if (savedData) {
          setSurveyData(JSON.parse(savedData));
        }
      }
    }
      
    // Auto-save to user profile
    if (userProfile) {
      const updatedProfile = { ...userProfile, surveyData };
      saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
    }
  };

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
    
    // Broadcast changes to other windows/tabs
    window.dispatchEvent(new CustomEvent('surveyDataUpdate', { 
      detail: surveyData 
    }));
  }, [surveyData]);

  // Listen for data updates from other windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'surveyData' && e.newValue) {
        setSurveyData(JSON.parse(e.newValue));
      }
    };

    const handleCustomUpdate = (e: CustomEvent) => {
      setSurveyData(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('surveyDataUpdate', handleCustomUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('surveyDataUpdate', handleCustomUpdate as EventListener);
    };
  }, []);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`surveyData_${currentUser}`);
    if (savedData) {
      setSurveyData(JSON.parse(savedData));
    }
  }, [currentUser]);

  const openProjectionWindow = () => {
    const dataParam = encodeURIComponent(JSON.stringify(surveyData));
    const url = `${window.location.origin}${window.location.pathname}?mode=projection&auth=true&data=${dataParam}`;
    
    window.open(url, 'projection', 'width=1920,height=1080,fullscreen=yes,toolbar=no,menubar=no,scrollbars=no,resizable=yes');
  };

  if (!isAuthenticated && currentView !== 'remote') {
    return <Login onLogin={setIsAuthenticated} />;
  }

  if (isProjectionMode || currentView === 'projection') {
    return (
      <ProjectionView 
        surveyData={surveyData} 
        goals={goals} 
        currentUser={currentUser}
        onBack={() => setCurrentView('main')}
        isStandalone={isProjectionMode}
      />
    );
  }

  if (currentView === 'remote') {
    const sessionId = new URLSearchParams(window.location.search).get('session') || '';
    return <MobileRemoteControl 
      sessionId={sessionId}
      currentUser={currentUser}
      surveyData={surveyData}
      setSurveyData={setSurveyData} 
      goals={goals} 
    />;
  }

  if (currentView === 'internal') {
    return (
      <InternalView 
        surveyData={surveyData} 
        setSurveyData={setSurveyData} 
        goals={goals}
        currentUser={currentUser}
        userProfile={userProfile}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'remoteAdmin') {
    return (
      <RemoteAdmin 
        surveyData={surveyData}
        setSurveyData={setSurveyData}
        goals={goals}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'database') {
    return (
      <ParticipantDatabase 
        onBack={() => setCurrentView('main')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">
            LA LOGÍSTICA DE CASPIO 660
          </h1>
          <p className="text-xl text-blue-200">Sistema de Gestión de Encuestas</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('projection')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">📊</span>
              <span className="text-xl">PROYECTAR GRÁFICAS</span>
            </div>
          </button>

          <button
            onClick={openProjectionWindow}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-xl">🖥️</span>
              <span className="text-lg">ABRIR EN PANTALLA EXTERNA</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('internal')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">⚙️</span>
              <span className="text-xl">ADMINISTRACIÓN INTERNA</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('remoteAdmin')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">📱</span>
              <span className="text-xl">ADMINISTRACIÓN REMOTA (QR)</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('database')}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">🗃️</span>
              <span className="text-xl">BASE DE PARTICIPANTES</span>
            </div>
          </button>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-white/70 text-sm">2025 By AVG TECH</p>
        </footer>
      </div>
    </div>
  );
}

export default App;