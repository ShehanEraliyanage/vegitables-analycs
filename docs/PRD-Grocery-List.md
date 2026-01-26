# Product Requirements Document: Grocery List (Smart Shopping List)

## Overview

A new **Grocery List** feature that lets users build a shopping list of vegetables and fruits with **Organic** and **Non-Organic** options, quantity in **kg and g**, price estimation based on analytics, and the ability to **save** lists and **export to PDF**.

---

## Goals

- **Budget-aware shopping**: Users see estimated totals before going to the market.
- **Organic vs Non-Organic choice**: Clear pricing for both; organic uses real data when available, otherwise an analysed estimate.
- **Quantity flexibility**: Support kg and g (e.g. 2 kg 500 g).
- **Persistence**: Save lists for reuse.
- **Print/Share**: PDF export for digital print or sharing.

---

## User Stories

| # | As a... | I want to... | So that... |
|---|---------|--------------|-------------|
| 1 | User | Open a "Grocery List" page from the app | I can plan my vegetable & fruit shopping. |
| 2 | User | Search and add vegetables/fruits one by one | I can build my list easily. |
| 3 | User | Choose Organic or Non-Organic for each addition | I can compare costs and shop according to preference. |
| 4 | User | Enter quantity in kg and g for each item | The total is calculated accurately. |
| 5 | User | See a total for my list (and subtotals by Organic / Non-Organic) | I know how much I expect to spend. |
| 6 | User | See when an organic price is "Analysed" (estimated from non-organic) | I understand it’s an estimate, not from actual organic data. |
| 7 | User | Save my list | I can load it later or have multiple lists. |
| 8 | User | Export my list as PDF | I can print it or share it. |

---

## Feature Specification

### 1. Navigation & Access

- New item in the sidebar: **"Grocery List"** (e.g. shortcut **0** or **G**).
- One dedicated view; no sub-tabs for MVP. Can be extended to "My Lists" vs "Current List" later.

### 2. Categories: Organic vs Non-Organic

- **Two modes** when adding/searching: **Organic** and **Non-Organic**.
- User selects the category **before** adding an item; the same product can be added in both categories as separate line items (e.g. "Tomato – Organic 1 kg" and "Tomato – Non-Organic 2 kg").
- In the list, items are visually grouped or labeled as Organic / Non-Organic.
- **Subtotals**: 
  - **Organic subtotal**
  - **Non-Organic subtotal**
- **Grand total** = Organic subtotal + Non-Organic subtotal.

### 3. Pricing Logic

#### Non-Organic

- Source: **Latest price** from our analytics (latest `min`/`max` or average).
- Formula: `pricePerKg = (minPrice + maxPrice) / 2` from the most recent price record for that product.
- No "Analysed" badge; it’s treated as market-based.

#### Organic

- **Case A – Product name contains "organic"** (case-insensitive):  
  - Use the **actual** price for that product from our data.  
  - **No** "Analysed" badge.
- **Case B – Product name does NOT contain "organic"**:  
  - Use the **non-organic** price for that product.  
  - Apply an **organic premium**: e.g. **× 1.35** (35% uplift; configurable).  
  - Show an **"Analysed price"** (or similar) badge to indicate it’s estimated from non-organic data.

*(Exact premium can be tuned; 35% is a common market range for organic uplift.)*

### 4. Adding Items

- **Search**: Autocomplete/search over product names (vegetables & fruits).
- **Select product** from results.
- **Quantity**:
  - **kg**: number input (e.g. 0, 1, 2).
  - **g**: number input (0–999).  
  - Stored and computed in a single value (e.g. total grams or kg as decimal) for clarity:
    - `quantityKg = kg + g/1000`
- **Category** (Organic / Non-Organic) is fixed by the mode at add-time.
- **Line total**:
  - `lineTotal = pricePerKg * quantityKg`
- **Price per kg** and **line total** are shown on each row. For organic estimated prices, the **"Analysed price"** badge is shown on that row.

### 5. List View

- Columns (conceptually): **Product**, **Category (Organic/Non-Organic)**, **Quantity (kg, g)**, **Price/kg (Rs.)**, **Line total (Rs.)**, **Badge (if Analysed)**, **Actions (edit, remove)**.
- **Subtotals**:
  - Sum of line totals for **Organic**.
  - Sum of line totals for **Non-Organic**.
- **Grand total** = Organic + Non-Organic.
- Empty state: Message + CTA to search and add first item.

### 6. Save List

- **"Save list"** (or "Save as…") opens:
  - **Name** (e.g. "Weekly veggies", "January market").
- On save:
  - **New list**: Create `grocery_list` and `grocery_list_items` (see Data Model).
  - **Existing list** (if we support "Update"): Update name and replace items.
