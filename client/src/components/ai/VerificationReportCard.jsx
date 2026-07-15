import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export default function VerificationReportCard({ verificationReport, onTriggerVerify, verifying }) {
  const [expandedPara, setExpandedPara] = useState(null);

  if (!verificationReport && !verifying) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Fact Verification & Claim Audit</h4>
            <p className="text-xs text-slate-400">Verify statistics, numbers, and statements against vector ground-truth</p>
          </div>
        </div>
        <button
          onClick={onTriggerVerify}
          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition shadow"
        >
          Verify Draft
        </button>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 animate-pulse flex items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin shrink-0" />
        <div className="text-xs font-medium text-slate-300">
          Running 7-stage Verification Engine: extracting claims, cross-referencing vector anchors, and detecting contradictions...
        </div>
      </div>
    );
  }

  const { overallConfidence = 95, verifiedClaimsCount = 0, unverifiedCount = 0, contradictedCount = 0, paragraphAudits = [] } = verificationReport;

  const getStatusColor = (status) => {
    if (status === 'VERIFIED') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (status === 'CONTRADICTED') return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  const getStatusIcon = (status) => {
    if (status === 'VERIFIED') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    if (status === 'CONTRADICTED') return <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-sm ${
            overallConfidence >= 85 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            overallConfidence >= 70 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {overallConfidence}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">Audited Verification Report</h4>
              {overallConfidence >= 85 ? (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">High Grounding</span>
              ) : (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Needs Review</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {verifiedClaimsCount} verified • {contradictedCount} contradicted • {unverifiedCount} unverified
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerVerify}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
        >
          Re-Verify Audit
        </button>
      </div>

      {/* Paragraph Breakdown */}
      <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
        {paragraphAudits.map((para, idx) => {
          const isExpanded = expandedPara === idx;
          const hasClaims = para.claims && para.claims.length > 0;

          return (
            <div key={idx} className="p-3.5 hover:bg-slate-850/50 transition">
              <div
                onClick={() => setExpandedPara(isExpanded ? null : idx)}
                className="flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Paragraph {para.paragraphIndex}
                    </span>
                    <span className={`text-[11px] px-1.5 py-0.2 rounded font-medium ${
                      para.paragraphConfidence >= 85 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {para.paragraphConfidence}% confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 italic font-mono bg-slate-950/40 p-2 rounded border border-slate-800/60">
                    &quot;{para.text}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  <span className="text-xs text-slate-400">
                    {hasClaims ? `${para.claims.length} claims` : 'No factual stats'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Expanded Claim Details */}
              {isExpanded && hasClaims && (
                <div className="mt-3 pl-3 border-l-2 border-purple-500/40 space-y-2.5 pt-1">
                  {para.claims.map((claim, cIdx) => (
                    <div key={cIdx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-slate-200 font-medium leading-relaxed">{claim.text}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 shrink-0 ${getStatusColor(claim.status)}`}>
                          {getStatusIcon(claim.status)}
                          {claim.status} ({claim.confidenceScore}%)
                        </span>
                      </div>

                      {claim.reason && (
                        <p className="text-slate-400 text-[11px] mb-1.5">{claim.reason}</p>
                      )}

                      {claim.sourceAnchor && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 text-[11px] text-purple-300 bg-purple-950/20 px-2 py-1 rounded">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="font-semibold">{claim.sourceAnchor.documentTitle}</span>
                          <span className="text-slate-500">•</span>
                          <span>Page {claim.sourceAnchor.page || 1}</span>
                          <span className="text-slate-500">•</span>
                          <span className="truncate">{claim.sourceAnchor.heading}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
