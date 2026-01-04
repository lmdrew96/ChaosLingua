# Forge Grading System - Implementation Checklist

## Phase 1: Setup (Do First)

- [ ] **Environment Setup**
  - [ ] Add `ANTHROPIC_API_KEY` to `.env.local`
  - [ ] Add `ASSEMBLYAI_API_KEY` to `.env.local`
  - [ ] Verify both keys are valid and have credits/quota

- [ ] **Database Migration**
  - [ ] Run: `psql $DATABASE_URL -f scripts/011-add-grading-system.sql`
  - [ ] Verify tables created: `grammar_rules`, `forge_submissions`, `grading_results`, `proficiency_patterns`, `pronunciation_phonemes`
  - [ ] Verify 11 grammar rules seeded
  - [ ] Verify 6 phonemes seeded

- [ ] **Install Dependencies** (if needed)
  - [ ] `pnpm install` (all deps should already be in place)
  - [ ] Verify Next.js Auth.js is configured
  - [ ] Verify PostgreSQL connection works

- [ ] **API Endpoint Verification**
  - [ ] Navigate to `http://localhost:3000/api/grading` (GET should return status ok)
  - [ ] Test POST with sample request (see QUICK_START_GRADING.md)

## Phase 2: Component Integration

- [ ] **Quick Fire Mode**
  - [ ] Update route to use `QuickFireWithGrading`
  - [ ] Test: Submit response → See grading results
  - [ ] Verify: Scores display correctly
  - [ ] Verify: Navigation through responses works

- [ ] **Shadow Speak Mode**
  - [ ] Update route to use `ShadowSpeakWithGrading`
  - [ ] Test: Record audio → See transcription and pronunciation score
  - [ ] Verify: Audio quality displayed
  - [ ] Verify: Transcript matches speech

- [ ] **Writing Sprint Mode**
  - [ ] Update route to use `WritingSprintWithGrading`
  - [ ] Test: Write text → See detailed feedback
  - [ ] Verify: Grammar corrections shown
  - [ ] Verify: Vocabulary analysis displays

- [ ] **Translation Mode**
  - [ ] Update route to use `TranslationWithGrading`
  - [ ] Test: Submit translation → See comparison to expected
  - [ ] Verify: Translation accuracy scored
  - [ ] Verify: Corrections based on grammar + vocabulary

- [ ] **Conversation Mode**
  - [ ] Update route to use `ConversationWithGrading`
  - [ ] Test: Reply to NPC → See contextual feedback
  - [ ] Verify: Dialogue responses graded
  - [ ] Verify: Suggestions are relevant to conversation

## Phase 3: Functionality Verification

- [ ] **Text Grading**
  - [ ] Submit simple text → Verify scores generated
  - [ ] Submit complex text → Verify detailed corrections
  - [ ] Submit with errors → Verify corrections identified
  - [ ] Performance < 2 seconds

- [ ] **Audio Grading**
  - [ ] Record clear audio → Verify transcription accurate
  - [ ] Record with background noise → Verify audio quality marked as "fair" or "poor"
  - [ ] Record mispronunciation → Verify pronunciation score lower
  - [ ] Performance < 5 seconds

- [ ] **Feedback Adaptation**
  - [ ] Test with beginner user (level 1) → Verify detailed explanations
  - [ ] Test with advanced user (level 8+) → Verify minimal explanations
  - [ ] Test quick_fire mode → Verify minimal feedback
  - [ ] Test writing_sprint mode → Verify detailed feedback

- [ ] **Proficiency Tracking**
  - [ ] Submit with grammar error → Verify pattern recorded
  - [ ] Submit with same error again → Verify isRecurring = true
  - [ ] Check vocabulary_tracking updated
  - [ ] Check error_items table has new entries

- [ ] **Error Handling**
  - [ ] Test with no text/audio → Verify error message
  - [ ] Test without auth → Verify authentication required
  - [ ] Test with invalid language → Verify error handling
  - [ ] Test with API unavailable → Verify graceful fallback

## Phase 4: Data Validation

- [ ] **Grammar Rules**
  - [ ] Verify 7 Romanian rules exist in DB
  - [ ] Verify 4 Korean rules exist in DB
  - [ ] Verify rules have examples with correct/incorrect pairs
  - [ ] Verify difficulty levels assigned (1-10)

- [ ] **Scoring**
  - [ ] Verify scores are 0-100
  - [ ] Verify overall score weighted correctly
  - [ ] Verify scores reasonable for text quality
  - [ ] Verify pronunciation score only set for audio

- [ ] **Proficiency Patterns**
  - [ ] Verify mastery_level between 0-1
  - [ ] Verify correct_uses and incorrect_uses increment
  - [ ] Verify last_practiced timestamp updates
  - [ ] Verify patterns created for new categories

- [ ] **Submissions**
  - [ ] Verify all submissions logged in DB
  - [ ] Verify submission linked to user
  - [ ] Verify audio/text captured correctly
  - [ ] Verify transcript stored for audio

## Phase 5: User Experience

- [ ] **UI/UX**
  - [ ] Verify scores display clearly
  - [ ] Verify corrections easy to understand
  - [ ] Verify feedback encouraging
  - [ ] Verify suggestions actionable

- [ ] **Navigation**
  - [ ] Test "Exit" button during session
  - [ ] Test "Next Response" navigation
  - [ ] Test "Complete" finishing session
  - [ ] Test resuming after interruption (sessionId)

