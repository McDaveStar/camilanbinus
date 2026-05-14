# 🤖 CLAUDE.md — AI Coding Guidelines

## Project: CABI (Click & Collect Platform)

---

## 1. Project Overview

CABI is a multi-page web application for pre-ordering food (cimol/cilok) with Click & Collect or Delivery. Built with HTML + Tailwind CSS + Vanilla JS + Supabase.

**Pages:**
- `index.html` — Landing page (static, no JS logic)
- `app.html` + `script.js` — Customer ordering app
- `admin.html` + `admin.js` — Admin dashboard

---

## 2. Tech Stack Rules

- **Framework**: None. Pure HTML + Vanilla JS (ES Modules via Vite).
- **CSS**: Tailwind CSS v4 via `@tailwindcss/vite` plugin. No custom CSS framework.
- **Icons**: Feather Icons (CDN). Always call `feather.replace()` after dynamic DOM changes.
- **Backend**: Supabase only. No custom server.
- **Build**: Vite 8 with multi-page setup (`vite.config.js`).
- **Env**: Use `import.meta.env.VITE_*` for environment variables.

---

## 3. Critical Rules — DO NOT BREAK

### Data Safety
- **NEVER** modify Supabase queries without explicit user approval.
- **NEVER** change `INSERT`, `UPDATE`, `DELETE` logic — these affect real production data.
- **NEVER** alter the order flow: `cart → checkout → transaction insert → WA redirect`.
- **NEVER** change RLS policies or table schemas.

### File Safety
- `supabase.js` — Do NOT modify. Contains auth config.
- `.env` — Do NOT commit. Contains Supabase secrets.
- `supabase_setup.sql` — Reference only. Do NOT auto-execute.

### Asset Naming
- **NO spaces, parentheses, or special characters** in filenames.
- Use lowercase kebab-case: `cilok-isi-frozen.jpg`, NOT `Cilok Isi (Frozen).jpg`.
- Always update HTML references when renaming files.

---

## 4. Code Patterns

### Toast Notifications (admin.js)
```javascript
// Use showToast() instead of alert() in admin panel
showToast('Message here', 'success'); // success | error | warning | info
```

### Loading States
```javascript
// Always add loading state to async buttons
btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Processing...';
btn.disabled = true;
feather.replace();
// ... async operation ...
// Restore in finally block
```

### Modal Pattern
```javascript
// Open: remove pointer-events-none, add opacity-100, slide drawer
// Close: add translate-y-full, remove opacity-100, setTimeout pointer-events-none
```

### Data Refresh
```javascript
// After any Supabase mutation, call loadData() to refresh UI
// App uses visibilitychange for silent stock refresh (read-only)
```

---

## 5. Known Issues & Workarounds

| Issue | Workaround |
|---|---|
| Feather icons disappear after DOM update | Call `feather.replace()` after any innerHTML change |
| Image files with special chars break on Netlify | Rename to kebab-case before build |
| `</section` typo in index.html | Fixed — always close tags properly |
| Multiple `</div>` can break layout | Count opening/closing tags carefully |

---

## 6. Deployment Checklist

1. Rename any asset files with spaces/special characters
2. Update all HTML `src` references to match
3. Ensure `.env` has correct Supabase credentials
4. Run `npm run build`
5. Check for 0 warnings in build output
6. Drag `dist/` folder to Netlify
7. Test all flows on live URL

---

## 7. What NOT to Do

- ❌ Don't add user registration/login for customers (design decision)
- ❌ Don't switch to a different CSS framework
- ❌ Don't add real-time subscriptions (polling via visibilitychange is sufficient)
- ❌ Don't modify the WhatsApp message format without checking `processCheckout()`
- ❌ Don't remove `confirm()` dialogs from destructive actions (delete, confirm order)

---

*Last updated: May 14, 2026*
