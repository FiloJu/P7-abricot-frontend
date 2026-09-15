"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import Image from "next/image";
import ProjectCreationModal from "@/components/ProjectCreationModal";

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('liste');
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUserName] = useState<string>('');

  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const token = Cookies.get('auth_token') || Cookies.get('token');

    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchData = async () => {

      // Fetch the user profile
      try {
        const userRes = await fetch('http://localhost:8000/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userJson = await userRes.json();
          const userData = userJson.data?.user || userJson.data || userJson.user || userJson;
          if (userData && userData.name) {
            setUserName(userData.name);
          } else if (userData && userData.firstName) {
            setUserName(`${userData.firstName} ${userData.lastName || ''}`);
          }
        }
      } catch (error) {
        console.error("Erreur de récupération du profil :", error);
      }

      // Fetch assigned tasks
      try {

        const response = await fetch('http://localhost:8000/dashboard/assigned-tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data && json.data.tasks) {
            setTasks(json.data.tasks);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches :", error);
      }
    };

    fetchData();
  }, [router]);

  const formatStatus = (status: string) => {
    if (status === 'TODO') return 'À faire';
    if (status === 'IN_PROGRESS') return 'En cours';
    if (status === 'DONE') return 'Terminée';
    return 'À faire';
  };

  const todoTasks = filteredTasks.filter(task => task.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter(task => task.status === 'DONE');

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 lg:px-[100px] lg:py-[50px] font-sans">

      {/* 1. HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end w-full lg:h-[69px] mb-8 lg:mb-[60px] gap-4 lg:gap-0">
        <div className="h-full flex flex-col justify-between gap-2 lg:gap-0">
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-[#1F1F1F] leading-none font-manrope">
            Tableau de bord
          </h1>
          <p className="text-[14px] lg:text-[16px] text-[#6B7280] leading-none font-inter">
            Bonjour {username || "chargement..."}, voici un aperçu de vos projets et tâches
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1F1F1F] text-[#FFFFFF] w-full lg:w-[181px] h-[50px] rounded-[10px] font-medium text-[16px] transition hover:bg-black cursor-pointer">
          + Créer un projet
        </button>
      </div>

      {/* 2. TABS (List / Kanban) */}
      <div className="flex gap-[10px] w-full mb-[30px]" role="tablist">
        <div
          role="tab"
          aria-selected={currentView === 'liste'}
          tabIndex={0}
          onClick={() => setCurrentView('liste')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCurrentView('liste'); }}
          className={`w-[94px] h-[45px] rounded-[8px] flex items-center justify-center gap-[8px] cursor-pointer transition ${currentView === 'liste' ? 'bg-[#FFE8D9] text-[#D3590B]' : 'bg-[#FFFFFF] text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50'}`}
        >
          <Image src="/list.svg" alt="" aria-hidden="true" width={16} height={16} />
          <span className="text-[14px] font-medium font-inter">
            Liste
          </span>
        </div>

        <div
          role="tab"
          aria-selected={currentView === 'kanban'}
          tabIndex={0}
          onClick={() => setCurrentView('kanban')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCurrentView('kanban'); }}
          className={`w-[111px] h-[45px] rounded-[8px] flex items-center justify-center gap-[8px] cursor-pointer transition ${currentView === 'kanban' ? 'bg-[#FFE8D9] text-[#D3590B]' : 'bg-[#FFFFFF] text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50'}`}
        >
          <Image src="/logokanban.svg" alt="" aria-hidden="true" width={16} height={16} />
          <span className="text-[14px] font-medium font-inter">
            Kanban
          </span>
        </div>
      </div>

      {/* ======================= LIST VIEW ======================= */}
      {currentView === 'liste' && (
        <div className="w-full px-4 pt-6 pb-6 lg:px-[59px] lg:pt-[40px] lg:pb-[41px] border border-transparent bg-[#FFFFFF]" role="tabpanel">

          {/* Section header */}
          <div className="flex flex-col lg:flex-row justify-between items-start w-full max-w-[1097px] mx-auto mb-6 lg:mb-[41px] gap-4 lg:gap-0">

            <div className="flex flex-col gap-[8px]">
              <h2 className="text-[16px] lg:text-[18px] font-semibold text-[#1F1F1F] leading-none font-manrope">
                Mes tâches assignées
              </h2>
              <p className="text-[12px] lg:text-[14px] text-[#6B7280] leading-none font-inter">
                Par ordre de priorité
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full lg:w-[357px] h-[50px] lg:h-[63px] bg-[#FFFFFF]">
              <label htmlFor="searchTasks" className="sr-only">Rechercher une tâche</label>
              <input
                id="searchTasks"
                type="text"
                placeholder="Rechercher une tâche"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full border border-[#E5E7EB] rounded-[8px] pl-[32px] pr-[56px] text-[14px] text-[#6B7280] outline-none focus:border-[#D3590B] transition"
              />
              <div className="absolute right-[32px] top-[50%] translate-y-[-50%] pointer-events-none flex items-center justify-center">
                <Image src="/search.svg" alt="" aria-hidden="true" width={16} height={16} />
              </div>
            </div>

          </div>

          {/* TASK LIST */}
          <div className="flex flex-col gap-[17px] w-full max-w-[1097px] mx-auto">

            {filteredTasks.map((task, index) => {
              const frenchStatus = formatStatus(task.status);

              return (
                <div key={task.id || index} className="w-full h-auto lg:h-[162px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-4 lg:p-[25px] flex flex-col lg:flex-row justify-between hover:shadow-sm transition-shadow gap-4 lg:gap-0">

                  {/* Left side: task information */}
                  <div className="flex flex-col w-full lg:w-auto">
                    <h3 className="text-[16px] font-semibold text-[#1F1F1F] mb-2 lg:mb-[7px] font-inter">
                      {task.title}
                    </h3>
                    <p className="text-[14px] text-[#6B7280] mb-4 lg:mb-[32px] line-clamp-2 lg:line-clamp-none font-inter">
                      {task.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center text-[12px] text-[#6B7280] gap-y-2 font-inter">

                      {/* Project */}
                      <div className="flex items-center gap-[8px]">
                        <Image src="/files2.svg" alt="" aria-hidden="true" width={18} height={14} />
                        <span className="truncate max-w-[100px] lg:max-w-none">
                          <span className="sr-only">Projet : </span>
                          {task.project ? task.project.name : "Projet inconnu"}
                        </span>
                      </div>

                      {/* Separator */}
                      <div className="mx-[10px] lg:mx-[15px] flex items-center justify-center bg-[#E5E7EB]" aria-hidden="true">
                        <Image src="/line.svg" alt="" width={1} height={11} className="h-[11px] w-[1px]" />
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-[8px]">
                        <Image src="/date.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <span>
                          <span className="sr-only">Échéance : </span>
                          {task.dueDate ? task.dueDate.substring(0, 10) : "Sans date"}
                        </span>
                      </div>

                      {/* Separator */}
                      <div className="mx-[10px] lg:mx-[15px] flex items-center justify-center bg-[#E5E7EB]" aria-hidden="true">
                        <Image src="/line.svg" alt="" width={1} height={11} className="h-[11px] w-[1px]" />
                      </div>

                      {/* Comments */}
                      <div className="flex items-center gap-[8px]">
                        <Image src="/mess.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <span>
                          <span className="sr-only">Commentaires : </span>
                          {task.comments ? task.comments.length : 0}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Right side: status and button */}
                  <div className="flex flex-row lg:flex-col justify-between items-center lg:items-end w-full lg:w-auto pt-4 lg:pt-0 border-t border-gray-100 lg:border-none">

                    {/* Dynamic status pill */}
                    {frenchStatus === "À faire" ? (
                      <div className="bg-[#FEF2F2] text-[#EF4444] px-[16px] py-[4px] rounded-[40px] text-[12px] font-normal border border-transparent">
                        <span className="sr-only">Statut : </span>{frenchStatus}
                      </div>
                    ) : frenchStatus === "En cours" ? (
                      <div className="bg-[#FFF7ED] text-[#F97316] px-[16px] py-[4px] rounded-[40px] text-[12px] font-normal border border-transparent">
                        <span className="sr-only">Statut : </span>{frenchStatus}
                      </div>
                    ) : (
                      <div className="bg-[#F0FDF4] text-[#22C55E] px-[16px] py-[4px] rounded-[40px] text-[12px] font-normal border border-transparent">
                        <span className="sr-only">Statut : </span>{frenchStatus}
                      </div>
                    )}

                    {/* View button */}
                    <Link
                      href={`/projects/${task.projectId || task.project?.id}`}
                      aria-label={`Voir les détails du projet de la tâche ${task.title}`}
                      className="w-auto px-6 lg:w-[121px] h-[40px] lg:h-[50px] bg-[#1F1F1F] text-[#FFFFFF] rounded-[10px] text-[14px] lg:text-[16px] font-medium transition hover:bg-black cursor-pointer flex items-center justify-center font-inter">
                      Voir
                    </Link>
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* ======================= KANBAN VIEW ======================= */}
      {currentView === 'kanban' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-[22px] w-full pb-4" role="tabpanel">

          {/* COLUMN: TO DO */}
          <div className="flex flex-col h-max border border-[#FFE0E0] rounded-[10px] pt-[20px] lg:pt-[40px] px-4 lg:px-[24px] pb-[41px] bg-[#FFFFFF]">

            <div className="flex items-center gap-[8px] mb-[20px] lg:mb-[40px]">
              <h2 className="text-[16px] lg:text-[18px] font-semibold text-[#1F1F1F] font-manrope">À faire</h2>
              <div className="w-[41px] h-[25px] bg-[#E5E7EB] rounded-[50px] flex items-center justify-center text-[12px] text-[#6B7280]" aria-label={`${todoTasks.length} tâches à faire`}>{todoTasks.length}</div>
            </div>
            <div className="flex flex-col gap-[20px] lg:gap-[41px] items-center">
              {todoTasks.map((task, index) => (
                <div key={index} className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] pt-[20px] lg:pt-[25px] pb-[20px] lg:pb-[32px] px-4 lg:px-[40px] flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] lg:text-[18px] font-semibold text-[#000000] mb-[7px] truncate font-manrope">{task.title}</h3>
                      <p className="text-[12px] lg:text-[14px] text-[#6B7280] line-clamp-2 font-inter">{task.description}</p>
                    </div>
                    <div className="bg-[#FFE0E0] text-[#EF4444] px-2 lg:px-[16px] py-1 lg:py-[4px] rounded-[50px] text-[10px] lg:text-[14px] whitespace-nowrap shrink-0">
                      <span className="sr-only">Statut : </span>À faire
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="flex flex-wrap items-center text-[10px] lg:text-[12px] text-[#6B7280] mt-[20px] lg:mt-[32px] mb-[20px] lg:mb-[32px] gap-y-2 gap-x-1 font-inter">
                      <div className="flex items-center gap-[4px] lg:gap-[8px]">
                        <Image src="/files2.svg" alt="" aria-hidden="true" width={18} height={14} />
                        <span className="truncate max-w-[70px]">
                          <span className="sr-only">Projet : </span>
                          {task.project ? task.project.name : "Projet"}
                        </span>
                      </div>
                      <div className="mx-1 lg:mx-[15px]" aria-hidden="true"><Image src="/line.svg" alt="" width={1} height={11} className="w-[1px] h-[11px]" /></div>
                      <div className="flex items-center gap-[4px] lg:gap-[8px]">
                        <Image src="/date.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <span>
                          <span className="sr-only">Échéance : </span>
                          {task.dueDate ? task.dueDate.substring(0, 10) : "Sans date"}
                        </span>
                      </div>
                      <div className="mx-1 lg:mx-[15px]" aria-hidden="true"><Image src="/line.svg" alt="" width={1} height={11} className="w-[1px] h-[11px]" /></div>
                      <div className="flex items-center gap-[4px] lg:gap-[8px]">
                        <Image src="/mess.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <span>
                          <span className="sr-only">Commentaires : </span>
                          {task.comments ? task.comments.length : 0}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/projects/${task.projectId || task.project?.id}`}
                      aria-label={`Voir les détails du projet de la tâche ${task.title}`}
                      className="w-[100px] lg:w-[121px] h-[40px] lg:h-[50px] bg-[#1F1F1F] text-[#FFFFFF] rounded-[10px] text-[14px] lg:text-[16px] font-medium transition hover:bg-black cursor-pointer flex items-center justify-center font-inter">
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN: IN PROGRESS */}
          <div className="flex flex-col h-max border border-[#FFE0E0] rounded-[10px] pt-[20px] lg:pt-[40px] px-4 lg:px-[24px] pb-[41px] bg-[#FFFFFF]">

            <div className="flex items-center gap-[8px] mb-[20px] lg:mb-[40px]">
              <h2 className="text-[16px] lg:text-[18px] font-semibold text-[#1F1F1F] font-manrope">En cours</h2>
              <div className="w-[41px] h-[25px] bg-[#E5E7EB] rounded-[50px] flex items-center justify-center text-[12px] text-[#6B7280]" aria-label={`${inProgressTasks.length} tâches en cours`}>{inProgressTasks.length}</div>
            </div>
            <div className="flex flex-col gap-[20px] lg:gap-[41px] items-center">
              {inProgressTasks.map((task, index) => (
                <div key={index} className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] pt-[20px] lg:pt-[25px] pb-[20px] lg:pb-[32px] px-4 lg:px-[40px] flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] lg:text-[18px] font-semibold text-[#000000] mb-[7px] truncate font-manrope">{task.title}</h3>
                      <p className="text-[12px] lg:text-[14px] text-[#6B7280] line-clamp-2 font-inter">{task.description}</p>
                    </div>
                    <div className="bg-[#FFF0D7] text-[#E08D00] px-2 lg:px-[16px] py-1 lg:py-[4px] rounded-[50px] text-[10px] lg:text-[14px] whitespace-nowrap shrink-0">
                      <span className="sr-only">Statut : </span>En cours
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="flex flex-wrap items-center text-[10px] lg:text-[12px] text-[#6B7280] mt-[20px] lg:mt-[32px] mb-[20px] lg:mb-[32px] gap-y-2 gap-x-1 font-inter">
                      <div className="flex items-center gap-[4px] lg:gap-[8px]">
                        <Image src="/files2.svg" alt="" aria-hidden="true" width={18} height={14} />
                        <span className="truncate max-w-[70px]">
                          <span className="sr-only">Projet : </span>
                          {task.project ? task.project.name : "Projet"}
                        </span>
                      </div>
                      <div className="mx-1 lg:mx-[15px]" aria-hidden="true"><Image src="/line.svg" alt="" width={1} height={11} className="w-[1px] h-[11px]" /></div>
                      <div className="flex items-center gap-[4px] lg:gap-[8px]">
                        <Image src="/date.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <span>
                          <span className="sr-only">Échéance : </span>
                          {task.dueDate ? task.dueDate.substring(0, 10) : "Sans date"}
                        </span>
                      </div>
                      <div className="mx-1 lg:mx-[15px]" aria-hidden="true"><Image src="/line.svg" alt="" width={1} height={11} className="w-[1px] h-[11px]" /></div>
                      <div className="flex items-center gap-[4px] lg:gap-[8px]">
                        <Image src="/mess.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <span>
                          <span className="sr-only">Commentaires : </span>
                          {task.comments ? task.comments.length : 0}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/projects/${task.projectId || task.project?.id}`}
                      aria-label={`Voir les détails du projet de la tâche ${task.title}`}
                      className="w-[100px] lg:w-[121px] h-[40px] lg:h-[50px] bg-[#1F1F1F] text-[#FFFFFF] rounded-[10px] text-[14px] lg:text-[16px] font-medium transition hover:bg-black cursor-pointer flex items-center justify-center font-inter">
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: DONE */}
          <div className="flex flex-col h-max border border-[#FFE0E0] rounded-[10px] pt-[20px] lg:pt-[40px] px-4 lg:px-[24px] pb-[41px] bg-[#FFFFFF]">

            <div className="flex items-center gap-[8px] mb-[20px] lg:mb-[40px]">
              <h2 className="text-[16px] lg:text-[18px] font-semibold text-[#1F1F1F] font-manrope">Terminées</h2>
              <div className="w-[41px] h-[25px] bg-[#E5E7EB] rounded-[50px] flex items-center justify-center text-[12px] text-[#6B7280]" aria-label={`${doneTasks.length} tâches terminées`}>{doneTasks.length}</div>
            </div>
            <div className="flex flex-col gap-[20px] lg:gap-[41px] items-center">
              {doneTasks.map((task, index) => (
                <div key={index} className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] pt-[20px] lg:pt-[25px] pb-[20px] lg:pb-[32px] px-4 lg:px-[40px] flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] lg:text-[18px] font-semibold text-[#000000] mb-[7px] truncate font-manrope">{task.title}</h3>
                      <p className="text-[12px] lg:text-[14px] text-[#6B7280] line-clamp-2 font-inter">{task.description}</p>
                    </div>
                    <div className="bg-[#F1FFF7] text-[#27E600] px-2 lg:px-[16px] py-1 lg:py-[4px] rounded-[50px] text-[10px] lg:text-[14px] whitespace-nowrap shrink-0">
                      <span className="sr-only">Statut : </span>Terminée
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="flex flex-wrap items-center text-[10px] lg:text-[12px] text-[#6B7280] mt-[20px] lg:mt-[32px] mb-[20px] lg:mb-[32px] gap-y-2 gap-x-1 font-inter">
                      <div className="flex items-center gap-[4px] lg:gap-[8px]">
                        <Image src="/files2.svg" alt="" aria-hidden="true" width={18} height={14} />
                        <span className="truncate max-w-[70px]">
                          <span className="sr-only">Projet : </span>
                          {task.project ? task.project.name : "Projet"}
                        </span>
                      </div>
                      <div className="mx-1 lg:mx-[15px]" aria-hidden="true"><Image src="/line.svg" alt="" width={1} height={11} className="w-[1px] h-[11px]" /></div>
                      <div className="flex items-center gap-[4px] lg:gap-[8px]">
                        <Image src="/date.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <span>
                          <span className="sr-only">Échéance : </span>
                          {task.dueDate ? task.dueDate.substring(0, 10) : "Sans date"}
                        </span>
                      </div>
                      <div className="mx-1 lg:mx-[15px]" aria-hidden="true"><Image src="/line.svg" alt="" width={1} height={11} className="w-[1px] h-[11px]" /></div>
                      <div className="flex items-center gap-[4px] lg:gap-[8px]">
                        <Image src="/mess.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <span>
                          <span className="sr-only">Commentaires : </span>
                          {task.comments ? task.comments.length : 0}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/projects/${task.projectId || task.project?.id}`}
                      aria-label={`Voir les détails du projet de la tâche ${task.title}`}
                      className="w-[100px] lg:w-[121px] h-[40px] lg:h-[50px] bg-[#1F1F1F] text-[#FFFFFF] rounded-[10px] text-[14px] lg:text-[16px] font-medium transition hover:bg-black cursor-pointer flex items-center justify-center font-inter">
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      <ProjectCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
