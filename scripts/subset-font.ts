import subsetFont from 'subset-font';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface GlyphConfig {
  glyphs: string[];
  inputFont: string;
  outputFont: string;
}

async function main(): Promise<void> {
  const configPath = resolve(__dirname, 'emoji-glyphs.json');
  const config: GlyphConfig = JSON.parse(await readFile(configPath, 'utf-8'));

  const inputPath = resolve(__dirname, config.inputFont);
  const outputPath = resolve(__dirname, config.outputFont);

  console.log(`Loading font from: ${inputPath}`);
  const inputBuffer = await readFile(inputPath);

  const glyphText = config.glyphs.join('');
  console.log(`Subsetting font with ${config.glyphs.length} glyphs: ${glyphText}`);

  const subsetBuffer = await subsetFont(inputBuffer, glyphText, {
    targetFormat: 'truetype',
  });

  await writeFile(outputPath, subsetBuffer);

  const originalSize = inputBuffer.length;
  const subsetSize = subsetBuffer.length;
  const reduction = ((1 - subsetSize / originalSize) * 100).toFixed(1);

  console.log(`\nFont subset created successfully!`);
  console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Subset:   ${(subsetSize / 1024).toFixed(2)} KB`);
  console.log(`  Reduction: ${reduction}%`);
  console.log(`\nOutput: ${outputPath}`);
}

main().catch((error) => {
  console.error('Error creating font subset:', error);
  process.exit(1);
});
