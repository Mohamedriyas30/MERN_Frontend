import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

const navItems = {
  student: [
    { to: '/student', label: 'Overview', icon: '⊞', end: true },
    { to: '/student/courses', label: 'My Courses', icon: '📚' },
    { to: '/student/analytics', label: 'Analytics', icon: '↗' },
    { to: '/student/certificates', label: 'Certificates', icon: '✦' },
    { to: '/student/notifications', label: 'Notifications', icon: '⊙' },
  ],
  faculty: [
    { to: '/faculty', label: 'Overview', icon: '⊞', end: true },
    { to: '/faculty/courses', label: 'My Courses', icon: '📚' },
    { to: '/faculty/students', label: 'Students', icon: '◎' },
    { to: '/faculty/create', label: 'New Course', icon: '+' },
    { to: '/faculty/analytics', label: 'Analytics', icon: '↗' },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: '⊞', end: true },
    { to: '/admin/users', label: 'All Users', icon: '◎' },
    { to: '/admin/courses', label: 'All Courses', icon: '📚' },
    { to: '/admin/analytics', label: 'Analytics', icon: '↗' },
    { to: '/admin/reports', label: 'Reports', icon: '▤' },
  ],
};

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoMark}>E</span>
          <span>EduTrack</span>
        </div>

        <div className={styles.sidebarUser}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span>↩</span> Logout
        </button>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className={styles.pageTitle}>{title}</h1>
          <div className={styles.topbarRight}>
            <div className={styles.avatarSm}>{initials}</div>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
