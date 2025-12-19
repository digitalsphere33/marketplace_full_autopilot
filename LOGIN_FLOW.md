# User Authentication & Navigation Flow

## Problem Solved

Previously, clicking "Login" or "Sell" would immediately take you to the seller onboarding form. Now there's a proper separation:
- **Login** → Dedicated login/registration page
- **Sell** → Seller onboarding only after you're authenticated

## Login Flow

### For New Users (Sign Up)
1. Click **"Login / Sign Up"** button in header or tab
2. Land on Login page
3. Click **"Sign up here"** to switch to registration mode
4. Enter email and password
5. Click **"Create Account"**
6. Auto-redirected to listings page
7. JWT token saved in localStorage
8. Can now see "Account" and "Orders" tabs

### For Existing Users (Log In)
1. Click **"Login / Sign Up"** button in header or tab
2. Land on Login page (default login mode)
3. Enter email and password
4. Click **"Log In"**
5. Auto-redirected to listings page
6. JWT token saved in localStorage
7. Can now see "Account" and "Orders" tabs

## Seller Onboarding Flow

### To Become a Seller
1. **Option 1**: Click **"Become a Seller"** quick link in header
2. **Option 2**: Click **"Become a Seller"** button in hero section
3. **Option 3**: Click **"Become a Seller"** in footer
4. Land on Onboarding page
5. Complete seller registration form
6. API creates seller profile
7. Seller account fully registered

## Navigation Changes

### Unauthenticated (Not logged in)
**Top tabs visible:**
- Listings
- Checkout
- **Login / Sign Up** ← NEW dedicated tab
- Cart

**Header buttons:**
- "Login / Sign Up" button (navigates to login page)
- Cart icon

### Authenticated as Buyer
**Top tabs visible:**
- Listings
- Checkout
- Profile
- Orders
- Cart

**Header buttons:**
- "Account" button (navigates to profile)
- "Logout" button
- Cart icon

### Authenticated as Admin
**All buyer tabs PLUS:**
- Admin

**Admin can:**
- View platform statistics
- Manage products (add, view, delete)
- Monitor orders
- Review flagged content

## Login Component Features

### UI Elements
- **Mode Toggle**: Switch between Login and Sign Up
- **Email Input**: User email
- **Password Input**: User password
- **Submit Button**: Processes login/registration
- **Demo Credentials**: Shows in development mode only

### Security
- Passwords sent to API (hashed with bcryptjs)
- JWT token stored in localStorage
- Token decoded to extract user role
- Role stored in localStorage for navigation

### User Experience
- Smooth transitions between login/signup modes
- Clear error messages
- Success feedback with redirect
- Help text for password requirements

## API Integration

### Authentication Endpoints
- `POST /auth/login` - Existing user login
- `POST /auth/register` - New user registration
- Both return: `{ token: "jwt_token" }`

### JWT Payload Structure
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "buyer|seller|admin",
  "iat": 1234567890
}
```

## Component Structure

```
App.jsx (main)
├── Login.jsx (NEW - Dedicated login/register page)
├── Onboarding.jsx (Seller registration - now separate)
├── Profile.jsx (User account & data viewing)
├── Checkout.jsx (Shopping cart)
├── Orders.jsx (View past orders)
└── Admin.jsx (Admin dashboard)
```

## Key Improvements

✅ **Separated Concerns**: Login and seller onboarding are now separate flows
✅ **Better UX**: Users aren't confused by seller form when trying to log in
✅ **Flexible**: Existing users can log in, new users can register easily
✅ **Role-based**: Navigation updates based on user role after login
✅ **Persistent**: JWT and role stored in localStorage across sessions
✅ **Developer-friendly**: Demo credentials shown in development mode

## Testing the Flow

### Test Case 1: New User Signup
1. Click "Login / Sign Up"
2. Click "Sign up here"
3. Enter: email@test.com / Password123
4. Click "Create Account"
5. ✅ Should redirect to listings, show "Account" tab

### Test Case 2: Existing User Login
1. Use admin credentials: admin@mzansimart.co.za / Admin@123
2. Click "Login / Sign Up"
3. Enter credentials
4. Click "Log In"
5. ✅ Should redirect to listings, show "Admin" tab

### Test Case 3: Seller Onboarding
1. Click "Become a Seller"
2. ✅ Should see seller registration form (not login form)
3. Complete registration
4. ✅ Should see success message

### Test Case 4: Logout
1. Log in as a user
2. Click "Account" → Profile tab
3. Look for logout option
4. OR Click "Logout" button in header
5. ✅ JWT cleared, navigation reverts to unauthenticated state

## localStorage Keys

```javascript
// JWT token (expires/handled by API)
localStorage.getItem('jwt')

// User role (for fast navigation decisions)
localStorage.getItem('userRole')

// Both cleared on logout
localStorage.removeItem('jwt')
localStorage.removeItem('userRole')
```

## Future Enhancements

- [ ] Password reset / forgot password flow
- [ ] Email verification for new accounts
- [ ] Two-factor authentication for admin
- [ ] Social login (Google, Facebook)
- [ ] Remember me / persistent sessions
- [ ] Session timeout warnings
- [ ] Account deactivation option
- [ ] Profile editing after login
