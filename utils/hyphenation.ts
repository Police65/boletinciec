import { Font } from '@react-pdf/renderer';
import hyphen from 'hyphen';
import es from 'hyphen/patterns/es.js';

const hyphenator = hyphen(es);

Font.registerHyphenationCallback((word) => {
    // Return an array of syllables by splitting at soft hyphens
    return hyphenator(word).split('\u00AD');
});
