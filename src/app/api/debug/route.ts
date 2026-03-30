import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.API_FOOTBALL_KEY || 'NOT_SET';
  const keyPreview = key === 'NOT_SET' ? 'NOT_SET' : `${key.slice(0, 4)}...${key.slice(-4)}`;
  
  try {
    const res = await fetch('https://v3.football.api-sports.io/standings?league=39&season=2024', {
      headers: { 'x-apisports-key': key },
    });
    const data = await res.json();
    const teamCount = data.response?.[0]?.league?.standings?.[0]?.length || 0;
    return NextResponse.json({
      keySet: key !== 'NOT_SET',
      keyPreview,
      httpStatus: res.status,
      apiErrors: data.errors,
      teamCount,
      firstTeam: data.response?.[0]?.league?.standings?.[0]?.[0]?.team?.name || null,
    });
  } catch (err: any) {
    return NextResponse.json({ keySet: key !== 'NOT_SET', keyPreview, error: err.message });
  }
}
