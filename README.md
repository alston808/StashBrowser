
# StashBrowser

A modern, responsive media browser frontend for Stash (porn video organizer). Built with React, Vite, TypeScript, and Tailwind CSS, featuring a beautiful dark theme and GraphQL integration.

## Features

- 🎬 Browse scenes by studio, performer, and tags
- 🎯 Smart recommendations based on scene tags
- 📱 Responsive design (mobile and desktop)
- 🎨 Beautiful dark theme with gradient effects
- 🔍 Real-time search and filtering
- 📦 Logo: Brown cardboard box icon
- ⚡ Built with modern React and GraphQL

## Prerequisites

- Node.js 18+
- A running Stash server (https://github.com/stashapp/stash)

## Setup

1. **Clone and install dependencies:**
   ```bash
   bun install
   ```

2. **Configure environment variables:**

   Create a `.env.local` file in the root directory:

   ```env
   # Stash GraphQL API URL (default x.alst.site)
   VITE_STASH_GRAPHQL_URL=https://x.alst.site/graphql

   # Stash API Key (found in Stash settings)
   VITE_STASH_API_KEY=your_api_key_here
   ```

3. **Start the development server:**
   ```bash
   bun run dev
   ```

## GraphQL Queries

The app uses the following GraphQL queries located in `src/graphql/`:

- `FindTagsForSearch.gql` - Search tags for filtering
- `FindStudiosForSidebar.gql` - Studio list for sidebar
- `FindPerformersForScroller.gql` - Performer list for horizontal scroller
- `FindRecommendedScenes.gql` - Scene recommendations
- `GetSceneForPlayer.gql` - Individual scene details for player

## Project Structure

```
src/
├── components/          # React components
│   ├── BrowseScreen.tsx # Main browse interface
│   ├── VideoPlayerScreen.tsx # Video player with recommendations
│   ├── EpisodeGrid.tsx  # Scene grid display
│   ├── SearchBar.tsx    # Search and tag filtering
│   └── ui/             # Reusable UI components
├── graphql/            # GraphQL queries and fragments
├── lib/
│   └── apolloClient.ts # Apollo Client setup with auth
└── App.tsx            # Main app component
```

## Development

- Uses Apollo Client for GraphQL queries
- Authenticated image/video URLs with API key
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Vite for fast development

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_STASH_GRAPHQL_URL` | Stash GraphQL endpoint | `https://x.alst.site/graphql` |
| `VITE_STASH_API_KEY` | Stash API key for authentication | Required |

## Building for Production

```bash
npm run build
```

The built files will be in the `build/` directory.
  