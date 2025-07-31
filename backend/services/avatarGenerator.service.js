const crypto = require('crypto')
const {createCanvas, registerFont} = require('canvas');

/**
 * AvatarGeneratorService
 *
 * Generates a PNG avatar image buffer using initials and a hash-based background color.
 */
class AvatarGeneratorService {
    #size;
    #scale;
    #fontFamily;
    #fontWeight;
    #textColor;

    /**
     * @param {Object} [options]
     * @param {number} [options.size=128] - Avatar width/height
     * @param {number} [options.scale=3] - DPI scale
     * @param {string} [options.fontFamily='Quicksand'] - Font family
     * @param {string} [options.fontWeight='bold'] - Font weight
     * @param {string} [options.textColor='white'] - Initials text color
     */
    constructor({
                    size = 128,
                    scale = 3,
                    fontFamily = 'Quicksand',
                    fontWeight = 'bold',
                    textColor = 'white'
                } = {}) {
        this.#size = size;
        this.#scale = scale;
        this.#fontFamily = fontFamily;
        this.#fontWeight = fontWeight;
        this.#textColor = textColor;
    }

    /**
     * Public method to register a single font file for use in avatars.
     * @param {string} filePath - Absolute path to the font file.
     * @param {string} [weight='bold'] - Font weight (e.g., '400', '700').
     * @param {string} [family='Quicksand'] - Optional custom font family name.
     */
    registerFontFile(filePath, weight = 'bold', family = 'Quicksand') {
        registerFont(filePath, {
            family,
            weight,
        });
    }

    /**
     * Generate avatar PNG buffer
     * @param {Object} params
     * @param {string} params.firstname
     * @param {string} params.lastname
     * @param {string} params.id
     * @returns {Buffer}
     */
    generate({firstname, lastname, id}) {
        if (!firstname || !lastname || !id) {
            throw new Error('Missing required fields: firstname, lastname, or id');
        }

        const initials = `${firstname[0]}${lastname[0]}`.toUpperCase();

        // Generate unique hash based on all inputs
        const inputString = `${firstname}:${lastname}:${id}`;
        const hash = this.#hashString(inputString);

        // Use hash parts to calculate H, S, L
        const hue = Math.abs(hash) % 360;
        const saturation = 50 + (Math.abs(hash >> 2) % 30); // 50–80%
        const lightness = 40 + (Math.abs(hash >> 4) % 20); // 40–60%

        const canvas = createCanvas(this.#size * this.#scale, this.#size * this.#scale);
        const ctx = canvas.getContext('2d');

        ctx.scale(this.#scale, this.#scale);

        // Background color
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(0, 0, this.#size, this.#size);

        // Text
        ctx.fillStyle = this.#textColor;
        ctx.font = `${this.#fontWeight} ${this.#size * 0.5}px ${this.#fontFamily}, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, this.#size / 2, this.#size / 2);

        return canvas.toBuffer('image/png');
    }

    #hashString(str) {
        const hash = crypto.createHash('sha256').update(str).digest('hex');
        return parseInt(hash.substring(0, 8), 16); // convert first 4 bytes to int
    }
}

module.exports = AvatarGeneratorService;
