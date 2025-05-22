/*---------------------------------------------------------------
  Functions related to the web platform
  
  - waiting for document initialization
  - texture loading
  - keyboard bindings
  - input element creation
---------------------------------------------------------------*/

/**
 * This promise gets resolved when the document has loaded
 * loading - https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
 * what is a promise - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */
export const isDOMLoadedPromise = new Promise((resolve) => {
  if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", resolve);
  } else {
    // `DOMContentLoaded` has already fired
    resolve();
  }
});

/**
 * Downloads an image from a URL
 * @param {string} imgUrl - URL of the image to load
 * @returns {Promise<HTMLImageElement>} - Promise resolving to the loaded image
 */
export function loadImage(imgUrl) {
  return new Promise((resolve, reject) => {
    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous";
    imgObj.addEventListener("load", (ev) => resolve(ev.target));
    imgObj.addEventListener("error", (ev) => {
      console.error(
        `Failed to load image ${imgUrl}, maybe due to CORS. img.onerror returned`,
        ev
      );
      reject(ev);
    });
    imgObj.src = imgUrl;
  });
}

/**
 * Downloads an image and converts it to a WebGL texture
 * @param {Object} reglInstance - REGL instance for GPU communication
 * @param {string} imgUrl - URL of the image to load
 * @param {Object} texOptions - Override texture construction options
 * @returns {Promise<Object>} - Promise resolving to the created texture
 * @see https://github.com/regl-project/regl/blob/master/API.md#textures
 */
export async function loadTexture(reglInstance, imgUrl, texOptions = {}) {
  const img = await loadImage(imgUrl);

  return reglInstance.texture(
    Object.assign(
      {
        data: img,
        // When sampling the texture, use linear interpolation not just the nearest pixel
        mag: "linear",
        min: "linear",
      },
      texOptions
    )
  );
}

/**
 * Loads text content from a URL
 * @param {string} url - URL to fetch text from
 * @returns {Promise<string>} - Promise resolving to the text content
 */
export async function loadText(url) {
  try {
    const response = await fetch(url);
    const responseText = await response.text();
    return responseText;
  } catch (e) {
    console.error("Failed to load text resource from", url, "error:", e);
    throw e;
  }
}

/**
 * Keyboard binding manager
 */
class KeyboardManager {
  constructor() {
    this.keyboardActions = {};

    this.initialize();
  }

  initialize() {
    isDOMLoadedPromise.then(() => {
      document.addEventListener("keydown", (event) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
        // Shift affects the key string, shift+a yields A
        // Alt+letter yields locale specific characters, alt+a = ą etc
        const key = event.key.toLowerCase();

        const handlers = this.keyboardActions[key];

        if (handlers) {
          handlers.forEach((handler) => handler(event));
        }
      });
    });
  }

  /**
   * Register a keyboard action for a specific key
   * @param {string} key - The key to bind
   * @param {Function} handler - Function to call when key is pressed
   */
  registerAction(key, handler) {
    key = key.toLowerCase();
    const handlers = this.keyboardActions[key] || [];
    this.keyboardActions[key] = handlers;
    handlers.push(handler);
  }
}

// Create a singleton instance of the keyboard manager
const keyboardManager = new KeyboardManager();

/**
 * UI Manager for handling overlay elements
 */
class UIManager {
  constructor() {
    this.overlay = null;

    isDOMLoadedPromise.then(() => {
      this.overlay = document.getElementById("overlay");
    });
  }

  /**
   * Remove all elements from the overlay
   */
  clearOverlay() {
    if (this.overlay) {
      this.overlay.replaceChildren();
    }
  }

  /**
   * Toggle visibility of the overlay
   */
  toggleOverlayVisibility() {
    if (this.overlay) {
      this.overlay.classList.toggle("hide");
    }
  }

  /**
   * Create a new slider
   * @param {string} title - Display title near the slider
   * @param {Array<number>} range - The range of the slider [min, max]
   * @param {Function} action - Function to execute when slider value changes
   */
  createSlider(title, range, action, initialValue = range[0], step = 1) {
    if (!this.overlay) return;

    // Creates the html elements
    const sliderBlock = document.createElement("div");
    const slider = document.createElement("input");
    const sliderText = document.createElement("span");

    // Set some values of these elements
    sliderBlock.className = "sliderBlock";
    slider.className = "slider";
    slider.type = "range";
    slider.min = range[0];
    slider.max = range[1];
    slider.step = step;
    slider.value = initialValue; // set default value to the min value
    sliderText.textContent = `${title}: ${initialValue}`;

    // Define the action executed when the input changes (when dragging the slider)
    slider.oninput = () => {
      sliderText.textContent = `${title}: ${slider.value}`;
      action(slider.value);
    };

    // Add the html elements to the hierarchy
    sliderBlock.appendChild(sliderText);
    sliderBlock.appendChild(slider);
    this.overlay.appendChild(sliderBlock);
  }

