'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/home/ProjectCard';
import CategoryCard from '@/components/home/CategoryCard';
import { FaRobot } from "react-icons/fa";
import { GiWorld } from "react-icons/gi";
import { GiRadioTower } from "react-icons/gi";
import { ImMobile } from "react-icons/im";
import { GiCrossedChains } from "react-icons/gi";
import { PiLockKeyOpenFill } from "react-icons/pi";
import { getProjectCountsByCategory } from '@/lib/api/projects';

const BubbleBackground = dynamic(() => import('@/src/components/BubbleBackground'), {
  ssr: false,
});

export default function Home() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const featuredProjects = [
    {
      title: 'AI-Powered Study Assistant',
      description: 'Build an intelligent study companion using GPT-4 and React. Help students learn more effectively with personalized recommendations.',
      skills: ['React', 'Python', 'OpenAI API', 'FastAPI'],
      matchPercentage: 92,
      category: 'AI/ML',
      teamSize: 3,
      applicants: 12,
    },
    {
      title: 'Blockchain Voting System',
      description: 'Create a decentralized voting platform ensuring transparency and security using Ethereum smart contracts.',
      skills: ['Solidity', 'Web3.js', 'React', 'Node.js'],
      matchPercentage: 85,
      category: 'Blockchain',
      teamSize: 4,
      applicants: 8,
    },
    {
      title: 'IoT Smart Campus',
      description: 'Develop an IoT ecosystem to automate and monitor campus facilities including classrooms, labs, and energy usage.',
      skills: ['Arduino', 'Python', 'MQTT', 'React'],
      matchPercentage: 88,
      category: 'IoT',
      teamSize: 5,
      applicants: 15,
    },
  ];

  const categories = [
    { title: 'AI/ML', icon: <FaRobot />, gradient: 'from-purple-500 to-pink-500' },
    { title: 'Web Dev', icon: <GiWorld />, gradient: 'from-blue-500 to-cyan-500' },
    { title: 'IoT', icon: <GiRadioTower />, gradient: 'from-green-500 to-teal-500' },
    { title: 'Mobile', icon: <ImMobile />, gradient: 'from-orange-500 to-yellow-500' },
    { title: 'Blockchain', icon: <GiCrossedChains />, gradient: 'from-indigo-500 to-purple-500' },
    { title: 'Cybersecurity', icon: <PiLockKeyOpenFill />, gradient: 'from-red-500 to-pink-500' },
  ];

  useEffect(() => {
    let mounted = true;

    const loadCounts = async () => {
      const counts = await getProjectCountsByCategory(categories.map((category) => category.title));

      if (mounted) {
        setCategoryCounts(counts);
      }
    };

    loadCounts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <BubbleBackground />
      <div className="bubble-bg-overlay" aria-hidden="true" />

      <div className="bubble-content-layer">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100svh-4rem)] flex items-center justify-center overflow-hidden py-16 sm:py-20">
          <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 mx-auto max-w-4xl px-2 text-center sm:px-0"
          >
            <motion.h1 
              className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Build{' '}
              <span>Futuristic Projects</span>
              <br />
              with a Dream Student Team
            </motion.h1>
            
            <motion.p 
              className="mx-auto mb-10 max-w-3xl text-lg text-secondary sm:text-xl md:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Connect with talented students, collaborate on innovative projects,
              and bring your ideas to life. Your next breakthrough starts here.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/projects">
                <Button size="lg" className="w-full sm:w-auto px-12">
                  Browse Projects
                </Button>
              </Link>
              <Link href="/post-project">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-12">
                  Post a Project
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Featured Projects */}
      <section className="relative py-16 md:py-20">
        <Container>
          <div>
            <div className="mb-10 text-center md:mb-12">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
                Featured <span className="text-gradient">Projects</span>
              </h2>
              <p className="text-secondary text-lg">
                Join these exciting projects and make an impact
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project, index) => (
                <div key={index}>
                  <ProjectCard {...project} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Personalized Recommendations */}
      <section className="relative py-16 md:py-20">
        <Container>
          <div>
            <div className="mb-10 text-center md:mb-12">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
                Personalized for <span className="text-gradient">You</span>
              </h2>
              <p className="text-secondary text-lg">
                Projects matched to your skills and interests
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {featuredProjects.slice(0, 2).map((project, index) => (
                <div key={index}>
                  <ProjectCard {...project} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Grid */}
      <section className="relative min-h-[100svh] flex items-center py-20 md:py-24">
        <Container>
          <div>
            <div className="mb-12 text-center md:mb-16">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
                Explore <span className="text-gradient">Categories</span>
              </h2>
              <p className="text-secondary text-lg">
                Find projects in your domain of expertise
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <div key={index}>
                  <CategoryCard {...category} projectCount={categoryCounts[category.title] ?? 0} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24">
        <Container>
          <div className="glass relative overflow-hidden rounded-3xl p-8 text-center sm:p-10 md:p-16">
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl md:text-5xl">
                Ready to Start Building?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-secondary sm:text-xl md:mb-10">
                Join thousands of students creating the future. Post your project
                or find your dream team today.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/post-project">
                  <Button size="lg" className="w-full sm:w-auto px-12">
                    Post Your Project
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-12">
                    Explore Projects
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
      </div>
    </div>
  );
}
