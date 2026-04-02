#!/usr/bin/env node
// =============================================================================
// Fetch REAL squad data from Football-Data.org for all 5 top European leagues
// Saves to src/data/real-squads.json
// Usage: node scripts/fetch-real-data.mjs
// =============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read API key from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let FDO_KEY = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const m = envContent.match(/FOOTBALL_DATA_ORG_KEY="?([^"\n]+)"?/);
  if (m) FDO_KEY = m[1].trim();
}
if (!FDO_KEY) {
  console.error('ERROR: FOOTBALL_DATA_ORG_KEY not found in .env.local');
  process.exit(1);
}

const FDO_BASE = 'https://api.football-data.org/v4';
const LEAGUES = {
  'premier-league': 2021,
  'la-liga': 2014,
  'serie-a': 2019,
  'bundesliga': 2002,
  'ligue-1': 2015,
};

async function fdoFetch(urlPath) {
  const url = `${FDO_BASE}${urlPath}`;
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url, { headers: { 'X-Auth-Token': FDO_KEY } });
  if (res.status === 429) {
    console.log('  Rate limited — waiting 65s...');
    await new Promise(r => setTimeout(r, 65000));
    return fdoFetch(urlPath);
  }
  if (!res.ok) {
    console.error(`  ERROR: ${res.status} ${res.statusText} for ${urlPath}`);
    return null;
  }
  return res.json();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== Fetching real squad data from Football-Data.org ===\n');
  const allData = {};

  for (const [leagueId, compId] of Object.entries(LEAGUES)) {
    console.log(`\n--- ${leagueId} (competition ${compId}) ---`);
    const data = await fdoFetch(`/competitions/${compId}/teams`);
    if (!data?.teams) { console.error(`  No teams for ${leagueId}`); continue; }

    const teams = data.teams.map(t => ({
      id: t.id,
      name: t.name,
      shortName: t.shortName || t.tla || t.name,
      tla: t.tla || '',
      crest: t.crest || '',
      venue: t.venue || '',
      founded: t.founded || 0,
      clubColors: t.clubColors || '',
      coach: t.coach ? { id: t.coach.id, name: t.coach.name, nationality: t.coach.nationality || '' } : null,
      squad: (t.squad || []).map(p => ({
        id: p.id,
        name: p.name,
        position: p.position || 'Unknown',
        dateOfBirth: p.dateOfBirth || '',
        nationality: p.nationality || '',
      })),
    }));
    allData[leagueId] = teams;
    console.log(`  Got ${teams.length} teams, ${teams.reduce((a, t) => a + t.squad.length, 0)} players`);
    await sleep(7000);

    const scorerData = await fdoFetch(`/competitions/${compId}/scorers?limit=30`);
    if (scorerData?.scorers) {
      allData[`${leagueId}-scorers`] = scorerData.scorers.map(s => ({
        playerId: s.player?.id, playerName: s.player?.name,
        teamId: s.team?.id, teamName: s.team?.name,
        goals: s.goals || 0, assists: s.assists || 0,
        penalties: s.penalties || 0, playedMatches: s.playedMatches || 0,
      }));
      console.log(`  Got ${scorerData.scorers.length} top scorers`);
    }
    await sleep(7000);
  }

  const outPath = path.join(__dirname, '..', 'src', 'data', 'real-squads.json');
  fs.writeFileSync(outPath, JSON.stringify(allData, null, 2));
  console.log(`\n✅ Saved to ${outPath}`);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
