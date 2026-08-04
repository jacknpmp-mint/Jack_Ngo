# Lead & Customer Manager (Google Apps Script)

A lightweight CRM built on Google Sheets + Apps Script: manage **Leads**,
**Customers**, and a **To-Do list**, with status-based automatic task
recommendations and a Google-styled web dashboard.

## How it works

- **Data lives in Google Sheets** (`Leads`, `Customers`, `ToDos` tabs), so you
  get Sheets' native real-time collaboration for free — anyone with edit
  access sees changes from others instantly, no custom sync code needed.
- **A published web app** (`Index.html`) gives you a cleaner Google-style
  dashboard on top of the same data — tabs for Leads / Customers / To-Do,
  inline stage changes, and one-click task completion. It loads fresh data on
  open and after every action; hit **Refresh** any time to pull the latest.
- **Status-based automation**: whenever a Lead's or Customer's `Stage`
  changes (from the sheet directly, the sidebar, or the web app), an
  `onEdit` trigger fires the rule engine in `AutomationRules.gs`, which
  creates the recommended next to-do — e.g. moving a lead to "Proposal Sent"
  auto-creates "Follow up on the proposal with X" due in 5 days. Every
  auto-created task stores a **Reason** ("chain of thought") explaining why
  it was recommended, shown right under the task in the UI. Duplicate
  open tasks for the same stage are never created twice. A Lead moved to
  "Won" is also automatically copied into the Customers sheet.
- You can also right-click (or use the menu) **"Recommend Task for Selected
  Row"** to manually trigger the same recommendation for whatever row is
  selected, without changing its stage.

## File map

| File | Purpose |
|---|---|
| `appsscript.json` | Project manifest (scopes, web app config) |
| `Code.gs` | Menu, `doGet`, shared config/constants, `getDashboardData` |
| `Utils.gs` | Generic sheet read/write helpers |
| `Setup.gs` | Creates/repairs the 3 sheets, validation, conditional formatting, installs the trigger |
| `AutomationRules.gs` | The stage → recommended task rule tables + reasoning |
| `LeadService.gs` | Lead CRUD + lead → customer conversion |
| `CustomerService.gs` | Customer CRUD |
| `TodoService.gs` | To-do CRUD + manual "recommend task" action |
| `Triggers.gs` | Installable `onEdit` handler that watches the Stage column |
| `Index.html` / `JavaScript.html` / `Stylesheet.html` | Web app dashboard |
| `Sidebar_AddLead.html` / `Sidebar_AddCustomer.html` | Quick-add sidebars inside the Sheet |

## Setup

### Option A — using `clasp` (recommended)

```bash
npm install -g @google/clasp
clasp login
# Create a new, empty Google Sheet first, then bind a script to it:
clasp create --type sheets --title "Lead & Customer Manager" --rootDir ./src
clasp push
```

This creates the Sheet + bound Apps Script project and uploads all files in
`src/`.

### Option B — manual copy/paste

1. Create a new Google Sheet.
2. **Extensions → Apps Script**.
3. Delete the default `Code.gs` content, then create each file listed above
   (matching names exactly, `.gs` for script files, `.html` for HTML files)
   and paste in the contents from `src/`.
4. Open **Project Settings** and paste the contents of `appsscript.json`
   into the manifest (enable "Show `appsscript.json`" first), or manually
   set the equivalent scopes/web app config.

### First run

1. Reload the Sheet. A **"Lead & Customer Manager"** menu appears.
2. Run **Lead & Customer Manager → Set Up / Repair Sheets**. Approve the
   permission prompts (it needs to edit the spreadsheet and manage
   triggers). This creates the `Leads`, `Customers`, `ToDos` tabs with
   headers, dropdown validation, stage color-coding, and installs the
   `onEdit` automation trigger.
3. Try it: add a lead via **Add Lead...** in the menu (or the web app),
   then change its `Stage` cell to `Contacted` — a follow-up task appears
   automatically in `ToDos` with a `Reason` explaining why.

### Deploying the web dashboard

1. In the Apps Script editor: **Deploy → New deployment → Web app**.
2. Execute as **Me**, Access **Anyone with the link** (or restrict to your
   domain/self as preferred).
3. Copy the deployment URL — **Lead & Customer Manager → Open Dashboard**
   in the Sheet's menu will also show it once deployed.

## Customizing the automation rules

Edit the `LEAD_STAGE_RULES` and `CUSTOMER_STAGE_RULES` objects in
`AutomationRules.gs`. Each rule has:

```js
{
  task: 'Follow up on the proposal with {name}', // {name} is replaced with the lead/customer name
  daysOffset: 5,        // due date = today + N days
  priority: 'High',     // High | Medium | Low
  reason: '...'         // shown in the UI as the recommendation's rationale
}
```

Set a stage to `null` (like `Active` for customers) to skip automation for
that stage.
