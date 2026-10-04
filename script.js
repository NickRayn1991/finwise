// ============================================================
//  FinWise — учёт доходов и расходов
// ============================================================

// ===== 1. ДАННЫЕ =====
let operations = JSON.parse(localStorage.getItem('operations')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let recurrings = JSON.parse(localStorage.getItem('recurrings')) || [];
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
let filterMonth = '';
let editingId = null;

let currentCurrency = localStorage.getItem('currency') || 'BYN';
let currentLang = localStorage.getItem('lang') || 'ru';
let currentTheme = localStorage.getItem('theme') || 'light';

// ===== 2. ПЕРЕВОДЫ =====
const translations = {
  ru: {
    tagline: 'Учёт доходов и расходов',
    currency: 'Валюта:',
    balance: 'Баланс',
    income: 'Доход',
    expense: 'Расход',
    budget_title: 'Бюджет на месяц',
    budget_limit: 'Лимит расходов:',
    save: 'Сохранить',
    budget_not_set: 'Лимит не задан',
    payments_goals_title: 'Платежи и цели накоплений',
    goals_title: 'Цели накоплений',
    add_goal: 'Добавить цель',
    no_goals: 'Пока нет целей. Добавь первую!',
    recurring_title: 'Регулярные платежи',
    recurring_monthly: 'В месяц:',
    recurring_yearly: 'В год:',
    recurring_next: 'Ближайшее:',
    add_recurring: 'Добавить',
    no_recurring: 'Пока нет регулярных платежей',
    every_day: 'каждое',
    day_of_month: 'число',
    confirm_delete_recurring: 'Удалить регулярный платёж?',
    add_operation: 'Добавить операцию',
    edit_operation: 'Редактировать операцию',
    add: 'Добавить',
    cancel: 'Отменить',
    filter_title: 'Фильтр',
    month: 'Месяц:',
    show_all: 'Показать все',
    history: 'История операций',
    date: 'Дата',
    type: 'Тип',
    category: 'Категория',
    amount: 'Сумма',
    comment: 'Комментарий',
    no_operations: 'Пока нет операций. Добавь первую!',
    tip_title: 'Совет по финансовой грамотности',
    another_tip: 'Другой совет',
    settings: 'Настройки',
    language: 'Язык:',
    theme: 'Тема:',
    theme_light: 'Светлая',
    theme_dark: 'Тёмная',
    data_actions: 'Данные:',
    export: 'Экспорт',
    import: 'Импорт',
    clear_all: 'Очистить всё',
    confirm_delete_op: 'Удалить операцию?',
    confirm_delete_goal: 'Удалить цель?',
    confirm_clear_all: 'Удалить ВСЕ данные? Это необратимо!',
    saved: 'Сохранено',
    spent_of: 'Потрачено',
    of: 'из',
    left: 'Осталось',
    over: 'Превышение на',
    target: 'Цель',
    saved_so_far: 'Накоплено',
    add_to_goal: 'Добавить',
    goal_completed: 'Цель достигнута!'
  },
  en: {
    tagline: 'Income & Expense Tracker',
    currency: 'Currency:',
    balance: 'Balance',
    income: 'Income',
    expense: 'Expense',
    budget_title: 'Monthly Budget',
    budget_limit: 'Expense limit:',
    save: 'Save',
    budget_not_set: 'No limit set',
    payments_goals_title: 'Payments & Savings Goals',
    goals_title: 'Savings Goals',
    add_goal: 'Add goal',
    no_goals: 'No goals yet. Add the first one!',
    recurring_title: 'Recurring Payments',
    recurring_monthly: 'Per month:',
    recurring_yearly: 'Per year:',
    recurring_next: 'Next:',
    add_recurring: 'Add',
    no_recurring: 'No recurring payments yet',
    every_day: 'every',
    day_of_month: 'day',
    confirm_delete_recurring: 'Delete recurring payment?',
    add_operation: 'Add operation',
    edit_operation: 'Edit operation',
    add: 'Add',
    cancel: 'Cancel',
    filter_title: 'Filter',
    month: 'Month:',
    show_all: 'Show all',
    history: 'Transaction history',
    date: 'Date',
    type: 'Type',
    category: 'Category',
    amount: 'Amount',
    comment: 'Comment',
    no_operations: 'No operations yet. Add the first one!',
    tip_title: 'Financial Literacy Tip',
    another_tip: 'Another tip',
    settings: 'Settings',
    language: 'Language:',
    theme: 'Theme:',
    theme_light: 'Light',
    theme_dark: 'Dark',
    data_actions: 'Data:',
    export: 'Export',
    import: 'Import',
    clear_all: 'Clear all',
    confirm_delete_op: 'Delete operation?',
    confirm_delete_goal: 'Delete goal?',
    confirm_clear_all: 'Delete ALL data? This is irreversible!',
    saved: 'Saved',
    spent_of: 'Spent',
    of: 'of',
    left: 'Left',
    over: 'Over budget by',
    target: 'Target',
    saved_so_far: 'Saved',
    add_to_goal: 'Add',
    goal_completed: 'Goal achieved!'
  }
};

function t(key) {
  return translations[currentLang][key] || key;
}

// ===== 3. ВАЛЮТЫ =====
const currencySymbols = {
  BYN: 'Br', RUB: '₽', USD: '$', EUR: '€'
};

// ===== 4. КАТЕГОРИИ =====
const categories = {
  income: ['Зарплата', 'Фриланс', 'Подарок', 'Проценты', 'Другое'],
  expense: ['Еда', 'Транспорт', 'Жильё', 'Развлечения', 'Здоровье', 'Одежда', 'Связь', 'Образование', 'Подписки', 'Другое']
};

// ===== 5. СОВЕТЫ =====
const tips = {
  ru: [
    "Правило 50/30/20: 50% дохода — на необходимое, 30% — на желания, 20% — в сбережения.",
    "Сначала откладывай, потом трать. А не наоборот.",
    "Веди учёт каждый день — так ты видишь, куда реально уходят деньги.",
    "Финансовая подушка = 3–6 месяцев твоих расходов.",
    "Крупные покупки — правило 24 часов: подожди сутки, желание часто уходит.",
    "Записывай не только сумму, но и категорию — так видно, где перерасход."
  ],
  en: [
    "50/30/20 rule: 50% income for needs, 30% for wants, 20% for savings.",
    "Save first, spend later — not the other way around.",
    "Track every day — that's how you see where money really goes.",
    "Emergency fund = 3–6 months of your expenses.",
    "Big purchases — 24-hour rule: wait a day, the urge often passes.",
    "Record not just the amount, but the category — it shows where you overspend."
  ]
};

// ===== 6. ЭЛЕМЕНТЫ =====
const form = document.getElementById('operation-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const tableBody = document.getElementById('table-body');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const emptyMsg = document.getElementById('empty-message');
const tipText = document.getElementById('tip-text');
const newTipBtn = document.getElementById('new-tip');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const budgetInput = document.getElementById('budget-input');
const saveBudgetBtn = document.getElementById('save-budget');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const filterMonthInput = document.getElementById('filter-month');
const clearFilterBtn = document.getElementById('clear-filter');
const currencySelect = document.getElementById('currency');

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const langSelect = document.getElementById('lang-select');
const themeSelect = document.getElementById('theme-select');
const themeToggle = document.getElementById('theme-toggle');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const clearAllBtn = document.getElementById('clear-all-btn');

const goalForm = document.getElementById('goal-form');
const goalsList = document.getElementById('goals-list');
const noGoals = document.getElementById('no-goals');

const recurringForm = document.getElementById('recurring-form');
const recurringList = document.getElementById('recurring-list');
const noRecurring = document.getElementById('no-recurring');
const recurringDaySelect = document.getElementById('recurring-day');
const recurringCategorySelect = document.getElementById('recurring-category');

// ===== 7. УТИЛИТЫ =====
function save() {
  localStorage.setItem('operations', JSON.stringify(operations));
}
function saveGoals() {
  localStorage.setItem('goals', JSON.stringify(goals));
}
function saveRecurrings() {
  localStorage.setItem('recurrings', JSON.stringify(recurrings));
}

function formatMoney(num) {
  const symbol = currencySymbols[currentCurrency];
  return num.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' ' + symbol;
}

// ===== 8. ЯЗЫК / ТЕМА =====
function applyLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  const placeholders = {
    ru: { cat: '— Категория —', sum: 'Сумма', com: 'Комментарий' },
    en: { cat: '— Category —', sum: 'Amount', com: 'Comment' }
  }[currentLang];

  const catOpt = categorySelect.querySelector('option[value=""]');
  if (catOpt) catOpt.textContent = placeholders.cat;
  document.getElementById('amount').placeholder = placeholders.sum;
  document.getElementById('comment').placeholder = placeholders.com;

  formTitle.textContent = editingId ? t('edit_operation') : t('add_operation');
  submitBtn.textContent = editingId ? t('save') : t('add');
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  if (themeSelect) themeSelect.value = currentTheme;
}

// ===== 9. КАТЕГОРИИ =====
function updateCategoryOptions(selectedValue) {
  const type = typeSelect.value;
  categorySelect.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = { ru: '— Категория —', en: '— Category —' }[currentLang];
  categorySelect.appendChild(empty);

  categories[type].forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (selectedValue && cat === selectedValue) opt.selected = true;
    categorySelect.appendChild(opt);
  });
}

