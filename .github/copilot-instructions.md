# Copilot Instructions for netlify-test-app

## Project Overview
A **single-page educational website** for Datatek Academy (Azerbaijani language). Focuses on promoting courses (programming, design, languages) with a live chat integration via n8n webhooks.

## Architecture & Data Flow

### Structure
- **HTML**: Single `index.html` with semantic sections (hero, courses, features, FAQ, contact, chat widget)
- **CSS**: `style.css` with CSS custom properties (dark/light theme switching)
- **JavaScript**: `app.js` handles all interactivity

### Key Components & Patterns

#### 1. **Theme System** (Dark/Light Toggle)
- Uses CSS custom properties (CSS variables) defined in `:root` and `[data-theme="light"]`
- Theme persisted to `localStorage` with key `"theme"`
- Applied via `data-theme` attribute on `<html>` element
- Toggle button updates theme and localStorage, then updates button text
- **Pattern**: All color references use variables like `--bg`, `--accent`, `--text`

#### 2. **DOM Query & Event Listeners**
- Heavy use of `document.querySelectorAll()` and `document.getElementById()`
- Always checks if element exists before attaching listeners (`if (element) { ... }`)
- Close elements found with `.querySelector()` relative to parent (e.g., `item.querySelector(".faq-question")`)

#### 3. **Course Filter System**
- Uses `data-category` attributes on `.course-card` and `.filter-btn` elements
- Clicking filter button: removes all `.active` classes, adds to clicked button, shows/hides cards via `display: block/none`
- Categories: `"all"`, `"programming"`, `"design"`, `"language"`

#### 4. **FAQ Accordion**
- Single open pattern: remove `.open` class from all items, then add to clicked item
- Animation uses CSS `max-height` transition on `.faq-answer` (smooth expand/collapse)
- Icon rotates 45° via `transform` when open

#### 5. **Mobile Navigation (Burger Menu)**
- Burger button toggles `.open` class on `.nav` element
- On mobile, `.nav` is `display: none` by default; `.nav.open` becomes `display: flex`
- Clicking nav links closes menu by removing `.open` class
- Breakpoint: `@media (max-width: 800px)` hides nav, shows burger

#### 6. **Live Chat Widget & n8n Integration**
- Launcher bubble (fixed, bottom-right) opens/closes chat widget
- Chat widget slides in via CSS transform + opacity transition (`.open` class)
- **Critical**: Form submits to `N8N_WEBHOOK_URL = "https://n8n.datatek.tech/webhook/datatek-chat"`
- Message format: `{ message, source: "datatek-website", time: ISO string }`
- Handles success/error: shows "Yazılır..." (typing) animation, replaces with response or fallback message
- Always catches JSON parse errors with `.catch(() => ({}))`

#### 7. **Contact Form**
- Form reset triggered after successful fake submit (no real backend)
- Shows success message via `.form-status` element, clears after 4 seconds
- Uses `.reset()` to clear inputs

#### 8. **Smooth Scroll**
- Navigation anchor links prevent default, call `scrollToSection(id)`
- `scrollToSection()` calculates offset: `el.offsetTop - 70` (70px for fixed header height)
- Uses `window.scrollTo({ top, behavior: "smooth" })`

## Critical Developer Patterns

### Do's
- **Always check element exists** before attaching event listeners
- **Use CSS custom properties** for colors; never hardcode hex values in JS
- **Preserve Azerbaijani language content** - this is a localized site
- **Maintain responsive breakpoints**: `600px`, `800px` (mobile-first patterns)
- **Use class toggling** (`.classList.add/remove/toggle`) rather than inline styles

### Don'ts
- Don't modify HTML structure without updating corresponding selectors in `app.js`
- Don't add hardcoded colors/spacing; use CSS variables
- Don't forget `e.preventDefault()` on form/link submissions
- Don't use `display: none` without testing both light and dark themes

## Common Workflows

### Adding a New Feature
1. Add HTML markup in appropriate section
2. Add CSS styling using existing variable names (e.g., `--accent`, `--text-muted`)
3. Add event listener in `app.js` with null check
4. Test in both dark (`data-theme="dark"`) and light (`data-theme="light"`) modes

### Modifying Chat Behavior
- Edit `N8N_WEBHOOK_URL` for different webhook endpoint
- Modify request body structure in `JSON.stringify()` call
- Update fallback reply message in the `.catch()` block
- The "Yazılır..." (typing) indicator is created as a DOM element; preserve this pattern

### Styling New Components
- Reference color scheme: primary accent is `--accent` (cyan in dark, sky-blue in light)
- Use `border-radius: var(--radius-lg)` (18px) or `var(--radius-xl)` (26px) for consistency
- Shadows: `box-shadow: var(--shadow-soft)` for soft drop shadows
- Transitions: `transition: property var(--transition-fast)` (0.18s ease-out)

## External Dependencies
- **n8n webhook**: Must be reachable at `https://n8n.datatek.tech/webhook/datatek-chat`
- No npm dependencies; pure HTML/CSS/JS
- Deploy via Netlify (referenced in repo name)

## Testing Checklist
- [ ] Test burger menu opens/closes on mobile
- [ ] Course filter hides/shows cards correctly
- [ ] FAQ accordion opens one at a time
- [ ] Chat widget opens/closes smoothly
- [ ] Theme toggle persists on page reload
- [ ] Form clears after submission
- [ ] Smooth scroll works for all anchor links
- [ ] Light mode colors are readable
- [ ] Chat n8n request includes all fields
