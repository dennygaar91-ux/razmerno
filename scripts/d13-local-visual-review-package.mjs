#!/usr/bin/env node

import {
  buildCanonicalD13LocalVisualIndex,
  writeD13IndexArtifacts,
} from './d13-local-visual-qa-report.mjs'
import {
  buildHumanReviewChecklist,
  renderHumanReviewChecklistMarkdown,
  writeHumanReviewChecklistArtifacts,
} from './d13-human-review-checklist.mjs'
import {
  buildHumanReviewResultsFromMarkdown,
  writeHumanReviewResultsArtifacts,
} from './d13-human-review-results.mjs'

const NON_CLOSURE_WARNING =
  'This package prepares local human review artifacts only. It does not close D-13, does not claim human visual approval, and does not replace remote preview visual QA or main/GitHub QA verification.'

export function generateD13LocalVisualReviewPackage(options = {}) {
  const index = options.index || buildCanonicalD13LocalVisualIndex()
  const indexPaths = writeD13IndexArtifacts(index, { canonical: true })

  const checklist = buildHumanReviewChecklist(index)
  const checklistMarkdown = options.checklistMarkdown || renderHumanReviewChecklistMarkdown(checklist)
  const checklistPath = writeHumanReviewChecklistArtifacts(checklist, { canonical: true })

  const results = buildHumanReviewResultsFromMarkdown(checklistMarkdown, {
    sourceInput: checklistPath,
  })
  const resultPaths = writeHumanReviewResultsArtifacts(results)

  const passOrPartialWithPng = index.entries.filter(
    (item) => (item.status === 'PASS' || item.status === 'PARTIAL') && item.pngExists !== false && item.pngPath,
  )

  return {
    index,
    indexPaths,
    checklistPath,
    resultPaths,
    passOrPartialWithPngCount: passOrPartialWithPng.length,
    nonClosureWarning: NON_CLOSURE_WARNING,
  }
}

function main() {
  const pkg = generateD13LocalVisualReviewPackage()

  console.log(
    JSON.stringify({
      event: 'd13_local_visual_review_package',
      indexJson: pkg.indexPaths.jsonPath,
      indexMd: pkg.indexPaths.mdPath,
      checklistPath: pkg.checklistPath,
      resultsJson: pkg.resultPaths.jsonPath,
      resultsMd: pkg.resultPaths.mdPath,
      shotCount: pkg.index.shotCount,
      passCount: pkg.index.passCount,
      canonical: true,
      closureClaimed: false,
      nonClosureWarning: pkg.nonClosureWarning,
    }),
  )

  console.error(pkg.nonClosureWarning)

  if (pkg.passOrPartialWithPngCount === 0) {
    process.exit(1)
  }
}

if (process.argv[1]?.includes('d13-local-visual-review-package.mjs')) {
  main()
}
