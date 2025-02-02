"use client";

import { useEffect, useState } from "react";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Loader2 } from "lucide-react";
import { format, parseISO, startOfDay, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';


type Expense = {
    id?: number;
    name: string;
    amount: number;
    date: string | null;
};

export default function Home() {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [newExpense, setNewExpense] = useState<Expense>({ name: '', amount: 0, date: null });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalBalanceOpen, setModalBalanceOpen] = useState<boolean>(false);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [initialBalanceLoaded, setInitialBalanceLoaded] = useState(false);
  const [inputBalance, setInputBalance] = useState<number>(0);
  const [isSavingBalance, setIsSavingBalance] = useState<boolean>(false);
  const [isSavingExpense, setIsSavingExpense] = useState<boolean>(false);
  const [initialBalance, setInitialBalance] = useState<number>(0);

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [expensesRes, balanceRes] = await Promise.all([
            axios.get('/api/expenses'),
            axios.get('/api/balance')
        ]);

        const formattedExpenses = expensesRes.data.map((expense: Expense) => ({
            ...expense,
            amount: Number(expense.amount),
            date: expense.date ? new Date(expense.date).toISOString() : null
        }));

        const balanceAmount = Number(balanceRes.data.amount);

        setExpenses(formattedExpenses);
        setBalance(balanceAmount);
        setInitialBalance(balanceAmount);
        setInputBalance(balanceAmount);
        setInitialBalanceLoaded(true);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
      // Calcula o custo total
      const newTotalCost = expenses.reduce((acc, expense) => acc + Number(expense.amount), 0);
      setTotalCost(newTotalCost);

      // Calcula o saldo
      if (initialBalanceLoaded) {
        setBalance(initialBalance - newTotalCost);
    }

  }, [expenses, initialBalance]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/expenses');
      const formattedExpenses = res.data.map((expense: Expense) => ({
        ...expense,
        amount: Number(expense.amount),
        // Mantém a data no formato YYYY-MM-DD sem conversão para ISO
        date: expense.date
      }));
      setExpenses(formattedExpenses);
    } catch (error) {
      console.error("Erro ao buscar despesas:", error);
    }
    setLoading(false);
  };

  const fetchBalance = async () => {
      try {
          const res = await axios.get('/api/balance');
          const balanceAmount = Number(res.data.amount);
          setBalance(balanceAmount);
          setInitialBalance(balanceAmount);
          setInputBalance(balanceAmount);
          setInitialBalanceLoaded(true);
      } catch (error) {
          console.error("Erro ao buscar saldo:", error);
      }
  };

  const addExpense = async () => {
    setIsSavingExpense(true);
    try {
      const { id, ...expenseData } = newExpense;
  
      // Garante que a data seja tratada como horário local
      const date = newExpense.date ? new Date(newExpense.date + 'T00:00:00') : new Date();
  
      const amount = Number(newExpense.amount);
  
      // Envia a data no formato YYYY-MM-DD (sem timezone)
      await axios.post('/api/expenses', {
        ...expenseData,
        date: format(date, 'yyyy-MM-dd'),
        amount
      });
  
      // Busca as despesas atualizadas do servidor
      await fetchExpenses();
  
      // Reseta o formulário
      setNewExpense({ name: '', amount: 0, date: null });
      setModalOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
    } finally {
      setIsSavingExpense(false);
    }
  };

  const updateExpense = async () => {
    setIsSavingExpense(true);
    try {
      const { id, ...expenseData } = newExpense;
  
      // Garante que a data seja tratada como horário local
      const date = newExpense.date ? new Date(newExpense.date + 'T00:00:00') : new Date();
  
      const amount = Number(newExpense.amount);
  
      // Envia a data no formato YYYY-MM-DD (sem timezone)
      await axios.put('/api/expenses', {
        ...expenseData,
        date: format(date, 'yyyy-MM-dd'),
        amount,
        id
      });
  
      // Busca as despesas atualizadas do servidor
      await fetchExpenses();
  
      // Reseta o formulário e fecha o modal
      setNewExpense({ name: '', amount: 0, date: null });
      setModalOpen(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
    } finally {
      setIsSavingExpense(false);
    }
  };
  const deleteExpense = async (id: number) => {
      try {
          await axios.delete('/api/expenses', { data: { id } });
          setExpenses((prev) => prev.filter(expense => expense.id !== id));
      } catch (error) {
          console.error("Erro ao remover despesa:", error);
      }
  };

  const handleEditExpense = (expense: Expense) => {
    try {
        if (!expense.date) {
            throw new Error('Data inválida');
        }

        // Verifica se a data já está no formato ISO antes de convertê-la
        const rawDate = isValid(parseISO(expense.date)) ? parseISO(expense.date) : new Date(expense.date);
        
        if (!isValid(rawDate)) {
            throw new Error('Data inválida');
        }

        // Formata corretamente para exibição no input date
        const formattedDate = format(rawDate, 'yyyy-MM-dd');

        setNewExpense({
            ...expense,
            date: formattedDate,
            amount: Number(expense.amount)
        });
        setIsEditing(true);
        setModalOpen(true);
    } catch (error) {
        console.error("Erro ao editar despesa:", error);
    }
};

  
  const handleAddExpense = () => {
      setNewExpense({ name: '', amount: 0, date: null });
      setIsEditing(false);
      setModalOpen(true);
  };

  const handleEditBalance = () => {
      setModalBalanceOpen(true);
      setInputBalance(balance);
  };

  const updateBalance = async () => {
      setIsSavingBalance(true);
      try {
          await axios.put('/api/balance', { amount: inputBalance });
          setBalance(inputBalance);
          setInitialBalance(inputBalance);
          setModalBalanceOpen(false);
      } catch (error) {
          console.error("Erro ao atualizar saldo:", error);
      } finally {
          setIsSavingBalance(false);
      }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sem data';
  
    try {
      // Extrai apenas a parte da data (ignorando a parte do tempo e fuso horário)
      const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  
      // Cria um objeto Date no fuso horário local sem conversão de UTC
      const date = new Date(year, month - 1, day);
  
      // Formata a data corretamente para 'dd/MM/yyyy'
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
  
    } catch (error) {
      console.error('Erro ao formatar data:', error, dateString);
      return 'Data inválida';
    }
  };

  return (
      <div className="p-6 max-w-xl mx-auto mt-11">
          <header className="bg-teal-500 text-white p-4 shadow-md text-center fixed top-0 right-0 left-0">
              <h1 className="text-2xl font-bold">Controle de Gastos</h1>
          </header>

          <div className="flex justify-between mt-4 p-4 bg-gray-100 rounded-lg shadow-md mt-14">
              <div>
                  <p>Saldo:</p>
                  <span className={balance < 0 ? "text-red-500 font-bold" : "font-bold"}>
                      {initialBalanceLoaded ? `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Carregando..."}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleEditBalance}>
                      <Pencil className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                  </Button>
              </div>
              <div>
                  <p>Custo total:</p>
                  <span className="font-bold">
                      R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
              </div>
          </div>

          <div className="fixed bottom-6 right-6">
              <Button className="rounded-full w-14 h-14 bg-teal-500 text-white shadow-lg hover:bg-teal-600" onClick={handleAddExpense}>
                  +
              </Button>
          </div>
          <Dialog open={modalBalanceOpen} onOpenChange={setModalBalanceOpen}>
              <DialogContent>
                  <DialogTitle>Editar Saldo</DialogTitle>
                  <DialogDescription>Insira o novo valor do saldo.</DialogDescription>
                  <Input
                      type="number"
                      step="0.01"
                      value={inputBalance}
                      onChange={(e) => setInputBalance(parseFloat(e.target.value))}
                  />
                  <Button onClick={updateBalance} disabled={isSavingBalance}>
                      {isSavingBalance ? <Loader2 className="animate-spin" /> : "Salvar"}
                  </Button>
              </DialogContent>
          </Dialog>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogContent>
                  <DialogTitle>{isEditing ? "Editar Despesa" : "Adicionar Despesa"}</DialogTitle>
                  <DialogDescription>Preencha os detalhes da despesa.</DialogDescription>
                  <Input
                      value={newExpense.name}
                      onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                      placeholder="Nome da despesa"
                  />
                  <Input
                      type="number"
                      step="0.01"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                      placeholder="Valor"
                  />
                  <Input
                    type="date"
                    value={newExpense.date || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                  <Button onClick={isEditing ? updateExpense : addExpense} disabled={isSavingExpense}>
                      {isSavingExpense ? <Loader2 className="animate-spin" /> : "Salvar"}
                  </Button>
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Cancelar
                  </Button>
              </DialogContent>
          </Dialog>

          {loading ? (
              <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
              </div>
          ) : (
              <div className="mt-4 bg-white shadow-md rounded-lg overflow-x-auto">
                  <table className="w-full min-w-max border-collapse">
                      <thead className="bg-teal-500 text-white">
                          <tr>
                              <th className="p-2 text-left">Nome</th>
                              <th className="p-2 text-center">Quantia</th>
                              <th className="p-2 text-center">Data</th>
                              <th className="pr-4 text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody>
                          {expenses.map((expense) => (
                              <tr key={expense.id ?? crypto.randomUUID()} className="border-b hover:bg-gray-100">
                                  <td className="p-2">{expense.name}</td>
                                  <td className="p-2 text-center">
                                      R$ {(expense.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="p-2 text-center">
                                      {formatDate(expense.date)}
                                  </td>
                                  <td className="p-2 text-right space-x-2">
                                      <Button variant="outline" size="sm" onClick={() => handleEditExpense(expense)}>
                                          Editar
                                      </Button>
                                      <Button variant="destructive" size="sm" onClick={() => deleteExpense(expense.id ?? 0)}>
                                          Remover
                                      </Button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
  );
}