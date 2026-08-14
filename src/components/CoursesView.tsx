import React from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, ExternalLink, Star, Sparkles, Award } from 'lucide-react';

export const CoursesView: React.FC = () => {
  const { courses, profile } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <GraduationCap className="w-4 h-4" /> Recommended Course Index
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Curated Courses for <span className="text-indigo-600">{profile.careerGoal}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Targeted courses selected specifically to eliminate missing skill gaps for your career path.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {course.provider}
                </span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {course.rating || 4.8} / 5.0
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900">{course.courseName}</h3>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Covers Skill:</span>
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                  {course.skillCovered}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">Why Recommended:</span> {course.whyRecommended}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">{course.estimatedDuration} • {course.difficulty}</span>
              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-1"
              >
                Start Course <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
