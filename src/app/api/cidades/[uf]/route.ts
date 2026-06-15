import { NextResponse, type NextRequest } from "next/server";

import { parseSpringResponse, springFetch } from "@/lib/server/spring";

const FALLBACK_CITIES: Record<string, Array<{ id: number; nome: string; uf: string }>> = {
  RJ: [{ id: 1, nome: "Rio de Janeiro", uf: "RJ" }],
  SP: [{ id: 2, nome: "São Paulo", uf: "SP" }],
  TO: [{ id: 3, nome: "Palmas", uf: "TO" }],
};

export async function GET(_request: NextRequest, context: { params: Promise<{ uf: string }> }) {
  const { uf } = await context.params;
  const normalizedUf = uf.toUpperCase();

  try {
    const springResponse = await springFetch(`/cidades/buscar/${normalizedUf}`);
    const payload = await parseSpringResponse(springResponse);

    if (springResponse.ok && Array.isArray(payload)) {
      return NextResponse.json(payload);
    }
  } catch {
    
  }

  return NextResponse.json(FALLBACK_CITIES[normalizedUf] ?? []);
}

