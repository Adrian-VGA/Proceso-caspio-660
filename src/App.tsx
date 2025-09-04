import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ProjectionView from './components/ProjectionView';
import InternalView from './components/InternalView';
import RemoteAdmin from './components/RemoteAdmin';
import MobileRemoteControl from './components/MobileRemoteControl';
import ParticipantDatabase from './components/ParticipantDatabase';
import GoalsConfiguration from './components/GoalsConfiguration';
import ProgressManager from './components/ProgressManager';
import { SurveyData } from './types/survey';
import { getCurrentUser, logout, saveCurrentUser } from './services/userService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'projection' | 'internal' | 'remote' | 'database' | 'goals' | 'progress'>('main');
  const [isProjectionMode, setIsProjectionMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    'G6-8': 0,
    'G9-11': 0,
    'G12-14': 0,
    'G15-18': 0,
    'G19+': 0,
    'STAFF': 0
  });

  const [goals, setGoals] = useState<SurveyData>({
    'G6-8': 30,
    'G9-11': 46,
    'G12-14': 41,
    'G15-18': 46,
    'G19+': 44,
    'STAFF': 14
  });

  // Load user session and data on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Load user-specific data
      const userSurveyData = localStorage.getItem(`surveyData_${user.username}`);
      const userGoals = localStorage.getItem(`userGoals_${user.username}`);
      const userParticipantData = localStorage.getItem(`participantData_${user.username}`);
      
      if (userSurveyData) {
        setSurveyData(JSON.parse(userSurveyData));
      }
      if (userGoals) {
        setGoals(JSON.parse(userGoals));
      }
    }
  }, []);

  // Check URL parameters for projection mode and authentication
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const auth = urlParams.get('auth');
    const project = urlParams.get('project');
    
    if (mode === 'projection' && auth === 'true') {
      if (project && getCurrentUser()?.username === project) {
        setIsAuthenticated(true);
        setIsProjectionMode(true);
        setCurrentView('projection');
      }
      
      // Load data from URL parameters
      const dataParam = urlParams.get('data');
      const goalsParam = urlParams.get('goals');
      if (dataParam) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(dataParam));
          setSurveyData(decodedData);
        } catch (error) {
          console.error('Error parsing data from URL:', error);
        }
      }
      if (goalsParam) {
        try {
          const decodedGoals = JSON.parse(decodeURIComponent(goalsParam));
          setGoals(decodedGoals);
        } catch (error) {
          console.error('Error parsing goals from URL:', error);
        }
      }
    } else if (mode === 'remote') {
      const sessionId = urlParams.get('session');
      const project = urlParams.get('project');
      if (sessionId && project) {
        setCurrentView('remote');
        setCurrentUser({ username: project, projectNumber: project });
        setIsAuthenticated(true);
        
        // Load data for remote session
        const savedData = localStorage.getItem(`surveyData_${project}`);
        const savedGoals = localStorage.getItem(`userGoals_${project}`);
        if (savedData) {
          setSurveyData(JSON.parse(savedData));
        }
        if (savedGoals) {
          setGoals(JSON.parse(savedGoals));
        } else {
          // Si no hay metas guardadas, usar las por defecto
          const defaultGoals = {
            'G6-8': 30,
            'G9-11': 46,
            'G12-14': 41,
            'G15-18': 46,
            'G19+': 44,
            'STAFF': 14
          };
          setGoals(defaultGoals);
        }
      }
    }
  }, []);

  // Save data to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`surveyData_${currentUser.username}`, JSON.stringify(surveyData));
    }
    
    // Broadcast changes to other windows/tabs
    window.dispatchEvent(new CustomEvent('surveyDataUpdate', {
      detail: { surveyData, project: currentUser?.username }
    }));
  }, [surveyData, currentUser]);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`userGoals_${currentUser.username}`, JSON.stringify(goals));
    }
  }, [goals, currentUser]);

  // Listen for data updates from other windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (currentUser && e.key === `surveyData_${currentUser.username}` && e.newValue) {
        setSurveyData(JSON.parse(e.newValue));
      }
      if (currentUser && e.key === `userGoals_${currentUser.username}` && e.newValue) {
        setGoals(JSON.parse(e.newValue));
      }
    };

    const handleCustomUpdate = (e: CustomEvent) => {
      if (currentUser && e.detail.project === currentUser.username) {
        setSurveyData(e.detail.surveyData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('surveyDataUpdate', handleCustomUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('surveyDataUpdate', handleCustomUpdate as EventListener);
    };
  }, [currentUser]);

  const handleLogin = (username: string, projectNumber: string) => {
    saveCurrentUser(username, projectNumber);
    setCurrentUser({ username, projectNumber });
    setIsAuthenticated(true);
  };

  const openProjectionWindow = () => {
    const dataParam = encodeURIComponent(JSON.stringify(surveyData));
    const goalsParam = encodeURIComponent(JSON.stringify(goals));
    const url = `${window.location.origin}${window.location.pathname}?mode=projection&auth=true&project=${currentUser?.username}&data=${dataParam}&goals=${goalsParam}`;
    
    window.open(url, 'projection', 'width=1920,height=1080,fullscreen=yes,toolbar=no,menubar=no,scrollbars=no,resizable=yes');
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('main');
  };

  if (!isAuthenticated && currentView !== 'remote') {
    return <Login onLogin={handleLogin} />;
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
    const project = new URLSearchParams(window.location.search).get('project') || '';
    return <MobileRemoteControl 
      sessionId={sessionId}
      projectNumber={project}
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
        currentUser={currentUser}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'database') {
    return (
      <ParticipantDatabase 
        currentUser={currentUser}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'goals') {
    return (
      <GoalsConfiguration 
        goals={goals}
        setGoals={setGoals}
        currentUser={currentUser}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'progress') {
    return (
      <ProgressManager 
        surveyData={surveyData}
        setSurveyData={setSurveyData}
        goals={goals}
        setGoals={setGoals}
        currentUser={currentUser}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
        {/* User Info Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-white">
            <div className="text-sm text-blue-200">Proyecto:</div>
            <div className="text-lg font-bold">{currentUser?.projectNumber}</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/30 text-white rounded-lg hover:bg-red-500/40 transition-all duration-300"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">
            LA LOGÍSTICA DE CASPIO PROYECTO {currentUser?.projectNumber}
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

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView('goals')}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">🎯</span>
                <span className="text-sm">CONFIGURAR METAS</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('progress')}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">💾</span>
                <span className="text-sm">GESTIONAR PROGRESOS</span>
              </div>
            </button>
          </div>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-white/70 text-sm">2025 By AVG TECH</p>
        </footer>
      </div>
    </div>
  );
}

export default App;