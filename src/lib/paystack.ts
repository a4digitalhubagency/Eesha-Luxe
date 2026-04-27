const SECRET = process.env.PAYSTACK_SECRET_KEY!;
const BASE = "https://api.paystack.co";

async function paystackFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "PayStack request failed");
  return json.data as T;
}

export interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyResult {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  customer: { email: string; first_name: string; last_name: string };
}

export function initializeTransaction(params: {
  email: string;
  amount: number; // in kobo
  metadata?: Record<string, unknown>;
}): Promise<InitializeResult> {
  return paystackFetch<InitializeResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function verifyTransaction(reference: string): Promise<VerifyResult> {
  return paystackFetch<VerifyResult>(`/transaction/verify/${reference}`);
}
