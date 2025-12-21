# Primary Address After Login Fix

## Problem

When a user is not logged in, chooses a location, adds items, clicks "My Meal", then logs in - if they already have a saved primary address, the app was showing the location they chose before logging in instead of their primary address. A page refresh was required to show the primary address.

## Root Cause

After successful login, the app was checking for both `primaryAddress` and `currentLocation` in localStorage, but it wasn't prioritizing the primary address over the pre-login location selection. The pre-login location remained active even though the user had a saved primary address.

## Solution

Modified the login success logic in both SignInModal and ValidateModal to:

1. Check if user has a primary address after login
2. If primary address exists, convert it to currentLocation format and save it
3. Set the `locationManuallySelected` flag to prevent auto-detection
4. Dispatch `locationUpdated` event to notify other components
5. Added a useEffect in Home component to refresh address when user state changes

## Changes Made

### 1. SignInModal.jsx

- **Location**: After successful login, in the address handling logic
- **Change**: Added logic to prioritize primary address over pre-login location
- **What it does**:
  - Checks if user has primary address
  - Converts primary address to currentLocation format
  - Updates localStorage with primary address as current location
  - Dispatches locationUpdated event

### 2. ValidateModal.jsx

- **Location**: After successful OTP validation, in the address handling logic
- **Change**: Same as SignInModal - prioritize primary address over pre-login location
- **What it does**: Same as SignInModal

### 3. Home.jsx

- **Location**: Added new useEffect hook
- **Change**: Added useEffect that listens for user state changes
- **What it does**: Refreshes address from localStorage when user logs in/out

## How It Works Now

### Before Login

1. User not logged in → chooses location → location saved to `currentLocation`
2. User adds items → clicks "My Meal" → redirected to login

### After Login

1. Login successful → check if user has `primaryAddress`
2. If `primaryAddress` exists:
   - Convert it to `currentLocation` format
   - Save to localStorage (overwriting pre-login location)
   - Set `locationManuallySelected` flag
   - Dispatch `locationUpdated` event
3. Home component receives event → refreshes address
4. User sees their primary address immediately (no refresh needed)

## Flow Comparison

### Before (Incorrect)

```
Not logged in → choose location A → add items → login
→ Still shows location A (need refresh to see primary address) ❌
```

### After (Correct)

```
Not logged in → choose location A → add items → login
→ Immediately shows primary address B ✅
```

## Testing

1. **Test Case 1**: Not logged in → choose location → add items → click "My Meal" → login with account that has primary address → should immediately show primary address
2. **Test Case 2**: Not logged in → choose location → add items → click "My Meal" → login with account that has NO addresses → should redirect to location page
3. **Test Case 3**: Logged in user → should always see their primary address
