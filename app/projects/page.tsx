'use client';

import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/home/ProjectCard';

export default function ProjectsPage() {
  // Mock projects for now - replace with actual API call
  const projects = [
    {
      id: '1',
      title: 'AI-Powered Study Assistant',
      description:
        'Build an intelligent study companion using GPT-4 and React. Help students learn more effectively with personalized recommendations.',
      skills: ['React', 'Python', 'OpenAI API', 'FastAPI'],
      matchPercentage: 92,
      category: 'AI/ML',
      teamSize: 3,
      applicants: 12,
    },
    {
      id: '2',
      title: 'Blockchain Voting System',
      description:
        'Create a decentralized voting platform ensuring transparency and security using Ethereum smart contracts.',
      skills: ['Solidity', 'Web3.js', 'React', 'Node.js'],
      matchPercentage: 85,
      category: 'Blockchain',
      teamSize: 4,
      applicants: 8,
    },
    {
      id: '3',
      title: 'IoT Smart Campus',
      description:
        'Develop an IoT ecosystem to automate and monitor campus facilities including classrooms, labs, and energy usage.',
      skills: ['Arduino', 'Python', 'MQTT', 'React'],
      matchPercentage: 88,
      category: 'IoT',
      teamSize: 5,
      applicants: 15,
    },
  ];

  return (
    <div className="py-12">
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Browse <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-gray-400 mb-12 text-lg">
            Discover exciting projects and find your next collaboration
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProjectCard {...project} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}