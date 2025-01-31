//API FILE

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../../db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { date } from "drizzle-orm/pg-core";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export async function GET() {
    const allExpenses = await db.select().from(schema.expenses);
    console.log("Despesas do banco:", allExpenses);
    return NextResponse.json(allExpenses);    
}

export async function POST(req: Request) {
    const body = await req.json();
    console.log("Request Body:", body); // Log do corpo da requisição
    
    let amount = parseFloat(body.amount);
    console.log("Parsed Amount:", amount); // Log para verificar o valor recebido
    
    if (isNaN(amount)) {
        return NextResponse.json({ error: 'Valor de despesa inválido.' }, { status: 400 });
    }
    
    // Garantir que o valor tenha 2 casas decimais
    amount = parseFloat(amount.toFixed(2));
    console.log("Formatted Amount:", amount); // Log para verificar o valor formatado
    
    // Remover o campo 'id' antes de inserir no banco de dados
    const { id, ...expenseData } = body;

    try {
        await db.insert(schema.expenses).values({ ...expenseData, amount, date: body.date ?? undefined, });
        return NextResponse.json({ message: "Despesa adicionada" });
    } catch (error) {
        console.error("Error inserting expense:", error); // Log de erro
        return NextResponse.json({ error: 'Erro ao adicionar despesa' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const body = await req.json();
    const { id, name, amount, date } = body;

    // Atualiza a despesa com o ID fornecido
    await db.update(schema.expenses)
        .set({ name, amount, date })
        .where(eq(schema.expenses.id, id));

    return NextResponse.json({ message: "Despesa atualizada" });
}

export async function DELETE(req: Request) {
    const { id } = await req.json();
    await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
    return NextResponse.json({ message: "Despesa removida" });
}
