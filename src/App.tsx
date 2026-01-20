import { useEffect, useState } from 'react';
import { useEstimateStore } from './store/estimateStore';
import EstimateForm from './components/EstimateForm';
import EstimateList from './components/EstimateList';
import Header from './components/Header';
import styles from './App.module.css';

export default function App() {
  const { loadEstimates, error, setError } = useEstimateStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadEstimates();
  }, [loadEstimates]);

  return (
    <div className={styles.app}>
      <Header onNewEstimate={() => setShowForm(true)} />
      
      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.closeError}>
            ×
          </button>
        </div>
      )}

      <div className={styles.content}>
        {showForm ? (
          <EstimateForm onClose={() => setShowForm(false)} />
        ) : (
          <EstimateList onEdit={() => setShowForm(true)} />
        )}
      </div>
    </div>
  );
}
