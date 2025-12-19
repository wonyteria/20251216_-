
import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { User, AnyItem } from '../types';
import * as database from '../services/database';
import { adminUpload } from '../services/storage';

interface CreateContentModalProps {
    onClose: () => void;
    currentUser: User | null;
    onSuccess: () => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
    defaultCategory?: 'crew' | 'networking' | 'lecture' | 'minddate';
}

const CreateContentModal: React.FC<CreateContentModalProps> = ({ onClose, currentUser, onSuccess, showToast, defaultCategory }) => {
    const [category, setCategory] = useState<'crew' | 'networking' | 'lecture' | 'minddate'>(defaultCategory || 'crew');
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [imgPreview, setImgPreview] = useState<string>('');
    const [priceRaw, setPriceRaw] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [loc, setLoc] = useState('[라임스퀘어] 서울특별시 강남구 역삼로5길 5');
    const [isUploading, setIsUploading] = useState(false);

    // Detailed Fields
    const [maxParticipants, setMaxParticipants] = useState<number>(10);
    const [curriculum, setCurriculum] = useState<string[]>(['']);
    const [course, setCourse] = useState<string[]>(['']);
    const [level, setLevel] = useState<'입문' | '중급' | '실전'>('입문');
    const [lectureFormat, setLectureFormat] = useState<'VOD' | '오프라인'>('오프라인');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const url = await adminUpload(file);
                if (url) {
                    setImgPreview(url);
                    showToast("이미지가 업로드되었습니다.", "success");
                }
            } catch (err: any) {
                console.error("Upload error:", err);
                const msg = err.message || "";
                if (msg.includes("404")) {
                    showToast("업로드 실패: 'assets' 버킷이 존재하지 않습니다. Supabase에서 버킷을 생성해주세요.", "error");
                } else if (msg.includes("403")) {
                    showToast("업로드 실패: 권한이 없습니다. Storage 정책을 확인해주세요.", "error");
                } else {
                    showToast(`이미지 업로드 실패: ${err.message || '알 수 없는 오류'}`, "error");
                }
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleListChange = (list: string[], setList: (l: string[]) => void, index: number, value: string) => {
        const newList = [...list];
        newList[index] = value;
        setList(newList);
    };

    const addListItem = (list: string[], setList: (l: string[]) => void) => {
        setList([...list, '']);
    };

    const removeListItem = (list: string[], setList: (l: string[]) => void, index: number) => {
        setList(list.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title || !priceRaw || !selectedDate) { showToast("필수 정보를 입력해주세요.", "error"); return; }

        const baseItem = {
            title,
            desc,
            img: imgPreview || "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
            status: 'open' as const,
            date: `${selectedDate} ${selectedTime}`,
            price: `${Number(priceRaw).toLocaleString()}원`,
            loc,
            author: currentUser?.name || '익명',
            authorId: currentUser?.id,
        };

        let newItem: any = { ...baseItem, categoryType: category };

        if (category === 'crew') {
            newItem = {
                ...newItem,
                type: 'recruit',
                leader: currentUser?.name,
                leaderProfile: currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Host",
                level,
                course: course.filter(c => c.trim() !== '')
            };
        } else if (category === 'networking') {
            newItem = {
                ...newItem,
                type: 'social',
                maxParticipants,
                currentParticipants: 0,
                curriculum: curriculum.filter(c => c.trim() !== '')
            };
        } else if (category === 'lecture') {
            newItem = {
                ...newItem,
                format: lectureFormat,
                teacher: currentUser?.name,
                teacherProfile: currentUser?.avatar,
                curriculum: curriculum.filter(c => c.trim() !== '')
            };
        } else if (category === 'minddate') {
            newItem = {
                ...newItem,
                type: 'dating',
                target: ['2030', '직장인'],
                genderRatio: { male: 50, female: 50 }
            };
        }

        try {
            const created = await database.createItem(newItem);
            if (created) {
                onSuccess();
                showToast("콘텐츠가 성공적으로 등록되었습니다!", "success");
                onClose();
            } else {
                showToast("등록 실패: 데이터 저장 도중 오류가 발생했습니다.", "error");
            }
        } catch (err: any) {
            console.error("Create item error:", err);
            showToast(`등록 실패: ${err.message || '알 수 없는 오류'}`, "error");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">콘텐츠 만들기</h3>
                    <button onClick={onClose}><X size={24} className="text-slate-500" /></button>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-1">카테고리</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700">
                                <option value="crew">임장 크루</option>
                                <option value="networking">네트워킹</option>
                                <option value="lecture">강의</option>
                                <option value="minddate">다이아몬드 (데이트)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-1">제목</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="매력적인 제목을 입력하세요" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                        </div>

                        <div>
                            <div className="border-2 border-dashed p-4 text-center cursor-pointer dark:border-slate-700 rounded-xl min-h-[160px] flex items-center justify-center relative overflow-hidden group" onClick={() => fileInputRef.current?.click()}>
                                {imgPreview ? (
                                    <img src={imgPreview} className="h-40 w-full object-cover rounded" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Plus className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-400">클릭하여 이미지 업로드</span>
                                    </div>
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-indigo-600" />
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-1">설명</label>
                            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="활동 내용, 목표 등을 자세히 적어주세요" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700 h-24" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">가격 (원)</label>
                                <input type="number" value={priceRaw} onChange={(e) => setPriceRaw(e.target.value)} placeholder="0" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">장소</label>
                                <input type="text" value={loc} onChange={(e) => setLoc(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">날짜</label>
                                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">시간</label>
                                <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-4">상세 정보 ({category === 'crew' ? '임장' : category === 'networking' ? '네트워킹' : category === 'lecture' ? '강의' : '다이아몬드'})</h4>

                        {category === 'crew' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">난이도</label>
                                    <div className="flex gap-2">
                                        {['입문', '중급', '실전'].map(l => (
                                            <button key={l} onClick={() => setLevel(l as any)} className={`px-4 py-2 rounded-lg font-bold text-sm border ${level === l ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200'}`}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">임장 코스 (순서대로)</label>
                                    {course.map((c, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs">{i + 1}</span>
                                            <input type="text" value={c} onChange={(e) => handleListChange(course, setCourse, i, e.target.value)} placeholder={`코스 ${i + 1}`} className="flex-1 p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                                            {i > 0 && <button onClick={() => removeListItem(course, setCourse, i)} className="text-red-500"><Trash2 size={18} /></button>}
                                        </div>
                                    ))}
                                    <button onClick={() => addListItem(course, setCourse)} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Plus size={14} /> 코스 추가</button>
                                </div>
                            </div>
                        )}

                        {category === 'networking' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">최대 인원</label>
                                    <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 0)} className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">진행 순서 / 주제</label>
                                    {curriculum.map((c, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <input type="text" value={c} onChange={(e) => handleListChange(curriculum, setCurriculum, i, e.target.value)} placeholder={`주제 ${i + 1}`} className="flex-1 p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                                            {i > 0 && <button onClick={() => removeListItem(curriculum, setCurriculum, i)} className="text-red-500"><Trash2 size={18} /></button>}
                                        </div>
                                    ))}
                                    <button onClick={() => addListItem(curriculum, setCurriculum)} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Plus size={14} /> 주제 추가</button>
                                </div>
                            </div>
                        )}

                        {category === 'lecture' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">강의 형식</label>
                                    <div className="flex gap-2">
                                        {['오프라인', 'VOD'].map(f => (
                                            <button key={f} onClick={() => setLectureFormat(f as any)} className={`px-4 py-2 rounded-lg font-bold text-sm border ${lectureFormat === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200'}`}>
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">커리큘럼</label>
                                    {curriculum.map((c, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <input type="text" value={c} onChange={(e) => handleListChange(curriculum, setCurriculum, i, e.target.value)} placeholder={`Part ${i + 1}`} className="flex-1 p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                                            {i > 0 && <button onClick={() => removeListItem(curriculum, setCurriculum, i)} className="text-red-500"><Trash2 size={18} /></button>}
                                        </div>
                                    ))}
                                    <button onClick={() => addListItem(curriculum, setCurriculum)} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Plus size={14} /> 커리큘럼 추가</button>
                                </div>
                            </div>
                        )}

                    </div>

                    <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-500 transition-colors">등록하기</button>
                </div>
            </div>
        </div>
    );
};

export default CreateContentModal;
