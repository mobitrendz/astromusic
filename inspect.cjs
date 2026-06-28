const fs = require('fs');
const content = fs.readFileSync('src/components/DevotionalPlayer.tsx', 'utf8');
const startText = 'export const SACRED_TREASURY_PLAYLIST: PlaylistTrack[] = [';
const startIdx = content.indexOf(startText);
if (startIdx === -1) {
  console.log('Not found');
  process.exit(1);
}

// Find the end of the array, which is ]; at the beginning of a line or after some whitespace
const restOfContent = content.substring(startIdx + startText.length);
// We can find the closing bracket of the array
let bracketCount = 1;
let arrayEndIdx = -1;
for (let i = 0; i < restOfContent.length; i++) {
  if (restOfContent[i] === '[') {
    bracketCount++;
  } else if (restOfContent[i] === ']') {
    bracketCount--;
    if (bracketCount === 0) {
      arrayEndIdx = i;
      break;
    }
  }
}

if (arrayEndIdx === -1) {
  console.log('Array end not found');
  process.exit(1);
}

const arrayStr = restOfContent.substring(0, arrayEndIdx);

// Now find all track objects
const trackRegex = /\{\s*id:\s*"([^"]+)"[\s\S]*?\}/g;
const tracks = [];
let match;
while ((match = trackRegex.exec(arrayStr)) !== null) {
  // Extract id, nameEn, and category
  const block = match[0];
  const id = match[1];
  const nameEnMatch = block.match(/nameEn:\s*"([^"]+)"/);
  const nameEn = nameEnMatch ? nameEnMatch[1] : '';
  const categoryMatch = block.match(/category:\s*"([^"]+)"/);
  const category = categoryMatch ? categoryMatch[1] : '';
  tracks.push({ id, nameEn, category });
}

console.log(`Total tracks found: ${tracks.length}`);
console.log('Tracks list:', JSON.stringify(tracks, null, 2));

// Group by category
const byCategory = {};
tracks.forEach(t => {
  byCategory[t.category] = (byCategory[t.category] || []).concat(t.nameEn);
});
console.log('By category count:', Object.keys(byCategory).map(k => `${k}: ${byCategory[k].length}`));