- [ ] **Performance**
  - [ ] Text grading < 2 seconds (measure actual time)
  - [ ] Audio grading < 5 seconds (including STT)
  - [ ] UI responsive during loading
  - [ ] Loading indicators shown

- [ ] **Accessibility**
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible
  - [ ] Color contrast sufficient
  - [ ] Error messages clear

## Phase 6: Testing Different Scenarios

### High-Quality Input
- [ ] Clear, grammatically correct text
- [ ] Clear audio pronunciation
- [ ] Proper sentence structure
- [ ] Verify high scores (85+)

### Moderate-Quality Input
- [ ] Some grammar errors
- [ ] Some vocabulary misuse
- [ ] Slight pronunciation issues
- [ ] Verify mid-range scores (60-80)

### Low-Quality Input
- [ ] Multiple grammar errors
- [ ] Unfamiliar vocabulary
- [ ] Poor pronunciation
- [ ] Verify lower scores (< 60)

### Edge Cases
- [ ] Very short responses (< 5 words)
- [ ] Very long responses (> 1000 words)
- [ ] Mixed language input
- [ ] Special characters
- [ ] Emojis in text
- [ ] Numbers and symbols

## Phase 7: Production Readiness

- [ ] **Code Quality**
  - [ ] No console errors
  - [ ] No TypeScript errors
  - [ ] No linting issues
  - [ ] Code review approved

- [ ] **Database**
  - [ ] Backups configured
  - [ ] Connection pooling set up
  - [ ] Query performance acceptable
  - [ ] Indexes properly created

- [ ] **API Security**
  - [ ] Authentication required
  - [ ] Rate limiting configured
  - [ ] API keys never logged
  - [ ] CORS properly configured

- [ ] **Monitoring**
  - [ ] Error logging enabled
  - [ ] Performance metrics tracked
  - [ ] API latency monitored
  - [ ] Database connection health checked

- [ ] **Documentation**
  - [ ] README updated
  - [ ] API docs accurate
  - [ ] Deployment instructions clear
  - [ ] Troubleshooting guide complete

## Phase 8: Deployment

- [ ] **Staging**
  - [ ] Deploy to staging environment
  - [ ] Run full test suite
  - [ ] Load test (multiple concurrent users)
  - [ ] Test database failover

- [ ] **Production**
  - [ ] Database migration run
  - [ ] Environment variables set
  - [ ] API keys validated
  - [ ] CDN cache cleared
  - [ ] SSL certificates valid
  - [ ] Health checks passing

- [ ] **Post-Deployment**
  - [ ] Monitor error logs
  - [ ] Check API latency
  - [ ] Verify users can access
  - [ ] Test with real submissions
  - [ ] Gather user feedback

## Phase 9: Optimization (Optional)

- [ ] **Performance**
  - [ ] Cache grammar rules (Redis)
  - [ ] Cache user context (short TTL)
  - [ ] Parallelize agent calls where possible
  - [ ] Reduce context data for faster grading

- [ ] **Features**
  - [ ] Add custom grammar rules UI
  - [ ] Add proficiency export
  - [ ] Add SRS integration
  - [ ] Add analytics dashboard

- [ ] **Grammar Expansion**
  - [ ] Implement extraction scripts (Multext-East, Korpora, GF-RGL)
  - [ ] Add more grammar rules from linguistic resources
  - [ ] Expand pronunciation phonemes database
  - [ ] Add more Forge modes

## Success Criteria

### Minimum
- ✅ All 5 Forge modes work with grading
- ✅ Text grading < 2 seconds
- ✅ Audio grading < 5 seconds
- ✅ Scores reasonable
- ✅ Feedback helpful
- ✅ Database updated correctly

### Recommended
- ✅ All success criteria above
- ✅ Error handling robust
- ✅ User experience smooth
- ✅ Performance monitored
- ✅ Documentation complete
- ✅ Tested with 100+ submissions

### Excellent
- ✅ All recommended criteria
- ✅ Load tested (1000+ concurrent)
- ✅ A/B tested feedback styles
- ✅ Custom grammar rules working
- ✅ SRS integration complete
- ✅ Production monitored 24/7

## Quick Command Reference

```bash
# Setup
export ANTHROPIC_API_KEY=sk-...
export ASSEMBLYAI_API_KEY=...
psql $DATABASE_URL -f scripts/011-add-grading-system.sql

# Development
pnpm dev

# Test API
curl -X POST http://localhost:3000/api/grading \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","sessionId":"s1","language":"romanian","forgeType":"writing_sprint","text":"Test text"}'

# Database checks
psql $DATABASE_URL -c "SELECT COUNT(*) FROM grammar_rules;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM forge_submissions;"

# Deploy
git push origin main
# (GitHub Actions will handle deployment)
```

## Notes

- Remember to test with both Romanian (ro) and Korean (ko) languages
- Audio grading requires AssemblyAI credits - check quota before deployment
- Grammar rules can be expanded later - seed data provides baseline
- Proficiency tracking data becomes more valuable over time
- Consider implementing caching for high-traffic scenarios

## Final Sign-Off

- [ ] All phases completed
- [ ] All tests passing
- [ ] No outstanding issues
- [ ] Ready for production
- [ ] Users can start grading sessions

---

**Date Completed**: ________________
**Deployed By**: ________________
**Environment**: [ ] Staging [ ] Production
**Sign-Off**: ________________
