# Design Document

## Overview

The My Meal Authentication Flow feature provides a seamless user experience for accessing meal planning functionality. When users click "My Meal", the system orchestrates a multi-step authentication and location validation process that ensures users are properly authenticated and have a valid delivery address before accessing their meal plans.

The system integrates three existing components (SignInModal, ValidateModal, and UpdateLocation) with enhanced navigation logic to create a cohesive user journey that handles various user states and edge cases gracefully.

## Architecture

The feature follows a state-driven architecture where user authentication status and address availability determine the navigation flow:

```
User clicks "My Meal" → Authentication Check → Location Check → Navigation Decision
```

### Component Interaction Flow

1. **MultiCartDrawer**: Entry point that handles the "My Meal" click event
2. **SignInModal**: Handles user authentication (name, phone, OTP request)
3. **ValidateModal**: Manages OTP verification and user session creation
4. **UpdateLocation**: Collects and validates delivery address information
5. **MyPlan**: Final destination for authenticated users with valid addresses

## Components and Interfaces

### Enhanced SignInModal Component

**Purpose**: Authenticate users through phone number and name collection
**Key Enhancements**:

- Added `proceedToPlan` prop for post-authentication navigation
- Enhanced success callback to handle address validation flow
- Improved error handling and user feedback

**Interface**:

```javascript
interface SignInModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (userData: UserData) => void;
  proceedToPlan?: () => void;
}
```

### Enhanced ValidateModal Component

**Purpose**: Verify user identity through OTP and manage session creation
**Key Enhancements**:

- Enhanced `onVerificationSuccess` callback with address state information
- Improved navigation logic based on user address availability
- Better error handling for authentication failures

**Interface**:

```javascript
interface ValidateModalProps {
  show: boolean;
  onHide: () => void;
  phone: string;
  Fname: string;
  onVerificationSuccess: (result: VerificationResult) => void;
}

interface VerificationResult {
  userData: UserData;
  hasAddresses: boolean;
}
```

### Enhanced UpdateLocation Component

**Purpose**: Collect and validate delivery address information
**Key Enhancements**:

- Modified navigation logic to redirect to MyPlan after successful address addition
- Enhanced address validation and serviceability checking
- Improved user feedback for address-related operations

### Navigation Controller

**Purpose**: Orchestrate the flow between authentication, location, and meal planning
**Key Functions**:

- `handleMyMealClick()`: Entry point for the entire flow
- `proceedToPlan()`: Navigate to meal planning after validation
- `handleAddressValidation()`: Validate and process address information

## Data Models

### User Authentication State

```javascript
interface UserAuthState {
  isAuthenticated: boolean;
  userData: {
    _id: string,
    Fname: string,
    Mobile: string,
    token: string,
    addresses: Address[],
    primaryAddress?: string,
  } | null;
}
```

### Address Information

```javascript
interface Address {
  _id: string;
  addressType: "Home" | "PG" | "School" | "Work";
  fullAddress: string;
  houseName?: string;
  homeName?: string;
  apartmentName?: string;
  schoolName?: string;
  companyName?: string;
  location: {
    coordinates: [number, number], // [lng, lat]
    lat: number,
    lng: number,
  };
  hubId: string;
  hubName: string;
  isServiceable: boolean;
}
```

### Navigation State

```javascript
interface NavigationState {
  currentStep:
    | "authentication"
    | "otp_verification"
    | "location_setup"
    | "meal_planning";
  previousStep?: string;
  targetDestination: "/my-plan";
  userContext: {
    hasValidSession: boolean,
    hasValidAddress: boolean,
    addressCount: number,
  };
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Authentication Gate

_For any_ user interaction with "My Meal", if the user is not authenticated, then the system should display the SignIn_Modal before proceeding to any other step
**Validates: Requirements 1.1**

### Property 2: OTP Verification Flow

_For any_ successful credential submission in SignIn_Modal, the system should display the Validate_Modal for OTP verification and proceed to location validation only after successful OTP verification
**Validates: Requirements 2.1, 2.3**

### Property 3: Location Validation Gate

_For any_ authenticated user without a saved address, the system should display the Update_Location component before allowing access to My_Plan_Page
**Validates: Requirements 3.1**

### Property 4: Direct Navigation for Complete Users

_For any_ authenticated user with a valid saved address, the system should navigate directly to My_Plan_Page without additional validation steps
**Validates: Requirements 3.2**

### Property 5: Post-Location Navigation

_For any_ successful address addition in Update_Location, the system should navigate to My_Plan_Page instead of the default home page
**Validates: Requirements 3.3, 4.1**

### Property 6: Error Recovery

_For any_ step in the authentication flow that fails, the system should maintain user progress and allow continuation from the failed step without losing previous inputs
**Validates: Requirements 5.4**

### Property 7: Session Persistence

_For any_ successful authentication, the system should persist user session data to localStorage and maintain authentication state across page refreshes
**Validates: Requirements 4.2**

## Error Handling

### Authentication Errors

- **Invalid Phone Number**: Display validation message and allow correction
- **OTP Send Failure**: Show error message with retry option
- **OTP Verification Failure**: Allow retry with clear error messaging
- **Network Errors**: Provide fallback options and retry mechanisms

### Location Errors

- **Location Permission Denied**: Offer manual address entry alternative
- **Address Validation Failure**: Show specific error messages and correction options
- **Serviceability Issues**: Display clear messaging about service availability
- **GPS/Geocoding Failures**: Provide manual address input fallback

### Navigation Errors

- **Component Load Failures**: Show error boundaries with recovery options
- **State Corruption**: Reset to known good state with user notification
- **Route Navigation Failures**: Provide fallback navigation paths

## Testing Strategy

### Unit Testing Approach

- Test individual component state management and prop handling
- Verify authentication flow state transitions
- Test address validation logic and error scenarios
- Validate localStorage operations and data persistence

### Property-Based Testing Approach

Using **fast-check** library for JavaScript property-based testing:

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage of the random input space.

**Test Tagging**: Each property-based test will include a comment with the format:
`// **Feature: my-meal-auth-flow, Property {number}: {property_text}**`

**Property Test Implementation**:

1. **Authentication Gate Property**: Generate random user states and verify SignIn_Modal display logic
2. **OTP Flow Property**: Test OTP verification with various input combinations
3. **Location Validation Property**: Verify address validation logic with random address data
4. **Navigation Property**: Test navigation decisions with various user/address state combinations
5. **Error Recovery Property**: Test error handling with simulated failure scenarios
6. **Session Persistence Property**: Verify localStorage operations with random user data

### Integration Testing

- Test complete user journeys from "My Meal" click to MyPlan page
- Verify component communication and data flow
- Test error scenarios and recovery paths
- Validate cross-component state management

### End-to-End Testing

- Simulate complete user workflows in browser environment
- Test responsive behavior across different screen sizes
- Verify accessibility compliance for authentication flows
- Test performance under various network conditions
