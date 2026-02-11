import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

// Demo users with bcryptjs-compatible hashes
// Password for all: "password123"
const users = [
  {
    id: "u1",
    email: "doctor@test.com",
    passwordHash: "$2b$10$seSvREOAORf3OHIPR9ue9ufCuTQZtp7REHsceMDq.QT/CGRFBQFzC",
    role: "doctor",
    name: "Dr. Sarah Johnson"
  },
  {
    id: "u2",
    email: "patient@test.com",
    passwordHash: "$2b$10$seSvREOAORf3OHIPR9ue9ufCuTQZtp7REHsceMDq.QT/CGRFBQFzC",
    role: "patient",
    name: "Jane Smith"
  },
  {
    id: "u3",
    email: "admin@test.com",
    passwordHash: "$2b$10$seSvREOAORf3OHIPR9ue9ufCuTQZtp7REHsceMDq.QT/CGRFBQFzC",
    role: "admin",
    name: "Admin User"
  }
];

export async function POST(req) {
  let body;

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid or empty JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: "Email and password required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Find user by email
  const user = users.find(u => u.email === email);
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Invalid credentials" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Verify password with bcryptjs
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: "Invalid credentials" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Sign JWT token using jose (Edge-compatible)
  const token = await signToken({
    userId: user.id,
    role: user.role,
  });

  return new Response(
    JSON.stringify({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }),
    {
      status: 200,
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
        "Content-Type": "application/json",
      },
    }
  );
}
