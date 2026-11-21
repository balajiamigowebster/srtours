import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function Item({ item, close }) {
  const [subOpen, setSubOpen] = useState(false);

  if (typeof item === 'string') {
    return (
      <li>
        <NavLink to={`/${slug(item)}`} onClick={close}>{item}</NavLink>
      </li>
    );
  }

  if (!item.children) {
    return (
      <li>
        <NavLink to={item.to} onClick={close} end={item.to === '/'}>
          {item.label}
        </NavLink>
      </li>
    );
  }

  return (
    <li className={`has-sub ${subOpen ? 'sub-open' : ''}`}>
      <div className="sub-row">
        <NavLink to={item.to} onClick={close} end={item.to === '/'}>
          {item.label} <i className="fa-solid fa-chevron-down desktop-caret" />
        </NavLink>
        <button
          type="button"
          className="sub-toggle"
          onClick={() => setSubOpen((v) => !v)}
          aria-expanded={subOpen}
          aria-label={`Toggle ${item.label}`}
        >
          <i className={`fa-solid fa-chevron-down ${subOpen ? 'rot' : ''}`} />
        </button>
      </div>
      <ul className="sub">
        {item.children.map((c) => (
          <Item key={c.label || c} item={c} close={close} />
        ))}
      </ul>
    </li>
  );
}

export default function Header({ site }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className={`srt-header-wrap ${open ? 'menu-open' : ''}`}>
      <div className="mobile-phone-bar">
        <a href={`tel:+91${site.phone[0]}`}>
          <i className="fa-solid fa-phone" /> +91 – {site.phone[0]} / {site.phone[1]}
        </a>
      </div>
      <div className="srt-header">
        <Link to="/" className="brand" onClick={close}>
          <img src="/images/logo.jpeg" alt="SR Tours and Travels" />
        </Link>
        <div className="head-right">
          <a className="head-phone" href={`tel:+91${site.phone[0]}`}>
            <i className="fa-solid fa-phone" /> +91 – {site.phone[0]} / {site.phone[1]}
          </a>
          <button
            type="button"
            className="burger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle Menu"
          >
            <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
          <ul className={`menu ${open ? 'open' : ''}`}>
            {site.menu.map((m) => (
              <Item key={m.label} item={m} close={close} />
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
