# FYP Evaluator Testing Findings

**Test date:** July 23, 2026

**Status:** All previously reported code and backend findings resolved

## Problems and Fixes

### 1. Production build failed on the login page

**Problem:** `pnpm build` compiled the application but failed while
prerendering `/login`. `LoginForm` used `useSearchParams()` without a React
Suspense boundary.

**Fix:** Wrapped `LoginForm` in `Suspense` inside the login page. The complete
production build now succeeds.

### 2. Production dependencies had known vulnerabilities

**Problem:** Next.js `16.2.10` and its transitive dependencies contained known
high and moderate security vulnerabilities, including a proxy bypass.

**Fix:** Upgraded Next.js and `eslint-config-next` to `16.2.11`. Patched
transitive `sharp` and `postcss` versions through pnpm overrides. The production
audit now reports no known vulnerabilities.

### 3. Evaluation rules were enforced only by the frontend

**Problem:** A crafted API request could overwrite saved marks, skip earlier
phases, submit a student outside the project, use a nonexistent project ID, or
send an incorrect PLO score set.

**Fix:** Added backend validation for project existence, student membership,
phase order, saved-evaluation immutability, assigned PLOs, and marks from 0 to
5. The API now accepts exactly one student evaluation at a time.

### 4. Student IDs depended on array position

**Problem:** Student IDs were generated as `projectId-index`. Reordering or
replacing students could make old evaluation marks appear against a different
student.

**Fix:** Added stable project-owned student IDs and migrated existing projects
and evaluations. Renaming preserves the ID and saved marks, removing a student
also removes that ID from saved evaluations, and adding a student creates a new
ID with no marks so project progress is recalculated.

### 5. Concurrent evaluation saves could lose marks

**Problem:** The service read the existing students, merged them in memory, and
replaced the complete array. Simultaneous requests could overwrite each other.

**Fix:** Each student is now appended atomically with MongoDB `$push`. The
duplicate-key retry path safely handles two requests creating the same phase
document at the same time.

### 6. Deactivated faculty sessions could remain active

**Problem:** The proxy trusted the role and status stored in the JWT. A
deactivated faculty account could continue using its existing refresh token.

**Fix:** Refresh-token renewal now checks the current user status in MongoDB.
`/api/me` clears cookies for inactive accounts, while faculty profile and
evaluation writes also verify active status.

### 7. Project cascade deletion was not recoverable

**Problem:** The project was deleted before its evaluations. If evaluation
deletion failed, retrying did not clean the orphaned records because the
project no longer existed.

**Fix:** Normal deletion removes evaluations and then the project without
writing a pending status. Only when either database deletion fails is the
remaining project marked pending and hidden from faculty. The admin receives
Refresh guidance, and refreshing automatically attempts the cleanup again.

### 8. Temporary `/api/me` failures appeared as logout

**Problem:** `AuthProvider` redirected to `/login` for every unsuccessful
`/api/me` response, including temporary server or database errors.

**Fix:** The provider now treats only `401` and `403` as authentication
failures. Other server failures no longer clear the frontend user session.

## Verification Results

- `pnpm exec tsc --noEmit`: passed
- `pnpm lint`: passed
- `pnpm build`: passed, including all 21 generated pages
- `pnpm audit --prod`: no known vulnerabilities
- Student ID migration: completed with 0 remaining records to migrate
- Live regression checks: passed against the live application

The live regression checks verified:

- Login rendering and unauthenticated route/API protection
- Two concurrent student saves both persist in one evaluation document
- Saved marks cannot be submitted again
- Later phases cannot be submitted before earlier phases
- Forged students and nonexistent projects are rejected
- Student rename, removal, addition, and progress recalculation use stable IDs
- Inactive access and refresh tokens are rejected
- Normal project deletion removes evaluations
- Retrying deletion cleans evaluations after a simulated partial failure

The checks used temporary database records and removed them afterward.

## Database Migration

The initial migration updated:

- 6 projects with stable student IDs
- 2 existing saved student evaluations with their matching stable IDs

A second migration run changed 0 projects and 0 evaluations, confirming that
no records remained to migrate. The one-time migration helper was then removed.

## Remaining Coverage

- Browser automation and screenshot-based responsive testing have not been run
  yet, as visual testing is the next planned stage.
- An access token already issued before deactivation remains cryptographically
  valid for at most its 15-minute lifetime. Sensitive faculty writes and token
  refreshes still check current database status immediately.
