import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Square, Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Star, Settings, Edit3, X, Check, Trash2, BarChart2, PieChart, AlertCircle, Archive, TrendingUp, List, GitCompare } from 'lucide-react';
import { COLORS } from '../constants';
import { Modal } from '../components/ui';

// ============================================
// КОНСТАНТЫ
// ============================================
const DEFAULT_ACTIVITIES = [
  { id: 'activity_work', name: 'Работа', icon: '💼', color: '#4A90D9', isFavorite: true, dailyGoal: 480 },
  { id: 'activity_study', name: 'Обучение', icon: '📚', color: '#9B59B6', isFavorite: true, dailyGoal: 60 },
  { id: 'activity_sport', name: 'Спорт', icon: '🏃', color: '#27AE60', isFavorite: true, dailyGoal: 30 },
];

const ACTIVITY_ICONS = ['💼', '📚', '🏃', '☕', '🎨', '🎮', '🎵', '✍️', '🧘', '🍳', '🛠️', '💻', '📱', '🎯', '⭐', '🏠', '🚗', '💤', '🍽️', '📞'];
const ACTIVITY_COLORS = ['#4A90D9', '#9B59B6', '#27AE60', '#E67E22', '#E91E63', '#00BCD4', '#FF5722', '#607D8B', '#795548', '#3F51B5'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DAY_VIEW_MODES = [{ id: 'list', icon: List, label: 'Список' }, { id: 'chart', icon: BarChart2, label: 'Диаграмма' }];
const CHART_TYPES = [{ id: 'bar', icon: BarChart2, label: 'Столбцы' }, { id: 'pie', icon: PieChart, label: 'Круговая' }, { id: 'trend', icon: TrendingUp, label: 'Тренд' }];
const STAT_PERIODS = [{ id: 'today', label: 'День' }, { id: 'week', label: 'Неделя' }, { id: 'month', label: 'Месяц' }, { id: 'custom', label: 'Период' }];

// ============================================
// УТИЛИТЫ
// ============================================
const formatTime = (seconds) => { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60; return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; };
const formatMinutes = (minutes) => { if (!minutes) return '0м'; const h = Math.floor(minutes / 60); const m = minutes % 60; if (h > 0) return m > 0 ? `${h}ч ${m}м` : `${h}ч`; return `${m}м`; };
const formatDateKey = (date) => { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const formatDateDisplay = (date) => { const d = new Date(date); const today = new Date(); if (formatDateKey(d) === formatDateKey(today)) return 'Сегодня'; const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']; return `${d.getDate()} ${months[d.getMonth()]}`; };
const getWeekStart = (date) => { const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); return new Date(d.setDate(diff)); };
const getMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const getDayOfWeek = (date) => { const d = new Date(date).getDay(); return d === 0 ? 6 : d - 1; };
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };

// ============================================
// КРУГОВАЯ ДИАГРАММА
// ============================================
const PieChartComponent = ({ data, total }) => {
  if (!data.length || total === 0) return <div style={{ textAlign: 'center', padding: '20px', color: COLORS.textMuted }}>Нет данных</div>;
  let cumulativePercent = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
        <svg viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, i) => { const percent = (item.minutes / total) * 100; const strokeDasharray = `${percent} ${100 - percent}`; const strokeDashoffset = -cumulativePercent; cumulativePercent += percent; return <circle key={i} r="16" cx="16" cy="16" fill="transparent" stroke={item.color} strokeWidth="5" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />; })}
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}><p style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text }}>{formatMinutes(total)}</p></div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.slice(0, 5).map((item, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', background: item.color, borderRadius: '2px' }} /><span style={{ fontSize: '12px', color: COLORS.text, flex: 1 }}>{item.name}</span><span style={{ fontSize: '12px', color: COLORS.textMuted }}>{formatMinutes(item.minutes)}</span></div>)}
      </div>
    </div>
  );
};

