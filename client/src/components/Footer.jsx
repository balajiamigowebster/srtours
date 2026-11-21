import React, { useEffect, useState } from 'react';
import { Html, ensureCss } from '../pages/Page.jsx';

export default function Footer({ layout }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    ensureCss(layout.css).then(() => setReady(true));
  }, [layout]);
  if (!ready) return null;
  return <Html html={layout.footerHtml} className="orig-footer" />;
}
