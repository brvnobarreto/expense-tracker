//API FILE

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export async function GET() {
    const allExpenses = await db.select().from(schema.expenses);
    return NextResponse.json(allExpenses);    
}

export async function POST(req: Request) {
    const body = await req.json();
    await db.insert(schema.expenses).values(body);
    return NextResponse.json({message: "Despesa adicionada"});
}

export async function DELETE(req: Request){
    const { id } = await req.json();
    await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
    return NextResponse.json({message: "Despesa removida"});
}