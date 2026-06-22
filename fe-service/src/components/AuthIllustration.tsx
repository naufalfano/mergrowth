const BLUE = "#194be7";
const RED  = "#e53935";
const GREEN = "#2e7d32";

const glass = {
  background: "rgba(255,255,255,0.68)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.85)",
  boxShadow: "0 4px 20px rgba(25,75,231,0.07)",
};

export default function AuthIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">

      {/* Light base */}
      <div className="absolute inset-0 bg-[#f5f7ff]" />

      {/* Lens flare */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute" style={{ width: "160%", height: "6px", top: "52%", left: "-30%", background: "linear-gradient(90deg, transparent 0%, white 40%, white 60%, transparent 100%)", transform: "rotate(-28deg)", filter: "blur(3px)", opacity: 0.9 }} />
        <div className="absolute" style={{ width: "160%", height: "180px", top: "42%", left: "-30%", background: "linear-gradient(180deg, transparent 0%, rgba(25,75,231,0.22) 20%, rgba(92,130,245,0.20) 50%, rgba(25,75,231,0.18) 80%, transparent 100%)", transform: "rotate(-28deg)", filter: "blur(18px)", opacity: 0.65 }} />
        <div className="absolute" style={{ width: "160%", height: "40px", top: "50%", left: "-30%", background: "linear-gradient(180deg, rgba(10,35,180,0.35) 0%, rgba(92,130,245,0.30) 50%, rgba(25,75,231,0.25) 100%)", transform: "rotate(-28deg)", filter: "blur(8px)", opacity: 0.55 }} />
      </div>

      {/* Content: text above, cards below */}
      <div className="relative flex flex-col items-center justify-center gap-12 px-10 py-10 w-full h-full">

        {/* Copy */}
        <div className="flex flex-col gap-2 w-full max-w-lg">
          <h2 className="text-4xl font-bold text-gray-800 leading-tight">
            Grow smarter, sell further.
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Market intelligence and AI insights purpose-built for Indonesian online sellers.
          </p>
        </div>

        {/* Floating card */}
        <div
          className="flex flex-col gap-3 w-full max-w-lg p-5 rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.42)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.72)",
            boxShadow: "0 24px 64px rgba(25,75,231,0.11), 0 2px 16px rgba(25,75,231,0.06)",
          }}
        >
          {/* Revenue */}
          <div className="rounded-2xl p-4" style={glass}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-medium">Monthly Revenue</p>
                <p className="text-xl font-bold text-gray-800 mt-0.5">Rp 24.830.000</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: BLUE }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 11 ? BLUE : `rgba(25,75,231,${0.10 + i * 0.04})` }} />
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3">
            {[
              {
                label: "Orders", value: "1,284", trend: "↑ 12%", color: BLUE,
                icon: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                ),
              },
              {
                label: "Products", value: "348", trend: "↑ 5%", color: RED,
                icon: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                ),
              },
            ].map((s, i) => (
              <div key={i} className="flex-1 rounded-2xl p-3" style={glass}>
                <div className="w-7 h-7 rounded-lg mb-2 flex items-center justify-center" style={{ background: s.color }}>
                  {s.icon}
                </div>
                <p className="text-base font-bold text-gray-800">{s.value}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-[9px] font-medium mt-1" style={{ color: s.color }}>{s.trend}</p>
              </div>
            ))}
          </div>

          {/* Top products */}
          <div className="rounded-2xl p-4" style={glass}>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-medium mb-2.5">Top Products</p>
            <div className="flex flex-col gap-2">
              {[
                { name: "Wireless Headphones", pct: 82, color: BLUE  },
                { name: "Smart Watch Pro",     pct: 65, color: RED   },
                { name: "Portable Speaker",    pct: 48, color: GREEN },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-gray-600">{item.name}</span>
                    <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
