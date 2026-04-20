<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

# Web Development Standards

All future work on the `apps/web` project **MUST** follow the established architectural standards. Failure to do so will result in inconsistent code and technical debt.

1. **Mutations via Server Actions**: Every state-changing operation (POST, PUT, DELETE) must be implemented as a Server Action in `lib/[module]-actions.ts`. Direct `fetch` to proxy in Client Components for mutations is deprecated.
2. **Standardized UI (FormLayout)**: Admin forms must use the `FormLayout` component with `FormSection` and `Field`.
3. **Data Flow**: Use Client Components for interactive pages, fetching data via Server Actions and managing permissions with `useAuth` and `useFormMode` hooks.
4. **Mandatory Reading**: Before writing any UI or API integration code, you **MUST** read the documentation in `docs/project/web/`.

<!-- END:nextjs-agent-rules -->
