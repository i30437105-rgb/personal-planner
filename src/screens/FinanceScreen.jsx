import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Edit3, Trash2, PieChart, BarChart2, Settings, Wallet, Target, Archive, X, Check, Filter, Calendar, RefreshCw } from 'lucide-react';
import { COLORS } from '../constants';
import { Modal } from '../components/ui';

// ============================================
// КОНСТАНТЫ
// ============================================
const CATEGORY_ICONS = ['🛒', '🏠', '🚗', '💊', '🎓', '🎮', '✈️', '👔', '💼', '📱', '🍽️', '☕', '🎁', '💰', '📈', '🏦', '💳', '🛠️', '📦', '⭐'];
const CATEGORY_COLORS = ['#4A90D9', '#27AE60', '#E67E22', '#9B59B6', '#E91E63', '#00BCD4', '#FF5722', '#607D8B', '#795548', '#3F51B5'];
const FUND_ICONS = ['🛡️', '🎯', '🏠', '🚗', '✈️', '💊', '🎓', '👶', '💰', '📈', '🎁', '⚡'];
const PERIODS = [{ id: 'month', label: 'Месяц' }, { id: 'quarter', label: 'Квартал' }, { id: 'year', label: 'Год' }];
const ANALYTICS_PERIODS = [{ id: 'month', label: 'Месяц' }, { id: 'quarter', label: 'Квартал' }, { id: 'year', label: 'Год' }, { id: 'custom', label: 'Свой' }];
const QUARTERS = [{ id: 1, label: 'Q1 (Янв-Мар)' }, { id: 2, label: 'Q2 (Апр-Июн)' }, { id: 3, label: 'Q3 (Июл-Сен)' }, { id: 4, label: 'Q4 (Окт-Дек)' }];

const DEFAULT_INCOME_CATEGORIES = [{ id: 'cat_salary', name: 'Зарплата', type: 'income', icon: '💼', color: '#27AE60' }, { id: 'cat_freelance', name: 'Фриланс', type: 'income', icon: '💻', color: '#4A90D9' }];
const DEFAULT_EXPENSE_CATEGORIES = [{ id: 'cat_food', name: 'Продукты', type: 'expense', icon: '🛒', color: '#E67E22' }, { id: 'cat_transport', name: 'Транспорт', type: 'expense', icon: '🚗', color: '#9B59B6' }, { id: 'cat_health', name: 'Здоровье', type: 'expense', icon: '💊', color: '#E91E63' }];
const DEFAULT_FUNDS = [{ id: 'fund_safety', name: 'Подушка', icon: '🛡️', balance: 0, ruleType: 'percent', ruleValue: 10 }, { id: 'fund_invest', name: 'Инвестиции', icon: '📈', balance: 0, ruleType: 'percent', ruleValue: 20 }];

// ============================================
// УТИЛИТЫ
// ============================================
const formatMoney = (amount) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount || 0);
const formatDateKey = (date) => { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const getMonthName = (date) => { const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']; return `${months[date.getMonth()]} ${date.getFullYear()}`; };
const getQuarterName = (date) => { const q = Math.floor(date.getMonth() / 3) + 1; return `Q${q} ${date.getFullYear()}`; };
const getYearName = (date) => `${date.getFullYear()} год`;
const getQuarterMonths = (quarter, year) => { const start = (quarter - 1) * 3; return [new Date(year, start, 1), new Date(year, start + 1, 1), new Date(year, start + 2, 1)]; };

const isInPeriod = (dateStr, period, currentDate) => {
  const d = new Date(dateStr);
  if (period === 'month') return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  if (period === 'quarter') { const q1 = Math.floor(d.getMonth() / 3); const q2 = Math.floor(currentDate.getMonth() / 3); return q1 === q2 && d.getFullYear() === currentDate.getFullYear(); }
  if (period === 'year') return d.getFullYear() === currentDate.getFullYear();
  return true;
};

const isInDateRange = (dateStr, from, to) => {
  if (!from || !to) return true;
  const d = new Date(dateStr);
  return d >= new Date(from) && d <= new Date(to);
};

const navigatePeriod = (date, period, direction) => {
  const d = new Date(date);
  if (period === 'month') d.setMonth(d.getMonth() + direction);
  else if (period === 'quarter') d.setMonth(d.getMonth() + direction * 3);
  else if (period === 'year') d.setFullYear(d.getFullYear() + direction);
  return d;
};

const getPeriodLabel = (date, period) => { if (period === 'month') return getMonthName(date); if (period === 'quarter') return getQuarterName(date); return getYearName(date); };

// ============================================
// КРУГОВАЯ ДИАГРАММА
// ============================================
const PieChartComponent = ({ data, total }) => {
  if (!data.length || total === 0) return <div style={{ textAlign: 'center', padding: '20px', color: COLORS.textMuted }}>Нет данных</div>;
  let cumulative = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
        <svg viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, i) => { const pct = (item.amount / total) * 100; const dash = `${pct} ${100 - pct}`; const offset = -cumulative; cumulative += pct; return <circle key={i} r="16" cx="16" cy="16" fill="transparent" stroke={item.color} strokeWidth="5" strokeDasharray={dash} strokeDashoffset={offset} />; })}
        </svg>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {data.slice(0, 5).map((item, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', background: item.color, borderRadius: '2px' }} /><span style={{ fontSize: '11px', color: COLORS.text, flex: 1 }}>{item.name}</span><span style={{ fontSize: '11px', color: COLORS.textMuted }}>{formatMoney(item.amount)}</span></div>)}
      </div>
    </div>
  );
};

// ============================================
// СТОЛБЧАТАЯ ДИАГРАММА
// ============================================
const BarChartComponent = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', padding: '10px 0' }}>
      {data.map((item, i) => { const h = (item.value / max) * 100; return (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: COLORS.textMuted }}>{item.value > 0 ? formatMoney(item.value) : ''}</span>
          <div style={{ width: '100%', height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}><div style={{ width: '100%', maxWidth: '24px', height: `${Math.max(h, 3)}%`, background: item.color || COLORS.gold, borderRadius: '4px 4px 0 0' }} /></div>
          <span style={{ fontSize: '9px', color: COLORS.textMuted }}>{item.label}</span>
        </div>
      ); })}
    </div>
  );
};

