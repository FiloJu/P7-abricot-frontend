'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import AccessibleModal from './AccessibleModal';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  contributors?: any[]; 
  task?: any; 
}

function getContributorId(contributor: any) {
  return contributor.user?.id || contributor.userId || contributor.id;
}

const FRENCH_MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function formatDateOnly(value?: string): string {
  if (!value) return '';

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;

  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;

  return `${Number(day)} ${FRENCH_MONTHS[monthIndex] || month} ${year}`;
}

export default function TaskEditModal({ isOpen, onClose, task, projectId, contributors = [] }: TaskEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [status, setStatus] = useState('À faire'); // Controls badge selection.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Populate the form when the selected task changes.
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');

      if (task.dueDate) {
        const dateObj = new Date(task.dueDate);
        setDueDate(dateObj.toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }

      if (task.assignees) {
        // Extract the assignee IDs.
        const assigneeIds = task.assignees.map((a: any) => {
          if (typeof a === 'string') return a;
          return a.userId || a.user_id || a.user?.id || a.id;
        });
        setSelectedAssignees(assigneeIds.filter(Boolean));
      } else {
        setSelectedAssignees([]);
      }

      // Translate the backend status for display.
      if (task.status === 'TODO') setStatus('À faire');
      else if (task.status === 'IN_PROGRESS') setStatus('En cours');
      else if (task.status === 'DONE') setStatus('Terminée');
    }
  }, [task]);

  if (!isOpen) return null;

  // Update request.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId || !task?.id) return;
    try {
      const token = Cookies.get('auth_token') || Cookies.get('token');
      let backendStatus = "TODO";
      if (status === "En cours") backendStatus = "IN_PROGRESS";
      if (status === "Terminée") backendStatus = "DONE";

      // Target the exact task URL with /tasks/${task.id}.
      const response = await fetch(`http://localhost:8000/projects/${projectId}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          description: description,
          status: backendStatus,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          assigneeIds: selectedAssignees
        })
      });

      if (response.ok) {
        console.log("Tâche modifiée !");
        onClose();
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Erreur backend:", errorData);
        alert(errorData?.message || "Erreur lors de la modification de la tâche.");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Impossible de joindre le serveur.");
    }
  };


  return (
    // 1. Blurred overlay.
    <AccessibleModal isOpen={isOpen} onClose={onClose} titleId="edit-task-title-heading">

      {/* Modal window. */}
      <div className="bg-[#FFFFFF] rounded-[10px] w-full max-w-[598px] h-auto max-h-[90vh] lg:h-[799px] overflow-y-auto relative pt-[60px] lg:pt-[79px] px-6 lg:px-[73px] pb-[40px] lg:pb-[79px] shadow-xl font-sans flex flex-col hide-scrollbar">

        {/* Close button. */}
        <button
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute top-[20px] lg:top-[37px] right-[20px] lg:right-[38.67px] hover:opacity-70 transition flex items-center justify-center"
        >
          <Image src="/cross.svg" alt="" aria-hidden="true" width={14} height={14} className="w-[14.33px] h-[14.33px]" />
        </button>

        {/* Main title. */}
        <h2
          id="edit-task-title-heading"
          className="text-[#1F1F1F] text-[20px] lg:text-[24px] font-semibold mb-[24px] lg:mb-[40px] self-start font-manrope"
          style={{ lineHeight: "100%" }}
        >
          Modifier
        </h2>

        {/* Form. */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">

          {/* Title field. */}
          <div className="flex flex-col gap-[7px] mb-[16px] lg:mb-[24px]">
            <label htmlFor="title" className="text-[14px] font-normal text-[#000000] font-inter">Titre</label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full lg:w-[452px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[12px] text-[#6B7280] outline-none focus:border-[#D3590B] transition"
              required
            />
          </div>

          {/* Description field. */}
          <div className="flex flex-col gap-[7px] mb-[16px] lg:mb-[24px]">
            <label htmlFor="description" className="text-[14px] font-normal text-[#000000] font-inter">Description</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full lg:w-[452px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[12px] text-[#6B7280] outline-none focus:border-[#D3590B] transition"
              required
            />
          </div>

          {/* Due date field. */}
          <div className="flex flex-col gap-[7px] mb-[16px] lg:mb-[24px]">
            <label htmlFor="edit-task-date" className="text-[14px] font-normal text-[#000000] font-inter">Échéance</label>
            <div className="relative w-full lg:w-[452px] h-[53px]">

              {/* Clickable input. */}
              <style dangerouslySetInnerHTML={{
                __html: `
                .hide-native-date::-webkit-calendar-picker-indicator {
                  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                  width: 100%; height: 100%; opacity: 0; cursor: pointer;
                }
              `}} />

              {/* Formatted visual display, for example: "9 March". */}
              {/* Keep render deterministic to avoid hydration mismatches. */}
              <div className={`w-full h-full border border-[#E5E7EB] rounded-[4px] pl-[17px] pr-[45px] flex items-center text-[12px] bg-white ${dueDate ? 'text-[#1F1F1F]' : 'text-[#6B7280]'}`}>
                {formatDateOnly(dueDate)}
              </div>

              {/* Calendar icon. */}
              <div className="absolute right-[17px] top-[50%] -translate-y-1/2 pointer-events-none">
                <Image src="/date.svg" alt="" aria-hidden="true" width={15} height={15} />
              </div>

              <input
                id="edit-task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer hide-native-date"
              />
            </div>
          </div>


          {/* Assignee field. */}
          <div className="flex flex-col gap-[7px] mb-[16px] lg:mb-[24px]">
            <label id="assignees-label" className="text-[14px] font-normal text-[#000000] font-inter">Assigné à :</label>
            <div className="relative w-full lg:w-[452px]">

              {/* Number of selected members. */}
              <button
                type="button"
                aria-label="Choisir les personnes assignées"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-controls="edit-task-assignees-list"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full min-h-[53px] border border-[#E5E7EB] rounded-[4px] pl-[17px] pr-[40px] py-[15px] text-left text-[12px] text-[#6B7280] transition cursor-pointer flex items-center bg-white"
              >
                {selectedAssignees.length === 0
                  ? "Choisir un ou plusieurs collaborateurs"
                  : `${selectedAssignees.length} collaborateur(s)`}
              </button>

              {/* Arrow icon. */}
              <div className="absolute right-[17px] top-[50%] -translate-y-1/2 pointer-events-none flex items-center justify-center">
                <Image src="/vector.svg" alt="" aria-hidden="true" width={16} height={8} className={`w-[16px] h-[8px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>


              {isDropdownOpen && (
                <div id="edit-task-assignees-list" role="listbox" aria-label="Personnes assignables" className="absolute top-[70px] left-0 w-full bg-white border border-[#E5E7EB] rounded-[4px] shadow-md z-10 max-h-[150px] overflow-y-auto">
                  {contributors && contributors.length > 0 ? (
                    contributors.map((contributor: any, index: number) => {
                      const targetId = getContributorId(contributor);

                      const fullName = contributor.name || contributor.user?.name || `${contributor.firstName || ''} ${contributor.lastName || ''}`.trim() || `${contributor.user?.firstName || ''} ${contributor.user?.lastName || ''}`.trim();
                      const nameToDisplay = fullName ? fullName : "Inconnu";

                      const isSelected = selectedAssignees.includes(targetId);

                      return (
                        <div
                          key={index}
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={0}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAssignees(selectedAssignees.filter(id => id !== targetId));
                            } else {
                              setSelectedAssignees([...selectedAssignees, targetId]);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
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
                          {nameToDisplay}
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


          {/* Status field (badges). */}
          <div className="flex flex-col">
            <label className="text-[14px] font-normal text-[#000000] mb-[8px] lg:mb-[16px] font-inter">Statut :</label>
            <div className="flex flex-wrap items-center gap-[8px]">
              {/* To-do badge. */}
              <button
                type="button"
                aria-pressed={status === 'À faire'}
                onClick={() => setStatus('À faire')}
                className={`w-[75px] h-[25px] rounded-[50px] flex items-center justify-center text-[12px] lg:text-[14px] font-normal transition font-inter ${status === 'À faire' ? 'bg-[#FFE0E0] text-[#991B1B] ring-2 ring-red-300' : 'bg-[#FFE0E0] text-[#991B1B]'}`}
              >
                À faire
              </button>

              {/* In-progress badge. */}
              <button
                type="button"
                aria-pressed={status === 'En cours'}
                onClick={() => setStatus('En cours')}
                className={`w-[90px] h-[25px] rounded-[50px] flex items-center justify-center text-[12px] lg:text-[14px] font-normal transition font-inter ${status === 'En cours' ? 'bg-[#FFF0D7] text-[#9A3412] ring-2 ring-orange-300' : 'bg-[#FFF0D7] text-[#9A3412]'}`}
              >
                En cours
              </button>

              {/* Completed badge. */}
              <button
                type="button"
                aria-pressed={status === 'Terminée'}
                onClick={() => setStatus('Terminée')}
                className={`w-[94px] h-[25px] rounded-[50px] flex items-center justify-center text-[12px] lg:text-[14px] font-normal transition font-inter ${status === 'Terminée' ? 'bg-[#F1FFF7] text-[#166534] ring-2 ring-green-300' : 'bg-[#F1FFF7] text-[#166534]'}`}
              >
                Terminée
              </button>
            </div>
          </div>

          <div className="mt-[32px] lg:mt-[56px] flex flex-col-reverse lg:flex-row items-center gap-[16px] lg:gap-[24px]">
            <button
              type="submit"
              className="w-full lg:w-[181px] h-[50px] bg-[#E5E7EB] text-[#374151] rounded-[10px] text-[16px] font-normal flex items-center justify-center transition hover:bg-[#D1D5DB] font-inter"
            >
              Enregistrer
            </button>

          </div>
        </form>
      </div>
    </AccessibleModal>
  );
}