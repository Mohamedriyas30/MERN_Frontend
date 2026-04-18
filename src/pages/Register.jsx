import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Btn, Alert } from '../components/UI';
import styles from './Auth.module.css';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'admin', label: 'Admin' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>E</span>
          <span>EduTrack</span>
        </div>
        <h2 className={styles.heading}>Create account</h2>
        <p className={styles.sub}>Join EduTrack today</p>

        <Alert type="danger" message={error} />

        <form onSubmit={handleSubmit}>
          <Input label="Full Name" placeholder="e.g. Priya Sharma" value={form.name} onChange={set('name')} required />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted)', marginBottom: '6px' }}>Role</p>
            <div className={styles.roleRow}>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`${styles.roleBtn} ${form.role === r.value ? styles.roleSelected : ''}`}
                  onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <Btn type="submit" variant="brand" size="lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Btn>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
