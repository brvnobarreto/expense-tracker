export const runtime = "edge";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../../db/schema";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

const _sql = neon(process.env.DATABASE_URL!);
const db = drizzle(_sql, { schema });

async function getAuth() {
    try {
        const authResponse = await auth();
        console.log("Auth Response:", authResponse);  // Log da resposta para depuração
        
        if (!authResponse || !authResponse.userId) {
            throw new Error("Usuário não autenticado ou userId não encontrado");
        }
        return authResponse;
    } catch (error) {
        console.error("Erro na autenticação:", error);
        throw new Error("Erro ao autenticar usuário");
    }
}

export async function GET() {
    try {
        const auth = await getAuth();
        const userId = auth.userId;  // Manter como string
        //console.log("Usuário autenticado para GET de despesas:", userId);

        // Buscar despesas do usuário
        const expenses = await db.select().from(schema.expenses)
            .where(eq(schema.expenses.userId, userId));  // Comparar como string
        //console.log("Despesas encontradas:", expenses);

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json({ error: "Erro ao buscar despesas" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, amount, date } = await req.json();
        console.log("Dados recebidos para POST de despesa:", { name, amount, date });

        // Verificação rigorosa de amount
        if (typeof amount !== "number" || isNaN(amount)) {
            console.error("Valor da despesa inválido:", amount);
            return NextResponse.json({ error: "Valor da despesa inválido" }, { status: 400 });
        }

        // Validação de name
        if (typeof name !== "string" || name.trim() === "") {
            console.error("Nome da despesa inválido:", name);
            return NextResponse.json({ error: "Nome da despesa inválido" }, { status: 400 });
        }

        // Validação de date
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            console.error("Data inválida:", date);
            return NextResponse.json({ error: "Data inválida" }, { status: 400 });
        }

        // Obter o userId do usuário autenticado
        const auth = await getAuth();
        const userId = auth.userId;  // Manter como string
        //console.log("User ID autenticado:", userId);

        // Inserindo a despesa no banco de dados
        await db.insert(schema.expenses).values({
            name: String(name), // Garantir que 'name' é uma string
            amount: String(amount), // Convertendo amount para string
            date: parsedDate.toISOString(), // Formatando a data para o formato ISO
            userId: userId, // Usar diretamente como string
        });

        return NextResponse.json({ message: "Despesa registrada com sucesso" });
    } catch (error) {
        console.error("Error inserting expense:", error);
        return NextResponse.json({ error: "Erro ao registrar despesa" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const auth = await getAuth();
        const userId = auth.userId; // Garantir que o userId é obtido corretamente
        const data = await req.json();
        //console.log("Dados recebidos para atualização:", data);  // Log para depuração

        // Verificando se o id da despesa foi passado
        const { id, amount, name, date } = data;
        if (!id || !amount || !name || !date) {
            return NextResponse.json({ error: "Dados insuficientes para atualização." }, { status: 400 });
        }

        // Convertendo o ID para número e validando
        const idAsNumber = Number(id);
        if (isNaN(idAsNumber)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        // Verificando se a despesa existe
        const expense = await db.select().from(schema.expenses).where(eq(schema.expenses.id, idAsNumber));
        if (expense.length === 0 || expense[0].userId !== userId) {
            return NextResponse.json({ error: "Despesa não encontrada ou não pertence ao usuário" }, { status: 403 });
        }

        // Atualizando a despesa
        await db.update(schema.expenses)
            .set({
                amount: amount,
                name: name,
                date: date,  // Certifique-se de que a data está sendo passada no formato esperado
            })
            .where(eq(schema.expenses.id, idAsNumber));

        return NextResponse.json({ message: "Despesa atualizada com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar despesa:", error);
        return NextResponse.json({ error: "Erro ao atualizar despesa" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const auth = await getAuth();
        const userId = auth.userId;  // Garantir que seja uma string
        const { id } = await req.json();  // Verifique se o id está sendo corretamente extraído
        //console.log("ID da despesa a ser removida:", id);  // Log para depuração

        // Verificando se o id é válido
        const idAsNumber = Number(id);
        if (isNaN(idAsNumber)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        // Verificando se a despesa existe no banco
        const expense = await db.select().from(schema.expenses).where(eq(schema.expenses.id, idAsNumber));
        //console.log("Despesa encontrada para remoção:", expense);

        if (expense.length === 0 || expense[0].userId !== userId) {  // Comparar userId como string
            console.error("Despesa não encontrada ou não pertence ao usuário:", { id, userId });
            return NextResponse.json({ error: "Despesas não pertencem ao usuário" }, { status: 403 });
        }

        // Remover a despesa no banco de dados
        await db.delete(schema.expenses)
        .where(eq(schema.expenses.id, idAsNumber));  // Usar diretamente como string

        return NextResponse.json({ message: "Despesa removida" });
    } catch (error) {
        console.error("Error deleting expense:", error);
        return NextResponse.json({ error: "Erro ao remover despesa" }, { status: 500 });
    }
}

// function isValidDate(date: string | undefined): boolean {
//     if (!date) return true;
//     try {
//         const parsedDate = parseISO(date);
//         return isValid(parsedDate);
//     } catch (error) {
//         console.error("Erro ao verificar data:", error);
//         return false;
//     }
// }
