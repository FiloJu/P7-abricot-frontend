'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import TaskCreationModal from '@/components/TaskCreationModal';
import TaskEditModal from '@/components/TaskEditModal';
import ProjectEditModal from '@/components/ProjectEditModal';

interface ProjectMember {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  user?: ProjectMember;
}

interface TaskComment {
    content?: string;
    createdAt?: string;
    author?: ProjectMember;
    user?: ProjectMember;
}

interface ProjectTask {
    id: string;
    title?: string;
    description?: string;
    status?: string;
    dueDate?: string;
    assignees?: Array<(ProjectMember & { userId?: string; user_id?: string }) | string>;
    comments?: TaskComment[];
}

interface Project {
  id: string;
  name: string;
    title?: string;
  description?: string;
    tasks?: ProjectTask[];
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

function getUser(data: unknown): ProjectMember {
    const response = data as { data?: { user?: ProjectMember } | ProjectMember; user?: ProjectMember };
    if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        return response.data.user as ProjectMember;
    }
    return (response.data || response.user || data) as ProjectMember;
}

function getTasks(data: unknown): ProjectTask[] {
    const response = data as { data?: { tasks?: ProjectTask[] } | ProjectTask[] };
    if (response.data && typeof response.data === 'object' && 'tasks' in response.data) {
        return response.data.tasks || [];
    }
    return Array.isArray(response.data) ? response.data : [];
}

function formatStatus(status?: string) {
    if (status === 'IN_PROGRESS') return 'En cours';
    if (status === 'DONE' || status === 'Terminée') return 'Terminée';
    return 'À faire';
}

