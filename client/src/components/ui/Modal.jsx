import { motion } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const maxWidth = size === 'lg' ? '680px' : size === 'sm' ? '400px' : '540px';

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-content" style={{ maxWidth }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 20 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '20px', padding: '4px 8px' }}>✕</button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Modal;
