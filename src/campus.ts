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
  // Rack slots: array indexed by slot number, value is RackDesign id or null for empty
  rackSlots: (string | null)[];
  constructionComplete: boolean;
}

// Legacy interface for backwards compatibility during migration
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

    // Calculate total rack slots for this DC
    const totalRackSlots = design.totalRacks;

    const datacenter: Datacenter = {
      id: crypto.randomUUID(),
      name,
      designId: design.id,
      position,
      size,
      rackSlots: new Array(totalRackSlots).fill(null), // Initialize empty slots
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
    usedRacks: number;
    dcCount: number;
  } {
    let usedTiles = 0;
    let totalMW = 0;
    let totalRacks = 0;
    let usedRacks = 0;

    for (const dc of campus.datacenters) {
      usedTiles += dc.size.w * dc.size.h;
      const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
      if (design) {
        totalMW += design.totalMW;
        totalRacks += design.totalRacks;
      }
      // Count used rack slots (with safety check)
      const rackSlots = dc.rackSlots || [];
      usedRacks += rackSlots.filter(slot => slot !== null).length;
    }

    return {
      totalTiles: campus.tiles.length,
      usedTiles,
      freeTiles: campus.tiles.length - usedTiles,
      totalMW,
      totalRacks,
      usedRacks,
      dcCount: campus.datacenters.length
    };
  },

  // Install a rack at a specific slot
  installRack(campusId: string, dcId: string, slotIndex: number, rackDesignId: string): boolean {
    const campus = this.campuses.find(c => c.id === campusId);
    if (!campus) return false;

    const dc = campus.datacenters.find(d => d.id === dcId);
    if (!dc) return false;

    // Check bounds
    if (slotIndex < 0 || slotIndex >= dc.rackSlots.length) return false;

    // Check if slot is already occupied
    if (dc.rackSlots[slotIndex] !== null) return false;

    // Install the rack
    dc.rackSlots[slotIndex] = rackDesignId;
    return true;
  },

  // Remove a rack from a specific slot
  removeRack(campusId: string, dcId: string, slotIndex: number): string | null {
    const campus = this.campuses.find(c => c.id === campusId);
    if (!campus) return null;

    const dc = campus.datacenters.find(d => d.id === dcId);
    if (!dc) return null;

    // Check bounds
    if (slotIndex < 0 || slotIndex >= dc.rackSlots.length) return null;

    // Get the design that was there
    const removedDesignId = dc.rackSlots[slotIndex];
    dc.rackSlots[slotIndex] = null;
    return removedDesignId;
  },

  // Get DC stats
  getDCStats(dc: Datacenter): {
    totalSlots: number;
    usedSlots: number;
    freeSlots: number;
    usedMW: number;
    totalMW: number;
  } {
    const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
    const totalMW = design?.totalMW || 0;

    // Safety check for rackSlots
    const rackSlots = dc.rackSlots || [];

    let usedMW = 0;
    let usedSlots = 0;

    for (const slotDesignId of rackSlots) {
      if (slotDesignId !== null) {
        usedSlots++;
        const rackDesign = Designs.rackDesigns.find(r => r.id === slotDesignId);
        if (rackDesign) {
          usedMW += rackDesign.kwPerRack / 1000; // Convert kW to MW
        }
      }
    }

    return {
      totalSlots: rackSlots.length,
      usedSlots,
      freeSlots: rackSlots.length - usedSlots,
      usedMW,
      totalMW
    };
  },

  // State management
  getState(): Campus[] {
    return this.campuses;
  },

  loadState(state: Campus[]): void {
    this.campuses = state || [];

    // Migrate old format (installedRacks) to new format (rackSlots)
    for (const campus of this.campuses) {
      for (const dc of campus.datacenters) {
        // Check if this DC needs migration (has old format)
        const dcAny = dc as any;
        if (!dc.rackSlots && dcAny.installedRacks) {
          // Get total slots from design
          const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
          const totalSlots = design?.totalRacks || 50;

          // Initialize empty slots
          dc.rackSlots = new Array(totalSlots).fill(null);

          // Migrate old installedRacks to new format
          let slotIndex = 0;
          for (const installed of dcAny.installedRacks as InstalledRack[]) {
            for (let i = 0; i < installed.count && slotIndex < totalSlots; i++) {
              dc.rackSlots[slotIndex] = installed.designId;
              slotIndex++;
            }
          }

          // Remove old property
          delete dcAny.installedRacks;
        } else if (!dc.rackSlots) {
          // No rackSlots and no installedRacks - initialize empty
          const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
          const totalSlots = design?.totalRacks || 50;
          dc.rackSlots = new Array(totalSlots).fill(null);
        }
      }
    }
  },

  reset(): void {
    this.campuses = [];
  }
};
