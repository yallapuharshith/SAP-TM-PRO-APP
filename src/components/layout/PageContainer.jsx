import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageAnimation = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function PageContainer({ children }) {
  const location = useLocation();

  return (
    <main className="relative flex-1 overflow-y-auto px-4 pb-8 pt-5 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageAnimation}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mx-auto w-full max-w-7xl"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default PageContainer;
