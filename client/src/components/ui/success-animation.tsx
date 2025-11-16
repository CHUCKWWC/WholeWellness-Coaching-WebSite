import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessAnimationProps {
  show: boolean;
  message: string;
  duration?: number;
  variant?: "simple" | "celebration" | "sparkle";
  onComplete?: () => void;
}

export function SuccessAnimation({
  show,
  message,
  duration = 3000,
  variant = "simple",
  onComplete,
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (variant === "simple") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
            data-testid="success-animation"
          >
            <div className="bg-green-600 dark:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="h-6 w-6" />
              </motion.div>
              <span className="font-medium">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === "celebration") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            data-testid="success-animation-celebration"
          >
            {/* Confetti effect */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    x: "50vw",
                    y: "50vh",
                    scale: 0,
                  }}
                  animate={{
                    opacity: 0,
                    x: `${50 + (Math.random() - 0.5) * 100}vw`,
                    y: `${50 + (Math.random() - 0.5) * 100}vh`,
                    scale: 1,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.02,
                    ease: "easeOut",
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: [
                      "#f59e0b",
                      "#ec4899",
                      "#8b5cf6",
                      "#3b82f6",
                      "#10b981",
                    ][i % 5],
                  }}
                />
              ))}
            </div>

            {/* Success message */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md text-center pointer-events-auto"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="inline-block"
              >
                <PartyPopper className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Success!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === "sparkle") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
            data-testid="success-animation-sparkle"
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 relative overflow-hidden">
              {/* Sparkle effects */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: (i - 1) * 20,
                    y: -20,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: 1,
                  }}
                  className="absolute"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              ))}
              
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <CheckCircle2 className="h-6 w-6" />
              </motion.div>
              <span className="font-semibold">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}
