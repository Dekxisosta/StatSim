import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ open, onClose, wide, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className={'panel' + (wide ? ' wide' : '')} initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(ev) => ev.stopPropagation()}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
