/* Bblist — interactive registry island (ported from the Claude Design handoff).
   Hero (secret name + countdown + guess game), editorial gift grid with
   category illustrations / real photos, filters, reserve flow (modal + toast +
   confetti). Reserve state is client-side (localStorage); the site is static. */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react';
import {
  CATEGORIES,
  CATEGORY_ORDER,
  catFor,
  type ArtKey,
} from '../sanity/categories';

/* ------------------------------------------------------------------ data */

export type RegistryGift = {
  id: string;
  title: string;
  category: string;
  price: number | null;
  description?: string;
  notes?: string;
  url: string;
  status: string;
  imageUrl?: string | null;
};

const PRICE_BANDS: { id: string; label: string; test: (p: number) => boolean }[] = [
  { id: 'all', label: 'Tots els preus', test: () => true },
  { id: 'low', label: 'Fins a 25€', test: (p) => p <= 25 },
  { id: 'mid', label: '25–75€', test: (p) => p > 25 && p <= 75 },
  { id: 'high', label: 'Més de 75€', test: (p) => p > 75 },
];

const AVAIL = [
  { id: 'all', label: 'Tot' },
  { id: 'available', label: 'Disponibles' },
  { id: 'reserved', label: 'Ja triats' },
];

/* ------------------------------------------------- category illustrations */

