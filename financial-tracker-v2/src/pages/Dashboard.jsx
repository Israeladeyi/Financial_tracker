import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: incomeData } = await supabase.from('income').select('amount, date, status').eq('user_id', user.id);
    setIncome(incomeData || []);

    const { data: expensesData } = await supabase.from('expenses').select('amount, date').eq('user_id', user.id);
    setExpenses(expensesData || []);

    setLoading(false);
  };

  const totalIncome = income.filter(i => i.status === 'received').reduce((acc, i) => acc + i.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const processChartData = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyData = months.reduce((acc, month) => ({ ...acc, [month]: { income: 0, expenses: 0 } }), {});

    income.forEach(i => {
      if (i.status === 'received') {
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
        { label: 'Income', data: months.map(m => monthlyData[m].income), backgroundColor: 'rgba(75, 192, 192, 0.6)' },
        { label: 'Expenses', data: months.map(m => monthlyData[m].expenses), backgroundColor: 'rgba(255, 99, 132, 0.6)' }
      ]
    };
  };

  if (loading) return <p className="text-center py-10">Loading dashboard...</p>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div>
      <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring' }} className="text-3xl font-bold text-gray-800 mb-6">Dashboard</motion.h1>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Income</h3>
          <p className="text-3xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-500">${totalExpenses.toFixed(2)}</p>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Net Profit</h3>
          <p className="text-3xl font-bold text-blue-500">${netProfit.toFixed(2)}</p>
        </motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Overview</h3>
        <div className="h-96">
          <Bar data={processChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}
