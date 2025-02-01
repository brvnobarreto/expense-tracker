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
    const [newExpense, setNewExpense] = useState<Expense>({ id: 0, name: '', amount: 0, date: '' });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento

    useEffect(() => {
      fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/expenses');
        setExpenses(res.data);
        calculateBalance(res.data);
      } catch (error) {
        console.error("Erro ao buscar despesas:", error);
      }
      setLoading(false);
    };

    const calculateBalance = (expenses: Expense[]) => {
      const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      setTotalCost(total);
      setBalance(1000.00 - total);
    };

    const addExpense = async () => {
      console.log("Enviando dados:", newExpense);
    
      const { id, ...expenseData } = newExpense;
    
      // Se nenhuma data for fornecida, usa a data de hoje
      if (!expenseData.date) {
        const today = new Date();
        expenseData.date = today.toISOString().split("T")[0]; // Formato "yyyy-MM-dd"
      }
    
      try {
        const response = await axios.post('/api/expenses', expenseData);
        console.log("Resposta:", response);
        setExpenses((prev) => [...prev, response.data]); // Adiciona diretamente à lista
        setNewExpense({ id: 0, name: '', amount: 0, date: '' });
        setModalOpen(false);
      } catch (error) {
        console.error("Erro ao adicionar despesa:", error);
      }
    };
    
    const updateExpense = async () => {
      try {
        await axios.put('/api/expenses', newExpense);
        
        setExpenses((prevExpenses) => {
          const updatedList = prevExpenses.map((expense) =>
            expense.id === newExpense.id ? { ...newExpense } : expense
          );
    
          return updatedList.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        });
    
        setNewExpense({ id: 0, name: '', amount: 0, date: '' });
        setModalOpen(false);
        setIsEditing(false);
      } catch (error) {
        console.error("Erro ao atualizar despesa:", error);
      }
    };
  
    const deleteExpense = async (id: number) => {
      await axios.delete('/api/expenses', { data: { id } });
      fetchExpenses();
    };

    const handleEditExpense = (expense: Expense) => {
      const formattedDate = expense.date ? new Date(expense.date).toISOString().split("T")[0] : '';
      setNewExpense({ ...expense, date: formattedDate });
      setIsEditing(true);
      setModalOpen(true);
    };

    const handleAddExpense = () => {
      setNewExpense({ id: 0, name: '', amount: 0, date: '' });
      setIsEditing(false);
      setModalOpen(true);
    };

    return (
      <div className="p-6 max-w-xl mx-auto">

        <header className="bg-teal-500 text-white p-4 shadow-md text-center fixed top-0 right-0 left-0">
          <h1 className="text-2xl font-bold">Controle de Gastos</h1>
        </header>

        <div className="flex justify-between mt-4 p-4 bg-gray-100 rounded-lg shadow-md mt-14">
          <div>
            <p>Saldo:</p>
            <span className={balance < 0 ? "text-red-500 font-bold" : "font-bold"}>
              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <p>Custo total:</p>
            <span className="font-bold">R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Tabela de despesas */}
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
                  {expenses.map((expense, index) => (
                    <tr key={expense.id ?? `temp-${index}`} className="border-b hover:bg-gray-100">
                      <td className="p-2">{expense.name}</td>
                      <td className="p-2 text-center">
                        R$ {(Number(expense.amount) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center">
                        {expense.date ? new Date(expense.date).toLocaleDateString("pt-BR") : "Sem data"}
                      </td>
                      <td className="p-2 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditExpense(expense)}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => expense.id !== undefined && deleteExpense(expense.id)}>
                          Remover
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Botão flutuante para adicionar despesa */}
        <div className="fixed bottom-6 right-6">
          <Button className="rounded-full w-14 h-14 bg-teal-500 text-white shadow-lg hover:bg-teal-600" onClick={handleAddExpense}>
            +
          </Button>
        </div>

        {/* Modal de Adicionar/Editar Despesa */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogTitle>{isEditing ? "Editar Despesa" : "Adicionar Despesa"}</DialogTitle>
            <DialogDescription>Insira os detalhes da despesa abaixo.</DialogDescription>

            <Input
              placeholder="Nome"
              value={newExpense.name}
              onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
            />

            <Input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={isNaN(newExpense.amount) ? "" : newExpense.amount} // Evita passar NaN
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setNewExpense({ ...newExpense, amount: isNaN(value) ? 0 : value });
              }}
            />

            <Input
              type="date"
              value={newExpense.date || ''}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            />

            <Button onClick={isEditing ? updateExpense : addExpense}>
              {isEditing ? "Atualizar" : "Salvar"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
