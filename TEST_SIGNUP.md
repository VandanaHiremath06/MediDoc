# Testing MediDoc Signup & Backend

## ✅ Backend Status: DEPLOYED & WORKING

Your backend has been successfully deployed! Here's how to test the complete flow:

---

## 🧪 Complete Test Flow

### Step 1: Clear Browser Data (Important!)
```
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear all localStorage
4. Refresh the page
```

### Step 2: Sign Up New User

1. Click "Get Started"
2. Click "Sign Up"
3. Fill in credentials:
   - Name: `Test User`
   - Email: `test@medidoc.com`
   - Password: `test123456`
   - Family Members: `2`

4. Add family members:
   - Member 1:
     - Name: `John Doe`
     - Nickname: `Dad`
     - Mobile: `555-0001`
   - Member 2:
     - Name: `Jane Doe`
     - Nickname: `Mom`
     - Mobile: `555-0002`

5. Click "Complete Signup"

### Step 3: Check Console (F12)

You should see:
```
Saving profile to backend... {userId: "xxx", email: "...", ...}
Backend save response: {success: true, userId: "xxx"}
Profile saved successfully!
```

### Step 4: Verify Dashboard

After signup, you should:
- ✅ See the dashboard
- ✅ See 2 family member cards (Dad and Mom)
- ✅ Be able to click on each member

---

## 🔍 Debugging Tools Added

### 1. Test Backend Button (Bottom Left)
- Click to test if backend is responding
- Shows connection status

### 2. Browser Console Logs
- Open DevTools (F12) → Console tab
- Watch for detailed logs during signup/login
- All API calls are logged

---

## 📊 What's Happening Behind the Scenes

### Signup Flow:
```
1. User fills signup form
   ↓
2. Supabase Auth creates user account
   ↓  
3. Auto-login to get auth token
   ↓
4. Call backend /auth/save-profile with:
   - userId (from Supabase)
   - email, name
   - familyMembers array
   - Authorization: Bearer <access_token>
   ↓
5. Backend saves to KV store:
   - user:{userId} → profile data
   - familyMember:{userId}:member:0 → first member
   - familyMember:{userId}:member:1 → second member
   ↓
6. Redirect to dashboard
   ↓
7. Dashboard fetches /family/members
   ↓
8. Shows family member cards
```

---

## ❌ Troubleshooting

### "Still showing deployment message"
**Solution:** 
- Clear browser cache and localStorage
- Do a hard refresh (Ctrl+Shift+R)
- Sign up with a NEW email address

### "Signup error: Failed to save profile data"
**Check:**
1. Open Console (F12)
2. Look for the actual error message
3. Check Network tab for failed requests
4. Try clicking "Test Backend" button

### "Family members not showing"
**Check:**
1. Console logs for "Members found: X"
2. Check localStorage has `authToken` and `userId`
3. Try logging out and logging back in

### "Backend test fails"
**This means:**
- Edge Function not deployed OR
- Edge Function has an error

**Solution:**
- Redeploy Edge Function from Figma Make settings
- Check Supabase logs

---

## 🎯 Quick Backend Test (Command Line)

Run this in your terminal to verify backend:

```bash
# Test health
curl -X GET "https://ynbsuzmbulnkytfnyqcl.supabase.co/functions/v1/make-server-5ec6d9ed/health" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluYnN1em1idWxua3l0Zm55cWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzM4NzMsImV4cCI6MjA5MzA0OTg3M30.k7UVPVkOaib9T6pnpvqHS_RsxxW6p3FMPGRxoxa6Pq8"

# Expected: {"status":"ok"}
```

---

## 📝 Current Status Checklist

✅ Backend deployed  
✅ Health endpoint working  
✅ Save-profile endpoint working  
✅ Family members endpoint working  
✅ Frontend auth working  
✅ Console logging added  
✅ Test button added  

**Next:** Clear cache and test signup flow!
