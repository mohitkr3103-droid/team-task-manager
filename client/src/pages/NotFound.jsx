import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '20px' }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', maxWidth: '480px' }}>
      <div style={{ fontSize: '120px', fontWeight: '800', lineHeight: 1, background: 'linear-gradient(135deg, #0f62fe, #002d9c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>
        404
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Page Not Found</h1>
      <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary"><Home size={16} /> Go Home</Link>
        <button className="btn btn-secondary" onClick={() => window.history.back()}><ArrowLeft size={16} /> Go Back</button>
      </div>
    </motion.div>
  </div>
);

export default NotFound;
