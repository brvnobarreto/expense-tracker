"use client";

import { useEffect, useState } from "react";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Expense = {
  id?: number;
  name: string;
  amount: number;
  date?: string;
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState<number>(1000);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [newExpense, setNewExpense] = useState<Expense>({ id: 0, name: '', amount: 0, date: ''});
  const [isEditing, setIsEditing] = useState<boolean>(false); // Controle de edição
  const [modalOpen, setModalOpen] = useState<boolean>(false); // Controle da abertura do modal
  const [editingExpense, setEditingExpense] = useState({ name: '', amount: '', date: '' });
  

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await axios.get('/api/expenses');
    console.log("Despesas recebidas:", res.data);
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
    console.log("Sending data:", newExpense);

    const { id, ...expenseData } = newExpense;

    // Converte a data para o formato correto
    if (expenseData.date) {
        expenseData.date = new Date(expenseData.date).toISOString().split("T")[0];
    }

    try {
        const response = await axios.post('/api/expenses', expenseData);
        console.log("Response:", response);
        setNewExpense({ name: '', amount: 0, date: '' });
        setModalOpen(false);
        fetchExpenses();
    } catch (error) {
        console.error("Error adding expense:", error);
    }
};

  const updateExpense = async () => {
    await axios.put('/api/expenses', newExpense);
    setNewExpense({ name: '', amount: 0, date: '' });
    setModalOpen(false); // Fechar o modal após editar a despesa
    setIsEditing(false);
    fetchExpenses();
  };

  const deleteExpense = async (id: number) => {
    await axios.delete('/api/expenses', { data: { id } });
    fetchExpenses();
  };

  const handleEditExpense = (expense: Expense) => {
    const formattedDate = expense.date ? new Date(expense.date).toISOString().split("T")[0] : ''; // Formata a data ou define como string vazia
    setNewExpense({ ...expense, date: formattedDate }); // Atualiza o estado
    setIsEditing(true);
    setModalOpen(true);
  };
  

  const handleAddExpense = () => {
    setNewExpense({ id: 0, name: '', amount: 0 });
    setIsEditing(false); // Modo de criação
    setModalOpen(true); // Abrir o modal
  };

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
      {/* Lista de despesas */}
      <ul className="mt-4">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex items-center justify-between p-2 border-b">
            <div>
              <span className="items-center">{expense.name}</span>
              <span className="block text-sm text-gray-500">
                {expense.date ? new Date(expense.date).toLocaleDateString("pt-BR") : "Sem data"}</span> 
            </div>
            <div className="flex space-x-2">
              <span className="text-right p-2">R$ {expense.amount}</span>
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
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4">Adicionar Despesa</Button>
          </DialogTrigger>
            <DialogContent>
              <DialogTitle>{isEditing ? "Editar Despesa" : "Adicionar Despesa"}</DialogTitle>
              <DialogDescription>Insira os detalhes da despesa abaixo.</DialogDescription>

              {/* Entrada para o nome da despesa */}
              <Input
                placeholder="Nome"
                value={newExpense.name} // O valor do input é vinculado ao estado newExpense.name
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} // Atualiza o nome no estado
              />
              
              {/* Entrada para a quantia da despesa */}
              <Input
                type="number"
                step="0.01"
                placeholder="Valor"
                value={newExpense.amount} // O valor do input é vinculado ao estado newExpense.amount
                onChange={(e) => {
                  const value = e.target.value;
                  setNewExpense({ ...newExpense, amount: parseFloat(value) }); // Atualiza o valor no estado
                }}
              />
              
              {/* Entrada para a data da despesa */}
              <Input
                type="date"
                value={newExpense.date || ''} // O valor do input é vinculado ao estado newExpense.date
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} // Atualiza a data no estado
              />

              {/* Botão para salvar ou atualizar */}
              <Button onClick={isEditing ? updateExpense : addExpense}>
                {isEditing ? "Atualizar" : "Salvar"}
              </Button>
            </DialogContent>
        </Dialog>
    </div>
  );
}