function fillRecurringCategories() {
  if (!recurringCategorySelect) return;
  recurringCategorySelect.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '— Категория —';
  recurringCategorySelect.appendChild(empty);

  categories.expense.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    recurringCategorySelect.appendChild(opt);
  });
}

function fillRecurringDays() {
  if (!recurringDaySelect) return;
  recurringDaySelect.innerHTML = '';
  for (let i = 1; i <= 31; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    recurringDaySelect.appendChild(opt);
  }
  recurringDaySelect.value = 1;
}
// ===== 10. РЕНДЕР =====
function getVisibleOperations() {
  if (!filterMonth) return operations;
  return operations.filter(op => op.date.startsWith(filterMonth));
}

function updateSummary() {
  const visible = getVisibleOperations();
  const income = visible.filter(op => op.type === 'income').reduce((s, op) => s + op.amount, 0);
  const expense = visible.filter(op => op.type === 'expense').reduce((s, op) => s + op.amount, 0);

  incomeEl.textContent = '+' + formatMoney(income);
  expenseEl.textContent = '-' + formatMoney(expense);
  balanceEl.textContent = formatMoney(income - expense);

  updateProgress(expense);
}

function updateProgress(expense) {
  if (monthlyBudget <= 0) {
    progressFill.style.width = '0%';
    progressText.textContent = t('budget_not_set');
    return;
  }
  const percent = Math.min((expense / monthlyBudget) * 100, 100);
  progressFill.style.width = percent + '%';
  progressFill.classList.remove('warning', 'danger');
  if (percent >= 100) progressFill.classList.add('danger');
  else if (percent >= 80) progressFill.classList.add('warning');

  const left = monthlyBudget - expense;
  if (left >= 0) {
    progressText.textContent = `${t('spent_of')} ${formatMoney(expense)} ${t('of')} ${formatMoney(monthlyBudget)} • ${t('left')} ${formatMoney(left)}`;
  } else {
    progressText.textContent = `${t('over')} ${formatMoney(Math.abs(left))}`;
  }
}

