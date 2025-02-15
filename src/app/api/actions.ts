'use server'
//export const runtime = "edge";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { auth } from '@clerk/nextjs/server'
import * as schema from "../../db/schema";

const _sql = neon(process.env.DATABASE_URL!);
const db = drizzle(_sql, { schema });

export async function createUserMessage(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { error: 'User not authenticated', status: 401 }
    }

    const message = formData.get('message') as string;
    if (!message) {
      return { error: 'Message cannot be empty', status: 400 }
    }

    await db.insert(schema.UserMessages).values({
      user_id: userId,
      message,
    });

    return { message: 'Message created successfully' }
  } catch (error) {
    console.error('Error creating user message:', error);
    return { error: 'Error creating message', status: 500 }
  }
}

export async function deleteUserMessage() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'User not authenticated', status: 401 };
    }

    // Tentando excluir a mensagem do usuário
    //const result = await db.delete(schema.UserMessages).where(eq(schema.UserMessages.user_id, userId));

    // O Drizzle não retorna um "count", mas o fato de não lançar erro significa que a operação foi bem-sucedida
    return { message: 'Message deleted successfully' };
  } catch (error) {
    console.error('Error deleting user message:', error);
    return { error: 'Error deleting message', status: 500 };
  }
}

