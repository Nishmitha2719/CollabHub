'use client';

import { motion } from 'framer-motion';

export default function FloatingBubbles() {
  // Create larger, fewer bubbles for premium feel
  const bubbles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    size: Math.random() * 200 + 150, // 150-350px (much larger)
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 25, // 25-45s (much slower)
    delay: Math.random() * 10,
    blur: Math.random() * 40 + 60, // More blur for softer look
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            background: `radial-gradient(circle at 30% 30%, 
              rgba(168, 85, 247, 0.4), 
              rgba(139, 92, 246, 0.3) 30%, 
              rgba(59, 130, 246, 0.2) 60%,
              transparent 100%)`,
            filter: `blur(${bubble.blur}px)`,
          }}
          animate={{
            y: ['-15%', '15%', '-15%'],
            x: ['-8%', '8%', '-8%'],
            scale: [1, 1.1, 0.95, 1],
            opacity: [0.3, 0.5, 0.4, 0.3],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Add some smaller accent bubbles */}
      {Array.from({ length: 5 }, (_, i) => ({
        id: `accent-${i}`,
        size: Math.random() * 80 + 50,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 15 + 20,
        delay: Math.random() * 8,
      })).map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            background: `radial-gradient(circle at 40% 40%, 
              rgba(34, 211, 238, 0.3), 
              rgba(59, 130, 246, 0.2) 50%,
              transparent 100%)`,
            filter: 'blur(30px)',
          }}
          animate={{
            y: ['-10%', '10%', '-10%'],
            x: ['-5%', '5%', '-5%'],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
