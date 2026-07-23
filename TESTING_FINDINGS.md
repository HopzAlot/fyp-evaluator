# FYP Evaluator Testing Findings

**Test date:** July 23, 2026

## Scope

The testing covered:

- TypeScript and ESLint checks
- Production build
- Production dependency audit
- Authentication and role-based route protection
- Access-token renewal through the refresh token
- Admin and faculty page rendering
- Evaluation export and phase filtering
- Invalid request validation
- MongoDB relationship and data-integrity checks
- Focused review of authentication, projects, evaluations, imports, exports, and deletion

No destructive requests were performed against the database.

## Findings

### 1. High: Production build fails

`pnpm build` compiles successfully but fails while prerendering `/login`.
`LoginForm` uses `useSearchParams()` without a React Suspense boundary.

Relevant files:

- `src/components/layout/auth/LoginForm.tsx:20`
- `src/app/(auth)/login/page.tsx:11`

### 2. High: Next.js has known security vulnerabilities

The project uses Next.js `16.2.10`. The dependency audit reported five high
and six moderate vulnerabilities, including a proxy bypass. The relevant
Next.js fixes are available in `16.2.11`.

Relevant file:

- `package.json:21`

### 3. High: Evaluation rules are not enforced completely by the backend

The frontend prevents editing saved evaluations and locks phases in order, but
the API service does not enforce all of those rules. A crafted request could:

- Resubmit and overwrite saved student marks
- Submit a later phase before earlier phases
- Submit a student who does not belong to the project
- Save an evaluation using a valid but nonexistent project ObjectId

Relevant file:

- `src/services/evaluationService.ts:148`

### 4. High: Student IDs depend on array position

Student IDs are generated as `projectId-index`. If an admin reorders or
replaces students after evaluations exist, an old ID could point to a different
student and display the wrong saved marks.

Relevant files:

- `src/app/(main)/projects/[projectId]/page.tsx:42`
- `src/services/projectService.ts:376`

### 5. Medium: Concurrent evaluation saves can lose data

The service reads the existing evaluation, merges students in memory, and then
replaces the complete `students` array. Two simultaneous saves can read the
same old value, causing the later request to overwrite the first request.

Relevant file:

- `src/services/evaluationService.ts:238`

### 6. Medium: Deactivating faculty does not revoke an existing session

The proxy trusts the role and status stored in JWTs. A faculty member who is
already logged in can remain authenticated after an admin changes the account
to inactive, potentially until the refresh token expires.

Relevant file:

- `src/proxy.ts:102`

### 7. Medium: Cascade deletion is not recoverable after a partial failure

The project is deleted before its evaluations. If evaluation deletion fails,
retrying the request will not remove the orphan evaluations because the project
is already gone and its next `deletedCount` is zero.

Relevant file:

- `src/services/projectService.ts:336`
- `src/services/projectService.ts:395`

### 8. Medium: Any `/api/me` failure can appear as a logout

`AuthProvider` redirects to `/login` for every unsuccessful `/api/me` response,
including temporary server or database errors. Only authentication failures
should be treated as logout.

Relevant file:

- `src/components/providers/AuthProvider.tsx:35`

## Passed Checks

- TypeScript completed without errors.
- ESLint completed without errors.
- Twenty-two runtime smoke and invalid-input tests passed.
- Unauthenticated admin and faculty routes redirected to login.
- Faculty accounts could not access admin pages or APIs.
- Admin accounts were redirected away from faculty routes.
- Admin and faculty pages returned successful responses.
- Phase-filtered evaluation export returned an Excel response.
- Invalid export phase IDs were rejected.
- Malformed login, registration, profile, evaluation, upload, password, status,
  and bulk-deletion requests were rejected.
- An expired access token with a valid refresh token returned `200` and issued a
  new access cookie.

## Database Audit

The current MongoDB data passed the integrity audit:

- 8 evaluation phases
- 12 PLOs
- Phase weightages total 100%
- No missing faculty profiles
- No orphan faculty profiles
- No duplicate project keys
- No orphan evaluation documents
- No duplicate project/faculty/phase evaluation documents
- No student ID and name mismatches
- No invalid PLO scores
- No incorrect phase PLO score sets

## Remaining Coverage Gaps

- No browser automation or Playwright setup currently exists.
- Responsive layouts and interactive visual states were not screenshot-tested.
- Destructive operations were reviewed but not executed against live data.
- Concurrent evaluation submissions were not executed because they could alter
  existing evaluation records.

## Recommended Fix Order

1. Fix the `/login` production build failure.
2. Upgrade Next.js and affected transitive dependencies.
3. Enforce evaluation immutability, student membership, and phase order in the backend.
4. Store stable student identifiers instead of deriving them from array positions.
5. Make student evaluation updates concurrency-safe.
6. Revalidate or revoke sessions when faculty status changes.
7. Make project and evaluation deletion recoverable or transactional.
8. Redirect to login only for genuine authentication failures.
