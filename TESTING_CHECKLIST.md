# ✅ Shared Browsing Test Checklist

## Pre-Test Setup
- [ ] Server running on port 5000
- [ ] Client running on port 3000
- [ ] No console errors in browser dev tools
- [ ] WebSocket connection established

## Basic Functionality Tests

### 1. Room Creation & Joining
- [ ] Create a new room
- [ ] Copy room link
- [ ] Open room link in 2+ browser tabs/windows
- [ ] Verify all users appear in "Users" panel

### 2. Shared Browsing Toggle
- [ ] Click "Shared Browser" panel tab
- [ ] Verify shared browsing is enabled by default
- [ ] Click eye icon to disable shared browsing
- [ ] Verify "Shared Browsing Disabled" message appears
- [ ] Re-enable shared browsing
- [ ] Verify interface returns to "No Page Selected" state

### 3. Search & Navigate
- [ ] Perform a search (e.g., "wikipedia")
- [ ] Click on any search result
- [ ] Verify all tabs switch to "Shared Browser" panel automatically
- [ ] Verify the same page loads in all browser tabs
- [ ] Verify "Opened by [username]" appears below URL

### 4. Manual Navigation
- [ ] Click home icon in shared browser header
- [ ] Enter a URL (e.g., "example.com")
- [ ] Click "Go" button
- [ ] Verify all tabs navigate to the new URL
- [ ] Verify activity notification appears

### 5. External Link Opening
- [ ] Click external link icon in shared browser
- [ ] Verify page opens in new browser tab (not shared)
- [ ] Verify shared browser content remains unchanged

### 6. Cross-Browser Testing
- [ ] Open room in Chrome
- [ ] Open same room in Firefox/Edge
- [ ] Perform navigation in one browser
- [ ] Verify other browser updates in real-time

## Advanced Features Tests

### 7. Error Handling
- [ ] Navigate to a site that blocks iframes (e.g., google.com)
- [ ] Verify error message appears
- [ ] Verify external link button still works

### 8. Activity Notifications
- [ ] Navigate to a page in one tab
- [ ] Verify notification appears in other tabs
- [ ] Check notification content shows correct user and domain

### 9. Panel State Management
- [ ] Start in "Searches" panel
- [ ] Click a search result
- [ ] Verify auto-switch to "Shared Browser" panel
- [ ] Switch to "Chat" panel
- [ ] Navigate to new page
- [ ] Verify panel switches back to "Shared Browser"

### 10. Individual vs Shared Browsing
- [ ] Disable shared browsing in one tab
- [ ] Click search result in that tab
- [ ] Verify page opens in new browser tab only
- [ ] Verify other tabs don't show shared navigation
- [ ] Re-enable shared browsing
- [ ] Verify shared navigation resumes

## Performance Tests

### 11. Multiple Users
- [ ] Open room with 3+ users
- [ ] Perform rapid navigation changes
- [ ] Verify all users stay synchronized
- [ ] Check for memory leaks in dev tools

### 12. Page Loading
- [ ] Navigate to large/slow-loading page
- [ ] Verify loading indicator appears
- [ ] Verify all users see loading state
- [ ] Wait for page to fully load
- [ ] Verify all users see loaded content

## Integration Tests

### 13. Chat During Browsing
- [ ] Navigate to shared page
- [ ] Send chat messages
- [ ] Verify chat works normally during shared browsing
- [ ] Verify chat notifications still appear

### 14. Voting During Browsing
- [ ] Navigate to shared page
- [ ] Go back to "Searches" panel
- [ ] Vote on search results
- [ ] Verify voting works normally
- [ ] Return to "Shared Browser" panel
- [ ] Verify shared page is still active

### 15. Export Functionality
- [ ] Navigate to shared page
- [ ] Go to "Export" panel
- [ ] Export as PDF/Markdown
- [ ] Verify export includes shared browsing data

## Security Tests

### 16. URL Validation
- [ ] Try to navigate to invalid URL
- [ ] Try to navigate to javascript: URL
- [ ] Try to navigate to file:// URL
- [ ] Verify appropriate error handling

### 17. Content Security
- [ ] Navigate to page with embedded JavaScript
- [ ] Verify no script execution warnings
- [ ] Check iframe sandbox attributes are applied

## Mobile Tests (if applicable)

### 18. Mobile Responsiveness
- [ ] Open on mobile device
- [ ] Navigate to shared page
- [ ] Verify touch gestures work
- [ ] Verify responsive layout
- [ ] Test manual URL input on mobile keyboard

## Cleanup Tests

### 19. Connection Handling
- [ ] Close one browser tab
- [ ] Verify other tabs continue working
- [ ] Refresh page
- [ ] Verify shared state persists
- [ ] Disconnect/reconnect internet
- [ ] Verify graceful reconnection

### 20. Memory Management
- [ ] Navigate to 10+ different pages
- [ ] Check browser memory usage
- [ ] Verify no excessive memory growth
- [ ] Close and reopen tabs
- [ ] Verify proper cleanup

---

## ✅ Test Results Summary

**Date**: ___________  
**Tester**: ___________  
**Browser**: ___________  
**OS**: ___________  

**Total Tests**: 20  
**Passed**: ___/20  
**Failed**: ___/20  
**Notes**: 

---

## 🐛 Issues Found

| Test # | Issue Description | Severity | Status |
|--------|------------------|----------|--------|
|        |                  |          |        |
|        |                  |          |        |
|        |                  |          |        |

**Severity Levels**:
- 🔴 Critical: Breaks core functionality
- 🟡 Medium: Affects user experience
- 🟢 Low: Minor cosmetic or edge case issues
