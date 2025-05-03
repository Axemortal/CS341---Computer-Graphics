/*---------------------------------------------------------------
    Materials - Core Constants
---------------------------------------------------------------*/
const COLORS = {
  WHITE: [1.0, 1.0, 1.0],
  BLACK: [0.0, 0.0, 0.0],
  RED: [0.8, 0.2, 0.2],
  GREEN: [0.2, 0.8, 0.2],
  BLUE: [0.2, 0.2, 0.8],
  GRAY: [0.2, 0.2, 0.2],
  MAGENTA: [1.0, 0.0, 1.0],
  GOLD: [1.0, 0.84, 0.0],
  WATER_BLUE: [0.29, 0.51, 0.62],
  GRASS_GREEN: [0.33, 0.43, 0.18],
  PEAK_SNOW: [0.9, 0.9, 0.9],
  PEAK_ROCK: [0.8, 0.5, 0.4],
};

const DEFAULT_CONFIG = {
  texture: null,
  color: COLORS.MAGENTA, // magenta, as a default identifier
  shininess: 0.1, // MAX_SHININESS = 127.75
  properties: [],
};

/*---------------------------------------------------------------
    Base Material Class
---------------------------------------------------------------*/
/**
 * Base Material class representing how objects interact with light
 *
 * @property {string|null} texture - Path to texture or texture identifier
 * @property {number[]} color - RGB color array with values from 0-1
 * @property {number} shininess - Surface shininess coefficient
 * @property {string[]} properties - Special material properties for shader selection
 */
class Material {
  constructor(config = {}) {
    const { texture, color, shininess, properties } = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.texture = texture;
    this.color = color;
    this.shininess = shininess;
    this.properties = [...properties];
  }

  /**
   * Add a property to the material
   * @param {string} property - Property name to add
   * @returns {Material} - Returns this for chaining
   */
  addProperty(property) {
    if (!this.properties.includes(property)) {
      this.properties.push(property);
    }
    return this;
  }

  /**
   * Check if material has a specific property
   * @param {string} property - Property to check
   * @returns {boolean} - True if property exists
   */
  hasProperty(property) {
    return this.properties.includes(property);
  }
}

/*---------------------------------------------------------------
    Specialized Material Types
---------------------------------------------------------------*/

/**
 * Material for scene backgrounds and environments
 */
class BackgroundMaterial extends Material {
  constructor(config = {}) {
    super(config);
    this.addProperty("environment");
    this.addProperty("no_blinn_phong");
  }
}

/**
 * Standard diffuse material with optional texture
 */
class DiffuseMaterial extends Material {
  constructor(config = {}) {
    super(config);
  }
}

/**
 * Material that reflects the environment
 */
class ReflectiveMaterial extends Material {
  constructor(config = {}) {
    super(config);
    this.addProperty("reflective");
  }
}

/**
 * Special material for terrain with height-based coloring
 */
class TerrainMaterial extends Material {
  constructor(config = {}) {
    const defaultTerrainConfig = {
      water_color: COLORS.WATER_BLUE,
      water_shininess: 30,
      grass_color: COLORS.GRASS_GREEN,
      grass_shininess: 5,
      peak_color: COLORS.PEAK_SNOW,
      peak_shininess: 10,
    };

    super({});

    const finalConfig = { ...defaultTerrainConfig, ...config };

    // Set terrain-specific properties
    this.water_color = finalConfig.water_color;
    this.water_shininess = finalConfig.water_shininess;
    this.grass_color = finalConfig.grass_color;
    this.grass_shininess = finalConfig.grass_shininess;
    this.peak_color = finalConfig.peak_color;
    this.peak_shininess = finalConfig.peak_shininess;

    this.addProperty("terrain");
    this.addProperty("no_blinn_phong");
  }
}

/*---------------------------------------------------------------
    Material Instantiation - Predefined Materials
---------------------------------------------------------------*/

export const BasicColors = {
  gray: new DiffuseMaterial({ color: COLORS.GRAY }),
  red: new DiffuseMaterial({ color: COLORS.RED }),
  green: new DiffuseMaterial({ color: COLORS.GREEN }),
  blue: new DiffuseMaterial({ color: COLORS.BLUE }),
  white: new DiffuseMaterial({ color: COLORS.WHITE }),
  black: new DiffuseMaterial({ color: COLORS.BLACK }),
};

export const sunset_sky = new BackgroundMaterial({
  texture: "kloppenheim_07_puresky_blur.jpg",
});

export const gold = new DiffuseMaterial({
  texture: "tex_gold",
  color: COLORS.GOLD,
  shininess: 14.0,
});

export const pine = new DiffuseMaterial({
  texture: "pine.png",
  color: COLORS.WHITE,
  shininess: 0.5,
});

export const terrain = new TerrainMaterial({
  water_color: COLORS.WATER_BLUE,
  grass_color: COLORS.GRASS_GREEN,
  peak_color: COLORS.PEAK_ROCK,
});

export const mirror = new ReflectiveMaterial({
  color: COLORS.WHITE,
  shininess: 127.75,
});

export const concrete = new DiffuseMaterial({
  texture: "concrete.jpg",
  color: COLORS.WHITE,
  shininess: 0.5,
});

