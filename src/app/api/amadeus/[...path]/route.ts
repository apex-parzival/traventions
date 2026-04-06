import { NextRequest, NextResponse } from 'next/server';

const AMADEUS_BASE = 'https://test.api.amadeus.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${AMADEUS_BASE}/${path}${search}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Amadeus proxy GET error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${AMADEUS_BASE}/${path}${search}`;

  let body: string | undefined;
  const contentType = request.headers.get('Content-Type') || '';

  try {
    if (contentType.includes('application/x-www-form-urlencoded')) {
      body = await request.text();
    } else {
      const json = await request.json();
      body = JSON.stringify(json);
    }
  } catch {
    body = undefined;
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': contentType || 'application/json',
      },
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Amadeus proxy POST error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}
