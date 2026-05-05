import Container from '@/components/ui/Container';
import ProjectCard from '@/components/home/ProjectCard';
import { getProjects } from '@/lib/api/projects';

export const revalidate = 0;

export default async function ProjectsPage() {
  const projects = await getProjects(undefined, 20);

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

          {projects.length === 0 ? (
            <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">
              No approved projects found yet.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              {projects.map((project) => (
                <div key={project.id}>
                  <ProjectCard
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    skills={project.skills || []}
                    category={project.category}
                    teamSize={project.team_size}
                    applicants={0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}