function CategoryArt({ art, ink, style }: { art: ArtKey; ink: string; style?: CSSProperties }) {
  const s: CSSProperties = { width: '100%', height: '100%', display: 'block', ...style };
  const stroke = {
    fill: 'none', stroke: ink, strokeWidth: 3.4,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  const soft = { fill: ink, opacity: 0.12 };

  const arts: Record<ArtKey, ReactElement> = {
    body: (
      <g>
        <path {...soft} d="M24 14h16l8 7-6 8-4-3v24a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V26l-4 3-6-8z" />
        <path {...stroke} d="M24 14h16l8 7-6 8-4-3v24a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V26l-4 3-6-8z" />
        <path {...stroke} d="M27 14c0 3 2 5 5 5s5-2 5-5" />
        <path {...stroke} d="M28 50h8" />
      </g>
    ),
    toy: (
      <g>
        <circle {...soft} cx="26" cy="24" r="13" />
        <circle {...stroke} cx="26" cy="24" r="13" />
        <circle {...stroke} cx="26" cy="24" r="4" />
        <path {...stroke} d="M33 33l9 12a4 4 0 0 1-6 5 4 4 0 0 1-1-5" />
        <path {...stroke} d="M22 11l1-4M31 12l3-3M16 18l-4-1" />
      </g>
    ),
    book: (
      <g>
        <path {...soft} d="M12 16c6-3 14-3 20 1 6-4 14-4 20-1v32c-6-3-14-3-20 1-6-4-14-4-20-1z" />
        <path {...stroke} d="M12 16c6-3 14-3 20 1 6-4 14-4 20-1v32c-6-3-14-3-20 1-6-4-14-4-20-1z" />
        <path {...stroke} d="M32 18v32" />
      </g>
    ),
    crib: (
      <g>
        <path {...soft} d="M12 28h40v18H12z" />
        <path {...stroke} d="M12 22v26M52 22v26M12 30h40M12 46h40" />
        <path {...stroke} d="M22 30v16M32 30v16M42 30v16" />
        <path {...stroke} d="M12 24c8-6 32-6 40 0" />
      </g>
    ),
    bath: (
      <g>
        <path {...soft} d="M14 34h36c0 9-8 14-18 14S14 43 14 34z" />
        <path {...stroke} d="M12 34h40c0 10-9 15-20 15S12 44 12 34z" />
        <circle {...stroke} cx="30" cy="24" r="8" />
        <path {...stroke} d="M38 24h7l-4 4" />
        <circle cx="28" cy="23" r="1.8" fill={ink} />
        <path {...stroke} d="M18 16c0 3 2 5 4 6M26 14c0 3 1 4 3 5" />
      </g>
    ),
    bottle: (
      <g>
        <path {...soft} d="M24 24h16v24a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" />
        <path {...stroke} d="M24 24h16v24a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" />
        <path {...stroke} d="M26 18h12v6H26zM28 12h8v6h-8z" />
        <path {...stroke} d="M24 36h16M24 44h16" />
      </g>
    ),
    star: (
      <g>
        <path {...soft} d="M32 12l6 13 14 1-11 9 4 14-13-8-13 8 4-14-11-9 14-1z" />
        <path {...stroke} d="M32 12l6 13 14 1-11 9 4 14-13-8-13 8 4-14-11-9 14-1z" />
      </g>
    ),
  };

  return (
    <svg viewBox="0 0 64 64" style={s} aria-hidden="true">
      {arts[art] ?? arts.star}
    </svg>
  );
}

/* --------------------------------------------------------------- catalog */

type Filters = { cat: string; price: string; avail: string };
type Reservation = { name: string; mine: boolean };

function Toolbar({
  filters, setFilters, counts,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  counts: { total: number };
}) {
  const setCat = (id: string) => setFilters((f) => ({ ...f, cat: id }));
  return (
    <div className="toolbar">
      <div className="tb-cats">
        <button
          className={'chip' + (filters.cat === 'all' ? ' is-active' : '')}
          onClick={() => setCat('all')}
        >
          Tot <span className="chip-n">{counts.total}</span>
        </button>
        {CATEGORY_ORDER.map((id) => {
          const c = CATEGORIES[id];
          const active = filters.cat === id;
          return (
            <button
              key={id}
              className={'chip' + (active ? ' is-active' : '')}
              onClick={() => setCat(id)}
              style={active ? { background: c.accent, color: c.ink, borderColor: c.accent } : undefined}
            >
              <span className="chip-dot" style={{ background: c.accent }} />
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="tb-row">
        <div className="seg">
          {AVAIL.map((a) => (
            <button
              key={a.id}
              className={'seg-btn' + (filters.avail === a.id ? ' is-active' : '')}
              onClick={() => setFilters((f) => ({ ...f, avail: a.id }))}
            >{a.label}</button>
          ))}
        </div>
        <div className="seg">
          {PRICE_BANDS.map((b) => (
            <button
              key={b.id}
              className={'seg-btn' + (filters.price === b.id ? ' is-active' : '')}
              onClick={() => setFilters((f) => ({ ...f, price: b.id }))}
            >{b.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GiftCard({
  gift, reserved, onReserve, onRelease,
}: {
  gift: RegistryGift;
  reserved: Reservation | null;
  onReserve: (g: RegistryGift) => void;
  onRelease: (g: RegistryGift) => void;
}) {
  const c = catFor(gift.category);
  const taken = gift.status === 'purchased' || !!reserved;
  const mine = !!reserved && reserved.mine;

  return (
    <article className={'card' + (taken ? ' card--taken' : '')}>
      <div className="card-art" style={{ background: gift.imageUrl ? 'var(--white)' : c.accent }}>
        {gift.imageUrl
          ? <img className="card-photo" src={gift.imageUrl} alt={gift.title} loading="lazy" decoding="async" />
          : <CategoryArt art={c.art} ink={c.ink} />}
        <span className="card-cat" style={{ color: c.ink }}>{c.label}</span>
        {taken && <span className="card-flag">{mine ? 'L’has agafat tu' : 'Ja triat'}</span>}
      </div>
      <div className="card-body">
        <div className="card-head">
          <h3 className="card-title">{gift.title}</h3>
          {gift.price != null && <span className="card-price">{gift.price}€</span>}
        </div>
        {gift.description && <p className="card-desc">{gift.description}</p>}
        {gift.notes && (
          <p className="card-notes"><span className="card-notes-k">Preferència:</span> {gift.notes}</p>
        )}
        <div className="card-actions">
          {!taken && (
            <>
              <button className="btn btn-primary" onClick={() => onReserve(gift)}>L’agafo jo</button>
              <a className="btn btn-ghost" href={gift.url} target="_blank" rel="noreferrer">Veure</a>
            </>
          )}
          {taken && mine && (
            <button className="btn btn-soft" onClick={() => onRelease(gift)}>Alliberar-lo</button>
          )}
          {taken && !mine && (
            <span className="taken-note">Algú ja se’n cuida</span>
          )}
        </div>
      </div>
    </article>
  );
}

function ReserveModal({
  gift, busy, onConfirm, onClose,
}: {
  gift: RegistryGift | null;
  busy: boolean;
  onConfirm: (g: RegistryGift, name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  useEffect(() => {
    setName('');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gift]);
  if (!gift) return null;
  const c = catFor(gift.category);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-art" style={{ background: c.accent }}>
          <CategoryArt art={c.art} ink={c.ink} style={{ width: 60, height: 60 }} />
        </div>
        <h3 className="modal-title">L’agafes tu?</h3>
        <p className="modal-text">
          Marcarem <strong>{gift.title}</strong> com a triat perquè ningú més el compri.
          Deixa el teu nom si vols que sapiguem qui ha estat.
        </p>
        <input
          className="modal-input"
          placeholder="El teu nom (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          maxLength={32}
        />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Ara no</button>
          <button className="btn btn-primary" onClick={() => onConfirm(gift, name.trim())} disabled={busy}>
            {busy ? 'Un moment…' : 'Sí, l’agafo'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return <div className="toast" role="status">{msg}</div>;
}

/* ------------------------------------------------------------- confetti */

function fireConfetti() {
  const colors = ['#F2C14E', '#9DC074', '#EF9F73', '#8DB7DA', '#93D2BD', '#EF8F97', '#BD9EE0'];
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  document.body.appendChild(layer);
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('span');
    p.className = 'confetti-bit';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.25 + 's';
    p.style.animationDuration = 1.6 + Math.random() * 1.2 + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    if (i % 3 === 0) p.style.borderRadius = '50%';
    layer.appendChild(p);
  }
  setTimeout(() => layer.remove(), 3200);
}

/* ------------------------------------------------------------------ app */

export default function Registry({ gifts }: { gifts: RegistryGift[] }) {
  // Live shared reservations (everyone's), keyed by gift id → reserver name.
  // Empty on the server and first client render (so hydration matches), then
  // fetched from the same-origin API after mount.
  const [reserved, setReserved] = useState<Record<string, { name?: string }>>({});
  // Which reservations THIS browser made, so it can release them: gift id →
  // reservation document id. Persisted in localStorage, loaded after mount.
  const [mine, setMine] = useState<Record<string, string>>({});

  const loadReserved = useCallback(async () => {
    try {
      const res = await fetch('/api/reservations');
      const { result } = (await res.json()) as {
        result: { _id: string; giftId: string; name?: string }[];
      };
      const map: Record<string, { name?: string }> = {};
      for (const r of result) map[r.giftId] = { name: r.name };
      setReserved(map);
    } catch {
      /* offline / read failed — everything just shows as available */
    }
  }, []);

  useEffect(() => {
    try { setMine(JSON.parse(localStorage.getItem('bblist_mine') || '{}')); }
    catch { /* ignore */ }
    loadReserved();
  }, [loadReserved]);

  const persistMine = (next: Record<string, string>) => {
    setMine(next);
    localStorage.setItem('bblist_mine', JSON.stringify(next));
  };

  const [filters, setFilters] = useState<Filters>({ cat: 'all', price: 'all', avail: 'all' });
  const [modalGift, setModalGift] = useState<RegistryGift | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  };

  const isTaken = (g: RegistryGift) => g.status === 'purchased' || !!reserved[g.id];
  const resInfo = (g: RegistryGift): Reservation | null => {
    if (g.status === 'purchased') return { name: 'la família', mine: false };
    const r = reserved[g.id];
    if (!r) return null;
    return { name: r.name ?? '', mine: !!mine[g.id] };
  };

  const onReserve = (g: RegistryGift) => setModalGift(g);

  const onConfirm = async (g: RegistryGift, name: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ giftId: g.id, giftTitle: g.title, name }),
      });
      if (res.status === 409) {
        setReserved((prev) => ({ ...prev, [g.id]: prev[g.id] ?? {} }));
        setModalGift(null);
        flash('Ai! Algú s’acaba d’avançar amb aquest regal.');
        return;
      }
      if (!res.ok) throw new Error('reserve failed');
      const data = (await res.json()) as { id: string; name: string };
      setReserved((prev) => ({ ...prev, [g.id]: { name: data.name } }));
      persistMine({ ...mine, [g.id]: data.id });
      setModalGift(null);
      flash(`Genial! Has agafat «${g.title}». Gràcies de tot cor.`);
      fireConfetti();
    } catch {
      flash('No s’ha pogut desar. Torna-ho a provar en un moment.');
    } finally {
      setBusy(false);
    }
  };

  const onRelease = async (g: RegistryGift) => {
    const id = mine[g.id];
    if (!id) return;
    setBusy(true);
    try {
      const res = await fetch('/api/release', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('release failed');
      setReserved((prev) => {
        const next = { ...prev };
        delete next[g.id];
        return next;
      });
      const nextMine = { ...mine };
      delete nextMine[g.id];
      persistMine(nextMine);
      flash('Fet, torna a estar disponible.');
    } catch {
      flash('No s’ha pogut alliberar. Torna-ho a provar.');
    } finally {
      setBusy(false);
    }
  };

  const counts = { total: gifts.length };

  const band = PRICE_BANDS.find((b) => b.id === filters.price)!;
  const filtered = gifts.filter((g) => {
    if (filters.cat !== 'all' && g.category !== filters.cat) return false;
    if (!band.test(g.price ?? 0)) return false;
    if (filters.avail === 'available' && isTaken(g)) return false;
    if (filters.avail === 'reserved' && !isTaken(g)) return false;
    return true;
  });

  return (
    <div className="page">
      <main className="catalog">
        <div className="catalog-head">
          <div>
            <span className="kicker">La llista</span>
            <h2 className="catalog-title">Coses que ens farien feliços</h2>
          </div>
        </div>

        <Toolbar filters={filters} setFilters={setFilters} counts={counts} />

        {filtered.length === 0 ? (
          <div className="empty">No hi ha res en aquest filtre ara mateix. Prova un altre.</div>
        ) : (
          <div className="grid">
            {filtered.map((g) => (
              <GiftCard
                key={g.id}
                gift={g}
                reserved={resInfo(g)}
                onReserve={onReserve}
                onRelease={onRelease}
              />
            ))}
          </div>
        )}

        <footer className="foot">
          <div className="foot-mark">bb<span>list</span></div>
        </footer>
      </main>

      <ReserveModal gift={modalGift} busy={busy} onConfirm={onConfirm} onClose={() => setModalGift(null)} />
      <Toast msg={toast} />
    </div>
  );
}
