// Ajusta el proyecto de Xcode después de `npx cap add ios`.
// Se puede ejecutar las veces que haga falta: no duplica nada.
//   npm run ios:setup
// Hace: textos de permisos (cámara/fotos), cifrado, esquema de URL de Google,
// capacidad "Iniciar sesión con Apple" y copia GoogleService-Info.plist al proyecto.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = join(root, "ios/App/App");
const infoPath = join(appDir, "Info.plist");
const pbxPath = join(root, "ios/App/App.xcodeproj/project.pbxproj");
const entPath = join(appDir, "App.entitlements");

if (!existsSync(infoPath)) {
  console.error("No encuentro ios/App/App/Info.plist. Ejecuta antes: npx cap add ios");
  process.exit(1);
}

const todo = [];
let info = readFileSync(infoPath, "utf8");

const setKey = (key, xmlValue) => {
  const re = new RegExp(`<key>${key}</key>\\s*<(string|true|false)[^>]*?(?:/>|>[^<]*</string>)`);
  if (re.test(info)) info = info.replace(re, `<key>${key}</key>\n\t${xmlValue}`);
  else info = info.replace(/<\/dict>\s*<\/plist>\s*$/, `\t<key>${key}</key>\n\t${xmlValue}\n</dict>\n</plist>\n`);
};
const str = (s) => `<string>${s}</string>`;

setKey("CFBundleDisplayName", str("Primeros alimentos"));
setKey("NSCameraUsageDescription", str("Para hacer fotos de las comidas de tu bebé y de documentos que quieras leer en la app."));
setKey("NSPhotoLibraryUsageDescription", str("Para elegir fotos de las comidas de tu bebé o documentos de tu galería."));
setKey("NSPhotoLibraryAddUsageDescription", str("Para guardar en tu galería las imágenes que compartes desde la app."));
setKey("ITSAppUsesNonExemptEncryption", "<false/>");
// Solo en vertical en iPhone
info = info.replace(
  /(<key>UISupportedInterfaceOrientations<\/key>\s*<array>)[\s\S]*?(<\/array>)/,
  "$1\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t$2"
);

// Google Sign-In necesita el REVERSED_CLIENT_ID como esquema de URL
const gsiSrc = [join(root, "GoogleService-Info.plist"), join(appDir, "GoogleService-Info.plist")].find(existsSync);
if (gsiSrc) {
  if (gsiSrc !== join(appDir, "GoogleService-Info.plist")) copyFileSync(gsiSrc, join(appDir, "GoogleService-Info.plist"));
  const gsi = readFileSync(gsiSrc, "utf8");
  const m = gsi.match(/<key>REVERSED_CLIENT_ID<\/key>\s*<string>([^<]+)<\/string>/);
  if (!m) todo.push("GoogleService-Info.plist no tiene REVERSED_CLIENT_ID: descárgalo de nuevo de Firebase tras activar Google.");
  else if (!info.includes(m[1])) {
    const entry = `\t\t<dict>\n\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>${m[1]}</string>\n\t\t\t</array>\n\t\t</dict>\n`;
    if (/<key>CFBundleURLTypes<\/key>\s*<array>/.test(info))
      info = info.replace(/(<key>CFBundleURLTypes<\/key>\s*<array>\n?)/, `$1${entry}`);
    else
      info = info.replace(/<\/dict>\s*<\/plist>\s*$/, `\t<key>CFBundleURLTypes</key>\n\t<array>\n${entry}\t</array>\n</dict>\n</plist>\n`);
  }
} else {
  todo.push("Falta GoogleService-Info.plist: descárgalo de Firebase (app de iOS) y ponlo en la raíz del repo, luego repite npm run ios:setup.");
}
writeFileSync(infoPath, info);

// Capacidad "Sign in with Apple"
if (!existsSync(entPath)) {
  writeFileSync(entPath, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.developer.applesignin</key>
\t<array>
\t\t<string>Default</string>
\t</array>
</dict>
</plist>
`);
}
let pbx = readFileSync(pbxPath, "utf8");
if (!pbx.includes("CODE_SIGN_ENTITLEMENTS")) {
  pbx = pbx.replace(/(\n(\s*)INFOPLIST_FILE = App\/Info\.plist;)/g, "\n$2CODE_SIGN_ENTITLEMENTS = App/App.entitlements;$1");
  writeFileSync(pbxPath, pbx);
}
// Solo iPhone: así Apple no pide capturas ni pruebas específicas de iPad (en iPad se puede instalar igualmente en modo iPhone)
if (/TARGETED_DEVICE_FAMILY = "1,2";/.test(pbx)) {
  pbx = pbx.replace(/TARGETED_DEVICE_FAMILY = "1,2";/g, "TARGETED_DEVICE_FAMILY = 1;");
  writeFileSync(pbxPath, pbx);
}
// Añade GoogleService-Info.plist al proyecto (al lado de capacitor.config.json) para que vaya dentro de la app
if (gsiSrc && !pbx.includes("GoogleService-Info.plist")) {
  const BF = "A1B2C3D40000000000000001", FR = "A1B2C3D40000000000000002";
  const CF = "50379B222058CBB4000EE86E", CB = "50379B232058CBB4000EE86E"; // capacitor.config.json en la plantilla
  const before = pbx;
  pbx = pbx
    .replace(/(\/\* Begin PBXBuildFile section \*\/\n)/, `$1\t\t${BF} /* GoogleService-Info.plist in Resources */ = {isa = PBXBuildFile; fileRef = ${FR} /* GoogleService-Info.plist */; };\n`)
    .replace(/(\/\* Begin PBXFileReference section \*\/\n)/, `$1\t\t${FR} /* GoogleService-Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = "GoogleService-Info.plist"; sourceTree = "<group>"; };\n`)
    .replace(new RegExp(`(\\n(\\s*)${CF} /\\* capacitor.config.json \\*/,)`), `$1\n$2${FR} /* GoogleService-Info.plist */,`)
    .replace(new RegExp(`(\\n(\\s*)${CB} /\\* capacitor.config.json in Resources \\*/,)`), `$1\n$2${BF} /* GoogleService-Info.plist in Resources */,`);
  if ((pbx.match(/GoogleService-Info\.plist/g) || []).length === 6) writeFileSync(pbxPath, pbx);
  else {
    pbx = before;
    todo.push("En Xcode, arrastra ios/App/App/GoogleService-Info.plist a la carpeta App (marca \"Copy items if needed\" y el target App).");
  }
}

console.log("Proyecto de iOS ajustado.");
if (todo.length) console.log("\nTe queda:\n- " + todo.join("\n- "));
