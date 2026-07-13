# Knowledge Storage

Drop new module folders under `modules/` and include:

- `metadata.json`
- `notes.json`
- `questions.json`
- `flashcards.json`
- `interview.json`
- `revision.json`

Optional:

- `topics.json` (if missing, topics are derived from question payloads)

The repository and services auto-discover module folders using dynamic imports.
Adding a new module requires JSON files only, with no React component changes.
