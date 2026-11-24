# Framelet

A headless, Instagram-inspired image editor. Framework-agnostic core plus thin adapters for React, Solid.js, Angular, and more.

## Packages

- `@framelet/core` — framework-agnostic engine
- `@framelet/react` — React hook (`useFramelet`) and component
- `@framelet/solid` — Solid bindings
- `@framelet/angular` — Angular bindings

## Install

```bash
npm install @framelet/react
```

## Quick start (React)

```tsx
import { FrameletEditor } from '@framelet/react';

export default function App() {
  return <FrameletEditor width={640} height={480} />;
}
```

Or use the hook for a fully custom UI:

```tsx
import { useFramelet } from '@framelet/react';

function MyEditor() {
  const { state, loadImage, setFilter, undo, redo } = useFramelet();
  return <button onClick={() => loadImage('/photo.jpg')}>Load</button>;
}
```

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

## License

MIT
