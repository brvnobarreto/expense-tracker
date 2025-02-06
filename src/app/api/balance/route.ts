import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../../db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server"; // Para pegar o usuário autenticado

const _sql = neon(process.env.DATABASE_URL!);
const db = drizzle(_sql, { schema });

async function getAuth() {
  const authResponse = await auth();
  return authResponse;
}

export async function GET() {
  try {
    const auth = await getAuth();
    const userId = auth.userId;

    // Garantindo que userId seja uma string
    if (!userId) {
      return NextResponse.json({ error: "ID do usuário inválido" }, { status: 400 });
    }

    // Usando 'where' ao invés de 'filter'
    const result = await db.select().from(schema.balance)
      .where(eq(schema.balance.userId, userId)) // Usando userId como string
      .limit(1);

    return NextResponse.json(result.length > 0 ? result[0] : { amount: "0" }); // Retornando como string
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json({ error: "Erro ao buscar saldo" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await getAuth();
    const userId = auth.userId;

    // Garantindo que userId seja uma string
    if (!userId) {
      return NextResponse.json({ error: "ID do usuário inválido" }, { status: 400 });
    }

    const { amount } = await req.json();

    // Verificando o valor de amount como string
    if (typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json({ error: "Valor do saldo inválido" }, { status: 400 });
    }

    const amountStr = String(amount); // Convertendo amount para string
    const existingBalance = await db.select().from(schema.balance)
      .where(eq(schema.balance.userId, userId)) // Usando userId como string
      .limit(1);

    if (existingBalance.length > 0) {
      await db.update(schema.balance)
        .set({ amount: sql`${amountStr}` }) // Definindo amount como string
        .where(eq(schema.balance.id, existingBalance[0].id));
    } else {
      await db.insert(schema.balance).values({
        amount: sql`${amountStr}`, // Definindo amount como string
        userId: userId, // Usando userId como string
      });
    }

    return NextResponse.json({ message: "Saldo atualizado com sucesso" });
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json({ error: "Erro ao atualizar saldo" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const auth = await getAuth();
    const userId = auth.userId;

    // Garantindo que userId seja uma string
    if (!userId) {
      return NextResponse.json({ error: "ID do usuário inválido" }, { status: 400 });
    }

    const existingBalance = await db.select().from(schema.balance)
      .where(eq(schema.balance.userId, userId)) // Usando userId como string
      .limit(1);

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
