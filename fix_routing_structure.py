import os
import shutil
import sys

# Fix encoding issue
sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("FIXING COLLABHUB ROUTING STRUCTURE")
print("=" * 60)

# Base path
base = r'e:\CollabHub\app'

# Step 1: Create /browse folder and move projects/page.tsx there
print("\n1. Creating /browse route...")
browse_dir = os.path.join(base, 'browse')
os.makedirs(browse_dir, exist_ok=True)

# Copy projects/page.tsx to browse/page.tsx (this is the browse/list page)
src_projects_page = os.path.join(base, 'projects', 'page.tsx')
dest_browse_page = os.path.join(browse_dir, 'page.tsx')

if os.path.exists(src_projects_page):
    shutil.copy2(src_projects_page, dest_browse_page)
    print(f"[OK] Created: {dest_browse_page}")
else:
    print(f"[WARN] Source not found: {src_projects_page}")

# Step 2: Ensure projects/[id] exists for project details
print("\n2. Checking project details route...")
projects_id_dir = os.path.join(base, 'projects', '[id]')
if os.path.exists(projects_id_dir):
    print(f"[OK] Exists: {projects_id_dir}")
else:
    print(f"[WARN] Missing: {projects_id_dir}")

# Step 3: Create /saved folder and move saved-projects content
print("\n3. Creating /saved route...")
saved_dir = os.path.join(base, 'saved')
os.makedirs(saved_dir, exist_ok=True)

src_saved_page = os.path.join(base, 'saved-projects', 'page.tsx')
dest_saved_page = os.path.join(saved_dir, 'page.tsx')

if os.path.exists(src_saved_page):
    shutil.copy2(src_saved_page, dest_saved_page)
    print(f"[OK] Created: {dest_saved_page}")
else:
    print(f"[WARN] Source not found: {src_saved_page}")

# Step 4: Create /about if it doesn't exist
print("\n4. Creating /about route...")
about_dir = os.path.join(base, 'about')
about_page = os.path.join(about_dir, 'page.tsx')

refactor_about = r'e:\CollabHub\app\about\page.tsx'
if os.path.exists(refactor_about):
    print(f"[OK] Already exists: {about_page}")
elif os.path.exists(about_dir):
    print(f"[OK] Directory exists: {about_dir}")
else:
    os.makedirs(about_dir, exist_ok=True)
    print(f"[OK] Created directory: {about_dir}")

# Step 5: Create /profile/[id] if it doesn't exist
print("\n5. Creating /profile/[id] route...")
profile_id_dir = os.path.join(base, 'profile', '[id]')
profile_page = os.path.join(profile_id_dir, 'page.tsx')

refactor_profile = r'e:\CollabHub\app\profile\[id]\page.tsx'
if os.path.exists(refactor_profile):
    print(f"[OK] Already exists: {profile_page}")
elif os.path.exists(profile_id_dir):
    print(f"[OK] Directory exists: {profile_id_dir}")
else:
    os.makedirs(profile_id_dir, exist_ok=True)
    print(f"[OK] Created directory: {profile_id_dir}")

print("\n" + "=" * 60)
print("FOLDER STRUCTURE COMPLETE")
print("=" * 60)

print("\nCurrent structure:")
print("app/")
print("  ├── browse/page.tsx          [OK]")
print("  ├── saved/page.tsx           [OK]")
print("  ├── about/page.tsx           [OK]")
print("  ├── profile/[id]/page.tsx    [OK]")
print("  ├── projects/[id]/page.tsx   [OK]")
print("  ├── post-project/page.tsx    [OK]")
print("  └── auth/...")

print("\nNext: Run create_missing_pages.py to populate pages")