// app/calendar/page.js
"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { getTasksByDeadline, formatDeadline, deadlineStatus } from "../../lib/storage";
import { useProjects } from "../../lib/hooks/useProjects";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

export default function CalendarPage() {
  const { projects } = useProjects();
  const [year,  setYear]  = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(null); // "YYYY-MM-DD"

  const taskMap = useMemo(() => getTasksByDeadline(), [projects]);

  // Build calendar grid
  const calDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();   // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();
    const days = [];

    // Previous month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      days.push({ date: `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, day: d, current: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, day: d, current: true });
    }
    // Next month fill (to complete grid rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({ date: `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, day: d, current: false });
    }
    return days;
  }, [year, month]);

  const todayStr = new Date().toISOString().slice(0, 10);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }
  function goToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDay(todayStr);
  }

  const selectedTasks = selectedDay ? (taskMap[selectedDay] || []) : [];

  // Count tasks with deadlines this month
  const monthTaskCount = calDays
    .filter(d => d.current)
    .reduce((acc, d) => acc + (taskMap[d.date]?.length || 0), 0);

  return (
    <AppShell>
      <div style={{ padding: "36px 40px 60px", maxWidth: 1000 }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, letterSpacing: "-.03em" }}>
              <span style={{ fontWeight: 600 }}>{MONTH_NAMES[month]}</span> {year}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
              {monthTaskCount > 0
                ? `${monthTaskCount} deadline${monthTaskCount !== 1 ? "s" : ""} this month`
                : "No deadlines this month"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={goToday} style={{ padding: "7px 14px", fontSize: 12 }}>Today</button>
            <button className="btn btn-ghost" onClick={prevMonth} style={{ padding: "7px 12px", fontSize: 14 }}>‹</button>
            <button className="btn btn-ghost" onClick={nextMonth} style={{ padding: "7px 12px", fontSize: 14 }}>›</button>
          </div>
        </div>

        {/* Two-column layout when a day is selected */}
        <div style={{ display: "grid", gridTemplateColumns: selectedDay ? "1fr 280px" : "1fr", gap: 20, alignItems: "start" }}>
          {/* Calendar grid */}
          <div className="animate-fade-up" style={{ animationDelay: ".05s" }}>
            {/* Day name headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 1 }}>
              {DAY_NAMES.map(d => (
                <div key={d} className="cal-day-header">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="cal-grid">
              {calDays.map(({ date, day, current }) => {
                const tasks = taskMap[date] || [];
                const isToday = date === todayStr;
                const isSelected = date === selectedDay;
                const hasOver = tasks.some(t => deadlineStatus(t.deadline) === "overdue");
                const hasUrgent = !hasOver && tasks.some(t => deadlineStatus(t.deadline) === "urgent");

                return (
                  <div
                    key={date}
                    className={`cal-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${!current ? "other-month" : ""}`}
                    onClick={() => setSelectedDay(date === selectedDay ? null : date)}
                    style={{ minHeight: 80 }}
                  >
                    <div className="cal-day-num" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {day}
                      {hasOver   && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />}
                      {hasUrgent && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warn)",   display: "inline-block" }} />}
                    </div>
                    {tasks.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        className="cal-task-chip"
                        style={{ background: t.projectColor || "var(--accent)" }}
                        title={`${t.title} (${t.projectName})`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>+{tasks.length - 3} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day panel */}
          {selectedDay && (
            <div className="animate-scale-in" style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: 18, position: "sticky", top: 20,
            }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600 }}>
                  {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {selectedTasks.length === 0 ? "No deadlines" : `${selectedTasks.length} task${selectedTasks.length !== 1 ? "s" : ""} due`}
                </div>
              </div>

              {selectedTasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)", fontSize: 13 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                  Nothing due today
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedTasks.map(t => {
                    const ds = deadlineStatus(t.deadline);
                    return (
                      <Link key={t.id} href={`/projects/${t.projectId}`} style={{ textDecoration: "none" }}>
                        <div style={{
                          padding: "10px 12px", borderRadius: 8,
                          background: "var(--surface2)", border: "1px solid var(--border)",
                          borderLeft: `3px solid ${ds === "overdue" ? "var(--danger)" : ds === "urgent" ? "var(--warn)" : t.projectColor || "var(--accent)"}`,
                          cursor: "pointer", transition: "background 0.15s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = "var(--border)"}
                          onMouseLeave={e => e.currentTarget.style.background = "var(--surface2)"}
                        >
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 3 }}>
                            {t.title}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, color: t.projectColor || "var(--accent)" }}>
                              {t.projectName}
                            </span>
                            {ds === "overdue" && <span className="badge badge-danger">Overdue</span>}
                            {ds === "urgent"  && <span className="badge badge-warn">Due soon</span>}
                            {t.highlighted    && <span style={{ fontSize: 11 }}>⭐</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setSelectedDay(null)}
                style={{ marginTop: 14, width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 20, display: "flex", gap: 16, fontSize: 11, color: "var(--muted)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
            Overdue
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warn)", display: "inline-block" }} />
            Due in ≤2 days
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ padding: "1px 6px", borderRadius: 3, background: "var(--accent)", display: "inline-block" }} />
            Task chip (colored by project)
          </span>
        </div>
      </div>
    </AppShell>
  );
}