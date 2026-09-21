'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [editLastName, setEditLastName] = useState('');
    const [editFirstName, setEditFirstName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = Cookies.get('auth_token') || Cookies.get('token');

        if (!token) {
            router.replace('/login');
            setLoading(false);
            return;
        }

        const fetchUserProfile = async () => {

            try {
                const res = await fetch('http://localhost:8000/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const json = await res.json();
                    const userData = json.data?.user || json.data || json.user || json;
                    setUser(userData);

                    const fullName = userData?.name || '';
                    const nameParts = fullName.split(' ');
                    const extractedFirstName = userData?.firstName || nameParts[0] || '';
                    const extractedLastName = userData?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
                    setEditFirstName(extractedFirstName);
                    setEditLastName(extractedLastName);
                    setEditEmail(userData?.email || '');
                }
            } catch (err) {
                console.error("Erreur de récupération du profil:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [router]);

    const handleLogout = () => {
        Cookies.remove('auth_token', { path: '/' });
        Cookies.remove('token', { path: '/' });
        window.location.href = '/login';
    };

    const handleUpdateProfile = async () => {
        setSuccessMessage('');
        setErrorMessage('');
        const token = Cookies.get('auth_token') || Cookies.get('token');

        const updateData: any = {
            name: `${editFirstName} ${editLastName}`.trim(),
            email: editEmail
        };

        // Password is included only if the user has entered a new password
        if (newPassword.trim() !== '') {
            updateData.password = newPassword;
        }

        try {
            const response = await fetch('http://localhost:8000/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                setSuccessMessage("Profil mis à jour avec succès !");
                setNewPassword('');
            } else {
                setErrorMessage("Erreur lors de la mise à jour des informations. Veuillez réessayer");
            }
        } catch (error) {
            setErrorMessage("Impossible de joindre le serveur.");
        }
    };

    // Loading state
    if (loading) return <div className="p-10 text-center font-sans">Chargement de votre profil...</div>;

    return (
        <div className="bg-[#F3F4F6] min-h-screen pt-[40px] lg:pt-[57px] pb-[80px] lg:pb-[181px] px-4 lg:pl-[100px] lg:pr-[125px] font-sans">

            <div className="w-full max-w-[1215px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-6 lg:px-[59px] pt-[30px] lg:pt-[40px] pb-[40px] lg:pb-[59px] flex flex-col mx-auto">

                <div className="mb-[30px] lg:mb-[41px]">
                    <h1 className="text-[20px] lg:text-[24px] font-semibold text-[#1F1F1F] mb-[8px] font-manrope">
                        Mon compte
                    </h1>
                    <p className="text-[14px] lg:text-[16px] text-[#6B7280] font-inter">
                        {`${editFirstName} ${editLastName}`.trim() || 'Utilisateur'}
                    </p>
                </div>

                <div className="flex flex-col w-full">

                    {successMessage && <div role="alert" className="mb-4 p-3 bg-green-100 text-green-700 rounded-[4px] text-[14px]">{successMessage}</div>}
                    {errorMessage && <div role="alert" className="mb-4 p-3 bg-red-100 text-red-700 rounded-[4px] text-[14px]">{errorMessage}</div>}

                    <div className="mb-[20px] lg:mb-[24px]">
                        <label htmlFor="lastName" className="block text-[14px] text-[#000000] font-regular mb-[7px] font-inter">Nom</label>
                        <input
                            id="lastName"
                            type="text"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            placeholder="Nom"
                            className="w-full lg:max-w-[1097px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[14px] text-[#4B5563] placeholder:text-[#4B5563] bg-[#FFFFFF] outline-none focus:border-[#D3590B] transition"
                        />
                    </div>

                    <div className="mb-[20px] lg:mb-[24px]">
                        <label htmlFor="firstName" className="block text-[14px] text-[#000000] font-regular mb-[7px] font-inter">Prénom</label>
                        <input
                            id="firstName"
                            type="text"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            placeholder="Prénom"
                            className="w-full lg:max-w-[1097px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[14px] text-[#4B5563] placeholder:text-[#4B5563] bg-[#FFFFFF] outline-none focus:border-[#D3590B] transition"
                        />
                    </div>

                    <div className="mb-[20px] lg:mb-[24px]">
                        <label htmlFor="email" className="block text-[14px] text-[#000000] font-regular mb-[7px] font-inter">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Adresse email"
                            className="w-full lg:max-w-[1097px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[14px] text-[#4B5563] placeholder:text-[#4B5563] bg-[#FFFFFF] outline-none focus:border-[#D3590B] transition"
                        />
                    </div>

                    <div className="mb-[30px] lg:mb-[41px] bg-[#FFFFFF]">
                        <label htmlFor="newPassword" className="block text-[12px] lg:text-[14px] text-[#000000] font-regular mb-[7px] break-words font-inter">Mot de passe</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="●●●●●●●●●●●"
                            className="w-full lg:max-w-[1097px] h-[53px] border border-[#E5E7EB] rounded-[4px] px-[17px] text-[14px] text-[#1F1F1F] placeholder:text-[#4B5563] tracking-widest outline-none focus:border-[#D3590B] transition"
                        />
                    </div>

                </div>

                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mt-4">
                    <button
                        onClick={handleUpdateProfile}
                        className="w-full lg:w-[242px] h-[50px] bg-[#1F1F1F] rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-black transition self-start"
                    >
                        <span className="text-[14px] lg:text-[16px] text-[#FFFFFF] font-regular font-inter">
                            Modifier les informations
                        </span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full lg:w-[242px] h-[50px] bg-[#FFE8D9] text-[#A63F06] rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-[#FFDCC2] transition self-start lg:self-end"
                    >
                        <span className="text-[14px] lg:text-[16px] font-regular font-inter">
                            Déconnexion
                        </span>
                    </button>
                </div>

            </div>
        </div>
    );
}