
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, User, Sparkles } from 'lucide-react';

interface WelcomeMessageProps {
  username?: string | null;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ username }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Extract name from email or use generic welcome
  const displayName = username 
    ? username.includes('@') 
      ? username.split('@')[0] 
      : username
    : 'to Presentation AI';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 }
  };

  if (!visible) return null;
  
  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <motion.div 
        className="p-8 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl max-w-md text-center"
        variants={itemVariants}
      >
        <motion.div 
          className="flex justify-center mb-4"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <div className="relative">
            <Sparkles size={60} className="text-yellow-400 absolute -top-1 -left-1 opacity-50" />
            <User size={48} className="text-white relative z-10" />
            <Zap size={20} className="text-blue-400 absolute bottom-0 right-0 animate-pulse" />
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-purple-400"
          variants={itemVariants}
        >
          Welcome, {displayName}!
        </motion.h2>
        
        <motion.p 
          className="text-gray-300 mb-6"
          variants={itemVariants}
        >
          Get ready to create amazing presentations with the power of AI
        </motion.p>
        
        <motion.div 
          className="flex justify-center"
          variants={itemVariants}
        >
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-md animate-pulse-slow"></span>
            <button 
              onClick={() => setVisible(false)} 
              className="relative px-6 py-2 bg-black text-white rounded-full border border-white/30 hover:border-white/60 transition-all"
            >
              Let's Get Started
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeMessage;
