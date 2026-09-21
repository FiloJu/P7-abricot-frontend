'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';

interface ProjectEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
}

export default function ProjectEditModal({ isOpen, onClose, project }: ProjectEditModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [members, setMembers] = useState<any[]>([]);
    const [selectedContributors, setSelectedContributors] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (project && isOpen) {
            setTitle(project.title || project.name || '');
            setDescription(project.description || '');

            const allProjectMembers = [];

            if (project.owner) {
                allProjectMembers.push(project.owner);
            }

            if (project.members) {
                project.members.forEach((m: any) => {
                    if (m.user && m.user.id !== project.owner?.id) {
                        allProjectMembers.push(m.user);
                    } else if (m.id !== project.owner?.id) {
                        allProjectMembers.push(m);
                    }
                });
            }

            setMembers(allProjectMembers);

            const emails = allProjectMembers.map((u: any) => u.email).filter(Boolean);
            setSelectedContributors(emails);
        }
    }, [project, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = Cookies.get('token');
        try {
            const response = await fetch(`http://localhost:8000/projects/${project.id}`, {
                method: 'PUT',
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
            }
        } catch (error) {
            console.error("Erreur de mise à jour:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[10px] w-full max-w-[598px] min-h-[500px] lg:h-[616px] relative pt-[60px] lg:pt-[79px] px-6 lg:px-[73px] pb-[40px] lg:pb-[79px] shadow-xl font-sans flex flex-col hide-scrollbar overflow-y-auto">

                <button
                    onClick={onClose}
                    aria-label="Fermer la modale"
                    className="absolute top-[20px] lg:top-[37.5px] right-[20px] lg:right-[39.17px] hover:opacity-70 transition"
                >
                    <Image src="/cross.svg" alt="" width={14} height={14} />
                </button>

                <h2 className="text-[#1F1F1F] text-[20px] lg:text-[24px] font-semibold mb-[24px] lg:mb-[40px] font-manrope">
                    Modifier un projet
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-[20px] lg:gap-[24px] flex-grow font-inter text-[14px]">

                    {/* Title with associated label. */}
                    <div className="flex flex-col gap-[7px]">
                        <label htmlFor="edit-project-title" className="font-normal text-[#1F1F1F]">Titre*</label>
                        <input
                            id="edit-project-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[#6B7280] outline-none focus:border-[#D3590B] transition"
                            required
                        />
                    </div>

                    {/* Description with associated label. */}
                    <div className="flex flex-col gap-[7px]">
                        <label htmlFor="edit-project-desc" className="font-normal text-[#1F1F1F]">Description*</label>
                        <input
                            id="edit-project-desc"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[#6B7280] outline-none focus:border-[#D3590B] transition"
                            required
                        />
                    </div>

                    {/* Contributors. */}
                    <div className="flex flex-col gap-[7px]">
                        <label id="label-contributors" className="font-normal text-[#1F1F1F]">Contributeurs</label>
                        <div className="relative w-full lg:w-[452px]">
                            <div
                                role="combobox"
                                aria-labelledby="label-contributors"
                                aria-expanded={isDropdownOpen}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full min-h-[53px] border border-[#E5E7EB] rounded-[4px] pl-[17px] pr-[40px] py-[15px] text-[#6B7280] transition cursor-pointer flex flex-wrap gap-[5px] bg-white"
                            >
                                {selectedContributors.length} collaborateur(s) sélectionné(s)
                            </div>
                            <div className="absolute top-[22.5px] right-[17px] pointer-events-none">
                                <Image src="/vector.svg" alt="" width={16} height={8} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isDropdownOpen && (
                                <div role="listbox" className="absolute top-[58px] left-0 w-full bg-white border border-[#E5E7EB] rounded-[4px] shadow-lg z-10 max-h-[180px] overflow-y-auto">
                                    {members.map((member, index) => {
                                        const userEmail = member.user?.email || member.email;
                                        const userName = member.user?.name || member.name || userEmail;
                                        const isSelected = selectedContributors.includes(userEmail);
                                        const inputId = `checkbox-member-${index}`;

                                        return (
                                            <div
                                                key={index}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedContributors(selectedContributors.filter(e => e !== userEmail));
                                                    } else {
                                                        setSelectedContributors([...selectedContributors, userEmail]);
                                                    }
                                                }}
                                                className="px-[17px] py-[10px] text-[12px] text-[#1F1F1F] hover:bg-[#F3F4F6] cursor-pointer flex items-center gap-[10px] border-b border-gray-50 last:border-none"
                                            >
                                                <input
                                                    id={inputId}
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    readOnly
                                                    className="cursor-pointer accent-[#D3590B]"
                                                    aria-label={`Sélectionner ${userName}`}
                                                />
                                                <label htmlFor={inputId} className="cursor-pointer">{userName}</label>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col-reverse lg:flex-row items-center justify-between w-full gap-4">
                        <button type="submit" className="w-full lg:w-[181px] h-[50px] bg-[#E5E7EB] text-[#374151] rounded-[10px] hover:bg-black transition">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}