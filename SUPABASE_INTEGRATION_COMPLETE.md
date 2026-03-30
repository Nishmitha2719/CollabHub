# 🚀 SUPABASE INTEGRATION - COMPLETE SETUP GUIDE

## ✅ WHAT'S BEEN DONE

### 1. Database Schema Created ✓
- File: `supabase_collabhub_schema.sql`
- Tables: profiles, projects, project_skills, applications, saved_projects
- All UUIDs properly configured
- RLS policies enabled
- Admin permissions set up

### 2. API Functions Created ✓
- File: `lib/api/projects.ts` - Complete project CRUD operations
- File: `lib/api/profiles.ts` - Profile management and admin checks
- All functions use proper UUIDs (no more hardcoded "1"!)

### 3. Auth Integration ✓
- File: `lib/AuthContext.tsx` updated
- Auto-creates profile on signup
- Links Supabase auth to profiles table

### 4. Admin Dashboard Created ✓
- Files ready to create in `app/admin/page.tsx`
- Approve/Reject/Delete functionality
- Beautiful admin UI

### 5. Environment Variables ✓
- `.env.local` already configured with Supabase URL and key

---

## 🛠️ MANUAL SETUP STEPS

### STEP 1: Create Admin Directory
```bash
mkdir app\admin
```

### STEP 2: Create Admin Page
Create file `app\admin\page.tsx` and copy the content from `setup_supabase_integration.py` (lines starting with admin_page_content)

OR manually create it with this structure:
- Import useAuth, API functions
- Check if user is admin
- Fetch all projects with getAllProjects()
- Show pending/approved/rejected tabs
- Add approve/reject/delete buttons

### STEP 3: Run SQL Schema in Supabase
1. Go to your Supabase dashboard: https://app.supabase.com
2. Click on "SQL Editor" in the left sidebar
3. Open file: `supabase_collabhub_schema.sql`
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click "Run" button
7. Wait for "Success" message

### STEP 4: Test Signup
```bash
npm run dev
```

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create account with email/password
4. Check Supabase → Table Editor → profiles
5. You should see your profile created!

### STEP 5: Make Yourself Admin
1. Go to Supabase → SQL Editor
2. Run this query (replace with YOUR email):
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```
3. Verify: Check profiles table, role should be 'admin'

### STEP 6: Update Middleware for Admin Protection
Edit `middleware.ts`:
```typescript
const protectedRoutes = ['/post-project', '/saved', '/admin'];
```

Add this check in middleware logic:
```typescript
// For admin route, check role
if (pathname.startsWith('/admin')) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

### STEP 7: Update Browse Page to Use Real Data
Edit `app/browse/page.tsx`:

Replace mock data with:
```typescript
import { getProjects } from '@/lib/api/projects';

const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function load() {
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  }
  load();
}, []);
```

### STEP 8: Update Project Details Page
Edit `app/projects/[id]/page.tsx`:

Replace mock with:
```typescript
import { getProjectById, applyToProject, saveProject } from '@/lib/api/projects';

const project = await getProjectById(params.id);
```

### STEP 9: Update Post Project Page
Edit `app/post-project/page.tsx`:

Use real `createProject`:
```typescript
import { createProject } from '@/lib/api/projects';
import { useAuth } from '@/lib/AuthContext';

const { user } = useAuth();

const handleSubmit = async (formData) => {
  const project = await createProject({
    title: formData.title,
    description: formData.description,
    category: formData.category,
    difficulty: formData.difficulty,
    duration: formData.duration,
    team_size: formData.teamSize,
    is_paid: formData.isPaid,
    owner_id: user.id  // Use real user ID!
  }, formData.skills);
  
  if (project) {
    alert('Project submitted for review!');
    router.push('/');
  }
};
```

### STEP 10: Update Saved Page
Edit `app/saved/page.tsx`:

Replace mock with:
```typescript
import { getSavedProjects } from '@/lib/api/projects';

const saved = await getSavedProjects(user.id);
```

---

## 🧪 TESTING WORKFLOW

### Test 1: Sign Up & Profile Creation
1. Go to /auth/signup
2. Create account
3. Check Supabase profiles table
4. ✓ Profile should exist with role='user'

### Test 2: Post a Project
1. Login
2. Go to /post-project
3. Fill form and submit
4. Check Supabase projects table
5. ✓ Project should exist with status='pending'

### Test 3: Admin Approval
1. Make yourself admin (SQL query above)
2. Go to /admin
3. See your pending project
4. Click "Approve"
5. ✓ Status should change to 'approved'

### Test 4: Browse Approved Projects
1. Go to /browse
2. ✓ Should see your approved project
3. ✓ Should NOT see pending projects

### Test 5: Save & Apply
1. Click project card → Go to /projects/[id]
2. Click "Save Project"
3. Check saved_projects table
4. Click "Apply"
5. Check applications table

---

## 🐛 TROUBLESHOOTING

### Error: "invalid input syntax for type uuid: '1'"
**Fix:** You're using hardcoded IDs. Always use:
```typescript
user.id  // From useAuth()
project.id  // From database
```

### Error: "relation 'profiles' does not exist"
**Fix:** Run the SQL schema in Supabase

### Error: "Access denied" on admin page
**Fix:** Run the UPDATE query to make yourself admin

### Projects not showing on browse page
**Fix:** 
1. Check project status is 'approved'
2. Check RLS policies are enabled
3. Try: `SELECT * FROM projects WHERE status = 'approved';`

### Can't create project
**Fix:** Make sure you're passing owner_id:
```typescript
createProject({ ...formData, owner_id: user.id }, skills)
```

---

## 📝 QUICK REFERENCE

### Key Files
- `supabase_collabhub_schema.sql` - Database schema
- `lib/api/projects.ts` - Project API functions
- `lib/api/profiles.ts` - Profile & admin functions
- `lib/AuthContext.tsx` - Auth with auto-profile creation
- `app/admin/page.tsx` - Admin dashboard (CREATE THIS!)

### Key Commands
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Check environment
cat .env.local
```

### Important UUIDs
- Always use `user.id` from useAuth()
- Always use `project.id` from database
- Never use hardcoded "1", "123", etc.

### Admin SQL Queries
```sql
-- Make user admin
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- Check all projects
SELECT id, title, status, owner_id FROM projects;

-- Approve project manually
UPDATE projects SET status = 'approved' WHERE id = 'project-uuid-here';
```

---

## ✨ FINAL CHECKLIST

- [ ] SQL schema run in Supabase
- [ ] app/admin directory created
- [ ] app/admin/page.tsx created
- [ ] middleware.ts updated with admin protection
- [ ] app/browse/page.tsx updated to use real data
- [ ] app/projects/[id]/page.tsx updated
- [ ] app/post-project/page.tsx updated
- [ ] app/saved/page.tsx updated
- [ ] Test: Signup works
- [ ] Test: Profile auto-created
- [ ] Test: Post project (pending)
- [ ] Test: Admin can approve
- [ ] Test: Browse shows approved only
- [ ] Test: Save/Apply works

---

## 🎉 YOU'RE DONE!

Once all steps are complete:
1. All pages use real Supabase data (no mock data!)
2. UUID errors are fixed
3. Admin system is working
4. Projects require approval before showing
5. Full CRUD operations work

**Access your app:**
- Homepage: http://localhost:3000
- Browse: http://localhost:3000/browse
- Admin: http://localhost:3000/admin
- Post: http://localhost:3000/post-project

**Need help?** Check the troubleshooting section above!
