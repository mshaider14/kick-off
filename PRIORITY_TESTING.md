# Bar Priority System - Testing Guide

## Overview
The priority system allows multiple announcement bars to be active simultaneously, with priority levels determining display order.

## Test Scenarios

### 1. Priority Level Selection
**Test:** Create a new bar with custom priority
- [ ] Navigate to "Create Bar" page
- [ ] Verify priority selector shows in Schedule step (Step 4)
- [ ] Default priority is 5 (Normal)
- [ ] Can select priorities 1-10
- [ ] Visual feedback shows when priority is not default (5)

**Expected Results:**
- Priority selector dropdown displays with clear labels
- Info banner appears when priority ≠ 5
- Higher priority (1-4) shows "higher than normal" message
- Lower priority (6-10) shows "lower than normal" message

### 2. Priority Saving
**Test:** Verify priority saves correctly
- [ ] Create bar with priority 1 and publish
- [ ] Navigate to bars list
- [ ] Verify priority displays as "1 (Highest)" with ⭐ icon
- [ ] Edit the bar
- [ ] Verify priority field shows value "1"
- [ ] Change priority to 10 and save
- [ ] Verify list updates to show "10 (Low)"

### 3. Multiple Active Bars - Priority Sorting
**Test:** Create multiple active bars with different priorities
- [ ] Create Bar A with priority 5 (Normal) - Active
- [ ] Create Bar B with priority 1 (Highest) - Active
- [ ] Create Bar C with priority 8 (Low) - Active
- [ ] Navigate to bars list
- [ ] Verify bars are sorted: Active bars first, then by priority (1, 5, 8)

**Expected Results:**
- Bars listing shows: Bar B (priority 1), Bar A (priority 5), Bar C (priority 8)
- Active status badge shown for all three
- Priority column displays correctly

### 4. Frontend Display - Highest Priority First
**Test:** Verify storefront displays highest priority bar
- [ ] Ensure bars from Test #3 are all active
- [ ] Visit storefront
- [ ] Verify Bar B (priority 1) displays
- [ ] Close Bar B
- [ ] Refresh page
- [ ] Verify Bar A (priority 5) now displays
- [ ] Close Bar A
- [ ] Refresh page
- [ ] Verify Bar C (priority 8) now displays

**Expected Results:**
- Only one bar displays at a time
- Highest priority bar (lowest number) shows first
- When closed, next priority bar displays

### 5. Equal Priority - Creation Order
**Test:** Verify equal priority bars display in creation order
- [ ] Create Bar D with priority 5 - Active (created first)
- [ ] Create Bar E with priority 5 - Active (created second)
- [ ] Create Bar F with priority 5 - Active (created third)
- [ ] Visit storefront
- [ ] Verify Bar D displays (oldest with priority 5)

**Expected Results:**
- When multiple bars have same priority, oldest (first created) displays first
- API returns bars sorted by: priority ASC, then createdAt ASC

### 6. Priority Changes Affect Display Order
**Test:** Change priority of existing bar
- [ ] Keep all bars from Test #5 active
- [ ] Edit Bar F (newest), change priority to 1
- [ ] Visit storefront
- [ ] Verify Bar F now displays first (priority 1)
- [ ] Change Bar F priority back to 5
- [ ] Verify Bar D displays again (oldest with priority 5)

**Expected Results:**
- Changing priority immediately affects display order
- No need to recreate bars

### 7. Draft vs Active Bars
**Test:** Verify priority only affects active bars
- [ ] Create Bar G with priority 1 - Draft
- [ ] Create Bar H with priority 10 - Active
- [ ] Visit storefront
- [ ] Verify Bar H displays (not Bar G, despite higher priority)

**Expected Results:**
- Draft bars never display, regardless of priority
- Only active bars participate in priority sorting

### 8. API Response Validation
**Test:** Verify API returns correct priority ordering
- [ ] Ensure multiple active bars exist with different priorities
- [ ] Call API: `/api/bars/active?shop=YOURSHOP&limit=5`
- [ ] Verify response includes priority field
- [ ] Verify bars are ordered by priority ASC

**Expected API Response:**
```json
{
  "success": true,
  "bars": [
    { "id": "...", "priority": 1, ... },
    { "id": "...", "priority": 5, ... },
    { "id": "...", "priority": 10, ... }
  ]
}
```

### 9. Targeting Rules + Priority
**Test:** Verify priority works with targeting rules
- [ ] Create Bar I with priority 1, targeting mobile only - Active
- [ ] Create Bar J with priority 5, targeting all devices - Active
- [ ] Visit storefront on desktop
- [ ] Verify Bar J displays (Bar I fails device targeting)
- [ ] Visit storefront on mobile
- [ ] Verify Bar I displays (passes targeting, higher priority)

**Expected Results:**
- Priority applies only to bars that pass targeting rules
- Invalid targeting bars are skipped regardless of priority

### 10. Migration Validation
**Test:** Verify existing bars get default priority
- [ ] Check existing bars in database (created before migration)
- [ ] All should have priority = 5
- [ ] Edit an old bar
- [ ] Priority field should show 5 (Normal)

## Database Verification

Run these queries to verify priority implementation:

```sql
-- Check priority column exists with default
SELECT id, priority, isActive, createdAt 
FROM Bar 
ORDER BY priority ASC, createdAt ASC;

-- Verify index exists
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'Bar' 
AND indexname LIKE '%priority%';
```

## Browser Console Testing

When viewing storefront:
1. Open browser console
2. Look for log: "BAR DATA RECEIVED:"
3. Verify bars array is sorted by priority
4. Check that first bar meeting targeting rules is displayed

## Success Criteria

- ✅ Priority level 1-10 is selectable
- ✅ Priority saves with bar
- ✅ Multiple active bars sort by priority in admin
- ✅ Highest priority bar displays first on storefront
- ✅ Priority changes affect display order immediately
- ✅ Equal priority bars show in creation order
- ✅ Priority system works on storefront
- ✅ Can change priority after creation
- ✅ No security vulnerabilities introduced
- ✅ Code passes linting
- ✅ Database migration applied successfully

## Performance Considerations

- Index on (shop, isActive, priority) ensures efficient queries
- Frontend still displays only one bar at a time (no performance impact)
- API limit parameter prevents excessive data transfer

## Rollback Plan

If issues arise:
1. Revert migration by running: `ALTER TABLE "Bar" DROP COLUMN priority;`
2. Revert code changes to sorting logic
3. Default sorting will return to `updatedAt DESC`
