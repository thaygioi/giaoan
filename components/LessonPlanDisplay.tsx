import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { marked } from 'marked';
import type { GeneratedLessonPlan, LessonPlanInput, GeneratedLessonPlan5512, Activity2345 } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';


declare const htmlDocx: any;
declare const saveAs: any;
declare const katex: any;

interface LessonPlanDisplayProps {
  plan: GeneratedLessonPlan;
  basicInfo: LessonPlanInput;
  isLoading: boolean;
}

const MarkdownRenderer: React.FC<{ content: string | undefined, className?: string }> = ({ content, className = '' }) => {
    if (!content) return null;
    return (
        <div className={className}>
            <ReactMarkdown
                components={{ p: React.Fragment, strong: ({node, ...props}) => <strong className="font-bold" {...props} /> }}
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

// --- Start: CV 5512 specific components ---
const getActivityTitle5512 = (key: string) => {
    const activityNumber = parseInt(key.replace('hoatDong', ''), 10);
    switch (activityNumber) {
        case 1: return "Hoạt động 1: Mở đầu (Xác định vấn đề/nhiệm vụ học tập)";
        case 2: return "Hoạt động 2: Hình thành kiến thức mới";
        case 3: return "Hoạt động 3: Luyện tập";
        case 4: return "Hoạt động 4: Vận dụng";
        default: return `Hoạt động ${activityNumber}`;
    }
};

const ActivitySection5512: React.FC<{ title: string; activity: GeneratedLessonPlan5512['tienTrinh'][string] }> = ({ title, activity }) => {
    if (!activity) return null;
    return (
        <div className="mt-6 break-inside-avoid">
            <h4 className="text-lg font-bold text-slate-200 border-b-2 border-indigo-500/20 pb-2 mb-3">{title}</h4>
            <div className="space-y-3 pl-4 text-sm text-slate-300">
                {activity.mucTieu && <div><strong>a) Mục tiêu:</strong> <MarkdownRenderer content={activity.mucTieu} /></div>}
                {activity.noiDung && <div><strong>b) Nội dung:</strong> <MarkdownRenderer content={activity.noiDung} className="prose prose-sm prose-invert max-w-none"/></div>}
                {activity.sanPham && <div><strong>c) Sản phẩm:</strong> <MarkdownRenderer content={activity.sanPham} className="prose prose-sm prose-invert max-w-none"/></div>}
                {activity.toChuc && <p className="font-semibold mt-2">d) Tổ chức thực hiện:</p>}
                
                {activity.toChuc && <div className="border border-slate-700 rounded-lg overflow-hidden mt-2 shadow-sm ring-1 ring-white/10">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-slate-700/50 text-left">
                            <tr>
                                <th className="p-3 font-semibold text-slate-300 w-1/2 border-b border-slate-600">HOẠT ĐỘNG CỦA GV VÀ HS</th>
                                <th className="p-3 font-semibold text-slate-300 w-1/2 border-b border-slate-600">SẢN PHẨM DỰ KIẾN</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            <tr className="align-top">
                                <td className="p-3 border-r border-slate-700">
                                    <MarkdownRenderer content={activity.toChuc.noiDung} className="prose prose-sm prose-invert max-w-none" />
                                </td>
                                <td className="p-3">
                                     <MarkdownRenderer content={activity.toChuc.sanPham} className="prose prose-sm prose-invert max-w-none"/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>}
            </div>
        </div>
    );
};
// --- End: CV 5512 specific components ---

