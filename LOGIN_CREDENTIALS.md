# 🔐 Login Credentials - Quick Reference

## ⚠️ AUTHENTICATION REQUIRED
**All pages now require login. You cannot access any page without authenticating first.**

## Access the Login Page
**URL**: http://localhost:3000/login

---

## 👑 MASTER ACCOUNT (PRIMARY)

### Master Administrator
- **Username**: `master`
- **Password**: `admin`
- **Access**: Full System Control
- **Badge Color**: 🟣 Purple
- **Note**: This is the primary login credential

---

## 👨‍💼 Admin Accounts

### System Administrator (Full Access)
- **Email**: `admin@interconnect.com`
- **Password**: `admin123`
- **Access**: Complete platform control
- **Badge Color**: 🔴 Red

### Finance Manager
- **Email**: `finance@interconnect.com`
- **Password**: `finance123`
- **Access**: Invoices, Disputes, Financial Data
- **Badge Color**: 🟢 Green

### Customer Support
- **Email**: `support@interconnect.com`
- **Password**: `support123`
- **Access**: Disputes, Partner Information
- **Badge Color**: 🟣 Purple

---

## 🏢 Partner Accounts

### Verizon Wireless (USAVZ1)
- **Email**: `roaming@verizon.com`
- **Password**: `verizon123`
- **Access**: Own dashboard, invoices, disputes
- **Badge Color**: 🔵 Blue

### T-Mobile UK (GBRTM1)
- **Email**: `wholesale@tmobile.uk`
- **Password**: `tmobile123`
- **Access**: Own dashboard, invoices, disputes
- **Badge Color**: 🔵 Blue

### NTT Docomo (JPNDO1)
- **Email**: `intl@nttdocomo.jp`
- **Password**: `docomo123`
- **Access**: Own dashboard, invoices, disputes
- **Badge Color**: 🔵 Blue

---

## 🎯 Quick Test Guide

### Test Admin Features
```
1. Login: admin@interconnect.com / admin123
2. You'll see: Admin Portal with full platform overview
3. Test: View all partners, manage fraud alerts, access all features
```

### Test Partner Features
```
1. Login: roaming@verizon.com / verizon123
2. You'll see: Verizon's dashboard with their traffic data
3. Test: View dashboard, invoices, create disputes
```

### Test Finance Features
```
1. Login: finance@interconnect.com / finance123
2. You'll see: Admin portal with financial focus
3. Test: Manage invoices, handle disputes, view fraud
```

### Test Support Features
```
1. Login: support@interconnect.com / support123
2. You'll see: Admin portal with support focus
3. Test: View and manage disputes, access partner info
```

---

## 💡 Pro Tips

### Easy Login Method
1. Go to login page
2. Click **"Show Demo Credentials"**
3. Click any account card to auto-fill
4. Click **"Sign In"**

### Testing Different Roles
- Each role sees **different menu items**
- Navigation automatically filters based on role
- Try accessing different pages with different accounts

### Session Persistence
- Login is saved in your browser
- Refresh the page - you stay logged in
- Click "Sign Out" to log out

---

## 🎨 Visual Indicators

### Role Colors
- 🔴 **Red** = Admin (full access)
- 🔵 **Blue** = Partner (partner-specific)
- 🟢 **Green** = Finance (financial operations)
- 🟣 **Purple** = Support (customer support)

### Navigation Access
- **All Users**: Home
- **Admin Only**: Admin Portal, Fraud Monitor, Partners
- **Partners Only**: Their own Dashboard
- **Finance**: Invoices, Disputes, Fraud Monitor
- **Support**: Disputes, Partners

---

## 🚀 Getting Started

1. **Start the server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   ```
   http://localhost:3000/login
   ```

3. **Choose an account** from the demo credentials

4. **Explore** the features based on your role!

---

## 📱 What You'll See After Login

### Admin User
- ✅ Full navigation menu (all 7 items)
- ✅ Admin Portal with platform overview
- ✅ Partner management tools
- ✅ Fraud monitoring
- ✅ All financial tools

### Partner User
- ✅ Limited navigation (Home, Dashboard, Invoices, Disputes)
- ✅ Own dashboard with traffic/revenue
- ✅ Invoice viewer
- ✅ Dispute creator
- ✅ TAP file upload

### Finance User
- ✅ Financial navigation (Home, Partners, Dashboard, Invoices, Disputes, Fraud)
- ✅ Invoice management
- ✅ Dispute resolution
- ✅ Partner financial data
- ✅ Fraud alerts

### Support User
- ✅ Support navigation (Home, Partners, Disputes)
- ✅ Dispute management
- ✅ Partner information
- ✅ Customer service tools

---

## 🎓 Learning Path

### New to the System?
1. Start with **Admin account** to see everything
2. Then try **Partner account** to see partner perspective
3. Explore **Finance** and **Support** to see specialized views

### Want to Test Features?
- **Admin**: Best for overall platform testing
- **Partner**: Best for partner workflow testing
- **Finance**: Best for billing/dispute testing
- **Support**: Best for customer service testing

---

## 🔒 Security Note

**Demo Mode**: This is a demonstration system with visible credentials for easy testing.

**Production**: In a real deployment:
- Passwords would be securely hashed
- Demo credentials would be removed
- Real authentication with database
- Additional security measures (MFA, etc.)

---

**Need Help?** Check these files:
- `AUTH_SYSTEM_GUIDE.md` - Complete authentication guide
- `AUTHENTICATION_SUMMARY.md` - Quick implementation overview
- `PROJECT_README.md` - Full project documentation

**Status**: ✅ All accounts ready to use!
