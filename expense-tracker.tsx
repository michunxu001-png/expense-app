import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { id: "food", label: "餐饮", emoji: "🍜", color: "#FF6B6B" },
  { id: "transport", label: "交通", emoji: "🚇", color: "#4ECDC4" },
  { id: "shop", label: "购物", emoji: "🛍️", color: "#FFE66D" },
  { id: "entertainment", label: "娱乐", emoji: "🎮", color: "#A78BFA" },
  { id: "health", label: "医疗", emoji: "💊", color: "#F97316" },
  { id: "housing", label: "住房", emoji: "🏠", color: "#34D399" },
  { id: "education", label: "教育", emoji: "📚", color: "#60A5FA" },
  { id: "other", label: "其他", emoji: "📦", color: "#94A3B8" },
];

const MONTHS_ZH = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

function formatAmount(n) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const INITIAL = [
  { id: 1, amount: 38.5, category: "food", note: "午餐", date: today() },
  { id: 2, amount: 12, category: "transport", note: "地铁", date: today() },
  { id: 3, amount: 299, category: "shop", note: "耳机", date: today() },
];

let nextId = 4;

export default function App() {
  const [records, setRecords] = useState(INITIAL);
  const [tab, setTab] = useState("home"); // home | stats | add
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ amount: "", category: "food", note: "", date: today() });
  const [amountStr, setAmountStr] = useState("");
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());

  const now = new Date();
  const currentYear = now.getFullYear();

  const monthRecords = records.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === filterMonth && d.getFullYear() === currentYear;
  });
  const totalMonth = monthRecords.reduce((s, r) => s + r.amount, 0);
  const todayRecords = records.filter(r => r.date === today());
  const totalToday = todayRecords.reduce((s, r) => s + r.amount, 0);

  // stats per category for month
  const catStats = CATEGORIES.map(cat => {
    const sum = monthRecords.filter(r => r.category === cat.id).reduce((s, r) => s + r.amount, 0);
    return { ...cat, sum };
  }).filter(c => c.sum > 0).sort((a, b) => b.sum - a.sum);

  function openAdd(record = null) {
    if (record) {
      setForm({ amount: record.amount, category: record.category, note: record.note, date: record.date });
      setAmountStr(String(record.amount));
      setEditId(record.id);
    } else {
      setForm({ amount: "", category: "food", note: "", date: today() });
      setAmountStr("");
      setEditId(null);
    }
    setShowAdd(true);
  }

  function closeAdd() { setShowAdd(false); setEditId(null); }

  function saveRecord() {
    const amt = parseFloat(amountStr);
    if (!amountStr || isNaN(amt) || amt <= 0) return;
    if (editId !== null) {
      setRecords(prev => prev.map(r => r.id === editId ? { ...r, ...form, amount: amt } : r));
    } else {
      setRecords(prev => [{ id: nextId++, ...form, amount: amt }, ...prev]);
    }
    closeAdd();
  }

  function deleteRecord(id) {
    setRecords(prev => prev.filter(r => r.id !== id));
    setDeleteId(null);
  }

  // Group today's records by date for display
  const grouped = {};
  records.forEach(r => {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const maxCatSum = catStats.length ? catStats[0].sum : 1;

  return (
    <div style={styles.phone}>
      <div style={styles.statusBar}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>9:41</span>
        <span style={{ fontSize: 12 }}>●●● 📶 🔋</span>
      </div>

      <div style={styles.screen}>
        {/* HOME TAB */}
        {tab === "home" && (
          <div style={styles.scrollArea}>
            {/* Header card */}
            <div style={styles.headerCard}>
              <div style={styles.headerTop}>
                <span style={styles.headerLabel}>本月支出</span>
                <span style={styles.monthPill}>
                  {MONTHS_ZH[filterMonth]}
                  <select
                    value={filterMonth}
                    onChange={e => setFilterMonth(Number(e.target.value))}
                    style={styles.monthSelect}
                  >
                    {MONTHS_ZH.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </span>
              </div>
              <div style={styles.bigAmount}>¥{formatAmount(totalMonth)}</div>
              <div style={styles.todayRow}>
                <span style={styles.todayLabel}>今日 ¥{formatAmount(totalToday)}</span>
                <span style={styles.todayCount}>{todayRecords.length} 笔</span>
              </div>
            </div>

            {/* Category quick pills */}
            <div style={styles.sectionTitle}>支出分类</div>
            <div style={styles.catRow}>
              {catStats.slice(0, 4).map(cat => (
                <div key={cat.id} style={{ ...styles.catPill, background: cat.color + "22", border: `1.5px solid ${cat.color}55` }}>
                  <span style={styles.catEmoji}>{cat.emoji}</span>
                  <span style={{ ...styles.catLabel, color: cat.color }}>{cat.label}</span>
                  <span style={styles.catAmt}>¥{formatAmount(cat.sum)}</span>
                </div>
              ))}
              {catStats.length === 0 && <span style={{ color: "#94A3B8", fontSize: 13 }}>暂无记录</span>}
            </div>

            {/* Records list */}
            <div style={styles.sectionTitle}>明细记录</div>
            {sortedDates.length === 0 && (
              <div style={styles.emptyState}>还没有记录，点击 + 开始记账</div>
            )}
            {sortedDates.map(date => (
              <div key={date}>
                <div style={styles.dateHeader}>
                  <span>{date === today() ? "今天" : date}</span>
                  <span style={{ color: "#94A3B8" }}>¥{formatAmount(grouped[date].reduce((s, r) => s + r.amount, 0))}</span>
                </div>
                {grouped[date].map(r => {
                  const cat = CATEGORIES.find(c => c.id === r.category);
                  return (
                    <div key={r.id} style={styles.recordRow} onClick={() => openAdd(r)}>
                      <div style={{ ...styles.recordIcon, background: cat.color + "22" }}>
                        <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                      </div>
                      <div style={styles.recordInfo}>
                        <span style={styles.recordNote}>{r.note || cat.label}</span>
                        <span style={styles.recordCat}>{cat.label}</span>
                      </div>
                      <div style={styles.recordRight}>
                        <span style={styles.recordAmt}>-¥{formatAmount(r.amount)}</span>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteId(r.id); }}
                          style={styles.deleteBtn}
                        >✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{ height: 100 }} />
          </div>
        )}

        {/* STATS TAB */}
        {tab === "stats" && (
          <div style={styles.scrollArea}>
            <div style={styles.statsHeader}>统计分析</div>
            <div style={styles.statsCard}>
              <div style={styles.statsSub}>
                {MONTHS_ZH[filterMonth]} · 共 {monthRecords.length} 笔 · ¥{formatAmount(totalMonth)}
              </div>
              {catStats.length === 0 && <div style={styles.emptyState}>暂无数据</div>}
              {catStats.map(cat => (
                <div key={cat.id} style={styles.statsBarRow}>
                  <div style={styles.statsBarLeft}>
                    <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                    <span style={styles.statsBarLabel}>{cat.label}</span>
                  </div>
                  <div style={styles.statsBarTrack}>
                    <div style={{
                      ...styles.statsBarFill,
                      width: `${(cat.sum / maxCatSum) * 100}%`,
                      background: cat.color,
                    }} />
                  </div>
                  <span style={{ ...styles.statsBarAmt, color: cat.color }}>
                    ¥{formatAmount(cat.sum)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pie-like donut visual */}
            {catStats.length > 0 && (
              <div style={styles.donutWrap}>
                <svg width="180" height="180" viewBox="0 0 36 36">
                  {(() => {
                    let offset = 0;
                    return catStats.map(cat => {
                      const pct = cat.sum / totalMonth;
                      const dash = pct * 100;
                      const el = (
                        <circle
                          key={cat.id}
                          cx="18" cy="18" r="15.9"
                          fill="none"
                          stroke={cat.color}
                          strokeWidth="3.5"
                          strokeDasharray={`${dash} ${100 - dash}`}
                          strokeDashoffset={-offset}
                          style={{ transition: "all 0.4s" }}
                        />
                      );
                      offset += dash;
                      return el;
                    });
                  })()}
                  <text x="18" y="19.5" textAnchor="middle" fontSize="4" fill="#F8FAFC" fontWeight="700">
                    {MONTHS_ZH[filterMonth]}
                  </text>
                </svg>
                <div style={styles.donutLegend}>
                  {catStats.map(cat => (
                    <div key={cat.id} style={styles.legendRow}>
                      <span style={{ ...styles.legendDot, background: cat.color }} />
                      <span style={styles.legendLabel}>{cat.label}</span>
                      <span style={styles.legendPct}>{((cat.sum / totalMonth) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ height: 100 }} />
          </div>
        )}
      </div>

      {/* FAB */}
      <button style={styles.fab} onClick={() => openAdd()}>+</button>

      {/* Bottom Nav */}
      <div style={styles.bottomNav}>
        {[
          { id: "home", emoji: "🏠", label: "账单" },
          { id: "stats", emoji: "📊", label: "统计" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...styles.navBtn, color: tab === t.id ? "#6366F1" : "#94A3B8" }}>
            <span style={{ fontSize: 22 }}>{t.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={styles.overlay} onClick={closeAdd}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHandle} />
            <div style={styles.modalTitle}>{editId ? "编辑记录" : "新增支出"}</div>

            {/* Amount input */}
            <div style={styles.amountRow}>
              <span style={styles.currencySign}>¥</span>
              <input
                type="number"
                placeholder="0.00"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                style={styles.amountInput}
                autoFocus
              />
            </div>

            {/* Category grid */}
            <div style={styles.catGrid}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  style={{
                    ...styles.catGridBtn,
                    background: form.category === cat.id ? cat.color : "#1E293B",
                    border: `2px solid ${form.category === cat.id ? cat.color : "#334155"}`,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 11, color: form.category === cat.id ? "#fff" : "#94A3B8" }}>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Note */}
            <input
              type="text"
              placeholder="备注（可选）"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              style={styles.noteInput}
            />

            {/* Date */}
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              style={styles.dateInput}
            />

            <button onClick={saveRecord} style={styles.saveBtn}>
              {editId ? "保存修改" : "记一笔"}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={styles.overlay} onClick={() => setDeleteId(null)}>
          <div style={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗑️</div>
            <div style={{ color: "#F8FAFC", fontWeight: 700, marginBottom: 6 }}>确认删除？</div>
            <div style={{ color: "#94A3B8", fontSize: 13, marginBottom: 20 }}>此操作不可撤销</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteId(null)} style={styles.cancelBtn}>取消</button>
              <button onClick={() => deleteRecord(deleteId)} style={styles.confirmBtn}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  phone: {
    width: 390,
    height: 844,
    background: "#0F172A",
    borderRadius: 44,
    boxShadow: "0 40px 120px #0005, 0 0 0 10px #1E293B, 0 0 0 12px #334155",
    margin: "20px auto",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    position: "relative",
  },
  statusBar: {
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    color: "#F8FAFC",
    background: "#0F172A",
    flexShrink: 0,
  },
  screen: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  scrollArea: {
    height: "100%",
    overflowY: "auto",
    padding: "0 0 0 0",
    scrollbarWidth: "none",
  },
  headerCard: {
    background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
    margin: "12px 16px 0",
    borderRadius: 24,
    padding: "24px 22px 20px",
    boxShadow: "0 8px 32px #6366F140",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLabel: {
    color: "#C7D2FE",
    fontSize: 13,
    fontWeight: 500,
  },
  monthPill: {
    background: "#ffffff22",
    borderRadius: 20,
    padding: "3px 12px",
    color: "#E0E7FF",
    fontSize: 12,
    position: "relative",
    cursor: "pointer",
  },
  monthSelect: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    cursor: "pointer",
    width: "100%",
  },
  bigAmount: {
    fontSize: 42,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: -1,
    margin: "4px 0 12px",
  },
  todayRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayLabel: { color: "#C7D2FE", fontSize: 13 },
  todayCount: {
    background: "#ffffff22",
    borderRadius: 10,
    padding: "2px 10px",
    color: "#E0E7FF",
    fontSize: 12,
  },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    padding: "20px 20px 8px",
  },
  catRow: {
    display: "flex",
    gap: 8,
    padding: "0 16px",
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  catPill: {
    flexShrink: 0,
    borderRadius: 16,
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    minWidth: 72,
  },
  catEmoji: { fontSize: 22 },
  catLabel: { fontSize: 11, fontWeight: 600 },
  catAmt: { fontSize: 12, color: "#94A3B8" },
  dateHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px 6px",
    color: "#64748B",
    fontSize: 12,
    fontWeight: 600,
  },
  recordRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    marginHorizontal: 0,
    cursor: "pointer",
    transition: "background 0.15s",
    borderRadius: 0,
  },
  recordIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recordInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  recordNote: { color: "#F1F5F9", fontSize: 15, fontWeight: 600 },
  recordCat: { color: "#64748B", fontSize: 12 },
  recordRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  recordAmt: { color: "#F87171", fontSize: 16, fontWeight: 700 },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#475569",
    fontSize: 12,
    cursor: "pointer",
    padding: "2px 4px",
  },
  emptyState: {
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
    padding: "32px 0",
  },
  fab: {
    position: "absolute",
    bottom: 88,
    left: "50%",
    transform: "translateX(-50%)",
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    border: "none",
    color: "#fff",
    fontSize: 32,
    fontWeight: 300,
    cursor: "pointer",
    boxShadow: "0 4px 24px #6366F166",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    lineHeight: 1,
  },
  bottomNav: {
    height: 82,
    background: "#0F172A",
    borderTop: "1px solid #1E293B",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "0 40px 16px",
    flexShrink: 0,
  },
  navBtn: {
    background: "none",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    cursor: "pointer",
    padding: "8px 24px",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "#00000088",
    zIndex: 20,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#1E293B",
    borderRadius: "28px 28px 0 0",
    padding: "12px 20px 32px",
    width: "100%",
    maxHeight: "85%",
    overflowY: "auto",
    scrollbarWidth: "none",
  },
  modalHandle: {
    width: 40,
    height: 4,
    background: "#334155",
    borderRadius: 2,
    margin: "0 auto 16px",
  },
  modalTitle: {
    color: "#F1F5F9",
    fontWeight: 700,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  amountRow: {
    display: "flex",
    alignItems: "center",
    background: "#0F172A",
    borderRadius: 16,
    padding: "4px 16px",
    marginBottom: 20,
    border: "1.5px solid #334155",
  },
  currencySign: {
    color: "#6366F1",
    fontSize: 28,
    fontWeight: 700,
    marginRight: 4,
  },
  amountInput: {
    background: "none",
    border: "none",
    color: "#F8FAFC",
    fontSize: 36,
    fontWeight: 800,
    flex: 1,
    outline: "none",
    width: "100%",
  },
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginBottom: 16,
  },
  catGridBtn: {
    borderRadius: 14,
    padding: "10px 4px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  noteInput: {
    width: "100%",
    background: "#0F172A",
    border: "1.5px solid #334155",
    borderRadius: 12,
    padding: "12px 14px",
    color: "#F1F5F9",
    fontSize: 15,
    outline: "none",
    marginBottom: 10,
    boxSizing: "border-box",
  },
  dateInput: {
    width: "100%",
    background: "#0F172A",
    border: "1.5px solid #334155",
    borderRadius: 12,
    padding: "12px 14px",
    color: "#94A3B8",
    fontSize: 14,
    outline: "none",
    marginBottom: 20,
    boxSizing: "border-box",
  },
  saveBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    border: "none",
    borderRadius: 16,
    padding: "16px",
    color: "#fff",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px #6366F144",
  },
  confirmBox: {
    background: "#1E293B",
    borderRadius: 24,
    padding: "32px 24px",
    textAlign: "center",
    margin: "0 32px",
    marginBottom: 40,
    width: "calc(100% - 64px)",
  },
  cancelBtn: {
    flex: 1,
    background: "#334155",
    border: "none",
    borderRadius: 12,
    padding: "12px",
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    background: "#EF4444",
    border: "none",
    borderRadius: 12,
    padding: "12px",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  statsHeader: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: 800,
    padding: "16px 20px 8px",
  },
  statsCard: {
    background: "#1E293B",
    borderRadius: 20,
    margin: "0 16px 16px",
    padding: "16px",
  },
  statsSub: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 16,
  },
  statsBarRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  statsBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: 68,
    flexShrink: 0,
  },
  statsBarLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  statsBarTrack: {
    flex: 1,
    height: 8,
    background: "#0F172A",
    borderRadius: 4,
    overflow: "hidden",
  },
  statsBarFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
  },
  statsBarAmt: {
    fontSize: 13,
    fontWeight: 700,
    width: 72,
    textAlign: "right",
    flexShrink: 0,
  },
  donutWrap: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    background: "#1E293B",
    borderRadius: 20,
    margin: "0 16px 16px",
    padding: "20px",
  },
  donutLegend: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendLabel: {
    color: "#94A3B8",
    fontSize: 12,
    flex: 1,
  },
  legendPct: {
    color: "#F1F5F9",
    fontSize: 12,
    fontWeight: 700,
  },
};
