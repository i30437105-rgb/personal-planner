import React, { useState, useEffect } from 'react';
import { supabase, loadAllData } from './lib/supabase';
import { COLORS } from './constants';
import { BottomNav } from './components/navigation';
import { DreamScreen } from './screens/DreamScreen';
import { StrategyScreen } from './screens/StrategyScreen';
import { TacticsScreen } from './screens/TacticsScreen';
import { ActionScreen } from './screens/ActionScreen';
import { ProductivityScreen } from './screens/ProductivityScreen';
import { FinanceScreen } from './screens/FinanceScreen';
import { Eye, EyeOff, Mail, Lock, Loader, LogOut, Cloud, CloudOff } from 'lucide-react';

// ============================================
// ЭКРАН АВТОРИЗАЦИИ
// ============================================
const AuthScreen = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Заполните все поля'); return; }
    if (password.length < 6) { setError('Пароль минимум 6 символов'); return; }
    
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          // Автоматический вход после регистрации
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          onAuth(signInData.user);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.message.includes('Invalid login')) setError('Неверный email или пароль');
      else if (err.message.includes('already registered')) setError('Email уже зарегистрирован');
      else setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '16px 16px 16px 48px', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', background: `radial-gradient(circle, ${COLORS.gold}30 0%, transparent 70%)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `2px solid ${COLORS.gold}40` }}>
            <span style={{ fontSize: '36px' }}>✨</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: COLORS.text, fontFamily: 'Georgia, serif', marginBottom: '8px' }}>Личный планировщик</h1>
          <p style={{ fontSize: '14px', color: COLORS.textMuted }}>{isLogin ? 'Вход в аккаунт' : 'Создание аккаунта'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: COLORS.textMuted }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: COLORS.textMuted }} />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" style={inputStyle} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              {showPassword ? <EyeOff style={{ width: '20px', height: '20px', color: COLORS.textMuted }} /> : <Eye style={{ width: '20px', height: '20px', color: COLORS.textMuted }} />}
            </button>
          </div>

          {error && <div style={{ padding: '12px', background: `${COLORS.danger}20`, border: `1px solid ${COLORS.danger}40`, borderRadius: '10px', marginBottom: '16px' }}><p style={{ fontSize: '13px', color: COLORS.danger, textAlign: 'center' }}>{error}</p></div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: loading ? COLORS.bgCard : `linear-gradient(135deg, ${COLORS.goldDark} 0%, ${COLORS.gold} 100%)`, border: 'none', borderRadius: '12px', color: loading ? COLORS.textMuted : COLORS.bg, fontSize: '16px', fontWeight: '600', cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <><Loader style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />Загрузка...</> : (isLogin ? 'Войти' : 'Создать аккаунт')}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: COLORS.textMuted }}>
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: COLORS.gold, fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ============================================
// ЭКРАН ЗАГРУЗКИ
// ============================================
const LoadingScreen = ({ message = 'Загрузка...' }) => (
  <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '60px', height: '60px', border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.gold, borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
    <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>{message}</p>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ============================================
// ГЛАВНОЕ ПРИЛОЖЕНИЕ
// ============================================
const MainApp = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dreams');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  // Загрузка данных при старте
  useEffect(() => {
    const loadData = async () => {
      // Сначала загружаем из localStorage
      const cached = localStorage.getItem(`planner_data_${user.id}`);
      if (cached) {
        try {
          setData(JSON.parse(cached));
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }
      
      // Затем обновляем из Supabase
      try {
        const cloudData = await loadAllData(user.id);
        if (cloudData) {
          setData(cloudData);
          localStorage.setItem(`planner_data_${user.id}`, JSON.stringify(cloudData));
        }
        setSyncError(false);
      } catch (err) {
        console.error('Load error:', err);
        if (!cached) {
          setData({ spheres: [], dreams: [], goals: [], steps: [], actions: [], activities: [], sessions: [], financeCategories: [], funds: [], transactions: [], budgets: {} });
        }
        setSyncError(true);
      }
      
      setLoading(false);
    };
    loadData();
  }, [user.id]);

  // Функция сохранения данных
  const saveData = async (newData) => {
    setData(newData);
    localStorage.setItem(`planner_data_${user.id}`, JSON.stringify(newData));
    
    setSyncing(true);
    try {
      await syncToSupabase(user.id, newData);
      setSyncError(false);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncError(true);
    }
    setSyncing(false);
  };

  // Синхронизация с Supabase
  const syncToSupabase = async (userId, data) => {
    try {
      // Сферы
      if (data.spheres?.length) {
        for (const item of data.spheres) {
          const { error } = await supabase.from('spheres').upsert({
            id: item.id,
            user_id: userId,
            name: item.name,
            icon_id: item.iconId || 'star',
            is_default: item.isDefault || false,
            sort_order: item.sortOrder || 0
          });
          if (error) console.error('Sphere error:', error);
        }
      }

      // Мечты
      if (data.dreams?.length) {
        for (const item of data.dreams) {
          const { error } = await supabase.from('dreams').upsert({
            id: item.id,
            user_id: userId,
            title: item.title,
            description: item.description || null,
            type: item.type || 'dream',
            sphere_id: item.sphereId || null,
            period_type: item.periodType || null,
            period_years: item.periodYears || null,
            period_date: item.periodDate || null,
            prayer_text: item.prayerText || null,
            cover_image: item.coverImage || null,
            is_focused: item.isFocused || false,
            is_leading: item.isLeading || false,
            status: item.status || 'active',
            sort_order: item.sortOrder || 0
          });
          if (error) console.error('Dream error:', error);
        }
      }

      // Цели
      if (data.goals?.length) {
        for (const item of data.goals) {
          const { error } = await supabase.from('goals').upsert({
            id: item.id,
            user_id: userId,
            dream_id: item.dreamId || null,
            title: item.title,
            description: item.description || null,
            status: item.status || 'active',
            progress: item.progress || 0,
            deadline: item.deadline || null,
            sort_order: item.sortOrder || 0
          });
          if (error) console.error('Goal:', error);
        }
      }

      // Рубежи
      if (data.steps?.length) {
        for (const item of data.steps) {
          const { error } = await supabase.from('steps').upsert({
            id: item.id,
            user_id: userId,
            goal_id: item.goalId || null,
            title: item.title,
            status: item.status || 'active',
            deadline: item.deadline || null,
            sort_order: item.sortOrder || 0
          });
          if (error) console.error('Step:', error);
        }
      }

      // Действия
      if (data.actions?.length) {
        for (const item of data.actions) {
          const { error } = await supabase.from('actions').upsert({
            id: item.id,
            user_id: userId,
            step_id: item.stepId || null,
            goal_id: item.goalId || null,
            title: item.title,
            status: item.status || 'active',
            priority: item.priority || 'normal',
            date: item.date || null,
            time: item.time || null,
            duration: item.duration || null,
            is_recurring: item.isRecurring || false,
            recurrence_rule: item.recurrenceRule || null,
            sort_order: item.sortOrder || 0
          });
          if (error) console.error('Action:', error);
        }
      }

      // Виды деятельности
      if (data.activities?.length) {
        for (const item of data.activities) {
          const { error } = await supabase.from('activities').upsert({
            id: item.id,
            user_id: userId,
            name: item.name,
            icon: item.icon || null,
            color: item.color || null,
            is_archived: item.isArchived || false,
            sort_order: item.sortOrder || 0
          });
          if (error) console.error('Activity:', error);
        }
      }

      // Сессии
      if (data.sessions?.length) {
        for (const item of data.sessions) {
          const { error } = await supabase.from('sessions').upsert({
            id: item.id,
            user_id: userId,
            activity_id: item.activityId || null,
            start_at: item.startAt || null,
            end_at: item.endAt || null,
            duration: item.duration || null
          });
          if (error) console.error('Session:', error);
        }
      }

      // Категории финансов
      if (data.financeCategories?.length) {
        for (const item of data.financeCategories) {
          const { error } = await supabase.from('finance_categories').upsert({
            id: item.id,
            user_id: userId,
            name: item.name,
            type: item.type,
            icon: item.icon || null,
            color: item.color || null,
            is_archived: item.isArchived || false,
            sort_order: item.sortOrder || 0
          });
          if (error) console.error('Category:', error);
        }
      }

      // Фонды
      if (data.funds?.length) {
        for (const item of data.funds) {
          const { error } = await supabase.from('funds').upsert({
            id: item.id,
            user_id: userId,
            name: item.name,
            icon: item.icon || null,
            balance: item.balance || 0,
            rule_type: item.ruleType || null,
            rule_value: item.ruleValue || null,
            sort_order: item.sortOrder || 0
          });
          if (error) console.error('Fund:', error);
        }
      }

      // Транзакции
      if (data.transactions?.length) {
        for (const item of data.transactions) {
          const { error } = await supabase.from('transactions').upsert({
            id: item.id,
            user_id: userId,
            type: item.type,
            amount: item.amount,
            category_id: item.categoryId || null,
            fund_id: item.fundId || null,
            date: item.date || null,
            comment: item.comment || null,
            is_recurring: item.isRecurring || false
          });
          if (error) console.error('Trans:', error);
        }
      }

    } catch (err) {
      console.error('Sync error:', err);
    }
  };

  // Принудительная синхронизация
  const forceSync = async () => {
    setSyncing(true);
    try {
      const cloudData = await loadAllData(user.id);
      if (cloudData) {
        setData(cloudData);
        localStorage.setItem(`planner_data_${user.id}`, JSON.stringify(cloudData));
      }
      setSyncError(false);
    } catch (err) {
      console.error('Force sync error:', err);
      setSyncError(true);
    }
    setSyncing(false);
  };

  if (loading || !data) return <LoadingScreen message="Загрузка данных..." />;

  const renderScreen = () => {
    switch (activeTab) {
      case 'dreams': return <DreamScreen data={data} saveData={saveData} />;
      case 'goals': return <StrategyScreen data={data} saveData={saveData} />;
      case 'steps': return <TacticsScreen data={data} saveData={saveData} />;
      case 'actions': return <ActionScreen data={data} saveData={saveData} />;
      case 'time': return <ProductivityScreen data={data} saveData={saveData} />;
      case 'finance': return <FinanceScreen data={data} saveData={saveData} />;
      default: return <DreamScreen data={data} saveData={saveData} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      {/* Статус синхронизации */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {syncing ? (
          <div style={{ padding: '6px 12px', background: `${COLORS.gold}20`, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Loader style={{ width: '14px', height: '14px', color: COLORS.gold, animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '11px', color: COLORS.gold }}>Синхронизация...</span>
          </div>
        ) : syncError ? (
          <div onClick={forceSync} style={{ padding: '6px 12px', background: `${COLORS.danger}20`, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <CloudOff style={{ width: '14px', height: '14px', color: COLORS.danger }} />
            <span style={{ fontSize: '11px', color: COLORS.danger }}>Офлайн (нажми)</span>
          </div>
        ) : (
          <div onClick={forceSync} style={{ padding: '6px 12px', background: `${COLORS.success}20`, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Cloud style={{ width: '14px', height: '14px', color: COLORS.success }} />
            <span style={{ fontSize: '11px', color: COLORS.success }}>Синхронизировано</span>
          </div>
        )}
        <button onClick={onLogout} style={{ padding: '6px', background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: '8px', cursor: 'pointer' }}>
          <LogOut style={{ width: '16px', height: '16px', color: COLORS.textMuted }} />
        </button>
      </div>

      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ============================================
// APP
// ============================================
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем текущую сессию
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthScreen onAuth={setUser} />;
  return <MainApp user={user} onLogout={handleLogout} />;
};

export default App;