function renderTable() {
  tableBody.innerHTML = '';
  const visible = getVisibleOperations().sort((a, b) => new Date(b.date) - new Date(a.date));

  visible.forEach(op => {
    const row = document.createElement('tr');
    row.className = op.type === 'income' ? 'income-row' : 'expense-row';
    row.innerHTML = `
      <td>${op.date.split('-').reverse().join('.')}</td>
      <td>${op.type === 'income' ? t('income') : t('expense')}</td>
      <td>${op.category}</td>
      <td>${op.type === 'income' ? '+' : '-'}${formatMoney(op.amount)}</td>
      <td>${op.comment || '—'}</td>
      <td>
        <button class="edit-btn" data-id="${op.id}" title="Edit">✏️</button>
        <button class="delete-btn" data-id="${op.id}" title="Delete">✕</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  emptyMsg.style.display = visible.length === 0 ? 'block' : 'none';
}

function renderGoals() {
  goalsList.innerHTML = '';
  noGoals.style.display = goals.length === 0 ? 'block' : 'none';

  goals.forEach(goal => {
    const percent = Math.min((goal.current / goal.target) * 100, 100);
    const completed = goal.current >= goal.target;

    const el = document.createElement('div');
    el.className = 'goal-item' + (completed ? ' completed' : '');
    el.innerHTML = `
      <div class="goal-header">
        <span class="goal-name">${goal.name}${completed ? ' 🎉' : ''}</span>
        <div class="goal-actions">
          <button class="edit-goal" data-id="${goal.id}" title="Edit">✏️</button>
          <button class="del-goal" data-id="${goal.id}" title="Delete">✕</button>
        </div>
      </div>
      <div class="goal-numbers">
        <span>${t('saved_so_far')}: ${formatMoney(goal.current)}</span>
        <span>${t('target')}: ${formatMoney(goal.target)}</span>
      </div>
      <div class="goal-progress-bar">
        <div class="goal-progress-fill" style="width: ${percent}%"></div>
      </div>
      <div class="goal-percent">${percent.toFixed(1)}%${completed ? ' — ' + t('goal_completed') : ''}</div>
      <div class="goal-add-row">
        <input type="number" class="goal-add-input" data-id="${goal.id}" placeholder="+ сумма" min="0" step="0.01">
        <button class="goal-add-btn" data-id="${goal.id}">${t('add_to_goal')}</button>
      </div>
    `;
    goalsList.appendChild(el);
  });
}

function getRecurringSummary() {
  const monthly = recurrings.reduce((s, r) => s + r.amount, 0);
  return { monthly, yearly: monthly * 12 };
}

function getNextRecurring() {
  if (recurrings.length === 0) return null;
  const today = new Date();
  const todayDay = today.getDate();

  const sorted = [...recurrings].sort((a, b) => {
    const aDay = a.day >= todayDay ? a.day - todayDay : a.day + 30 - todayDay;
    const bDay = b.day >= todayDay ? b.day - todayDay : b.day + 30 - todayDay;
    return aDay - bDay;
  });

  return sorted[0];
}

function renderRecurrings() {
  if (!recurringList) return;

  const monthlyEl = document.getElementById('recurring-monthly');
  const yearlyEl = document.getElementById('recurring-yearly');
  const nextEl = document.getElementById('recurring-next');

  const summary = getRecurringSummary();
  monthlyEl.textContent = '−' + formatMoney(summary.monthly);
  monthlyEl.style.color = 'var(--expense)';

  yearlyEl.textContent = '−' + formatMoney(summary.yearly);
  yearlyEl.style.color = 'var(--expense)';

  const next = getNextRecurring();
  if (next) {
    nextEl.textContent = `${next.name} — ${next.day} ${t('day_of_month')}`;
  } else {
    nextEl.textContent = '—';
  }

  recurringList.innerHTML = '';
  if (noRecurring) noRecurring.style.display = recurrings.length === 0 ? 'block' : 'none';

  recurrings.forEach(rec => {
    const el = document.createElement('div');
    el.className = 'recurring-item';
    el.innerHTML = `
      <div class="recurring-info">
        <div class="recurring-name">${rec.name}</div>
        <div class="recurring-meta">${rec.category} • ${t('every_day')} ${rec.day} ${t('day_of_month')}</div>
      </div>
      <div class="recurring-actions">
        <span class="recurring-amount">−${formatMoney(rec.amount)}</span>
        <button class="run-recurring" data-id="${rec.id}" title="Add now">➕</button>
        <button class="del-recurring" data-id="${rec.id}" title="Delete">✕</button>
      </div>
    `;
    recurringList.appendChild(el);
  });
}

function render() {
  updateSummary();
  renderTable();
  renderGoals();
  renderRecurrings();
}

function showRandomTip() {
  const arr = tips[currentLang] || tips.ru;
  tipText.textContent = arr[Math.floor(Math.random() * arr.length)];
}

// ===== 11. ФОРМА =====
function resetForm() {
  editingId = null;
  document.getElementById('edit-id').value = '';
  form.reset();
  document.getElementById('date').valueAsDate = new Date();
  formTitle.textContent = t('add_operation');
  submitBtn.textContent = t('add');
  cancelEditBtn.style.display = 'none';
  updateCategoryOptions();
}

function startEdit(id) {
  const op = operations.find(o => o.id === id);
  if (!op) return;

  editingId = id;
  document.getElementById('edit-id').value = id;
  document.getElementById('date').value = op.date;
  typeSelect.value = op.type;
  updateCategoryOptions(op.category);
  document.getElementById('amount').value = op.amount;
  document.getElementById('comment').value = op.comment || '';

  formTitle.textContent = t('edit_operation');
  submitBtn.textContent = t('save');
  cancelEditBtn.style.display = 'block';

  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// ===== 12. СОБЫТИЯ: ФОРМА =====
typeSelect.addEventListener('change', () => updateCategoryOptions());

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const opData = {
    date: document.getElementById('date').value,
    type: typeSelect.value,
    category: categorySelect.value,
    amount: parseFloat(document.getElementById('amount').value),
    comment: document.getElementById('comment').value.trim()
  };

  if (editingId) {
    const idx = operations.findIndex(o => o.id === editingId);
    operations[idx] = { ...operations[idx], ...opData };
  } else {
    operations.push({ id: Date.now().toString(), ...opData });
  }

  save();
  resetForm();
  render();
});

cancelEditBtn.addEventListener('click', resetForm);

tableBody.addEventListener('click', (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (confirm(t('confirm_delete_op'))) {
      operations = operations.filter(op => op.id !== id);
      save();
      if (editingId === id) resetForm();
      render();
    }
  }

  if (e.target.classList.contains('edit-btn')) {
    startEdit(id);
  }
});

// ===== 13. СОБЫТИЯ: БЮДЖЕТ =====
saveBudgetBtn.addEventListener('click', () => {
  const val = parseFloat(budgetInput.value);
  monthlyBudget = isNaN(val) || val < 0 ? 0 : val;
  localStorage.setItem('monthlyBudget', monthlyBudget);
  updateSummary();
});

// ===== 14. СОБЫТИЯ: ФИЛЬТР =====
filterMonthInput.addEventListener('change', () => {
  filterMonth = filterMonthInput.value;
  render();
});

clearFilterBtn.addEventListener('click', () => {
  filterMonth = '';
  filterMonthInput.value = '';
  render();
});

// ===== 15. СОБЫТИЯ: СОВЕТ =====
newTipBtn.addEventListener('click', showRandomTip);

// ===== 16. СОБЫТИЯ: ВАЛЮТА =====
currencySelect.addEventListener('change', () => {
  currentCurrency = currencySelect.value;
  localStorage.setItem('currency', currentCurrency);
  render();
});

// ===== 17. СОБЫТИЯ: ЦЕЛИ =====
goalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('goal-name').value.trim();
  const target = parseFloat(document.getElementById('goal-target').value);
  const current = parseFloat(document.getElementById('goal-current').value) || 0;

  if (!name || isNaN(target) || target <= 0) return;

  goals.push({
    id: Date.now().toString(),
    name,
    target,
    current
  });

  saveGoals();
  goalForm.reset();
  document.getElementById('goal-current').value = 0;
  renderGoals();
});

goalsList.addEventListener('click', (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  if (e.target.classList.contains('del-goal')) {
    if (confirm(t('confirm_delete_goal'))) {
      goals = goals.filter(g => g.id !== id);
      saveGoals();
      renderGoals();
    }
  }

  if (e.target.classList.contains('edit-goal')) {
    const newName = prompt('Название:', goal.name);
    if (newName === null) return;
    const newTarget = parseFloat(prompt('Цель (сумма):', goal.target));
    if (isNaN(newTarget) || newTarget <= 0) return;
    const newCurrent = parseFloat(prompt('Накоплено:', goal.current));
    if (isNaN(newCurrent) || newCurrent < 0) return;

    goal.name = newName.trim() || goal.name;
    goal.target = newTarget;
    goal.current = newCurrent;
    saveGoals();
    renderGoals();
  }

  if (e.target.classList.contains('goal-add-btn')) {
    const input = goalsList.querySelector(`.goal-add-input[data-id="${id}"]`);
    const add = parseFloat(input.value);
    if (isNaN(add) || add === 0) return;
    goal.current += add;
    if (goal.current < 0) goal.current = 0;
    saveGoals();
    renderGoals();
  }
});

// ===== 18. СОБЫТИЯ: РЕГУЛЯРНЫЕ ПЛАТЕЖИ =====
if (recurringForm) {
  recurringForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('recurring-name').value.trim();
    const category = recurringCategorySelect.value;
    const amount = parseFloat(document.getElementById('recurring-amount').value);
    const day = parseInt(recurringDaySelect.value);

    if (!name || !category || isNaN(amount) || amount <= 0 || isNaN(day)) return;

    recurrings.push({
      id: Date.now().toString(),
      name, category, amount, day
    });

    saveRecurrings();
    recurringForm.reset();
    recurringDaySelect.value = 1;
    renderRecurrings();
  });
}

if (recurringList) {
  recurringList.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    const rec = recurrings.find(r => r.id === id);
    if (!rec) return;

    if (e.target.classList.contains('del-recurring')) {
      if (confirm(t('confirm_delete_recurring'))) {
        recurrings = recurrings.filter(r => r.id !== id);
        saveRecurrings();
        renderRecurrings();
      }
    }

    if (e.target.classList.contains('run-recurring')) {
      const today = new Date().toISOString().slice(0, 10);
      operations.push({
        id: Date.now().toString(),
        date: today,
        type: 'expense',
        category: rec.category,
        amount: rec.amount,
        comment: `${rec.name} (регулярный)`
      });
      save();
      render();
      alert(`✓ Операция "${rec.name}" добавлена на сегодня`);
    }
  });
}

// ===== 19. СОБЫТИЯ: НАСТРОЙКИ =====
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('active');
});

closeSettings.addEventListener('click', () => {
  settingsModal.classList.remove('active');
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.remove('active');
  }
});

langSelect.addEventListener('change', () => {
  currentLang = langSelect.value;
  localStorage.setItem('lang', currentLang);
  applyLanguage();
  updateCategoryOptions();
  render();
  showRandomTip();
});

themeSelect.addEventListener('change', () => {
  currentTheme = themeSelect.value;
  localStorage.setItem('theme', currentTheme);
  applyTheme();
});

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
  applyTheme();
});

// Экспорт
exportBtn.addEventListener('click', () => {
  const data = {
    operations,
    goals,
    recurrings,
    monthlyBudget,
    currency: currentCurrency,
    lang: currentLang,
    theme: currentTheme,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const now = new Date();
const stamp = now.toISOString().slice(0,16).replace('T', '_').replace(':', '-');
a.download = `finwise-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Импорт
importBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (confirm('Импортировать данные? Текущие будут заменены.')) {
        operations = data.operations || [];
        goals = data.goals || [];
        recurrings = data.recurrings || [];
        monthlyBudget = data.monthlyBudget || 0;
        if (data.currency) currentCurrency = data.currency;
        if (data.lang) currentLang = data.lang;
        if (data.theme) currentTheme = data.theme;

        save();
        saveGoals();
        saveRecurrings();
        localStorage.setItem('monthlyBudget', monthlyBudget);
        localStorage.setItem('currency', currentCurrency);
        localStorage.setItem('lang', currentLang);
        localStorage.setItem('theme', currentTheme);

        budgetInput.value = monthlyBudget > 0 ? monthlyBudget : '';
        currencySelect.value = currentCurrency;
        langSelect.value = currentLang;
        themeSelect.value = currentTheme;
        applyTheme();
        applyLanguage();
        render();
      }
    } catch (err) {
      alert('Ошибка: файл повреждён или неверного формата');
    }
  };
  reader.readAsText(file);
  importFile.value = '';
});

clearAllBtn.addEventListener('click', () => {
  if (confirm(t('confirm_clear_all'))) {
    localStorage.clear();
    operations = [];
    goals = [];
    recurrings = [];
    monthlyBudget = 0;
    currentCurrency = 'BYN';
    currentLang = 'ru';
    currentTheme = 'light';
    budgetInput.value = '';
    currencySelect.value = 'BYN';
    langSelect.value = 'ru';
    themeSelect.value = 'light';
    applyTheme();
    applyLanguage();
    render();
  }
});

// ===== 20. ЗАПУСК =====
document.getElementById('date').valueAsDate = new Date();
budgetInput.value = monthlyBudget > 0 ? monthlyBudget : '';
currencySelect.value = currentCurrency;
langSelect.value = currentLang;
themeSelect.value = currentTheme;

fillRecurringCategories();
fillRecurringDays();
applyTheme();
applyLanguage();
updateCategoryOptions();
showRandomTip();
render();