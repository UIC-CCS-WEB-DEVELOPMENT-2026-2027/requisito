# Local admin runbook

The admin workspace is for local maintenance only. It is not a public
account-registration service and the API must not be exposed to the Internet.
Use Node with built-in `node:sqlite` support and npm.

## One-time setup

1. Install the dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` using your editor. Replace the
   `SESSION_SECRET` placeholder with a unique random value containing at least
   32 characters. Keep `.env` private; do not use a `VITE_` variable.
3. Import the current JSON catalogs into the local database:

   ```sh
   npm run db:import
   ```

   The import adds missing rows but does not overwrite existing database
   records or review state.
4. Create the first admin interactively:

   ```sh
   npm run admin:create
   ```

   The terminal prompts for a username and a confirmed password without
   echoing password input. No account is created automatically. Later
   `admin:create` runs require an existing active admin to confirm the account
   addition.

## Start and sign in

Run these commands in separate terminals from the project directory:

```sh
npm run api:dev
```

```sh
npm run dev
```

Open the Vite URL and visit `/admin`. The API binds to `127.0.0.1:8787`; Vite
proxies `/api` to it. The configured `APP_ORIGIN` must match the frontend
origin. Stop both processes with the normal terminal interrupt after use.

## Edit and verify records

1. A reviewer opens a record and compares the exact fields against its official
   source.
2. The reviewer saves corrections with a concise note. Population changes
   additionally require an allowlisted HTTPS source and a note.
3. The reviewer submits a verification request with the source access date and
   an exact comparison note.
4. A different reviewer or admin independently checks the request and chooses
   approve or reject and records a substantive decision note describing the
   evidence checked and the reason for the decision. The decision note is
   stored separately from the submitter's comparison note. The server rejects
   either decision when the authenticated account submitted the request,
   including direct API calls. Account separation alone does not prove that
   two accounts belong to different people; the admin/coordinator must
   designate and track distinct real reviewers outside the application.
5. If the record changes while a request is pending, the request is cancelled
   and must be resubmitted against the new record contents.

Approved changes affect only the local database. They do not change checked-in
JSON files and do not deploy the public site.

## Export reviewed records

After reviewing the approved changes, explicitly run:

```sh
npm run db:export
npm run check
```

The exporter stages catalog JSON, copies the goals file for audit context,
runs the read-only project data audit, and only then replaces catalog files.
It refuses a failed audit or a catalog record missing from the database. It
does not deploy or commit anything. Inspect the JSON changes and preserve the
unverified status of any record without an approved two-person review.

`npm run db:import` can be rerun to add records newly present in JSON, but it
will not overwrite local records. The database is located at
`.local/requisito-admin.sqlite` by default and should be handled as private
data. See [security notes](security-notes.md) for controls and limitations.