- After save: Toast or message: "List saved." Optionally show "Saved lists" to re-open.

### 7. Load / Manage Saved Lists (MVP scope)

- **"My lists"** (or "Saved lists"): 
  - Load from DB: `GET /grocery-list` or similar.
  - Show: name, date, item count.
  - **Load**: Replace current in-memory list with the selected one.
  - **Delete**: Remove from DB (optional for MVP).

### 8. PDF Export

- **"Export PDF"** or **"Print / PDF"**.
- PDF contains:
  - **Title**: e.g. "Grocery List – [List name or date]".
  - **Date generated**.
  - **Table**: Product, Organic/Non-Organic, Quantity (kg & g), Price/kg, Line total, and if applicable "Analysed" for organic estimated rows.
  - **Organic subtotal**, **Non-Organic subtotal**, **Grand total**.
  - Optional: logo or app name in header/footer.
- Layout: Clean, readable, print-friendly (A4 or similar). Use e.g. **jspdf** + **jspdf-autotable** for tables.

### 9. Data Model (DB)

#### `grocery_lists`

| Column       | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | SERIAL PK    |                                |
| name        | VARCHAR(255) | User-defined name              |
| created_at  | TIMESTAMP    |                                |
| updated_at  | TIMESTAMP    |                                |

*(If we add multi-user later: `user_id` can be added.)*

#### `grocery_list_items`

| Column           | Type            | Description                                      |
|-----------------|-----------------|--------------------------------------------------|
| id              | SERIAL PK       |                                                  |
| grocery_list_id | INT FK          | → `grocery_lists.id`                             |
| product_id      | INT FK          | → `products.id`                                  |
| is_organic      | BOOLEAN         | true = Organic, false = Non-Organic              |
| quantity_kg     | DECIMAL(10,3)   | Total quantity in kg (from kg + g/1000)          |
| price_per_kg    | DECIMAL(10,2)   | Snapshot at add-time (Rs. per kg)                |
| is_analysed     | BOOLEAN         | true = "Analysed" organic estimate               |
| created_at      | TIMESTAMP       |                                                  |

- **Line total** can be computed as `quantity_kg * price_per_kg` when loading, or stored for historical accuracy.

### 10. API (High Level)

| Method | Endpoint                          | Purpose                                                                 |
|--------|-----------------------------------|-------------------------------------------------------------------------|
| GET    | /products/search?q=               | Search products by name (for autocomplete).                             |
| GET    | /grocery-list/price?productId=&isOrganic= | Get `pricePerKg` and `isAnalysed` for a product.                  |
| GET    | /grocery-list                    | List of saved `grocery_lists` (id, name, created_at, item count).         |
| GET    | /grocery-list/:id                | Get one list with items (product names, quantities, prices, etc.).      |
| POST   | /grocery-list                    | Create list: `{ name, items: [{ productId, isOrganic, quantityKg, pricePerKg, isAnalysed }] }`. |
| PUT    | /grocery-list/:id                | Update list (name + replace items).                                     |
| DELETE | /grocery-list/:id                | Delete a list.                                                          |

*(Exact request/response shapes can be defined in OpenAPI or in code.)*

---

## UX/UI Notes

- **Distinct visuals for Organic vs Non-Organic**: e.g. green leaf icon or badge for Organic; neutral for Non-Organic.
- **"Analysed price"**: Small, clear badge (e.g. tooltip: "Estimated from non-organic market data").
- **Quantity inputs**: kg and g side by side; validation (e.g. g 0–999, no negatives).
- **Search**: Debounced; minimum 2 characters; clear "No results" state.
- **Empty state**: Illustration or icon + "Add your first item" and short explanation.
- **PDF**: One-click; filename like `Grocery-List-2025-01-26.pdf`.
- **Responsive**: Usable on mobile and desktop.
- **Accessibility**: Labels, keyboard navigation, ARIA where relevant.
- **Theming**: Respect light/dark from the app.

---

## Out of Scope (Later)

- User accounts and per-user lists.
- Unit choice (e.g. pieces, bunches) – only kg/g for now.
- In-list editing of quantity/price (can be added without schema change).
- Barcode or image-based add.
- Price alerts or “list vs. actual spent” tracking.

---

## Success Metrics

- Users can add items, see Organic/Non-Organic subtotals and grand total.
- Organic estimated rows show "Analysed" and use the defined premium.
- Lists can be saved and loaded from DB.
- PDF exports correctly and is readable on print/ screen.

---

## Changelog

| Date       | Author | Change                          |
|------------|--------|---------------------------------|
| 2025-01-26 | –      | Initial PRD for Grocery List.   |
