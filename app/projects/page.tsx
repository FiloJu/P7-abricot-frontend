'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import ProjectCreationModal from '@/components/ProjectCreationModal';


interface TeamMember {
  id: string;
  initials: string;
  isOwner: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  completedTasks: number;
  totalTasks: number;
  team: TeamMember[];
}

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Store potential errors
  const [isModalOpen, setIsModalOpen] = useState(false); // Track whether the modal is open
  const [currentUser, setCurrentUser] = useState<any>(null); // Store the logged-in user

  // Fetch data on mount

  useEffect(() => {
    const token = Cookies.get('auth_token') || Cookies.get('token');

    if (!token) {
      router.replace('/login');
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {

      // FETCH USER PROFILE
      try {
        const userRes = await fetch('http://localhost:8000/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userJson = await userRes.json();
          const userData = userJson.data?.user || userJson.data || userJson.user || userJson;
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error("Erreur récupération utilisateur", err);
      }

      // FETCH PROJECTS
      try {
        setError('');
        const response = await fetch('http://localhost:8000/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          let listeProjets = [];
          if (Array.isArray(data)) listeProjets = data;
          else if (data.data && Array.isArray(data.data)) listeProjets = data.data;
          else if (data.data && Array.isArray(data.data.projects)) listeProjets = data.data.projects;
          else if (data.projects && Array.isArray(data.projects)) listeProjets = data.projects;

          const detailedProjects = await Promise.all(
            listeProjets.map(async (project: any) => {
              try {
                const detailResponse = await fetch(`http://localhost:8000/projects/${project.id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!detailResponse.ok) return project;

                const detailData = await detailResponse.json();
                const details = detailData.data?.project || detailData.data || detailData.project || detailData;
                return { ...project, ...details };
              } catch {
                return project;
              }
            })
          );

          setProjects(detailedProjects);
        } else {
          setError('Erreur lors du chargement des projets');
        }
      } catch (err) {
        setError('Impossible de joindre le serveur.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData(); // Start the function
  }, [router]);


  // --- PROJECT FILTER ---
  const visibleProjects = projects.filter((project: any) => {
    if (!currentUser) return false;

    // 1. Is the user the owner?
    const isOwner = project.owner?.id === currentUser.id;

    // 2. Is the user a member?
    const isMember = project.members?.some((m: any) => {
      const memberId = m.user?.id || m.id;
      return memberId === currentUser.id;
    });

    return isOwner || isMember;
  });

  // USER INTERFACE

  // Loading screen
  if (loading) return <div className="p-10 text-center font-sans">Chargement de vos projets...</div>;

  return (
    // GLOBAL CONTAINER
    <div className="max-w-[1440px] mx-auto px-4 py-8 lg:px-[100px] lg:py-[50px] font-sans">

      {/* HEADER: Title and button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end w-full max-w-[1166px] mx-auto h-auto lg:h-[69px] mb-8 lg:mb-[64px] gap-4 lg:gap-0">

        {/* Left section */}
        <div className="h-full flex flex-col justify-between gap-2 lg:gap-0">
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-[#1F1F1F] leading-none font-manrope">
            Mes projets
          </h1>
          <p className="text-[14px] lg:text-[16px] text-[#6B7280] leading-none font-inter">
            Gérez vos projets
          </p>
        </div>

        {/* Right section: button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1F1F1F] text-[#FFFFFF] w-full lg:w-[181px] h-[50px] rounded-[10px] font-medium text-[16px] transition hover:bg-black cursor-pointer">
          + Créer un projet
        </button>

      </div>


      {/* Display potential errors */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* PROJECT GRID */}
      <div className="w-full max-w-[1166px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[14px] mx-auto gap-y-[18px]">

        {/* LOOP: Render each project from state */}
        {visibleProjects.map((rawProject: any) => {

          // --- TEAM MAPPING ---
          // The backend sends "owner" and "members", which are transformed into a "team" array
          const ownerData = rawProject.owner;
          let ownerInitials = 'U';
          if (ownerData) {
            const fullName = ownerData.name || `${ownerData.firstName || ''} ${ownerData.lastName || ''}`.trim() || 'Inconnu';
            ownerInitials = fullName !== 'Inconnu' ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
          }
          const teamOwner = ownerData ? { id: ownerData.id, initials: ownerInitials, isOwner: true } : null;

          const membersData = rawProject.members || [];
          const teamMembers = membersData.map((m: any) => {
            const user = m.user || m;
            const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Inconnu';
            const initials = fullName !== 'Inconnu' ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
            return { id: user.id || m.id, initials: initials, isOwner: false };
          });

          // Combine everything and filter out potential duplicates
          const fullTeam = teamOwner ? [
            teamOwner,
            ...teamMembers.filter((m: any) => m.id !== teamOwner.id)
          ] : teamMembers;

          // --- TASK CALCULATION ---
          const projectTasks = Array.isArray(rawProject.tasks) ? rawProject.tasks : [];
          const completedCount = projectTasks.filter((task: any) => {
            const status = String(task.status || '').toUpperCase();
            return status === 'DONE' || status === 'TERMINEE' || status === 'COMPLETED';
          }).length;
          const completedTasks = completedCount || rawProject.completedTasks || rawProject.completedTaskCount || rawProject.completed_tasks || 0;
          const totalTasks = projectTasks.length || rawProject.totalTasks || rawProject.totalTaskCount || rawProject.total_tasks || rawProject.taskCount || 0;

          // --- DATA SAFEGUARDS ---
          const project = {
            ...rawProject,
            team: fullTeam,
            completedTasks,
            totalTasks,
          }

          // --- DYNAMIC CALCULATIONS FOR THIS CARD ---

          // Calculate the percentage for the black progress bar
          const apiProgress = Number(rawProject.progress ?? rawProject.progressPercent ?? rawProject.completionPercentage);
          const progressPercent = project.totalTasks > 0
            ? Math.round((project.completedTasks / project.totalTasks) * 100)
            : Number.isFinite(apiProgress) ? apiProgress : 0;

          // Split the team (owner on one side, others on the other)
          const owner = project.team.find((member: TeamMember) => member.isOwner);
          const others = project.team.filter((member: TeamMember) => !member.isOwner);

          return (
            <Link href={`/projects/${project.id}`} key={project.id} className="block group">

              {/* WHITE CARD */}
              <div className="w-full max-w-[380px] h-auto lg:h-[351px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-6 lg:p-[34px] flex flex-col justify-between hover:shadow-md transition-shadow mx-auto lg:mx-0">

                {/* PART 1: Title and description */}
                <div className="mb-6 lg:mb-0">
                  <h3
                    className="text-[16px] lg:text-[18px] text-[#1F1F1F] mb-[8px] truncate font-manrope font-semibold"
                  >
                    {/* Display the name received from the backend */}
                    {project.name}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-[12px] lg:text-[14px] font-normal text-[#6B7280] w-full line-clamp-2 leading-[1.2] font-inter"
                  >
                    {project.description}
                  </p>
                </div>

                {/* PART 2: Progress bar */}
                <div className="mt-[20px]">

                  {/* Text above the progress bar */}
                  <div className="flex justify-between text-[12px] font-normal text-[#6B7280] mb-[15px] font-inter">
                    <span>Progression</span>
                    {/* Percentage calculated above */}
                    <span>{progressPercent}%</span>
                  </div>

                  {/* Progress bar structure */}
                  <div className="w-full h-[7px] bg-[#E5E7EB] rounded-[40px] overflow-hidden">
                    {/* Dynamic black fill; the style changes the width based on the calculation */}
                    <div
                      className="h-full bg-[#1F1F1F] rounded-[40px] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  {/* Text below the progress bar */}
                  <p className="text-[12px] font-normal text-[#6B7280] mt-[12px] font-inter">
                    {/* Task counts */}
                    {project.completedTasks}/{project.totalTasks} tâches terminées
                  </p>
                </div>

                {/* PART 3: Team */}
                <div className="mt-[20px]">

                  {/* "Team" heading with the small logo */}
                  <div className="flex items-center gap-[8px] mb-[15px]">
                    <div className="relative w-[16px] h-[16px]">
                      <Image src="/team.svg" alt="Icone Equipe" fill />
                    </div>
                    {/* Automatically count the total number of team members */}
                    <span className="text-[14px] font-medium text-[#6B7280] font-inter">
                      Équipe ({project.team.length})
                    </span>
                  </div>

                  {/* Pills (owner + others) */}
                  <div className="flex flex-wrap items-center gap-[4px]">

                    {/* OWNER PILL (Orange) */}
                    {owner && (
                      <div className="flex items-center gap-[5px] mb-2 lg:mb-0">

                        {/* Small initials circle */}
                        <div className="w-[27px] h-[27px] rounded-full flex items-center justify-center bg-[#FFE8D9] shrink-0">
                          <span className="text-[10px] font-normal text-[#0F0F0F]">{owner.initials}</span>
                        </div>

                        {/* Text pill */}
                        <div className="flex items-center bg-[#FFE8D9] rounded-[40px] h-[27px] px-[10px]">
                          <span
                            className="text-[14px] font-normal text-[#D3590B] font-inter"
                          >
                            Propriétaire
                          </span>
                        </div>

                      </div>
                    )}

                    {/* OTHER MEMBER PILLS (Gray) */}
                    {/* The '-space-x-1' class makes the circles overlap to the left */}
                    <div className="flex items-center -space-x-1 ml-[4px] mb-2 lg:mb-0">
                      {others.map((member: TeamMember) => (
                        <div
                          key={member.id}

                          className="w-[27px] h-[27px] rounded-full bg-[#E5E7EB] border border-white flex items-center justify-center shrink-0"
                        >
                          <span
                            className="text-[10px] font-normal text-[#0F0F0F] font-inter"
                          >
                            {member.initials}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
      <ProjectCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}