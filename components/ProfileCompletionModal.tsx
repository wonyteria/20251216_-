import React, { useState } from 'react';
import { User, Smartphone, User as UserIcon, CheckCircle2, Loader2, ArrowRight, X } from 'lucide-react';
import { User as UserType } from '../types';
import * as database from '../services/database';

interface ProfileCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (updatedUser: UserType) => void;
    currentUser: UserType;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
    isOpen, onClose, onComplete, currentUser, showToast
}) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState(currentUser.name || '');
    const [birthdate, setBirthdate] = useState(currentUser.birthdate || '');
    const [phone, setPhone] = useState(currentUser.phone || '');

    if (!isOpen) return null;

    // Actions
    const validatePhone = (num: string) => {
        return /^010-\d{4}-\d{4}$/.test(num) || /^010\d{8}$/.test(num);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updates: Partial<UserType> = {
                name,
                birthdate,
                phone,
                isProfileComplete: true
            };

            await database.updateUserProfile(currentUser.id, updates);

            // Merge checks
            const updatedUser = { ...currentUser, ...updates };
            onComplete(updatedUser);
            // Close handled by parent calling onComplete or explicit
        } catch (error) {
            console.error(error);
            showToast("프로필 저장 중 오류가 발생했습니다.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="font-bold text-slate-900 dark:text-white">프로필 완성하기</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {/* Progress Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                            <span className={step === 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}>기본 정보</span>
                            <span className={step === 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}>휴대폰 번호</span>
                            <span className={step === 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}>최종 확인</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                            <div className={`h-full rounded-full transition-all duration-500 ${step >= 1 ? 'bg-indigo-500 w-1/3' : 'bg-transparent w-1/3'}`} />
                            <div className={`h-full rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-500 w-1/3' : 'bg-transparent w-1/3'}`} />
                            <div className={`h-full rounded-full transition-all duration-500 ${step >= 3 ? 'bg-indigo-500 w-1/3' : 'bg-transparent w-1/3'}`} />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 text-center leading-tight">
                        {step === 1 ? '모임 신청을 위해\n프로필을 완성해주세요' : step === 2 ? '휴대폰 번호를\n입력해주세요' : '입력하신 정보가\n맞나요?'}
                    </h3>


                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">실명</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="홍길동"
                                        className="w-full pl-10 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">생년월일 (6자리)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={birthdate}
                                        onChange={(e) => setBirthdate(e.target.value)}
                                        placeholder="900101"
                                        maxLength={6}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (name && birthdate.length === 6) setStep(2);
                                    else showToast("모든 정보를 정확히 입력해주세요.", "error");
                                }}
                                className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl mt-4 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                다음 단계 <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Phone Input */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">휴대폰 번호</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="010-0000-0000"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                />
                            </div>

                            <button
                                onClick={() => {
                                    if (validatePhone(phone)) setStep(3);
                                    else showToast("휴대폰 번호를 정확히 입력해주세요.", "error");
                                }}
                                className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl mt-4 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                다음 단계 <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-slate-500 font-medium hover:text-indigo-600 transition-colors"
                            >
                                이전 단계로
                            </button>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div className="animate-in slide-in-from-right">
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl mb-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">이름</span>
                                    <span className="font-bold dark:text-white">{name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">생년월일</span>
                                    <span className="font-bold dark:text-white">{birthdate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">휴대폰</span>
                                    <span className="font-bold dark:text-white">{phone}</span>
                                </div>
                            </div>
                            <p className="text-center text-xs text-slate-400 mb-6">입력하신 정보는 모임 운영과 본인 확인 용도로만 사용됩니다.</p>

                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : '완료하고 신청 계속하기'}
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full text-sm text-slate-500 font-medium hover:text-indigo-600 transition-colors mt-4"
                            >
                                이전 단계로
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionModal;
