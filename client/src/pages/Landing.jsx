import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Users, BarChart3, ArrowRight, Shield, Clock, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const features = [
    { icon: CheckCircle, title: 'Task Management', desc: 'Create, assign, and track tasks with priorities, deadlines, and real-time status updates.' },
    { icon: Users, title: 'Team Collaboration', desc: 'Add team members to projects, assign roles, and work together seamlessly.' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track team performance with beautiful charts and actionable insights.' },
    { icon: Shield, title: 'Role-Based Access', desc: 'Admin and member roles with granular permissions for secure collaboration.' },
    { icon: Clock, title: 'Deadline Tracking', desc: 'Never miss a deadline with automated overdue detection and notifications.' },
    { icon: Star, title: 'Progress Tracking', desc: 'Visual progress bars and completion rates for every project at a glance.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '16px 24px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 6, background: '#0f62fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>TaskFlow</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-ghost">Log in</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero" style={{ paddingTop: '140px', paddingBottom: '80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top, rgba(15,98,254,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', padding: '8px 16px', borderRadius: '50px', marginBottom: '24px', fontSize: '14px', backdropFilter: 'blur(10px)' }}>
            <Star size={14} color="#78a9ff" /> Modern Team Task Management
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '800', lineHeight: 1.1, marginBottom: '20px', maxWidth: '800px', margin: '0 auto 20px auto', color: 'white' }}>
            Manage your team's work, <br />
            <span style={{ color: '#78a9ff' }}>
              effortlessly
            </span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '560px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            TaskFlow helps teams organize projects, assign tasks, and track progress with a beautiful, intuitive interface.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: '#0f62fe', fontWeight: '600', padding: '14px 32px', fontSize: '16px' }}>
              Start Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '14px 32px' }}>
              Sign In
            </Link>
          </div>
        </motion.div>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(15,98,254,0.05)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(15,98,254,0.05)', filter: 'blur(60px)' }} />
      </div>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Everything you need
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Powerful features designed for modern teams to collaborate and deliver results.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {features.map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card" style={{ padding: '28px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(15,98,254,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <feature.icon size={24} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>{feature.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '60px 24px', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Ready to get started?</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>Join thousands of teams already using TaskFlow.</p>
          <Link to="/register" className="btn btn-lg btn-primary" style={{ fontWeight: '600', padding: '14px 32px' }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '14px' }}>
        © {new Date().getFullYear()} TaskFlow. Built for modern teams.
      </footer>
    </div>
  );
};

export default Landing;
