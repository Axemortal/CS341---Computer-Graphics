// Load rule set from JSON
const BLOCK_WEIGHTS = {
  city_block1: 1,
  city_block2: 10,
  city_block3: 1
};

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
  // 1) Find the minimum entropy
  let minEntropy = Infinity;
  for (const slice of grid) {
    for (const row of slice) {
      for (const cell of row) {
        if (!cell.collapsed && cell.options.length > 0 && cell.options.length < minEntropy) {
          minEntropy = cell.options.length;
        }
      }
    }
  }
  if (minEntropy === Infinity) return false;

  // 2) Collect all cells with that entropy
  const candidates = [];
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      for (let z = 0; z < grid[x][y].length; z++) {
        const cell = grid[x][y][z];
        if (!cell.collapsed && cell.options.length === minEntropy) {
          candidates.push({ x, y, z });
        }
      }
    }
  }

  // 3) Pick one at random
  const { x, y, z } = candidates[Math.floor(Math.random() * candidates.length)];
  const cell = grid[x][y][z];

  // 4) Build a weighted pool and choose
  const weightedPool = [];
  for (const variant of cell.options) {
    // strip off any "_rotN" suffix to get base ID
    const baseId = variant.id.split("_rot")[0];
    const weight = BLOCK_WEIGHTS[baseId] || 1;
    for (let i = 0; i < weight; i++) {
      weightedPool.push(variant);
    }
  }

  const choice = weightedPool[Math.floor(Math.random() * weightedPool.length)];
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

// Execute WFC and identify boundary-facing cells for plane attachments
export async function runWFC(dimX = 10, dimY = 10, dimZ = 1) {
  const data = await loadRules();
  // Prepare all rotated variants
  const variants = [];
  const axisMap = { x: [1,0,0], y: [0,1,0], z: [0,0,1] };
  const axes = Object.values(axisMap);

  data.tiles.forEach(tile => {
    const rots = tile.rotations || 1;
    for (let r = 0; r < rots; r++) {
      // pick axis: from metadata or random
      const axisKey = tile.rotationAxis?.toLowerCase();
      const axis = axisMap[axisKey] || axes[Math.floor(Math.random() * axes.length)];

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

  // Process the grid
  for (let x = 0; x < dimX; x++) {
    for (let y = 0; y < dimY; y++) {
      for (let z = 0; z < dimZ; z++) {
        const cell = grid[x][y][z];
        if (!cell || !cell.collapsed) continue;
        const variant = cell.options[0];
        
        // Only store asset if it exists
        if (variant) {
          result[x][y][z] = {
            ...variant,
            position: [x, y, z]
          };
        }
      }
    }
  }

  return result;
}