import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, ExternalLink, ShieldCheck } from 'lucide-react';

export const CertificationsView: React.FC = () => {
  const { certifications, profile } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Award className="w-4 h-4" /> Professional Certifications
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Industry Certifications for <span className="text-indigo-600">{profile.careerGoal}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          High-value industry certifications that validate skills to employers and enhance resume credibility.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map(cert => (
          <div
            key={cert.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {cert.provider}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {cert.level}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900">{cert.title}</h3>

              <p className="text-xs text-slate-600 leading-relaxed">{cert.relevanceReason}</p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs font-extrabold text-slate-700">Cost: {cert.estimatedCost}</span>
              <a
                href={cert.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
              >
                View Exam Details <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
