import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="h-16 w-16 text-primary mx-auto mb-4 animate-glow" />
        </motion.div>
        <p className="text-lg font-medium gradient-text">Loading...</p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