  /**
   * Create a block to display hotkey actions and bind the keyboard key to the action
   * @param {string} title - Display text on the overlay
   * @param {string} key - Keyboard key to bind (ex: "a")
   * @param {Function} action - Function to execute when key is pressed
   */
  createHotkeyAction(title, key, action) {
    if (!this.overlay) return;

    const instruction = document.createElement("p");
    instruction.textContent = `${title}`;

    const hotkey = document.createElement("span");
    hotkey.textContent = key;
    hotkey.className = "hotkey";

    instruction.appendChild(hotkey);
    this.overlay.appendChild(instruction);
    keyboardManager.registerAction(key, () => action());
  }

  /**
   * Create a button on the overlay that triggers an action when clicked
   * @param {string} title - Text to display on the button
   * @param {Function} action - Function to execute when button is pressed
   * @returns {HTMLDivElement} - The created button container
   */
  createButton(title, action) {
    if (!this.overlay) return null;

    const buttonBlock = document.createElement("div");
    const button = document.createElement("button");
    button.textContent = title;

    button.onclick = () => {
      action();
    };

    buttonBlock.appendChild(button);
    this.overlay.appendChild(buttonBlock);
    return buttonBlock;
  }

  /**
   * Create a button and bind a hotkey to execute an action
   * @param {string} title - Text displayed on the button
   * @param {string} key - Key to bind (ex: "v")
   * @param {Function} action - Function to execute when button or hotkey is pressed
   */
  createButtonWithHotkey(title, key, action) {
    if (!this.overlay) return;

    const buttonBlock = this.createButton(title, action);

    const hotkey = document.createElement("span");
    hotkey.textContent = key;
    hotkey.className = "hotkey";
    buttonBlock.appendChild(hotkey);

    keyboardManager.registerAction(key, () => action());
  }

  createDropdown(title, options, action) {
    if (!this.overlay) return;

    const dropdownBlock = document.createElement("div");
    const dropdown = document.createElement("select");
    dropdown.className = "dropdown";
    const label = document.createElement("label");

    label.textContent = title;
    label.setAttribute("for", "dropdown");

    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      dropdown.appendChild(opt);
    });

    dropdown.onchange = () => {
      action(dropdown.value);
    };

    dropdownBlock.appendChild(label);
    dropdownBlock.appendChild(dropdown);
    this.overlay.appendChild(dropdownBlock);
  }

  /**
   * Create a form to input two values (x & y) with a submit button
   * @param {string} title - Text to display next to the inputs
   * @param {Function} action - Function to execute when submit button is pressed
   */
  createOffsetForm(title, action) {
    if (!this.overlay) return;

    // Create new html elements for the form
    const form = document.createElement("form");
    const inputX = document.createElement("input");
    const inputY = document.createElement("input");
    const submit = document.createElement("input");

    inputX.className = "terrainOffset";
    inputX.type = "number";
    inputX.id = "terrainOffsetX";
    inputX.min = -1000;
    inputX.max = 1000;
    inputX.value = 0;

    inputY.className = "terrainOffset";
    inputY.type = "number";
    inputY.id = "terrainOffsetY";
    inputY.min = -1000;
    inputY.max = 1000;
    inputY.value = 0;

    submit.type = "submit";
    submit.id = "submitOffset";
    submit.value = title;

    // Overwrite button default behavior to instead call our action function
    // without a reload of the page
    submit.onclick = (event) => {
      event.preventDefault();
      action([inputX.value, inputY.value]);
    };

    // Add the element to the hierarchy
    form.appendChild(submit);
    form.appendChild(inputX);
    form.appendChild(inputY);
    this.overlay.appendChild(form);
  }
}

// Create a singleton instance of the UI manager
const uiManager = new UIManager();

// Export singleton instances through convenience functions
export const clearOverlay = () => uiManager.clearOverlay();
export const toggleOverlayVisibility = () =>
  uiManager.toggleOverlayVisibility();
export const createSlider = (title, range, action, initialValue, step) =>
  uiManager.createSlider(title, range, action, initialValue, step);
export const createHotkeyAction = (title, key, action) =>
  uiManager.createHotkeyAction(title, key, action);
export const createButton = (title, action) =>
  uiManager.createButton(title, action);
export const createButtonWithHotkey = (title, key, action) =>
  uiManager.createButtonWithHotkey(title, key, action);
export const createOffsetForm = (title, action) =>
  uiManager.createOffsetForm(title, action);
export const createDropdown = (title, options, action) =>
  uiManager.createDropdown(title, options, action);