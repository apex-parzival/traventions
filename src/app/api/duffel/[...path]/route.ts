import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const DUFFEL_BASE = 'https://api.duffel.com';
const DUFFEL_VERSION = 'beta';

function duffelHeaders(contentType?: string | null) {
  return {
    Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
    'Duffel-Version': DUFFEL_VERSION,
    Accept: 'application/json',
    ...(contentType ? { 'Content-Type': contentType } : {}),
  };
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${DUFFEL_BASE}/${path.join('/')}${request.nextUrl.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: duffelHeaders(),
    });
    const text = await response.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return NextResponse.json(data, { status: response.status, headers: corsHeaders() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Duffel proxy GET failed', detail: msg }, { status: 502, headers: corsHeaders() });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${DUFFEL_BASE}/${path.join('/')}${request.nextUrl.search}`;

  let rawBody = '';
  try { rawBody = await request.text(); } catch { /* empty */ }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: duffelHeaders('application/json'),
      body: rawBody || undefined,
    });
    const text = await response.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return NextResponse.json(data, { status: response.status, headers: corsHeaders() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Duffel proxy POST failed', detail: msg }, { status: 502, headers: corsHeaders() });
  }
}
