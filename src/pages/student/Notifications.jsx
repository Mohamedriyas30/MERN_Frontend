import { useEffect, useState } from 'react';
import { Spinner } from '../../components/UI';
import api from '../../api';
import styles from './Student.module.css';

export default function Notifications() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then(({ data }) => {
      setEnrollments(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner /></div>;

  // Generate notifications from real enrollment data
  const notifications = [];

  enrollments.forEach((enr) => {
    if (enr.completedAt) {
      notifications.push({
        id: enr._id + '_cert',
        icon: '✦',
        text: `You completed "${enr.course?.title}"! Your certificate is ready.`,
        time: new Date(enr.completedAt).toLocaleDateString(),
        unread: true,
      });
    }
    if (enr.completionPct > 0 && enr.completionPct < 100) {
      notifications.push({
        id: enr._id + '_progress',
        icon: '↗',
        text: `You're ${enr.completionPct}% through "${enr.course?.title}". Keep going!`,
        time: 'Recent',
        unread: false,
      });
    }
    notifications.push({
      id: enr._id + '_enroll',
      icon: '○',
      text: `You were enrolled in "${enr.course?.title}" by ${enr.course?.faculty?.name}.`,
      time: new Date(enr.createdAt).toLocaleDateString(),
      unread: false,
    });
  });

  return (
    <div>
      {notifications.length === 0 ? (
        <div className={styles.empty}>No notifications yet.</div>
      ) : (
        <div className={styles.notifList}>
          {notifications.map((n) => (
            <div key={n.id} className={`${styles.notifItem} ${n.unread ? styles.notifUnread : ''}`}>
              <span className={styles.notifIcon}>{n.icon}</span>
              <div className={styles.notifContent}>
                <div className={styles.notifText}>{n.text}</div>
                <div className={styles.notifTime}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
