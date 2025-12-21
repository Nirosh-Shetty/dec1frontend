# MyPlan Auto-Navigation Fix

## Problem

After login, when user adds items to cart and then adds a location, the app was automatically navigating to MyPlan. This should only happen when the user explicitly clicks "My Plan" button while not logged in.

## Root Cause

The Home component had a "fallback" logic that automatically proceeded to MyPlan whenever:

1. User had cart items
2. User just came from a location page (detected by referrer or `justAddedAddress` flag)

This was too broad and caused unwanted navigation to MyPlan.

## Correct Behavior

- **Should auto-navigate to MyPlan**: User is not logged in → adds items → clicks "My Plan" → logs in → adds address → auto-navigate to MyPlan
- **Should NOT auto-navigate to MyPlan**: User is logged in → adds items → adds location → should stay on home page

## Solution

### 1. Removed Fallback Logic in Home.jsx

- **Location**: Lines ~1501-1540 in Home component
- **Change**: Removed the fallback logic that was auto-proceeding to MyPlan based on referrer/justAddedAddress
- **Replacement**: Simple cleanup of the justAddedAddress flag

### 2. Removed Unnecessary Flag in UpdateLocation.jsx

- **Location**: Line ~1418 in UpdateLocation component
- **Change**: Removed setting of `justAddedAddress` flag since it's no longer used
- **Reason**: The fallback logic that used this flag was removed

## How It Works Now

1. **Legitimate MyPlan navigation**: Only happens when `triggerProceedToPlan` flag is set
2. **triggerProceedToPlan flag**: Only set when `postLoginDestination === "my-plan"`
3. **postLoginDestination**: Only set when user clicks "My Plan" button in MultiCartDrawer while not logged in

## Flow Comparison

### Before (Incorrect)

```
Logged in user → adds items → adds location → AUTO-NAVIGATE to MyPlan ❌
```

### After (Correct)

```
Logged in user → adds items → adds location → stays on home page ✅
Logged in user → adds items → clicks "My Plan" → navigate to MyPlan ✅

Not logged in user → adds items → clicks "My Plan" → login → add address → AUTO-NAVIGATE to MyPlan ✅
```

## Testing

1. **Test Case 1**: Login → add items → add location → should stay on home page
2. **Test Case 2**: Login → add items → click "My Plan" → should navigate to MyPlan
3. **Test Case 3**: Not logged in → add items → click "My Plan" → login → add address → should auto-navigate to MyPlan
