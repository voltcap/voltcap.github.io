/*
  PORTFOLIO CONTENT
  -----------------
  Put your media inside /assets and edit only this file to add or remove work.

  Recommended image setup:
    thumb: "assets/thumbs/my-piece.webp"  // small, ~1200px wide
    src:   "assets/posters/my-piece.webp" // full display image

  Video options:
    video: "assets/videos/reel.webm"      // small self-hosted file
  OR
    embed: "https://www.youtube-nocookie.com/embed/VIDEO_ID"

  If thumb/src/video are blank, the interface renders a lightweight placeholder.
*/

window.PORTFOLIO = {
  profile: {
    name: "Volt",
    title: "Visual Artist / Designer",
    bio: "A selected archive of posters, illustrations, experiments and moving-image work.",
    email: "",
    links: [
      { label: "GitHub", href: "https://github.com/voltcap" }
    ]
  },

  folders: [
    { id: "all", label: "All Work", path: "~/portfolio", icon: "archive" },
    { id: "posters", label: "Posters", path: "~/portfolio/posters", icon: "folder" },
    { id: "illustrations", label: "Illustrations", path: "~/portfolio/illustrations", icon: "folder" },
    { id: "projects", label: "Projects", path: "~/portfolio/projects", icon: "folder" },
    { id: "videos", label: "Videos", path: "~/portfolio/videos", icon: "folder" }
  ],

  items: [
    {
      id: "poster-001",
      folder: "posters",
      file: "signal-study_01.webp",
      title: "Signal Study 01",
      year: "2026",
      kind: "Poster",
      medium: "Digital / Typography",
      tools: ["Photoshop", "Illustrator"],
      tags: ["poster", "type", "signal", "experimental"],
      description: "A placeholder record showing how a finished poster entry appears inside the archive.",
      thumb: "",
      src: "",
      accent: "linear-gradient(135deg, #ff5d35, #6f2cff 56%, #0f1218)"
    },
    {
      id: "poster-002",
      folder: "posters",
      file: "system-poster_02.webp",
      title: "System Poster 02",
      year: "2026",
      kind: "Poster",
      medium: "Digital / Mixed Media",
      tools: ["Photoshop"],
      tags: ["poster", "texture", "editorial"],
      description: "Use the metadata fields to give each piece context without crowding the gallery itself.",
      thumb: "",
      src: "",
      accent: "linear-gradient(155deg, #c7ff43 0%, #1d2b26 48%, #111319 48%)"
    },
    {
      id: "illustration-001",
      folder: "illustrations",
      file: "creature-study_01.webp",
      title: "Creature Study",
      year: "2026",
      kind: "Illustration",
      medium: "Digital Illustration",
      tools: ["Sketches"],
      tags: ["illustration", "creature", "character"],
      description: "Character and creature illustration can live beside design work while remaining filterable as its own directory.",
      thumb: "",
      src: "",
      accent: "radial-gradient(circle at 68% 30%, #9cecff, transparent 21%), linear-gradient(145deg, #164b5a, #101216 72%)"
    },
    {
      id: "illustration-002",
      folder: "illustrations",
      file: "entity-sheet_02.webp",
      title: "Entity Sheet",
      year: "2025",
      kind: "Illustration",
      medium: "Character Design",
      tools: ["Sketches", "Photoshop"],
      tags: ["illustration", "character", "concept"],
      description: "A second placeholder for character sheets, sketches or polished illustration work.",
      thumb: "",
      src: "",
      accent: "linear-gradient(125deg, #17191f 0 35%, #e8d7b8 35% 66%, #972f3f 66%)"
    },
    {
      id: "project-001",
      folder: "projects",
      file: "atlas-interface.project",
      title: "ATLAS Interface",
      year: "2026",
      kind: "Project",
      medium: "Interface / Data Visualisation",
      tools: ["TypeScript", "UI Design"],
      tags: ["project", "interface", "archive", "data"],
      description: "Projects can combine visual outcomes with technical context, process images and an external project link.",
      thumb: "",
      src: "",
      href: "",
      accent: "linear-gradient(135deg, #08111f, #144d76 55%, #4fd3ff)"
    },
    {
      id: "project-002",
      folder: "projects",
      file: "archive-machine.project",
      title: "Archive Machine",
      year: "2026",
      kind: "Project",
      medium: "Creative Coding",
      tools: ["JavaScript", "CSS"],
      tags: ["project", "code", "interactive"],
      description: "The interface treats technical work as a first-class portfolio object instead of separating art and code.",
      thumb: "",
      src: "",
      href: "",
      accent: "repeating-linear-gradient(90deg, #0c0f12 0 18px, #171e26 18px 19px), linear-gradient(#23e0a4,#23e0a4)"
    },
    {
      id: "video-001",
      folder: "videos",
      file: "motion-study_01.webm",
      title: "Motion Study 01",
      year: "2026",
      kind: "Video",
      medium: "Motion / Editing",
      tools: ["After Effects"],
      tags: ["video", "motion", "edit"],
      description: "Video players are only created when opened, keeping the initial page lightweight.",
      thumb: "",
      video: "",
      embed: "",
      accent: "linear-gradient(145deg, #280c3f, #ee3ca7 52%, #ffb236)"
    }
  ]
};
