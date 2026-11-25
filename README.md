# Framelet

A headless, Instagram-inspired image editor. Framework-agnostic core plus thin adapters for React, Solid.js, Angular, and more.

## Packages

- `@framelet/core` — framework-agnostic engine
- `@framelet/react` — React hook (`useFramelet`), prop getters, and compound parts
- `@framelet/solid` — Solid bindings
- `@framelet/angular` — Angular bindings

## Install

```bash
npm install @framelet/react
```

## Quick start (React)

```tsx
import { Framelet } from '@framelet/react';

export default function App() {
  return (
    <Framelet.Root width={640} height={480}>
      <Framelet.Viewport>
        <Framelet.Canvas />
        <Framelet.EmptyState>Drop an image</Framelet.EmptyState>
      </Framelet.Viewport>
      <Framelet.Controls>
        <Framelet.FileInput />
        <Framelet.UploadTrigger />
        <Framelet.RotateTrigger />
      </Framelet.Controls>
    </Framelet.Root>
  );
}
```

A full preset editor is composed in `apps/demo`. For a fully custom UI, use the hook directly:

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
