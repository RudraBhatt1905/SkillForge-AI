import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileCode,
  ShieldCheck,
} from 'lucide-react';

export const ResumeInsightsView: React.FC = () => {
  const { resumeInsights, profile, handleResumeUpload, isAnalyzing } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processTextUpload = async (text: string, fileName = 'uploaded_resume.txt', fileObj?: File) => {
    if (!text.trim()) return;
    setUploading(true);
    try {
      await handleResumeUpload(fileName, text, fileObj);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const text = await file.text();
      await processTextUpload(text, file.name, file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const text = await file.text();
      await processTextUpload(text, file.name, file);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> AI Resume Optimizer & ATS Analyzer
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Resume Analysis for <span className="text-indigo-600">{profile.careerGoal}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload your resume or paste text to receive instant ATS keyword checks, impact bullet improvements, and formatting suggestions.
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3 shrink-0">
          <div className="text-center px-2">
            <span className="text-2xl font-black text-indigo-600">{resumeInsights.healthScore}/100</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase">ATS Health Score</p>
          </div>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">Upload or Paste Resume</h3>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-800">Drag & drop your resume file (.txt, .md, .pdf text)</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-3">or browse from your local computer</p>

          <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5">
            <FileCode className="w-4 h-4" /> Browse File
            <input type="file" accept=".txt,.pdf,.doc,.docx,.md" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {/* Quick Paste Text Option */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-slate-700">Or Paste Raw Resume Text Directly:</p>
          <textarea
            rows={3}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Paste your resume summary, work experience, or bullet points here..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
          />
          <button
            disabled={!pasteText.trim() || uploading || isAnalyzing}
            onClick={() => processTextUpload(pasteText, 'pasted_resume.txt')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            {uploading || isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-indigo-400" /> Analyzing with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-400" /> Analyze Resume Text
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Strengths & ATS Missing Keywords</h3>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Resume Strengths ({resumeInsights.strengths.length})
              </p>
              <div className="space-y-1.5">
                {resumeInsights.strengths.map((str, idx) => (
                  <div key={idx} className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-950 font-medium">
                    ✓ {str}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Missing ATS Keywords for {profile.careerGoal}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {resumeInsights.missingKeywords.map((kw, idx) => (
                  <span key={idx} className="bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Improved Bullet Points */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">AI Rewritten Impact Bullet Points</h3>

          <div className="space-y-3">
            {resumeInsights.improvedBulletPoints.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Original Bullet:</p>
                  <p className="text-slate-600 line-through mt-0.5">{item.original}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Improved Impact Bullet:
                  </p>
                  <p className="text-slate-900 font-bold mt-0.5 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                    {item.improved}
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 italic">Reason: {item.impactReason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
