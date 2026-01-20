import { useEstimateStore } from '../store/estimateStore';
import styles from './Header.module.css';

interface HeaderProps {
  onNewEstimate: () => void;
}

export default function Header({ onNewEstimate }: HeaderProps) {
  const { exportToExcel, importFromExcel, estimates } = useEstimateStore();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className="heading-2">Estimate Manager</h1>
          <span className="text-sm">{estimates.length} Estimate{estimates.length !== 1 ? 's' : ''}</span>
        </div>

        <div className={styles.actions}>
          <button onClick={importFromExcel} className={styles.btnSecondary}>
            Import from Excel
          </button>
          <button 
            onClick={exportToExcel} 
            className={styles.btnSecondary}
            disabled={estimates.length === 0}
          >
            Export to Excel
          </button>
          <button onClick={onNewEstimate} className={styles.btnPrimary}>
            + New Estimate
          </button>
        </div>
      </div>
    </header>
  );
}
