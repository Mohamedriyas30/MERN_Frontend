import { useEffect, useState } from 'react';
import { Spinner, Btn, Input, Select, Badge, ProgressBar } from '../../components/UI';
import api from '../../api';
import styles from './Faculty.module.css';

// ── My Courses ───────────────────────────────────────────────
export function FacultyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCourse, setModalCourse] = useState(null);
  const [modTitle, setModTitle] = useState('');
  const [modDur, setModDur] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get('/courses/my').then(({ data }) => {
      setCourses(data);
      setLoading(false);
    });

  useEffect(() => { load(); }, []);

  const addModule = async () => {
    if (!modTitle.trim()) return;
    setSaving(true);
    await api.post(`/courses/${modalCourse._id}/modules`, {
      title: modTitle, duration: modDur,
    });
    await load();
    setModTitle(''); setModDur(''); setModalCourse(null);
    setSaving(false);
  };

  if (loading) return <div className={styles.center}><Spinner /></div>;

  return (
    <div>
      {courses.length === 0 ? (
        <div className={styles.empty}>No courses yet. Create your first one!</div>
      ) : (
        <div className={styles.courseGrid}>
          {courses.map((c) => (
            <div key={c._id} className={styles.courseCard}>
              <div className={styles.courseBanner}>{c.emoji || '📚'}</div>
              <div className={styles.courseBody}>
                <span className={styles.courseTag}>{c.category}</span>
                <div className={styles.courseTitle}>{c.title}</div>
                <div className={styles.courseMeta}>{c.modules?.length} modules</div>
                <div className={styles.cardActions}>
                  <Btn variant="outline" size="sm" onClick={() => setModalCourse(c)}>
                    + Module
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add module modal */}
      {modalCourse && (
        <div className={styles.modalOverlay} onClick={() => setModalCourse(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Add Module — {modalCourse.title}</span>
              <button className={styles.modalClose} onClick={() => setModalCourse(null)}>✕</button>
            </div>
            <Input label="Module Title" value={modTitle} onChange={(e) => setModTitle(e.target.value)} placeholder="e.g. Introduction to Loops" />
            <Input label="Duration (optional)" value={modDur} onChange={(e) => setModDur(e.target.value)} placeholder="e.g. 45 min" />
            <div className={styles.modalFooter}>
              <Btn variant="outline" size="sm" onClick={() => setModalCourse(null)}>Cancel</Btn>
              <Btn variant="successBtn" size="sm" onClick={addModule} disabled={saving}>
                {saving ? 'Saving…' : 'Save Module'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Students ─────────────────────────────────────────────────
export function FacultyStudents() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selStudent, setSelStudent] = useState('');
  const [selCourse, setSelCourse] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [{ data: courseList }, { data: studentList }] = await Promise.all([
      api.get('/courses/my'),
      api.get('/users/students'),
    ]);
    setCourses(courseList);
    setStudents(studentList);
    if (courseList.length > 0) {
      setSelCourse(courseList[0]._id);
      const allEnr = await Promise.all(
        courseList.map((c) =>
          api.get(`/enrollments/course/${c._id}`).then((r) => r.data).catch(() => [])
        )
      );
      setEnrollments(allEnr.flat());
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const assign = async () => {
    if (!selStudent || !selCourse) return setMsg('Select a student and course');
    setAssigning(true); setMsg('');
    try {
      await api.post('/enrollments', { studentId: selStudent, courseId: selCourse });
      setMsg('Student enrolled successfully!');
      await load();
      setTimeout(() => { setShowModal(false); setMsg(''); }, 1200);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <div className={styles.center}><Spinner /></div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <span />
        <Btn variant="primary" size="sm" onClick={() => setShowModal(true)}>+ Assign Student</Btn>
      </div>

      {enrollments.length === 0 ? (
        <div className={styles.empty}>No students enrolled yet. Use "Assign Student" to add one.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Student</th><th>Email</th><th>Course</th><th>Progress</th><th>Status</th></tr>
            </thead>
            <tbody>
              {enrollments.map((enr) => (
                <tr key={enr._id}>
                  <td>{enr.student?.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{enr.student?.email}</td>
                  <td>{enr.course?.title}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80 }}>
                        <ProgressBar pct={enr.completionPct} color={enr.completedAt ? 'green' : 'blue'} />
                      </div>
                      <span style={{ fontSize: 12 }}>{enr.completionPct}%</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={enr.completedAt ? 'success' : enr.completionPct < 30 ? 'danger' : 'warn'}>
                      {enr.completedAt ? 'Done' : enr.completionPct < 30 ? 'At Risk' : 'Active'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Assign Student to Course</span>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            {msg && (
              <div className={msg.includes('success') ? styles.msgSuccess : styles.msgError}>{msg}</div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label className={styles.fieldLabel}>Student</label>
              <select className={styles.fieldSelect} value={selStudent} onChange={(e) => setSelStudent(e.target.value)}>
                <option value="">Select student…</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className={styles.fieldLabel}>Course</label>
              <select className={styles.fieldSelect} value={selCourse} onChange={(e) => setSelCourse(e.target.value)}>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalFooter}>
              <Btn variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn variant="successBtn" size="sm" onClick={assign} disabled={assigning}>
                {assigning ? 'Assigning…' : 'Assign'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create Course ─────────────────────────────────────────────
export function CreateCourse() {
  const [form, setForm] = useState({ title: '', description: '', category: 'Data Science', emoji: '📚' });
  const [modules, setModules] = useState([{ title: '', duration: '' }]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMod = (i, k) => (e) => {
    const updated = [...modules];
    updated[i][k] = e.target.value;
    setModules(updated);
  };

  const submit = async () => {
    if (!form.title.trim()) return setMsg('Course title is required');
    setSaving(true); setMsg('');
    try {
      await api.post('/courses', {
        ...form,
        modules: modules.filter((m) => m.title.trim()),
      });
      setMsg('Course published!');
      setForm({ title: '', description: '', category: 'Data Science', emoji: '📚' });
      setModules([{ title: '', duration: '' }]);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.createWrap}>
      {msg && (
        <div className={msg === 'Course published!' ? styles.msgSuccess : styles.msgError}>{msg}</div>
      )}

      <Input label="Course Title *" value={form.title} onChange={set('title')} placeholder="e.g. Python for Beginners" />
      <div style={{ marginBottom: '1rem' }}>
        <label className={styles.fieldLabel}>Description</label>
        <textarea className={styles.textarea} value={form.description} onChange={set('description')} placeholder="What will students learn?" rows={3} />
      </div>

      <div className={styles.twoCol}>
        <div>
          <label className={styles.fieldLabel}>Category</label>
          <select className={styles.fieldSelect} value={form.category} onChange={set('category')}>
            {['Data Science','Web Development','Programming','AI / Deep Learning','Database','Other'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.fieldLabel}>Emoji</label>
          <input className={styles.fieldSelect} value={form.emoji} onChange={set('emoji')} style={{ fontSize: '1.5rem', textAlign: 'center' }} />
        </div>
      </div>

      <div className={styles.modulesSection}>
        <div className={styles.modulesHeader}>
          <span className={styles.fieldLabel}>Modules</span>
          <Btn variant="outline" size="sm" onClick={() => setModules([...modules, { title: '', duration: '' }])}>
            + Add
          </Btn>
        </div>
        {modules.map((m, i) => (
          <div key={i} className={styles.moduleRow}>
            <input
              className={styles.fieldInput}
              placeholder={`Module ${i + 1} title`}
              value={m.title}
              onChange={setMod(i, 'title')}
            />
            <input
              className={styles.fieldInputSm}
              placeholder="Duration"
              value={m.duration}
              onChange={setMod(i, 'duration')}
            />
          </div>
        ))}
      </div>

      <Btn variant="brand" size="md" onClick={submit} disabled={saving}>
        {saving ? 'Publishing…' : '→ Publish Course'}
      </Btn>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────
export function FacultyAnalytics() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/my').then(async ({ data: courseList }) => {
      setCourses(courseList);
      const allEnr = await Promise.all(
        courseList.map((c) =>
          api.get(`/enrollments/course/${c._id}`).then((r) => r.data).catch(() => [])
        )
      );
      setEnrollments(allEnr.flat());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner /></div>;

  const completed = enrollments.filter((e) => e.completedAt).length;
  const completionRate = enrollments.length
    ? Math.round((completed / enrollments.length) * 100)
    : 0;

  return (
    <div>
      <div className={styles.statGrid}>
        <StatCard label="Total Students" value={enrollments.length} />
        <StatCard label="Completed" value={completed} color="green" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} color="gold" />
        <StatCard label="Courses" value={courses.length} />
      </div>

      <h3 className={styles.sectionTitle}>Course Breakdown</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Course</th><th>Modules</th><th>Students</th><th>Avg Progress</th></tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const courseEnr = enrollments.filter((e) => e.course?._id === c._id || e.course === c._id);
              const avg = courseEnr.length
                ? Math.round(courseEnr.reduce((s, e) => s + e.completionPct, 0) / courseEnr.length)
                : 0;
              return (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.modules?.length}</td>
                  <td>{courseEnr.length}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80 }}><ProgressBar pct={avg} color="blue" /></div>
                      <span style={{ fontSize: 12 }}>{avg}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Re-export StatCard locally since it's used above
function StatCard({ label, value, sub, color }) {
  const colorMap = { green: 'var(--success)', gold: 'var(--warn)', red: 'var(--danger)' };
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={{ color: colorMap[color] || 'var(--brand)' }}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}