// ============================================
// СТОЛБЧАТАЯ ДИАГРАММА
// ============================================
const BarChartComponent = ({ data, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', padding: '10px 0' }}>
      {data.map((item, i) => { const height = (item.value / max) * 100; return (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', color: COLORS.textMuted }}>{item.value > 0 ? formatMinutes(item.value) : ''}</span>
          <div style={{ width: '100%', height: '70px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}><div style={{ width: '100%', maxWidth: '30px', height: `${Math.max(height, 3)}%`, background: item.color || COLORS.gold, borderRadius: '4px 4px 0 0' }} /></div>
          <span style={{ fontSize: '10px', color: COLORS.textMuted }}>{item.label}</span>
        </div>
      ); })}
    </div>
  );
};

// ============================================
// СРАВНЕНИЕ ПЕРИОДОВ
// ============================================
const ComparisonView = ({ current, previous, currentLabel, previousLabel }) => {
  const max = Math.max(current, previous, 1);
  const diff = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  return (
    <div style={{ padding: '16px', background: COLORS.bgCard, borderRadius: '14px', border: `1px solid ${COLORS.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', color: COLORS.text, fontWeight: '500' }}>Сравнение</span>
        {diff !== 0 && <span style={{ fontSize: '13px', color: diff > 0 ? COLORS.success : COLORS.danger, fontWeight: '500' }}>{diff > 0 ? '+' : ''}{diff}%</span>}
      </div>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        {[{ value: previous, label: previousLabel, color: COLORS.textMuted }, { value: current, label: currentLabel, color: COLORS.gold }].map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '80px' }}>
            <div style={{ width: '40px', height: '80px', display: 'flex', alignItems: 'flex-end', background: COLORS.bg, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: `${Math.max((item.value / max) * 100, 5)}%`, background: item.color, borderRadius: '8px 8px 0 0' }} />
            </div>
            <span style={{ fontSize: '13px', color: item.color, fontWeight: '500' }}>{formatMinutes(item.value)}</span>
            <span style={{ fontSize: '10px', color: COLORS.textMuted }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// ТРЕНД
// ============================================
const TrendChart = ({ data }) => {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => { const x = (i / (data.length - 1 || 1)) * 100; const y = 100 - (d.value / max) * 80; return `${x},${y}`; }).join(' ');
  return (
    <div style={{ padding: '10px 0' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100px' }}>
        <polyline fill="none" stroke={COLORS.gold} strokeWidth="2" points={points} />
        {data.map((d, i) => { const x = (i / (data.length - 1 || 1)) * 100; const y = 100 - (d.value / max) * 80; return <circle key={i} cx={x} cy={y} r="3" fill={COLORS.gold} />; })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>{data.map((d, i) => <span key={i} style={{ fontSize: '10px', color: COLORS.textMuted }}>{d.label}</span>)}</div>
    </div>
  );
};

// ============================================
// ФОРМА ВИДА ДЕЯТЕЛЬНОСТИ
// ============================================
const ActivityForm = ({ existingActivity, onSave, onClose, onDelete, onArchive }) => {
  const [name, setName] = useState(existingActivity?.name || '');
  const [icon, setIcon] = useState(existingActivity?.icon || '💼');
  const [color, setColor] = useState(existingActivity?.color || ACTIVITY_COLORS[0]);
  const [isFavorite, setIsFavorite] = useState(existingActivity?.isFavorite || false);
  const [dailyGoal, setDailyGoal] = useState(existingActivity?.dailyGoal?.toString() || '');
  const [useWeeklyGoals, setUseWeeklyGoals] = useState(existingActivity?.weeklyGoals ? true : false);
  const [weeklyGoals, setWeeklyGoals] = useState(existingActivity?.weeklyGoals || WEEKDAYS.map(() => ''));
  const inputStyle = { width: '100%', padding: '14px 16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' };
  const handleSave = () => { if (!name.trim()) return; onSave({ id: existingActivity?.id || `activity_${Date.now()}`, name, icon, color, isFavorite, dailyGoal: !useWeeklyGoals && dailyGoal ? parseInt(dailyGoal) : null, weeklyGoals: useWeeklyGoals ? weeklyGoals.map(g => g ? parseInt(g) : null) : null, isArchived: existingActivity?.isArchived || false, createdAt: existingActivity?.createdAt || new Date().toISOString() }); };

  return (
    <div style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Название *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название деятельности" style={inputStyle} /></div>
      <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Иконка</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{ACTIVITY_ICONS.map((i) => <button key={i} onClick={() => setIcon(i)} style={{ width: '44px', height: '44px', background: icon === i ? `${color}30` : COLORS.bg, border: `2px solid ${icon === i ? color : COLORS.border}`, borderRadius: '10px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i}</button>)}</div></div>
      <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Цвет</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{ACTIVITY_COLORS.map((c) => <button key={c} onClick={() => setColor(c)} style={{ width: '36px', height: '36px', background: c, border: `3px solid ${color === c ? COLORS.text : 'transparent'}`, borderRadius: '50%', cursor: 'pointer' }} />)}</div></div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Дневная норма</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button onClick={() => setUseWeeklyGoals(false)} style={{ flex: 1, padding: '10px', background: !useWeeklyGoals ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${!useWeeklyGoals ? COLORS.gold : COLORS.border}`, borderRadius: '8px', color: !useWeeklyGoals ? COLORS.gold : COLORS.textMuted, fontSize: '13px', cursor: 'pointer' }}>Одна норма</button>
          <button onClick={() => setUseWeeklyGoals(true)} style={{ flex: 1, padding: '10px', background: useWeeklyGoals ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${useWeeklyGoals ? COLORS.gold : COLORS.border}`, borderRadius: '8px', color: useWeeklyGoals ? COLORS.gold : COLORS.textMuted, fontSize: '13px', cursor: 'pointer' }}>По дням недели</button>
        </div>
        {!useWeeklyGoals ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} placeholder="0" style={{ ...inputStyle, flex: 1 }} /><span style={{ color: COLORS.textMuted, fontSize: '14px' }}>минут/день</span></div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>{WEEKDAYS.map((day, i) => <div key={i} style={{ textAlign: 'center' }}><span style={{ fontSize: '11px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>{day}</span><input type="number" value={weeklyGoals[i]} onChange={(e) => { const newGoals = [...weeklyGoals]; newGoals[i] = e.target.value; setWeeklyGoals(newGoals); }} placeholder="0" style={{ width: '100%', padding: '8px 4px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '6px', color: COLORS.text, fontSize: '14px', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} /></div>)}</div>}
      </div>
      <button onClick={() => setIsFavorite(!isFavorite)} style={{ width: '100%', padding: '14px', background: isFavorite ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${isFavorite ? COLORS.gold : COLORS.border}`, borderRadius: '12px', color: isFavorite ? COLORS.gold : COLORS.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}><Star style={{ width: '18px', height: '18px', fill: isFavorite ? COLORS.gold : 'none' }} />В избранном</button>
      <div style={{ display: 'flex', gap: '12px' }}>
        {existingActivity && <><button onClick={() => onArchive(existingActivity.id)} style={{ padding: '16px', background: `${COLORS.warning}20`, border: `1px solid ${COLORS.warning}50`, borderRadius: '12px', color: COLORS.warning, cursor: 'pointer' }}><Archive style={{ width: '18px', height: '18px' }} /></button><button onClick={() => onDelete(existingActivity.id)} style={{ padding: '16px', background: `${COLORS.danger}20`, border: `1px solid ${COLORS.danger}50`, borderRadius: '12px', color: COLORS.danger, cursor: 'pointer' }}><Trash2 style={{ width: '18px', height: '18px' }} /></button></>}
        <button onClick={onClose} style={{ flex: 1, padding: '16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '15px', cursor: 'pointer' }}>Отмена</button>
        <button onClick={handleSave} disabled={!name.trim()} style={{ flex: 1, padding: '16px', background: name.trim() ? COLORS.gold : COLORS.bgCard, border: 'none', borderRadius: '12px', color: name.trim() ? COLORS.bg : COLORS.textDark, fontSize: '15px', fontWeight: '600', cursor: name.trim() ? 'pointer' : 'not-allowed' }}>Сохранить</button>
      </div>
    </div>
  );
};

// ============================================
// ФОРМА СЕССИИ
// ============================================
const SessionForm = ({ activities, session, onSave, onClose, onDelete }) => {
  const [activityId, setActivityId] = useState(session?.activityId || activities[0]?.id || '');
  const [startTime, setStartTime] = useState(session?.startAt ? new Date(session.startAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(session?.endAt ? new Date(session.endAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const inputStyle = { width: '100%', padding: '14px 16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' };
  const duration = startTime && endTime ? Math.max(0, Math.floor((new Date(endTime) - new Date(startTime)) / 60000)) : 0;
  const activity = activities.find(a => a.id === activityId);
  const handleSave = () => { if (!activityId || duration <= 0) return; onSave({ id: session?.id || `session_${Date.now()}`, activityId, startAt: new Date(startTime).toISOString(), endAt: new Date(endTime).toISOString(), date: formatDateKey(new Date(startTime)), durationMinutes: duration }); };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Вид деятельности *</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {activities.filter(a => !a.isArchived).map((a) => <button key={a.id} onClick={() => setActivityId(a.id)} style={{ padding: '10px 14px', background: activityId === a.id ? `${a.color}20` : COLORS.bg, border: `1px solid ${activityId === a.id ? a.color : COLORS.border}`, borderRadius: '10px', color: activityId === a.id ? a.color : COLORS.textMuted, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '16px' }}>{a.icon}</span>{a.name}</button>)}
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Начало *</label><input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} /></div>
      <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Конец *</label><input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} /></div>
      <div style={{ padding: '16px', background: COLORS.bg, borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}><p style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>Длительность</p><p style={{ fontSize: '24px', color: activity?.color || COLORS.gold, fontWeight: '600' }}>{formatMinutes(duration)}</p></div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {session && <button onClick={() => onDelete(session.id)} style={{ padding: '16px', background: `${COLORS.danger}20`, border: `1px solid ${COLORS.danger}50`, borderRadius: '12px', color: COLORS.danger, cursor: 'pointer' }}><Trash2 style={{ width: '18px', height: '18px' }} /></button>}
        <button onClick={onClose} style={{ flex: 1, padding: '16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '15px', cursor: 'pointer' }}>Отмена</button>
        <button onClick={handleSave} disabled={!activityId || duration <= 0} style={{ flex: 1, padding: '16px', background: (activityId && duration > 0) ? COLORS.gold : COLORS.bgCard, border: 'none', borderRadius: '12px', color: (activityId && duration > 0) ? COLORS.bg : COLORS.textDark, fontSize: '15px', fontWeight: '600', cursor: (activityId && duration > 0) ? 'pointer' : 'not-allowed' }}>Сохранить</button>
      </div>
    </div>
  );
};

// ============================================
// ПОДТВЕРЖДЕНИЕ ПЕРЕКЛЮЧЕНИЯ
// ============================================
const ConfirmDialog = ({ isOpen, activity, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: COLORS.bgCard, borderRadius: '20px', padding: '24px', maxWidth: '320px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}><AlertCircle style={{ width: '48px', height: '48px', color: COLORS.warning, margin: '0 auto 16px' }} /><h3 style={{ fontSize: '18px', color: COLORS.text, marginBottom: '8px' }}>Завершить текущую?</h3><p style={{ fontSize: '14px', color: COLORS.textMuted }}>Переключиться на "{activity?.name}"?</p></div>
        <div style={{ display: 'flex', gap: '12px' }}><button onClick={onCancel} style={{ flex: 1, padding: '14px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '15px', cursor: 'pointer' }}>Отмена</button><button onClick={onConfirm} style={{ flex: 1, padding: '14px', background: COLORS.gold, border: 'none', borderRadius: '12px', color: COLORS.bg, fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Да</button></div>
      </div>
    </div>
  );
};

// ============================================
// ЭКРАН ПРОДУКТИВНОСТИ
// ============================================
export const ProductivityScreen = ({ data, saveData }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [confirmSwitch, setConfirmSwitch] = useState(null);
  const [dayViewMode, setDayViewMode] = useState('list');
  const [chartPeriod, setChartPeriod] = useState('today');
  const [chartType, setChartType] = useState('bar');
  const [showComparison, setShowComparison] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const timerRef = useRef(null);

  useEffect(() => { if (!data.activities) saveData({ ...data, activities: DEFAULT_ACTIVITIES, sessions: [] }); }, [data, saveData]);

  const activities = data.activities || DEFAULT_ACTIVITIES;
  const sessions = data.sessions || [];
  const activeActivities = activities.filter(a => !a.isArchived);
  const archivedActivities = activities.filter(a => a.isArchived);
  const favoriteActivities = activeActivities.filter(a => a.isFavorite);

  useEffect(() => { if (activeSession) { timerRef.current = setInterval(() => setElapsedTime(Math.floor((Date.now() - new Date(activeSession.startAt).getTime()) / 1000)), 1000); } return () => clearInterval(timerRef.current); }, [activeSession]);
  useEffect(() => { const active = sessions.find(s => !s.endAt); if (active) { setActiveSession(active); setElapsedTime(Math.floor((Date.now() - new Date(active.startAt).getTime()) / 1000)); } }, [sessions]);

  const startSession = (activityId, confirmed = false) => {
    if (activeSession && !confirmed) { setConfirmSwitch(activities.find(a => a.id === activityId)); return; }
    let newSessions = [...sessions];
    if (activeSession) { newSessions = newSessions.map(s => s.id === activeSession.id ? { ...s, endAt: new Date().toISOString(), durationMinutes: Math.floor(elapsedTime / 60) } : s); }
    const newSession = { id: `session_${Date.now()}`, activityId, startAt: new Date().toISOString(), endAt: null, date: formatDateKey(new Date()), durationMinutes: 0 };
    saveData({ ...data, sessions: [...newSessions, newSession] });
    setActiveSession(newSession); setElapsedTime(0); setConfirmSwitch(null);
  };

  const stopSession = () => { if (!activeSession) return; const durationMinutes = Math.floor(elapsedTime / 60); saveData({ ...data, sessions: sessions.map(s => s.id === activeSession.id ? { ...s, endAt: new Date().toISOString(), durationMinutes } : s) }); setActiveSession(null); setElapsedTime(0); };

  const handleSaveActivity = (activity) => { const existingIndex = activities.findIndex(a => a.id === activity.id); const newActivities = existingIndex >= 0 ? activities.map((a, i) => i === existingIndex ? activity : a) : [...activities, activity]; saveData({ ...data, activities: newActivities }); setShowActivityForm(false); setEditingActivity(null); };
  const handleArchiveActivity = (activityId) => { saveData({ ...data, activities: activities.map(a => a.id === activityId ? { ...a, isArchived: true } : a) }); setShowActivityForm(false); setEditingActivity(null); };
  const handleRestoreActivity = (activityId) => { saveData({ ...data, activities: activities.map(a => a.id === activityId ? { ...a, isArchived: false } : a) }); };
  const handleDeleteActivity = (activityId) => { saveData({ ...data, activities: activities.filter(a => a.id !== activityId) }); setShowActivityForm(false); setEditingActivity(null); };
  const handleSaveSession = (session) => { const existingIndex = sessions.findIndex(s => s.id === session.id); const newSessions = existingIndex >= 0 ? sessions.map((s, i) => i === existingIndex ? session : s) : [...sessions, session]; saveData({ ...data, sessions: newSessions }); setShowSessionForm(false); setEditingSession(null); };
  const handleDeleteSession = (sessionId) => { saveData({ ...data, sessions: sessions.filter(s => s.id !== sessionId) }); setShowSessionForm(false); setEditingSession(null); };

  // Статистика
  const dateKey = formatDateKey(selectedDate);
  const daySessions = sessions.filter(s => s.date === dateKey && s.endAt);
  const getDailyGoal = (activity, date) => { if (activity.weeklyGoals) { const dayIndex = getDayOfWeek(date); return activity.weeklyGoals[dayIndex] || 0; } return activity.dailyGoal || 0; };
  const dayStats = activeActivities.map(a => { const activitySessions = daySessions.filter(s => s.activityId === a.id); const totalMinutes = activitySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0); const goal = getDailyGoal(a, selectedDate); return { ...a, totalMinutes, sessions: activitySessions, goal }; }).filter(a => a.totalMinutes > 0 || a.isFavorite);
  const totalDayMinutes = daySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const activeActivity = activeSession ? activities.find(a => a.id === activeSession.activityId) : null;

  // Данные для сравнения периодов
  const getWeekTotal = (weekStart) => { let total = 0; for (let i = 0; i < 7; i++) { const d = addDays(weekStart, i); const key = formatDateKey(d); total += sessions.filter(s => s.date === key && s.endAt).reduce((sum, s) => sum + (s.durationMinutes || 0), 0); } return total; };
  const getMonthTotal = (monthStart) => { let total = 0; const month = monthStart.getMonth(); for (let i = 0; i < 31; i++) { const d = addDays(monthStart, i); if (d.getMonth() !== month) break; const key = formatDateKey(d); total += sessions.filter(s => s.date === key && s.endAt).reduce((sum, s) => sum + (s.durationMinutes || 0), 0); } return total; };

  const currentWeekStart = getWeekStart(selectedDate);
  const prevWeekStart = addDays(currentWeekStart, -7);
  const currentMonthStart = getMonthStart(selectedDate);
  const prevMonthStart = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 1, 1);

  const currentWeekTotal = getWeekTotal(currentWeekStart);
  const prevWeekTotal = getWeekTotal(prevWeekStart);
  const currentMonthTotal = getMonthTotal(currentMonthStart);
  const prevMonthTotal = getMonthTotal(prevMonthStart);

  // Данные для графиков
  const getChartData = () => {
    const now = new Date();
    if (chartPeriod === 'today') { return activeActivities.filter(a => a.isFavorite || daySessions.some(s => s.activityId === a.id)).map(a => { const mins = daySessions.filter(s => s.activityId === a.id).reduce((sum, s) => sum + (s.durationMinutes || 0), 0); return { name: a.name, minutes: mins, color: a.color, label: a.icon, value: mins }; }); }
    else if (chartPeriod === 'week') { const weekStart = getWeekStart(now); return WEEKDAYS.map((day, i) => { const d = addDays(weekStart, i); const key = formatDateKey(d); const mins = sessions.filter(s => s.date === key && s.endAt).reduce((sum, s) => sum + (s.durationMinutes || 0), 0); return { label: day, value: mins, color: COLORS.gold }; }); }
    else if (chartPeriod === 'month') { const weeks = []; const monthStart = getMonthStart(now); for (let w = 0; w < 4; w++) { let mins = 0; for (let d = 0; d < 7; d++) { const date = addDays(monthStart, w * 7 + d); if (date.getMonth() === now.getMonth()) { const key = formatDateKey(date); mins += sessions.filter(s => s.date === key && s.endAt).reduce((sum, s) => sum + (s.durationMinutes || 0), 0); } } weeks.push({ label: `Нед ${w + 1}`, value: mins, color: COLORS.gold }); } return weeks; }
    else if (chartPeriod === 'custom' && customDateFrom && customDateTo) { const from = new Date(customDateFrom); const to = new Date(customDateTo); const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1; return Array.from({ length: Math.min(days, 14) }, (_, i) => { const d = addDays(from, i); const key = formatDateKey(d); const mins = sessions.filter(s => s.date === key && s.endAt).reduce((sum, s) => sum + (s.durationMinutes || 0), 0); return { label: `${d.getDate()}`, value: mins, color: COLORS.gold }; }); }
    return [];
  };

  const chartData = getChartData();
  const pieData = chartPeriod === 'today' ? chartData : activeActivities.map(a => {
    let mins = 0;
    if (chartPeriod === 'week') { const weekStart = getWeekStart(new Date()); for (let i = 0; i < 7; i++) { const d = addDays(weekStart, i); const key = formatDateKey(d); mins += sessions.filter(s => s.date === key && s.activityId === a.id && s.endAt).reduce((sum, s) => sum + (s.durationMinutes || 0), 0); } }
    else if (chartPeriod === 'month') { const monthStart = getMonthStart(new Date()); for (let i = 0; i < 31; i++) { const d = addDays(monthStart, i); if (d.getMonth() === monthStart.getMonth()) { const key = formatDateKey(d); mins += sessions.filter(s => s.date === key && s.activityId === a.id && s.endAt).reduce((sum, s) => sum + (s.durationMinutes || 0), 0); } } }
    return { name: a.name, minutes: mins, color: a.color };
  }).filter(d => d.minutes > 0);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, paddingBottom: '100px' }}>
      <div style={{ padding: '20px', paddingTop: '60px', background: `linear-gradient(to bottom, ${COLORS.bgCard} 0%, ${COLORS.bg} 100%)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: COLORS.text, fontFamily: 'Georgia, serif' }}>Время</h1>
          <button onClick={() => setShowAllActivities(true)} style={{ width: '40px', height: '40px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Settings style={{ width: '18px', height: '18px', color: COLORS.textMuted }} /></button>
        </div>
        {/* Таймер */}
        <div style={{ background: activeSession ? `${activeActivity?.color}20` : COLORS.bg, borderRadius: '20px', padding: '24px', border: `1px solid ${activeSession ? activeActivity?.color : COLORS.border}`, marginBottom: '20px', textAlign: 'center' }}>
          {activeSession ? (<><div style={{ fontSize: '40px', marginBottom: '8px' }}>{activeActivity?.icon}</div><p style={{ fontSize: '14px', color: activeActivity?.color, marginBottom: '12px', fontWeight: '500' }}>{activeActivity?.name}</p><p style={{ fontSize: '48px', fontWeight: '600', color: COLORS.text, fontFamily: 'monospace', letterSpacing: '2px' }}>{formatTime(elapsedTime)}</p><button onClick={stopSession} style={{ marginTop: '20px', padding: '14px 32px', background: COLORS.danger, border: 'none', borderRadius: '12px', color: COLORS.text, fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Square style={{ width: '18px', height: '18px', fill: COLORS.text }} />Стоп</button></>) : (<><Clock style={{ width: '48px', height: '48px', color: COLORS.textDark, marginBottom: '12px' }} /><p style={{ fontSize: '14px', color: COLORS.textMuted }}>Выберите вид деятельности</p></>)}
        </div>
        {/* Избранные */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
          {favoriteActivities.map((a) => <button key={a.id} onClick={() => startSession(a.id)} disabled={activeSession?.activityId === a.id} style={{ padding: '12px 8px', background: activeSession?.activityId === a.id ? `${a.color}30` : COLORS.bg, border: `2px solid ${a.color}`, borderRadius: '14px', cursor: activeSession?.activityId === a.id ? 'default' : 'pointer', opacity: activeSession?.activityId === a.id ? 0.7 : 1 }}><div style={{ fontSize: '24px', marginBottom: '4px', textAlign: 'center' }}>{a.icon}</div><p style={{ fontSize: '10px', color: a.color, fontWeight: '500', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p></button>)}
          <button onClick={() => setShowAllActivities(true)} style={{ padding: '12px 8px', background: COLORS.bg, border: `1px dashed ${COLORS.border}`, borderRadius: '14px', cursor: 'pointer' }}><Plus style={{ width: '24px', height: '24px', color: COLORS.textMuted, margin: '0 auto 4px', display: 'block' }} /><p style={{ fontSize: '10px', color: COLORS.textMuted, textAlign: 'center' }}>Ещё</p></button>
        </div>
      </div>

      {/* Статистика дня */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
          <p style={{ fontSize: '16px', color: COLORS.text, fontWeight: '500' }}>{formatDateDisplay(selectedDate)}</p>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
        </div>

        {/* Переключатель Список/Диаграмма + кнопка добавления */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '4px', background: COLORS.bg, padding: '4px', borderRadius: '10px' }}>
            {DAY_VIEW_MODES.map(v => <button key={v.id} onClick={() => setDayViewMode(v.id)} style={{ flex: 1, padding: '8px', background: dayViewMode === v.id ? COLORS.bgCard : 'transparent', border: 'none', borderRadius: '8px', color: dayViewMode === v.id ? COLORS.gold : COLORS.textMuted, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><v.icon style={{ width: '14px', height: '14px' }} />{v.label}</button>)}
          </div>
          <button onClick={() => { setEditingSession(null); setShowSessionForm(true); }} style={{ padding: '8px 16px', background: COLORS.gold, border: 'none', borderRadius: '10px', color: COLORS.bg, fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus style={{ width: '16px', height: '16px' }} />Запись</button>
        </div>

        <div style={{ padding: '16px', background: COLORS.bgCard, borderRadius: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: COLORS.textMuted }}>Всего за день</span>
          <span style={{ fontSize: '20px', color: COLORS.gold, fontWeight: '600' }}>{formatMinutes(totalDayMinutes)}</span>
        </div>

        {/* Список или Диаграмма */}
        {dayViewMode === 'list' ? (
          dayStats.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 20px' }}><BarChart2 style={{ width: '48px', height: '48px', color: COLORS.textDark, margin: '0 auto 16px' }} /><p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Нет записей за этот день</p></div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {dayStats.sort((a, b) => b.totalMinutes - a.totalMinutes).map((a) => {
              const progress = a.goal ? Math.min(100, (a.totalMinutes / a.goal) * 100) : 0;
              const goalReached = a.goal && a.totalMinutes >= a.goal;
              return (
                <div key={a.id} style={{ padding: '14px', background: COLORS.bgCard, borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: `${a.color}20`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{a.icon}</div>
                    <div style={{ flex: 1 }}><p style={{ fontSize: '14px', color: COLORS.text, fontWeight: '500' }}>{a.name}</p><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}><span style={{ fontSize: '16px', color: a.color, fontWeight: '600' }}>{formatMinutes(a.totalMinutes)}</span>{a.goal > 0 && <span style={{ fontSize: '12px', color: goalReached ? COLORS.success : COLORS.textMuted }}>/ {formatMinutes(a.goal)}</span>}</div></div>
                    {goalReached && <Check style={{ width: '20px', height: '20px', color: COLORS.success }} />}
                  </div>
                  {a.goal > 0 && <div style={{ marginTop: '10px', height: '4px', background: COLORS.bg, borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', background: goalReached ? COLORS.success : a.color, borderRadius: '2px' }} /></div>}
                  {a.sessions.length > 0 && <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>{a.sessions.map((s) => <button key={s.id} onClick={() => { setEditingSession(s); setShowSessionForm(true); }} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: COLORS.bg, borderRadius: '6px', border: 'none', cursor: 'pointer', width: '100%' }}><span style={{ fontSize: '12px', color: COLORS.textMuted }}>{new Date(s.startAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} — {new Date(s.endAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span><span style={{ fontSize: '12px', color: a.color }}>{formatMinutes(s.durationMinutes)}</span></button>)}</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <BarChartComponent data={dayStats.map(a => ({ label: a.icon, value: a.totalMinutes, color: a.color }))} />
          </div>
        )}

        {/* Сравнение периодов */}
        <button onClick={() => setShowComparison(!showComparison)} style={{ width: '100%', padding: '14px', background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GitCompare style={{ width: '18px', height: '18px', color: COLORS.gold }} />Сравнение периодов</span>
          {showComparison ? <ChevronUp style={{ width: '18px', height: '18px', color: COLORS.textMuted }} /> : <ChevronDown style={{ width: '18px', height: '18px', color: COLORS.textMuted }} />}
        </button>

        {showComparison && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <ComparisonView current={currentWeekTotal} previous={prevWeekTotal} currentLabel="Эта неделя" previousLabel="Прошлая" />
            <ComparisonView current={currentMonthTotal} previous={prevMonthTotal} currentLabel="Этот месяц" previousLabel="Прошлый" />
          </div>
        )}

        {/* Графики */}
        <div style={{ background: COLORS.bgCard, borderRadius: '14px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', color: COLORS.text, fontWeight: '500' }}>Статистика</p>
            <div style={{ display: 'flex', gap: '4px' }}>{CHART_TYPES.map((t) => <button key={t.id} onClick={() => setChartType(t.id)} style={{ padding: '6px', background: chartType === t.id ? `${COLORS.gold}20` : 'transparent', border: `1px solid ${chartType === t.id ? COLORS.gold : COLORS.border}`, borderRadius: '6px', cursor: 'pointer' }}><t.icon style={{ width: '16px', height: '16px', color: chartType === t.id ? COLORS.gold : COLORS.textMuted }} /></button>)}</div>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>{STAT_PERIODS.map((p) => <button key={p.id} onClick={() => setChartPeriod(p.id)} style={{ padding: '6px 10px', background: chartPeriod === p.id ? `${COLORS.gold}20` : 'transparent', border: `1px solid ${chartPeriod === p.id ? COLORS.gold : COLORS.border}`, borderRadius: '6px', color: chartPeriod === p.id ? COLORS.gold : COLORS.textMuted, fontSize: '11px', cursor: 'pointer' }}>{p.label}</button>)}</div>
          {chartPeriod === 'custom' && <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}><input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} style={{ flex: 1, padding: '8px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text, fontSize: '12px' }} /><input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} style={{ flex: 1, padding: '8px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text, fontSize: '12px' }} /></div>}
          {chartType === 'bar' && <BarChartComponent data={chartData} />}
          {chartType === 'pie' && <PieChartComponent data={pieData} total={pieData.reduce((s, d) => s + d.minutes, 0)} />}
          {chartType === 'trend' && <TrendChart data={chartData} />}
        </div>
      </div>

      {/* Модалки */}
      <Modal isOpen={showAllActivities} onClose={() => setShowAllActivities(false)} title="Виды деятельности">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activeActivities.map((a) => <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: COLORS.bg, borderRadius: '12px' }}><button onClick={() => { startSession(a.id); setShowAllActivities(false); }} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><div style={{ width: '44px', height: '44px', background: `${a.color}20`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{a.icon}</div><div style={{ textAlign: 'left' }}><p style={{ fontSize: '15px', color: COLORS.text, fontWeight: '500' }}>{a.name}</p>{(a.dailyGoal || a.weeklyGoals) && <p style={{ fontSize: '12px', color: COLORS.textMuted }}>Цель: {a.weeklyGoals ? 'по дням' : formatMinutes(a.dailyGoal)}</p>}</div></button><button onClick={() => { setEditingActivity(a); setShowActivityForm(true); setShowAllActivities(false); }} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><Edit3 style={{ width: '16px', height: '16px', color: COLORS.textMuted }} /></button></div>)}
          <button onClick={() => { setEditingActivity(null); setShowActivityForm(true); setShowAllActivities(false); }} style={{ padding: '14px', background: COLORS.bg, border: `1px dashed ${COLORS.border}`, borderRadius: '12px', color: COLORS.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Plus style={{ width: '18px', height: '18px' }} />Добавить</button>
          {archivedActivities.length > 0 && <button onClick={() => { setShowArchive(true); setShowAllActivities(false); }} style={{ padding: '14px', background: 'transparent', border: 'none', color: COLORS.textMuted, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Archive style={{ width: '16px', height: '16px' }} />Архив ({archivedActivities.length})</button>}
        </div>
      </Modal>

      <Modal isOpen={showArchive} onClose={() => setShowArchive(false)} title="Архив">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {archivedActivities.map((a) => <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: COLORS.bg, borderRadius: '12px', opacity: 0.7 }}><div style={{ width: '44px', height: '44px', background: `${a.color}20`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{a.icon}</div><span style={{ flex: 1, fontSize: '15px', color: COLORS.text }}>{a.name}</span><button onClick={() => handleRestoreActivity(a.id)} style={{ padding: '8px 12px', background: `${COLORS.success}20`, border: 'none', borderRadius: '8px', color: COLORS.success, fontSize: '12px', cursor: 'pointer' }}>Восстановить</button></div>)}
          {archivedActivities.length === 0 && <p style={{ textAlign: 'center', color: COLORS.textMuted, padding: '20px' }}>Архив пуст</p>}
        </div>
      </Modal>

      <Modal isOpen={showActivityForm} onClose={() => { setShowActivityForm(false); setEditingActivity(null); }} title={editingActivity ? 'Редактировать' : 'Новый вид'}><ActivityForm existingActivity={editingActivity} onSave={handleSaveActivity} onClose={() => { setShowActivityForm(false); setEditingActivity(null); }} onDelete={handleDeleteActivity} onArchive={handleArchiveActivity} /></Modal>
      <Modal isOpen={showSessionForm} onClose={() => { setShowSessionForm(false); setEditingSession(null); }} title={editingSession ? 'Редактировать запись' : 'Новая запись'}><SessionForm activities={activeActivities} session={editingSession} onSave={handleSaveSession} onClose={() => { setShowSessionForm(false); setEditingSession(null); }} onDelete={handleDeleteSession} /></Modal>
      <ConfirmDialog isOpen={!!confirmSwitch} activity={confirmSwitch} onConfirm={() => startSession(confirmSwitch.id, true)} onCancel={() => setConfirmSwitch(null)} />
    </div>
  );
};
