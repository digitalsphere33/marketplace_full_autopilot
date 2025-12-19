# Admin Panel Guide

## Default Admin Credentials

```
Email:    admin@mzansimart.co.za
Password: Admin@123
```

⚠️ **IMPORTANT**: Change this password before deploying to production!

## Accessing the Admin Panel

1. Open the frontend: http://127.0.0.1:5177
2. Click "Account" in the top navigation
3. Log in with the admin credentials above
4. Click the "Admin" tab in the navigation

## Admin Panel Features

### Dashboard Tab
- View platform statistics
  - Total users
  - Active sellers
  - Total products
  - Orders placed
- Refresh data button to update stats

### Products Tab
- View all products in the marketplace
- See product details (title, price, category, status)
- View seller information (email)
- **Delete products** - Click "Delete" button on any product
  - Confirmation dialog prevents accidental deletion

### Add Product Tab
- Add new products to the marketplace
- Fields:
  - **Product Title**: Name of the product
  - **Price (ZAR)**: Product price in South African Rand
  - **Category**: Select from dropdown
    - Electronics
    - Home & Living
    - Fashion
    - Health & Beauty
    - Baby & Kids
    - Sports & Outdoors
    - Office & School
- Products are added with "active" status by default

### Orders Tab
- View all orders placed on the platform
- See order ID, total amount, and status
- Helpful for monitoring platform activity

### Moderation Tab
- View flagged items that need review
- See flagged product titles and reasons
- Take action on inappropriate content

## Product Management Workflow

### Adding a Product
1. Navigate to "Add Product" tab
2. Enter product title (e.g., "Samsung Galaxy S24")
3. Enter price (e.g., 1299.99)
4. Select category from dropdown
5. Click "Add Product"
6. Success message will appear
7. Product will be visible in "Products" tab

### Viewing All Products
1. Navigate to "Products" tab
2. Click "Refresh Data" if needed
3. Scroll through product list
4. Each product shows:
   - Title and price
   - Category and status
   - Seller email
   - Delete button

### Deleting a Product
1. Navigate to "Products" tab
2. Find the product to delete
3. Click the red "Delete" button
4. Confirm deletion in popup dialog
5. Product will be removed from list
6. Success message will appear

## Troubleshooting

### "Unauthorized - Admin access required"
- Make sure you're logged in with the admin account
- JWT token must have role="admin"
- Try logging out and logging back in

### "Failed to load admin data"
- Check that the API server is running (port 3000)
- Verify database connection
- Check browser console for errors

### Products not appearing
- Click "Refresh Data" button
- Check that database has data
- Verify API endpoint is accessible: http://127.0.0.1:3000/admin/listings

## API Endpoints (for reference)

All admin endpoints require JWT with role="admin":

- `GET /admin/stats` - Platform statistics
- `GET /admin/orders` - All orders
- `GET /admin/listings` - All products with seller info
- `POST /admin/listings` - Add new product
- `DELETE /admin/listings/:id` - Delete product
- `GET /admin/flagged` - Flagged items for moderation

## Security Notes

1. **Change default password immediately** after first login
2. Admin role is powerful - protect credentials
3. JWT tokens are stored in localStorage
4. Use HTTPS in production
5. Implement additional authentication layers for production
6. Consider adding audit logging for admin actions
7. Implement rate limiting on admin endpoints

## Development Commands

### Reset Admin Password
If you need to reset the admin password:
```bash
cd api
node src/seed-admin.js
```
This will update the existing admin user or create a new one.

### Check Admin User in Database
```bash
# Using pg-mem (in-memory)
# Admin user is recreated each time server restarts

# Using real PostgreSQL
psql -U postgres -d postgres
SELECT * FROM users WHERE role='admin';
```

## Next Steps

1. **Change the default password**
2. Add more admin users if needed
3. Configure email notifications for flagged items
4. Set up automated moderation rules
5. Implement product analytics dashboard
6. Add bulk product management features

---

For more information, see:
- [PRD.md](PRD.md) - Product requirements
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [README.md](README.md) - General setup guide
