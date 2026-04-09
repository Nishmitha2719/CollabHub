'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import BubbleBackground from '@/src/components/BubbleBackground';
import ProjectCard from '@/components/home/ProjectCard';
import CategoryCard from '@/components/home/CategoryCard';
import SuccessStoryCard from '@/components/home/SuccessStoryCard';
import { FaRobot } from "react-icons/fa";
import { GiWorld } from "react-icons/gi";
import { GiRadioTower } from "react-icons/gi";
import { ImMobile } from "react-icons/im";
import { GiCrossedChains } from "react-icons/gi";
import { PiLockKeyOpenFill } from "react-icons/pi";
import { IoLocation } from "react-icons/io5";

export default function Home() {
  // Sample data - replace with real data from API/database
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
    { title: 'AI/ML', icon: <FaRobot />, projectCount: 45, gradient: 'from-purple-500 to-pink-500' },
    { title: 'Web Dev', icon: <GiWorld />, projectCount: 78, gradient: 'from-blue-500 to-cyan-500' },
    { title: 'IoT', icon: <GiRadioTower />, projectCount: 32, gradient: 'from-green-500 to-teal-500' },
    { title: 'Mobile', icon: <ImMobile />, projectCount: 56, gradient: 'from-orange-500 to-yellow-500' },
    { title: 'Blockchain', icon: <GiCrossedChains />, projectCount: 28, gradient: 'from-indigo-500 to-purple-500' },
    { title: 'Cybersecurity', icon: <PiLockKeyOpenFill />, projectCount: 23, gradient: 'from-red-500 to-pink-500' },
  ];

  const successStories = [
    {
      title: 'EcoTrack - Carbon Footprint App',
      description: 'Won first place at HackMIT 2024. Now used by 10,000+ students.',
      team: ['Alex', 'Sarah', 'Mike', 'Emma'],
      rating: 5,
    },
    {
      title: 'MediConnect - Healthcare Platform',
      description: 'Secured $50K seed funding. Connecting patients with doctors seamlessly.',
      team: ['John', 'Lisa', 'David'],
      rating: 5,
    },
    {
      title: 'CodeMentor - Peer Learning',
      description: 'Featured in TechCrunch. 5000+ active mentors helping students worldwide.',
      team: ['Priya', 'James', 'Sofia', 'Chen', 'Maya'],
      rating: 4,
    },
  ];

  return (
    <div className="relative min-h-screen">
      <BubbleBackground />
      <div className="bubble-bg-overlay" aria-hidden="true" />

      <div className="bubble-content-layer">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100svh-4rem)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/0 via-transparent to-black/25" />

          <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center relative z-10"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
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
              className="text-xl md:text-2xl text-secondary mb-12 max-w-3xl mx-auto"
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
      <section className="py-20 relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Featured <span className="text-gradient">Projects</span>
              </h2>
              <p className="text-secondary text-lg">
                Join these exciting projects and make an impact
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProjectCard {...project} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Personalized Recommendations */}
      <section className="py-20 bg-gradient-to-b from-purple-900/10 to-transparent relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Personalized for <span className="text-gradient">You</span>
              </h2>
              <p className="text-secondary text-lg">
                Projects matched to your skills and interests
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {featuredProjects.slice(0, 2).map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <ProjectCard {...project} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Categories Grid */}
      <section className="py-20 relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Explore <span className="text-gradient">Categories</span>
              </h2>
              <p className="text-secondary text-lg">
                Find projects in your domain of expertise
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CategoryCard {...category} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-b from-blue-900/10 to-transparent relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Success <span className="text-gradient">Stories</span>
              </h2>
              <p className="text-secondary text-lg">
                See what amazing teams have built on CollabHub
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {successStories.map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <SuccessStoryCard {...story} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Local Discovery */}
      <section className="py-20 relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Projects <span className="text-gradient">Near You</span>
              </h2>
              <p className="text-secondary text-lg">
                Connect with students from your college and city
              </p>
            </div>

            <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto flex flex-col items-center justify-center gap-6">
              <IoLocation className="text-4xl text-accent" />
              <h3 className="text-2xl font-bold mb-4">
                Enable Location to See Local Projects
              </h3>
              <p className="text-secondary mb-8">
                Discover projects from students at your university and nearby colleges.
                Meet your team in person and collaborate effectively.
              </p>
              <Button size="lg">
                Enable Location
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Start Building?
              </h2>
              <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto">
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
          </motion.div>
        </Container>
      </section>
      </div>
    </div>
  );
}
