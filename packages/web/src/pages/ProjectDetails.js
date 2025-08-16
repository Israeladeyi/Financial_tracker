import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ProjectDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`*, clients ( name )`)
        .eq('id', id)
        .single();
      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch associated income
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('*')
        .eq('project_id', id);
      if (incomeError) throw incomeError;
      setIncome(incomeData);

      // Fetch associated expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('project_id', id);
      if (expensesError) throw expensesError;
      setExpenses(expensesData);

      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  const totalIncome = income.reduce((acc, i) => acc + i.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  if (loading) return <p>Loading project details...</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div>
      <h2>Project: {project.name}</h2>
      <p><strong>Client:</strong> {project.clients?.name || 'N/A'}</p>

      <h3>Profitability</h3>
      <p><strong>Total Income:</strong> ${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> ${totalExpenses.toFixed(2)}</p>
      <p><strong>Net Profit:</strong> ${netProfit.toFixed(2)}</p>

      <hr />

      <h3>Associated Income</h3>
      <ul>
        {income.map(i => <li key={i.id}>{i.title}: ${i.amount.toFixed(2)}</li>)}
      </ul>

      <h3>Associated Expenses</h3>
      <ul>
        {expenses.map(e => <li key={e.id}>{e.title}: ${e.amount.toFixed(2)}</li>)}
      </ul>
    </div>
  );
}
