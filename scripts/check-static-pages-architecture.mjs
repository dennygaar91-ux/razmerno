import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "src/static-pages/shared/SiteHeader.tsx",
  "src/static-pages/shared/InfoFooter.tsx",
  "src/static-pages/shared/SectionHeader.tsx",
  "src/static-pages/shared/InfoCard.tsx",
  "src/static-pages/shared/InfoCardGrid.tsx",
  "src/static-pages/shared/InfoFinalCTA.tsx",
  "src/static-pages/HomePage.tsx",
  "src/static-pages/MeasurementsPage.tsx",
  "src/static-pages/MaterialsPage.tsx",
  "src/static-pages/AssemblyPage.tsx",
];

const pageComposition = [
  {
    file: "src/static-pages/HomePage.tsx",
    mustContain: ["<SiteHeader activePage=\"home\" />", "<HomeHero />", "<HomeFooter />"],
    mustNotContain: ["rzm-header-shell", "rzm-info-card", "rzm-info-final"],
  },
  {
    file: "src/static-pages/MeasurementsPage.tsx",
    mustContain: ["<SiteHeader activePage=\"measurements\" />", "<MeasurementsHero />", "<InfoFooter />"],
    mustNotContain: ["rzm-header-shell", "rzm-info-card"],
  },
  {
    file: "src/static-pages/MaterialsPage.tsx",
    mustContain: ["<SiteHeader activePage=\"materials\" />", "<MaterialsHero />", "<InfoFooter />"],
    mustNotContain: ["rzm-header-shell", "rzm-info-card"],
  },
  {
    file: "src/static-pages/AssemblyPage.tsx",
    mustContain: ["<SiteHeader activePage=\"assembly\" />", "<AssemblyHero />", "<InfoFooter />"],
    mustNotContain: ["rzm-header-shell", "rzm-info-card"],
  },
];

const expectedSectionCounts = [
  ["src/static-pages/home", 9],
  ["src/static-pages/measurements", 7],
  ["src/static-pages/materials", 5],
  ["src/static-pages/assembly", 6],
];

const errors = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`Missing required file: ${file}`);
  }
}

for (const [dir, expected] of expectedSectionCounts) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) {
    errors.push(`Missing section dir: ${dir}`);
    continue;
  }

  const count = fs.readdirSync(fullDir).filter((name) => name.endsWith(".tsx")).length;
  if (count !== expected) {
    errors.push(`${dir}: expected ${expected} section components, got ${count}`);
  }
}

for (const page of pageComposition) {
  if (!fs.existsSync(path.join(root, page.file))) continue;

  const text = read(page.file);

  for (const snippet of page.mustContain) {
    if (!text.includes(snippet)) {
      errors.push(`${page.file}: missing snippet ${snippet}`);
    }
  }

  for (const snippet of page.mustNotContain) {
    if (text.includes(snippet)) {
      errors.push(`${page.file}: page composition layer still contains ${snippet}`);
    }
  }
}

const sharedText = requiredFiles
  .filter((file) => file.includes("/shared/") && fs.existsSync(path.join(root, file)))
  .map(read)
  .join("\n");

for (const className of ["rzm-how-chip-title", "rzm-info-card", "rzm-info-final", "rzm-header-shell"]) {
  if (!sharedText.includes(className)) {
    errors.push(`Shared components should own ${className}`);
  }
}

if (errors.length) {
  console.error("Static pages architecture check failed:");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log("✓ static pages architecture is decomposed and guarded");
