'use client';

import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';

export default function AboutPage() {
  const features = [
    {
      icon: '🤝',
      title: 'Connect with Talented Students',
      description: 'Find passionate teammates who share your vision and complement your skills.',
    },
    {
      icon: '🚀',
      title: 'Bring Ideas to Life',
      description: 'Transform concepts into reality with the right team and resources.',
    },
    {
      icon: '🎯',
      title: 'Smart Matching',
      description: 'Our algorithm matches you with projects based on your skills and interests.',
    },
    {
      icon: '💡',
      title: 'Learn & Grow',
      description: 'Gain real-world experience while building your portfolio.',
    },
    {
      icon: '🏆',
      title: 'Showcase Success',
      description: 'Display completed projects and achievements to future employers.',
    },
    {
      icon: '🌍',
      title: 'Global Community',
      description: 'Collaborate with students from universities worldwide.',
    },
  ];

  return (
    <div className="py-20">
      <Container>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-gradient">CollabHub</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            We&apos;re on a mission to revolutionize student collaboration by connecting
            talented individuals with innovative projects. Build, learn, and succeed
            together.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="glass rounded-3xl p-12 md:p-16 border border-white/10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Every great project starts with a great team. We believe that
                students shouldn&apos;t struggle to find collaborators who share their
                passion and vision.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                CollabHub makes it effortless to discover projects, connect with
                talented peers, and build something amazing together.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-gradient">CollabHub</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="glass rounded-3xl p-12 md:p-16 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Collaborating?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already building amazing projects
              together. Your next breakthrough is just one connection away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/projects"
                className="px-8 py-4 bg-gradient-purple text-white font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Browse Projects
              </a>
              <a
                href="/auth/signup"
                className="px-8 py-4 glass border-2 border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-all"
              >
                Sign Up Free
              </a>
            </div>
          </div>
        </motion.section>
      </Container>
    </div>
  );
}
