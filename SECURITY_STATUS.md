# VK Controls Inventory — Security Final

Implemented in this package:
- Supabase Auth profile verification before loading application data.
- Owner Controls UI restricted to the Owner role.
- Database protection for `app_state.users` and `app_state.ownerSettings`.
- Legacy password/login OTP/reset OTP fields scrubbed from local/cloud state.
- Owner reset OTP stored as a protected hash in `owner_settings`.
- Client-side login, OTP and password-reset attempt cooldowns.
- Exact Supabase JS SDK version pinned.
- CSV formula-injection protection on exports.
- Startup sanitization of legacy local storage.
- Defensive referrer and permissions metadata.
- Service-worker cache version bumped.

Database-side hardening already applied to the VK Controls Inventory Supabase project:
- Owner-state protection trigger.
- Security-definer RPC execution restricted.
- Existing RLS protections retained.

Platform limitations:
- GitHub Pages does not let the repository set arbitrary HTTP security response headers. `_headers` is included for a host that supports it, but GitHub Pages will ignore it.
- Supabase leaked-password protection is an Auth project setting and is not exposed through the available database tooling; it should be enabled in Supabase Auth settings.
- Supabase CORS is platform-managed; the browser app only calls the configured project origin.
