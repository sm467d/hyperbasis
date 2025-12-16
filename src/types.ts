// Auth types
export interface User {
  password: string;
  createdAt: number;
  saves: Save[];
}

export interface Users {
  [username: string]: User;
}

export interface Session {
  username: string;
  loginTime: number;
}

// Save types
export interface Save {
  id: number;
  companyName: string;
  capital: number;
  ownedTiles: string[];
  difficulty: string;
  region: string;
  research: ResearchState;
  time: TimeState;
  savedAt: number;
}

// Time types
export interface GameDate {
  year: number;
  month: number;
  day: number;
}

export interface TimeState {
  date: GameDate;
  totalDays: number;
  speed: number;
  paused: boolean;
}

// Game types
export interface GameConfig {
  companyName: string;
  startingCapital: number;
  region: string;
  difficulty: string;
}

export interface GameState {
  companyName: string;
  capital: number;
  ownedTiles: string[];
  difficulty: string;
  region: string;
  research: ResearchState;
  time: TimeState;
}

// Research types
export interface ResearchState {
  state: { [key: string]: number };
  points: number;
}

export interface ResearchLevel {
  level: number;
  name: string;
  cost: number;
  unlocked?: boolean;
  // Optional properties for different subcategories
  kw?: number;
  pue?: number;
  speed?: number;
  aiReady?: boolean;
  opexMult?: number;
  recoveryMult?: number;
  accuracy?: number;
}

export interface ResearchSubcategory {
  name: string;
  levels: ResearchLevel[];
}

export interface ResearchBranch {
  name: string;
  subcategories: { [key: string]: ResearchSubcategory };
}

export interface ResearchTreeData {
  [branchId: string]: ResearchBranch;
}

// Reliability types
export interface ReliabilityOption {
  id: string;
  name: string;
  score: number;
}

export interface ReliabilityFactor {
  name: string;
  options: ReliabilityOption[];
}

export interface ReliabilityFactors {
  [factorId: string]: ReliabilityFactor;
}

export interface ReliabilityChoices {
  [factorId: string]: string;
}

export interface SLAInfo {
  sla: string;
  tier: string;
  customers: string;
}

// Metro/Map types
export interface Tile {
  id: string;
  region: string;
  available: boolean;
  price: number;
}

export interface RegionDef {
  name: string;
  cx: number;
  cy: number;
  radius: number;
  available: boolean;
  priceBase: number;
}

export interface MapLabel {
  name: string;
  x: number;
  y: number;
  major: boolean;
}

export interface MetroMapData {
  name: string;
  cols: number;
  rows: number;
  grid: (Tile | null)[];
  labels: MapLabel[];
}

export interface TileEntry {
  el: HTMLElement;
  tile: Tile;
}
