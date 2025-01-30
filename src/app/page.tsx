"use client";

import { useEffect, useState } from "react";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Expense = {
  id?: number;
  name: string;
  amount: number;
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState<number>(1000);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [newExpense, setNewExpense] = useState<Expense>({ id: 0, name: '', amount: 0 });
  const [isEditing, setIsEditing] = useState<boolean>(false); // Controle de edição
  const [modalOpen, setModalOpen] = useState<boolean>(false); // Controle da abertura do modal

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await axios.get('/api/expenses');
    console.log("Despesas: ", res.data)
    setExpenses(res.data);
    calculateBalance(res.data);
  };

  const calculateBalance = (expenses: Expense[]) => {
    const total = expenses.reduce((acc: number, curr: Expense) => {
      // Garantir que curr.amount seja um número válido
      const validAmount = !isNaN(Number(curr.amount)) ? Number(curr.amount) : 0;
      return acc + validAmount;
    }, 0);
  
    setTotalCost(total);  // Exibe o total de gastos calculado
    setBalance(1000.00 - total);  // Calcula o saldo com base no total de gastos
  };
  
  const addExpense = async () => {
    console.log("Sending data:", newExpense);  // Verifique os dados enviados
    
    const { id, ...expenseData } = newExpense;  // Remover o id

    try {
        const response = await axios.post('/api/expenses', expenseData);  // Enviar sem o id
        console.log("Response:", response);
        setNewExpense({ name: '', amount: 0 });
        setModalOpen(false); // Fechar o modal após adicionar a despesa
        fetchExpenses();
    } catch (error) {
        console.error("Error adding expense:", error);
    }
};

  const updateExpense = async () => {
    await axios.put('/api/expenses', newExpense);
    setNewExpense({ name: '', amount: 0 });
    setModalOpen(false); // Fechar o modal após editar a despesa
    setIsEditing(false);
    fetchExpenses();
  };

  const deleteExpense = async (id: number) => {
    await axios.delete('/api/expenses', { data: { id } });
    fetchExpenses();
  };

  const handleEditExpense = (expense: Expense) => {
    setNewExpense(expense);
    setIsEditing(true); // Modo de edição
    setModalOpen(true); // Abrir o modal
  };

  const handleAddExpense = () => {
    setNewExpense({ id: 0, name: '', amount: 0 });
    setIsEditing(false); // Modo de criação
    setModalOpen(true); // Abrir o modal
  };

  // const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   let value = e.target.value;
  
  //   value = value.replace(',', '.');
  
  //   const amount = parseFloat(value);

  //   if (!isNaN(amount)) {
  //     setNewExpense({ ...newExpense, amount });
  //   } 
  // };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Controle de Gastos</h1>
      <div className="flex justify-between mt-4 p-4 bg-gray-100 rounded-lg">
        <span>
          Saldo:{" "}
          <span className={balance < 0 ? "text-red-500" : ""}>
              R$ {balance.toFixed(2)}
          </span>
      </span>
      <span>
          Total de Gastos:{" "}
          <span>R$ {totalCost.toFixed(2)}</span>
      </span>
      </div>
      <ul className="mt-4">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex justify-between p-2 border-b">
            <span>{expense.name}</span>
            <span>R$ {expense.amount}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEditExpense(expense)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => expense.id !== undefined && deleteExpense(expense.id)}>
                Remover
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Botão para abrir o modal de adicionar despesa */}
      <Dialog open={modalOpen} onOpenChange={(open) => setModalOpen(open)}>
        <DialogTrigger asChild>
          <Button className="mt-4" onClick={handleAddExpense}>Adicionar Despesa</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{isEditing ? 'Editar Despesa' : 'Adicionar Despesa'}</DialogTitle>
          <Input
            placeholder="Nome"
            value={newExpense.name}
            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Valor"
            onChange={(e) => {
                const value = e.target.value;
                setNewExpense({ ...newExpense, amount: parseFloat(value) })
            }}
          />

          <Button onClick={isEditing ? updateExpense : addExpense}>
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
