import { useEstimateStore } from '../store/estimateStore';
import styles from './EstimateList.module.css';

interface EstimateListProps {
  onEdit: () => void;
}

export default function EstimateList({ onEdit }: EstimateListProps) {
  const { estimates, isLoading, deleteEstimate, setSelectedEstimate } = useEstimateStore();

  const handleEdit = (estimate: any) => {
    setSelectedEstimate(estimate);
    onEdit();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this estimate?')) {
      await deleteEstimate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.spinner}></div>
        <p className="text-base">Loading estimates...</p>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <h3 className="heading-3">No estimates yet</h3>
        <p className="text-sm">Create your first estimate to get started</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.estimateGrid}>
        {estimates.map((estimate) => (
          <div key={estimate.id} className={styles.estimateCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.clientName}>{estimate.clientName}</h3>
                <p className={styles.projectName}>{estimate.projectName}</p>
              </div>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleEdit(estimate)}
                  className={styles.btnEdit}
                  title="Edit estimate"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(estimate.id)}
                  className={styles.btnDelete}
                  title="Delete estimate"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.itemsList}>
                <div className={styles.itemsLabel}>Items ({estimate.items.length})</div>
                {estimate.items.slice(0, 3).map((item, index) => (
                  <div key={index} className={styles.item}>
                    <span className={styles.itemDescription}>{item.description}</span>
                    <span className={styles.itemAmount}>${item.amount.toFixed(2)}</span>
                  </div>
                ))}
                {estimate.items.length > 3 && (
                  <div className={styles.moreItems}>
                    +{estimate.items.length - 3} more item{estimate.items.length - 3 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.totalSection}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalAmount}>${estimate.totalAmount.toFixed(2)}</span>
              </div>
              <div className={styles.dateInfo}>
                <span className="text-xs">Updated: {formatDate(estimate.updatedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
