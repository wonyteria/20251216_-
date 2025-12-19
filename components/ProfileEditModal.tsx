
import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { User } from '../types';
import * as database from '../services/database';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onUpdateUser: (user: User) => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const INTEREST_OPTIONS = [
    "부동산 투자", "내집마련", "청약", "경매/공매", "재건축/재개발",
    "상가/오피스텔", "토지", "세금/절세", "인테리어", "프롭테크",
    "네트워킹", "자기계발", "독서", "재테크", "주식/코인"
];

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
    isOpen, onClose, currentUser, onUpdateUser, showToast
}) => {
    const [name, setName] = useState(currentUser.name);
    const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser.interests || []);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser) {
            setName(currentUser.name);
            setSelectedInterests(currentUser.interests || []);
        }
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(prev => prev.filter(i => i !== interest));
        } else {
            if (selectedInterests.length >= 5) {
                showToast("관심사는 최대 5개까지 선택 가능합니다.", "info");
                return;
            }
            setSelectedInterests(prev => [...prev, interest]);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showToast("이름을 입력해주세요.", "error");
            return;
        }

        setIsLoading(true);
        try {
            const updates = {
                name,
                interests: selectedInterests
            };

            const success = await database.updateUserProfile(currentUser.id, updates);

            if (success) {
                onUpdateUser({ ...currentUser, ...updates });
                showToast("프로필이 수정되었습니다.", "success");
                onClose();
            } else {
                showToast("프로필 수정 실패", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("오류가 발생했습니다.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white">프로필 수정</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">관심사 (최대 5개)</label>
                        <div className="flex flex-wrap gap-2">
                            {INTEREST_OPTIONS.map(option => (
                                <button
                                    key={option}
                                    onClick={() => toggleInterest(option)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedInterests.includes(option)
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? '저장 중...' : '저장하기'} <Check size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditModal;
