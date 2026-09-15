import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { WidgetCard } from './WidgetCard';
import { parseConfig } from './config';

const host = document.querySelector('#widget-root');
if (host) {
  createRoot(host).render(
    <StrictMode>
      <WidgetCard config={parseConfig(window.location.search)} />
    </StrictMode>,
  );
}
