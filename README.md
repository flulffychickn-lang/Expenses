# Expenses Tracker v3.0
Simple elderly-friendly daily and monthly expense tracker.

Features:
- No dark theme
- Clear colors and large readable text
- Date, Expense and Amount fields
- Today's Total and Monthly Total
- Monthly Expenses Report table
- Each expense shows its day's total
- Select a month before viewing/exporting
- Self-contained Excel `.xlsx` report export
- Excel report includes selected month, daily totals, every expense, day totals and grand total
- JSON Backup / Import
- Clear all data
- Browser local storage
- GitHub Pages compatible

The Excel exporter is built into the app and does not depend on an online CDN.


Table improvement: the expense report has a fixed-height scroll area with a vertical scrollbar, while the header stays visible when scrolling.


The expense table uses a fixed-height internal scrolling area with a visible vertical scrollbar, so long reports do not expand the page.


The expense table now places Edit and Delete controls directly below each expense name for easier correction on mobile.


### v2.6 changes
- Fixed Select Month alignment by using a contained month dropdown instead of the iPhone native month field.
- Expense Report table now contains Date, Expense, Amount only.
- Added Update Expense dialog for changing Date, Expense, and Amount.
- Added Daily Totals tab with Date and Total for the Day.
- Excel report keeps daily totals in a separate section and expense details without a Day Total column.


### v2.7
- Portrait-first report tables fit Date, Expense, and Amount without horizontal page overflow.
- Report and Daily Totals tables use fixed internal vertical scrolling.
- Added contained custom month dropdowns so the month list stays inside the app/card on mobile.
- Update Expense edits Date, Expense, and Amount.


### v2.9
- Fixed tab navigation initialization so all section buttons remain clickable.
- Rebuilt month picker initialization with null-safe custom controls.
- Kept portrait-friendly internal table scrolling and mobile containment.


### v3.0
- Aligned Update and Delete controls consistently beneath every expense name.
- Added a dedicated action wrapper so buttons remain aligned and do not drift between rows.
- Kept the portrait-friendly table and internal vertical scrolling.
