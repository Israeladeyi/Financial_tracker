// Supabase credentials
const SUPABASE_URL = 'https://cprlbxraxyzsrqpkuwbi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwcmxieHJheHl6c3JxcGt1d2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDE0MDIsImV4cCI6MjA3MDg3NzQwMn0.Ub2mcOmIB-ZNoVmHruoBB9OQ09Kr3QgULS9iXRAQ3e8';

// Initialize Supabase client
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const transactionForm = document.getElementById('transaction-form');
const transactionTypeSelect = document.getElementById('transaction-type');
const incomeFields = document.getElementById('income-fields');
const expenseFields = document.getElementById('expense-fields');
const transactionTableBody = document.getElementById('transaction-table-body');

// --- EVENT LISTENERS ---

// Toggle form fields based on transaction type
transactionTypeSelect.addEventListener('change', () => {
    if (transactionTypeSelect.value === 'income') {
        incomeFields.classList.remove('hidden');
        expenseFields.classList.add('hidden');
    } else {
        incomeFields.classList.add('hidden');
        expenseFields.classList.remove('hidden');
    }
});

// Handle form submission
transactionForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await addTransaction();
});

// Handle date filtering
document.getElementById('filter-button').addEventListener('click', () => {
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    loadTransactions(startDate, endDate);
});


// --- CORE FUNCTIONS ---

/**
 * Fetches transactions from Supabase and renders them in the table.
 * @param {string} [startDate] - Optional start date for filtering.
 * @param {string} [endDate] - Optional end date for filtering.
 */
async function loadTransactions(startDate, endDate) {
    let query = db.from('transactions').select('*').order('date', { ascending: false });

    if (startDate) {
        query = query.gte('date', startDate);
    }
    if (endDate) {
        query = query.lte('date', endDate);
    }

    const { data: transactions, error } = await query;

    if (error) {
        console.error('Error loading transactions:', error);
        alert('Failed to load transactions.');
        return;
    }

    renderTransactions(transactions);
    updateDashboard(transactions);
    updateChart(transactions);
}

/**
 * Renders a list of transactions into the table.
 * @param {Array} transactions The list of transactions to render.
 */
function renderTransactions(transactions) {
    transactionTableBody.innerHTML = ''; // Clear existing rows

    if (transactions.length === 0) {
        transactionTableBody.innerHTML = '<tr><td colspan="6">No transactions yet.</td></tr>';
        return;
    }

    transactions.forEach(tx => {
        const row = document.createElement('tr');

        const description = tx.type === 'income'
            ? `${tx.clientName} - ${tx.projectName}`
            : `${tx.category} - ${tx.itemName}`;

        const status = tx.type === 'income'
            ? (tx.isPaid ? 'Paid' : 'Unpaid')
            : 'N/A';

        row.innerHTML = `
            <td>${tx.date}</td>
            <td>${tx.type}</td>
            <td>${description}</td>
            <td>$${tx.amount.toFixed(2)}</td>
            <td>${status}</td>
            <td>
                <button onclick="deleteTransaction(${tx.id})">Delete</button>
                ${tx.type === 'income' && !tx.isPaid ? `<button onclick="updateTransaction(${tx.id}, { is_paid: true })">Mark Paid</button>` : ''}
            </td>
        `;
        transactionTableBody.appendChild(row);
    });
}

/**
 * Calculates and updates the dashboard summary.
 * @param {Array} transactions The list of all transactions.
 */
function updateDashboard(transactions) {
    const totalIncome = transactions
        .filter(tx => tx.type === 'income' && tx.isPaid)
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpenses = transactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const netProfit = totalIncome - totalExpenses;

    document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('net-profit').textContent = `$${netProfit.toFixed(2)}`;
}

let financeChart; // Global variable to hold the chart instance

/**
 * Processes transaction data and updates the bar chart.
 * @param {Array} transactions The list of all transactions.
 */
function updateChart(transactions) {
    const ctx = document.getElementById('finance-chart').getContext('2d');

    // Process data for the last 6 months
    const monthlyData = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('default', { month: 'long' });
        monthlyData[month] = { income: 0, expenses: 0 };
    }

    transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate >= sixMonthsAgo) {
            const month = txDate.toLocaleString('default', { month: 'long' });
            if (monthlyData[month]) {
                if (tx.type === 'income' && tx.isPaid) {
                    monthlyData[month].income += tx.amount;
                } else if (tx.type === 'expense') {
                    monthlyData[month].expenses += tx.amount;
                }
            }
        }
    });

    const labels = Object.keys(monthlyData);
    const incomeData = labels.map(month => monthlyData[month].income);
    const expenseData = labels.map(month => monthlyData[month].expenses);

    // Destroy previous chart instance if it exists
    if (financeChart) {
        financeChart.destroy();
    }

    financeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/**
 * Adds a new transaction to the database and reloads the table.
 */
async function addTransaction() {
    const formData = new FormData(transactionForm);
    const transactionData = Object.fromEntries(formData.entries());

    // Basic data massage
    transactionData.amount = parseFloat(transactionData.amount);
    transactionData.isPaid = transactionData.isPaid === 'on';

    console.log('Adding transaction:', transactionData);

    const { data, error } = await db
        .from('transactions')
        .insert([transactionData]);

    if (error) {
        console.error('Error adding transaction:', error);
        alert('Failed to add transaction.');
    } else {
        console.log('Transaction added successfully:', data);
        transactionForm.reset();
        // Reload transactions to show the new one
        await loadTransactions();
    }
}

/**
 * Deletes a transaction by its ID.
 * @param {number} id The ID of the transaction to delete.
 */
async function deleteTransaction(id) {
    const isConfirmed = confirm('Are you sure you want to delete this transaction?');
    if (!isConfirmed) return;

    const { error } = await db
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction.');
    } else {
        console.log('Transaction deleted successfully');
        await loadTransactions();
    }
}

/**
 * Updates a transaction by its ID.
 * @param {number} id The ID of the transaction to update.
 * @param {object} updates The fields to update.
 */
async function updateTransaction(id, updates) {
    const { data, error } = await db
        .from('transactions')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating transaction:', error);
        alert('Failed to update transaction.');
    } else {
        console.log('Transaction updated successfully:', data);
        await loadTransactions();
    }
}


// --- INITIALIZATION ---

// Load all transactions when the page is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Set default form state
    transactionTypeSelect.dispatchEvent(new Event('change'));

    // Load initial data
    await loadTransactions();
});
