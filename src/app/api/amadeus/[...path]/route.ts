import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const AMADEUS_BASE = 'https://test.api.amadeus.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
  const targetUrl = `${AMADEUS_BASE}/${path.join('/')}${request.nextUrl.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: request.headers.get('Authorization') || '',
      },
    });

    const text = await response.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return NextResponse.json(data, { status: response.status, headers: corsHeaders() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[amadeus-proxy] GET failed:', targetUrl, msg);
    return NextResponse.json(
      { error: 'Proxy GET failed', detail: msg },
      { status: 502, headers: corsHeaders() }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${AMADEUS_BASE}/${path.join('/')}${request.nextUrl.search}`;
  const contentType = request.headers.get('Content-Type') || 'application/json';

  let rawBody: string;
  try { rawBody = await request.text(); } catch { rawBody = ''; }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: request.headers.get('Authorization') || '',
        'Content-Type': contentType,
      },
      body: rawBody || undefined,
    });

    const text = await response.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return NextResponse.json(data, { status: response.status, headers: corsHeaders() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[amadeus-proxy] POST failed:', targetUrl, msg);
    return NextResponse.json(
      { error: 'Proxy POST failed', detail: msg },
      { status: 502, headers: corsHeaders() }
    );
  }
}
