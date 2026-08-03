import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const workspace = resolve(import.meta.dirname, "..");
const source = join(workspace, "src", "app", "icon.svg");
const destination = join(workspace, "src", "app", "favicon.ico");
const temporary = await mkdtemp(join(tmpdir(), "vowfound-favicon-"));

try {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map(async (size) => {
      const output = join(temporary, `favicon-${size}.png`);
      await sharp(source).resize(size, size).png().toFile(output);
      return output;
    }),
  );

  const icon = await pngToIco(pngs);
  await writeFile(destination, icon);
  console.log(`Generated ${destination} from ${source}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
