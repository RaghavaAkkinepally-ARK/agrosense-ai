import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import PlantAnalysis from './pages/PlantAnalysis';
import AnalysisResults from './pages/AnalysisResults';
import AnalysisHistory from './pages/AnalysisHistory';
import Dashboard from './pages/Dashboard';
import AboutSystem from './pages/AboutSystem';
import Field3DCanvas from './components/FieldTwin/Field3DCanvas';
import { analyzePlantHealth } from './services/aiInference';
import { getApiUrl } from './services/config';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [logs, setLogs] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('agrosense_lang') || 'en';
  });

  const handleLangChange = (newLang) => {
    setCurrentLang(newLang);
    localStorage.setItem('agrosense_lang', newLang);
  };

  // Load genuine analyses from backend database
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/analyses`);
        if (!response.ok) {
          throw new Error('API server status check failed');
        }
        const data = await response.json();
        setLogs(data);
        setBackendStatus('online');
      } catch (err) {
        console.warn('[API Fetch] Failed to connect to server database:', err);
        setBackendStatus('offline');
        const cachedLogs = localStorage.getItem('agrosense_logs');
        if (cachedLogs) {
          try {
            setLogs(JSON.parse(cachedLogs));
          } catch (e) {
            setLogs([]);
          }
        } else {
          setLogs([]);
        }
      }
    };
    fetchAnalyses();
  }, []);

  // Poll backend status check every 10 seconds
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/status`);
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (err) {
        setBackendStatus('offline');
      }
    };

    const intervalId = setInterval(checkStatus, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStartAnalysis = async (params, image) => {
    setIsSubmitting(true);
    try {
      const resultObj = await analyzePlantHealth(params, image, currentLang);
      setLogs(prevLogs => [resultObj, ...prevLogs]);
      setCurrentResult(resultObj);
      setActivePage('results');
    } catch (err) {
      console.error(err);
      alert(err.message || 'An error occurred during diagnostics analysis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewResult = (logRecord) => {
    setCurrentResult(logRecord);
    setActivePage('results');
  };

  const handleDeleteLog = async (logId) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/analyses/${logId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete on backend');
      }
    } catch (err) {
      console.error('[API Fetch] Deletion on database crashed:', err);
    }

    const updated = logs.filter(log => log.id !== logId);
    setLogs(updated);

    if (currentResult && currentResult.id === logId) {
      setCurrentResult(null);
    }
  };

  // Compile calculations to pass to landing metrics
  const getStats = () => {
    const totalCount = logs.length;
    if (totalCount === 0) {
      return { totalCount: 0, diseaseRate: 0, alertLevel: 'Clear' };
    }
    const infectedCount = logs.filter(log => log.status !== 'Healthy').length;
    const diseaseRate = (infectedCount / totalCount) * 100;

    let alertLevel = 'Low';
    if (diseaseRate > 50) {
      alertLevel = 'High';
    } else if (diseaseRate > 20) {
      alertLevel = 'Medium';
    }

    return {
      totalCount,
      diseaseRate,
      alertLevel
    };
  };

  const stats = getStats();

  // Route Views Page Swapper
  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage navigateTo={setActivePage} stats={stats} currentLang={currentLang} />;
      case 'analysis':
        return (
          <PlantAnalysis
            onAnalysisComplete={(res) => {
              setLogs(prev => [res, ...prev]);
              setCurrentResult(res);
              setActivePage('results');
            }}
            selectedLanguage={currentLang}
            onLanguageChange={handleLangChange}
          />
        );
      case 'field_twin':
        return <Field3DCanvas />;
      case 'results':
        return (
          <AnalysisResults
            result={currentResult}
            onBackToAnalysis={() => setActivePage('analysis')}
            onNavigateTo={setActivePage}
            currentLang={currentLang}
          />
        );
      case 'history':
        return (
          <AnalysisHistory
            logs={logs}
            onViewResult={handleViewResult}
            onDeleteLog={handleDeleteLog}
            onNavigateTo={setActivePage}
            currentLang={currentLang}
          />
        );
      case 'dashboard':
        return <Dashboard logs={logs} onNavigateTo={setActivePage} currentLang={currentLang} />;
      case 'about':
        return <AboutSystem currentLang={currentLang} />;
      default:
        return <LandingPage navigateTo={setActivePage} stats={stats} currentLang={currentLang} />;
    }
  };

  return (
    <Layout
      activePage={activePage}
      navigateTo={setActivePage}
      hasLatestResult={!!currentResult}
      backendStatus={backendStatus}
      currentLang={currentLang}
      onLangChange={handleLangChange}
    >
      {renderPage()}
    </Layout>
  );
}
