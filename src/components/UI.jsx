import styles from './UI.module.css';

export function Badge({ variant = 'default', children }) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}

export function Btn({ variant = 'primary', size = 'md', onClick, children, type = 'button', disabled }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Card({ children, style }) {
  return <div className={styles.card} style={style}>{children}</div>;
}

export function Input({ label, error, ...props }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <select className={`${styles.input} ${styles.select}`} {...props}>{children}</select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export function ProgressBar({ pct, color = 'blue' }) {
  return (
    <div className={styles.progressWrap}>
      <div
        className={`${styles.progressFill} ${styles[`pb_${color}`]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Spinner() {
  return <div className={styles.spinner} />;
}

export function Alert({ type = 'danger', message }) {
  if (!message) return null;
  return <div className={`${styles.alert} ${styles[`alert_${type}`]}`}>{message}</div>;
}

export function StatCard({ label, value, sub, color }) {
  return (
    <div className={`${styles.statCard} ${color ? styles[`stat_${color}`] : ''}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}
