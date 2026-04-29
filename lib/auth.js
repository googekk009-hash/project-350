import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "default_secret_key_12345678");

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
