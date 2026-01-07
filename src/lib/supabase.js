import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqsppylbzqernvywosvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxc3BweWxienFlcm52eXdvc3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNjEzNzgsImV4cCI6MjA4MjczNzM3OH0.YTy7FWG9pTM9VxJWI0R2Uur2vg-j_AYjz89yZkZ_iXM';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// AUTH HELPERS
// ============================================
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ============================================
// DATA HELPERS
// ============================================

// СФЕРЫ
export const getSpheres = async (userId) => {
  const { data, error } = await supabase.from('spheres').select('*').eq('user_id', userId).order('sort_order');
  return { data, error };
};

export const saveSphere = async (sphere) => {
  const { data, error } = await supabase.from('spheres').upsert(sphere).select();
  return { data, error };
};

export const deleteSphere = async (id) => {
  const { error } = await supabase.from('spheres').delete().eq('id', id);
  return { error };
};

// МЕЧТЫ
export const getDreams = async (userId) => {
  const { data, error } = await supabase.from('dreams').select('*').eq('user_id', userId).order('sort_order');
  return { data, error };
};

export const saveDream = async (dream) => {
  const { data, error } = await supabase.from('dreams').upsert(dream).select();
  return { data, error };
};

export const deleteDream = async (id) => {
  const { error } = await supabase.from('dreams').delete().eq('id', id);
  return { error };
};

// ЦЕЛИ
export const getGoals = async (userId) => {
  const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).order('sort_order');
  return { data, error };
};

export const saveGoal = async (goal) => {
  const { data, error } = await supabase.from('goals').upsert(goal).select();
  return { data, error };
};

export const deleteGoal = async (id) => {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  return { error };
};

// РУБЕЖИ (STEPS)
export const getSteps = async (userId) => {
  const { data, error } = await supabase.from('steps').select('*').eq('user_id', userId).order('sort_order');
  return { data, error };
};

export const saveStep = async (step) => {
  const { data, error } = await supabase.from('steps').upsert(step).select();
  return { data, error };
};

export const deleteStep = async (id) => {
  const { error } = await supabase.from('steps').delete().eq('id', id);
  return { error };
};

// ДЕЙСТВИЯ
export const getActions = async (userId) => {
  const { data, error } = await supabase.from('actions').select('*').eq('user_id', userId).order('sort_order');
  return { data, error };
};

export const saveAction = async (action) => {
  const { data, error } = await supabase.from('actions').upsert(action).select();
  return { data, error };
};

export const deleteAction = async (id) => {
  const { error } = await supabase.from('actions').delete().eq('id', id);
  return { error };
};

// ПОДЗАДАЧИ
export const getSubtasks = async (userId) => {
  const { data, error } = await supabase.from('subtasks').select('*').eq('user_id', userId);
  return { data, error };
};

export const saveSubtask = async (subtask) => {
  const { data, error } = await supabase.from('subtasks').upsert(subtask).select();
  return { data, error };
};

export const deleteSubtask = async (id) => {
  const { error } = await supabase.from('subtasks').delete().eq('id', id);
  return { error };
};

// ВИДЫ ДЕЯТЕЛЬНОСТИ
export const getActivities = async (userId) => {
  const { data, error } = await supabase.from('activities').select('*').eq('user_id', userId).order('sort_order');
  return { data, error };
};

export const saveActivity = async (activity) => {
  const { data, error } = await supabase.from('activities').upsert(activity).select();
  return { data, error };
};

export const deleteActivity = async (id) => {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  return { error };
};

// СЕССИИ
export const getSessions = async (userId) => {
  const { data, error } = await supabase.from('sessions').select('*').eq('user_id', userId).order('start_at', { ascending: false });
  return { data, error };
};

export const saveSession = async (session) => {
  const { data, error } = await supabase.from('sessions').upsert(session).select();
  return { data, error };
};

export const deleteSession = async (id) => {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  return { error };
};

// КАТЕГОРИИ ФИНАНСОВ
export const getFinanceCategories = async (userId) => {
  const { data, error } = await supabase.from('finance_categories').select('*').eq('user_id', userId).order('sort_order');
  return { data, error };
};

export const saveFinanceCategory = async (category) => {
  const { data, error } = await supabase.from('finance_categories').upsert(category).select();
  return { data, error };
};

export const deleteFinanceCategory = async (id) => {
  const { error } = await supabase.from('finance_categories').delete().eq('id', id);
  return { error };
};

// ФОНДЫ
export const getFunds = async (userId) => {
  const { data, error } = await supabase.from('funds').select('*').eq('user_id', userId).order('sort_order');
  return { data, error };
};

export const saveFund = async (fund) => {
  const { data, error } = await supabase.from('funds').upsert(fund).select();
  return { data, error };
};

export const deleteFund = async (id) => {
  const { error } = await supabase.from('funds').delete().eq('id', id);
  return { error };
};

// ТРАНЗАКЦИИ
export const getTransactions = async (userId) => {
  const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
  return { data, error };
};

export const saveTransaction = async (transaction) => {
  const { data, error } = await supabase.from('transactions').upsert(transaction).select();
  return { data, error };
};

export const deleteTransaction = async (id) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  return { error };
};

// БЮДЖЕТЫ
export const getBudgets = async (userId) => {
  const { data, error } = await supabase.from('budgets').select('*').eq('user_id', userId);
  return { data, error };
};

export const saveBudget = async (budget) => {
  const { data, error } = await supabase.from('budgets').upsert(budget).select();
  return { data, error };
};

// НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ
export const getUserSettings = async (userId) => {
  const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
  return { data, error };
};

export const saveUserSettings = async (settings) => {
  const { data, error } = await supabase.from('user_settings').upsert(settings).select();
  return { data, error };
};

// ============================================
// ЗАГРУЗИТЬ ВСЕ ДАННЫЕ
// ============================================
export const loadAllData = async (userId) => {
  // Функция безопасного запроса
  const safeGet = async (fn) => {
    try {
      const result = await fn(userId);
      return result.data || [];
    } catch (err) {
      console.warn('Load error:', err);
      return [];
    }
  };

  // Загружаем данные последовательно для стабильности на iOS
  const spheres = await safeGet(getSpheres);
  const dreams = await safeGet(getDreams);
  const goals = await safeGet(getGoals);
  const steps = await safeGet(getSteps);
  const actions = await safeGet(getActions);
  const activities = await safeGet(getActivities);
  const sessions = await safeGet(getSessions);
  const categories = await safeGet(getFinanceCategories);
  const fundsData = await safeGet(getFunds);
  const transactions = await safeGet(getTransactions);
  const budgetsData = await safeGet(getBudgets);

  // Конвертируем snake_case в camelCase
  const convertKeys = (obj) => {
    if (!obj) return obj;
    const newObj = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = obj[key];
    }
    return newObj;
  };

  const convertArray = (arr) => arr?.map(convertKeys) || [];

  // Преобразуем бюджеты в объект
  const budgetsObj = {};
  budgetsData?.forEach(b => {
    const key = `${b.category_id}_${b.year}_${b.month}`;
    budgetsObj[key] = b.limit_amount;
  });

  return {
    spheres: convertArray(spheres),
    dreams: convertArray(dreams),
    goals: convertArray(goals),
    steps: convertArray(steps),
    actions: convertArray(actions),
    activities: convertArray(activities),
    sessions: convertArray(sessions),
    financeCategories: convertArray(categories),
    funds: convertArray(fundsData),
    transactions: convertArray(transactions),
    budgets: budgetsObj,
    milestones: [],
    goalCriteria: []
  };
};
