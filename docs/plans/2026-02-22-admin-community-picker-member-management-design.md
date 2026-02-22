# Admin Panel: Community Picker + Member Management

## Date: 2026-02-22

## Overview

Two features to improve the admin panel:
1. A community picker in the sidebar so admin data filters by selected community
2. Member management actions (role change, removal) in the community detail page

---

## Feature 1: Community Picker

### Location
Dropdown in the admin sidebar, below the "Admin Panel" logo header.

### Behavior
- Lists all communities owned by the admin via `useOwnedCommunities`
- Default option: "Todas as comunidades" (global view)
- Selecting a community stores it in `AdminCommunityContext`
- Dashboard stats and course listings filter by selected community
- Selection persists in `localStorage`

### New Components
- `AdminCommunityContext` — React context providing `{ selectedCommunityId, setSelectedCommunityId }`
- `useAdminCommunity()` — hook to consume the context
- Dropdown in sidebar using shadcn `Select`

### Pages Affected
- **Dashboard** (`/admin`): Stats cards filter by `community_id`
- **Courses** (`/admin/courses`): Course list filters by community's linked courses
- Other pages remain unaffected (communities page is already a list of all communities)

---

## Feature 2: Member Management

### Location
Existing page `/admin/communities/:slug`, "Membros" tab.

### Actions
- **Change role**: Inline `Select` in the Role column. Options: member, moderator, admin. Owner role is not editable.
- **Remove member**: Delete button per row with AlertDialog confirmation. Owner cannot be removed.

### New Hooks
- `useUpdateMemberRole({ memberId, role })` — updates `community_members.role`
- `useRemoveMember({ memberId, communityId })` — deletes from `community_members`

### Protections
- Frontend: disable actions on owner rows
- Backend: RLS already allows owners and global admins to manage members

---

## Database

No schema changes needed. The `community_members` table already supports:
- UPDATE on `role` column (constrained to: owner, admin, moderator, member)
- DELETE for member removal
- RLS policies grant these permissions to community owners and global admins
