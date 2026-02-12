"use client";

import { useState } from "react";
import { ShieldBackground } from "@/components/ShieldBackground";
import { ThinkingIndicator } from "@/components/ThinkingIndicator";
import { analyzeQuery } from "@/lib/api";
import { ComplianceResponse } from "@/types/api";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ShieldCheck, ShieldAlert, FileText, ChevronRight, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function Home() {
  const [query, setQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [result, setResult] = useState<ComplianceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    console.log("Analyzing query:", query);
    if (!query.trim()) {
      console.log("Query is empty, returning");
      return;
    }
    setIsThinking(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeQuery(query);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <main className="min-h-screen relative text-slate-100 font-sans selection:bg-cyan-500/30">
      <ShieldBackground />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl flex flex-col min-h-screen">

        {/* Header */}
        <header className="flex items-center space-x-4 mb-16">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              AGENTIC COMPLIANCE
            </h1>
            <p className="text-slate-400 text-sm tracking-widest uppercase">Autonomous Regulatory Oversight</p>
          </div>
        </header>

        {/* Chat Input */}
        <div className="flex-1 flex flex-col justify-center items-center transition-all duration-500 ease-in-out" style={{ justifyContent: result ? 'flex-start' : 'center' }}>

          <motion.div
            layout
            className="w-full bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
          >
            {/* Glowing Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe a compliance scenario (e.g., 'We lost patient data...')"
              className="w-full bg-transparent border-none outline-none text-lg resize-none placeholder:text-slate-600 h-24"
            />

            <div className="flex justify-between items-center mt-4 border-t border-slate-800 pt-4">
              <div className="flex space-x-2">
                {/* Capability Badges */}
                <span className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-400 border border-slate-700">GDPR</span>
                <span className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-400 border border-slate-700">CCPA</span>
                <span className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-400 border border-slate-700">FDA</span>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isThinking || !query}
                className={clsx(
                  "flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-300",
                  isThinking || !query
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white hover:scale-105"
                )}
              >
                <span>Analyze</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <ThinkingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Display */}
          <AnimatePresence>
            {result && !isThinking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Risk Card */}
                <div className="md:col-span-1">
                  <div className={clsx(
                    "h-full rounded-2xl p-6 border backdrop-blur-md flex flex-col items-center justify-center text-center",
                    result.analysis.risk_level === "High" ? "bg-red-500/10 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]" :
                      result.analysis.risk_level === "Medium" ? "bg-amber-500/10 border-amber-500/50" :
                        "bg-green-500/10 border-green-500/50"
                  )}>
                    <ShieldAlert className={clsx("w-16 h-16 mb-4",
                      result.analysis.risk_level === "High" ? "text-red-500" :
                        result.analysis.risk_level === "Medium" ? "text-amber-500" : "text-green-500"
                    )} />
                    <h3 className="text-xl font-bold uppercase tracking-widest text-slate-200">Risk Level</h3>
                    <p className={clsx("text-4xl font-black mt-2 bg-clip-text text-transparent bg-gradient-to-b",
                      result.analysis.risk_level === "High" ? "from-red-400 to-red-600" :
                        result.analysis.risk_level === "Medium" ? "from-amber-400 to-amber-600" :
                          "from-green-400 to-green-600"
                    )}>{result.analysis.risk_level}</p>
                  </div>
                </div>

                {/* Analysis Content */}
                <div className="md:col-span-2 space-y-6">
                  {/* Summary */}
                  <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Executive Summary
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-lg">
                      {result.analysis.summary}
                    </p>
                  </div>

                  {/* Reasoning Map */}
                  <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-4">
                      Regulatory Analysis
                    </h3>
                    <div className="space-y-4">
                      {result.analysis.reasoning_map.map((item, i) => (
                        <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-400 text-sm">Fact detected:</span>
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono">
                              {item.regulation} {item.article}
                            </span>
                          </div>
                          <p className="text-white font-medium mb-2">"{item.fact}"</p>
                          <div className="flex items-start text-sm text-slate-400">
                            <ChevronRight className="w-4 h-4 mr-1 text-cyan-500 mt-0.5 shrink-0" />
                            <p>{item.justification}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </main>
  );
}
