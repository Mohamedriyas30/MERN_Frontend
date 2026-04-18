import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, ProgressBar, Badge, Spinner } from '../../components/UI';
import api from '../../api';
import styles from './Student.module.css';

export default function StudentOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then(({ data }) => {
      setEnrollments(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const completed = enrollments.filter((e) => e.completedAt).length;
  const avgPct = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.completionPct, 0) / enrollments.length)
    : 0;
  const pendingModules = enrollments.reduce(
    (s, e) => s + e.moduleProgress.filter((m) => !m.completed).length, 0
  );

  if (loading) return <div className={styles.center}><Spinner /></div>;

  return (
    <div>
      <div className={styles.greeting}>
        Good day, {user?.name?.split(' ')[0]} 👋
      </div>

      <div className={styles.statGrid}>
        <StatCard label="Enrolled" value={enrollments.length} sub="Active courses" />
        <StatCard label="Completed" value={completed} sub="Courses finished" color="green" />
        <StatCard label="Avg Progress" value={`${avgPct}%`} sub="Across all courses" color="gold" />
        <StatCard label="Pending" value={pendingModules} sub="Modules left" color="red" />
      </div>

      {enrollments.length === 0 ? (
        <div className={styles.empty}>
          <p>You haven't been enrolled in any courses yet.</p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4 }}>
            Contact your faculty to get assigned to a course.
          </p>
        </div>
      ) : (
        <>
          <h2 className={styles.sectionTitle}>Continue Learning</h2>
          <div className={styles.courseGrid}>
            {enrollments.map((enr) => (
              <div
                key={enr._id}
                className={styles.courseCard}
                onClick={() => navigate(`/student/courses/${enr._id}`)}
              >
                <div className={styles.courseBanner}>
                  {enr.course?.emoji || '📚'}
                </div>
                <div className={styles.courseBody}>
                  <span className={styles.courseTag}>{enr.course?.category}</span>
                  <div className={styles.courseTitle}>{enr.course?.title}</div>
                  <div className={styles.courseMeta}>
                    {enr.course?.faculty?.name} · {enr.course?.modules?.length} modules
                  </div>
                  <ProgressBar pct={enr.completionPct} color={enr.completionPct === 100 ? 'green' : 'blue'} />
                  <div className={styles.progressRow}>
                    <span>{enr.completionPct}%</span>
                    <Badge variant={enr.completedAt ? 'success' : 'warn'}>
                      {enr.completedAt ? 'Completed' : 'In Progress'}
                    </Badge>
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
