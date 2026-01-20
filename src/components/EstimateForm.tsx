import { useState, useEffect } from 'react';
import { useEstimateStore } from '../store/estimateStore';
import styles from './EstimateForm.module.css';

interface EstimateFormProps {
  onClose: () => void;
}

interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function EstimateForm({ onClose }: EstimateFormProps) {
  const { selectedEstimate, saveEstimate, updateEstimate, setSelectedEstimate } = useEstimateStore();
  
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [items, setItems] = useState<EstimateItem[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0 }
  ]);

  useEffect(() => {
    if (selectedEstimate) {
      setClientName(selectedEstimate.clientName);
      setProjectName(selectedEstimate.projectName);
      setItems(selectedEstimate.items);
    }
  }, [selectedEstimate]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof EstimateItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? Number(value) : newItems[index].unitPrice;
      newItems[index].amount = quantity * unitPrice;
    }
    
    setItems(newItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const estimate = {
      clientName,
      projectName,
      items,
      totalAmount: getTotalAmount(),
    };

    if (selectedEstimate) {
      await updateEstimate({ 
        ...selectedEstimate,
        clientName: estimate.clientName,
        projectName: estimate.projectName,
        items: estimate.items,
        totalAmount: estimate.totalAmount,
        updatedAt: new Date().toISOString()
      });
    } else {
      await saveEstimate(estimate);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setSelectedEstimate(null);
    onClose();
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className="heading-2">{selectedEstimate ? 'Edit Estimate' : 'New Estimate'}</h2>
        <button onClick={handleClose} className={styles.closeBtn}>×</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="clientName" className={styles.label}>Client Name *</label>
              <input
                id="clientName"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className={styles.input}
                placeholder="Enter client name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="projectName" className={styles.label}>Project Name *</label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className={styles.input}
                placeholder="Enter project name"
              />
            </div>
          </div>
        </div>

        <div className={styles.itemsSection}>
          <div className={styles.itemsHeader}>
            <h3 className="heading-3">Estimate Items</h3>
            <button type="button" onClick={addItem} className={styles.addItemBtn}>
              + Add Item
            </button>
          </div>

          <div className={styles.itemsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.colDescription}>Description</div>
              <div className={styles.colQuantity}>Quantity</div>
              <div className={styles.colUnitPrice}>Unit Price</div>
              <div className={styles.colAmount}>Amount</div>
              <div className={styles.colActions}>Actions</div>
            </div>

            {items.map((item, index) => (
              <div key={index} className={styles.tableRow}>
                <div className={styles.colDescription}>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                    className={styles.input}
                    placeholder="Item description"
                  />
                </div>
                <div className={styles.colQuantity}>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className={styles.inputNumber}
                  />
                </div>
                <div className={styles.colUnitPrice}>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className={styles.inputNumber}
                  />
                </div>
                <div className={styles.colAmount}>
                  <span className={styles.amount}>${item.amount.toFixed(2)}</span>
                </div>
                <div className={styles.colActions}>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className={styles.removeBtn}
                    disabled={items.length === 1}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Amount:</span>
            <span className={styles.totalAmount}>${getTotalAmount().toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={handleClose} className={styles.btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={styles.btnPrimary}>
            {selectedEstimate ? 'Update Estimate' : 'Save Estimate'}
          </button>
        </div>
      </form>
    </div>
  );
}
