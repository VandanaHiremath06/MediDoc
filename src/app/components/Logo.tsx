import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ onClick, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 36, text: 'text-3xl' },
  };

  const currentSize = sizes[size];

  return (
    <motion.div
      onClick={onClick}
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={onClick ? { scale: 1.05 } : {}}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Heart
            size={currentSize.icon}
            className="text-red-500 fill-red-500"
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      <div className={`font-bold ${currentSize.text} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
        MediDoc
      </div>
    </motion.div>
  );
}
