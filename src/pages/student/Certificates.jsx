import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Btn, ProgressBar } from '../../components/UI';
import api from '../../api';
import styles from './Student.module.css';

export default function Certificates() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then(({ data }) => {
      setEnrollments(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner /></div>;

  const completed = enrollments.filter((e) => e.completedAt);
  const pending = enrollments.filter((e) => !e.completedAt);

  return (
    <div>
      {completed.length === 0 && (
        <div className={styles.empty}>
          Complete a course to earn your first certificate!
        </div>
      )}

      {completed.map((enr) => (
        <div key={enr._id} className={styles.certCard}>
          <div className={styles.certSeal}>✦</div>
          <div className={styles.certTitle}>Certificate of Completion</div>
          <div className={styles.certSub}>This certifies that</div>
          <div className={styles.certName}>{user?.name}</div>
          <div className={styles.certCourse}>
            has completed <strong>{enr.course?.title}</strong>
          </div>
          <div className={styles.certMeta}>
            Issued: {new Date(enr.completedAt).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric'
            })} · EduTrack
          </div>
          <div className={styles.certFooter}>
            <div className={styles.certSig}>
              <span>{enr.course?.faculty?.name || 'Faculty'}</span>
              <span>Course Faculty</span>
            </div>
            <div className={styles.certSig}>
              <span>EduTrack</span>
              <span>Platform</span>
            </div>
          </div>
          <Btn
            variant="successBtn"
            size="sm"
            onClick={() => alert('In production: PDF download via html2pdf or backend.')}
            style={{ marginTop: '1rem' }}
          >
            ↓ Download PDF
          </Btn>
        </div>
      ))}

      {pending.length > 0 && (
        <>
          <h3 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>
            Pending ({pending.length})
          </h3>
          <div className={styles.pendingList}>
            {pending.map((enr) => (
              <div key={enr._id} className={styles.pendingItem}>
                <div className={styles.lockIcon}>🔒</div>
                <div style={{ flex: 1 }}>
                  <div className={styles.moduleName}>{enr.course?.title}</div>
                  <div className={styles.moduleDur}>
                    {enr.completionPct}% done —{' '}
                    {enr.moduleProgress.filter((m) => !m.completed).length} modules left
                  </div>
                  <div style={{ marginTop: 6, maxWidth: 200 }}>
                    <ProgressBar pct={enr.completionPct} color="blue" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
