import { League } from '@/lib/types';

export const leagues: League[] = [
  {
    id: 'premier-league', name: 'Premier League', country: 'England', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    color: '#3D195B', secondaryColor: '#00FF85', season: '2025/26', totalTeams: 20,
    relegationZone: 3, championsLeagueSpots: 4, europaLeagueSpots: 1, conferenceLeagueSpots: 1,
    currentMatchday: 29, totalMatchdays: 38, averageAttendance: 40234,
    tvRevenue: '£6.7B', founded: 1992,
    description: 'The most watched football league in the world, featuring 20 clubs competing for the title, European qualification, and survival.'
  },
  {
    id: 'la-liga', name: 'La Liga', country: 'Spain', logo: '🇪🇸',
    color: '#FF4B44', secondaryColor: '#FEBE10', season: '2025/26', totalTeams: 20,
    relegationZone: 3, championsLeagueSpots: 4, europaLeagueSpots: 1, conferenceLeagueSpots: 1,
    currentMatchday: 28, totalMatchdays: 38, averageAttendance: 30156,
    tvRevenue: '€4.95B', founded: 1929,
    description: 'Spain\'s premier division, home to Barcelona and Real Madrid, known for its technical excellence and tactical sophistication.'
  },
  {
    id: 'serie-a', name: 'Serie A', country: 'Italy', logo: '🇮🇹',
    color: '#024494', secondaryColor: '#008C45', season: '2025/26', totalTeams: 20,
    relegationZone: 3, championsLeagueSpots: 4, europaLeagueSpots: 1, conferenceLeagueSpots: 1,
    currentMatchday: 28, totalMatchdays: 38, averageAttendance: 27845,
    tvRevenue: '€4.5B', founded: 1898,
    description: 'Italy\'s top flight, historically known for its tactical mastery and defensive organization. Home to Juventus, AC Milan, Inter Milan and more.'
  },
  {
    id: 'bundesliga', name: 'Bundesliga', country: 'Germany', logo: '🇩🇪',
    color: '#D20515', secondaryColor: '#000000', season: '2025/26', totalTeams: 18,
    relegationZone: 2, championsLeagueSpots: 4, europaLeagueSpots: 1, conferenceLeagueSpots: 1,
    currentMatchday: 26, totalMatchdays: 34, averageAttendance: 43302,
    tvRevenue: '€4.4B', founded: 1963,
    description: 'Germany\'s premier league, boasting the highest average attendance in world football. Known for its 50+1 ownership rule and exceptional youth development.'
  },
  {
    id: 'ligue-1', name: 'Ligue 1', country: 'France', logo: '🇫🇷',
    color: '#091C3E', secondaryColor: '#DAFE50', season: '2025/26', totalTeams: 18,
    relegationZone: 2, championsLeagueSpots: 3, europaLeagueSpots: 1, conferenceLeagueSpots: 1,
    currentMatchday: 27, totalMatchdays: 34, averageAttendance: 23567,
    tvRevenue: '€2.5B', founded: 1932,
    description: 'France\'s top division, a hotbed of emerging talent. Home to PSG and the breeding ground for many of the world\'s best players.'
  },
];
