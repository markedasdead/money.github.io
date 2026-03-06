const STORAGE_KEY = 'walletData';

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    password: "0000",
    balance: 0,
    transactions: [],
    categories: ['Еда', 'Транспорт', 'Зарплата']
};

const elements = {
    auth: document.getElementById('auth-screen'),
    main: document.getElementById('main-screen'),
    loginPass: document.getElementById('login-pass'),
    error: document.getElementById('auth-error'),
    balanceView: document.getElementById('balance-view'),
    amount: document.getElementById('amount-input'),
    catSelect: document.getElementById('category-select'),
    newCat: document.getElementById('new-cat-input'),
    newPass: document.getElementById('new-pass-input'),
    statsList: document.getElementById('stats-list'),
    advice: document.getElementById('advice-box')
};

const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const formatCurrency = (num) => {
    return new Intl.NumberFormat('ru-RU').format(num) + ' ₽';
};

document.getElementById('login-btn').onclick = () => {
    if (elements.loginPass.value === state.password) {
        elements.auth.classList.add('hidden');
        elements.main.classList.remove('hidden');
        renderApp();
    } else {
        elements.error.classList.remove('hidden');
        elements.loginPass.value = '';
    }
};

document.getElementById('logout-btn').onclick = () => {
    location.reload();
};

function handleTransaction(type) {
    const value = parseFloat(elements.amount.value);

    if (isNaN(value) || value <= 0) {
        alert("Введите корректную сумму");
        return;
    }

    state.transactions.push({
        amount: value,
        type: type,
        category: elements.catSelect.value,
        date: Date.now()
    });

    state.balance += (type === 'in' ? value : -value);
    elements.amount.value = '';
    
    save();
    renderApp();
}

document.getElementById('add-income').onclick = () => handleTransaction('in');
document.getElementById('add-expense').onclick = () => handleTransaction('out');

document.getElementById('add-cat-btn').onclick = () => {
    const name = elements.newCat.value.trim();
    if (name) {
        state.categories.push(name);
        elements.newCat.value = '';
        save();
        renderApp();
    }
};

document.getElementById('change-pass-btn').onclick = () => {
    const val = elements.newPass.value;
    if (val.length >= 4) {
        state.password = val;
        elements.newPass.value = '';
        save();
        alert("Пароль обновлен");
    } else {
        alert("Минимум 4 символа");
    }
};

function renderApp() {
    elements.balanceView.textContent = formatCurrency(state.balance);
    elements.balanceView.style.color = state.balance >= 0 ? '#2ecc71' : '#e74c3c';

    elements.catSelect.innerHTML = state.categories
        .map(c => `<option value="${c}">${c}</option>`)
        .join('');

    const expenseCount = state.transactions.filter(t => t.type === 'out').length;
    elements.advice.textContent = expenseCount > 3 
        ? "Рекомендация: Слишком много трат, попробуйте экономить." 
        : "Финансовое состояние стабильное.";

    updateHistory('month');
}

function updateHistory(period) {
    const now = Date.now();
    const timeframes = {
        day: 86400000,
        week: 604800000,
        month: 2592000000
    };

    const filtered = state.transactions.filter(t => (now - t.date) < timeframes[period]);
    const limit = 7;
    const toShow = filtered.slice(-limit).reverse();

    const createItemHtml = (t) => `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:8px 0;">
            <span>${t.category}</span>
            <span class="amount" style="color: ${t.type === 'in' ? '#2ecc71' : '#e74c3c'}; font-weight: bold;">
                ${t.type === 'in' ? '+' : '-'}${formatCurrency(t.amount)}
            </span>
        </div>
    `;

    elements.statsList.innerHTML = toShow.length 
        ? toShow.map(createItemHtml).join('') 
        : '<p class="centered">Истории пока нет</p>';

    if (filtered.length > limit) {
        const moreBtn = document.createElement('button');
        moreBtn.textContent = 'Показать всё';
        moreBtn.style.cssText = 'width:100%; background:none; color:#4a90e2; margin-top:10px; padding:10px;';
        
        moreBtn.onclick = () => {
            elements.statsList.innerHTML = filtered.slice().reverse().map(createItemHtml).join('');
        };
        elements.statsList.appendChild(moreBtn);
    }
}

document.querySelectorAll('[data-period]').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateHistory(btn.dataset.period);
    };
});
