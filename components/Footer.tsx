
import React from 'react';
import { Youtube, Instagram, MessageCircle, BookOpen, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const snsLinks = [
    { name: 'Youtube', icon: Youtube, url: 'https://youtube.com', color: 'hover:text-red-500' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com', color: 'hover:text-pink-500' },
    { name: 'Blog', icon: BookOpen, url: 'https://blog.naver.com', color: 'hover:text-green-500' },
    { name: 'Kakao', icon: MessageCircle, url: 'https://kakao.com', color: 'hover:text-yellow-400' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & SNS */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-extrabold text-sm">임</span>
            </div>
            <span className="font-extrabold text-xl text-white">임풋 (Imput)</span>
          </div>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">
            함께 부자가 되는 오프라인 커뮤니티.<br/>
            임장, 스터디, 그리고 가치관이 맞는 소중한 인연까지.<br/>
            임풋에서 당신의 성장을 시작하세요.
          </p>
          <div className="flex gap-4">
            {snsLinks.map((sns) => (
              <a 
                key={sns.name} 
                href={sns.url} 
                target="_blank" 
                rel="noreferrer"
                className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center transition-all duration-300 hover:bg-slate-700 hover:scale-110 ${sns.color}`}
              >
                <sns.icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-bold text-white mb-4">바로가기</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="#/" className="hover:text-white transition-colors">홈 화면</a></li>
            <li><a href="#/crew" className="hover:text-white transition-colors">임장 크루</a></li>
            <li><a href="#/minddate" className="hover:text-white transition-colors">마인드데이트</a></li>
            <li><a href="#/lecture" className="hover:text-white transition-colors">재테크 강의</a></li>
          </ul>
        </div>

        {/* CS Center */}
        <div>
          <h4 className="font-bold text-white mb-4">고객센터</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li className="flex items-center gap-2"><MessageCircle size={16}/> 카카오톡 @임풋</li>
            <li className="flex items-center gap-2"><Mail size={16}/> help@imfoot.com</li>
            <li className="mt-2 text-xs opacity-60">
              운영시간: 평일 10:00 - 18:00<br/>
              (점심시간 13:00 - 14:00)
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-12 pt-8 border-t border-slate-800 text-xs text-slate-600 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2024 Imput Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <button className="hover:text-slate-400">이용약관</button>
          <button className="hover:text-slate-400 font-bold">개인정보처리방침</button>
          <button className="hover:text-slate-400">사업자정보확인</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
