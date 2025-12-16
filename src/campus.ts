// Campus System - Manages land parcels and DC placement
import { SPCNDesign, Designs } from './designs';

// A Campus is a contiguous parcel of owned land
export interface Campus {
  id: string;
  name: string;
  metro: string;           // Metro this campus is in (e.g., 'nova')
  tiles: string[];         // List of tile IDs in this campus
  width: number;           // Bounding box width
  height: number;          // Bounding box height
  datacenters: Datacenter[];
}

// A built datacenter within a campus
export interface Datacenter {
  id: string;
  name: string;
  designId: string;        // Reference to SPCNDesign
  position: { x: number; y: number }; // Position within campus grid
  size: { w: number; h: number };     // Footprint in tiles
  installedRacks: InstalledRack[];
  constructionComplete: boolean;
}

// Racks installed in a datacenter
export interface InstalledRack {
  designId: string;        // Reference to RackDesign
  count: number;           // How many of this design
}

// Parse tile ID to get coordinates (e.g., "nova-5-10" -> {x: 5, y: 10})
function parseTileId(tileId: string): { metro: string; x: number; y: number } | null {
  const parts = tileId.split('-');
  if (parts.length < 3) return null;
  const x = parseInt(parts[parts.length - 2], 10);
  const y = parseInt(parts[parts.length - 1], 10);
  const metro = parts.slice(0, -2).join('-');
  return { metro, x, y };
}

// Calculate bounding box of tiles
function getBoundingBox(tiles: string[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const tileId of tiles) {
    const parsed = parseTileId(tileId);
    if (parsed) {
      minX = Math.min(minX, parsed.x);
      minY = Math.min(minY, parsed.y);
      maxX = Math.max(maxX, parsed.x);
      maxY = Math.max(maxY, parsed.y);
    }
  }

  return {
    minX, minY, maxX, maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

// Check if two tile sets are adjacent (share an edge)
function areAdjacent(tiles1: string[], tiles2: string[]): boolean {
  for (const t1 of tiles1) {
    const p1 = parseTileId(t1);
    if (!p1) continue;

    for (const t2 of tiles2) {
      const p2 = parseTileId(t2);
      if (!p2) continue;

      // Same metro and adjacent
      if (p1.metro === p2.metro) {
        const dx = Math.abs(p1.x - p2.x);
        const dy = Math.abs(p1.y - p2.y);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
          return true;
        }
      }
    }
  }
  return false;
}

export const CampusManager = {
  campuses: [] as Campus[],

  // Create a new campus from purchased tiles
  createCampus(metro: string, tileIds: string[]): Campus {
    const bbox = getBoundingBox(tileIds);
    const id = crypto.randomUUID();
    const campusNumber = this.campuses.filter(c => c.metro === metro).length + 1;

    const campus: Campus = {
      id,
      name: `${metro.toUpperCase()}-${campusNumber}`,
      metro,
      tiles: [...tileIds],
      width: bbox.width,
      height: bbox.height,
      datacenters: []
    };

    this.campuses.push(campus);
    return campus;
  },

  // Add tiles to existing campus or create new one
  addTiles(metro: string, tileIds: string[]): Campus {
    // Check if any existing campus in this metro is adjacent
    for (const campus of this.campuses) {
      if (campus.metro === metro && areAdjacent(campus.tiles, tileIds)) {
        // Merge into existing campus
        campus.tiles.push(...tileIds);
        const bbox = getBoundingBox(campus.tiles);
        campus.width = bbox.width;
        campus.height = bbox.height;
        return campus;
      }
    }

    // No adjacent campus found, create new one
    return this.createCampus(metro, tileIds);
  },

  // Get campus containing a tile
  getCampusForTile(tileId: string): Campus | null {
    return this.campuses.find(c => c.tiles.includes(tileId)) || null;
  },

  // Get all campuses in a metro
  getCampusesInMetro(metro: string): Campus[] {
    return this.campuses.filter(c => c.metro === metro);
  },

  // Build a datacenter in a campus
  buildDatacenter(campusId: string, design: SPCNDesign, name: string, position: { x: number; y: number }): Datacenter | null {
    const campus = this.campuses.find(c => c.id === campusId);
    if (!campus) return null;

    // Get size from design
    const sizeMap: { [key: string]: { w: number; h: number } } = {
      '1x1': { w: 1, h: 1 },
      '2x2': { w: 2, h: 2 },
      '4x4': { w: 4, h: 4 },
      '8x8': { w: 8, h: 8 },
    };
    const size = sizeMap[design.size] || { w: 1, h: 1 };

    // Check if position is valid (within bounds and not overlapping)
    if (position.x + size.w > campus.width || position.y + size.h > campus.height) {
      return null; // Out of bounds
    }

    // Check for overlap with existing DCs
    for (const dc of campus.datacenters) {
      if (this.rectsOverlap(position, size, dc.position, dc.size)) {
        return null; // Overlapping
      }
    }

    const datacenter: Datacenter = {
      id: crypto.randomUUID(),
      name,
      designId: design.id,
      position,
      size,
      installedRacks: [],
      constructionComplete: true // Instant for now
    };

    campus.datacenters.push(datacenter);
    return datacenter;
  },

  // Check if two rectangles overlap
  rectsOverlap(
    pos1: { x: number; y: number }, size1: { w: number; h: number },
    pos2: { x: number; y: number }, size2: { w: number; h: number }
  ): boolean {
    return !(
      pos1.x + size1.w <= pos2.x ||
      pos2.x + size2.w <= pos1.x ||
      pos1.y + size1.h <= pos2.y ||
      pos2.y + size2.h <= pos1.y
    );
  },

  // Get campus stats
  getCampusStats(campus: Campus): {
    totalTiles: number;
    usedTiles: number;
    freeTiles: number;
    totalMW: number;
    totalRacks: number;
    dcCount: number;
  } {
    let usedTiles = 0;
    let totalMW = 0;
    let totalRacks = 0;

    for (const dc of campus.datacenters) {
      usedTiles += dc.size.w * dc.size.h;
      const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
      if (design) {
        totalMW += design.totalMW;
        totalRacks += design.totalRacks;
      }
    }

    return {
      totalTiles: campus.tiles.length,
      usedTiles,
      freeTiles: campus.tiles.length - usedTiles,
      totalMW,
      totalRacks,
      dcCount: campus.datacenters.length
    };
  },

  // State management
  getState(): Campus[] {
    return this.campuses;
  },

  loadState(state: Campus[]): void {
    this.campuses = state || [];
  },

  reset(): void {
    this.campuses = [];
  }
};
