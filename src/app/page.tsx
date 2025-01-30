"use client";

import { useEffect, useState } from "react";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Expense = {
  id?: number;
  name: string;
  amount: number;
};

export default function Home(){
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState<number>(1000);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [newExpense, setNewExpense] = useState<Expense>({ id: 0, name: '', amount: 0 });
  

  useEffect(() => {
    fetchExpenses();
  }, [])

  const fetchExpenses = async () => {
    const res = await axios.get('/api/expenses');
    setExpenses(res.data);
    calculateBalance(res.data);
  };

  const calculateBalance = (expenses: Expense[]) => {
    const total = expenses.reduce((acc: number, curr: Expense) => acc + curr.amount, 0);
    setTotalCost(total);
    setBalance(1000 - total);
  };

  const addExpense = async () => {
    await axios.post('/api/expenses', newExpense);
    setNewExpense({name:'', amount: 0});
    fetchExpenses();
  };

  const deleteExpense = async (id: number) => {
    await axios.delete('/api/expenses', { data: { id } });
    fetchExpenses();
  };

  return(

    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Controle de Gastos</h1>
      <div className="flex justify-between mt-4 p-4 bg-gray-100 rounded-lg">
        <span>Saldo: R$ {balance.toFixed(2)}</span>
        <span>Total de Gastos: R$ {totalCost.toFixed(2)}</span>
      </div>
      <ul className="mt-4">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex justify-between p-2 border-b">
            <span>{expense.name}</span>
            <span>R$ {expense.amount}</span>
            <Button variant="destructive" size="sm" onClick={() => expense.id !== undefined && deleteExpense(expense.id)}>Remover</Button>
          </li>
        ))}
      </ul>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4">Adicionar Despesa</Button>
        </DialogTrigger>
        <DialogContent>
          <Input placeholder="Nome" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} />
          <Input type="number" placeholder="Valor" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })} />
          <Button onClick={addExpense}>Salvar</Button>
        </DialogContent>
      </Dialog>
    </div>

  );
}