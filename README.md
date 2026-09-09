# Expenses Tracker v2.5
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


Mobile alignment: form inputs, especially the native Date field, are constrained to the card width to prevent horizontal page overflow on iPhone/Safari.
