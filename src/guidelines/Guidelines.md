# Comprehensive Figma Rules & Guidelines

This document outlines the complete set of rules and best practices for designing in Figma. Adhering to these guidelines ensures clarity, consistency, scalability, and a seamless handoff to development.

---

## 🏛️ Philosophy & Core Principles

* **Clarity First:** Prioritize clarity and maintainability. Any team member (designer, developer, or PM) should be able to open any file and understand its purpose and structure at a glance.
* **Simplicity:** Break down complex UIs and problems into their smallest, most focused components. Avoid deep nesting of layers or groups.
* **Component-Driven:** All UI elements should be built as reusable components. Design atomically (atoms, molecules, organisms).
* **Token-Based:** All design decisions (color, space, typography, radius) must be driven by variables (design tokens). **Never use hard-coded values.**
* **Documentation:** All files, pages, components, variables, and comments must be in **English**.

---

## 🗂️ File, Page, & Version Control

### 1. File Naming

* **Rule:** Use **`kebab-case`** for all file names.
* **Examples:**
    * `acme-design-system.fig`
    * `user-profile-feature.fig`
    * `auth-wizard-v2.fig`

### 2. Page Organization

* **Rule:** Use clear, purposeful page names. Emojis are encouraged to indicate status or category.
* **Standard Pages:**
    * ` Thumbnail` (For the file's cover art)
    * `Component Library` (For main components in a design system file)
    * `✅ Ready for Dev` (For approved, final screens)
    * `🎨 [Feature Name]` (For active design work, e.g., `🎨 User Profile`)
    * `🧪 Sandbox` (For experiments, mood boards, and temporary drafts)
    * `Archived` (For old or deprecated designs)

### 3. Version Control

* **Rule:** The **`main`** branch of a library file is the single source of truth and should be protected.
* **Branching:** All new features, explorations, or bug fixes **must** be done in a branch. Never work directly on `main`.
* **Branch Naming:** Use descriptive, prefixed names:
    * `feature/new-dashboard`
    * `fix/button-padding`
    * `explore/color-palette`
* **Reviews:** All changes must be reviewed and approved by at least one other designer before merging into `main`.
* **Publishing:** Only publish library updates from the `main` branch. Use clear, semantic version notes (e.g., "Added: Error state to Input component").

---

## 🏷️ Naming Conventions

### 1. Layers & Frames

* **Rule:** Use **`PascalCase`**. Name layers based on their *function*, not their content.
* **Good:** `Header`, `Sidebar`, `LoginForm`, `UserProfileCard`
* **Bad:** `Frame 1024`, `Group 5`, `Rectangle 2`
* **Text Layers:** `Headline`, `Body`, `CtaLabel`, `ErrorMessage`
* **Icon Layers:** `IconClose`, `Icon/ArrowRight`

### 2. Components

* **Rule:** Use **`PascalCase`** with slashes (`/`) to group and organize components.
* **Examples:**
    * `Button/Primary`
    * `Button/Secondary`
    * `Form/Input`
    * `Form/Select`
    * `Card/Product`

### 3. Component Variant Properties

* **Rule:** Use **`camelCase`** for all property names in the "Variants" panel.
* **Examples:**
    * `state` (Values: `Default`, `Hover`, `Focused`, `Disabled`)
    * `type` (Values: `Primary`, `Secondary`, `Destructive`)
    * `size` (Values: `Sm`, `Md`, `Lg`)
    * `hasIcon` (Values: `True`, `False`)
    * `status` (Values: `Default`, `Error`, `Success`)

---

## 🧩 Component & UI Design

* **Shallow Structure:** Avoid deeply nested layer trees. A flatter structure using Auto Layout is easier to read, maintain, and hand off.
* **Design All States:** Always design for all possible component states, including `Empty`, `Loading`, `Error`, `Success`, and all interactive states (see Accessibility).
* **Token-Based:** Apply variables for all colors, fonts, spacing, and radii. **Never detach styles or use hard-coded values.**
* **Mobile-First:** Design with mobile-first principles. Start with the smallest viewport and scale up.

---

## 📱 Responsive Design (Auto Layout & Constraints)

### 1. Auto Layout Rules (Primary Tool)

* **Rule 1: Default to Auto Layout:** Use Auto Layout for **all** UI structures (buttons, lists, cards, page sections).
* **Rule 2: Use Frames, Not Groups:** Always use a **Frame** (`F`) and apply Auto Layout. Never use a **Group** (`Cmd+G`). Groups break responsive behavior.
* **Rule 3: Master Resizing Behavior:** For every item inside an Auto Layout frame, define its resizing behavior:
    * **`Hug Contents`:** The frame shrinks to fit its content. (Use for: Buttons, tags, text labels).
    * **`Fill Container`:** The item stretches to fill the available space. (Use for: Responsive text blocks, inputs in a form, main content areas).
    * **`Fixed`:** The item stays at a specific size. (Use for: Icons, avatars, toggles).
* **Rule 4: Use Spacing & Padding:**
    * Use **"Spacing between items"** for gaps in a stack (e.g., items in a list).
    * Use **"Padding"** for the internal space of a container (e.g., inside a card).
    * Use **Variables** for all spacing values.

### 2. Constraints Rules (Secondary Tool)

* **Rule 1:** Use Constraints *only* for elements inside a top-level screen frame that *does not* use Auto Layout.
* **Rule 2: Pin Logically:**
    * **`Left & Top`:** For logos, "Back" buttons.
    * **`Right & Top`:** For "Close" icons, menu buttons.
    * **`Left & Right`:** For full-width headers, footers, or content containers.
    * **`Bottom` (Left/Right/Center):** For fixed navigation bars or floating action buttons.

---

## 🎨 Variables & Styles (Design Tokens)

### 1. Variable Naming

* **Rule:** Use **`camelCase`** for token names, grouped with slashes (`/`). This maps directly to code.
* **Collections:** Use Collections to separate token sets (`Global Tokens`, `Theme: Light`, `Theme: Dark`, `Breakpoints`).
* **Examples:**
    * `color/brand/primary`
    * `color/text/default`
    * `color/feedback/error`
    * `spacing/sm`
    * `spacing/md`
    * `radius/full`
    * `font/size/base`
    * `font/weight/bold`

### 2. Legacy Styles (If not using Variables)

* **Rule:** Use **`PascalCase`** with slashes (`/`).
* **Examples:** `Color/Brand/Primary`, `Text/Desktop/H1`, `Shadow/Small`

---

## ♿ Accessibility (a11y)

* **Semantic Naming:** Name components logically (e.g., `Button`, `Select`, `RadioGroup`). This communicates structural intent to developers.
* **Layer Order:** Ensure the layer order in the left panel matches the visual reading order (top-to-bottom, left-to-right). This informs keyboard tab order.
* **Design All States:** All interactive components **must** have variants for all states:
    * `Default`
    * `Hover`
    * `Focus` (Critical for keyboard navigation)
    * `Active` (Pressed)
    * `Disabled`
* **Annotations:** Use comments or annotation components to specify necessary ARIA attributes (like `aria-label`) for elements where the visual design is not self-explanatory (e.g., an icon-only button).
* **Color Contrast:** Ensure all text meets WCAG AA contrast ratios against its background. Use a plugin to check this.