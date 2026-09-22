'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import AccessibleModal from './AccessibleModal';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string; 
  contributors: any[]; 
}

function getContributorId(contributor: any) {
  return contributor.user?.id || contributor.userId || contributor.id;
}

export default function TaskCreationModal({ isOpen, onClose, projectId, contributors = [] }: TaskCreationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState('TODO');



  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      const token = Cookies.get('auth_token') || Cookies.get('token');

      const response = await fetch(`http://localhost:8000/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          description: description,
          status,
          // Convert the date to ISO format.
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          // Send the actual user IDs.
          assigneeIds: selectedAssignees
        })
      });

      if (response.ok) {
        console.log("Tâche créée !");
        onClose();
        window.location.reload(); // Refresh the page to display the new task.
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Erreur backend:", errorData);
        alert(errorData?.message || "Erreur lors de la création de la tâche.");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Impossible de joindre le serveur.");
    }
  };

  return (
    <AccessibleModal isOpen={isOpen} onClose={onClose} titleId="create-task-title">

      <div className="bg-[#FFFFFF] rounded-[10px] w-full max-w-[598px] h-auto max-h-[90vh] lg:h-[799px] overflow-y-auto relative pt-[60px] lg:pt-[79px] px-6 lg:px-[73px] pb-[40px] lg:pb-[79px] shadow-xl font-sans flex flex-col hide-scrollbar">

        <button
          onClick={onClose}
          className="absolute top-[20px] lg:top-[37px] right-[20px] lg:right-[38.67px] hover:opacity-70 transition flex items-center justify-center"
        >
          <Image src="/cross.svg" alt="Fermer" width={14} height={14} className="w-[14.33px] h-[14.33px]" />
        </button>

        <h2
          id="create-task-title"
          className="text-[#1F1F1F] text-[20px] lg:text-[24px] font-semibold mb-[24px] lg:mb-[40px] self-start font-manrope"
          style={{ lineHeight: "100%" }}
        >
          Créer une tâche
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">

          <div className="flex flex-col gap-[7px] mb-[16px] lg:mb-[24px]">
            <label htmlFor="task-title" className="text-[14px] font-normal text-[#000000] font-inter">Titre*</label>
            <input
              id="task-title"
              type="text"
              placeholder="Ex: Authentification JWT"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full lg:w-[452px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[12px] text-[#6B7280] outline-none focus:border-[#D3590B] transition"
              required
            />
          </div>

          <div className="flex flex-col gap-[7px] mb-[16px] lg:mb-[24px]">
            <label htmlFor="task-desc" className="text-[14px] font-normal text-[#000000] font-inter">Description*</label>
            <input
              id="task-desc"
              type="text"
              placeholder="Description de la tâche..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full lg:w-[452px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[12px] text-[#6B7280] outline-none focus:border-[#D3590B] transition"
              required
            />
          </div>

          <div className="flex flex-col gap-[7px] mb-[16px] lg:mb-[24px]">
            <label htmlFor="task-date" className="text-[14px] font-normal text-[#000000] font-inter">Échéance*</label>
            <div className="relative w-full lg:w-[452px] h-[53px]">

              {/* Clickable visual field backed by the hidden input. */}
              <style dangerouslySetInnerHTML={{
                __html: `
                .hide-native-date::-webkit-calendar-picker-indicator {
                  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                  width: 100%; height: 100%; opacity: 0; cursor: pointer;
                }
              `}} />

              {/* Formatted visual display, for example: "9 May". */}
              <div className={`w-full h-full border border-[#E5E7EB] rounded-[4px] pl-[17px] pr-[45px] flex items-center text-[12px] bg-white ${dueDate ? 'text-[#1F1F1F]' : 'text-[#6B7280]'}`}>
                {dueDate ? new Date(dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : " "}
              </div>

              {/* Calendar icon. */}
              <div className="absolute right-[17px] top-[50%] -translate-y-1/2 pointer-events-none">
                <Image src="/date.svg" alt="" aria-hidden="true" width={15} height={15} />
              </div>

              <input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer hide-native-date"
              />
            </div>
          </div>


          <div className="flex flex-col gap-[7px] mb-[16px] lg:mb-[24px]">
            <label className="text-[14px] font-normal text-[#000000] font-inter">Assigné à :</label>

            <div className="relative w-full lg:w-[452px]">

              {/* Button used to open the dropdown. */}
              <button
                type="button"
                aria-label="Choisir les personnes assignées"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-controls="task-assignees-list"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full min-h-[53px] border border-[#E5E7EB] rounded-[4px] pl-[17px] pr-[40px] py-[15px] text-left text-[12px] text-[#6B7280] transition cursor-pointer flex flex-wrap gap-[5px]"
              >
                {selectedAssignees.length === 0 ? (
                  "Choisir un ou plusieurs collaborateurs"
                ) : (
                  // Display the selected people.
                  selectedAssignees.map(id => {
                    const person = contributors.find((c: any) => getContributorId(c) === id);
                    const name = person?.name || person?.user?.name || "Inconnu";
                    return (
                      <span key={id} className="bg-[#E5E7EB] text-[#1F1F1F] px-[8px] py-[2px] rounded-[4px]">
                        {name}
                      </span>
                    );
                  })
                )}
              </button>
              <div className="absolute top-[22.5px] right-[17px] pointer-events-none flex items-center justify-center">
                <Image src="/vector.svg" alt="Flèche" width={16} height={8} className={`w-[16px] h-[8px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Hidden dropdown menu. */}
              {isDropdownOpen && (
                <div id="task-assignees-list" role="listbox" aria-label="Personnes assignables" className="absolute top-[58px] left-0 w-full bg-white border border-[#E5E7EB] rounded-[4px] shadow-md z-10 max-h-[150px] overflow-y-auto">
                  {contributors && contributors.length > 0 ? (
                    contributors.map((contributor: any, index: number) => {
                      const targetId = getContributorId(contributor);
                      const fullName = contributor.name || contributor.user?.name || `${contributor.firstName || ''} ${contributor.lastName || ''}`.trim() || 'Inconnu';
                      const isSelected = selectedAssignees.includes(targetId);

                      return (
                        <div
                          key={index}
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={0}
                          onClick={() => {
                            // Toggle the selected person.
                            if (isSelected) {
                              setSelectedAssignees(selectedAssignees.filter(id => id !== targetId));
                            } else {
                              setSelectedAssignees([...selectedAssignees, targetId]);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              if (isSelected) {
                                setSelectedAssignees(selectedAssignees.filter(id => id !== targetId));
                              } else {
                                setSelectedAssignees([...selectedAssignees, targetId]);
                              }
                            }
                          }}
                          className="px-[17px] py-[10px] text-[12px] text-[#1F1F1F] hover:bg-[#F3F4F6] cursor-pointer flex items-center gap-[10px]"
                        >
                          <input type="checkbox" checked={isSelected} readOnly tabIndex={-1} aria-hidden="true" className="cursor-pointer" />
                          {fullName}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-[17px] py-[10px] text-[12px] text-[#6B7280]">Aucun collaborateur dans ce projet</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[14px] font-normal text-[#000000] mb-[8px] lg:mb-[16px] font-inter">Statut :</label>
            <div className="flex flex-wrap items-center gap-[8px]">
              <button
                type="button"
                onClick={() => setStatus('TODO')}
                className={`w-[75px] h-[25px] rounded-[50px] flex items-center justify-center text-[12px] lg:text-[14px] font-normal transition font-inter ${status === 'TODO' ? 'bg-[#FFE0E0] text-[#991B1B] ring-2 ring-red-300' : 'bg-[#FFE0E0] text-[#991B1B]'}`}
              >
                À faire
              </button>

              <button
                type="button"
                onClick={() => setStatus('IN_PROGRESS')}
                className={`w-[90px] h-[25px] rounded-[50px] flex items-center justify-center text-[12px] lg:text-[14px] font-normal transition font-inter ${status === 'IN_PROGRESS' ? 'bg-[#FFF0D7] text-[#9A3412] ring-2 ring-orange-300' : 'bg-[#FFF0D7] text-[#9A3412]'}`}
              >
                En cours
              </button>

              <button
                type="button"
                onClick={() => setStatus('DONE')}
                className={`w-[94px] h-[25px] rounded-[50px] flex items-center justify-center text-[12px] lg:text-[14px] font-normal transition font-inter ${status === 'DONE' ? 'bg-[#F1FFF7] text-[#166534] ring-2 ring-green-300' : 'bg-[#F1FFF7] text-[#166534]'}`}
              >
                Terminée
              </button>
            </div>
          </div>

          {/* Add task button. */}
          <button
            type="submit"
            disabled={!title.trim() || !description.trim()}
            className="mt-[32px] lg:mt-[56px] w-full lg:w-[181px] h-[50px] bg-[#E5E7EB] text-[#374151] rounded-[10px] text-[16px] font-normal flex items-center justify-center transition disabled:cursor-not-allowed hover:bg-[#D1D5DB] self-start font-inter"
          >
            + Ajouter une tâche
          </button>

        </form>
      </div>
    </AccessibleModal>
  );
}