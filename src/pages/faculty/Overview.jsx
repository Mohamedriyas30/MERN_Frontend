import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Badge, ProgressBar, Spinner } from '../../components/UI';
import api from '../../api';
import styles from './Faculty.module.css';

export default function FacultyOverview() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/courses/my'),
    ]).then(async ([{ data: courseList }]) => {
      setCourses(courseList);
      // Fetch enrollments for each course
      const allEnr = await Promise.all(
        courseList.map((c) =>
          api.get(`/enrollments/course/${c._id}`).then((r) => r.data).catch(() => [])
        )
      );
      setEnrollments(allEnr.flat());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const atRisk = enrollments.filter((e) => e.completionPct < 30).length;
  const avgCompletion = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.completionPct, 0) / enrollments.length)
    : 0;

  if (loading) return <div className={styles.center}><Spinner /></div>;

  return (
    <div>
      <div className={styles.greeting}>Hi, {user?.name?.split(' ')[0]} 👋</div>

      <div className={styles.statGrid}>
        <StatCard label="My Courses" value={courses.length} />
        <StatCard label="Students" value={enrollments.length} color="green" />
        <StatCard label="Avg Completion" value={`${avgCompletion}%`} color="gold" />
        <StatCard label="At Risk" value={atRisk} sub="Below 30%" color="red" />
      </div>

      <h3 className={styles.sectionTitle}>Recent Student Activity</h3>
      {enrollments.length === 0 ? (
        <div className={styles.empty}>No students enrolled in your courses yet.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.slice(0, 10).map((enr) => (
                <tr key={enr._id}>
                  <td>{enr.student?.name}</td>
                  <td>{enr.course?.title}</td>
                  <td style={{ width: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar
                          pct={enr.completionPct}
                          color={enr.completedAt ? 'green' : enr.completionPct < 30 ? 'gold' : 'blue'}
                        />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{enr.completionPct}%</span>
                    </div>
                  </td>
                  <td>
                    <Badge
                      variant={
                        enr.completedAt ? 'success' : enr.completionPct < 30 ? 'danger' : 'warn'
                      }
                    >
                      {enr.completedAt ? 'Completed' : enr.completionPct < 30 ? 'At Risk' : 'Active'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
