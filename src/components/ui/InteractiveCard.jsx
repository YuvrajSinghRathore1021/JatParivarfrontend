// frontend/src/components/ui/InteractiveCard.jsx
import { motion } from 'framer-motion'

const MotionDiv = motion.div

export default function InteractiveCard({ children, onClick, className = '' }) {
  return (
    <MotionDiv
      whileHover={{ y:-6, boxShadow: '0 16px 40px rgba(0,0,0,0.16)' }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-5 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </MotionDiv>
  )
}
