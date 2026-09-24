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
- Lazy-loaded images, poster-first video previews, and native inspector video controls
- Purple and turquoise terminal styling, with a pausable Matrix rain effect
- Homepage biography and highlights, with a dedicated Highlights collection
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

Gallery videos display posters without assigning a media source until they enter the viewport. They pause offscreen, when a modal is open, or when visual effects are paused. Reduced-motion and data-saving preferences disable automatic previews; native inspector and viewer controls remain available. Embeds are created only when opened.

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
- The source AVI has no web-ready media file and is excluded from the visible collection until a playable source is provided.
- `loading="lazy"` and `decoding="async"` are already applied to thumbnails.
- There are no third-party libraries or remote font requests.

## Customisation

The main visual system is controlled by CSS variables at the top of `css/style.css`.

The displayed artist name, short bio and links live under `profile` in `js/portfolio-data.js`.
