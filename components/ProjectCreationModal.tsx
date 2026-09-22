'use client';

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import AccessibleModal from './AccessibleModal';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectCreationModal({ isOpen, onClose }: ProjectCreationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedContributors, setSelectedContributors] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Search function
  const fetchUsers = async (query: string) => {
    const token = Cookies.get('auth_token') || Cookies.get('token');
    try {
      // Handle spaces and special characters
      const res = await fetch(`http://localhost:8000/users/search?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const json = await res.json();
        const usersArray = json.data?.users || json.data || [];
        setAllUsers(usersArray);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };

  // Trigger on open or when typing in the search bar
  useEffect(() => {
    if (isOpen) {
      // Default search
      fetchUsers(searchTerm || 'a');
    } else {
      // Reset on close
      setTitle('');
      setDescription('');
      setSelectedContributors([]);
      setIsDropdownOpen(false);
      setSearchTerm('');
    }
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = Cookies.get('auth_token') || Cookies.get('token');
      const response = await fetch('http://localhost:8000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: title,
          description: description,
          contributors: selectedContributors
        })
      });

      if (response.ok) {
        onClose();
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.message || "Erreur lors de la création du projet.");
      }
    } catch (error) {
      alert("Impossible de joindre le serveur.");
    }
  };

  return (
    <AccessibleModal isOpen={isOpen} onClose={onClose} titleId="create-project-title">
      <div className="bg-white rounded-[10px] w-full max-w-[598px] max-h-[calc(100dvh-2rem)] overflow-y-auto h-auto lg:h-[616px] relative pt-[60px] lg:pt-[79px] px-5 sm:px-6 lg:px-[73px] pb-6 lg:pb-0 shadow-xl font-sans flex flex-col">

        <button type="button" onClick={onClose} aria-label="Fermer la modale" className="absolute top-[20px] lg:top-[37px] right-[20px] lg:right-[38.67px] hover:opacity-70 transition flex items-center justify-center">
          <Image src="/cross.svg" alt="Fermer" width={14} height={14} />
        </button>

        <h2 id="create-project-title" className="text-[#1F1F1F] text-[20px] lg:text-[24px] font-semibold mb-[24px] lg:mb-[33px] font-manrope">
          Créer un projet
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px] lg:gap-[24px] flex-grow">
          <div className="flex flex-col gap-[7px]">
            <label htmlFor="title" className="text-[14px] font-normal text-[#1F1F1F] font-inter">Titre*</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full lg:w-[452px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] outline-none focus:border-[#D3590B] transition font-inter" required />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label htmlFor="description" className="text-[14px] font-normal text-[#1F1F1F] font-inter">Description*</label>
            <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full lg:w-[452px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] outline-none focus:border-[#D3590B] transition font-inter" required />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className="text-[14px] font-normal text-[#1F1F1F] font-inter">Contributeurs</label>
            <div className="relative w-full lg:w-[452px]">
              <button
                type="button"
                aria-label="Choisir les contributeurs"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-controls="project-contributors-list"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full min-h-[53px] border border-[#E5E7EB] rounded-[4px] pl-[17px] pr-[40px] py-[15px] text-left text-[14px] text-[#6B7280] transition cursor-pointer flex flex-wrap gap-[5px] bg-white font-inter"
              >
                {selectedContributors.length === 0 ? "Choisir un ou plusieurs collaborateurs" : selectedContributors.map(email => (
                  <span key={email} className="bg-[#E5E7EB] text-[#1F1F1F] px-[8px] py-[2px] rounded-[4px] text-[12px]">
                    {allUsers.find(u => u.email === email)?.name || email}
                  </span>
                ))}
              </button>
              <div className="absolute top-[22.5px] right-[17px] pointer-events-none">
                <Image src="/vector.svg" alt="" width={16} height={8} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div id="project-contributors-list" role="listbox" aria-label="Contributeurs disponibles" className="absolute top-[58px] left-0 w-full bg-white border border-[#E5E7EB] rounded-[4px] shadow-lg z-10 flex flex-col">
                  {/* SEARCH BAR IN THE MENU */}
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Rechercher (ex: Alice)..."
                      className="w-full h-[35px] px-2 text-[12px] border border-gray-200 rounded outline-none focus:border-[#D3590B]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[180px] overflow-y-auto">
                    {allUsers.length > 0 ? allUsers.map((user, index) => (
                      <div
                        key={index}
                        role="option"
                        aria-selected={selectedContributors.includes(user.email)}
                        tabIndex={0}
                        onClick={() => {
                          const isSelected = selectedContributors.includes(user.email);
                          setSelectedContributors(isSelected ? selectedContributors.filter(e => e !== user.email) : [...selectedContributors, user.email]);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            const isSelected = selectedContributors.includes(user.email);
                            setSelectedContributors(isSelected ? selectedContributors.filter(e => e !== user.email) : [...selectedContributors, user.email]);
                          }
                        }}
                        className="px-[17px] py-[12px] text-[14px] text-[#1F1F1F] hover:bg-[#F3F4F6] cursor-pointer flex items-center gap-[10px] font-inter"
                      >
                        <input type="checkbox" checked={selectedContributors.includes(user.email)} readOnly tabIndex={-1} aria-hidden="true" className="accent-[#D3590B]" />
                        {user.name || user.email}
                      </div>
                    )) : (
                      <div className="px-[17px] py-[12px] text-center text-[#6B7280] text-[12px]">Aucun résultat</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={!title.trim() || !description.trim()} className="mt-4 lg:mt-auto mb-6 lg:mb-[60px] w-full lg:w-[181px] h-[50px] bg-[#E5E7EB] text-[#374151] rounded-[10px] text-[16px] transition hover:bg-black font-inter">
            Ajouter un projet
          </button>
        </form>
      </div>
    </AccessibleModal>
  );
}