export const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ plan, basicInfo, isLoading }) => {
    const [copied, setCopied] = useState(false);
    
    const displayDuration = plan.duration || (basicInfo.duration.periods ? `${basicInfo.duration.periods} tiết` : '(AI đề xuất)');
    const displaySubject = plan.subject || basicInfo.subject;
    const displayGrade = plan.grade || basicInfo.grade;

    const mdToHtml = (md: string | undefined) => {
        if (!md) return '';
        let processedMd = md;
        
        if (typeof katex !== 'undefined') {
            processedMd = processedMd.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
                try {
                    return katex.renderToString(formula, { displayMode: true, throwOnError: false });
                } catch (e) { return match; }
            });
            processedMd = processedMd.replace(/(?<!\$)\$([^\$\n]+?)\$(?!\$)/g, (match, formula) => {
                 try {
                    return katex.renderToString(formula, { displayMode: false, throwOnError: false });
                } catch (e) { return match; }
            });
        }
        return marked.parse(processedMd, { breaks: true, gfm: true });
    };

    const generatePlainText = useCallback(() => {
        const lessonTitle = plan.lessonTitle || basicInfo.lessonTitle || '(Chưa có tên)';
        let sections: string[] = [];

        if (plan.congVan === '2345') {
            const formatActivity = (activity: Activity2345) => 
                `HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:\n${activity.hoatDong || ''}\n\nYÊU CẦU CẦN ĐẠT:\n${activity.yeuCau || ''}\n\nĐIỀU CHỈNH:\n${activity.dieuChinh || ''}`;
            
            sections = [
                `KẾ HOẠCH BÀI DẠY (GIÁO ÁN - CÔNG VĂN 2345)`,
                `Môn học/Hoạt động giáo dục: ${displaySubject}`,
                `Lớp: ${displayGrade}`,
                `Tên bài dạy: ${lessonTitle}`,
                `Thời gian thực hiện: ${displayDuration}\n`,
                `I. YÊU CẦU CẦN ĐẠT\n${plan.yeuCauCanDat || ''}\n`,
                `II. ĐỒ DÙNG DẠY HỌC\n${plan.doDungDayHoc || ''}\n`,
                `III. CÁC HOẠT ĐỘNG DẠY HỌC\n` + plan.hoatDongDayHoc.map(formatActivity).join('\n\n---\n\n'),
                plan.dieuChinhSauBaiDay ? `\nIV. ĐIỀU CHỈNH SAU BÀI DẠY\n${plan.dieuChinhSauBaiDay}` : ''
            ];
        } else { // 5512
            const formatActivity = (title: string, activity: GeneratedLessonPlan5512['tienTrinh'][string]) => [
                title,
                `a) Mục tiêu: ${activity?.mucTieu || ''}`,
                `b) Nội dung: ${activity?.noiDung || ''}`,
                `c) Sản phẩm: ${activity?.sanPham || ''}`,
                `d) Tổ chức thực hiện:`,
                `  - HOẠT ĐỘNG CỦA GV VÀ HS: ${activity?.toChuc?.noiDung || ''}`,
                `  - SẢN PHẨM DỰ KIẾN: ${activity?.toChuc?.sanPham || ''}`,
            ].join('\n');
            
            const activityKeys = plan.tienTrinh ? Object.keys(plan.tienTrinh).sort((a, b) => parseInt(a.replace('hoatDong', '')) - parseInt(b.replace('hoatDong', ''))) : [];
            const activityText = activityKeys.map((key) => formatActivity(getActivityTitle5512(key), plan.tienTrinh?.[key])).join('\n\n');

            sections = [
                `KẾ HOẠCH BÀI DẠY (GIÁO ÁN - CÔNG VĂN 5512)`,
                `Môn học/Hoạt động giáo dục: ${displaySubject}`,
                `Lớp: ${displayGrade}`,
                `Tên bài dạy: ${lessonTitle}`,
                `Thời gian thực hiện: ${displayDuration}`,
                `Giáo viên: ${basicInfo.teacherName}\n`,
                `I. MỤC TIÊU`,
                `1. Về kiến thức: ${plan.mucTieu?.kienThuc || ''}`,
                `2. Về năng lực: ${plan.mucTieu?.nangLuc || ''}`,
                `3. Về phẩm chất: ${plan.mucTieu?.phamChat || ''}\n`,
                `II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU`,
                `${plan.thietBi || ''}\n`,
                `III. TIẾN TRÌNH DẠY HỌC`,
                activityText,
            ];
        }
        return sections.join('\n');
    }, [plan, basicInfo, displayDuration, displaySubject, displayGrade]);


    const handleCopy = () => {
        const textToCopy = generatePlainText();
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const generateHtmlForDoc = useCallback(() => {
        const styles = `
          body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; }
          h3, h4 { font-weight: bold; font-family: 'Times New Roman', Times, serif; }
          h3 { font-size: 14pt; margin-top: 20px; }
          h4 { font-size: 13pt; margin-top: 15px; }
          p, div { margin-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; page-break-inside: avoid; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; }
          th { background-color: #f2f2f2; font-weight: bold; }
          ul, ol { padding-left: 40px; margin: 0; }
          pre, code { font-family: 'Times New Roman', Times, serif; }
          .katex { font-size: 1em !important; }
        `;
        
        const lessonTitle = plan.lessonTitle || basicInfo.lessonTitle || 'Untitled';
        let mainContent = '';

        if (plan.congVan === '2345') {
             const activitiesHtml = plan.hoatDongDayHoc.map(act => `
                <tr style="page-break-inside: avoid;">
                    <td>${mdToHtml(act.hoatDong)}</td>
                    <td>${mdToHtml(act.yeuCau)}</td>
                    <td>${mdToHtml(act.dieuChinh)}</td>
                </tr>
            `).join('');

            mainContent = `
                <h3>I. YÊU CẦU CẦN ĐẠT</h3>
                <div>${mdToHtml(plan.yeuCauCanDat)}</div>
                <h3>II. ĐỒ DÙNG DẠY HỌC</h3>
                <div>${mdToHtml(plan.doDungDayHoc)}</div>
                <h3>III. CÁC HOẠT ĐỘNG DẠY HỌC</h3>
                <table>
                    <thead><tr><th>Hoạt động dạy học chủ yếu</th><th>Yêu cầu cần đạt</th><th>Điều chỉnh</th></tr></thead>
                    <tbody>${activitiesHtml}</tbody>
                </table>
                ${plan.dieuChinhSauBaiDay ? `<h3>IV. ĐIỀU CHỈNH SAU BÀI DẠY</h3><div>${mdToHtml(plan.dieuChinhSauBaiDay)}</div>` : ''}
            `;
        } else { // 5512
            const formatActivityHtml = (title: string, activity: any) => activity ? `
                <h4>${title}</h4>
                <div><strong>a) Mục tiêu:</strong> ${mdToHtml(activity.mucTieu)}</div>
                <div><strong>b) Nội dung:</strong> ${mdToHtml(activity.noiDung)}</div>
                <div><strong>c) Sản phẩm:</strong> ${mdToHtml(activity.sanPham)}</div>
                <p><strong>d) Tổ chức thực hiện:</strong></p>
                <table>
                    <thead><tr><th>HOẠT ĐỘNG CỦA GV VÀ HS</th><th>SẢN PHẨM DỰ KIẾN</th></tr></thead>
                    <tbody><tr><td>${mdToHtml(activity.toChuc?.noiDung)}</td><td>${mdToHtml(activity.toChuc?.sanPham)}</td></tr></tbody>
                </table>
            ` : '';
            
            const activityKeys = plan.tienTrinh ? Object.keys(plan.tienTrinh).sort((a, b) => parseInt(a.replace('hoatDong', '')) - parseInt(b.replace('hoatDong', ''))) : [];
            const activitiesHtml = activityKeys.map((key) => formatActivityHtml(getActivityTitle5512(key), plan.tienTrinh?.[key])).join('');
            
            mainContent = `
                <h3>I. MỤC TIÊU</h3>
                <div><strong>1. Về kiến thức:</strong> ${mdToHtml(plan.mucTieu?.kienThuc)}</div>
                <div><strong>2. Về năng lực:</strong> ${mdToHtml(plan.mucTieu?.nangLuc)}</div>
                <div><strong>3. Về phẩm chất:</strong> ${mdToHtml(plan.mucTieu?.phamChat)}</div>
                <h3>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
                <div>${mdToHtml(plan.thietBi)}</div>
                <h3>III. TIẾN TRÌNH DẠY HỌC</h3>
                ${activitiesHtml}
            `;
        }

        return `
            <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${`GiaoAn_${lessonTitle}`}</title><style>${styles}</style></head>
            <body>
                <div style="text-align: center;">
                    <h3>KẾ HOẠCH BÀI DẠY</h3>
                    <p><strong>Môn học:</strong> ${displaySubject} - <strong>Lớp:</strong> ${displayGrade}</p>
                    <p><strong>Tên bài dạy:</strong> ${lessonTitle}</p>
                    <p><strong>Thời gian thực hiện:</strong> ${displayDuration}</p>
                </div>
                ${mainContent}
            </body></html>
        `;
    }, [plan, basicInfo, displayDuration, displaySubject, displayGrade]);

    const handleDownload = () => {
        if (typeof htmlDocx === 'undefined' || typeof saveAs === 'undefined') {
            alert("Chức năng tải về chưa sẵn sàng, vui lòng thử lại sau giây lát.");
            return;
        }
        const htmlContent = generateHtmlForDoc();
        const lessonTitle = plan.lessonTitle || basicInfo.lessonTitle || 'Untitled';
        const fileName = `GiaoAn_${lessonTitle.replace(/ /g, '_')}.doc`;
        saveAs(htmlDocx.asBlob(htmlContent), fileName);
    };

    if (!plan) return null;

    return (
        <article className="prose prose-invert max-w-none relative text-slate-300">
            <div className="absolute top-0 right-0 flex items-center -mt-2 space-x-1">
                <button onClick={handleDownload} disabled={isLoading} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 rounded-full transition-colors disabled:text-slate-600 disabled:cursor-not-allowed" title="Tải về file .doc"><DownloadIcon className="w-5 h-5" /></button>
                <button onClick={handleCopy} disabled={isLoading} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 rounded-full transition-colors disabled:text-slate-600 disabled:cursor-not-allowed" title="Sao chép toàn bộ">{copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}</button>
            </div>
            
            <div className="text-center mb-8 not-prose">
                <h3 className="text-xl font-bold uppercase text-slate-100">KẾ HOẠCH BÀI DẠY</h3>
                <p className="font-semibold text-slate-300">Môn học: {displaySubject} - Lớp: {displayGrade}</p>
                <p className="text-lg font-bold mt-2 text-indigo-400">Bài: {plan.lessonTitle || basicInfo.lessonTitle}</p>
                <p className="text-sm text-slate-400">Thời gian thực hiện: {displayDuration}</p>
            </div>

            {plan.congVan === '2345' ? (
                <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                    <h3 className="text-xl font-bold text-slate-100 mt-6 border-b border-slate-700 pb-2">I. YÊU CẦU CẦN ĐẠT</h3>
                    <MarkdownRenderer content={plan.yeuCauCanDat} className="prose prose-sm prose-invert max-w-none" />
                    
                    <h3 className="text-xl font-bold text-slate-100 mt-6 border-b border-slate-700 pb-2">II. ĐỒ DÙNG DẠY HỌC</h3>
                    <MarkdownRenderer content={plan.doDungDayHoc} className="prose prose-sm prose-invert max-w-none" />
                    
                    <h3 className="text-xl font-bold text-slate-100 mt-6 border-b border-slate-700 pb-2">III. CÁC HOẠT ĐỘNG DẠY HỌC</h3>
                    <div className="not-prose mt-4 ring-1 ring-slate-700 rounded-lg overflow-hidden">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-slate-700/50 text-left">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-200 w-5/12 border-b border-slate-600">Hoạt động dạy học chủ yếu</th>
                                    <th className="p-3 font-semibold text-slate-200 w-5/12 border-b border-slate-600">Yêu cầu cần đạt</th>
                                    <th className="p-3 font-semibold text-slate-200 w-2/12 border-b border-slate-600">Điều chỉnh</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800/20">
                                {plan.hoatDongDayHoc.map((act, index) => (
                                    <tr key={index} className="align-top border-t border-slate-700">
                                        <td className="p-3"><MarkdownRenderer content={act.hoatDong} className="prose prose-sm prose-invert max-w-none" /></td>
                                        <td className="p-3"><MarkdownRenderer content={act.yeuCau} className="prose prose-sm prose-invert max-w-none" /></td>
                                        <td className="p-3"><MarkdownRenderer content={act.dieuChinh} className="prose prose-sm prose-invert max-w-none" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     {plan.dieuChinhSauBaiDay && <>
                        <h3 className="text-xl font-bold text-slate-100 mt-6 border-b border-slate-700 pb-2">IV. ĐIỀU CHỈNH SAU BÀI DẠY (nếu có)</h3>
                        <MarkdownRenderer content={plan.dieuChinhSauBaiDay} className="prose prose-sm prose-invert max-w-none" />
                    </>}
                </div>
            ) : ( // 5512 layout
                <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                    {plan.mucTieu && <>
                        <h3 className="text-xl font-bold text-slate-100 mt-6 border-b border-slate-700 pb-2">I. MỤC TIÊU</h3>
                        <div><strong>1. Về kiến thức:</strong> <MarkdownRenderer content={plan.mucTieu.kienThuc} /></div>
                        <div><strong>2. Về năng lực:</strong> <MarkdownRenderer content={plan.mucTieu.nangLuc} /></div>
                        <div><strong>3. Về phẩm chất:</strong> <MarkdownRenderer content={plan.mucTieu.phamChat} /></div>
                    </>}
                    
                    {plan.thietBi && <>
                        <h3 className="text-xl font-bold text-slate-100 mt-6 border-b border-slate-700 pb-2">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
                        <div className="prose prose-sm prose-invert max-w-none"><MarkdownRenderer content={plan.thietBi} /></div>
                    </>}
                    
                    {plan.tienTrinh && <>
                        <h3 className="text-xl font-bold text-slate-100 mt-6 border-b border-slate-700 pb-2">III. TIẾN TRÌNH DẠY HỌC</h3>
                        {Object.keys(plan.tienTrinh).sort((a, b) => parseInt(a.replace('hoatDong', '')) - parseInt(b.replace('hoatDong', ''))).map((key) => (
                            <ActivitySection5512
                                key={key} 
                                title={getActivityTitle5512(key)} 
                                activity={plan.tienTrinh?.[key]} 
                            />
                        ))}
                    </>}
                </div>
            )}
        </article>
    );
};