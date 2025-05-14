// Load rule set from JSON
export async function loadRules(url = '/Project/assets/rules.json') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load rules.json: ${res.statusText}`);
  return res.json();
}

// Initialize a 3D grid of cells, each with all possible tile variants
export function initGrid(dimX, dimY, dimZ, variants) {
  return Array.from({ length: dimX }, () =>
    Array.from({ length: dimY }, () =>
      Array.from({ length: dimZ }, () => ({
        collapsed: false,
        options: variants.slice()
      }))
    )
  );
}

// Map cardinal face names to neighbor offsets, direction name and opposite face names
export const CARDINALS = {
  '+x': { dx: 1, dy: 0, dz: 0, dir: 'right', opp: 'left', normal: [1, 0, 0] },
  '-x': { dx:-1, dy: 0, dz: 0, dir: 'left',  opp: 'right', normal: [-1, 0, 0] },
  '+y': { dx: 0, dy: 1, dz: 0, dir: 'front', opp: 'back', normal: [0, 1, 0] },
  '-y': { dx: 0, dy:-1, dz: 0, dir: 'back',  opp: 'front', normal: [0, -1, 0] },
  '+z': { dx: 0, dy: 0, dz: 1, dir: 'top', opp: 'bottom', normal: [0, 0, 1] },
  '-z': { dx: 0, dy: 0, dz:-1, dir: 'bottom', opp: 'top', normal: [0, 0, -1] }
};

// Opposite face helper
export function getOppositeDir(dir) {
  return { top:'bottom', bottom:'top', left:'right', right:'left', front:'back', back:'front' }[dir];
}

// Constraint propagation
export function propagate(grid, compatibility) {
  const dimX = grid.length;
  const dimY = grid[0].length;
  const dimZ = grid[0][0].length;
  const neighborDirs = [
    { dx: 1, dy: 0, dz: 0, dir: 'right'  },
    { dx:-1, dy: 0, dz: 0, dir: 'left'   },
    { dx: 0, dy: 1, dz: 0, dir: 'front'  },
    { dx: 0, dy:-1, dz: 0, dir: 'back'   },
    { dx: 0, dy: 0, dz: 1, dir: 'top'    },
    { dx: 0, dy: 0, dz:-1, dir: 'bottom' }
  ];

  let changed = true;
  while (changed) {
    changed = false;
    for (let x = 0; x < dimX; x++) {
      for (let y = 0; y < dimY; y++) {
        for (let z = 0; z < dimZ; z++) {
          const cell = grid[x][y][z];
          if (cell.collapsed) continue;

          const allowed = [];
          for (const variant of cell.options) {
            let ok = true;
            for (const nd of neighborDirs) {
              const nx = x + nd.dx;
              const ny = y + nd.dy;
              const nz = z + nd.dz;
              if (nx < 0 || ny < 0 || nz < 0 || nx >= dimX || ny >= dimY || nz >= dimZ) continue;
              const neighbor = grid[nx][ny][nz];
              const faceType = variant.faces[nd.dir];
              const compatList = compatibility[faceType] || [];
              const opp = getOppositeDir(nd.dir);
              if (!neighbor.options.some(o => compatList.includes(o.faces[opp]))) {
                ok = false;
                break;
              }
            }
            if (ok) allowed.push(variant);
          }
          if (allowed.length < cell.options.length) {
            cell.options = allowed;
            changed = true;
          }
        }
      }
    }
  }
}

// Collapse the lowest-entropy cell
export function collapseCell(grid) {
  let min = Infinity;
  let target = null;
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      for (let z = 0; z < grid[x][y].length; z++) {
        const cell = grid[x][y][z];
        if (!cell.collapsed && cell.options.length > 0 && cell.options.length < min) {
          min = cell.options.length;
          target = { x, y, z };
        }
      }
    }
  }
  if (!target) return false;

  const { x, y, z } = target;
  const cell = grid[x][y][z];
  const choice = cell.options[Math.floor(Math.random() * cell.options.length)];
  cell.options = [choice];
  cell.collapsed = true;
  return true;
}

// Rotate faces helper
function rotateFaces(faces, rot) {
  const orders = [
    ['left','front','right','back'],
    ['front','right','back','left'],
    ['right','back','left','front'],
    ['back','left','front','right']
  ];
  const o = orders[rot % 4];
  return {
    top: faces.top,
    bottom: faces.bottom,
    left: faces[o[0]],
    front: faces[o[1]],
    right: faces[o[2]],
    back: faces[o[3]]
  };
}

// Quaternion helper
export function quatFromAxisAngle(axis, angle) {
  const half = angle * 0.5;
  const s = Math.sin(half);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(half)];
}

// Convert direction name to cardinal key
function dirToCardinalKey(dir) {
  const dirToKey = {
    'right': '+x',
    'left': '-x',
    'front': '+y',
    'back': '-y',
    'top': '+z',
    'bottom': '-z'
  };
  return dirToKey[dir];
}

// Execute WFC and identify boundary-facing cells for plane attachments
export async function runWFC(dimX = 10, dimY = 10, dimZ = 1) {
  const data = await loadRules();
  // Prepare all rotated variants
  const variants = [];
  data.tiles.forEach(tile => {
    const rots = tile.rotations || 1;
    const axisMap = { x:[1,0,0], y:[0,1,0], z:[0,0,1] };
    const axis = axisMap[tile.rotationAxis] || axisMap.x;
    for (let r = 0; r < rots; r++) {
      variants.push({
        id: `${tile.id}_rot${r}`,
        model: tile.model,
        rotation: quatFromAxisAngle(axis, r * (Math.PI / 2)),
        faces: rotateFaces(tile.faces, r)
      });
    }
  });

  // Initialize grid and solve WFC
  const grid = initGrid(dimX, dimY, dimZ, variants);
  propagate(grid, data.compatibility);
  while (collapseCell(grid)) propagate(grid, data.compatibility);

  // Build final 3D array with attachPlanes from missing neighbors
  const result = Array.from({ length: dimX }, () =>
    Array.from({ length: dimY }, () =>
      Array(dimZ).fill(null)
    )
  );

  // Process the grid to identify exposed faces
  for (let x = 0; x < dimX; x++) {
    for (let y = 0; y < dimY; y++) {
      for (let z = 0; z < dimZ; z++) {
        const cell = grid[x][y][z];
        if (!cell || !cell.collapsed) continue;
        const variant = cell.options[0];
        
        // Create a structure to store exposed faces with their normals and directions
        const exposedFaces = [];
        
        // Check all six directions (not just the cardinal 4)
        for (const dirKey of Object.keys(CARDINALS)) {
          const { dx, dy, dz, dir, normal } = CARDINALS[dirKey];
          const nx = x + dx;
          const ny = y + dy;
          const nz = z + dz;
          
          // Check if this is an exterior face (either out of bounds or no neighbor)
          const isOutOfBounds = (
            nx < 0 || nx >= dimX || 
            ny < 0 || ny >= dimY || 
            nz < 0 || nz >= dimZ
          );
          
          const neighbor = isOutOfBounds ? null : grid[nx][ny][nz];
          const isExposed = isOutOfBounds || !neighbor || !neighbor.collapsed;
          
          if (isExposed) {
            // This face is exposed, store info about its direction and normal
            exposedFaces.push({
              direction: dir,
              cardinalKey: dirKey,
              normal: normal
            });
          }
        }
        
        // Only store asset if it exists and has exposed faces
        if (variant && exposedFaces.length > 0) {
          result[x][y][z] = {
            ...variant,
            exposedFaces: exposedFaces,
            position: [x, y, z]
          };
        } else if (variant) {
          // Still store the asset even if it has no exposed faces (interior asset)
          result[x][y][z] = {
            ...variant,
            exposedFaces: [],
            position: [x, y, z]
          };
        }
      }
    }
  }

  return result;
}