import { useEffect, useState } from 'react';
import { ProgressBar, Badge, Spinner } from '../../components/UI';
import api from '../../api';
import styles from './Student.module.css';

export default function StudentAnalytics() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then(({ data }) => {
      setEnrollments(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner /></div>;

  const completed = enrollments.filter((e) => e.completedAt).length;
  const inProgress = enrollments.filter((e) => !e.completedAt).length;

  return (
    <div>
      <h2 className={styles.sectionTitle}>Your Progress</h2>

      {enrollments.length === 0 ? (
        <div className={styles.empty}>No data yet — enroll in a course to see analytics.</div>
      ) : (
        <>
          {/* Donut-style summary */}
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsNum} style={{ color: 'var(--success)' }}>{completed}</div>
              <div className={styles.analyticsLabel}>Completed</div>
            </div>
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsNum} style={{ color: 'var(--warn)' }}>{inProgress}</div>
              <div className={styles.analyticsLabel}>In Progress</div>
            </div>
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsNum}>{enrollments.length}</div>
              <div className={styles.analyticsLabel}>Total Enrolled</div>
            </div>
          </div>

          {/* Per-course breakdown */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Done</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enr) => (
                  <tr key={enr._id}>
                    <td>{enr.course?.title}</td>
                    <td>
                      {enr.moduleProgress.filter((m) => m.completed).length}/
                      {enr.moduleProgress.length}
                    </td>
                    <td style={{ width: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <ProgressBar
                            pct={enr.completionPct}
                            color={enr.completedAt ? 'green' : 'blue'}
                          />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 30 }}>
                          {enr.completionPct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={enr.completedAt ? 'success' : 'warn'}>
                        {enr.completedAt ? 'Completed' : 'In Progress'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
