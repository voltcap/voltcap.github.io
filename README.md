# Volt — Visual Archive

A lightweight, file-explorer-style art portfolio built for GitHub Pages.

## Features

- Folder-style navigation for Ads, Posters, Illustrations, Stable Diffusion and Videos
- Grid and list views
- Inspector panel with artwork metadata
- Full-screen media viewer
- `Ctrl/⌘ + K` command-palette search
- Dark/light themes stored locally in the browser
- Hash-based folder URLs (`#/posters`, `#/videos`, etc.)
- Lazy-loaded images and video players that are created only when opened
- Responsive mobile layout
- No framework, package manager, build step, external font or JavaScript dependency
- Reduced-motion support

## Add your work

### 1. Put files in `/assets`

Suggested structure:

```text
assets/
├── ads/
├── posters/
├── illustrations/
├── stable-diffusion/
├── videos/
└── thumbs/
```

For fast image loading, export a smaller WebP thumbnail into `assets/thumbs/` and keep the higher-quality display copy in its category folder.

### 2. Edit `js/portfolio-data.js`

Each item is a small metadata object. Example:

```js
{
  id: "poster-my-piece",
  folder: "posters",
  file: "my-piece.webp",
  title: "My Piece",
  year: "2026",
  kind: "Poster",
  medium: "Digital / Typography",
  tools: ["Photoshop", "Illustrator"],
  tags: ["poster", "typography"],
  description: "A short explanation of the piece.",
  thumb: "assets/thumbs/my-piece.webp",
  src: "assets/posters/my-piece.webp",
  accent: "linear-gradient(135deg, #333, #111)"
}
```

### Videos

For small video files:

```js
video: "assets/videos/reel.webm"
```

For larger videos, use a lazy-loaded embed instead of committing huge media files to GitHub:

```js
embed: "https://www.youtube-nocookie.com/embed/VIDEO_ID"
```

The iframe/video element is not created until the viewer is opened, so videos do not slow initial page load.

## Publish with GitHub Pages

1. Create a GitHub repository, for example `art-portfolio`.
2. Upload this project to the repository root.
3. In the repository, open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder.
6. Save.

GitHub will provide the public Pages address after deployment.

## Performance notes

- Prefer WebP or AVIF for artwork thumbnails.
- Keep thumbnails around 100–250 KB when practical.
- Do not put large uncompressed videos directly in the repository.
- GitHub blocks individual files over 100 MB. The imported `assets/videos/2022-03-05-2-1.avi` should be compressed or hosted externally before pushing to GitHub.
- `loading="lazy"` and `decoding="async"` are already applied to thumbnails.
- There are no third-party libraries or remote font requests.

## Customisation

The main visual system is controlled by CSS variables at the top of `css/style.css`.

The displayed artist name, short bio and links live under `profile` in `js/portfolio-data.js`.
