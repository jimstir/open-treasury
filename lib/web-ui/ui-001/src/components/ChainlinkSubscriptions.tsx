import React from 'react';
import { ChainlinkSubscription } from '../mocks/chainlinkSubscriptions';
import styles from './ChainlinkSubscriptions.module.css';

interface ChainlinkSubscriptionsProps {
  subscriptions: ChainlinkSubscription[];
  onTopUp: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
}

const formatAddress = (address: string) => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
};

const getStatusBadge = (status: string) => {
  const statusClassMap: { [key: string]: string } = {
    active: styles.statusActive,
    paused: styles.statusPaused,
    cancelled: styles.statusCancelled,
    outOfFunds: styles.statusOutOfFunds,
  };
  
  const statusTextMap: { [key: string]: string } = {
    active: 'Active',
    paused: 'Paused',
    cancelled: 'Cancelled',
    outOfFunds: 'Out of Funds',
  };
  
  const statusClass = statusClassMap[status] || styles.statusInactive;
  const statusText = statusTextMap[status] || 'Unknown';
  
  return <span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span>;
};

const ChainlinkSubscriptions: React.FC<ChainlinkSubscriptionsProps> = ({
  subscriptions,
  onTopUp,
  onPause,
  onResume,
  onCancel,
}) => {
  // Filter to show only 'The Sky Treasury' subscription
  const filteredSubscriptions = subscriptions.filter(
    subscription => subscription.name === 'The Sky Treasury'
  );

  return (
    <div className={`${styles.widget} ${styles.wideWidget}`}>
      <div className={styles.subscriptionsList}>
        {filteredSubscriptions.map((subscription) => (
          <div key={subscription.id} className={styles.subscriptionItem}>
            <div className={styles.subscriptionHeader}>
              <div>
                <div className={styles.subscriptionName}>{subscription.name}</div>
                <div className={styles.subscriptionAddress}>
                  {formatAddress(subscription.contractAddress)}
                </div>
              </div>
              <div>
                {getStatusBadge(subscription.status)}
              </div>
            </div>
            
            <div className={styles.subscriptionDetails}>
              <div className={styles.balanceInfo}>
                <span className={styles.balanceLabel}>Balance:</span>
                <span className={styles.balanceValue}>
                  {subscription.linkBalance} LINK
                  <span className={styles.usdAmount}>({subscription.linkBalanceInUsd})</span>
                </span>
              </div>
              <div className={styles.actionButtons}>
                <button 
                  className={`${styles.actionButton} ${styles.buttonPrimary}`}
                  onClick={() => onTopUp(subscription.id)}
                >
                  Top Up
                </button>
                {subscription.status === 'active' ? (
                  <button 
                    className={`${styles.actionButton} ${styles.buttonWarning}`}
                    onClick={() => onPause(subscription.id)}
                  >
                    Pause
                  </button>
                ) : (
                  <button 
                    className={`${styles.actionButton} ${styles.buttonSuccess} ${
                      subscription.status === 'cancelled' ? styles.buttonDisabled : ''
                    }`}
                    onClick={() => onResume(subscription.id)}
                    disabled={subscription.status === 'cancelled'}
                  >
                    Resume
                  </button>
                )}
                <button 
                  className={`${styles.actionButton} ${styles.buttonDanger} ${
                    subscription.status === 'cancelled' ? styles.buttonDisabled : ''
                  }`}
                  onClick={() => onCancel(subscription.id)}
                  disabled={subscription.status === 'cancelled'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
        {subscriptions.length === 0 && (
          <div className={styles.noSubscriptions}>
            No active subscriptions found
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainlinkSubscriptions;
