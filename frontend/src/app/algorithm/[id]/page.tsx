"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ChatAssistant from "@/components/ChatAssistant";
import AlgoVisualizer from "@/components/AlgoVisualizer";

interface SupplementPoint {
  number: string;
  title: string;
  content: string;
}

interface AlgorithmDetail {
  id: string;
  name: string;
  englishName: string;
  image: string;
  table: {
    任務類型: string;
    常見用途: string;
    主要優點: string;
    主要限制: string;
    前處理重點: string;
  };
  details: {
    positioning: string;
    concepts: string;
    dataRequirements: string;
    trainingProcess: string;
    examples: string;
    advantages: string;
    limitations: string;
    evaluation: string;
    explainability: string;
    tuning: string;
    deployment: string;
    misconceptions: string;
    extension: string;
    projectApplication: string;
    communication: string;
    qualityControl: string;
  };
  supplements: SupplementPoint[];
}

export default function AlgorithmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [algo, setAlgo] = useState<AlgorithmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("concepts");
  const [expandedSupp, setExpandedSupp] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlgo() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/algorithms/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAlgo(data);
        }
      } catch (err) {
        console.error("Error fetching algorithm detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlgo();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#090a0f] text-slate-300 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium tracking-wide">載入演算法詳情中...</span>
        </div>
      </div>
    );
  }

  if (!algo) {
    return (
      <div className="flex h-screen bg-[#090a0f] text-slate-300 items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-bold">找不到該演算法的詳細資料。</p>
          <Link href="/" className="text-blue-400 hover:underline text-sm block">返回大綱</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090a0f] text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 space-y-8 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-400 transition-colors">大綱首頁</Link>
          <span>/</span>
          <span className="text-slate-200">{algo.name}</span>
        </div>

        {/* Algorithm Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-6 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">演算法編號 {algo.id}</span>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              {algo.name}
            </h1>
            <p className="text-xs font-mono text-slate-400">{algo.englishName}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/20">
              {algo.table.任務類型}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-white/5">
              可解釋性：{["3.1", "3.2", "3.3", "3.6", "3.7"].includes(algo.id) ? "高" : "中低"}
            </span>
          </div>
        </div>

        {/* Two-Column Layout (Left: Visualizer & Brief Table | Right: Detailed Tabs) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Dynamic Visualizer */}
          <div className="lg:col-span-5 space-y-6">
            <AlgoVisualizer algorithmId={algo.id} />

            {/* Quick stats table */}
            <div className="glass-panel p-5 rounded-2xl space-y-4 text-xs">
              <h3 className="font-bold text-slate-200 border-b border-white/5 pb-2">📋 核心特性一覽</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">常見用途</span>
                  <p className="text-slate-200 leading-relaxed">{algo.table.常見用途}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">主要優點</span>
                  <p className="text-slate-200 leading-relaxed">{algo.table.主要優點}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">主要限制</span>
                  <p className="text-slate-200 leading-relaxed text-red-300">{algo.table.主要限制}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">前處理重點</span>
                  <p className="text-slate-200 leading-relaxed text-amber-300">{algo.table.前處理重點}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Detailed Tabs Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tab navigation */}
            <div className="flex border-b border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none text-xs font-semibold">
              <button
                onClick={() => setActiveTab("concepts")}
                className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${activeTab === "concepts" ? "border-blue-500 text-blue-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                1. 定位與概念
              </button>
              <button
                onClick={() => setActiveTab("process")}
                className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${activeTab === "process" ? "border-blue-500 text-blue-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                2. 資料與流程
              </button>
              <button
                onClick={() => setActiveTab("limits")}
                className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${activeTab === "limits" ? "border-blue-500 text-blue-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                3. 優缺限制
              </button>
              <button
                onClick={() => setActiveTab("governance")}
                className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${activeTab === "governance" ? "border-blue-500 text-blue-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                4. 部署與品質
              </button>
              <button
                onClick={() => setActiveTab("supplements")}
                className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${activeTab === "supplements" ? "border-blue-500 text-blue-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                5. 延伸研讀補充
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-[#0e1017] border border-white/5 rounded-2xl p-6 min-h-[300px] leading-relaxed text-sm">
              {activeTab === "concepts" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">📍 學習定位</h3>
                    <p className="text-slate-200">{algo.details.positioning}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">🔍 核心概念</h3>
                    <p className="text-slate-200">{algo.details.concepts}</p>
                  </div>
                </div>
              )}

              {activeTab === "process" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">📦 資料需求</h3>
                    <p className="text-slate-200">{algo.details.dataRequirements}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">⚙️ 訓練流程</h3>
                    <p className="text-slate-200">{algo.details.trainingProcess}</p>
                  </div>
                </div>
              )}

              {activeTab === "limits" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">✅ 主要優點</h3>
                    <p className="text-slate-200">{algo.details.advantages}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">❌ 主要限制</h3>
                    <p className="text-slate-200">{algo.details.limitations}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">⚠️ 常見誤區</h3>
                    <p className="text-slate-200">{algo.details.misconceptions}</p>
                  </div>
                </div>
              )}

              {activeTab === "governance" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">🏢 實務案例</h3>
                    <p className="text-slate-200">{algo.details.examples}</p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">📈 模型評估與可解釋性</h3>
                    <p className="text-slate-200">{algo.details.evaluation}</p>
                    {algo.details.explainability && (
                      <p className="text-slate-200 mt-2">{algo.details.explainability}</p>
                    )}
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">🛡️ 調參、導入與品質控管</h3>
                    <p className="text-slate-200">{algo.details.tuning}</p>
                    {algo.details.deployment && (
                      <p className="text-slate-200 mt-2">{algo.details.deployment}</p>
                    )}
                    {algo.details.qualityControl && (
                      <p className="text-slate-200 mt-2">{algo.details.qualityControl}</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "supplements" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">📚 演算法專案研讀補充 (12 大關鍵檢核)</h3>
                  <div className="space-y-2">
                    {algo.supplements.map((supp, index) => {
                      const isExpanded = expandedSupp === supp.number;
                      return (
                        <div 
                          key={index} 
                          className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedSupp(isExpanded ? null : supp.number)}
                            className="w-full text-left px-4 py-3 flex justify-between items-center text-xs font-bold hover:bg-slate-800 transition-colors"
                          >
                            <span>{supp.title}</span>
                            <span className="text-slate-500 font-mono">{isExpanded ? "▲" : "▼"}</span>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-white/5 bg-slate-950/40">
                              {supp.content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI chat assistant drawer */}
      <ChatAssistant />
    </div>
  );
}
