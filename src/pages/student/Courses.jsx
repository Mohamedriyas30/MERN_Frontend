import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ProgressBar, Badge, Spinner, Btn } from '../../components/UI';
import api from '../../api';
import styles from './Student.module.css';

// ── Courses list ─────────────────────────────────────────────
export function StudentCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/enrollments/my').then(({ data }) => {
      setEnrollments(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter((e) => {
    if (filter === 'completed') return !!e.completedAt;
    if (filter === 'inprogress') return !e.completedAt;
    return true;
  });

  if (loading) return <div className={styles.center}><Spinner /></div>;

  return (
    <div>
      <div className={styles.tabs}>
        {['all', 'inprogress', 'completed'].map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${filter === t ? styles.tabActive : ''}`}
            onClick={() => setFilter(t)}
          >
            {t === 'all' ? 'All' : t === 'inprogress' ? 'In Progress' : 'Completed'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No courses here yet.</div>
      ) : (
        <div className={styles.courseGrid}>
          {filtered.map((enr) => (
            <div
              key={enr._id}
              className={styles.courseCard}
              onClick={() => navigate(`/student/courses/${enr._id}`)}
            >
              <div className={styles.courseBanner}>{enr.course?.emoji || '📚'}</div>
              <div className={styles.courseBody}>
                <span className={styles.courseTag}>{enr.course?.category}</span>
                <div className={styles.courseTitle}>{enr.course?.title}</div>
                <div className={styles.courseMeta}>
                  {enr.course?.faculty?.name} · {enr.course?.modules?.length} modules
                </div>
                <ProgressBar pct={enr.completionPct} color={enr.completedAt ? 'green' : 'blue'} />
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
      )}
    </div>
  );
}

// ── Course detail ────────────────────────────────────────────
export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    api.get('/enrollments/my').then(({ data }) => {
      const found = data.find((e) => e._id === id);
      if (!found) navigate('/student/courses');
      else setEnrollment(found);
      setLoading(false);
    });
  }, [id, navigate]);

  const toggleModule = async (moduleId) => {
    setToggling(moduleId);
    try {
      const { data } = await api.patch(`/enrollments/${id}/module/${moduleId}`);
      setEnrollment(data);
    } finally {
      setToggling(null);
    }
  };

  if (loading || !enrollment) return <div className={styles.center}><Spinner /></div>;

  const { course, moduleProgress, completionPct, completedAt } = enrollment;
  const doneCount = moduleProgress.filter((m) => m.completed).length;

  return (
    <div>
      <div className={styles.detailHeader}>
        <Link to="/student/courses" className={styles.backLink}>← Back</Link>
        <h2 className={styles.detailTitle}>{course?.title}</h2>
      </div>

      <div className={styles.detailGrid}>
        {/* Progress panel */}
        <div className={styles.progressPanel}>
          <div className={styles.bigPct}>{completionPct}%</div>
          <div className={styles.progressMeta}>
            {doneCount} of {moduleProgress.length} modules done
          </div>
          <ProgressBar pct={completionPct} color={completedAt ? 'green' : 'blue'} />
          {completedAt && (
            <div className={styles.completedBadge}>
              ✦ Course completed!
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className={styles.infoPanel}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Faculty</span>
            <span>{course?.faculty?.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Category</span>
            <span>{course?.category}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Modules</span>
            <span>{moduleProgress.length} total</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Status</span>
            <Badge variant={completedAt ? 'success' : 'warn'}>
              {completedAt ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Module list */}
      <h3 className={styles.modulesHeading}>Modules</h3>
      <div className={styles.moduleList}>
        {course?.modules?.map((mod, i) => {
          const prog = moduleProgress.find((p) => p.moduleId === mod._id);
          const done = prog?.completed || false;
          return (
            <div key={mod._id} className={`${styles.moduleItem} ${done ? styles.moduleDone : ''}`}>
              <button
                className={`${styles.moduleCheck} ${done ? styles.moduleCheckDone : ''}`}
                onClick={() => toggleModule(mod._id)}
                disabled={toggling === mod._id}
                title={done ? 'Mark incomplete' : 'Mark complete'}
              >
                {toggling === mod._id ? '…' : done ? '✓' : ''}
              </button>
              <div className={styles.moduleInfo}>
                <div className={styles.moduleName}>
                  {i + 1}. {mod.title}
                </div>
                {mod.duration && (
                  <div className={styles.moduleDur}>⏱ {mod.duration}</div>
                )}
              </div>
              <Badge variant={done ? 'success' : 'gray'}>{done ? 'Done' : 'Pending'}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
