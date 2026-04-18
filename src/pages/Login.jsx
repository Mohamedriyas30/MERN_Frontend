import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Btn, Alert } from '../components/UI';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'pass123' });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>E</span>
          <span>EduTrack</span>
        </div>
        <h2 className={styles.heading}>Welcome back</h2>
        <p className={styles.sub}>Sign in to continue</p>

        <Alert type="danger" message={error} />

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={set('password')}
            required
          />
          <Btn type="submit" variant="brand" size="lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Btn>
        </form>

        <div className={styles.demoSection}>
          <p className={styles.demoLabel}>Try a demo account</p>
          <div className={styles.demoRow}>
            <button className={styles.demoBtn} onClick={() => fillDemo('student@edu.com')}>
              Student
            </button>
            <button className={styles.demoBtn} onClick={() => fillDemo('faculty@edu.com')}>
              Faculty
            </button>
            <button className={styles.demoBtn} onClick={() => fillDemo('admin@edu.com')}>
              Admin
            </button>
          </div>
        </div>

        <p className={styles.switch}>
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
