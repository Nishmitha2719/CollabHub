import { revalidatePath } from 'next/cache';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/home/ProjectCard';
import { getProjects } from '@/lib/api/projects';

export const revalidate = 0;

export default async function ProjectsPage() {
  const projects = await getProjects(undefined, 20);

  return (
    <div className="py-12">
      <Container>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Browse <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-gray-400 mb-12 text-lg">
            Discover exciting projects and find your next collaboration
          </p>

          {projects.length === 0 ? (
            <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">
              No approved projects found yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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