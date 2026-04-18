import { useEffect, useState } from 'react';
import { Badge, ProgressBar, Spinner, Btn } from '../../components/UI';
import api from '../../api';
import styles from './Admin.module.css';

// ── Overview ─────────────────────────────────────────────────
export function AdminOverview() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/courses'),
      api.get('/enrollments/all'),
    ]).then(([{ data: u }, { data: c }, { data: e }]) => {
      setUsers(u); setCourses(c); setEnrollments(e);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner /></div>;

  const students = users.filter((u) => u.role === 'student').length;
  const faculty = users.filter((u) => u.role === 'faculty').length;
  const completed = enrollments.filter((e) => e.completedAt).length;

  return (
    <div>
      <div className={styles.statGrid}>
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Courses" value={courses.length} color="green" />
        <StatCard label="Enrollments" value={enrollments.length} color="gold" />
        <StatCard label="Completions" value={completed} color="red" />
      </div>

      <div className={styles.twoCol}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>User Breakdown</div>
          <div className={styles.breakdownList}>
            <div className={styles.breakdownItem}>
              <span>Students</span>
              <div style={{ flex: 1, margin: '0 10px' }}><ProgressBar pct={users.length ? Math.round(students/users.length*100) : 0} color="blue" /></div>
              <strong>{students}</strong>
            </div>
            <div className={styles.breakdownItem}>
              <span>Faculty</span>
              <div style={{ flex: 1, margin: '0 10px' }}><ProgressBar pct={users.length ? Math.round(faculty/users.length*100) : 0} color="green" /></div>
              <strong>{faculty}</strong>
            </div>
            <div className={styles.breakdownItem}>
              <span>Admins</span>
              <div style={{ flex: 1, margin: '0 10px' }}><ProgressBar pct={users.length ? Math.round((users.length-students-faculty)/users.length*100) : 0} color="gold" /></div>
              <strong>{users.length - students - faculty}</strong>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>Top Courses</div>
          {courses.slice(0, 5).map((c) => {
            const courseEnr = enrollments.filter((e) => {
              const id = e.course?._id || e.course;
              return id?.toString() === c._id?.toString();
            });
            const avg = courseEnr.length
              ? Math.round(courseEnr.reduce((s, e) => s + e.completionPct, 0) / courseEnr.length)
              : 0;
            return (
              <div key={c._id} className={styles.topCourseItem}>
                <span className={styles.topCourseTitle}>{c.title}</span>
                <div style={{ width: 90 }}><ProgressBar pct={avg} color="blue" /></div>
                <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 35, textAlign: 'right' }}>{avg}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);

  const load = () =>
    api.get('/users').then(({ data }) => { setUsers(data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id) => {
    setToggling(id);
    await api.patch(`/users/${id}/status`);
    await load();
    setToggling(null);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className={styles.center}><Spinner /></div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <input
          className={styles.searchInput}
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                <td><Badge variant={u.role === 'admin' ? 'danger' : u.role === 'faculty' ? 'success' : 'info'}>{u.role}</Badge></td>
                <td style={{ color: 'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td><Badge variant={u.isActive ? 'success' : 'gray'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                <td>
                  <Btn
                    variant={u.isActive ? 'dangerBtn' : 'successBtn'}
                    size="sm"
                    onClick={() => toggleStatus(u._id)}
                    disabled={toggling === u._id}
                  >
                    {toggling === u._id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className={styles.tableEmpty}>No users found.</div>}
      </div>
    </div>
  );
}

// ── Courses ───────────────────────────────────────────────────
export function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/courses'), api.get('/enrollments/all')]).then(
      ([{ data: c }, { data: e }]) => {
        setCourses(c); setEnrollments(e); setLoading(false);
      }
    ).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner /></div>;

  return (
    <div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Title</th><th>Faculty</th><th>Modules</th><th>Students</th><th>Avg Progress</th><th>Status</th></tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const courseEnr = enrollments.filter((e) => {
                const id = e.course?._id || e.course;
                return id?.toString() === c._id?.toString();
              });
              const avg = courseEnr.length
                ? Math.round(courseEnr.reduce((s, e) => s + e.completionPct, 0) / courseEnr.length)
                : 0;
              return (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.faculty?.name}</td>
                  <td>{c.modules?.length}</td>
                  <td>{courseEnr.length}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 70 }}><ProgressBar pct={avg} color="blue" /></div>
                      <span style={{ fontSize: 12 }}>{avg}%</span>
                    </div>
                  </td>
                  <td><Badge variant={c.isPublished ? 'success' : 'warn'}>{c.isPublished ? 'Published' : 'Draft'}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {courses.length === 0 && <div className={styles.tableEmpty}>No courses yet.</div>}
      </div>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────
export function AdminAnalytics() {
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/enrollments/all')]).then(
      ([{ data: u }, { data: e }]) => { setUsers(u); setEnrollments(e); setLoading(false); }
    ).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner /></div>;

  const completed = enrollments.filter((e) => e.completedAt).length;
  const inProgress = enrollments.filter((e) => !e.completedAt && e.completionPct > 0).length;
  const notStarted = enrollments.filter((e) => e.completionPct === 0).length;
  const inactive = users.filter((u) => !u.isActive).length;

  return (
    <div>
      <div className={styles.statGrid}>
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Completed Courses" value={completed} color="green" />
        <StatCard label="In Progress" value={inProgress} color="gold" />
        <StatCard label="Inactive Users" value={inactive} color="red" />
      </div>

      <div className={styles.panel} style={{ marginBottom: '1rem' }}>
        <div className={styles.panelTitle}>Enrollment Status</div>
        <div className={styles.breakdownList}>
          <div className={styles.breakdownItem}>
            <span style={{ width: 90 }}>Completed</span>
            <div style={{ flex: 1, margin: '0 10px' }}>
              <ProgressBar pct={enrollments.length ? Math.round(completed/enrollments.length*100) : 0} color="green" />
            </div>
            <strong style={{ color: 'var(--success)' }}>{completed}</strong>
          </div>
          <div className={styles.breakdownItem}>
            <span style={{ width: 90 }}>In Progress</span>
            <div style={{ flex: 1, margin: '0 10px' }}>
              <ProgressBar pct={enrollments.length ? Math.round(inProgress/enrollments.length*100) : 0} color="blue" />
            </div>
            <strong>{inProgress}</strong>
          </div>
          <div className={styles.breakdownItem}>
            <span style={{ width: 90 }}>Not Started</span>
            <div style={{ flex: 1, margin: '0 10px' }}>
              <ProgressBar pct={enrollments.length ? Math.round(notStarted/enrollments.length*100) : 0} color="gold" />
            </div>
            <strong style={{ color: 'var(--muted)' }}>{notStarted}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────
export function AdminReports() {
  const [loading, setLoading] = useState(false);

  const download = async (type) => {
    setLoading(type);
    const endpoint = type === 'users' ? '/users' : type === 'courses' ? '/courses' : '/enrollments/all';
    try {
      const { data } = await api.get(endpoint);
      const rows = data.map((item) =>
        type === 'users'
          ? `${item.name},${item.email},${item.role},${item.isActive ? 'Active' : 'Inactive'}`
          : type === 'courses'
          ? `${item.title},${item.faculty?.name},${item.modules?.length}`
          : `${item.student?.name},${item.course?.title},${item.completionPct}%,${item.completedAt ? 'Completed' : 'In Progress'}`
      );
      const header =
        type === 'users' ? 'Name,Email,Role,Status' :
        type === 'courses' ? 'Title,Faculty,Modules' :
        'Student,Course,Progress,Status';
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${type}-report.csv`; a.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.reportsGrid}>
      {[
        { key: 'users', title: 'Users Report', desc: 'All users with role and status', icon: '◎' },
        { key: 'courses', title: 'Courses Report', desc: 'All courses with faculty and modules', icon: '📚' },
        { key: 'enrollments', title: 'Progress Report', desc: 'Student progress across all courses', icon: '↗' },
      ].map((r) => (
        <div key={r.key} className={styles.reportCard}>
          <div className={styles.reportIcon}>{r.icon}</div>
          <div className={styles.reportTitle}>{r.title}</div>
          <div className={styles.reportDesc}>{r.desc}</div>
          <Btn variant="brand" size="sm" onClick={() => download(r.key)} disabled={loading === r.key}>
            {loading === r.key ? 'Generating…' : '↓ Download CSV'}
          </Btn>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = { green: 'var(--success)', gold: 'var(--warn)', red: 'var(--danger)' };
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={{ color: colorMap[color] || 'var(--brand)' }}>{value}</div>
    </div>
  );
}
