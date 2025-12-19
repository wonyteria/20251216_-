
import React, { useState, useEffect } from 'react';
import { X, Star, Save, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { AnyItem, User, Review } from '../types';
import * as database from '../services/database';

interface ReviewWriteModalProps {
    onClose: () => void;
    currentUser: User | null;
    onSuccess: () => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
    initialItem?: AnyItem; // If coming from a specific item
    editReview?: Review;   // If editing
}

const ReviewWriteModal: React.FC<ReviewWriteModalProps> = ({ onClose, currentUser, onSuccess, showToast, initialItem, editReview }) => {
    const [reviewableItems, setReviewableItems] = useState<AnyItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<AnyItem | null>(initialItem || null);
    const [rating, setRating] = useState(editReview?.rating || 5);
    const [text, setText] = useState(editReview?.text || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        if (editReview) return; // Don't fetch if editing

        const fetchReviewable = async () => {
            setIsLoading(true);
            const items = await database.getReviewableItems(currentUser.id);
            setReviewableItems(items);
            if (items.length > 0 && !selectedItem) {
                setSelectedItem(items[0]);
            }
            setIsLoading(false);
        };
        fetchReviewable();
    }, [currentUser, editReview]);

    const handleSubmit = async () => {
        if (!currentUser) return;
        if (!selectedItem && !editReview) {
            showToast("리뷰를 작성할 콘텐츠를 선택해주세요.", "error");
            return;
        }
        if (text.length < 10) {
            showToast("리뷰를 최소 10자 이상 작성해주세요.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editReview) {
                const isAdmin = currentUser.roles?.includes('super_admin');
                await database.updateReview(editReview.id, { text, rating }, isAdmin);
                showToast("리뷰가 수정되었습니다.", "success");
            } else if (selectedItem) {
                const success = await database.createReview({
                    itemId: selectedItem.id,
                    userId: currentUser.id,
                    user: currentUser.name,
                    avatar: currentUser.avatar,
                    text,
                    rating
                });
                if (success) {
                    showToast("리뷰가 성공적으로 등록되었습니다!", "success");
                } else {
                    throw new Error("리뷰 등록 실패");
                }
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast(error.message || "오류가 발생했습니다.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                {editReview ? "리뷰 수정하기" : "생생한 후기 남기기"}
                            </h3>
                            {!editReview && <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Share your experience</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Item Selection (only if not editing and not pre-selected) */}
                    {!editReview && !initialItem && (
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">리뷰를 쓰실 참여작을 골라주세요</label>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8 text-slate-400">
                                    <Loader2 className="animate-spin mr-2" size={20} /> 로딩 중...
                                </div>
                            ) : reviewableItems.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {reviewableItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all text-left ${selectedItem?.id === item.id
                                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                        >
                                            <img src={item.img} className="w-12 h-12 rounded-xl object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-slate-900 dark:text-white text-sm truncate">{item.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.categoryType} • {item.date}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-center">
                                    <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
                                    <p className="text-sm font-bold text-slate-500">리뷰를 작성할 수 있는 참여 내역이 없습니다.</p>
                                    <p className="text-xs text-slate-400 mt-1">참여 완료 후 종료된 콘텐츠만 리뷰가 가능합니다.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pre-selected Item Info */}
                    {(initialItem || editReview) && (
                        <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <img src={initialItem?.img || (editReview as any)?.itemImg || "https://images.unsplash.com/photo-1557683316-973673baf926?w=800"} className="w-14 h-14 rounded-2xl object-cover" />
                            <div>
                                <p className="font-black text-slate-900 dark:text-white">{initialItem?.title || "(콘텐츠 제목)"}</p>
                                <p className="text-xs text-slate-500 font-bold mt-0.5">{initialItem?.categoryType || "참여 완료"}</p>
                            </div>
                        </div>
                    )}

                    {/* Rating Section */}
                    {((selectedItem && !editReview) || initialItem || editReview) && (
                        <>
                            <div className="space-y-4 text-center">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">이 경험은 어떠셨나요?</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setRating(num)}
                                            className="p-2 transition-transform hover:scale-125 active:scale-90"
                                        >
                                            <Star
                                                size={32}
                                                className={num <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                    {rating === 5 ? "최고였어요! 😍" : rating === 4 ? "좋았어요! 😊" : rating === 3 ? "괜찮았어요 🙂" : rating === 2 ? "조금 아쉬워요 😕" : "별로였어요 😞"}
                                </p>
                            </div>

                            {/* Text Input */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">솔직한 후기를 적어주세요</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="경험하신 내용을 최소 10자 이상 공유해주세요. 다른 멤버들에게 큰 도움이 됩니다."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] p-6 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-600 transition-all h-40 resize-none outline-none"
                                />
                                <p className="text-[10px] text-right text-slate-400 font-bold">{text.length}자 (최소 10자)</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!selectedItem && !editReview && !initialItem)}
                        className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {editReview ? "수정 완료" : "리뷰 등록하기"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewWriteModal;
