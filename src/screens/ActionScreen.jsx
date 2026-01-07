import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Clock, Calendar, List, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Edit3, Check, X, Trash2, Target, Flag, AlertCircle, ThumbsUp, ThumbsDown, Minus, Repeat, Filter, Grid, Inbox, CalendarPlus, Ban } from 'lucide-react';
import { COLORS } from '../constants';
import { Modal } from '../components/ui';

// ============================================
// КОНСТАНТЫ
// ============================================
const ACTION_PRIORITIES = [
  { id: 'can_wait', label: 'Подождёт', color: COLORS.textMuted },
  { id: 'not_important', label: 'Обычная', color: COLORS.textMuted },
  { id: 'important', label: 'Важная', color: COLORS.yellow },
  { id: 'critical', label: 'Критичная', color: COLORS.danger },
  { id: 'urgent', label: 'Срочная', color: COLORS.red },
];

const REPEAT_TYPES = [
  { id: 'none', label: 'Нет' },
  { id: 'daily', label: 'Ежедневно' },
  { id: 'weekly', label: 'Еженедельно' },
  { id: 'monthly', label: 'Ежемесячно' },
  { id: 'weekdays', label: 'По будням' },
  { id: 'custom', label: 'Свой интервал' },
];

const STRENGTH_OPTIONS = [
  { id: 'positive', icon: ThumbsUp, label: 'Полезная', color: COLORS.success },
  { id: 'neutral', icon: Minus, label: 'Нейтральная', color: COLORS.textMuted },
  { id: 'negative', icon: ThumbsDown, label: 'Вредная', color: COLORS.danger },
];

const VIEW_MODES = [
  { id: 'list', icon: List, label: 'Список' },
  { id: 'month', icon: Calendar, label: 'Месяц' },
  { id: 'week', icon: Grid, label: 'Неделя' },
];

// ============================================
// УТИЛИТЫ
// ============================================
const formatDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDateDisplay = (date) => {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (formatDateKey(d) === formatDateKey(today)) return 'Сегодня';
  if (formatDateKey(d) === formatDateKey(tomorrow)) return 'Завтра';
  if (formatDateKey(d) === formatDateKey(yesterday)) return 'Вчера';
  const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
};

const getMonthName = (date) => {
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const getDaysUntil = (deadline) => { if (!deadline) return null; return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)); };

const getWeekDays = (date) => {
  const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff)); const days = [];
  for (let i = 0; i < 7; i++) { const day = new Date(monday); day.setDate(monday.getDate() + i); days.push(day); }
  return days;
};

const getMonthDays = (date) => {
  const year = date.getFullYear(); const month = date.getMonth();
  const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0); const days = [];
  let startDay = firstDay.getDay(); if (startDay === 0) startDay = 7;
  for (let i = 1; i < startDay; i++) days.push({ date: new Date(year, month, 1 - (startDay - i)), isCurrentMonth: false });
  for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  return days;
};

