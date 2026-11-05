import { Suspense } from 'react';
import Container from '@/components/ui/Container';
import BrowseProjects from '@/components/projects/BrowseProjects';

export default function ProjectsPage() {
  return (
    <div className="py-14 sm:py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">
            Browse <span className="text-gradient">Projects</span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-gray-400 sm:mb-12">
            Discover exciting projects and find your next collaboration
          </p>

          <Suspense
            fallback={
              <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">
                Loading projects...
              </div>
            }
          >
            <BrowseProjects />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
