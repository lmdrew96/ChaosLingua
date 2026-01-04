/**
 * Extract Korean Grammar Rules from Korpora
 * 
 * This script processes Korean NLP corpora to extract grammar patterns
 * optimized for grading learner submissions.
 * 
 * Data source: https://github.com/ko-nlp/Korpora
 * 
 * Focus areas:
 * - Particle usage (subject, object, topic markers)
 * - Verb conjugation patterns (polite, casual, honorific)
 * - Honorific system (-시-, special verbs)
 * - Common word order mistakes
 * - Number classifiers
 * 
 * Usage:
 *   1. Install Korpora: pip install Korpora
 *   2. Run: tsx scripts/extractors/extract-korean-grammar.ts
 */

import { createGrammarRule } from '@/lib/db/grading'
import type { GrammarExample } from '@/lib/types'

// TODO: Implement Korpora parser
// - Use Korpora Python library via child_process
// - Extract patterns from KorNLI, NaverChangwonNER datasets
// - Identify common particle mistakes
// - Extract honorific usage patterns
// - Generate learner-focused examples

async function extractKoreanGrammar() {
  console.log('🇰🇷 Extracting Korean grammar from Korpora...')
  
  // Placeholder for future implementation
  console.log('⚠️  This script is not yet implemented')
  console.log('📝 Manual seed data is available in scripts/011-add-grading-system.sql')
  console.log('')
  console.log('To implement:')
  console.log('1. Install Korpora: pip install Korpora')
  console.log('2. Use child_process to call Python scripts')
  console.log('3. Parse Korean NLP datasets for patterns')
  console.log('4. Extract particle usage and conjugation rules')
  console.log('5. Identify common learner errors from annotated data')
  
  // Example of what extracted rules would look like:
  const exampleRule = {
    language: 'ko' as const,
    category: 'particles',
    ruleName: 'topic_marker',
    description: 'Topic particles 은/는 selection based on final consonant',
    difficultyLevel: 2,
    source: 'korpora',
    examples: [
      {
        correct: '책은 재미있어요',
        incorrect: '책는 재미있어요',
        explanation: 'Use 은 after consonant (책 ends in ㄱ), not 는'
      },
      {
        correct: '나는 학생이에요',
        incorrect: '나은 학생이에요',
        explanation: 'Use 는 after vowel (나 ends in vowel), not 은'
      }
    ] as GrammarExample[]
  }
  
  console.log('\nExample rule structure:', JSON.stringify(exampleRule, null, 2))
  
  // Could also call Python script:
  // import { exec } from 'child_process'
  // exec('python extract_korean_patterns.py', (error, stdout) => {
  //   const patterns = JSON.parse(stdout)
  //   // Process and insert patterns
  // })
}

if (require.main === module) {
  extractKoreanGrammar().catch(console.error)
}

export { extractKoreanGrammar }