// ============================================
// ФОРМА КАТЕГОРИИ
// ============================================
const CategoryForm = ({ type, existingCategory, onSave, onClose, onDelete, onArchive }) => {
  const [name, setName] = useState(existingCategory?.name || '');
  const [icon, setIcon] = useState(existingCategory?.icon || CATEGORY_ICONS[0]);
  const [color, setColor] = useState(existingCategory?.color || CATEGORY_COLORS[0]);
  const inputStyle = { width: '100%', padding: '14px 16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
  const handleSave = () => { if (!name.trim()) return; onSave({ id: existingCategory?.id || `cat_${Date.now()}`, name, type, icon, color, isArchived: existingCategory?.isArchived || false }); };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Название *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название категории" style={inputStyle} /></div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Иконка</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{CATEGORY_ICONS.map((i) => <button key={i} onClick={() => setIcon(i)} style={{ width: '40px', height: '40px', background: icon === i ? `${color}30` : COLORS.bg, border: `2px solid ${icon === i ? color : COLORS.border}`, borderRadius: '8px', fontSize: '18px', cursor: 'pointer' }}>{i}</button>)}</div></div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Цвет</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{CATEGORY_COLORS.map((c) => <button key={c} onClick={() => setColor(c)} style={{ width: '32px', height: '32px', background: c, border: `3px solid ${color === c ? COLORS.text : 'transparent'}`, borderRadius: '50%', cursor: 'pointer' }} />)}</div></div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {existingCategory && <><button onClick={() => onArchive(existingCategory.id)} style={{ padding: '16px', background: `${COLORS.warning}20`, border: `1px solid ${COLORS.warning}50`, borderRadius: '12px', color: COLORS.warning, cursor: 'pointer' }}><Archive style={{ width: '18px', height: '18px' }} /></button><button onClick={() => onDelete(existingCategory.id)} style={{ padding: '16px', background: `${COLORS.danger}20`, border: `1px solid ${COLORS.danger}50`, borderRadius: '12px', color: COLORS.danger, cursor: 'pointer' }}><Trash2 style={{ width: '18px', height: '18px' }} /></button></>}
        <button onClick={onClose} style={{ flex: 1, padding: '16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '15px', cursor: 'pointer' }}>Отмена</button>
        <button onClick={handleSave} disabled={!name.trim()} style={{ flex: 1, padding: '16px', background: name.trim() ? COLORS.gold : COLORS.bgCard, border: 'none', borderRadius: '12px', color: name.trim() ? COLORS.bg : COLORS.textDark, fontSize: '15px', fontWeight: '600', cursor: name.trim() ? 'pointer' : 'not-allowed' }}>Сохранить</button>
      </div>
    </div>
  );
};

// ============================================
// ФОРМА ФОНДА
// ============================================
const FundForm = ({ existingFund, onSave, onClose, onDelete }) => {
  const [name, setName] = useState(existingFund?.name || '');
  const [icon, setIcon] = useState(existingFund?.icon || FUND_ICONS[0]);
  const [ruleType, setRuleType] = useState(existingFund?.ruleType || 'percent');
  const [ruleValue, setRuleValue] = useState(existingFund?.ruleValue?.toString() || '');
  const [balance, setBalance] = useState(existingFund?.balance?.toString() || '0');
  const inputStyle = { width: '100%', padding: '14px 16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
  const handleSave = () => { if (!name.trim()) return; onSave({ id: existingFund?.id || `fund_${Date.now()}`, name, icon, ruleType, ruleValue: ruleValue ? parseFloat(ruleValue) : null, balance: parseFloat(balance) || 0 }); };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Название *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название фонда" style={inputStyle} /></div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Иконка</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{FUND_ICONS.map((i) => <button key={i} onClick={() => setIcon(i)} style={{ width: '40px', height: '40px', background: icon === i ? `${COLORS.gold}30` : COLORS.bg, border: `2px solid ${icon === i ? COLORS.gold : COLORS.border}`, borderRadius: '8px', fontSize: '18px', cursor: 'pointer' }}>{i}</button>)}</div></div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Текущий баланс</label><input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" style={inputStyle} /></div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Правило пополнения</label>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {[{ id: 'percent', label: 'Процент' }, { id: 'fixed', label: 'Фикс. сумма' }, { id: 'choice', label: 'Выбор' }].map(r => <button key={r.id} onClick={() => setRuleType(r.id)} style={{ flex: 1, padding: '10px', background: ruleType === r.id ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${ruleType === r.id ? COLORS.gold : COLORS.border}`, borderRadius: '8px', color: ruleType === r.id ? COLORS.gold : COLORS.textMuted, fontSize: '12px', cursor: 'pointer' }}>{r.label}</button>)}
        </div>
        {ruleType !== 'choice' && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="number" value={ruleValue} onChange={(e) => setRuleValue(e.target.value)} placeholder="0" style={{ ...inputStyle, flex: 1 }} /><span style={{ color: COLORS.textMuted }}>{ruleType === 'percent' ? '%' : '₽'}</span></div>}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {existingFund && <button onClick={() => onDelete(existingFund.id)} style={{ padding: '16px', background: `${COLORS.danger}20`, border: `1px solid ${COLORS.danger}50`, borderRadius: '12px', color: COLORS.danger, cursor: 'pointer' }}><Trash2 style={{ width: '18px', height: '18px' }} /></button>}
        <button onClick={onClose} style={{ flex: 1, padding: '16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '15px', cursor: 'pointer' }}>Отмена</button>
        <button onClick={handleSave} disabled={!name.trim()} style={{ flex: 1, padding: '16px', background: name.trim() ? COLORS.gold : COLORS.bgCard, border: 'none', borderRadius: '12px', color: name.trim() ? COLORS.bg : COLORS.textDark, fontSize: '15px', fontWeight: '600', cursor: name.trim() ? 'pointer' : 'not-allowed' }}>Сохранить</button>
      </div>
    </div>
  );
};

// ============================================
// ФОРМА ТРАНЗАКЦИИ
// ============================================
const TransactionForm = ({ categories, funds, existingTransaction, onSave, onClose, onDelete }) => {
  const [type, setType] = useState(existingTransaction?.type || 'expense');
  const [amount, setAmount] = useState(existingTransaction?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(existingTransaction?.categoryId || '');
  const [date, setDate] = useState(existingTransaction?.date || formatDateKey(new Date()));
  const [comment, setComment] = useState(existingTransaction?.comment || '');
  const [isRecurring, setIsRecurring] = useState(existingTransaction?.isRecurring || false);
  const [fundId, setFundId] = useState(existingTransaction?.fundId || '');
  const [showDistribution, setShowDistribution] = useState(false);
  const [distribution, setDistribution] = useState(existingTransaction?.distribution || []);

  const filteredCategories = categories.filter(c => c.type === type && !c.isArchived);
  const inputStyle = { width: '100%', padding: '14px 16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' };

  const calcAutoDistribution = () => {
    const amt = parseFloat(amount) || 0;
    let remaining = amt;
    const dist = funds.map(f => {
      let fundAmount = 0;
      if (f.ruleType === 'percent' && f.ruleValue) fundAmount = Math.round(amt * f.ruleValue / 100);
      else if (f.ruleType === 'fixed' && f.ruleValue) fundAmount = Math.min(f.ruleValue, remaining);
      remaining -= fundAmount;
      return { fundId: f.id, amount: fundAmount };
    });
    return dist;
  };

  useEffect(() => { if (type === 'income' && !distribution.length) setDistribution(calcAutoDistribution()); }, [amount, type, funds]);

  const handleSave = () => {
    if (!amount || !categoryId) return;
    const amt = parseFloat(amount);
    onSave({ id: existingTransaction?.id || `tx_${Date.now()}`, type, amount: amt, categoryId, fundId: type === 'expense' ? fundId : null, date, comment, isRecurring, distribution: type === 'income' ? distribution : [], createdAt: existingTransaction?.createdAt || new Date().toISOString() });
  };

  return (
    <div style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[{ id: 'income', label: 'Доход', color: COLORS.success }, { id: 'expense', label: 'Расход', color: COLORS.danger }].map(t => <button key={t.id} onClick={() => { setType(t.id); setCategoryId(''); }} style={{ flex: 1, padding: '14px', background: type === t.id ? `${t.color}20` : COLORS.bg, border: `1px solid ${type === t.id ? t.color : COLORS.border}`, borderRadius: '12px', color: type === t.id ? t.color : COLORS.textMuted, fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>{t.label}</button>)}
      </div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Сумма *</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" style={{ ...inputStyle, fontSize: '24px', fontWeight: '600', color: type === 'income' ? COLORS.success : COLORS.danger }} /></div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Категория *</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{filteredCategories.map(c => <button key={c.id} onClick={() => setCategoryId(c.id)} style={{ padding: '10px 14px', background: categoryId === c.id ? `${c.color}20` : COLORS.bg, border: `1px solid ${categoryId === c.id ? c.color : COLORS.border}`, borderRadius: '10px', color: categoryId === c.id ? c.color : COLORS.textMuted, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><span>{c.icon}</span>{c.name}</button>)}</div></div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Дата</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} /></div>
      <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Комментарий</label><input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Описание..." style={inputStyle} /></div>
      <button onClick={() => setIsRecurring(!isRecurring)} style={{ width: '100%', padding: '14px', background: isRecurring ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${isRecurring ? COLORS.gold : COLORS.border}`, borderRadius: '12px', color: isRecurring ? COLORS.gold : COLORS.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}><RefreshCw style={{ width: '16px', height: '16px' }} />Повторять ежемесячно</button>
      {type === 'expense' && funds.length > 0 && (<div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Списать из фонда</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}><button onClick={() => setFundId('')} style={{ padding: '10px 14px', background: !fundId ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${!fundId ? COLORS.gold : COLORS.border}`, borderRadius: '10px', color: !fundId ? COLORS.gold : COLORS.textMuted, fontSize: '13px', cursor: 'pointer' }}>Общий</button>{funds.map(f => <button key={f.id} onClick={() => setFundId(f.id)} style={{ padding: '10px 14px', background: fundId === f.id ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${fundId === f.id ? COLORS.gold : COLORS.border}`, borderRadius: '10px', color: fundId === f.id ? COLORS.gold : COLORS.textMuted, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><span>{f.icon}</span>{f.name}</button>)}</div></div>)}
      {type === 'income' && funds.length > 0 && amount && (
        <div style={{ marginBottom: '20px', padding: '16px', background: COLORS.bg, borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><span style={{ fontSize: '12px', color: COLORS.textMuted, textTransform: 'uppercase' }}>Распределение по фондам</span><button onClick={() => setShowDistribution(!showDistribution)} style={{ padding: '6px 10px', background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: '6px', color: COLORS.gold, fontSize: '11px', cursor: 'pointer' }}>{showDistribution ? 'Скрыть' : 'Изменить'}</button></div>
          {showDistribution ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {funds.map(f => { const d = distribution.find(x => x.fundId === f.id) || { fundId: f.id, amount: 0 }; return <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '18px' }}>{f.icon}</span><span style={{ flex: 1, fontSize: '13px', color: COLORS.text }}>{f.name}</span><input type="number" value={d.amount} onChange={(e) => { const newDist = distribution.map(x => x.fundId === f.id ? { ...x, amount: parseFloat(e.target.value) || 0 } : x); if (!newDist.find(x => x.fundId === f.id)) newDist.push({ fundId: f.id, amount: parseFloat(e.target.value) || 0 }); setDistribution(newDist); }} style={{ width: '80px', padding: '8px', background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: '6px', color: COLORS.text, fontSize: '14px', textAlign: 'right' }} /></div>; })}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${COLORS.border}` }}><span style={{ fontSize: '12px', color: COLORS.textMuted }}>Остаток:</span><span style={{ fontSize: '14px', color: (parseFloat(amount) || 0) - distribution.reduce((s, d) => s + d.amount, 0) < 0 ? COLORS.danger : COLORS.success }}>{formatMoney((parseFloat(amount) || 0) - distribution.reduce((s, d) => s + d.amount, 0))}</span></div>
              <button onClick={() => setDistribution(calcAutoDistribution())} style={{ padding: '8px', background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: '6px', color: COLORS.textMuted, fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}>Сбросить к авто</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{distribution.filter(d => d.amount > 0).map(d => { const f = funds.find(x => x.id === d.fundId); return f ? <span key={d.fundId} style={{ padding: '4px 8px', background: COLORS.bgCard, borderRadius: '6px', fontSize: '12px', color: COLORS.text }}>{f.icon} {formatMoney(d.amount)}</span> : null; })}</div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px' }}>
        {existingTransaction && <button onClick={() => onDelete(existingTransaction.id)} style={{ padding: '16px', background: `${COLORS.danger}20`, border: `1px solid ${COLORS.danger}50`, borderRadius: '12px', color: COLORS.danger, cursor: 'pointer' }}><Trash2 style={{ width: '18px', height: '18px' }} /></button>}
        <button onClick={onClose} style={{ flex: 1, padding: '16px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '15px', cursor: 'pointer' }}>Отмена</button>
        <button onClick={handleSave} disabled={!amount || !categoryId} style={{ flex: 1, padding: '16px', background: (amount && categoryId) ? COLORS.gold : COLORS.bgCard, border: 'none', borderRadius: '12px', color: (amount && categoryId) ? COLORS.bg : COLORS.textDark, fontSize: '15px', fontWeight: '600', cursor: (amount && categoryId) ? 'pointer' : 'not-allowed' }}>Сохранить</button>
      </div>
    </div>
  );
};

// ============================================
// БЮДЖЕТ С ТАБАМИ
// ============================================
const BudgetView = ({ categories, funds, transactions, budgets, onSaveBudget, selectedQuarter, selectedYear, onChangeQuarter, onChangeYear }) => {
  const [activeTab, setActiveTab] = useState('categories');
  const months = getQuarterMonths(selectedQuarter, selectedYear);
  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const expenseCategories = categories.filter(c => c.type === 'expense' && !c.isArchived);

  const getActual = (itemId, month, isCategory = true) => {
    const m = month.getMonth(); const y = month.getFullYear();
    return transactions.filter(t => { const d = new Date(t.date); const match = d.getMonth() === m && d.getFullYear() === y && t.type === 'expense'; if (isCategory) return match && t.categoryId === itemId; return match && t.fundId === itemId; }).reduce((s, t) => s + t.amount, 0);
  };

  const getBudgetKey = (itemId, month) => `${itemId}_${month.getFullYear()}_${month.getMonth()}`;
  const getLimit = (itemId, month) => budgets[getBudgetKey(itemId, month)] || 0;
  const setLimit = (itemId, month, value) => onSaveBudget(getBudgetKey(itemId, month), parseFloat(value) || 0);

  const items = activeTab === 'categories' ? expenseCategories : funds;

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <select value={selectedQuarter} onChange={(e) => onChangeQuarter(parseInt(e.target.value))} style={{ flex: 1, padding: '12px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '10px', color: COLORS.text, fontSize: '14px' }}>
          {QUARTERS.map(q => <option key={q.id} value={q.id}>{q.label}</option>)}
        </select>
        <select value={selectedYear} onChange={(e) => onChangeYear(parseInt(e.target.value))} style={{ width: '100px', padding: '12px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '10px', color: COLORS.text, fontSize: '14px' }}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: COLORS.bg, padding: '4px', borderRadius: '10px' }}>
        {[{ id: 'categories', label: 'По категориям' }, { id: 'funds', label: 'По фондам' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '10px', background: activeTab === tab.id ? COLORS.bgCard : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab.id ? COLORS.gold : COLORS.textMuted, fontSize: '13px', cursor: 'pointer' }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
          <thead>
            <tr><th style={{ padding: '10px', fontSize: '12px', color: COLORS.textMuted, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>{activeTab === 'categories' ? 'Категория' : 'Фонд'}</th>{months.map((m, i) => <th key={i} style={{ padding: '10px', fontSize: '12px', color: COLORS.textMuted, textAlign: 'center', borderBottom: `1px solid ${COLORS.border}` }}>{monthNames[m.getMonth()]}</th>)}</tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ padding: '10px', fontSize: '13px', color: COLORS.text, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${COLORS.border}` }}><span style={{ fontSize: '16px' }}>{item.icon}</span>{item.name}</td>
                {months.map((m, i) => { const limit = getLimit(item.id, m); const actual = getActual(item.id, m, activeTab === 'categories'); const over = limit > 0 && actual > limit; return (
                  <td key={i} style={{ padding: '8px', borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center', verticalAlign: 'middle' }}>
                    <input type="number" value={limit || ''} onChange={(e) => setLimit(item.id, m, e.target.value)} placeholder="—" style={{ width: '60px', padding: '6px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '6px', color: COLORS.text, fontSize: '12px', textAlign: 'center', marginBottom: '4px' }} />
                    <div style={{ fontSize: '11px', color: over ? COLORS.danger : COLORS.textMuted, background: over ? `${COLORS.danger}20` : 'transparent', padding: '2px 4px', borderRadius: '4px' }}>{formatMoney(actual)}</div>
                  </td>
                ); })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// ЭКРАН ФИНАНСОВ
// ============================================
export const FinanceScreen = ({ data, saveData }) => {
  const [period, setPeriod] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showFunds, setShowFunds] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showFundForm, setShowFundForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingFund, setEditingFund] = useState(null);
  const [categoryType, setCategoryType] = useState('expense');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilterFrom, setDateFilterFrom] = useState('');
  const [dateFilterTo, setDateFilterTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showCategoryArchive, setShowCategoryArchive] = useState(false);
  const [fundsExpanded, setFundsExpanded] = useState(false);
  const [budgetQuarter, setBudgetQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [customAnalyticsFrom, setCustomAnalyticsFrom] = useState('');
  const [customAnalyticsTo, setCustomAnalyticsTo] = useState('');

  useEffect(() => { if (!data.financeCategories) saveData({ ...data, financeCategories: [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES], funds: DEFAULT_FUNDS, transactions: [], budgets: {} }); }, [data, saveData]);

  const categories = data.financeCategories || [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
  const funds = data.funds || DEFAULT_FUNDS;
  const transactions = data.transactions || [];
  const budgets = data.budgets || {};

  const periodTransactions = transactions.filter(t => isInPeriod(t.date, period, currentDate));
  const filteredTransactions = periodTransactions.filter(t => {
    const catMatch = categoryFilter === 'all' || t.categoryId === categoryFilter;
    const dateMatch = !showDateFilter || isInDateRange(t.date, dateFilterFrom, dateFilterTo);
    return catMatch && dateMatch;
  });

  const totalIncome = periodTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = periodTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Тренд (сравнение с прошлым периодом)
  const prevDate = navigatePeriod(currentDate, period, -1);
  const prevTransactions = transactions.filter(t => isInPeriod(t.date, period, prevDate));
  const prevIncome = prevTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const incomeTrend = prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : 0;
  const expenseTrend = prevExpense > 0 ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100) : 0;

  // YTD
  const yearStart = new Date(currentDate.getFullYear(), 0, 1);
  const ytdTransactions = transactions.filter(t => { const d = new Date(t.date); return d >= yearStart && d <= currentDate; });
  const ytdIncome = ytdTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthsPassed = currentDate.getMonth() + 1;
  const avgMonthlyIncome = Math.round(ytdIncome / monthsPassed);

  // Данные для аналитики
  const getAnalyticsData = () => {
    let filtered = transactions;
    if (analyticsPeriod === 'custom' && customAnalyticsFrom && customAnalyticsTo) {
      filtered = transactions.filter(t => isInDateRange(t.date, customAnalyticsFrom, customAnalyticsTo));
    } else {
      filtered = transactions.filter(t => isInPeriod(t.date, analyticsPeriod, currentDate));
    }
    return filtered;
  };

  const analyticsTransactions = getAnalyticsData();
  const analyticsExpenseByCategory = categories.filter(c => c.type === 'expense' && !c.isArchived).map(c => ({ ...c, amount: analyticsTransactions.filter(t => t.categoryId === c.id && t.type === 'expense').reduce((s, t) => s + t.amount, 0) })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
  const analyticsTotalExpense = analyticsExpenseByCategory.reduce((s, c) => s + c.amount, 0);

  // Сравнение месяц к месяцу
  const monthsToCompare = 6;
  const comparisonData = Array.from({ length: monthsToCompare }, (_, i) => {
    const m = new Date(currentDate.getFullYear(), currentDate.getMonth() - (monthsToCompare - 1 - i), 1);
    const monthTx = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear(); });
    return { label: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][m.getMonth()], value: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), color: COLORS.danger };
  });

  // Handlers
  const handleSaveTransaction = (tx) => {
    let newFunds = [...funds];
    if (tx.type === 'income' && tx.distribution) tx.distribution.forEach(d => { newFunds = newFunds.map(f => f.id === d.fundId ? { ...f, balance: f.balance + d.amount } : f); });
    if (tx.type === 'expense' && tx.fundId) newFunds = newFunds.map(f => f.id === tx.fundId ? { ...f, balance: f.balance - tx.amount } : f);
    const existingIndex = transactions.findIndex(t => t.id === tx.id);
    const newTransactions = existingIndex >= 0 ? transactions.map((t, i) => i === existingIndex ? tx : t) : [...transactions, tx];
    saveData({ ...data, transactions: newTransactions, funds: newFunds });
    setShowTransactionForm(false); setEditingTransaction(null);
  };

  const handleDeleteTransaction = (txId) => { saveData({ ...data, transactions: transactions.filter(t => t.id !== txId) }); setShowTransactionForm(false); setEditingTransaction(null); };
  const handleSaveCategory = (cat) => { const idx = categories.findIndex(c => c.id === cat.id); const newCats = idx >= 0 ? categories.map((c, i) => i === idx ? cat : c) : [...categories, cat]; saveData({ ...data, financeCategories: newCats }); setShowCategoryForm(false); setEditingCategory(null); };
  const handleArchiveCategory = (catId) => { saveData({ ...data, financeCategories: categories.map(c => c.id === catId ? { ...c, isArchived: true } : c) }); setShowCategoryForm(false); setEditingCategory(null); };
  const handleRestoreCategory = (catId) => { saveData({ ...data, financeCategories: categories.map(c => c.id === catId ? { ...c, isArchived: false } : c) }); };
  const handleDeleteCategory = (catId) => { saveData({ ...data, financeCategories: categories.filter(c => c.id !== catId) }); setShowCategoryForm(false); setEditingCategory(null); };
  const handleSaveFund = (fund) => { const idx = funds.findIndex(f => f.id === fund.id); const newFunds = idx >= 0 ? funds.map((f, i) => i === idx ? fund : f) : [...funds, fund]; saveData({ ...data, funds: newFunds }); setShowFundForm(false); setEditingFund(null); };
  const handleDeleteFund = (fundId) => { saveData({ ...data, funds: funds.filter(f => f.id !== fundId) }); setShowFundForm(false); setEditingFund(null); };
  const handleSaveBudget = (key, value) => { saveData({ ...data, budgets: { ...budgets, [key]: value } }); };

  const archivedCategories = categories.filter(c => c.isArchived);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, paddingBottom: '100px' }}>
      <div style={{ padding: '20px', paddingTop: '60px', background: `linear-gradient(to bottom, ${COLORS.bgCard} 0%, ${COLORS.bg} 100%)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: COLORS.text, fontFamily: 'Georgia, serif' }}>Финансы</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowAnalytics(true)} style={{ padding: '8px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', cursor: 'pointer' }}><PieChart style={{ width: '18px', height: '18px', color: COLORS.textMuted }} /></button>
            <button onClick={() => setShowBudget(true)} style={{ padding: '8px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', cursor: 'pointer' }}><Target style={{ width: '18px', height: '18px', color: COLORS.textMuted }} /></button>
          </div>
        </div>

        {/* Период */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: COLORS.bg, padding: '4px', borderRadius: '10px' }}>{PERIODS.map(p => <button key={p.id} onClick={() => setPeriod(p.id)} style={{ flex: 1, padding: '10px', background: period === p.id ? COLORS.bgCard : 'transparent', border: 'none', borderRadius: '8px', color: period === p.id ? COLORS.gold : COLORS.textMuted, fontSize: '13px', cursor: 'pointer' }}>{p.label}</button>)}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={() => setCurrentDate(navigatePeriod(currentDate, period, -1))} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
          <span style={{ fontSize: '16px', color: COLORS.text, fontWeight: '500' }}>{getPeriodLabel(currentDate, period)}</span>
          <button onClick={() => setCurrentDate(navigatePeriod(currentDate, period, 1))} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /></button>
        </div>

        {/* Карточки */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '16px', background: COLORS.bgCard, borderRadius: '14px', border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '12px', color: COLORS.textMuted }}>Доходы</span>{incomeTrend !== 0 && <span style={{ fontSize: '11px', color: incomeTrend > 0 ? COLORS.success : COLORS.danger, display: 'flex', alignItems: 'center', gap: '2px' }}>{incomeTrend > 0 ? <TrendingUp style={{ width: '12px', height: '12px' }} /> : <TrendingDown style={{ width: '12px', height: '12px' }} />}{Math.abs(incomeTrend)}%</span>}</div>
            <p style={{ fontSize: '20px', fontWeight: '600', color: COLORS.success }}>{formatMoney(totalIncome)}</p>
          </div>
          <div style={{ padding: '16px', background: COLORS.bgCard, borderRadius: '14px', border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '12px', color: COLORS.textMuted }}>Расходы</span>{expenseTrend !== 0 && <span style={{ fontSize: '11px', color: expenseTrend > 0 ? COLORS.danger : COLORS.success, display: 'flex', alignItems: 'center', gap: '2px' }}>{expenseTrend > 0 ? <TrendingUp style={{ width: '12px', height: '12px' }} /> : <TrendingDown style={{ width: '12px', height: '12px' }} />}{Math.abs(expenseTrend)}%</span>}</div>
            <p style={{ fontSize: '20px', fontWeight: '600', color: COLORS.danger }}>{formatMoney(totalExpense)}</p>
          </div>
        </div>
        <div style={{ padding: '16px', background: COLORS.bgCard, borderRadius: '14px', border: `1px solid ${COLORS.border}`, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><p style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>Баланс</p><p style={{ fontSize: '24px', fontWeight: '600', color: balance >= 0 ? COLORS.gold : COLORS.danger }}>{formatMoney(balance)}</p></div>
          <div style={{ textAlign: 'right' }}><p style={{ fontSize: '10px', color: COLORS.textMuted }}>YTD ср./мес</p><p style={{ fontSize: '14px', color: COLORS.text }}>{formatMoney(avgMonthlyIncome)}</p></div>
        </div>

        {/* Фонды */}
        <button onClick={() => setFundsExpanded(!fundsExpanded)} style={{ width: '100%', padding: '14px', background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: '14px', color: COLORS.text, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wallet style={{ width: '18px', height: '18px', color: COLORS.gold }} />Фонды ({funds.length})</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: COLORS.gold }}>{formatMoney(funds.reduce((s, f) => s + f.balance, 0))}</span>{fundsExpanded ? <ChevronUp style={{ width: '16px', height: '16px', color: COLORS.textMuted }} /> : <ChevronDown style={{ width: '16px', height: '16px', color: COLORS.textMuted }} />}</span>
        </button>
        {fundsExpanded && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {funds.map(f => <div key={f.id} onClick={() => { setEditingFund(f); setShowFundForm(true); }} style={{ padding: '12px', background: COLORS.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}><span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '20px' }}>{f.icon}</span><span style={{ fontSize: '14px', color: COLORS.text }}>{f.name}</span></span><span style={{ fontSize: '14px', color: COLORS.gold, fontWeight: '500' }}>{formatMoney(f.balance)}</span></div>)}
            <button onClick={() => setShowFunds(true)} style={{ padding: '10px', background: 'transparent', border: `1px dashed ${COLORS.border}`, borderRadius: '10px', color: COLORS.textMuted, fontSize: '13px', cursor: 'pointer' }}>Управление фондами</button>
          </div>
        )}
      </div>

      {/* Операции */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', color: COLORS.text, fontWeight: '500' }}>Операции</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowDateFilter(!showDateFilter)} style={{ padding: '8px', background: showDateFilter ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${showDateFilter ? COLORS.gold : COLORS.border}`, borderRadius: '8px', cursor: 'pointer' }}><Calendar style={{ width: '16px', height: '16px', color: showDateFilter ? COLORS.gold : COLORS.textMuted }} /></button>
            <button onClick={() => setShowCategories(true)} style={{ padding: '8px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', cursor: 'pointer' }}><Settings style={{ width: '16px', height: '16px', color: COLORS.textMuted }} /></button>
          </div>
        </div>

        {/* Фильтр по дате */}
        {showDateFilter && (
          <div style={{ padding: '12px', background: COLORS.bgCard, borderRadius: '10px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="date" value={dateFilterFrom} onChange={(e) => setDateFilterFrom(e.target.value)} style={{ flex: 1, padding: '8px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '6px', color: COLORS.text, fontSize: '12px' }} />
            <span style={{ color: COLORS.textMuted }}>—</span>
            <input type="date" value={dateFilterTo} onChange={(e) => setDateFilterTo(e.target.value)} style={{ flex: 1, padding: '8px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '6px', color: COLORS.text, fontSize: '12px' }} />
            <button onClick={() => { setDateFilterFrom(''); setDateFilterTo(''); }} style={{ padding: '8px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '6px', cursor: 'pointer' }}><X style={{ width: '14px', height: '14px', color: COLORS.textMuted }} /></button>
          </div>
        )}

        {/* Фильтр по категориям */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button onClick={() => setCategoryFilter('all')} style={{ padding: '6px 12px', background: categoryFilter === 'all' ? `${COLORS.gold}20` : COLORS.bg, border: `1px solid ${categoryFilter === 'all' ? COLORS.gold : COLORS.border}`, borderRadius: '16px', fontSize: '12px', color: categoryFilter === 'all' ? COLORS.gold : COLORS.textMuted, cursor: 'pointer' }}>Все</button>
          {categories.filter(c => !c.isArchived).slice(0, 8).map(c => <button key={c.id} onClick={() => setCategoryFilter(c.id)} style={{ padding: '6px 10px', background: categoryFilter === c.id ? `${c.color}20` : COLORS.bg, border: `1px solid ${categoryFilter === c.id ? c.color : COLORS.border}`, borderRadius: '16px', fontSize: '12px', color: categoryFilter === c.id ? c.color : COLORS.textMuted, cursor: 'pointer' }}>{c.icon}</button>)}
        </div>

        {/* Список операций */}
        {filteredTransactions.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 20px' }}><DollarSign style={{ width: '48px', height: '48px', color: COLORS.textDark, margin: '0 auto 16px' }} /><p style={{ color: COLORS.textMuted, fontSize: '14px' }}>Нет операций за период</p></div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            return (
              <div key={tx.id} onClick={() => { setEditingTransaction(tx); setShowTransactionForm(true); }} style={{ padding: '14px', background: COLORS.bgCard, borderRadius: '12px', border: `1px solid ${COLORS.border}`, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: `${cat?.color || COLORS.textMuted}20`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{cat?.icon || '📦'}</div>
                  <div style={{ flex: 1 }}><p style={{ fontSize: '14px', color: COLORS.text, fontWeight: '500' }}>{cat?.name || 'Без категории'}</p><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ fontSize: '12px', color: COLORS.textMuted }}>{new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>{tx.isRecurring && <RefreshCw style={{ width: '12px', height: '12px', color: COLORS.textMuted }} />}</div></div>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: tx.type === 'income' ? COLORS.success : COLORS.danger }}>{tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}</span>
                </div>
                {tx.comment && <p style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '8px', paddingLeft: '52px' }}>{tx.comment}</p>}
              </div>
            );
          })}
        </div>}
      </div>

      {/* FAB */}
      <button onClick={() => { setEditingTransaction(null); setShowTransactionForm(true); }} style={{ position: 'fixed', right: '20px', bottom: '100px', width: '56px', height: '56px', background: `linear-gradient(135deg, ${COLORS.goldDark} 0%, ${COLORS.gold} 100%)`, border: 'none', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 8px 24px ${COLORS.gold}40` }}><Plus style={{ width: '24px', height: '24px', color: COLORS.bg }} /></button>

      {/* Модалки */}
      <Modal isOpen={showTransactionForm} onClose={() => { setShowTransactionForm(false); setEditingTransaction(null); }} title={editingTransaction ? 'Редактировать' : 'Новая операция'}><TransactionForm categories={categories} funds={funds} existingTransaction={editingTransaction} onSave={handleSaveTransaction} onClose={() => { setShowTransactionForm(false); setEditingTransaction(null); }} onDelete={handleDeleteTransaction} /></Modal>

      <Modal isOpen={showCategories} onClose={() => setShowCategories(false)} title="Категории">
        <div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: COLORS.bg, padding: '4px', borderRadius: '10px' }}>{[{ id: 'income', label: 'Доходы' }, { id: 'expense', label: 'Расходы' }].map(t => <button key={t.id} onClick={() => setCategoryType(t.id)} style={{ flex: 1, padding: '10px', background: categoryType === t.id ? COLORS.bgCard : 'transparent', border: 'none', borderRadius: '8px', color: categoryType === t.id ? COLORS.gold : COLORS.textMuted, fontSize: '13px', cursor: 'pointer' }}>{t.label}</button>)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.filter(c => c.type === categoryType && !c.isArchived).map(c => <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: COLORS.bg, borderRadius: '10px' }}><div style={{ width: '36px', height: '36px', background: `${c.color}20`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{c.icon}</div><span style={{ flex: 1, fontSize: '14px', color: COLORS.text }}>{c.name}</span><button onClick={() => { setEditingCategory(c); setShowCategoryForm(true); setShowCategories(false); }} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Edit3 style={{ width: '16px', height: '16px', color: COLORS.textMuted }} /></button></div>)}
            <button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); setShowCategories(false); }} style={{ padding: '12px', background: COLORS.bg, border: `1px dashed ${COLORS.border}`, borderRadius: '10px', color: COLORS.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Plus style={{ width: '16px', height: '16px' }} />Добавить</button>
            {archivedCategories.filter(c => c.type === categoryType).length > 0 && <button onClick={() => { setShowCategoryArchive(true); setShowCategories(false); }} style={{ padding: '12px', background: 'transparent', border: 'none', color: COLORS.textMuted, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Archive style={{ width: '14px', height: '14px' }} />Архив ({archivedCategories.filter(c => c.type === categoryType).length})</button>}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCategoryArchive} onClose={() => setShowCategoryArchive(false)} title="Архив категорий">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {archivedCategories.map(c => <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: COLORS.bg, borderRadius: '10px', opacity: 0.7 }}><div style={{ width: '36px', height: '36px', background: `${c.color}20`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{c.icon}</div><span style={{ flex: 1, fontSize: '14px', color: COLORS.text }}>{c.name}</span><button onClick={() => handleRestoreCategory(c.id)} style={{ padding: '6px 12px', background: `${COLORS.success}20`, border: 'none', borderRadius: '6px', color: COLORS.success, fontSize: '12px', cursor: 'pointer' }}>Восстановить</button></div>)}
          {archivedCategories.length === 0 && <p style={{ textAlign: 'center', color: COLORS.textMuted, padding: '20px' }}>Архив пуст</p>}
        </div>
      </Modal>

      <Modal isOpen={showCategoryForm} onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }} title={editingCategory ? 'Редактировать' : 'Новая категория'}><CategoryForm type={categoryType} existingCategory={editingCategory} onSave={handleSaveCategory} onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }} onDelete={handleDeleteCategory} onArchive={handleArchiveCategory} /></Modal>

      <Modal isOpen={showFunds} onClose={() => setShowFunds(false)} title="Фонды">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {funds.map(f => <div key={f.id} onClick={() => { setEditingFund(f); setShowFundForm(true); setShowFunds(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: COLORS.bg, borderRadius: '12px', cursor: 'pointer' }}><span style={{ fontSize: '24px' }}>{f.icon}</span><div style={{ flex: 1 }}><p style={{ fontSize: '15px', color: COLORS.text, fontWeight: '500' }}>{f.name}</p><p style={{ fontSize: '12px', color: COLORS.textMuted }}>{f.ruleType === 'percent' ? `${f.ruleValue}%` : f.ruleType === 'fixed' ? formatMoney(f.ruleValue) : 'По выбору'}</p></div><span style={{ fontSize: '16px', color: COLORS.gold, fontWeight: '600' }}>{formatMoney(f.balance)}</span></div>)}
          <button onClick={() => { setEditingFund(null); setShowFundForm(true); setShowFunds(false); }} style={{ padding: '14px', background: COLORS.bg, border: `1px dashed ${COLORS.border}`, borderRadius: '12px', color: COLORS.textMuted, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Plus style={{ width: '18px', height: '18px' }} />Добавить фонд</button>
        </div>
      </Modal>

      <Modal isOpen={showFundForm} onClose={() => { setShowFundForm(false); setEditingFund(null); }} title={editingFund ? 'Редактировать' : 'Новый фонд'}><FundForm existingFund={editingFund} onSave={handleSaveFund} onClose={() => { setShowFundForm(false); setEditingFund(null); }} onDelete={handleDeleteFund} /></Modal>

      <Modal isOpen={showBudget} onClose={() => setShowBudget(false)} title="Бюджет квартала"><BudgetView categories={categories} funds={funds} transactions={transactions} budgets={budgets} onSaveBudget={handleSaveBudget} selectedQuarter={budgetQuarter} selectedYear={budgetYear} onChangeQuarter={setBudgetQuarter} onChangeYear={setBudgetYear} /></Modal>

      <Modal isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} title="Аналитика">
        <div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: COLORS.bg, padding: '4px', borderRadius: '10px' }}>{ANALYTICS_PERIODS.map(p => <button key={p.id} onClick={() => setAnalyticsPeriod(p.id)} style={{ flex: 1, padding: '8px', background: analyticsPeriod === p.id ? COLORS.bgCard : 'transparent', border: 'none', borderRadius: '8px', color: analyticsPeriod === p.id ? COLORS.gold : COLORS.textMuted, fontSize: '12px', cursor: 'pointer' }}>{p.label}</button>)}</div>
          {analyticsPeriod === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input type="date" value={customAnalyticsFrom} onChange={(e) => setCustomAnalyticsFrom(e.target.value)} style={{ flex: 1, padding: '10px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text, fontSize: '13px' }} />
              <input type="date" value={customAnalyticsTo} onChange={(e) => setCustomAnalyticsTo(e.target.value)} style={{ flex: 1, padding: '10px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text, fontSize: '13px' }} />
            </div>
          )}
          <div style={{ padding: '16px', background: COLORS.bg, borderRadius: '12px', marginBottom: '16px' }}><p style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '12px' }}>Расходы по категориям</p><PieChartComponent data={analyticsExpenseByCategory} total={analyticsTotalExpense} /></div>
          <div style={{ padding: '16px', background: COLORS.bg, borderRadius: '12px', marginBottom: '16px' }}><p style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px' }}>Доход за год (YTD)</p><p style={{ fontSize: '24px', color: COLORS.success, fontWeight: '600' }}>{formatMoney(ytdIncome)}</p><p style={{ fontSize: '13px', color: COLORS.textMuted, marginTop: '4px' }}>Ср. в месяц: {formatMoney(avgMonthlyIncome)}</p></div>
          <div style={{ padding: '16px', background: COLORS.bg, borderRadius: '12px' }}><p style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '12px' }}>Расходы по месяцам</p><BarChartComponent data={comparisonData} /></div>
        </div>
      </Modal>
    </div>
  );
};
