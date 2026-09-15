'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectMember {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  user?: ProjectMember;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  tasks?: Array<{ status?: string }>;
  completedTasks?: number;
  totalTasks?: number;
  owner?: ProjectMember;
  members?: ProjectMember[];
}

function getProject(data: unknown): Project {
  const response = data as { data?: { project?: Project } | Project; project?: Project };
  if (response.data && typeof response.data === 'object' && 'project' in response.data) {
    return response.data.project as Project;
  }
  return (response.data || response.project || data) as Project;
}

function getInitials(user: ProjectMember) {
  const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName
    ? fullName.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = Cookies.get('auth_token') || Cookies.get('token');

    if (!token) {
      router.replace('/login');
      setLoading(false);
      return;
    }

    const fetchProject = async () => {

      try {
        const response = await fetch(`http://localhost:8000/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          setError('Impossible de charger ce projet.');
          return;
        }

        setProject(getProject(await response.json()));
      } catch {
        setError('Impossible de joindre le serveur.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, router]);

  if (loading) return <div className="p-10 text-center font-sans">Chargement du projet...</div>;
  if (error || !project) return <div className="p-10 text-center font-sans text-red-500">{error || 'Projet introuvable.'}</div>;

  const tasks = project.tasks || [];
  const completedTasks = tasks.filter((task) => task.status === 'DONE' || task.status === 'Terminée').length || project.completedTasks || 0;
  const totalTasks = tasks.length || project.totalTasks || 0;
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const members = [
    ...(project.owner ? [project.owner] : []),
    ...(project.members || []).map((member) => member.user || member),
  ];

  return (
    <main className="mx-auto max-w-[900px] px-6 py-10 font-sans lg:py-[70px]">
      <Link href="/projects" className="text-sm text-[#6B7280] hover:text-[#1F1F1F]">
        ← Retour aux projets
      </Link>
      <section className="mt-8 rounded-[10px] border border-[#E5E7EB] bg-white p-6 lg:p-10">
        <h1 className="font-manrope text-[28px] font-semibold text-[#1F1F1F]">{project.name}</h1>
        <p className="mt-3 text-[#6B7280]">{project.description || 'Aucune description.'}</p>

        <div className="mt-10">
          <div className="mb-3 flex justify-between text-sm text-[#6B7280]">
            <span>Progression</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div className="h-full rounded-full bg-[#1F1F1F]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-[#6B7280]">{completedTasks}/{totalTasks} tâches terminées</p>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2 text-[#6B7280]">
            <Image src="/team.svg" alt="Équipe" width={16} height={16} />
            <span>Équipe ({members.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((member, index) => (
              <span key={member.id || index} className="rounded-full bg-[#FFE8D9] px-3 py-1 text-sm text-[#D3590B]">
                {getInitials(member)}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
