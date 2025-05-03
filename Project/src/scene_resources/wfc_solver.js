
// Load rule set from JSON
export async function loadRules(url = '/Project/assets/rules.json') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load rules.json: ${res.statusText}`);
  return res.json();
}

// Initialize a 3D grid of cells, each with all possible tile variants
export function initGrid(dimX, dimY, dimZ, variants) {
  const grid = [];
  for (let x = 0; x < dimX; x++) {
    grid[x] = [];
    for (let y = 0; y < dimY; y++) {
      grid[x][y] = [];
      for (let z = 0; z < dimZ; z++) {
        grid[x][y][z] = {
          collapsed: false,
          options: variants.slice(),
        };
      }
    }
  }
  return grid;
}

// Mapping axis directions to their opposites
export function getOppositeDir(dir) {
  return {
    top: 'bottom', bottom: 'top',
    left: 'right', right: 'left',
    front: 'back', back: 'front'
  }[dir];
}

// Constraint propagation: filter options based on neighbors
export function propagate(grid, compatibility) {
  const dimX = grid.length;
  const dimY = grid[0].length;
  const dimZ = grid[0][0].length;
  let changed = true;

  const neighbors = [
    { dx: 1, dy: 0, dz: 0, dir: 'right' },
    { dx:-1, dy: 0, dz: 0, dir: 'left'  },
    { dx: 0, dy: 1, dz: 0, dir: 'front' },
    { dx: 0, dy:-1, dz: 0, dir: 'back'  },
    { dx: 0, dy: 0, dz: 1, dir: 'top'   },
    { dx: 0, dy: 0, dz:-1, dir: 'bottom'}
  ];

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
            for (const n of neighbors) {
              const nx = x + n.dx;
              const ny = y + n.dy;
              const nz = z + n.dz;
              const faceType = variant.faces[n.dir];
              const compatList = compatibility[faceType] || [];

              // At grid boundary, skip constraint: allow any faceType
              if (nx < 0 || ny < 0 || nz < 0 || nx >= dimX || ny >= dimY || nz >= dimZ) {
                continue;
              }

              // In-bounds: neighbor options must share at least one compatible face
              const neighborCell = grid[nx][ny][nz];
              const oppDir = getOppositeDir(n.dir);
              const match = neighborCell.options.some(nv => compatList.includes(nv.faces[oppDir]));
              if (!match) {
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

// Collapse one cell: choose the cell with lowest entropy (fewest options)
export function collapseCell(grid) {
  let minOptions = Infinity;
  let target = null;
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      for (let z = 0; z < grid[x][y].length; z++) {
        const cell = grid[x][y][z];
        if (!cell.collapsed && cell.options.length > 0 && cell.options.length < minOptions) {
          minOptions = cell.options.length;
          target = { x, y, z };
        }
      }
    }
  }
  if (!target) return false;

  const cell = grid[target.x][target.y][target.z];
  const choice = cell.options[Math.floor(Math.random() * cell.options.length)];
  cell.options = [choice];
  cell.collapsed = true;
  return true;
}

function rotateFaces(faces, rot) {
  // rot: 0 = 0°, 1 = 90°, 2 = 180°, 3 = 270°
  const rotated = {};
  
  // Preserve vertical faces (top/bottom)
  rotated.top = faces.top;
  rotated.bottom = faces.bottom;
  
  // Define rotation patterns for horizontal faces
  const faceOrders = [
    ["left", "front", "right", "back"],  // 0° rotation
    ["front", "right", "back", "left"],  // 90° rotation
    ["right", "back", "left", "front"],  // 180° rotation
    ["back", "left", "front", "right"]   // 270° rotation
  ];
  
  // Apply rotation to horizontal faces
  const order = faceOrders[rot % 4];  // Ensure valid rotation index
  rotated.left = faces[order[0]];
  rotated.front = faces[order[1]];
  rotated.right = faces[order[2]];
  rotated.back = faces[order[3]];
  
  return rotated;
}

function quatFromAxisAngle(axis, angle) {
  const half = angle * 0.5;
  const s    = Math.sin(half);
  // axis must be normalized—but here it’s one of the cardinal axes, so its length is 1
  return [ axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(half) ];
}

export async function runWFC(dimX = 10, dimY = 10, dimZ = 1) {
  const data     = await loadRules();
  const variants = [];

  for (const tile of data.tiles) {
    const numRotations = tile.rotations || 1;

    // pick exactly one unit axis from your JSON string
    const axisMap = {
      x: [1, 0, 0],
      y: [0, 1, 0],
      z: [0, 0, 1]
    };
    const axis = axisMap[tile.rotationAxis] || axisMap.z; // fallback to Z

    for (let rot = 0; rot < numRotations; rot++) {
      // compute exactly rot × 90° around that axis
      const angle = rot * (Math.PI / 2);
      const q     = quatFromAxisAngle(axis, angle);

      variants.push({
        id:       `${tile.id}_rot${rot}`,
        model:    tile.model,
        rotation: q,                         // [x, y, z, w]
        faces:    rotateFaces(tile.faces, rot)
      });
    }
  }

  const compatibility = data.compatibility;
  const grid          = initGrid(dimX, dimY, dimZ, variants);
  propagate(grid, compatibility);
  while (collapseCell(grid)) propagate(grid, compatibility);

  return grid.map(slice =>
    slice.map(row =>
      row.map(cell => cell.options[0] || null)
    )
  );
}