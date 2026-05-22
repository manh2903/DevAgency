import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when scrolled down past 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: -150 }} // Start high up to give a distinct "falling down" feel
          animate={{ opacity: 1, y: 0 }}      // Fall down to its actual bottom-6 position
          exit={{ opacity: 0, y: -150 }}       // Rise up when disappearing
          transition={{ type: "spring", stiffness: 220, damping: 16 }} // Spring physics for realistic bounce
          onClick={scrollToTop}
          whileHover={{ scale: 1.08, y: -4 }}  // Hover elevates slightly
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-[92px] z-50 w-14 h-14 rounded-full bg-white text-primary shadow-2xl border-2 border-black flex items-center justify-center hover:bg-bg-light hover:text-accent-blue transition-colors cursor-pointer select-none"
          id="btn-scroll-to-top"
          aria-label="Scroll to top of the page"
          title="Cuộn lên đầu trang"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
