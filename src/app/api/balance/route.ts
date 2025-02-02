import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../../db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

const _sql = neon(process.env.DATABASE_URL!);
const db = drizzle(_sql, { schema });

export async function GET() {
  try {
    const result = await db.select().from(schema.balance).limit(1);
    return NextResponse.json(result.length > 0 ? result[0] : { amount: 0 });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json({ error: "Erro ao buscar saldo" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
      const { amount } = await req.json();
  
      if (typeof amount !== 'number' || isNaN(amount)) {
        return NextResponse.json({ error: 'Valor do saldo inválido' }, { status: 400 });
      }

       const amountStr = String(amount);

  
      const existingBalance = await db.select().from(schema.balance).limit(1);
  
      if (existingBalance.length > 0) {
        await db.update(schema.balance)
          .set({ amount: sql`${amountStr}` })
          .where(eq(schema.balance.id, existingBalance[0].id));
      } else {
        await db.insert(schema.balance).values({ amount: sql`${amountStr}` });
      }
  
      return NextResponse.json({ message: "Saldo atualizado com sucesso" });
    } catch (error) {
      console.error("Error updating balance:", error);
      return NextResponse.json({ error: "Erro ao atualizar saldo" }, { status: 500 });
    }
  }

export async function DELETE(req: Request) {
  try {
    const existingBalance = await db.select().from(schema.balance).limit(1);

    if (existingBalance.length > 0) {
      await db.delete(schema.balance).where(eq(schema.balance.id, existingBalance[0].id));
      return NextResponse.json({ message: "Saldo removido com sucesso" });
    }

    return NextResponse.json({ error: "Saldo não encontrado" }, { status: 404 });
  } catch (error) {
      console.error("Error deleting balance:", error);
    return NextResponse.json({ error: "Erro ao remover saldo" }, { status: 500 });
  }
}