// ============================================
// ФОРМА НАЗНАЧЕНИЯ ДАТЫ
// ============================================
const AssignDateForm = ({ action, onSave, onClose }) => {
  const [date, setDate] = useState(formatDateKey(new Date()));
  const [time, setTime] = useState('');
  const inputStyle = { width: '100%', padding: '14px 16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ padding: '16px', background: COLORS.bg, borderRadius: '12px', marginBottom: '20px' }}>
        <p style={{ fontSize: '14px', color: COLORS.text, fontWeight: '500' }}>{action.title}</p>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Дата *</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Время (опционально)</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onClose} style={{ flex: 1, padding: '16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '15px', cursor: 'pointer' }}>Отмена</button>
        <button onClick={() => onSave({ ...action, date, time: time || null })} style={{ flex: 1, padding: '16px', background: COLORS.gold, border: 'none', borderRadius: '12px', color: COLORS.bg, fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Назначить</button>
      </div>
    </div>
  );
};

// ============================================
// ФОРМА ДЕЙСТВИЯ
// ============================================
const ActionForm = ({ steps, goals, spheres, selectedDate, existingAction, onSave, onClose, onDelete }) => {
  const [title, setTitle] = useState(existingAction?.title || '');
  const [description, setDescription] = useState(existingAction?.description || '');
  const [date, setDate] = useState(existingAction?.date || formatDateKey(selectedDate));
  const [time, setTime] = useState(existingAction?.time || '');
  const [deadline, setDeadline] = useState(existingAction?.deadline || '');
  const [priority, setPriority] = useState(existingAction?.priority || 'not_important');
  const [strength, setStrength] = useState(existingAction?.strength || 'neutral');
  const [stepId, setStepId] = useState(existingAction?.stepId || '');
  const [sphereId, setSphereId] = useState(existingAction?.sphereId || '');
  const [repeatType, setRepeatType] = useState(existingAction?.repeatType || 'none');
  const [repeatInterval, setRepeatInterval] = useState(existingAction?.repeatInterval || 1);
  const [subtasks, setSubtasks] = useState(existingAction?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [showStepPicker, setShowStepPicker] = useState(false);

  const inputStyle = { width: '100%', padding: '14px 16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };

  const selectedStep = steps.find(s => s.id === stepId);
  const selectedGoal = selectedStep ? goals.find(g => g.id === selectedStep.goalId) : null;
  const autoSphereId = selectedGoal?.sphereId || sphereId;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: existingAction?.id || `action_${Date.now()}`, title, description, date: date || null, time: time || null, deadline: deadline || null,
      priority, strength, stepId: stepId || null, sphereId: autoSphereId || null, repeatType, repeatInterval: repeatType === 'custom' ? repeatInterval : null,
      subtasks, status: existingAction?.status || 'active', sortOrder: existingAction?.sortOrder || Date.now(), createdAt: existingAction?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <div style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Название *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что нужно сделать?" style={inputStyle} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Описание</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Подробности..." rows={2} style={{ ...inputStyle, resize: 'none' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div><label style={labelStyle}>Дата</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Время</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Дедлайн</label>
        <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Приоритет</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {ACTION_PRIORITIES.map((p) => <button key={p.id} onClick={() => setPriority(p.id)} style={{ padding: '8px 12px', background: priority === p.id ? `${p.color}20` : COLORS.bg, border: `1px solid ${priority === p.id ? p.color : COLORS.border}`, borderRadius: '8px', color: priority === p.id ? p.color : COLORS.textMuted, fontSize: '12px', cursor: 'pointer' }}>{p.label}</button>)}
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Сила задачи</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {STRENGTH_OPTIONS.map((s) => <button key={s.id} onClick={() => setStrength(s.id)} style={{ flex: 1, padding: '12px', background: strength === s.id ? `${s.color}20` : COLORS.bg, border: `1px solid ${strength === s.id ? s.color : COLORS.border}`, borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}><s.icon style={{ width: '20px', height: '20px', color: strength === s.id ? s.color : COLORS.textMuted }} /><span style={{ fontSize: '11px', color: strength === s.id ? s.color : COLORS.textMuted }}>{s.label}</span></button>)}
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Привязка к рубежу/цели</label>
        <button onClick={() => setShowStepPicker(!showStepPicker)} style={{ width: '100%', padding: '14px 16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: stepId ? COLORS.text : COLORS.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stepId ? `${selectedStep?.title}` : 'Без привязки'}</span>
          <ChevronDown style={{ width: '16px', height: '16px', flexShrink: 0, transform: showStepPicker ? 'rotate(180deg)' : 'none' }} />
        </button>
        {showStepPicker && (
          <div style={{ marginTop: '8px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', maxHeight: '200px', overflowY: 'auto' }}>
            <button onClick={() => { setStepId(''); setShowStepPicker(false); }} style={{ width: '100%', padding: '12px 16px', background: !stepId ? `${COLORS.gold}15` : 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.border}`, color: !stepId ? COLORS.gold : COLORS.textMuted, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>Без привязки</button>
            {steps.map((step) => {
              const goal = goals.find(g => g.id === step.goalId);
              return <button key={step.id} onClick={() => { setStepId(step.id); setShowStepPicker(false); }} style={{ width: '100%', padding: '12px 16px', background: stepId === step.id ? `${COLORS.gold}15` : 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.border}`, color: stepId === step.id ? COLORS.gold : COLORS.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}><div>{step.title}</div>{goal && <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '2px' }}>→ {goal.title}</div>}</button>;
            })}
          </div>
        )}
      </div>
      {spheres.length > 0 && !stepId && (
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Сфера жизни</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {spheres.map((s) => <button key={s.id} onClick={() => setSphereId(s.id)} style={{ padding: '8px 12px', background: sphereId === s.id ? `${s.color}20` : COLORS.bg, border: `1px solid ${sphereId === s.id ? s.color : COLORS.border}`, borderRadius: '20px', color: sphereId === s.id ? s.color : COLORS.textMuted, fontSize: '12px', cursor: 'pointer' }}>{s.icon} {s.name}</button>)}
          </div>
        </div>
      )}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Повтор</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {REPEAT_TYPES.map((r) => <button key={r.id} onClick={() => setRepeatType(r.id)} style={{ padding: '8px 12px', background: repeatType === r.id ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${repeatType === r.id ? COLORS.gold : COLORS.border}`, borderRadius: '8px', color: repeatType === r.id ? COLORS.gold : COLORS.textMuted, fontSize: '12px', cursor: 'pointer' }}>{r.label}</button>)}
        </div>
        {repeatType === 'custom' && <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '13px', color: COLORS.textMuted }}>Каждые</span><input type="number" value={repeatInterval} onChange={(e) => setRepeatInterval(parseInt(e.target.value) || 1)} min="1" style={{ ...inputStyle, width: '60px', padding: '8px 12px', textAlign: 'center' }} /><span style={{ fontSize: '13px', color: COLORS.textMuted }}>дней</span></div>}
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Подзадачи</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {subtasks.map((sub) => (
            <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: COLORS.bg, borderRadius: '10px' }}>
              <button onClick={() => setSubtasks(subtasks.map(s => s.id === sub.id ? { ...s, isCompleted: !s.isCompleted } : s))} style={{ width: '20px', height: '20px', background: sub.isCompleted ? COLORS.success : 'transparent', border: `2px solid ${sub.isCompleted ? COLORS.success : COLORS.textDark}`, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>{sub.isCompleted && <Check style={{ width: '12px', height: '12px', color: COLORS.bg }} />}</button>
              <span style={{ flex: 1, fontSize: '14px', color: sub.isCompleted ? COLORS.textMuted : COLORS.text, textDecoration: sub.isCompleted ? 'line-through' : 'none' }}>{sub.title}</span>
              <button onClick={() => setSubtasks(subtasks.filter(s => s.id !== sub.id))} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '14px', height: '14px', color: COLORS.textMuted }} /></button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Добавить подзадачу..." onKeyPress={(e) => { if (e.key === 'Enter' && newSubtask.trim()) { setSubtasks([...subtasks, { id: `st_${Date.now()}`, title: newSubtask.trim(), isCompleted: false }]); setNewSubtask(''); }}} style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '14px' }} />
            <button onClick={() => { if (newSubtask.trim()) { setSubtasks([...subtasks, { id: `st_${Date.now()}`, title: newSubtask.trim(), isCompleted: false }]); setNewSubtask(''); }}} disabled={!newSubtask.trim()} style={{ padding: '10px 16px', background: newSubtask.trim() ? COLORS.gold : COLORS.bgCard, border: 'none', borderRadius: '10px', color: newSubtask.trim() ? COLORS.bg : COLORS.textDark, cursor: newSubtask.trim() ? 'pointer' : 'not-allowed' }}><Plus style={{ width: '18px', height: '18px' }} /></button>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {existingAction && <button onClick={() => onDelete(existingAction.id)} style={{ padding: '16px', background: `${COLORS.danger}20`, border: `1px solid ${COLORS.danger}50`, borderRadius: '12px', color: COLORS.danger, cursor: 'pointer' }}><Trash2 style={{ width: '18px', height: '18px' }} /></button>}
        <button onClick={onClose} style={{ flex: 1, padding: '16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '15px', cursor: 'pointer' }}>Отмена</button>
        <button onClick={handleSave} disabled={!title.trim()} style={{ flex: 1, padding: '16px', background: title.trim() ? COLORS.gold : COLORS.bgCard, border: 'none', borderRadius: '12px', color: title.trim() ? COLORS.bg : COLORS.textDark, fontSize: '15px', fontWeight: '600', cursor: title.trim() ? 'pointer' : 'not-allowed' }}>Сохранить</button>
      </div>
    </div>
  );
};

// ============================================
// КАРТОЧКА ДЕЙСТВИЯ
// ============================================
const ActionCard = ({ action, step, goal, sphere, isCompleted, onToggle, onEdit, onDelete, onCancel, onAssignDate }) => {
  const [expanded, setExpanded] = useState(false);
  const priority = ACTION_PRIORITIES.find(p => p.id === action.priority) || ACTION_PRIORITIES[1];
  const strengthOption = STRENGTH_OPTIONS.find(s => s.id === action.strength);
  const completedSubtasks = action.subtasks?.filter(s => s.isCompleted).length || 0;
  const totalSubtasks = action.subtasks?.length || 0;
  const daysUntilDeadline = getDaysUntil(action.deadline);

  return (
    <div style={{ background: isCompleted ? `${COLORS.success}10` : COLORS.bgCard, borderRadius: '12px', border: `1px solid ${isCompleted ? `${COLORS.success}30` : priority.color !== COLORS.textMuted ? `${priority.color}40` : COLORS.border}`, marginBottom: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <button onClick={onToggle} disabled={isCompleted} style={{ width: '22px', height: '22px', background: isCompleted ? COLORS.success : 'transparent', border: `2px solid ${isCompleted ? COLORS.success : COLORS.textDark}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isCompleted ? 'default' : 'pointer', flexShrink: 0, marginTop: '2px' }}>{isCompleted && <Check style={{ width: '14px', height: '14px', color: COLORS.bg }} />}</button>
        <div style={{ flex: 1, minWidth: 0 }} onClick={() => setExpanded(!expanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', cursor: 'pointer' }}>
            <span style={{ fontSize: '15px', color: isCompleted ? COLORS.textMuted : COLORS.text, fontWeight: '500', textDecoration: isCompleted ? 'line-through' : 'none' }}>{action.title}</span>
            {priority.color !== COLORS.textMuted && <span style={{ fontSize: '10px', padding: '2px 6px', background: `${priority.color}20`, color: priority.color, borderRadius: '4px' }}>{priority.label}</span>}
            {strengthOption && strengthOption.id !== 'neutral' && <strengthOption.icon style={{ width: '14px', height: '14px', color: strengthOption.color }} />}
            {action.repeatType && action.repeatType !== 'none' && <Repeat style={{ width: '12px', height: '12px', color: COLORS.textMuted }} />}
            {sphere && <span style={{ fontSize: '10px', padding: '2px 6px', background: `${sphere.color}20`, color: sphere.color, borderRadius: '10px' }}>{sphere.icon}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
            {action.time && <span style={{ fontSize: '12px', color: COLORS.gold, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '12px', height: '12px' }} />{action.time}</span>}
            {daysUntilDeadline !== null && <span style={{ fontSize: '11px', color: daysUntilDeadline < 0 ? COLORS.danger : daysUntilDeadline <= 1 ? COLORS.warning : COLORS.textMuted }}>{daysUntilDeadline < 0 ? `Просрочено ${Math.abs(daysUntilDeadline)}д` : daysUntilDeadline === 0 ? 'Сегодня!' : `Осталось ${daysUntilDeadline}д`}</span>}
            {totalSubtasks > 0 && <span style={{ fontSize: '11px', color: completedSubtasks === totalSubtasks ? COLORS.success : COLORS.textMuted }}>{completedSubtasks}/{totalSubtasks}</span>}
            {step && <span style={{ fontSize: '10px', color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '3px' }}><Flag style={{ width: '10px', height: '10px' }} />{step.title.slice(0, 15)}...</span>}
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>{expanded ? <ChevronUp style={{ width: '18px', height: '18px', color: COLORS.textMuted }} /> : <ChevronDown style={{ width: '18px', height: '18px', color: COLORS.textMuted }} />}</button>
      </div>
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${COLORS.border}`, marginTop: '-4px', paddingTop: '14px' }}>
          {action.description && <p style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '12px' }}>{action.description}</p>}
          <div style={{ padding: '10px 12px', background: COLORS.bg, borderRadius: '8px', marginBottom: '12px' }}>
            {step && goal ? (<><p style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>Привязка:</p><p style={{ fontSize: '13px', color: COLORS.text }}><Flag style={{ width: '12px', height: '12px', color: COLORS.gold, marginRight: '4px' }} />{step.title}</p><p style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '2px' }}><Target style={{ width: '11px', height: '11px', marginRight: '4px' }} />{goal.title}</p></>) : (<p style={{ fontSize: '12px', color: COLORS.textMuted }}>Без привязки к целям</p>)}
          </div>
          {totalSubtasks > 0 && (<div style={{ marginBottom: '12px' }}><p style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '8px' }}>Подзадачи:</p>{action.subtasks.map((sub) => (<div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}><div style={{ width: '14px', height: '14px', background: sub.isCompleted ? COLORS.success : 'transparent', border: `2px solid ${sub.isCompleted ? COLORS.success : COLORS.textDark}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sub.isCompleted && <Check style={{ width: '10px', height: '10px', color: COLORS.bg }} />}</div><span style={{ fontSize: '13px', color: sub.isCompleted ? COLORS.textMuted : COLORS.text, textDecoration: sub.isCompleted ? 'line-through' : 'none' }}>{sub.title}</span></div>))}</div>)}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!action.date && <button onClick={() => onAssignDate(action)} style={{ flex: 1, padding: '10px', background: `${COLORS.gold}15`, border: `1px solid ${COLORS.gold}30`, borderRadius: '8px', color: COLORS.gold, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CalendarPlus style={{ width: '14px', height: '14px' }} />Назначить дату</button>}
            {!isCompleted && (<>
              <button onClick={onEdit} style={{ flex: 1, padding: '10px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.textMuted, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Edit3 style={{ width: '14px', height: '14px' }} />Изменить</button>
              <button onClick={() => onCancel(action.id)} style={{ padding: '10px', background: `${COLORS.warning}15`, border: `1px solid ${COLORS.warning}30`, borderRadius: '8px', color: COLORS.warning, fontSize: '12px', cursor: 'pointer' }}><Ban style={{ width: '14px', height: '14px' }} /></button>
              <button onClick={() => onDelete(action.id)} style={{ padding: '10px', background: `${COLORS.danger}15`, border: `1px solid ${COLORS.danger}30`, borderRadius: '8px', color: COLORS.danger, fontSize: '12px', cursor: 'pointer' }}><Trash2 style={{ width: '14px', height: '14px' }} /></button>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// КАЛЕНДАРЬ МЕСЯЦ
// ============================================
const MonthView = ({ date, actions, onSelectDate, onChangeMonth }) => {
  const days = getMonthDays(date); const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']; const today = formatDateKey(new Date());
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={() => onChangeMonth(-1)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
        <span style={{ fontSize: '16px', fontWeight: '500', color: COLORS.text }}>{getMonthName(date)}</span>
        <button onClick={() => onChangeMonth(1)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {weekDays.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: COLORS.textMuted, padding: '8px 0' }}>{d}</div>)}
        {days.map((d, i) => { const key = formatDateKey(d.date); const hasActions = actions.filter(a => a.date === key).length > 0; const isToday = key === today;
          return <button key={i} onClick={() => onSelectDate(d.date)} style={{ aspectRatio: '1', padding: '4px', background: isToday ? `${COLORS.gold}20` : 'transparent', border: isToday ? `1px solid ${COLORS.gold}` : '1px solid transparent', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: d.isCurrentMonth ? 1 : 0.3 }}><span style={{ fontSize: '13px', color: isToday ? COLORS.gold : COLORS.text }}>{d.date.getDate()}</span>{hasActions && <div style={{ width: '4px', height: '4px', background: COLORS.gold, borderRadius: '50%', marginTop: '2px' }} />}</button>;
        })}
      </div>
    </div>
  );
};

// ============================================
// КАЛЕНДАРЬ НЕДЕЛЯ
// ============================================
const WeekView = ({ date, actions, onSelectDate, onChangeWeek }) => {
  const days = getWeekDays(date); const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']; const today = formatDateKey(new Date());
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={() => onChangeWeek(-7)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
        <span style={{ fontSize: '14px', color: COLORS.text }}>{formatDateDisplay(days[0])} — {formatDateDisplay(days[6])}</span>
        <button onClick={() => onChangeWeek(7)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {days.map((d, i) => { const key = formatDateKey(d); const dayActions = actions.filter(a => a.date === key && a.status === 'active'); const isToday = key === today;
          return <div key={i} style={{ background: COLORS.bgCard, borderRadius: '10px', padding: '8px', border: isToday ? `1px solid ${COLORS.gold}` : `1px solid ${COLORS.border}`, minHeight: '100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}><span style={{ fontSize: '10px', color: COLORS.textMuted }}>{weekDays[i]}</span><p style={{ fontSize: '16px', fontWeight: '500', color: isToday ? COLORS.gold : COLORS.text }}>{d.getDate()}</p></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>{dayActions.slice(0, 3).map((a) => <button key={a.id} onClick={() => onSelectDate(d)} style={{ padding: '4px 6px', background: COLORS.bg, borderRadius: '4px', border: 'none', cursor: 'pointer', textAlign: 'left' }}><span style={{ fontSize: '10px', color: COLORS.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span></button>)}{dayActions.length > 3 && <span style={{ fontSize: '10px', color: COLORS.textMuted, textAlign: 'center' }}>+{dayActions.length - 3}</span>}</div>
          </div>;
        })}
      </div>
    </div>
  );
};

// ============================================
// ЭКРАН ДЕЙСТВИЯ
// ============================================
export const ActionScreen = ({ data, saveData }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [filterGoalId, setFilterGoalId] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showUndated, setShowUndated] = useState(false);
  const [showAssignDate, setShowAssignDate] = useState(false);
  const [assigningAction, setAssigningAction] = useState(null);

  useEffect(() => { if (!data.actions) saveData({ ...data, actions: [] }); }, [data, saveData]);

  const actions = data.actions || []; const steps = data.steps || []; const goals = data.goals || []; const spheres = data.spheres || [];
  const dateKey = formatDateKey(selectedDate);
  const filteredActions = filterGoalId === 'all' ? actions : actions.filter(a => { const step = steps.find(s => s.id === a.stepId); return step?.goalId === filterGoalId; });
  const todayActions = filteredActions.filter(a => a.date === dateKey && a.status !== 'cancelled');
  const activeActions = todayActions.filter(a => a.status === 'active');
  const completedActions = todayActions.filter(a => a.status === 'done');
  const withTime = activeActions.filter(a => a.time).sort((a, b) => a.time.localeCompare(b.time));
  const withoutTime = activeActions.filter(a => !a.time).sort((a, b) => a.sortOrder - b.sortOrder);
  const undatedActions = filteredActions.filter(a => !a.date && a.status === 'active');

  const handleSaveAction = (actionData) => {
    const existingIndex = actions.findIndex(a => a.id === actionData.id);
    let newActions = existingIndex >= 0 ? actions.map((a, i) => i === existingIndex ? { ...actionData, updatedAt: new Date().toISOString() } : a) : [...actions, actionData];
    saveData({ ...data, actions: newActions });
    setShowForm(false); setEditingAction(null); setShowAssignDate(false); setAssigningAction(null);
  };
  const handleToggleAction = (action) => { if (action.status === 'done') return; saveData({ ...data, actions: actions.map(a => a.id === action.id ? { ...a, status: 'done', completedAt: new Date().toISOString() } : a) }); };
  const handleDeleteAction = (actionId) => { saveData({ ...data, actions: actions.filter(a => a.id !== actionId) }); setShowForm(false); setEditingAction(null); };
  const handleCancelAction = (actionId) => { saveData({ ...data, actions: actions.map(a => a.id === actionId ? { ...a, status: 'cancelled' } : a) }); };
  const getStepGoalSphere = (action) => { const step = steps.find(s => s.id === action.stepId); const goal = step ? goals.find(g => g.id === step.goalId) : null; const sphere = action.sphereId ? spheres.find(s => s.id === action.sphereId) : (goal?.sphereId ? spheres.find(s => s.id === goal.sphereId) : null); return { step, goal, sphere }; };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, paddingBottom: '100px' }}>
      <div style={{ padding: '20px', paddingTop: '60px', background: `linear-gradient(to bottom, ${COLORS.bgCard} 0%, ${COLORS.bg} 100%)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: COLORS.text, fontFamily: 'Georgia, serif' }}>Действия</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowUndated(true)} style={{ position: 'relative', padding: '8px 12px', background: undatedActions.length > 0 ? `${COLORS.warning}20` : COLORS.bg, border: `1px solid ${undatedActions.length > 0 ? COLORS.warning : COLORS.border}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <Inbox style={{ width: '16px', height: '16px', color: undatedActions.length > 0 ? COLORS.warning : COLORS.textMuted }} />
              {undatedActions.length > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', minWidth: '18px', height: '18px', background: COLORS.warning, borderRadius: '9px', fontSize: '11px', fontWeight: '600', color: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{undatedActions.length}</span>}
            </button>
            <button onClick={() => setShowFilter(!showFilter)} style={{ padding: '8px 12px', background: filterGoalId !== 'all' ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${filterGoalId !== 'all' ? COLORS.gold : COLORS.border}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Filter style={{ width: '16px', height: '16px', color: filterGoalId !== 'all' ? COLORS.gold : COLORS.textMuted }} /></button>
          </div>
        </div>
        {showFilter && (<div style={{ marginBottom: '16px', padding: '12px', background: COLORS.bg, borderRadius: '12px', border: `1px solid ${COLORS.border}` }}><p style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Фильтр по цели</p><div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}><button onClick={() => setFilterGoalId('all')} style={{ padding: '6px 12px', background: filterGoalId === 'all' ? `${COLORS.gold}20` : 'transparent', border: `1px solid ${filterGoalId === 'all' ? COLORS.gold : COLORS.border}`, borderRadius: '16px', fontSize: '12px', color: filterGoalId === 'all' ? COLORS.gold : COLORS.textMuted, cursor: 'pointer' }}>Все</button>{goals.filter(g => g.status === 'active').map(g => <button key={g.id} onClick={() => setFilterGoalId(g.id)} style={{ padding: '6px 12px', background: filterGoalId === g.id ? `${COLORS.gold}20` : 'transparent', border: `1px solid ${filterGoalId === g.id ? COLORS.gold : COLORS.border}`, borderRadius: '16px', fontSize: '12px', color: filterGoalId === g.id ? COLORS.gold : COLORS.text, cursor: 'pointer' }}>{g.title}</button>)}</div></div>)}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: COLORS.bg, padding: '4px', borderRadius: '10px' }}>{VIEW_MODES.map(v => <button key={v.id} onClick={() => setViewMode(v.id)} style={{ flex: 1, padding: '10px', background: viewMode === v.id ? COLORS.bgCard : 'transparent', border: 'none', borderRadius: '8px', color: viewMode === v.id ? COLORS.gold : COLORS.textMuted, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><v.icon style={{ width: '16px', height: '16px' }} />{v.label}</button>)}</div>
        {viewMode === 'list' && (<>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} style={{ width: '40px', height: '40px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
            <div style={{ textAlign: 'center' }}><p style={{ fontSize: '18px', fontWeight: '500', color: COLORS.text }}>{formatDateDisplay(selectedDate)}</p><button onClick={() => setSelectedDate(new Date())} style={{ background: 'none', border: 'none', color: COLORS.gold, fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>Сегодня</button></div>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} style={{ width: '40px', height: '40px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, padding: '12px', background: COLORS.bg, borderRadius: '10px', textAlign: 'center', border: `1px solid ${COLORS.border}` }}><p style={{ fontSize: '20px', fontWeight: '600', color: COLORS.gold }}>{completedActions.length}</p><p style={{ fontSize: '11px', color: COLORS.textMuted }}>Выполнено</p></div>
            <div style={{ flex: 1, padding: '12px', background: COLORS.bg, borderRadius: '10px', textAlign: 'center', border: `1px solid ${COLORS.border}` }}><p style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text }}>{activeActions.length}</p><p style={{ fontSize: '11px', color: COLORS.textMuted }}>Осталось</p></div>
          </div>
        </>)}
      </div>
      <div style={{ padding: '20px' }}>
        {viewMode === 'month' && <MonthView date={selectedDate} actions={filteredActions} onSelectDate={(d) => { setSelectedDate(d); setViewMode('list'); }} onChangeMonth={(dir) => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + dir, 1))} />}
        {viewMode === 'week' && <WeekView date={selectedDate} actions={filteredActions} onSelectDate={(d) => { setSelectedDate(d); setViewMode('list'); }} onChangeWeek={(days) => setSelectedDate(addDays(selectedDate, days))} />}
        {viewMode === 'list' && (<>
          {withTime.length > 0 && <div style={{ marginBottom: '24px' }}><p style={{ fontSize: '12px', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock style={{ width: '14px', height: '14px' }} />Запланировано</p>{withTime.map((action) => { const { step, goal, sphere } = getStepGoalSphere(action); return <ActionCard key={action.id} action={action} step={step} goal={goal} sphere={sphere} isCompleted={false} onToggle={() => handleToggleAction(action)} onEdit={() => { setEditingAction(action); setShowForm(true); }} onDelete={handleDeleteAction} onCancel={handleCancelAction} onAssignDate={(a) => { setAssigningAction(a); setShowAssignDate(true); }} />; })}</div>}
          {withoutTime.length > 0 && <div style={{ marginBottom: '24px' }}><p style={{ fontSize: '12px', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '12px' }}>Задачи на день</p>{withoutTime.map((action) => { const { step, goal, sphere } = getStepGoalSphere(action); return <ActionCard key={action.id} action={action} step={step} goal={goal} sphere={sphere} isCompleted={false} onToggle={() => handleToggleAction(action)} onEdit={() => { setEditingAction(action); setShowForm(true); }} onDelete={handleDeleteAction} onCancel={handleCancelAction} onAssignDate={(a) => { setAssigningAction(a); setShowAssignDate(true); }} />; })}</div>}
          {completedActions.length > 0 && <div style={{ marginBottom: '24px' }}><p style={{ fontSize: '12px', color: COLORS.success, textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Check style={{ width: '14px', height: '14px' }} />Выполнено</p>{completedActions.map((action) => { const { step, goal, sphere } = getStepGoalSphere(action); return <ActionCard key={action.id} action={action} step={step} goal={goal} sphere={sphere} isCompleted={true} onToggle={() => {}} onEdit={() => {}} onDelete={handleDeleteAction} onCancel={handleCancelAction} onAssignDate={() => {}} />; })}</div>}
          {activeActions.length === 0 && completedActions.length === 0 && <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ width: '80px', height: '80px', background: `radial-gradient(circle, ${COLORS.gold}15 0%, transparent 70%)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><CheckSquare style={{ width: '40px', height: '40px', color: COLORS.gold, opacity: 0.5 }} /></div><h3 style={{ color: COLORS.text, fontSize: '18px', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>Нет задач</h3><p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Добавьте действие на этот день</p></div>}
        </>)}
      </div>
      <button onClick={() => { setEditingAction(null); setShowForm(true); }} style={{ position: 'fixed', right: '20px', bottom: '100px', width: '56px', height: '56px', background: `linear-gradient(135deg, ${COLORS.goldDark} 0%, ${COLORS.gold} 100%)`, border: 'none', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 8px 24px ${COLORS.gold}40` }}><Plus style={{ width: '24px', height: '24px', color: COLORS.bg }} /></button>
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingAction(null); }} title={editingAction ? 'Редактировать' : 'Новое действие'}><ActionForm steps={steps} goals={goals} spheres={spheres} selectedDate={selectedDate} existingAction={editingAction} onSave={handleSaveAction} onClose={() => { setShowForm(false); setEditingAction(null); }} onDelete={handleDeleteAction} /></Modal>
      <Modal isOpen={showUndated} onClose={() => setShowUndated(false)} title={`Без даты (${undatedActions.length})`}><div>{undatedActions.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 20px' }}><Inbox style={{ width: '48px', height: '48px', color: COLORS.textDark, margin: '0 auto 16px' }} /><p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Все задачи распределены</p></div> : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{undatedActions.map((action) => { const { step, goal, sphere } = getStepGoalSphere(action); return <ActionCard key={action.id} action={action} step={step} goal={goal} sphere={sphere} isCompleted={false} onToggle={() => handleToggleAction(action)} onEdit={() => { setEditingAction(action); setShowForm(true); setShowUndated(false); }} onDelete={handleDeleteAction} onCancel={handleCancelAction} onAssignDate={(a) => { setAssigningAction(a); setShowAssignDate(true); setShowUndated(false); }} />; })}</div>}</div></Modal>
      <Modal isOpen={showAssignDate} onClose={() => { setShowAssignDate(false); setAssigningAction(null); }} title="Назначить дату">{assigningAction && <AssignDateForm action={assigningAction} onSave={handleSaveAction} onClose={() => { setShowAssignDate(false); setAssigningAction(null); }} />}</Modal>
    </div>
  );
};
