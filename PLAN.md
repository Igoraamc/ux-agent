# UX Agent - Issues & Improvements Plan

## Active Issues

### 1. ~~Frontend vs Script Behavior Discrepancy~~ (RESOLVED)
**Status:** Resolved
**Priority:** N/A

**Finding:** No discrepancy exists. Both script and API use identical code paths.

Testing showed inconsistent results regardless of call method:
- Run 1: Success
- Run 2: Failed ("Element with index 6 not found")
- Run 3: Failed ("Element with index 1 not found")

**Root cause:** GitHub's inconsistent responses due to:
- Anti-bot detection showing different page states
- Race conditions with page loading
- Rate limiting on repeated requests

### 2. Page Recognition Issue (IANA Test)
**Status:** Needs Investigation
**Priority:** Medium

Agent navigated to IANA website but couldn't recognize it properly.

Possible causes:
- [ ] Page not fully loaded before screenshot
- [ ] Element detection failing on certain page structures
- [ ] Claude not recognizing the expected state

### 3. GitHub Bot Detection
**Status:** Known Limitation
**Priority:** Low

GitHub detects automated browsers. Not a bug - expected behavior for sites with bot protection.

Workarounds to consider:
- [ ] Add stealth mode plugins to Playwright
- [ ] Use non-headless mode for debugging
- [ ] Document which sites work well for testing

---

## Future Improvements

### Frontend
- [ ] Add screenshot viewer to see what agent sees at each step
- [ ] Show element annotations on screenshots
- [ ] Add ability to cancel a running test
- [ ] Improve error messages for common failures

### Backend
- [ ] Add retry logic for transient failures
- [ ] Improve element selector generation
- [ ] Add page load waiting strategies
- [ ] Consider adding stealth mode for bot detection avoidance

### Testing
- [ ] Create test suite with known-good URLs
- [ ] Add integration tests for the full flow
