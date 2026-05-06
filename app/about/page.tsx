"use client";

import Link from "next/link";
import { FaHandshake } from "react-icons/fa";
import { HiRocketLaunch } from "react-icons/hi2";
import { GiBullseye } from "react-icons/gi";
import { GiLightBulb } from "react-icons/gi";
import { HiTrophy } from "react-icons/hi2";
import { GiWorld } from "react-icons/gi";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";

export default function AboutPage() {
  const { user, loading } = useAuth();

  const features = [
    {
      icon: <FaHandshake />,
      title: 'Connect with Talented Students',
      description: 'Find passionate teammates who share your vision and complement your skills.',
    },
    {
      icon: <HiRocketLaunch />,
      title: 'Bring Ideas to Life',
      description: 'Transform concepts into reality with the right team and resources.',
    },
    {
      icon: <GiBullseye />,
      title: 'Smart Matching',
      description: 'Our algorithm matches you with projects based on your skills and interests.',
    },
    {
      icon: <GiLightBulb />,
      title: 'Learn & Grow',
      description: 'Gain real-world experience while building your portfolio.',
    },
    {
      icon: <HiTrophy />,
      title: 'Showcase Success',
      description: 'Display completed projects and achievements to future employers.',
    },
    {
      icon: <GiWorld />,
      title: 'Global Community',
      description: 'Collaborate with students from universities worldwide.',
    },
  ];

  return (
    <div className="py-14 sm:py-18 lg:py-24">
      <section className="py-8 sm:py-12 lg:py-14">
        <Container>
          <div className="mx-auto flex max-w-5xl flex-col gap-10 text-center sm:gap-12 lg:gap-14">
            <div>
              <h1 className="mb-5 text-4xl font-bold leading-tight sm:mb-6 sm:text-5xl md:text-6xl">
                About <span className="text-gradient">CollabHub</span>
              </h1>
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-400 sm:text-xl">
                We&apos;re on a mission to revolutionize student collaboration by connecting
                talented individuals with innovative projects. Build, learn, and succeed
                together.
              </p>
            </div>

            <div className="glass mx-auto w-full max-w-4xl rounded-3xl border border-white/10 p-8 sm:p-11 md:p-13 lg:p-16">
              <div className="mx-auto max-w-3xl">
                <h2 className="mb-5 text-2xl font-bold sm:mb-6 sm:text-3xl md:text-4xl">
                  Our Mission
                </h2>
                <p className="mb-5 text-base leading-relaxed text-gray-400 sm:mb-6 sm:text-lg">
                  Every great project starts with a great team. We believe that
                  students shouldn&apos;t struggle to find collaborators who share their
                  passion and vision.
                </p>
                <p className="text-base leading-relaxed text-gray-400 sm:text-lg">
                  CollabHub makes it effortless to discover projects, connect with
                  talented peers, and build something amazing together.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-18">
        <Container>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 lg:gap-16">
            <div className="pb-4 sm:pb-6 lg:pb-8">
              <h2 className="mb-10 text-center text-2xl font-bold sm:mb-12 sm:text-3xl md:text-4xl">
                Why Choose <span className="text-gradient">CollabHub</span>
              </h2>
              <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                {features.map((feature, index) => (
                  <div key={index}>
                    <Card className="h-full transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                      <div className="mb-4 text-4xl text-white sm:text-5xl">{feature.icon}</div>
                      <h3 className="mb-3 text-lg font-bold text-white sm:text-xl">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-gray-400 sm:text-base">{feature.description}</p>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass mx-auto mt-4 w-full max-w-4xl rounded-3xl border border-white/10 p-9 text-center sm:mt-6 sm:p-11 md:mt-8 md:p-13 lg:mt-10 lg:p-16">
              <h2 className="mb-5 text-2xl font-bold sm:mb-6 sm:text-3xl md:text-4xl">
                Ready to Start Collaborating?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-base text-gray-400 sm:text-lg">
                Join thousands of students who are already building amazing projects
                together. Your next breakthrough is just one connection away.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
                <Link href="/projects">
                  <Button size="lg" className="w-full px-12 sm:w-auto">
                    Browse Projects
                  </Button>
                </Link>
                {loading || !user ? (
                  <Link href="/auth/signup">
                    <Button size="lg" variant="outline" className="w-full px-12 sm:w-auto">
                      Sign Up Free
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}