function getAssigneeId(assignee: NonNullable<ProjectTask['assignees']>[number]) {
    if (typeof assignee === 'string') return assignee;
    return assignee.userId || assignee.user_id || assignee.user?.id || assignee.id;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
    const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
    const [currentUser, setCurrentUser] = useState<ProjectMember | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = Cookies.get('auth_token') || Cookies.get('token');

    if (!token) {
      router.replace('/login');
      return;
    }

        const fetchAllData = async () => {
      try {
                const headers = { Authorization: `Bearer ${token}` };
                const [projectResponse, tasksResponse, userResponse] = await Promise.all([
                    fetch(`http://localhost:8000/projects/${id}`, { headers }),
                    fetch(`http://localhost:8000/projects/${id}/tasks`, { headers }),
                    fetch('http://localhost:8000/auth/profile', { headers }),
                ]);

                if (!projectResponse.ok) {
          setError('Impossible de charger ce projet.');
          return;
        }

                setProject(getProject(await projectResponse.json()));

                if (tasksResponse.ok) {
                    setProjectTasks(getTasks(await tasksResponse.json()));
                }

                if (userResponse.ok) {
                    setCurrentUser(getUser(await userResponse.json()));
                }
      } catch {
        setError('Impossible de joindre le serveur.');
      } finally {
        setLoading(false);
      }
    };

        fetchAllData();
  }, [id, router]);

    const contributors = project
        ? [
                ...(project.owner ? [project.owner] : []),
                ...(project.members || []).map((member) => member.user || member),
            ].filter((member, index, members) => member.id && members.findIndex((item) => item.id === member.id) === index)
        : [];
    const isOwner = Boolean(currentUser?.id && currentUser.id === project?.owner?.id);
    const isMember = Boolean(
        currentUser?.id && project?.members?.some((member) => (member.user?.id || member.id) === currentUser.id),
    );
    const hasAccess = isOwner || isMember;

    const handleAddComment = async (taskId: string) => {
        if (!commentText.trim()) return;
        const token = Cookies.get('auth_token') || Cookies.get('token');

        try {
            const response = await fetch(`http://localhost:8000/projects/${id}/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: commentText.trim() }),
            });

            if (response.ok) {
                setCommentText('');
                window.location.reload();
            } else {
                alert("Erreur lors de l'ajout du commentaire.");
            }
        } catch {
            alert('Impossible de joindre le serveur.');
        }
    };

    const handleDeleteProject = async () => {
        if (!project || !window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

        const token = Cookies.get('auth_token') || Cookies.get('token');
        setIsDeletingProject(true);

        try {
            const response = await fetch(`http://localhost:8000/projects/${project.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                alert('Erreur lors de la suppression du projet.');
                return;
            }

            router.replace('/projects');
        } catch {
            alert('Impossible de joindre le serveur.');
        } finally {
            setIsDeletingProject(false);
        }
    };

    if (project && currentUser && !hasAccess) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center font-sans p-4">
                <h1 className="text-[20px] lg:text-[24px] font-semibold text-[#1F1F1F] mb-[10px] text-center font-manrope">
                    Accès refusé
                </h1>
                <p className="text-[14px] lg:text-[16px] text-[#6B7280] mb-[20px] text-center font-inter">
                    Vous n&apos;êtes ni administrateur ni contributeur de ce projet.
                </p>
                <Link href="/dashboard" className="w-[200px] h-[50px] bg-[#A63F06] text-[#FFFFFF] rounded-[10px] flex items-center justify-center hover:opacity-90 transition">
                    Retour au tableau de bord
                </Link>
            </div>
        );
    }

  if (loading) return <div className="p-10 text-center font-sans">Chargement du projet...</div>;
  if (error || !project) return <div className="p-10 text-center font-sans text-red-500">{error || 'Projet introuvable.'}</div>;

    const tasks = projectTasks.length ? projectTasks : project.tasks || [];

  return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans overflow-x-hidden">

            {/* ================= PROJECT HEADER ================= */
            }
            <div className="w-full px-4 lg:px-[30px] pt-8 lg:pt-[78px] flex flex-col mb-[14px]">

                {/* TOP ROW: Back + (Title, Description, Buttons) */}
                <div className="flex flex-col lg:flex-row items-start gap-[16px] mb-6 lg:mb-[49px]">

                    {/* BACK BUTTON */}
                    <Link href="/projects" aria-label="Retour" className="w-[40px] h-[40px] lg:w-[57px] lg:h-[57px] bg-white border border-[#E5E7EB] rounded-[10px] flex items-center justify-center hover:bg-gray-50 transition shrink-0 cursor-pointer mb-4 lg:mb-0">
                        <Image src="/line3.svg" alt="" aria-hidden="true" width={15} height={1} className="w-[10px] lg:w-[15px]" />
                    </Link>

                    {/* HEADER CONTENT: Title/Description on the left, Buttons on the right */}
                    <div className="flex flex-col lg:flex-row justify-between items-start w-full gap-4 lg:gap-0">

                        {/* LEFT: Title, Edit, and Description */}
                        <div className="flex flex-col w-full lg:w-auto">
                            <div className="flex flex-wrap items-center gap-[14px] mb-[8px]">
                                <h1 className="text-[20px] lg:text-[24px] font-semibold text-[#1F1F1F] font-manrope">
                                    {project ? project.title || project.name : "Chargement..."}
                                </h1>
                                {isOwner && (
                                    <div className="flex items-center gap-[14px]">
                                        <button onClick={() => setIsEditModalOpen(true)} className="text-[#A63F06] text-[12px] lg:text-[14px] font-regular underline hover:opacity-80 transition font-inter">
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeleteProject}
                                            disabled={isDeletingProject}
                                            className="h-[25px] px-[16px] bg-[#FFE0E0] rounded-[50px] flex items-center justify-center text-[#991B1B] text-[12px] lg:text-[14px] font-regular hover:opacity-80 transition font-inter disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDeletingProject ? 'Suppression...' : 'Supprimer'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-[14px] lg:text-[18px] text-[#6B7280] font-regular font-inter">
                                {project ? project.description : "Aucune description pour ce projet."}
                            </p>
                        </div>

                        {/* RIGHT: Create button */}
                        <div className="flex gap-[12px] h-[50px]  mr-18 w-full lg:w-auto mt-4 lg:mt-0">
                            <button onClick={() => setIsCreateTaskModalOpen(true)} className="flex-1 lg:w-[141px] h-[50px] bg-[#1F1F1F] text-[#FFFFFF] rounded-[10px] text-[14px] lg:text-[16px] font-regular flex items-center justify-center hover:bg-black transition">
                                Créer une tâche
                            </button>
                        </div>
                    </div>
                </div>

                {/* CONTRIBUTORS BAR */}
                <div className="w-auto min-h-[67px] mr-16 ml-18 py-4 lg:py-0 bg-[#F3F4F6] rounded-[10px] flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 lg:px-[40px] mt-4 lg:mt-0 gap-4 lg:gap-0">

                    {/* LEFT: Contributors text */}
                    <div className="flex items-center shrink-0">
                        <span className="text-[16px] lg:text-[18px] text-[#1F1F1F] font-semibold mr-[8px] font-manrope">Contributeurs</span>
                        <span className="text-[14px] lg:text-[16px] text-[#374151] font-inter">
                            {contributors ? contributors.length : 0} personnes
                        </span>
                    </div>

                    {/* RIGHT: Initials badges aligned to the right */}
                    <div className="flex items-center gap-[8px] ml-50 shrink-0 overflow-x-auto hide-scrollbar max-w-full">

                        {contributors && contributors.length > 0 ? (
                            contributors.map((contributor: ProjectMember, index: number) => {

                                const fullName = contributor.name || `${contributor.firstName || ''} ${contributor.lastName || ''}`.trim() || 'Inconnu';
                                const initials = fullName !== 'Inconnu' ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

                                if (index === 0) {
                                    return (
                                        <div key={index} className="flex items-center gap-[5px] shrink-0">
                                            <div className="w-[27px] h-[27px] rounded-full bg-[#FFE8D9] flex items-center justify-center text-[#A63F06] text-[10px] font-semibold font-sans z-10">
                                                {initials}
                                            </div>
                                            <div className="h-[25px] px-[16px] bg-[#FFE8D9] rounded-[50px] flex items-center justify-center text-[#A63F06] text-[12px] lg:text-[14px] font-regular font-inter">
                                                {fullName}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={index} className="flex items-center gap-[5px] shrink-0">
                                        <div className="w-[27px] h-[27px] rounded-full bg-[#E5E7EB] border border-[#FFFFFF] flex items-center justify-center text-[#0F0F0F] text-[10px] font-regular font-sans z-10">
                                            {initials}
                                        </div>
                                        <div className="h-[25px] px-[16px] bg-[#E5E7EB] rounded-[50px] flex items-center justify-center text-[#374151] text-[12px] lg:text-[14px] font-regular font-inter">
                                            {fullName}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <span className="text-[14px] text-[#6B7280] font-regular">Aucun contributeur</span>
                        )}
                    </div>
                </div>
            </div >


            {/* ================= PROJECT BODY ================= */}

            <div className="w-full px-4 lg:px-[100px] pt-4 lg:pt-[41px] pb-8">

                <div className="flex flex-col bg-[#FFFFFF] rounded-[10px] border border-[#E5E7EB] pb-6 lg:pb-[40px] overflow-hidden">


                    {/* TASK HEADER AND FILTERS */}

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full mb-6 lg:mb-[41px] px-4 lg:pl-[59px] pt-6 lg:pt-[40px] gap-4 lg:gap-0">

                        <div className="flex flex-col">
                            <h2 className="text-[16px] lg:text-[18px] font-semibold text-[#1F1F1F] mb-1 lg:mb-[8px] font-manrope">
                                Tâches
                            </h2>
                            <p className="text-[12px] lg:text-[16px] text-[#6B7280] font-regular font-inter">
                                par ordre de priorité
                            </p>
                        </div>

                        {/* RIGHT: Buttons and search */}
                        <div className="flex flex-wrap lg:flex-nowrap items-center w-full lg:w-[701px] lg:pr-[59px] gap-2 lg:gap-0 h-auto lg:h-[63px]">

                            <button className="h-[40px] lg:h-[45px] px-2 lg:w-[94px] flex items-center bg-[#FFE8D9] rounded-[8px] cursor-pointer lg:mr-[10px] shrink-0">
                                <div className="pl-2 lg:pl-[16px] pr-2 lg:pr-[14px] flex items-center justify-center">
                                    <Image src="/list.svg" alt="" aria-hidden="true" width={14} height={14} className="w-[12px] lg:w-[16px]" />
                                </div>
                                <span className="text-[#A63F06] text-[12px] lg:text-[14px] font-regular pr-2 lg:pr-0 font-inter">
                                    Liste
                                </span>
                            </button>

                            <button className="h-[40px] lg:h-[45px] px-2 lg:w-[130px] flex items-center bg-white rounded-[8px] cursor-pointer lg:mr-[16px] shrink-0">
                                <div className="pl-2 lg:pl-[16px] pr-2 lg:pr-[14px] flex items-center justify-center">
                                    <Image src="/logokanban.svg" alt="" aria-hidden="true" width={14} height={14} className="w-[12px] lg:w-[15px]" />
                                </div>
                                <span className="text-[#A63F06] text-[12px] lg:text-[14px] font-medium pr-2 lg:pr-0 font-inter">
                                    Calendrier
                                </span>
                            </button>

                            <button className="relative h-[40px] lg:h-[63px] w-[120px] lg:w-[152px] bg-white border border-[#E5E7EB] rounded-[8px] flex items-center cursor-pointer lg:mr-[16px] shrink-0 mt-2 lg:mt-0">
                                <span className="absolute left-[16px] lg:left-[32px] text-[#6B7280] text-[12px] lg:text-[14px] font-regular font-inter">
                                    Statut
                                </span>
                                <div className="absolute right-[16px] lg:right-[31px]">
                                    <Image src="/vector.svg" alt="" aria-hidden="true" width={12} height={6} className="w-[10px] lg:w-[16px]" />
                                </div>
                            </button>

                            <div className="relative w-full lg:w-[283px] h-[40px] lg:h-[63px] mt-2 lg:mt-0">
                                <label htmlFor="searchTask" className="sr-only">Rechercher une tâche</label>
                                <input
                                    id="searchTask"
                                    type="text"
                                    placeholder="Rechercher une tâche"
                                    className="w-full h-full border border-[#E5E7EB] rounded-[8px] bg-white pl-[16px] lg:pl-[32px] pr-[40px] lg:pr-[59px] text-[12px] lg:text-[14px] text-[#6B7280] outline-none focus:border-[#D3590B] transition"
                                />
                                <div className="absolute right-[16px] lg:right-[32px] top-[50%] -translate-y-1/2 pointer-events-none flex items-center justify-center">
                                    <Image src="/search.svg" alt="" aria-hidden="true" width={12} height={12} className="w-[12px] lg:w-[13.9px]" />
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* TASK LIST */}
                    <div className="h-auto bg-white flex flex-col gap-4 lg:gap-[17px] px-4 lg:pl-[59px] lg:pr-[59px]">

                        {tasks.map((task) => {
                            const frenchStatus = formatStatus(task.status);

                            return (
                                <div key={task.id} className="w-full min-h-[263.54px] h-auto px-4 lg:px-[40px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] flex flex-col hover:shadow-sm transition-shadow overflow-hidden">

                                    {/* CARD HEADER */}
                                    <div className="py-4 lg:p-[25px] flex flex-col lg:flex-row justify-between items-start">

                                        <div className="flex flex-col w-full lg:max-w-[942px]">

                                            {/* Title + status badge */}
                                            <div className="flex flex-wrap items-center gap-2 lg:gap-[8px] mb-2 lg:mb-[7px]">
                                                <h3 className="text-[16px] lg:text-[18px] font-semibold text-[#000000] font-manrope">
                                                    {task.title}
                                                </h3>
                                                {frenchStatus === "À faire" ? (
                                                    <div className="w-auto lg:w-[75px] h-[25px] bg-[#FFE0E0] flex items-center justify-center text-[#991B1B] px-2 lg:px-[16px] py-[4px] rounded-[50px] text-[10px] lg:text-[14px] font-regular">{frenchStatus}</div>
                                                ) : frenchStatus === "En cours" ? (
                                                    <div className="w-auto lg:w-[90px] h-[25px] bg-[#FFF0D7] flex items-center justify-center text-[#9A3412] px-2 lg:px-[16px] py-[4px] rounded-[50px] text-[10px] lg:text-[14px] font-regular">{frenchStatus}</div>
                                                ) : (
                                                    <div className="w-auto lg:w-[94px] h-[25px] bg-[#F1FFF7] flex items-center justify-center text-[#166534] px-2 lg:px-[16px] py-[4px] rounded-[50px] text-[10px] lg:text-[14px] font-regular">{frenchStatus}</div>
                                                )}
                                            </div>

                                            <p className="text-[12px] lg:text-[14px] text-[#6B7280] mb-4 lg:mb-[32px] font-regular line-clamp-2 lg:line-clamp-none font-inter">
                                                {task.description}
                                            </p>

                                            <div className="flex items-center gap-2 lg:gap-[8px] mb-2 lg:mb-[24px] text-[10px] lg:text-[12px] text-[#6B7280] font-regular font-inter">
                                                <span className="font-regular text-[#6B7280]">Échéance :</span>
                                                <Image src="/union.svg" alt="" aria-hidden="true" width={12} height={13} className="w-[12px] lg:w-[15px]" />
                                                <span className="font-regular text-[#1F1F1F] text-[10px] lg:text-[12px] font-inter">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : "Date inconnue"}</span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 lg:gap-[8px] text-[10px] lg:text-[12px] text-[#6B7280] font-regular mb-4 lg:mb-0 font-inter">
                                                <span>Assigné à :</span>
                                                {task.assignees && task.assignees.map((assigneeObj, index: number) => {
                                                    const targetId = getAssigneeId(assigneeObj);
                                                    const userProfile: ProjectMember = typeof assigneeObj === 'string'
                                                        ? contributors.find((contributor) => contributor.id === targetId) || {}
                                                        : assigneeObj.user || contributors.find((contributor) => contributor.id === targetId) || assigneeObj;
                                                    const fullName = userProfile.name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Inconnu';
                                                    const initials = fullName !== 'Inconnu' ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

                                                    return (
                                                        <div key={index} className="flex items-center gap-1 lg:gap-[5px]">
                                                            <div className="w-[20px] h-[20px] lg:w-[27px] lg:h-[27px] rounded-full bg-[#E5E7EB] border border-[#FFFFFF] flex items-center justify-center text-[#0F0F0F] text-[8px] lg:text-[10px] font-regular font-sans z-10 shrink-0">
                                                                {initials}
                                                            </div>
                                                            <div className="h-[20px] lg:h-[25px] px-2 lg:px-[16px] bg-[#E5E7EB] rounded-[50px] flex items-center justify-center text-[#374151] text-[10px] lg:text-[14px] font-regular whitespace-nowrap font-inter">
                                                                {fullName}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Options button */}
                                        <button
                                            aria-label={`Options de la tâche ${task.title}`}
                                            onClick={() => { setSelectedTask(task); setIsEditTaskModalOpen(true) }}
                                            className="w-[40px] h-[40px] lg:w-[57px] lg:h-[57px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-50 transition self-end lg:self-auto lg:mt-[8px] lg:mr-[11px]"
                                        >
                                            <Image src="/plus.svg" alt="" aria-hidden="true" width={15} height={4} className="w-[10px] lg:w-[15px]" />
                                        </button>
                                    </div>

                                    {/* DIVIDER */}
                                    <div className="pl-0 lg:pl-[18px] mt-2 lg:mt-[5px] w-full overflow-hidden" aria-hidden="true">
                                        <Image src="/line2.svg" alt="" width={1000} height={2} className="w-full" />
                                    </div>

                                    {/* CARD FOOTER (Comments) */}
                                    <div className="flex flex-col w-full mt-2 lg:mt-[10px] pl-0 lg:pl-[20px] pb-4 lg:pb-[20px]">

                                        <div className="flex items-center justify-between w-full pr-0 lg:pr-[40px] mb-4 lg:mb-[20px] font-inter">
                                            <span className="text-[12px] lg:text-[14px] text-[#1F1F1F] font-regular">
                                                Commentaires ({task.comments ? task.comments.length : 0})
                                            </span>
                                            <button
                                                aria-label={expandedTaskId === task.id ? "Masquer les commentaires" : "Voir les commentaires"}
                                                aria-expanded={expandedTaskId === task.id}
                                                onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                                className="flex items-center justify-center cursor-pointer hover:opacity-70 transition p-2"
                                            >
                                                <div className={`transition-transform duration-200 ${expandedTaskId === task.id ? 'rotate-180' : ''}`}>
                                                    <Image src="/more.svg" alt="" aria-hidden="true" width={12} height={6} className="w-[12px] lg:w-[16px]" />
                                                </div>
                                            </button>
                                        </div>

                                        {/* COLLAPSED SECTION */}
                                        {expandedTaskId === task.id && (
                                            <div className="flex flex-col gap-4 lg:gap-[20px] w-full overflow-x-auto hide-scrollbar pb-2">

                                                {task.comments && task.comments.map((comment: TaskComment, index: number) => {
                                                    const authorName = comment.author?.name || comment.user?.name || 'Inconnu';
                                                    const initials = authorName !== 'Inconnu' ? authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
                                                    const date = new Date(comment.createdAt || Date.now());
                                                    const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ', ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                                                    const isMe = currentUser && (comment.author?.id === currentUser.id || comment.user?.id === currentUser.id || authorName === currentUser.name);

                                                    return (
                                                        <div key={index} className="flex items-start w-full min-w-[300px]">

                                                            <div className={`w-[27px] h-[27px] shrink-0 rounded-full flex items-center justify-center mr-2 lg:mr-[14px] ${isMe ? 'bg-[#FFE8D9]' : 'bg-[#E5E7EB] border border-[#FFFFFF]'}`}>
                                                                <span className="text-[#0F0F0F] text-[10px] font-normal font-inter">{initials}</span>
                                                            </div>

                                                            <div className="flex-1 bg-[#F3F4F6] min-h-[60px] lg:min-h-[83px] rounded-[10px] pt-[12px] lg:pt-[18px] px-3 lg:px-[14px] pb-[12px] lg:pb-[18px] flex flex-col justify-center">
                                                                <div className="flex justify-between items-center w-full mb-[8px]">
                                                                    <div className="flex items-center gap-[10px]">
                                                                        <span className="text-[#000000] text-[12px] lg:text-[14px] font-normal truncate max-w-[120px] lg:max-w-none font-inter">{authorName}</span>
                                                                    </div>
                                                                    <span className="text-[#6B7280] text-[8px] lg:text-[10px] font-normal shrink-0 font-inter">{formattedDate}</span>
                                                                </div>
                                                                <p className="text-[#000000] text-[10px] lg:text-[12px] font-normal font-inter">
                                                                    {comment.content}
                                                                </p>
                                                            </div>

                                                        </div>
                                                    );
                                                })}

                                                {/* ADD COMMENT BLOCK */}
                                                <div className="flex items-start w-full mt-4 lg:mt-[20px] min-w-[300px]">

                                                    {/* USER INITIALS */}
                                                    <div className="w-[27px] h-[27px] shrink-0 rounded-full bg-[#FFE8D9] flex items-center justify-center mr-2 lg:mr-[14px]">
                                                        <span className="text-[#0F0F0F] text-[10px] font-normal font-inter">
                                                            {currentUser ? (currentUser.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U') : 'U'}
                                                        </span>
                                                    </div>

                                                    {/* TEXT FIELD + SEND BUTTON */}
                                                    <div className="flex-1 flex flex-col items-end mr-0 lg:mr-[16px]">

                                                        {/* TEXT FIELD (901x83) */}
                                                        <div className="w-full h-[60px] lg:h-[83px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] flex items-start pt-3 lg:pt-[16px] px-3 lg:px-[14px]">
                                                            <label htmlFor={`comment-input-${task.id}`} className="sr-only">Ajouter un commentaire</label>
                                                            <input
                                                                id={`comment-input-${task.id}`}
                                                                type="text"
                                                                value={commentText}
                                                                onChange={(e) => setCommentText(e.target.value)}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(task.id); }}
                                                                placeholder="Ajouter un commentaire..."
                                                                className="w-full bg-transparent border-none outline-none text-[#000000] text-[10px] font-normal placeholder-[#6B7280] font-inter"
                                                            />
                                                        </div>

                                                        {/* SEND BUTTON */}
                                                        <button
                                                            onClick={() => handleAddComment(task.id)}
                                                            className="w-full lg:w-[209px] h-[40px] lg:h-[50px] shrink-0 bg-[#E5E7EB] text-[#374151] rounded-[10px] text-[12px] lg:text-[14px] font-medium flex items-center justify-center transition hover:bg-[#D1D5DB] mt-3 lg:mt-[16px] font-inter"
                                                        >
                                                            Envoyer
                                                        </button>
                                                    </div>

                                                </div>

                                            </div>
                                        )}

                                    </div>

                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>

            <ProjectEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                project={project}
            />

            <TaskEditModal
                isOpen={isEditTaskModalOpen}
                onClose={() => setIsEditTaskModalOpen(false)}
                task={selectedTask}
                projectId={project?.id}
                contributors={contributors}
            />

            <TaskCreationModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                projectId={project?.id}
                contributors={contributors}
            />
        </div>
    );
}