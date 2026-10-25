// Copia la web dentro del proyecto de Xcode (ios/App/App/public) y escribe su capacitor.config.json.
// Es lo mismo que haría `npx cap sync ios`, pero sin necesitar npm.
//   node scripts/build.mjs
// La web de siempre sigue funcionando igual desde la raíz del repo.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "index.html",
  "privacy.html",
  "terms.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
];

const appDir = join(root, "ios/App/App");
if (!existsSync(appDir)) {
  console.error("No encuentro ios/App/App: ¿estás en la carpeta del proyecto?");
  process.exit(1);
}

const out = join(appDir, "public");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const missing = [];
for (const f of files) {
  const src = join(root, f);
  if (existsSync(src)) cpSync(src, join(out, f));
  else missing.push(f);
}

// Configuración que lee la app al arrancar, con la lista de plugins nativos
const cfg = JSON.parse(readFileSync(join(root, "capacitor.config.json"), "utf8"));
cfg.packageClassList = ["FirebaseAuthenticationPlugin", "SharePlugin", "FilesystemPlugin"];
writeFileSync(join(appDir, "capacitor.config.json"), JSON.stringify(cfg, null, "\t") + "\n");
// El proyecto de Xcode espera también un config.xml (de Cordova), aunque no usemos plugins de Cordova
writeFileSync(join(appDir, "config.xml"), `<?xml version='1.0' encoding='utf-8'?>
<widget version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
  <access origin="*" />
</widget>
`);

console.log(`Web copiada a ios/App/App/public (${files.length - missing.length} archivos).`);
if (missing.length) console.warn("Aviso, faltan: " + missing.join(", "));

// ===== Android =====
const andDir = join(root, "android/app/src/main/assets");
if (existsSync(join(root, "android/app"))) {
  const aout = join(andDir, "public");
  rmSync(aout, { recursive: true, force: true });
  mkdirSync(aout, { recursive: true });
  for (const f of files) {
    const src = join(root, f);
    if (existsSync(src)) cpSync(src, join(aout, f));
  }
  const acfg = JSON.parse(readFileSync(join(root, "capacitor.config.json"), "utf8"));
  acfg.plugins = acfg.plugins || {};
  acfg.plugins.FirebaseAuthentication = { ...(acfg.plugins.FirebaseAuthentication || {}), providers: ["google.com"] };
  writeFileSync(join(andDir, "capacitor.config.json"), JSON.stringify(acfg, null, "\t") + "\n");
  writeFileSync(join(andDir, "capacitor.plugins.json"), JSON.stringify([{ pkg: "@capacitor-firebase/authentication", classpath: "io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin" }, { pkg: "@capacitor/share", classpath: "com.capacitorjs.plugins.share.SharePlugin" }, { pkg: "@capacitor/filesystem", classpath: "com.capacitorjs.plugins.filesystem.FilesystemPlugin" }], null, "\t") + "\n");
  console.log("Web copiada a android/app/src/main/assets/public.");
}
