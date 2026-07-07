

import React, { useState } from 'react'
import {
  Zap, Layers, Server, Check, Play, Lock,
  ChevronRight, ChevronLeft, Home, Grid3x3, Star
} from 'lucide-react'
import { Header } from "../../layouts/Header/Header"

export default function ModulesInCoursePage() {
  const [scrollPosition, setScrollPosition] = useState(0)

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('modules-scroll')
    if (container) {
      const scrollAmount = 320
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      
      {/* ── GLOBAL HEADER (TOP) ── */}
      <Header />

      {/* ── BOTTOM CONTAINER (SIDEBAR + MAIN CONTENT) ── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0 h-full z-20 shadow-sm">

          {/* Logo */}
          <div className="h-[72px] px-6 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
                <Zap className="w-4 h-4 text-white fill-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">Dev Space</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
              <svg height="20" viewBox="0 0 16 16" width="20" fill="#FFFFFF">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </div>
          </div>

          {/* Sidebar scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Courses</h2>
              <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-100">3</span>
            </div>

            <div className="flex flex-col gap-2 px-3 pb-8">

              {/* Course 1: ACTIVE */}
              <div className="group flex flex-col gap-3 p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 cursor-pointer relative overflow-hidden shadow-lg shadow-orange-500/20 hover:shadow-xl transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm shrink-0 flex items-center justify-center ring-1 ring-white/30">
                    <Zap className="text-white w-4 h-4 fill-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-sm font-bold text-white leading-tight truncate">Advanced UI Engineering</h3>
                    <span className="text-xs font-medium text-orange-100">Frontend Architecture</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 relative z-10">
                  <div className="flex justify-between text-xs font-bold text-orange-100">
                    <span>Progress</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Course 2: COMPLETED */}
              <div className="group flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 shrink-0 flex items-center justify-center group-hover:bg-emerald-100 transition">
                    <Layers className="text-emerald-500 w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition leading-tight truncate">Fullstack Next.js Mastery</h3>
                    <span className="text-xs font-medium text-slate-400">Web Development</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Progress</span>
                    <span className="text-emerald-500">100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Course 3: NOT STARTED */}
              <div className="group flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0 flex items-center justify-center group-hover:bg-slate-200 transition">
                    <Server className="text-slate-400 w-4 h-4 group-hover:text-slate-600 transition" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition leading-tight truncate">Microservices & Docker</h3>
                    <span className="text-xs font-medium text-slate-400">DevOps & Cloud</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-slate-300 rounded-full" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden flex flex-col relative">

          {/* Sticky Breadcrumb Header */}
          <header className="w-full h-[72px] px-6 lg:px-8 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="hover:text-orange-600 cursor-pointer transition flex items-center gap-1.5 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-700 font-semibold truncate max-w-[180px] sm:max-w-none">Advanced UI Engineering</span>
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 transition px-3 py-2 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-200">
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Curriculum</span>
            </button>
          </header>

          {/* Page content */}
          <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-[1400px] w-full mx-auto">

            {/* ── HERO BANNER ── */}
            <section className="w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/30 relative">
              {/* Background layers */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.2),transparent_70%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.08),transparent_60%)]" />

              <div className="relative z-10 p-8 sm:p-10 lg:p-12 flex flex-col xl:flex-row items-center gap-8 xl:gap-12">

                {/* Text block */}
                <div className="flex-1 flex flex-col gap-6 w-full">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      Enrolled
                    </span>
                    <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-white/10">
                      <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                      <span className="text-white text-xs font-bold">4.9 / 5.0</span>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                      Advanced UI<br />
                      <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">Engineering</span>
                    </h1>
                  </div>

                  <p className="text-base text-slate-300 max-w-xl leading-relaxed">
                    Nắm vững kỹ thuật xây dựng kiến trúc Frontend mở rộng. Học cách thiết kế Component linh hoạt, quản lý State và tích hợp Design System.
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 text-sm">
                      <Play className="w-4 h-4 fill-current" />
                      Resume IDE
                    </button>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                      <div className="flex items-center gap-3">
                        <div className="w-40 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="w-[30%] h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-sm" />
                        </div>
                        <span className="text-orange-400 font-bold text-sm">30%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code preview card */}
                <div className="w-full xl:w-[340px] shrink-0 aspect-[4/3] bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative shadow-2xl flex flex-col">
                  <div className="w-full h-9 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-2 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 hover:bg-red-600 transition cursor-pointer" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 hover:bg-yellow-600 transition cursor-pointer" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 hover:bg-green-600 transition cursor-pointer" />
                    <span className="ml-auto text-xs text-slate-500 font-mono">Architecture.tsx</span>
                  </div>
                  <div className="flex-1 p-4 font-mono text-xs leading-6 overflow-hidden select-none">
                    <div><span className="text-pink-400">export const</span> <span className="text-blue-300">Architecture</span> <span className="text-slate-400">= () =&gt;</span> {'{'}</div>
                    <div className="pl-4"><span className="text-pink-400">return</span> <span className="text-slate-400">(</span></div>
                    <div className="pl-8"><span className="text-slate-500">&lt;</span><span className="text-orange-400">Provider</span> <span className="text-blue-300">store</span><span className="text-slate-400">={'{'}</span><span className="text-yellow-300">store</span><span className="text-slate-400">{'}'}</span><span className="text-slate-500">&gt;</span></div>
                    <div className="pl-12"><span className="text-slate-500">&lt;</span><span className="text-orange-400">AppLayout</span> <span className="text-slate-500">/&gt;</span></div>
                    <div className="pl-8"><span className="text-slate-500">&lt;/</span><span className="text-orange-400">Provider</span><span className="text-slate-500">&gt;</span></div>
                    <div className="pl-4"><span className="text-slate-400">);</span></div>
                    <div><span className="text-slate-400">{'}'}</span><span className="text-slate-500">;</span></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition pointer-events-auto cursor-pointer">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* ── MODULES ── */}
          <section className="flex flex-col gap-4">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Course Modules</h2>
                <p className="text-sm text-slate-500 mt-1">4 modules · 36 Topics total</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleScroll('left')} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition active:scale-95">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => handleScroll('right')} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition active:scale-95">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ĐÃ FIX: Thêm pt-4 pb-6 px-4 -mx-4 để không bị cắt shadow và ring, đồng thời tạo không gian gap thoáng hơn */}
            <div id="modules-scroll" className="flex gap-5 overflow-x-auto pt-4 pb-6 px-4 -mx-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

              {/* MODULE 1: COMPLETED */}
              <div className="w-[280px] sm:w-[300px] shrink-0 snap-start group">
                <div className="h-full bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 opacity-70 group-hover:opacity-100">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-base">
                      01
                    </div>
                    <div className="bg-emerald-50 text-emerald-500 p-2 rounded-xl border border-emerald-200">
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">DOM & Browser Rendering</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">Hiểu sâu về Critical Rendering Path, reflow, repaint và cách tối ưu hóa hiệu suất.</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>8 Topics</span>
                      <span>2h 15m</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-emerald-500 rounded-full" />
                    </div>
                    <button className="w-full py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition border border-slate-200 hover:border-slate-300">
                      Review Module
                    </button>
                  </div>
                </div>
              </div>

              {/* MODULE 2: COMPLETED */}
              <div className="w-[280px] sm:w-[300px] shrink-0 snap-start group">
                <div className="h-full bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 opacity-70 group-hover:opacity-100">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-base">
                      02
                    </div>
                    <div className="bg-emerald-50 text-emerald-500 p-2 rounded-xl border border-emerald-200">
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">Advanced State Management</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">Kiến trúc Global State, Context API nâng cao và quản lý dữ liệu bất đồng bộ.</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>10 Topics</span>
                      <span>3h 40m</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-emerald-500 rounded-full" />
                    </div>
                    <button className="w-full py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition border border-slate-200 hover:border-slate-300">
                      Review Module
                    </button>
                  </div>
                </div>
              </div>

              {/* MODULE 3: ACTIVE */}
              <div className="w-[280px] sm:w-[300px] shrink-0 snap-start">
                <div className="h-full bg-white rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-lg hover:shadow-xl shadow-orange-500/10 ring-2 ring-orange-500 hover:-translate-y-1 transition-all duration-300">
                  {/* Decorative glow */}
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-base">
                      03
                    </div>
                    <div className="bg-orange-50 text-orange-500 px-3 py-1.5 rounded-lg border border-orange-200 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold">In Progress</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 relative z-10">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">Component Architecture Patterns</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">Thiết kế Component reusable, Compound Components, Render Props và Custom Hooks advanced.</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-3 relative z-10">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>12 Topics</span>
                      <span>4h 20m</span>
                    </div>
                    <div className="w-full h-1.5 bg-orange-50 rounded-full overflow-hidden">
                      <div className="w-[45%] h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" />
                    </div>
                    <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2">
                      <Play className="w-3 h-3 fill-current" />
                      Continue Learning
                    </button>
                  </div>
                </div>
              </div>

              {/* MODULE 4: LOCKED */}
              <div className="w-[280px] sm:w-[300px] shrink-0 snap-start group">
                <div className="h-full bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-slate-300 opacity-60 group-hover:opacity-75 transition-all duration-300 cursor-not-allowed">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-base">
                      04
                    </div>
                    <div className="bg-slate-100 text-slate-400 p-2 rounded-xl border border-slate-200">
                      <Lock className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-slate-500 leading-snug">Performance Optimization</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">Code splitting, lazy loading, memoization và best practices tối ưu hóa React.</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>9 Topics</span>
                      <span>3h 10m</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-0 h-full bg-slate-300 rounded-full" />
                    </div>
                    <button className="w-full py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed" disabled>
                      Locked - Complete Module 3
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>

          </div>
        </main>
      </div>
    </div>
  )
}