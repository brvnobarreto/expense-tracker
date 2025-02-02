import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../../db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { isValid, parseISO, format, toDate } from "date-fns";

const _sql = neon(process.env.DATABASE_URL!);
const db = drizzle(_sql, { schema });

function isValidDate(date: string | undefined): boolean {
    if (!date) return true;
    try {
        const parsedDate = parseISO(date);
        return isValid(parsedDate);
    } catch (error) {
        return false;
    }
}

export async function GET() {
    try {
        const allExpenses = await db.select().from(schema.expenses);
        return NextResponse.json(allExpenses);
    } catch (error) {
       console.error("Error fetching expenses:", error);
        return NextResponse.json({ error: "Erro ao buscar despesas" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, amount, date } = body;

         if (!name || typeof name !== 'string' || name.trim().length === 0) {
             return NextResponse.json({ error: 'Nome da despesa é obrigatório' }, { status: 400 });
         }

         if (typeof amount !== 'number' || isNaN(amount)) {
             return NextResponse.json({ error: 'Valor da despesa inválido' }, { status: 400 });
         }

        if (date && !isValidDate(date)) {
            return NextResponse.json({ error: 'Data da despesa inválida' }, { status: 400 });
        }

       const parsedDate = date ? format(parseISO(date), 'yyyy-MM-dd') : undefined;
       const { id, ...expenseData } = body;

       await db.insert(schema.expenses).values({
           ...expenseData,
           amount,
           date: parsedDate as any,
        });
        return NextResponse.json({ message: "Despesa adicionada" });
    } catch (error) {
        console.error("Error inserting expense:", error);
        return NextResponse.json({ error: 'Erro ao adicionar despesa' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try{
    const body = await req.json();
    const { id, name, amount, date } = body;


    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Nome da despesa é obrigatório' }, { status: 400 });
    }

    if (typeof amount !== 'number' || isNaN(amount)) {
        return NextResponse.json({ error: 'Valor da despesa inválido' }, { status: 400 });
    }
      if (date && !isValidDate(date)) {
        return NextResponse.json({ error: 'Data da despesa inválida' }, { status: 400 });
      }

      const parsedDate = date ? format(parseISO(date), 'yyyy-MM-dd') : undefined;
        const amountStr = String(amount)

    await db.update(schema.expenses)
        .set({ name, amount: sql`${amountStr}`, date: parsedDate as any })
        .where(eq(schema.expenses.id, id));

    return NextResponse.json({ message: "Despesa atualizada" });
  } catch (error) {
        console.error("Error updating expense:", error);
      return NextResponse.json({ error: "Erro ao atualizar despesa" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
  try{
    const { id } = await req.json();
    await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
    return NextResponse.json({ message: "Despesa removida" });
  } catch (error) {
      console.error("Error deleting expense:", error);
    return NextResponse.json({ error: "Erro ao remover despesa" }, { status: 500 });
  }
}