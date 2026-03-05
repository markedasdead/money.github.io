let state = JSON.parse(localStorage.getItem('walletData')) || {
    password: "0000",
    balance: 0,
    transactions: [],
    categories: ['Еда', 'Транспорт', 'Зарплата']
};

const save = () => localStorage.setItem('walletData', JSON.stringify(state));
const format = (num) => new Intl.NumberFormat('ru-RU').format(num) + ' ₽';

const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const balanceView = document.getElementById('balance-view');
const catSelect = document.getElementById('category-select');

document.getElementById('login-btn').onclick = () => {
    const passInput = document.getElementById('login-pass');
    if (passInput.value === state.password) {
        authScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        render();
    } else {
        document.getElementById('auth-error').classList.remove('hidden');
        passInput.value = '';
    }
};

document.getElementById('logout-btn').onclick = () => location.reload();

const addTransaction = (type) => {
    const amountInput = document.getElementById('amount-input');
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Пожалуйста, введите корректное число");
        return;
    }

    state.transactions.push({
        amount,
        type,
        category: catSelect.value,
        date: Date.now()
    });

    state.balance += (type === 'in' ? amount : -amount);
    amountInput.value = '';
    save();
    render();
};

document.getElementById('add-income').onclick = () => addTransaction('in');
document.getElementById('add-expense').onclick = () => addTransaction('out');

document.getElementById('add-cat-btn').onclick = () => {
    const input = document.getElementById('new-cat-input');
    if (input.value.trim()) {
        state.categories.push(input.value.trim());
        input.value = '';
        save();
        render();
    }
};

document.getElementById('change-pass-btn').onclick = () => {
    const newPass = document.getElementById('new-pass-input').value;
    if (newPass.length >= 4) {
        state.password = newPass;
        alert("Пароль изменен!");
        save();
    } else {
        alert("Пароль слишком короткий");
    }
};

function render() {
    balanceView.textContent = format(state.balance);
    balanceView.style.color = state.balance >= 0 ? '#2ecc71' : '#e74c3c';

    catSelect.innerHTML = state.categories.map(c => `<option value="${c}">${c}</option>`).join('');

    const adviceBox = document.getElementById('advice-box');
    const expenses = state.transactions.filter(t => t.type === 'out');
    adviceBox.innerHTML = expenses.length > 3 
        ? "Рекомендация: Вы совершили много покупок. Попробуйте отложить 10% в резерв." 
        : "";

    showStats('month');
}

function showStats(period) {
    const now = Date.now();
    const periods = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
    };

    const filtered = state.transactions.filter(t => (now - t.date) < periods[period]);
    const statsList = document.getElementById('stats-list');
    
    statsList.innerHTML = filtered.reverse().map(t => `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:5px 0;">
            <span>${t.category}</span>
            <span style="color: ${t.type === 'in' ? 'green' : 'red'}">
                ${t.type === 'in' ? '+' : '-'}${format(t.amount)}
            </span>
        </div>
    `).join('') || '<p>Нет данных за этот период</p>';
}

document.querySelectorAll('[data-period]').forEach(btn => {
    btn.onclick = () => showStats(btn.dataset.period);
});
