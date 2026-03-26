// Sport configuration for UREPP
// Defines positions, metrics, and labels for each supported sport

export type Sport = 'baseball' | 'football' | 'basketball' | 'soccer' | 'hockey';

export interface SportConfig {
  name: string;
  displayName: string;
  positions: string[];
  primaryStat: {
    label: string;
    placeholder: string;
    unit: string;
  };
  secondaryStat: {
    label: string;
    placeholder: string;
    unit: string;
  };
  tertiaryStat: {
    label: string;
    placeholder: string;
    unit: string;
  };
}

export const SPORTS: Record<Sport, SportConfig> = {
  baseball: {
    name: 'baseball',
    displayName: 'Baseball',
    positions: [
      'RHP', 'LHP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'OF', 'UTIL'
    ],
    primaryStat: {
      label: 'Exit Velocity',
      placeholder: '95',
      unit: 'mph'
    },
    secondaryStat: {
      label: 'Pitch Velocity',
      placeholder: '88',
      unit: 'mph'
    },
    tertiaryStat: {
      label: '60 Yard Dash',
      placeholder: '6.8',
      unit: 'sec'
    }
  },
  football: {
    name: 'football',
    displayName: 'Football',
    positions: [
      'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'LS', 'ATH'
    ],
    primaryStat: {
      label: '40 Yard Dash',
      placeholder: '4.5',
      unit: 'sec'
    },
    secondaryStat: {
      label: 'Bench Press',
      placeholder: '225',
      unit: 'lbs'
    },
    tertiaryStat: {
      label: 'Vertical Jump',
      placeholder: '35',
      unit: 'in'
    }
  },
  basketball: {
    name: 'basketball',
    displayName: 'Basketball',
    positions: [
      'PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'GF', 'FC'
    ],
    primaryStat: {
      label: 'Points Per Game',
      placeholder: '18.5',
      unit: 'PPG'
    },
    secondaryStat: {
      label: 'Vertical Leap',
      placeholder: '32',
      unit: 'in'
    },
    tertiaryStat: {
      label: 'Wingspan',
      placeholder: '6\'8"',
      unit: ''
    }
  },
  soccer: {
    name: 'soccer',
    displayName: 'Soccer',
    positions: [
      'GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF', 'F'
    ],
    primaryStat: {
      label: 'Goals',
      placeholder: '12',
      unit: ''
    },
    secondaryStat: {
      label: 'Assists',
      placeholder: '8',
      unit: ''
    },
    tertiaryStat: {
      label: '40yd Dash',
      placeholder: '4.8',
      unit: 'sec'
    }
  },
  hockey: {
    name: 'hockey',
    displayName: 'Hockey',
    positions: [
      'G', 'LD', 'RD', 'LW', 'C', 'RW', 'F', 'D'
    ],
    primaryStat: {
      label: 'Goals',
      placeholder: '25',
      unit: ''
    },
    secondaryStat: {
      label: 'Assists',
      placeholder: '30',
      unit: ''
    },
    tertiaryStat: {
      label: 'Save % (for goalies)',
      placeholder: '.915',
      unit: ''
    }
  }
};

export const SPORT_OPTIONS: { value: Sport; label: string }[] = [
  { value: 'baseball', label: 'Baseball' },
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'hockey', label: 'Hockey' }
];

export function getSportConfig(sport: Sport): SportConfig {
  return SPORTS[sport] || SPORTS.baseball;
}

export function isValidSport(sport: string): sport is Sport {
  return Object.keys(SPORTS).includes(sport);
}
