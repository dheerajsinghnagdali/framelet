import React from 'react';
import { createRoot } from 'react-dom/client';
import { FrameletEditor } from './FrameletEditor';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <div className="app">
      <header className="app__header">
        <h1>Framelet Demo</h1>
        <p>Headless image editor — composed with Framelet parts</p>
      </header>
      <main className="app__main">
        <FrameletEditor width={720} height={480} className="editor" />
      </main>
    </div>
  </React.StrictMode>,
);
