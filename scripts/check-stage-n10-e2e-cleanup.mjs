import { readFileSync, existsSync } from "node:fs";

const checks = [
  {
    file: "src/static-pages/Constructor3DPage.tsx",
    must: [
      'data-stage="N10"',
      'rzm-3d-shell--n10',
      'data-testid="constructor-3d-viewport"',
      'aria-label="Применить случайный пресет к выбранной секции"',
      'aria-label={`Увеличить ${label.toLowerCase()}`',
    ],
  },
  {
    file: "tests/browser/configurator3d.spec.ts",
    must: [
      '/configurator-3d',
      'data-stage", "N10"',
      'Применить случайный пресет к выбранной секции',
      '3D configurator scenario',
      '3D checkout controls remain interactive',
    ],
  },
  {
    file: "package.json",
    must: [
      'test:constructor3d-e2e',
      'check:stage-n10-e2e-cleanup',
    ],
  },
];

const errors = [];
for (const check of checks) {
  if (!existsSync(check.file)) {
    errors.push(`Missing file: ${check.file}`);
    continue;
  }
  const text = readFileSync(check.file, "utf8");
  for (const token of check.must) {
    if (!text.includes(token)) {
      errors.push(`${check.file} must include: ${token}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Stage N10 E2E cleanup guard passed.");
