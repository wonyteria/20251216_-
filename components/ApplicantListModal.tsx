
import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw, Smartphone, User as UserIcon } from 'lucide-react';
import { Application, ApplicationStatus } from '../types';
import * as database from '../services/database';

interface ApplicantListModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: number;
    itemTitle: string;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ApplicantListModal: React.FC<ApplicantListModalProps> = ({
    isOpen, onClose, itemId, itemTitle, showToast
}) => {
    const [applicants, setApplicants] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && itemId) {
            loadApplicants();
        }
    }, [isOpen, itemId]);

    const loadApplicants = async () => {
        setIsLoading(true);
        const data = await database.getItemApplicants(itemId);
        setApplicants(data);
        setIsLoading(false);
    };

    const handleStatusChange = async (appId: number, newStatus: ApplicationStatus) => {
        // Optimistic update
        const app = applicants.find(a => a.id === appId);
        if (!app) return;

        const previousStatus = app.status;
        setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));

        try {
            const success = await database.updateApplicationStatus(app.userId, app.itemId, newStatus);
            if (!success) {
                // Revert
                setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: previousStatus } : a));
                showToast("상태 변경에 실패했습니다.", "error");
            } else {
                showToast("상태가 변경되었습니다.", "success");
            }
        } catch (error) {
            console.error(error);
            setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: previousStatus } : a));
        }
    };

    if (!isOpen) return null;

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'applied': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">신청완료</span>;
            case 'paid': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">입금완료</span>;
            case 'checked-in': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">참여확정</span>;
            case 'refund-requested': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">환불요청</span>;
            case 'refund-completed': return <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded">환불완료</span>;
            default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">{status}</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-xl flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">참여자 관리</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-sm">{itemTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {isLoading ? (
                        <div className="py-20 text-center text-slate-500">
                            <RefreshCw className="animate-spin mx-auto mb-2" />
                            로딩 중...
                        </div>
                    ) : applicants.length === 0 ? (
                        <div className="py-20 text-center text-slate-500">
                            신청자가 아직 없습니다.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                                <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    <th className="p-4 border-b dark:border-slate-700">참여자</th>
                                    <th className="p-4 border-b dark:border-slate-700">연락처</th>
                                    <th className="p-4 border-b dark:border-slate-700">상태</th>
                                    <th className="p-4 border-b dark:border-slate-700 text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applicants.map(app => (
                                    <tr key={app.id} className="border-b dark:border-slate-800 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                    <UserIcon size={14} />
                                                </div>
                                                {app.userName || '익명'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Smartphone size={14} className="text-slate-400" />
                                                {app.userPhone || '010-****-****'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={app.status} />
                                            {app.refundReason && <div className="text-[10px] text-red-500 mt-1">사유: {app.refundReason}</div>}
                                        </td>
                                        <td className="p-4 text-right">
                                            {app.status === 'applied' && (
                                                <button
                                                    onClick={() => handleStatusChange(app.id, 'paid')}
                                                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-500 transition-colors"
                                                >
                                                    입금확인
                                                </button>
                                            )}
                                            {app.status === 'paid' && (
                                                <button
                                                    onClick={() => handleStatusChange(app.id, 'checked-in')}
                                                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-500 transition-colors"
                                                >
                                                    참여체크
                                                </button>
                                            )}
                                            {app.status === 'refund-requested' && (
                                                <button
                                                    onClick={() => handleStatusChange(app.id, 'refund-completed')}
                                                    className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-500 transition-colors"
                                                >
                                                    환불완료
                                                </button>
                                            )}
                                            {app.status === 'checked-in' && <span className="text-emerald-600 text-xs font-bold flex items-center justify-end gap-1"><Check size={14} /> 참여함</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicantListModal;
