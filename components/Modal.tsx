
import React, { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, User, ChevronRight, Download, Eye, MessageCircle, BarChart2, Heart, AlertCircle, CheckCircle2, Copy, Star, PenTool, Zap, Lock, BookOpen, HelpCircle, Send, FileText, Smartphone, Award, Briefcase } from 'lucide-react';
import { AnyItem, CrewItem, LectureItem, MatchingItem, NetworkingItem } from '../types';

interface ModalProps {
  item: AnyItem | null;
  onClose: () => void;
  isLiked: boolean;
  toggleLike: () => void;
  isApplied: boolean;
  isUnlocked: boolean;
  onApply: (id: number) => void;
  onUnlock: (id: number) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const Modal: React.FC<ModalProps> = ({ 
    item, onClose, 
    isLiked, toggleLike, 
    isApplied, isUnlocked, 
    onApply, onUnlock,
    showToast
}) => {
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [activeTab, setActiveTab] = useState<'details' | 'host' | 'qna'>('details');
  const [question, setQuestion] = useState("");
  const [isSecret, setIsSecret] = useState(false);

  const mockQna = [
      { user: '이**', text: '주차 가능한가요?', reply: '네, 건물 지하주차장 2시간 무료 지원됩니다.', date: '2024.01.10', secret: false },
      { user: '김**', text: '비밀글입니다.', reply: '문의하신 내용 답변 드렸습니다.', date: '2024.01.11', secret: true },
  ];
  const [qnaList, setQnaList] = useState(mockQna);

  if (!item) return null;

  const isEnded = item.status === 'ended' || item.status === 'closed';

  const handleAsk = () => {
      if (!question.trim()) {
          showToast("질문 내용을 입력해주세요.", "error");
          return;
      }
      setQnaList(prev => [{ user: '나', text: question, reply: null, date: '방금 전', secret: isSecret }, ...prev]);
      setQuestion("");
      showToast("문의가 등록되었습니다. 관리자 확인 후 답변드립니다.", "success");
  };

  // --- Host Info Component ---
  const HostSection = () => {
      const isCrew = item.categoryType === 'crew';
      const crewItem = item as CrewItem;
      const lectureItem = item as LectureItem;
      
      const profileImage = isCrew ? crewItem.leaderProfile : 
                           item.categoryType === 'lecture' ? lectureItem.teacherProfile : 
                           "https://api.dicebear.com/7.x/avataaars/svg?seed=Host";
      
      const hostName = isCrew ? crewItem.leader : 
                       item.categoryType === 'lecture' ? lectureItem.teacher : 
                       item.author;

      return (
          <div className="animate-in fade-in slide-in-from-right duration-300">
              <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                      <img src={profileImage || "https://via.placeholder.com/80"} className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm" />
                      <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full border-2 border-white dark:border-slate-900">
                          <Award size={14} />
                      </div>
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl text-slate-900 dark:text-white">{hostName}</h3>
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">HOST</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">믿고 함께하는 검증된 리더</p>
                  </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 mb-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
                          {item.hostDescription || "안녕하세요! 참여자분들과 함께 성장하고 싶은 호스트입니다. 현장에서 얻은 경험과 노하우를 아낌없이 나누겠습니다. 궁금한 점은 언제든 문의해주세요."}
                      </p>
                  </div>
              </div>

              {item.hostIntroImage && (
                  <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                      <img src={item.hostIntroImage} alt="Host Intro" className="w-full h-auto object-cover" />
                  </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center">
                      <Briefcase className="mx-auto mb-2 text-indigo-500" size={24} />
                      <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">12</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">진행한 모임</p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl text-center">
                      <Heart className="mx-auto mb-2 text-pink-500" size={24} />
                      <p className="text-2xl font-black text-pink-700 dark:text-pink-300">4.9</p>
                      <p className="text-xs text-pink-600 dark:text-pink-400 font-bold">평균 만족도</p>
                  </div>
              </div>
          </div>
      );
  };

  // --- Payment Info Component ---
  const PaymentSection = ({ onConfirm }: { onConfirm?: () => void }) => {
      const [wantsCashReceipt, setWantsCashReceipt] = useState(false);
      const [cashReceiptIdentity, setCashReceiptIdentity] = useState("");

      // Hybrid Payment Logic
      const isMindDate = item.categoryType === 'minddate';
      let bankAccountDisplay = "";
      let accountHolder = "";

      if (isMindDate) {
          // MindDate -> Platform Account
          bankAccountDisplay = (item as MatchingItem).bankInfo || "우리은행 1002-123-456789 (주)임풋";
          accountHolder = "(주)임풋";
      } else {
          // Others -> Host Account
          bankAccountDisplay = item.hostBankInfo || "호스트 계좌 정보 없음 (문의 필요)";
          accountHolder = `${item.author} (호스트)`;
      }

      return (
        <div className="animate-in slide-in-from-right duration-300">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-full text-red-600 dark:text-red-400 mt-0.5">
                        <Zap size={16} className="fill-red-600 dark:fill-red-400" />
                    </div>
                    <div>
                        <p className="text-red-600 dark:text-red-400 font-bold text-sm mb-1">입금 순으로 예약이 확정됩니다!</p>
                        <p className="text-red-500 dark:text-red-300 text-xs">인기 모임은 조기 마감될 수 있습니다.<br/>지금 바로 입금하고 자리를 확보하세요.</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                    입금 계좌 안내
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">예금주: {accountHolder}</span>
                </h3>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-600 flex items-center justify-between mb-2 shadow-sm">
                    <span className="text-lg font-bold text-slate-800 dark:text-white tracking-wide break-all">
                        {bankAccountDisplay}
                    </span>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(bankAccountDisplay);
                            showToast("계좌번호가 복사되었습니다.", "success");
                        }}
                        className="text-xs bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-200 font-bold flex items-center gap-1 transition-colors flex-shrink-0 ml-2"
                    >
                        <Copy size={14}/> 복사
                    </button>
                </div>
                {!isMindDate && (
                    <p className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-2 text-right font-bold">
                        * 호스트 직접 결제 상품입니다. 거래 책임은 당사자에게 있습니다.
                    </p>
                )}
            </div>

            {/* Cash Receipt Request */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                        <FileText size={16} className="text-indigo-500"/> {isMindDate ? '현금영수증 신청' : '호스트에게 현금영수증 요청하기'}
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={wantsCashReceipt} onChange={(e) => setWantsCashReceipt(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
                
                {wantsCashReceipt && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">휴대폰 번호 또는 사업자 번호</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={cashReceiptIdentity}
                                onChange={(e) => setCashReceiptIdentity(e.target.value)}
                                placeholder="010-0000-0000"
                                className="w-full pl-9 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                            {isMindDate ? "입금 확인 후 국세청에 자동 발급됩니다." : "호스트에게 발급 요청 메시지가 함께 전송됩니다."}
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-8">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs mb-2 flex items-center gap-1">
                    <AlertCircle size={14}/> 환불 규정
                </h4>
                <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                    <li>모임/강의 시작 3일 전: 100% 환불</li>
                    <li>모임/강의 시작 2일 전 ~ 당일: <span className="text-red-500 dark:text-red-400 font-bold">환불 불가</span></li>
                    <li>양도는 시작 24시간 전까지 가능합니다.</li>
                </ul>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setStep('info')} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    뒤로가기
                </button>
                <button 
                    onClick={() => {
                        if (wantsCashReceipt && !cashReceiptIdentity) {
                            showToast("현금영수증 발급 번호를 입력해주세요.", "error");
                            return;
                        }
                        if (onConfirm) {
                            onConfirm();
                        } else {
                            if (wantsCashReceipt) {
                                showToast(`입금 확인 및 현금영수증 신청이 완료되었습니다.`, "success");
                            } else {
                                showToast("입금 확인 요청이 전송되었습니다!", "success");
                            }
                            onApply(item.id);
                            onClose();
                        }
                    }}
                    className="flex-[2] py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-lg shadow-slate-200 dark:shadow-none transition-colors flex items-center justify-center gap-2"
                >
                    입금 완료했어요 <CheckCircle2 size={18} />
                </button>
            </div>
        </div>
      );
  };

  // --- Q&A Component ---
  const QnaSection = () => (
      <div className="animate-in fade-in duration-300">
          {item.kakaoChatUrl && (
              <div className="mb-6">
                  <button 
                    onClick={() => window.open(item.kakaoChatUrl, '_blank')}
                    className="w-full py-3 bg-[#FEE500] hover:bg-[#FDD835] text-[#3c1e1e] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                      <MessageCircle size={20} className="fill-[#3c1e1e]"/> 호스트와 1:1 카톡 문의하기
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-2">빠른 답변을 원하시면 오픈채팅방을 이용해주세요.</p>
              </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6">
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="궁금한 점을 남겨주세요. 관리자가 빠르게 답변드립니다." 
                className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 mb-3 text-slate-900 dark:text-white placeholder-slate-400"
              />
              <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Lock size={12}/> 비밀글로 쓰기</span>
                  </label>
                  <button onClick={handleAsk} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-1">
                      <Send size={12}/> 등록
                  </button>
              </div>
          </div>
          
          <div className="space-y-4">
              {qnaList.map((q, i) => (
                  <div key={i} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              {q.secret && <Lock size={12} className="text-slate-400"/>} {q.user}
                          </span>
                          <span className="text-xs text-slate-400">{q.date}</span>
                      </div>
                      <p className={`text-sm mb-2 ${q.secret ? 'text-slate-400 italic' : 'text-slate-700 dark:text-slate-300'}`}>
                          {q.secret ? '비밀글입니다.' : q.text}
                      </p>
                      {q.reply && (
                          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-xs ml-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">↳ 관리자 답변</span>
                              <span className="text-slate-600 dark:text-slate-300">{q.reply}</span>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>
  );

  // --- Mind Date Modal ---
  if (item.categoryType === 'minddate') {
      const matchItem = item as MatchingItem;
      const maleRatio = matchItem.genderRatio?.male || 50;
      const femaleRatio = matchItem.genderRatio?.female || 50;
      const totalRatio = maleRatio + femaleRatio;
      const malePct = (maleRatio / totalRatio) * 100;
      const femalePct = (femaleRatio / totalRatio) * 100;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 no-scrollbar">
                <div className="h-72 relative">
                    <img src={item.img} className="w-full h-full object-cover" />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 backdrop-blur-md transition-all">
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
                </div>

                <div className="px-6 pb-8 relative -mt-12">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white dark:border-slate-700 shadow-lg rounded-2xl p-4 mb-6">
                        <div className="flex gap-2 mb-2">
                             <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-bold px-2 py-0.5 rounded-full">{matchItem.type === 'dating' ? '소개팅' : '친구'}</span>
                             <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{item.loc}</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight mb-2">{item.title}</h2>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <Calendar size={14} /> {item.date}
                        </div>
                    </div>

                    {step === 'info' ? (
                        <>
                            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
                                <button onClick={() => setActiveTab('details')} className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'details' ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400' : 'text-slate-400'}`}>상세정보</button>
                                <button onClick={() => setActiveTab('host')} className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'host' ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400' : 'text-slate-400'}`}>호스트 소개</button>
                                <button onClick={() => setActiveTab('qna')} className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'qna' ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400' : 'text-slate-400'}`}>문의하기</button>
                            </div>

                            {activeTab === 'details' ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">어떤 만남인가요?</h3>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">{item.desc}</p>
                                    </div>
                                    {!isEnded && (
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3 flex items-center justify-between">
                                                <span>실시간 신청 현황</span>
                                                <span className="text-xs font-normal text-slate-400">마감 임박!</span>
                                            </h3>
                                            <div className="flex items-center gap-3 mb-2 text-sm font-bold">
                                                <span className="text-blue-500 dark:text-blue-400 flex items-center gap-1"><User size={14}/> 남 {maleRatio}명</span>
                                                <span className="text-pink-500 dark:text-pink-400 flex items-center gap-1"><User size={14}/> 여 {femaleRatio}명</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                                <div style={{width: `${malePct}%`}} className="h-full bg-blue-400"></div>
                                                <div style={{width: `${femalePct}%`}} className="h-full bg-pink-400"></div>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3">이런 분을 찾아요</h3>
                                        <ul className="space-y-2">
                                            {matchItem.target?.map((t, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                    <CheckCircle2 size={16} className="text-pink-500 dark:text-pink-400 flex-shrink-0" /> {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : activeTab === 'host' ? (
                                <HostSection />
                            ) : (
                                <QnaSection />
                            )}

                            {activeTab === 'details' && (
                                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-slate-400 text-sm">참가비</span>
                                        <span className="text-2xl font-black text-pink-600 dark:text-pink-400">{item.price}</span>
                                    </div>
                                    <button 
                                        onClick={() => isApplied ? showToast("이미 신청하셨습니다!", "info") : setStep('payment')}
                                        disabled={isEnded || isApplied}
                                        className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all active:scale-95 ${isEnded || isApplied ? 'bg-slate-300 dark:bg-slate-700' : 'bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-400 hover:to-orange-300'}`}
                                    >
                                        {isEnded ? '신청 마감' : isApplied ? '신청 완료' : '설레는 만남 신청하기'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <PaymentSection onConfirm={() => {
                            showToast("입금 확인 요청이 전송되었습니다!", "success");
                            onApply(item.id);
                            onClose();
                        }} />
                    )}
                </div>
            </div>
        </div>
      );
  }

  // --- Layout 2: Other Categories ---
  const isReport = item.categoryType === 'crew' && item.type === 'report';
  const crewItem = item as CrewItem;
  const netItem = item as NetworkingItem;
  
  let themeColor = "slate";
  let buttonClass = "bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600";
  let bgBadge = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200";
  
  if (item.categoryType === 'crew') {
      themeColor = "emerald";
      buttonClass = "bg-emerald-600 hover:bg-emerald-500";
      bgBadge = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  } else if (item.categoryType === 'networking') {
      themeColor = "amber";
      buttonClass = "bg-amber-500 hover:bg-amber-400";
      bgBadge = "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
  } else if (item.categoryType === 'lecture') {
      themeColor = "indigo";
      buttonClass = "bg-indigo-600 hover:bg-indigo-500";
      bgBadge = "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
  }

  const isFree = item.price === '무료' || !item.price;
  const isLocked = isReport && !isFree && !isUnlocked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 no-scrollbar">
        
        <div className={`relative ${isReport ? 'h-40' : 'h-64'}`}>
          <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-md p-2 rounded-full text-white transition-all"><X size={20} /></button>
          {isReport && (
               <div className="absolute bottom-4 left-6 text-white">
                   <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm mb-2 inline-block">PREMIUM REPORT</span>
                   <h2 className="text-2xl font-bold leading-tight">{item.title}</h2>
               </div>
          )}
        </div>

        {isReport ? (
             <div className="p-6 md:p-8">
                 <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                      <img src={crewItem.leaderProfile || "https://via.placeholder.com/60"} className="w-14 h-14 rounded-full border-2 border-slate-100 dark:border-slate-700 object-cover" />
                      <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5">Report by</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{crewItem.leader}</p>
                          <p className="text-xs text-slate-400">부동산 실전 전문가의 날카로운 인사이트</p>
                      </div>
                 </div>

                 {step === 'info' ? (
                     <div className="relative min-h-[400px]">
                        <div className={`prose prose-slate dark:prose-invert max-w-none ${isLocked ? 'blur-sm select-none opacity-50 overflow-hidden h-[300px]' : ''}`}>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2"><MapPin size={16} className="text-emerald-500"/> 다녀온 모임</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{crewItem.relatedRecruitTitle}</p>
                            </div>
                            <p className="text-lg leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">{crewItem.reportContent}</p>
                            {crewItem.gallery && (
                                <div className="grid grid-cols-2 gap-4 my-6">
                                    {crewItem.gallery.map((g, i) => (<img key={i} src={g} className="rounded-xl w-full h-40 object-cover shadow-sm" />))}
                                </div>
                            )}
                        </div>
                        
                        {isLocked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center max-w-sm mx-4">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-300"><Lock size={32} /></div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">전체 리포트 잠금해제</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">현장의 생생함과 전문가의 분석이 담긴<br/>프리미엄 리포트를 확인해보세요.</p>
                                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl mb-6 flex justify-between items-center">
                                        <span className="text-slate-500 dark:text-slate-300 text-sm font-medium">구매 가격</span>
                                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{item.price}</span>
                                    </div>
                                    <button onClick={() => setStep('payment')} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2"><BookOpen size={18} /> 지금 바로 읽기</button>
                                </div>
                            </div>
                        )}
                     </div>
                 ) : (
                     <PaymentSection onConfirm={() => {
                         showToast("리포트가 잠금 해제되었습니다.", "success");
                         onUnlock(item.id);
                         setStep('info');
                     }} />
                 )}
             </div>
        ) : (
             <div className="px-8 pb-8 -mt-10 relative">
                  <div className="mb-6">
                     <div className="flex gap-2 mb-3">
                        <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-2 py-1 rounded">{item.categoryType === 'networking' ? '네트워킹' : item.categoryType.toUpperCase()}</span>
                        {item.categoryType === 'crew' && <span className={`${bgBadge} text-xs font-bold px-2 py-1 rounded`}>{crewItem.level || ''}</span>}
                        {item.categoryType === 'networking' && <span className={`${bgBadge} text-xs font-bold px-2 py-1 rounded`}>{netItem.type === 'study' ? '스터디' : '친목'}</span>}
                        {item.categoryType === 'lecture' && <span className={`${bgBadge} text-xs font-bold px-2 py-1 rounded`}>{(item as LectureItem).format}</span>}
                     </div>
                     <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-3">{item.title}</h2>
                     <p className="text-slate-600 dark:text-slate-300">{item.desc}</p>
                  </div>

                  {step === 'info' ? (
                      <>
                        <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
                            <button onClick={() => setActiveTab('details')} className={`pb-3 flex-1 text-sm font-bold transition-colors ${activeTab === 'details' ? `text-${themeColor}-600 dark:text-${themeColor}-400 border-b-2 border-${themeColor}-600 dark:border-${themeColor}-400` : 'text-slate-400'}`}>상세정보</button>
                            <button onClick={() => setActiveTab('host')} className={`pb-3 flex-1 text-sm font-bold transition-colors ${activeTab === 'host' ? `text-${themeColor}-600 dark:text-${themeColor}-400 border-b-2 border-${themeColor}-600 dark:border-${themeColor}-400` : 'text-slate-400'}`}>호스트 소개</button>
                            <button onClick={() => setActiveTab('qna')} className={`pb-3 flex-1 text-sm font-bold transition-colors ${activeTab === 'qna' ? `text-${themeColor}-600 dark:text-${themeColor}-400 border-b-2 border-${themeColor}-600 dark:border-${themeColor}-400` : 'text-slate-400'}`}>문의하기</button>
                        </div>

                        {activeTab === 'details' ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700"><p className="text-xs text-slate-400 mb-1">날짜</p><p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.date || '상시'}</p></div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700"><p className="text-xs text-slate-400 mb-1">장소</p><p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{item.loc || '온라인'}</p></div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700"><p className="text-xs text-slate-400 mb-1">{item.categoryType === 'lecture' ? '강사' : '인원'}</p><p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{item.categoryType === 'networking' ? `${netItem.currentParticipants || 0}/${netItem.maxParticipants || 0}명` : item.categoryType === 'lecture' ? item.author : '선착순'}</p></div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700"><p className="text-xs text-slate-400 mb-1">비용</p><p className={`font-bold text-sm text-${themeColor}-600 dark:text-${themeColor}-400`}>{item.price}</p></div>
                                </div>
                                
                                {item.categoryType === 'crew' && crewItem.leaderProfile && (
                                    <div className="flex items-center gap-4 bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 mb-8">
                                        <img src={crewItem.leaderProfile} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm" />
                                        <div><p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">CREW LEADER</p><p className="font-bold text-lg text-slate-900 dark:text-white">{crewItem.leader}</p><p className="text-sm text-slate-500 dark:text-slate-400">믿고 따르는 실전 전문가와 함께하세요.</p></div>
                                    </div>
                                )}

                                <div className="space-y-8">
                                    {((item as any).course || (item as any).curriculum) && (
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">{item.categoryType === 'crew' ? '임장 코스' : '커리큘럼/상세일정'}</h3>
                                            <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
                                                {((item as any).course || (item as any).curriculum).map((c: string, i: number) => (
                                                    <div key={i} className="relative">
                                                        <div className={`absolute -left-[29px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-${themeColor}-500`}></div>
                                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Step {i+1}</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 inline-block px-3 py-1.5 rounded-lg">{c}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : activeTab === 'host' ? (
                            <HostSection />
                        ) : (
                            <QnaSection />
                        )}

                        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex gap-4 text-slate-400 text-sm">
                                <span className="flex items-center gap-1"><Eye size={16}/> {item.views.toLocaleString()}</span>
                            </div>
                            
                            <button
                                disabled={isEnded || isApplied}
                                onClick={() => isApplied ? showToast("이미 신청하셨습니다!", "info") : setStep('payment')}
                                className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 ${isEnded || isApplied ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' : buttonClass}`}
                            >
                                {isEnded ? '마감되었습니다' : isApplied ? '신청완료' : '신청하기'}
                            </button>
                        </div>
                      </>
                  ) : (
                    <PaymentSection onConfirm={() => {
                        showToast("입금 확인 요청이 전송되었습니다!", "success");
                        onApply(item.id);
                        onClose();
                    }} />
                  )}
             </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
