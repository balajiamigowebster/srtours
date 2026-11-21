import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function Item({ item, close }) {
  if (typeof item === 'string')
    return <li><NavLink to={`/${slug(item)}`} onClick={close}>{item}</NavLink></li>;
  const link = (
    <NavLink to={item.to} onClick={close} end={item.to === '/'}>
      {item.label} {item.children && <i className="fa-solid fa-chevron-down" />}
    </NavLink>
  );
  if (!item.children) return <li>{link}</li>;
  return (
    <li className="has-sub">
      {link}
      <ul className="sub">
        {item.children.map((c) => <Item key={c.label || c} item={c} close={close} />)}
      </ul>
    </li>
  );
}

export default function Header({ site }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="srt-header">
      <Link to="/" className="brand" onClick={close}>
        <img src="/images/logo.jpeg" alt="SR Tours and Travels" />
      </Link>
      <div className="head-right">
        <a className="head-phone" href={`tel:+91${site.phone[0]}`}>
          +91 – {site.phone[0]} / {site.phone[1]}
        </a>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">
          <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`} />
        </button>
        <ul className={`menu ${open ? 'open' : ''}`}>
          {site.menu.map((m) => <Item key={m.label} item={m} close={close} />)}
        </ul>
      </div>
    </header>
  );
}
