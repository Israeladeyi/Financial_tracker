import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('amount, date, status')
        .eq('user_id', user.id);

      if (incomeError) throw incomeError;
      setIncome(incomeData);

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('user_id', user.id);

      if (expensesError) throw expensesError;
      setExpenses(expensesData);

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Calculations ---
  const totalIncome = income
    .filter(i => i.status === 'received')
    .reduce((acc, i) => acc + i.amount, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // --- Chart Data Processing ---
  const processChartData = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyData = months.reduce((acc, month) => {
        acc[month] = { income: 0, expenses: 0 };
        return acc;
    }, {});

    income.forEach(i => {
        if(i.status === 'received') {
            const month = months[new Date(i.date).getMonth()];
            monthlyData[month].income += i.amount;
        }
    });

    expenses.forEach(e => {
        const month = months[new Date(e.date).getMonth()];
        monthlyData[month].expenses += e.amount;
    });

    return {
        labels: months,
        datasets: [
            {
                label: 'Total Income',
                data: months.map(m => monthlyData[m].income),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
                label: 'Total Expenses',
                data: months.map(m => monthlyData[m].expenses),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ]
    };
  };

  const chartData = processChartData();

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3>Total Income</h3>
          <p>${totalIncome.toFixed(2)}</p>
        </div>
        <div>
          <h3>Total Expenses</h3>
          <p>${totalExpenses.toFixed(2)}</p>
        </div>
        <div>
          <h3>Net Profit</h3>
          <p>${netProfit.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ height: '400px' }}>
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Monthly Income vs Expenses' } } }} />
      </div>
    </div>
  );
}
