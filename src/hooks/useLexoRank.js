/**
 * LexoRank / Fractional Indexing utilities
 * 
 * Used for efficient ordering in Kanban boards.
 * Moving an item requires only 1 database write (vs N writes with integer indexing).
 * 
 * Format: "0|aaaaaa:" where the middle section is the rank string
 */

const BUCKET = '0';
const SEPARATOR = '|';
const COLON = ':';
const MIN_CHAR = 'a';
const MAX_CHAR = 'z';
const MID_CHAR = 'n';
const DEFAULT_LENGTH = 6;

/**
 * Generate initial LexoRank
 */
export const generateLexoRank = () => {
    const rank = MID_CHAR.repeat(DEFAULT_LENGTH);
    return `${BUCKET}${SEPARATOR}${rank}${COLON}`;
};

/**
 * Extract rank string from full LexoRank
 */
const extractRank = (lexoRank) => {
    if (!lexoRank) return null;
    const parts = lexoRank.split(SEPARATOR);
    if (parts.length !== 2) return null;
    return parts[1].replace(COLON, '');
};

/**
 * Build full LexoRank from rank string
 */
const buildLexoRank = (rank) => {
    return `${BUCKET}${SEPARATOR}${rank}${COLON}`;
};

/**
 * Get middle character between two characters
 */
const getMiddleChar = (a, b) => {
    const aCode = a ? a.charCodeAt(0) : MIN_CHAR.charCodeAt(0);
    const bCode = b ? b.charCodeAt(0) : MAX_CHAR.charCodeAt(0);
    const midCode = Math.floor((aCode + bCode) / 2);
    return String.fromCharCode(midCode);
};

/**
 * Generate rank between two existing ranks
 * Returns a rank string that sorts between prev and next
 */
const getMidRank = (prev, next) => {
    const prevRank = prev || '';
    const nextRank = next || '';

    let result = '';
    let i = 0;

    // Find first differing position
    while (true) {
        const prevChar = prevRank[i] || MIN_CHAR;
        const nextChar = nextRank[i] || MAX_CHAR;

        if (prevChar === nextChar) {
            result += prevChar;
            i++;
            continue;
        }

        const midChar = getMiddleChar(prevChar, nextChar);

        if (midChar === prevChar) {
            // Need to go deeper
            result += prevChar;
            i++;
            continue;
        }

        result += midChar;
        break;
    }

    // Ensure minimum length
    while (result.length < DEFAULT_LENGTH) {
        result += MID_CHAR;
    }

    return result;
};

/**
 * Generate a rank between two LexoRanks
 * 
 * @param {string|null} before - LexoRank before the new position (or null if first)
 * @param {string|null} after - LexoRank after the new position (or null if last)
 * @returns {string} New LexoRank that sorts between before and after
 */
export const generateBetweenRank = (before, after) => {
    const prevRank = extractRank(before);
    const nextRank = extractRank(after);

    if (!prevRank && !nextRank) {
        // No neighbors, use default
        return generateLexoRank();
    }

    if (!prevRank) {
        // Moving to start, generate rank before 'after'
        const midRank = getMidRank(null, nextRank);
        return buildLexoRank(midRank);
    }

    if (!nextRank) {
        // Moving to end, generate rank after 'before'
        const midRank = getMidRank(prevRank, null);
        return buildLexoRank(midRank);
    }

    // Moving between two items
    const midRank = getMidRank(prevRank, nextRank);
    return buildLexoRank(midRank);
};

/**
 * Compare two LexoRanks for sorting
 */
export const compareLexoRank = (a, b) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
};

/**
 * React hook for LexoRank utilities
 */
export const useLexoRank = () => {
    return {
        generateLexoRank,
        generateBetweenRank,
        compareLexoRank
    };
};

export default useLexoRank;
