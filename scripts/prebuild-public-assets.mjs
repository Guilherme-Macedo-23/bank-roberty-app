import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const assetsDir = path.join(publicDir, 'assets');

const onCI = process.env.VERCEL === '1' || process.env.CI === 'true';

if (!onCI) {
  process.exit(0);
}

fs.mkdirSync(publicDir, { recursive: true });

/** Entrada existe no diretório (inclui symlink quebrado — existsSync mente nesse caso). */
function entryExists(p) {
  try {
    fs.lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

if (entryExists(assetsDir)) {
  const st = fs.lstatSync(assetsDir);
  if (st.isSymbolicLink()) {
    console.warn(
      '[prebuild] public/assets é um symlink (quebrado ou local). Removendo para o Vite conseguir copiar public/ na Vercel.'
    );
    fs.unlinkSync(assetsDir);
  }
}

if (!entryExists(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(
    path.join(assetsDir, '.gitkeep'),
    '# Placeholder: faça commit dos PNGs em public/assets (sem symlink).\n'
  );
  console.warn(
    '[prebuild] public/assets ausente após limpeza — criada pasta só com .gitkeep. ' +
      'O build passa; o slot só carrega arte se os arquivos reais estiverem no repositório.'
  );
}
