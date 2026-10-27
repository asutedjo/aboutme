===============================================================================
PRIVATE CONTENT EDITING GUIDE (DO NOT UPLOAD THIS FILE TO PUBLIC GITHUB REPO)
Dr. Armanto Sutedjo — Academic Digital Portfolio
===============================================================================

All visible file-location hints and editing buttons have been completely removed
from your public webpages so search committees only see a clean, polished academic
portfolio.

Keep this text file on your personal computer for reference whenever you want to
update your website text!

-------------------------------------------------------------------------------
1. WHERE TO EDIT PARAGRAPHS & STATEMENTS (Plain-Text .md Files)
-------------------------------------------------------------------------------
All narrative paragraphs live inside the `content/` folder:

* Overview / Landing Page Bio (`index.html`):
  -> Edit file: content/overview.md

* Research Statement (`research.html`):
  -> Edit file: content/research.md
  -> Use `## Section Heading` for subheadings and leave a blank line between paragraphs.

* Teaching Philosophy Tabs (`teaching.html`):
  -> Edit file: content/teaching.md
  -> Every line starting with `## ` automatically creates a Tab on `teaching.html`!
  -> Current Tabs in `content/teaching.md`:
     - ## Future Readiness
     - ## Responsible Practice
     - ## Authentic Learning
     - ## Collaborative Practice
     - ## Mentoring for Growth
  -> The final tab ("Courses Taught") is automatically appended after your last
     `## ` section and pulls its course cards from `content/portfolio-data.json`.

* Faculty Development & Service Narrative (`service.html`):
  -> Edit file: content/service.md

-------------------------------------------------------------------------------
2. WHERE TO EDIT COURSES TAUGHT, GRANTS, PUBLICATIONS & DEGREES
-------------------------------------------------------------------------------
All structured lists and tables live inside:
  -> Edit file: content/portfolio-data.json

* `"education"`: Updates the Academic Preparation table on `index.html`.
* `"grants"`: Updates the Funded Grants table on `research.html`.
* `"publications"`: Updates the filterable Publications list on `publications.html`.
  - Valid `"category"` values: `"journal"`, `"conference"`, or `"review"`.
* `"courses"`: Updates the "Courses Taught" tab on `teaching.html`.
  - Both LDTC 621 and LDTC 642 are set to `"level": "Graduate Course Level"`.
* `"service"`: Updates the Journal Reviewer, Conference Reviewer, and University
  Committees lists on `service.html`.

-------------------------------------------------------------------------------
3. HOW TO UPDATE ON GITHUB
-------------------------------------------------------------------------------
1. Log into GitHub (only you can edit your repository) and open the `content/` folder.
2. Click the file you want to update (e.g., `content/teaching.md` or `content/portfolio-data.json`).
3. Click the Pencil icon ("Edit this file") in the top right.
4. Make your text edits and click the green "Commit changes..." button.
5. GitHub Pages will automatically refresh your live site within 30–60 seconds.
