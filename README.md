# Pawn Launcher website

This repository is a static GitHub Pages site. The files in the repository root
are the published site:

- `index.html` - page markup
- `style.css` - styles
- `script.js` - interactions
- `pawn.png`, `1.jpg`, `2.jpg`, `3.jpg`, `new.jpg` - site assets
- `PawnLauncher_Setup.exe` - Windows download

## GitHub Pages setup

1. Keep `index.html`, `style.css`, `script.js`, the image files, and
   `PawnLauncher_Setup.exe` in the same published folder.
2. In **Settings > Pages**, select **Deploy from a branch**, the required
   branch, and the `/ (root)` folder.
3. Do not select the `uploads` folder as the Pages source. It is an old
   duplicate copy and does not contain the installer.
4. If a custom domain is used, configure the domain in **Settings > Pages**.
   GitHub will create/update `CNAME`; DNS records at Namecheap must point to
   GitHub Pages as described in GitHub's custom-domain instructions.

The download link is relative (`./PawnLauncher_Setup.exe`), so it works on both
a custom domain and a repository Pages URL. GitHub Pages can serve this
18 MB installer; GitHub's per-file limit is 100 MB. If the installer grows
past that limit, publish it as a GitHub Release asset and replace the link
with the release download URL.
