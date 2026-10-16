747-8F TECH GUIDE · OFFLINE APP

What this folder is
  A complete offline web app. index.html holds the whole guide; sw.js keeps a copy on the
  device so it opens with no connection; manifest.webmanifest and icons/ make it installable.

Host it (once)
  The app must be served over HTTPS for offline install to work. Any static host will do:
  - Cloudflare Pages (recommended): dash.cloudflare.com > Workers & Pages > Create application >
    Pages > Drag and drop your files. Name the project, drop this zip, Deploy site.
    Then lock it: project Settings > General > Enable access policy > Manage > Configure,
    clear the * from Subdomain, save; back in Settings, Enable access policy again.
    Allow only your email; login is a one-time PIN sent to that address.
  - Netlify: drag this folder onto app.netlify.com/drop.
  - GitHub Pages: create a repo, upload the CONTENTS of this folder (index.html at the top
    level), then Settings > Pages > Deploy from a branch > main / (root). The site appears at
    https://<username>.github.io/<repo>/ within a minute or two.
    Note: on Free and Pro plans a Pages site is public on the internet even if the repo is
    private (private repos need Pro). Only GitHub Enterprise Cloud can restrict who sees it.
  The guide is built from company manual content, so keep the address private and put it
  behind access control (for example Cloudflare Access, or Netlify password protection).

Install on the iPad
  1. Open the address in Safari while online.
  2. Share button > Add to Home Screen.
  3. Open it once from the Home Screen while still online, so the fonts are cached too.
  After that it works in flight mode.

Updates
  Cloudflare: project > Create new deployment > Production > drop the new zip.
  Other hosts: upload a new build over the old files. Next time the app is opened online it shows
  "A new version is ready"; tap Reload.

Your progress (reviewed sections, quiz history) is stored on the device only.
Study aid only, not approved data. The AOM governs.
