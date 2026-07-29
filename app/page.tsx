"use client";

import { useEffect, useState } from "react";
import type { FormEvent, MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type View = "Home" | "About" | "Teams" | "Join Tru" | "Scrims" | "My Team" | "Socials" | "Rankings";

const rosters = {
  tru: ["Kyo", "Mira", "Raven", "Sage", "Flux"],
  nova: ["Astra", "Yoru", "Vex", "Lumi", "Kiro"],
};

const scrims = [
  { team: "Nova Core", tag: "NOVA", elo: 1648, region: "SEA", format: "BO3", time: "Today · 9:30 PM", rank: "Immortal+", open: true },
  { team: "Apex Five", tag: "APX", elo: 1512, region: "PH", format: "BO3", time: "Today · 10:00 PM", rank: "Ascendant+", open: true },
  { team: "Crimson Tide", tag: "CR", elo: 1420, region: "SEA", format: "BO1", time: "Tomorrow · 8:00 PM", rank: "Diamond+", open: false },
  { team: "Orbit Black", tag: "OB", elo: 1761, region: "SG", format: "BO3", time: "Tomorrow · 9:00 PM", rank: "Immortal+", open: true },
];

const initialPosts = [
  { id: 1, name: "Aya Reyes", handle: "@ayaclutch", initials: "AR", time: "18m", text: "Looking for two players for tonight’s scrim. Duelist and controller preferred.", comments: 12, likes: 24, tag: "LFT" },
  { id: 2, name: "Jin Lozano", handle: "@jinlocks", initials: "JL", time: "42m", text: "GGs to Nova Core. That final Ascent round was too close. Match recap is up!", comments: 8, likes: 47, tag: "MATCH" },
  { id: 3, name: "Mina Cruz", handle: "@minacruz", initials: "MC", time: "1h", text: "New to competitive mobile. Looking for a friendly team that practices on weekends.", comments: 15, likes: 31, tag: "LFT" },
];

const leaderboard = [
  { rank: 1, team: "Velocity", tag: "VLT", elo: 1842, record: "32–8", streak: 12, movement: "—" },
  { rank: 2, team: "Orbit Black", tag: "OB", elo: 1761, record: "28–11", streak: 6, movement: "▲ 1" },
  { rank: 3, team: "Tru Phantoms", tag: "TRU", elo: 1724, record: "26–10", streak: 4, movement: "▲ 2" },
  { rank: 4, team: "Nova Core", tag: "NOVA", elo: 1648, record: "24–14", streak: 2, movement: "▼ 2" },
  { rank: 5, team: "Apex Five", tag: "APX", elo: 1512, record: "19–13", streak: 3, movement: "▲ 1" },
  { rank: 6, team: "Crimson Tide", tag: "CR", elo: 1420, record: "17–15", streak: 1, movement: "▼ 1" },
];

function TruMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`tru-mark ${compact ? "tru-mark--compact" : ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/tru-logo.png" alt="" />
    </span>
  );
}

function Avatar({ initials, className = "", imageUrl }: { initials: string; className?: string; imageUrl?: string | null }) {
  return <span className={`avatar ${className}`}>{imageUrl ? <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={imageUrl} alt="" />
  </> : initials}<i /></span>;
}

function TeamBadge({ tag, tru = false, imageUrl }: { tag: string; tru?: boolean; imageUrl?: string | null }) {
  if (imageUrl) return <span className="team-badge team-badge--image">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={imageUrl} alt="" />
  </span>;
  return tru ? <TruMark compact /> : <span className="team-badge">{tag.slice(0, 2)}</span>;
}

function PlayerRow({ name, side }: { name: string; side: "tru" | "nova" }) {
  return (
    <div className="player-row">
      <span className={`team-glyph team-glyph--${side}`}>{side === "tru" ? "T" : "N"}</span>
      <span>{name}</span>
      <span className="online-dot" aria-label="Online" />
    </div>
  );
}

function Header({
  view,
  onView,
  onAuth,
  loggedIn,
  onLogout,
  displayName,
  teamName,
  avatarUrl,
}: {
  view: View;
  onView: (view: View) => void;
  onAuth: (mode: "login" | "join") => void;
  loggedIn: boolean;
  onLogout: () => void;
  displayName: string;
  teamName: string;
  avatarUrl: string | null;
}) {
  const navItems: View[] = loggedIn
    ? ["Home", "Scrims", "My Team", "Socials", "Rankings"]
    : ["Home", "Scrims", "Socials", "Rankings"];

  return (
    <header className="landing-header app-landing-header">
      <button className="landing-logo" onClick={() => onView("Home")} aria-label="Tru home">
        <TruMark />
      </button>

      <nav aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            className={view === item ? "active" : ""}
            key={item}
            onClick={() => onView(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="app-header-auth">
        {loggedIn ? (
          <div className="signed-account">
            <button className="account-profile" onClick={() => onView("My Team")}>
              <Avatar initials={displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "TR"} imageUrl={avatarUrl} />
              <span><strong>{displayName}</strong><small>{teamName}</small></span>
            </button>
            <button className="logout-button" onClick={onLogout} aria-label="Log out" title="Log out">↗</button>
          </div>
        ) : (
          <>
            <button className="app-header-login" onClick={() => onAuth("login")}>Log in</button>
            <button className="enter-socials app-header-join" onClick={() => onAuth("join")}>Join Tru <span>›</span></button>
          </>
        )}
      </div>
    </header>
  );
}

function LandingHeader({
  active = "Home",
  onView,
  onEnter,
}: {
  active?: "Home" | "About" | "Teams" | "Join Tru";
  onView: (view: View) => void;
  onEnter: () => void;
}) {
  function goTo(event: MouseEvent<HTMLAnchorElement>, view: View, path: string) {
    event.preventDefault();
    window.history.pushState(null, "", path);
    onView(view);
  }

  return (
    <header className="landing-header">
      <Link className="landing-logo" href="/" onClick={(event) => goTo(event, "Home", "/")} aria-label="Tru home"><TruMark /></Link>
      <nav aria-label="Tru organization navigation">
        <Link className={active === "Home" ? "active" : ""} href="/" onClick={(event) => goTo(event, "Home", "/")}>Home</Link>
        <Link className={active === "About" ? "active" : ""} href="/#about" onClick={(event) => goTo(event, "About", "/#about")}>About</Link>
        <Link className={active === "Teams" ? "active" : ""} href="/#teams" onClick={(event) => goTo(event, "Teams", "/#teams")}>Teams</Link>
        <Link className={active === "Join Tru" ? "active" : ""} href="/#join" onClick={(event) => goTo(event, "Join Tru", "/#join")}>Join Tru</Link>
        <button onClick={onEnter}>TruSocials</button>
      </nav>
      <button className="enter-socials" onClick={onEnter}>Enter TruSocials <span>›</span></button>
    </header>
  );
}

function HomeView({
  onView,
  onApply,
}: {
  onView: (view: View) => void;
  onApply: (track: "player" | "staff") => void;
}) {
  const roles = [
    { icon: "⌖", title: "Competitive Players", copy: "Compete at the highest level and represent Tru.", track: "player" as const },
    { icon: "♟", title: "Team Managers", copy: "Lead, organize, and elevate our teams to success.", track: "staff" as const },
    { icon: "✎", title: "Content Creators", copy: "Create content that inspires and grows our brand.", track: "staff" as const },
    { icon: "▣", title: "Community Staff", copy: "Support our community and keep it thriving.", track: "staff" as const },
  ];

  return (
    <div className="org-landing" id="landing-home">
      <section className="org-hero">
        <div className="org-hero-copy">
          <h1>BE PART OF<br />SOMETHING <span>TRU</span></h1>
          <p>We&apos;re building the future of Valorant Mobile<br />through talent, teamwork, and community.</p>
          <div className="org-hero-actions">
            <button className="org-primary" onClick={() => onApply("player")}>Join as a member <span>›</span></button>
            <button className="org-secondary" onClick={() => onApply("staff")}>Apply for staff <span>›</span></button>
          </div>
        </div>

        <div className="org-logo-stage" aria-label="Tru">
          <div className="stage-chevron stage-chevron--one" /><div className="stage-chevron stage-chevron--two" />
          <div className="stage-platform"><div className="org-stage-mark"><TruMark /></div></div>
          <div className="stage-steps"><i /><i /><i /></div>
        </div>
      </section>

      <section className="org-content" id="landing-recruit">
        <div className="org-section-title"><span>We&apos;re recruiting</span><h2>FIND YOUR ROLE. BUILD THE FUTURE.</h2></div>
        <div className="org-role-grid">
          {roles.map((role) => (
            <button className="org-role-card" key={role.title} onClick={() => onApply(role.track)}>
              <span className="role-icon">{role.icon}</span>
              <span><strong>{role.title}</strong><small>{role.copy}</small><b>Learn more　›</b></span>
            </button>
          ))}
        </div>

        <div className="org-bottom-grid">
          <article className="org-numbers" id="landing-about">
            <span className="org-panel-label">Tru by the numbers</span>
            <div>
              {[["♙", "12K+", "Community members"], ["♕", "28", "Tournament wins"], ["☆", "45+", "Active creators"], ["◎", "18", "Countries represented"]].map(([icon, value, label]) => (
                <span key={label}><i>{icon}</i><strong>{value}</strong><small>{label}</small></span>
              ))}
            </div>
          </article>

          <article className="org-featured" id="landing-teams">
            <span className="org-panel-label">News & featured teams</span>
            <div className="org-news">
              <div className="news-thumb"><TruMark /></div>
              <span><small>News　·　2d ago</small><strong>Tru Opens Staff Applications</strong><p>We&apos;re expanding our team. Apply now and help shape the future of Tru.</p><button onClick={() => onApply("staff")}>Read more　›</button></span>
            </div>
            <div className="featured-team">
              <span><small>Featured team</small><strong>TRU VALORANT MOBILE</strong><p>Our flagship roster competing at the highest level.</p><button onClick={() => onView("Socials")}>View team　›</button></span>
              <b className="featured-v">V</b>
            </div>
          </article>
        </div>
      </section>

      <footer className="org-footer"><span>Built on passion. Driven by purpose. United by Tru.</span><span>Join us and be part of something Tru.</span><div><b>◉</b><b>♥</b><b>▶</b><b>▣</b></div></footer>
    </div>
  );
}

function AboutView() {
  const values = [
    ["♕", "Competition", "We pursue excellence with discipline, always pushing to improve and elevate the scene."],
    ["♙", "Community", "We build spaces where players, creators, and supporters belong and grow together."],
    ["✎", "Creativity", "We celebrate bold ideas—from gameplay and events to content and storytelling."],
    ["◇", "Integrity", "We lead with honesty, respect, and fairness in everything we do."],
  ];

  return (
    <section className="org-subpage about-page">
      <div className="org-subhero">
        <div>
          <p className="org-page-kicker">About Tru</p>
          <h1>BUILT ON PASSION.<br />UNITED BY <span>TRU.</span></h1>
          <p>We bring players, creators, and communities together across competitive gaming.</p>
        </div>
        <div className="about-stage"><div className="about-stage-mark"><TruMark /></div><i /><i /></div>
      </div>

      <div className="about-statbar">
        {[["♙", "12K+", "Community members"], ["♕", "28", "Tournament wins"], ["◉", "45+", "Active creators"], ["◎", "18", "Countries represented"]].map(([icon, value, label]) => (
          <div key={label}><i>{icon}</i><strong>{value}</strong><span>{label}</span></div>
        ))}
      </div>

      <div className="about-story-grid">
        <article><span className="org-panel-label">Our story</span><p>Tru was founded by gamers and creators who believe in the power of play to bring people together. What started as a community has grown into an esports organization supporting competition, tournaments, creators, and communities.</p><p>From grassroots events to elite competition, we create opportunities for talent to grow and communities to thrive.</p></article>
        <article><span className="about-icon">⌾</span><div><h2>Mission</h2><p>Empower players, creators, and communities with the support, platforms, and resources they need to compete, create, and connect.</p></div></article>
        <article><span className="about-icon">◉</span><div><h2>Vision</h2><p>Build a respected global esports organization that unites diverse games, creators, and communities under one banner.</p></div></article>
      </div>

      <div className="about-values">
        <div className="org-section-title"><span>Our values</span><h2>WHAT MAKES US TRU.</h2></div>
        <div>{values.map(([icon, title, copy]) => <article key={title}><i>{icon}</i><span><strong>{title}</strong><p>{copy}</p></span></article>)}</div>
      </div>
    </section>
  );
}

function TeamsView({ onJoin }: { onJoin: () => void }) {
  const players = [
    ["01", "Kyo", "IGL"],
    ["02", "Mira", "Duelist"],
    ["03", "Raven", "Controller"],
    ["04", "Sage", "Sentinel"],
    ["05", "Flux", "Initiator"],
  ];
  const staff = [["⌁", "Head Coach"], ["▥", "Analyst"], ["♙", "Team Manager"], ["▻", "Content Lead"]];

  return (
    <section className="org-subpage teams-org-page">
      <div className="teams-page-hero">
        <div><p className="org-page-kicker">Current division</p><h1>THE TEAM THAT<br />REPRESENTS <span>TRU.</span></h1><p>Meet our current competitive division and the people carrying the Tru name forward.</p></div>
        <div className="teams-hero-stage"><TruMark /></div>
      </div>

      <article className="flagship-team">
        <div className="flagship-identity"><div className="valorant-v">V</div><span><small>Active · Philippines / SEA</small><h2>TRU VALORANT MOBILE</h2><p>Competitive Division</p></span></div>
        <div className="flagship-roster">{players.map(([number, name, role]) => <div key={role}><i>{number}</i><span>{name.slice(0, 2).toUpperCase()}</span><strong>{name}</strong><small>{role}</small></div>)}</div>
        <aside><span>Team manager<strong>Tru Staff</strong></span><span>Current ELO<strong>1724</strong></span><span>Season record<strong>26–10</strong></span><button>View full roster　›</button></aside>
      </article>

      <div className="support-team"><div className="org-section-title"><span>Staff & support</span><h2>BEHIND THE LINEUP.</h2></div><div>{staff.map(([icon, title]) => <article key={title}><i>{icon}</i><span><strong>{title}</strong><small>Tru Staff</small></span></article>)}</div></div>
      <div className="team-join-strip"><TruMark compact /><h2>READY TO WEAR THE TRU NAME?</h2><button onClick={onJoin}>Apply to the team　›</button></div>
    </section>
  );
}

function JoinTruView() {
  const [track, setTrack] = useState("Competitive Player");
  const [submitted, setSubmitted] = useState(false);
  const tracks = [
    ["⌖", "Competitive Player"],
    ["♙", "Team Manager & Coach"],
    ["▻", "Content Creator"],
    ["♟", "Community Staff"],
  ];

  return (
    <section className="org-subpage join-org-page">
      <div className="join-page-hero">
        <p className="org-page-kicker">Join Tru</p>
        <h1>FIND YOUR PLACE IN <span>TRU.</span></h1>
        <p>Whether you compete, create, lead, or support the community—there is a place for you here.</p>
      </div>

      <div className="join-track-grid">{tracks.map(([icon, title]) => <button className={track === title ? "active" : ""} key={title} onClick={() => setTrack(title)}><i>{icon}</i><strong>{title}</strong></button>)}</div>
      <div className="current-game"><span>Current competitive game</span><strong>VALORANT MOBILE</strong><b>V</b></div>

      <div className="join-application">
        <aside><span className="org-panel-label">Application</span><TruMark /><p>Choose your path, share your experience, and tell us what you want to build with Tru.</p></aside>
        {submitted ? <div className="success-state"><span>✓</span><h2>APPLICATION RECEIVED.</h2><p>Thanks for choosing Tru. Our team will review your application and contact you through Discord.</p><button className="org-primary" onClick={() => setSubmitted(false)}>Submit another</button></div> :
        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <div className="split-fields"><label>Display name / IGN<input required placeholder="Your name or IGN" /></label><label>Discord username<input required placeholder="@username" /></label></div>
          <div className="split-fields"><label>Region<select required defaultValue=""><option value="" disabled>Select region</option><option>Philippines</option><option>SEA</option><option>Other</option></select></label><label>Applying as<select value={track} onChange={(event) => setTrack(event.target.value)}>{tracks.map(([, title]) => <option key={title}>{title}</option>)}</select></label></div>
          <div className="split-fields"><label>Valorant Mobile role<select defaultValue="Duelist"><option>Duelist</option><option>Controller</option><option>Initiator</option><option>Sentinel</option><option>Flex</option><option>Not applicable</option></select></label><label>Availability<select defaultValue="Evenings"><option>Evenings</option><option>Weekends</option><option>Flexible</option></select></label></div>
          <label>About you<textarea required placeholder="Experience, goals, and why you want to join Tru…" /></label>
          <button className="org-primary" type="submit">Submit application　›</button>
        </form>}
      </div>

      <div className="join-steps">{[["01", "Choose your role"], ["02", "Submit your profile"], ["03", "Hear from Tru"]].map(([number, label]) => <div key={number}><strong>{number}</strong><span>{label}</span></div>)}</div>
    </section>
  );
}

function PageIntro({
  kicker,
  title,
  copy,
  action,
}: {
  kicker: string;
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <div><p className="eyebrow">{kicker}</p><h1>{title}</h1><p>{copy}</p></div>
      {action}
    </div>
  );
}

// Retained temporarily as a visual fallback while the live scrim migration rolls out.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ScrimsPreviewView({
  onCreateTeam,
  onOpenMatch,
  loggedIn,
  onAuthRequired,
}: {
  onCreateTeam: () => void;
  onOpenMatch: () => void;
  loggedIn: boolean;
  onAuthRequired: () => void;
}) {
  const [region, setRegion] = useState("All regions");
  const [format, setFormat] = useState("All formats");
  const [section, setSection] = useState<"find" | "challenges" | "history">("find");
  const [selectedTeam, setSelectedTeam] = useState<(typeof scrims)[number] | null>(null);
  const [challengeSent, setChallengeSent] = useState(false);
  const filtered = scrims.filter((scrim) =>
    (region === "All regions" || scrim.region === region) &&
    (format === "All formats" || scrim.format === format)
  );

  function openChallenge(scrim: (typeof scrims)[number]) {
    if (!loggedIn) {
      onAuthRequired();
      return;
    }
    if (!scrim.open) {
      onOpenMatch();
      return;
    }
    setChallengeSent(false);
    setSelectedTeam(scrim);
  }

  return (
    <section className="app-page">
      <PageIntro
        kicker="Scrim Finder"
        title="FIND YOUR NEXT FIGHT."
        copy="Challenge teams near your skill level, move into a private match room, share the lobby code, and report a verified result."
        action={<button className="button" onClick={onCreateTeam}>＋ Create a team</button>}
      />

      <div className="scrim-pulsebar">
        <span><i /> Matchmaking active</span>
        <strong>14</strong><small>teams searching now</small>
        <strong>08m</strong><small>average match time</small>
        <span className="privacy-chip">⌾ Private rooms after acceptance</span>
      </div>

      <div className="scrim-section-tabs" role="tablist" aria-label="Scrim sections">
        <button className={section === "find" ? "active" : ""} onClick={() => setSection("find")}>Find opponents <b>{filtered.length}</b></button>
        <button className={section === "challenges" ? "active" : ""} onClick={() => setSection("challenges")}>My challenges <b>2</b></button>
        <button className={section === "history" ? "active" : ""} onClick={() => setSection("history")}>Match history</button>
      </div>

      <div className="scrim-dashboard scrim-dashboard--enhanced">
        {loggedIn ? <aside className="your-team your-team--enhanced panel-card">
          <div className="card-label"><span>Your team</span><b>Captain</b></div>
          <div className="team-summary">
            <TruMark /><div><strong>Tru Phantoms</strong><span>TRU · SEA</span></div>
          </div>
          <div className="elo-block">
            <span>Team ELO</span><strong>1724</strong><small>Immortal Division · #3</small>
            <em>▲ 68 this season</em>
          </div>
          <div className="lineup-preview">
            <div className="card-label"><span>Starting five</span><b>5 / 5 ready</b></div>
            <div>{rosters.tru.map((name, index) => <span className="lineup-avatar" key={name} title={name}>{name.slice(0, 2).toUpperCase()}<i className={index < 5 ? "ready" : ""} /></span>)}</div>
          </div>
          <div className="team-readiness">
            <div><span>Roster</span><b>5 / 5</b></div><i><span style={{ width: "100%" }} /></i>
            <div><span>Verification</span><b className="green">Verified</b></div>
          </div>
          <button className="wide-outline" onClick={onCreateTeam}>Manage team</button>
          <p className="privacy-note">⌾ Only confirmed lineups can enter match chat.</p>
        </aside> : <aside className="your-team scrim-guest-card panel-card">
          <div className="card-label"><span>Your team</span><b>Guest</b></div>
          <div className="guest-team-visual"><TruMark /></div>
          <p className="eyebrow">Team manager access</p>
          <h2>BUILD YOUR FIVE.</h2>
          <p>Log in to create a team, lock your lineup, challenge opponents, and enter private match rooms.</p>
          <div className="guest-team-features"><span>Team profile</span><span>8-player roster</span><span>ELO tracking</span><span>Private rooms</span></div>
          <button className="button button--small" onClick={onAuthRequired}>Log in to compete →</button>
          <p className="privacy-note">Public visitors can browse open scrims and rankings.</p>
        </aside>}

        <div className="scrim-browser">
          {section === "find" && <>
            <div className="browser-toolbar">
              <div><strong>Best matches for your team</strong><span>Sorted by ELO, region, and availability</span></div>
              <div className="filters">
                <label>Region<select value={region} onChange={(e) => setRegion(e.target.value)}><option>All regions</option><option>SEA</option><option>PH</option><option>SG</option></select></label>
                <label>Format<select value={format} onChange={(e) => setFormat(e.target.value)}><option>All formats</option><option>BO1</option><option>BO3</option></select></label>
              </div>
            </div>

            <div className="challenge-list">
              {filtered.map((scrim, index) => (
                <article className={`challenge-row ${index === 0 ? "challenge-row--best" : ""}`} key={scrim.team}>
                  <span className="challenge-index">{String(index + 1).padStart(2, "0")}</span>
                  <TeamBadge tag={scrim.tag} />
                  <div className="challenge-team"><strong>{scrim.team}</strong><span>{scrim.rank} · {scrim.region}</span>{index === 0 && <em>96% match</em>}</div>
                  <div className="challenge-stat"><span>ELO</span><strong>{scrim.elo}</strong><small>{Math.abs(1724 - scrim.elo)} rating gap</small></div>
                  <div className="challenge-stat"><span>{scrim.format}</span><strong>{scrim.time}</strong></div>
                  <span className={scrim.open ? "availability" : "availability availability--soon"}><i />{scrim.open ? "Open" : "Accepted"}</span>
                  <button onClick={() => openChallenge(scrim)}>{scrim.open ? "Challenge →" : "Enter room"}</button>
                </article>
              ))}
            </div>
          </>}

          {section === "challenges" && <div className="scrim-state-grid">
            <article className="active-challenge">
              <div><span className="status-dot status-dot--amber" />Awaiting response</div>
              <div className="mini-match"><TeamBadge tag="TRU" tru /><strong>Tru Phantoms</strong><span>vs</span><strong>Apex Five</strong><TeamBadge tag="APX" /></div>
              <p>BO3 · Today at 10:00 PM · expires in 18m</p>
              <button className="wide-outline">Cancel challenge</button>
            </article>
            <article className="active-challenge active-challenge--accepted">
              <div><span className="status-dot" />Accepted · Private room ready</div>
              <div className="mini-match"><TeamBadge tag="TRU" tru /><strong>Tru Phantoms</strong><span>vs</span><strong>Nova Core</strong><TeamBadge tag="NOVA" /></div>
              <p>Access limited to 10 rostered players and 2 team managers.</p>
              <button className="button button--small" onClick={onOpenMatch}>Enter private room →</button>
            </article>
          </div>}

          {section === "history" && <div className="history-list">
            {[["WIN", "Crimson Tide", "2 — 0", "+24 ELO", "Jul 26"], ["LOSS", "Velocity", "1 — 2", "−11 ELO", "Jul 24"], ["WIN", "Apex Five", "2 — 1", "+19 ELO", "Jul 22"]].map(([result, opponent, score, elo, date]) => (
              <article key={`${opponent}-${date}`}><b className={result === "WIN" ? "win" : "loss"}>{result}</b><TeamBadge tag={opponent} /><div><strong>vs {opponent}</strong><span>Verified BO3 · {date}</span></div><strong>{score}</strong><em>{elo}</em><button>Match details →</button></article>
            ))}
          </div>}
        </div>
      </div>

      <div className="scrim-info-grid">
        <article><span>01</span><div><strong>Find a fair match</strong><p>Filters prioritize teams close to your region and ELO.</p></div></article>
        <article><span>02</span><div><strong>Enter the match room</strong><p>Captains share room codes and coordinate in one private chat.</p></div></article>
        <article><span>03</span><div><strong>Submit the result</strong><p>Both captains confirm the score before ELO changes.</p></div></article>
      </div>

      {selectedTeam && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedTeam(null)}>
        <section className="challenge-modal" role="dialog" aria-modal="true" aria-label={`Challenge ${selectedTeam.team}`} onMouseDown={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelectedTeam(null)} aria-label="Close">×</button>
          {challengeSent ? <div className="success-state"><span>✓</span><h2>CHALLENGE SENT.</h2><p>{selectedTeam.team} has 20 minutes to accept. A private room will open only after both lineups are locked.</p><button className="button" onClick={() => { setSelectedTeam(null); setSection("challenges"); }}>View challenges</button></div> : <>
            <p className="eyebrow">Confirm challenge</p>
            <div className="challenge-versus"><div><TruMark compact /><strong>Tru Phantoms</strong><span>1724 ELO</span></div><b>VS</b><div><TeamBadge tag={selectedTeam.tag} /><strong>{selectedTeam.team}</strong><span>{selectedTeam.elo} ELO</span></div></div>
            <div className="challenge-settings"><span><small>Format</small><strong>{selectedTeam.format}</strong></span><span><small>Schedule</small><strong>{selectedTeam.time}</strong></span><span><small>Server</small><strong>{selectedTeam.region}</strong></span></div>
            <div className="secure-callout"><strong>⌾ Private by design</strong><p>After acceptance, only the two locked five-player lineups plus each team&apos;s captain or manager can see chat, room codes, and result submission.</p></div>
            <button className="button" onClick={() => setChallengeSent(true)}>Send challenge →</button>
          </>}
        </section>
      </div>}
    </section>
  );
}

type LiveTeam = {
  id: string;
  name: string;
  tag: string;
  region: string;
  elo: number;
  role: "player" | "captain" | "manager" | "substitute";
};

type LiveScrim = {
  id: string;
  host_team_id: string;
  opponent_team_id: string | null;
  region: string;
  format: string;
  scheduled_at: string;
  status: "open" | "accepted" | "live" | "awaiting_confirmation" | "completed" | "cancelled";
  room_code?: string | null;
  room_password?: string | null;
  host_team: { id: string; name: string; tag: string; elo: number };
  opponent_team: { id: string; name: string; tag: string; elo: number } | null;
};

function ScrimsView({
  userId,
  loggedIn,
  onAuthRequired,
}: {
  userId: string | null;
  loggedIn: boolean;
  onAuthRequired: () => void;
  onCreateTeam?: () => void;
  onOpenMatch?: () => void;
}) {
  const [team, setTeam] = useState<LiveTeam | null>(null);
  const [liveScrims, setLiveScrims] = useState<LiveScrim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamForm, setTeamForm] = useState(false);
  const [scrimForm, setScrimForm] = useState(false);
  const [activeRoom, setActiveRoom] = useState<LiveScrim | null>(null);

  async function loadScrims() {
    setLoading(true);
    setError("");

    const { data: scrimData, error: scrimError } = await supabase
      .from("scrims")
      .select("id,host_team_id,opponent_team_id,region,format,scheduled_at,status,room_code,room_password,host_team:teams!scrims_host_team_id_fkey(id,name,tag,elo),opponent_team:teams!scrims_opponent_team_id_fkey(id,name,tag,elo)")
      .order("scheduled_at", { ascending: true });

    if (scrimError) setError(scrimError.message);
    else setLiveScrims((scrimData ?? []) as unknown as LiveScrim[]);

    if (userId) {
      const { data: membership } = await supabase
        .from("team_members")
        .select("role,team_id,teams!inner(id,name,tag,region,elo)")
        .eq("profile_id", userId)
        .limit(1)
        .maybeSingle();

      if (membership?.teams) {
        const linkedTeam = membership.teams as unknown as { id: string; name: string; tag: string; region: string; elo: number };
        setTeam({ ...linkedTeam, role: membership.role as LiveTeam["role"] });
      } else {
        setTeam(null);
      }
    } else {
      setTeam(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadScrims(), 0);
    const channel = supabase
      .channel("public-scrims")
      .on("postgres_changes", { event: "*", schema: "public", table: "scrims" }, () => void loadScrims())
      .subscribe();
    return () => { window.clearTimeout(initialLoad); void supabase.removeChannel(channel); };
    // loadScrims intentionally reloads when the authenticated user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function createTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return onAuthRequired();
    const form = new FormData(event.currentTarget);
    const { data, error: teamError } = await supabase
      .from("teams")
      .insert({
        owner_id: userId,
        name: String(form.get("name") ?? "").trim(),
        tag: String(form.get("tag") ?? "").trim().toUpperCase(),
        region: String(form.get("region") ?? "Philippines"),
        goal: "Competitive",
      })
      .select("id")
      .single();

    if (teamError || !data) {
      setError(teamError?.message ?? "Could not create the team.");
      return;
    }

    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: data.id,
      profile_id: userId,
      role: "captain",
      is_active_lineup: true,
      game_role: "Manager",
    });
    if (memberError) {
      setError(memberError.message);
      return;
    }
    setTeamForm(false);
    await loadScrims();
  }

  async function createScrim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !team) return;
    const form = new FormData(event.currentTarget);
    const { error: createError } = await supabase.from("scrims").insert({
      host_team_id: team.id,
      region: String(form.get("region")),
      format: String(form.get("format")),
      scheduled_at: new Date(String(form.get("scheduled_at"))).toISOString(),
      created_by: userId,
      status: "open",
      minimum_elo: Math.max(0, team.elo - 250),
    });
    if (createError) {
      setError(createError.message);
      return;
    }
    setScrimForm(false);
    await loadScrims();
  }

  async function challengeScrim(scrim: LiveScrim) {
    if (!loggedIn || !userId) return onAuthRequired();
    if (!team) {
      setTeamForm(true);
      return;
    }
    if (scrim.host_team_id === team.id) return;
    const { error: challengeError } = await supabase.rpc("accept_scrim", {
      target_scrim: scrim.id,
      challenger_team: team.id,
    });
    if (challengeError) setError(challengeError.message);
    else await loadScrims();
  }

  const myMatches = team
    ? liveScrims.filter(
        (scrim) =>
          (scrim.host_team_id === team.id || scrim.opponent_team_id === team.id) &&
          scrim.status !== "completed" &&
          scrim.status !== "cancelled",
      )
    : [];
  const matchHistory = team
    ? liveScrims.filter(
        (scrim) =>
          (scrim.host_team_id === team.id || scrim.opponent_team_id === team.id) &&
          scrim.status === "completed",
      )
    : [];

  return (
    <section className="app-page live-scrims-page">
      <PageIntro
        kicker="Live Scrim Finder"
        title="FIND YOUR NEXT FIGHT."
        copy="Real teams, real challenges, private match rooms, and results stored securely with Supabase."
        action={<button className="button" onClick={() => loggedIn ? team ? setScrimForm(true) : setTeamForm(true) : onAuthRequired()}>{team ? "＋ Post a scrim" : "＋ Create a team"}</button>}
      />

      {error && <div className="scrim-system-error" role="alert"><strong>Action needed</strong><span>{error}</span><button onClick={() => setError("")}>×</button></div>}

      <div className="live-scrim-summary">
        <div><span>Matchmaking</span><strong>{liveScrims.filter((scrim) => scrim.status === "open").length}</strong><small>Open scrims</small></div>
        <div><span>Your account</span><strong>{loggedIn ? "Online" : "Guest"}</strong><small>{team ? `${team.name} · ${team.elo} ELO` : loggedIn ? "Create a team to compete" : "Log in to challenge"}</small></div>
        <div><span>Privacy</span><strong>Locked</strong><small>Match rooms are participant-only</small></div>
      </div>

      <div className="live-scrim-grid">
        <aside className="live-team-card">
          {team ? <>
            <span className="org-panel-label">Your team</span>
            <div className="live-team-mark">{team.tag}</div>
            <h2>{team.name}</h2><p>{team.region} · {team.role}</p>
            <strong>{team.elo} ELO</strong>
            <button onClick={() => setScrimForm(true)}>Post availability</button>
          </> : <>
            <span className="org-panel-label">Your team</span><TruMark />
            <h2>{loggedIn ? "BUILD YOUR FIVE." : "LOG IN TO COMPETE."}</h2>
            <p>{loggedIn ? "Create your team and become its first captain." : "Browse publicly, then log in when you are ready to challenge."}</p>
            <button onClick={() => loggedIn ? setTeamForm(true) : onAuthRequired()}>{loggedIn ? "Create team" : "Log in"}</button>
          </>}
        </aside>

        <div className="live-scrim-list">
          <div className="live-list-head"><div><strong>Open challenges</strong><span>Sorted by scheduled time</span></div><button onClick={() => void loadScrims()}>Refresh</button></div>
          {loading ? <div className="live-empty">Loading live scrims…</div> : liveScrims.filter((scrim) => scrim.status === "open").length === 0 ? <div className="live-empty"><TruMark compact /><strong>No open scrims yet.</strong><span>Create the first listing for the community.</span></div> :
            liveScrims.filter((scrim) => scrim.status === "open").map((scrim) => <article className="live-scrim-row" key={scrim.id}>
              <TeamBadge tag={scrim.host_team.tag} />
              <div><strong>{scrim.host_team.name}</strong><span>{scrim.region} · {scrim.format}</span></div>
              <div><small>ELO</small><strong>{scrim.host_team.elo}</strong></div>
              <time>{new Date(scrim.scheduled_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>
              <button disabled={team?.id === scrim.host_team_id} onClick={() => void challengeScrim(scrim)}>{team?.id === scrim.host_team_id ? "Your listing" : "Challenge →"}</button>
            </article>)}
        </div>
      </div>

      {team && <section className="my-live-matches"><div className="org-section-title"><span>Your challenges</span><h2>PRIVATE MATCH ROOMS.</h2></div>{myMatches.length === 0 ? <p>No challenges yet.</p> : <div>{myMatches.map((scrim) => <article key={scrim.id}><span className={`match-status match-status--${scrim.status}`}>{scrim.status}</span><strong>{scrim.host_team.name} vs {scrim.opponent_team?.name ?? "Waiting for opponent"}</strong><small>{scrim.format} · {new Date(scrim.scheduled_at).toLocaleString()}</small>{scrim.opponent_team && <button onClick={() => setActiveRoom(scrim)}>Enter private room →</button>}</article>)}</div>}</section>}

      {team && matchHistory.length > 0 && <section className="my-live-matches"><div className="org-section-title"><span>Match history</span><h2>COMPLETED SCRIMS.</h2></div><div>{matchHistory.map((scrim) => <article key={scrim.id}><span className="match-status match-status--completed">completed</span><strong>{scrim.host_team.name} vs {scrim.opponent_team?.name ?? "Opponent"}</strong><small>{scrim.format} · {new Date(scrim.scheduled_at).toLocaleString()}</small></article>)}</div></section>}

      {teamForm && <div className="modal-backdrop" onMouseDown={() => setTeamForm(false)}><section className="live-form-modal" role="dialog" aria-modal="true" aria-label="Create a team" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setTeamForm(false)}>×</button><p className="eyebrow">Team setup</p><h2>CREATE YOUR TEAM.</h2><form onSubmit={createTeam}><label>Team name<input name="name" required maxLength={40} placeholder="e.g. Tru Phantoms" /></label><label>Team tag<input name="tag" required maxLength={5} placeholder="TRU" /></label><label>Region<select name="region" defaultValue="Philippines"><option>Philippines</option><option>SEA</option><option>Singapore</option><option>Other</option></select></label><button className="button" type="submit">Create team →</button></form></section></div>}

      {scrimForm && team && <div className="modal-backdrop" onMouseDown={() => setScrimForm(false)}><section className="live-form-modal" role="dialog" aria-modal="true" aria-label="Post a scrim" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setScrimForm(false)}>×</button><p className="eyebrow">Scrim listing</p><h2>POST AVAILABILITY.</h2><form onSubmit={createScrim}><label>Region<select name="region" defaultValue={team.region}><option>Philippines</option><option>SEA</option><option>Singapore</option></select></label><label>Format<select name="format" defaultValue="BO3"><option>BO1</option><option>BO3</option><option>BO5</option></select></label><label>Date and time<input name="scheduled_at" type="datetime-local" required /></label><button className="button" type="submit">Publish scrim →</button></form></section></div>}

      {activeRoom && userId && team && <LiveMatchRoom scrim={activeRoom} userId={userId} myTeam={team} onClose={() => setActiveRoom(null)} onRefresh={loadScrims} />}
    </section>
  );
}

function LiveMatchRoom({ scrim, userId, myTeam, onClose, onRefresh }: { scrim: LiveScrim; userId: string; myTeam: LiveTeam; onClose: () => void; onRefresh: () => Promise<void> }) {
  const [messages, setMessages] = useState<Array<{ id: number; body: string; sender_id: string; created_at: string; profiles?: { display_name: string } | null }>>([]);
  const [result, setResult] = useState<{ winner_team_id: string; host_score: number; opponent_score: number; host_confirmed: boolean; opponent_confirmed: boolean; elo_processed: boolean } | null>(null);
  const [draft, setDraft] = useState("");
  const [roomCode, setRoomCode] = useState(scrim.room_code ?? "");
  const [roomPassword, setRoomPassword] = useState(scrim.room_password ?? "");
  const [roomError, setRoomError] = useState("");
  const canManage = myTeam.role === "captain" || myTeam.role === "manager";

  async function loadMessages() {
    const { data, error } = await supabase.from("match_messages").select("id,body,sender_id,created_at,profiles(display_name)").eq("scrim_id", scrim.id).order("created_at");
    if (error) setRoomError(error.message);
    else setMessages((data ?? []) as unknown as typeof messages);
    const { data: resultData } = await supabase.from("match_results").select("winner_team_id,host_score,opponent_score,host_confirmed,opponent_confirmed,elo_processed").eq("scrim_id", scrim.id).maybeSingle();
    setResult(resultData);
    if (resultData?.elo_processed) {
      await onRefresh();
      onClose();
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadMessages(), 0);
    const channel = supabase
      .channel(`match-${scrim.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "match_messages", filter: `scrim_id=eq.${scrim.id}` }, () => void loadMessages())
      .on("postgres_changes", { event: "*", schema: "public", table: "match_results", filter: `scrim_id=eq.${scrim.id}` }, () => void loadMessages())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "scrims", filter: `id=eq.${scrim.id}` }, () => void loadMessages())
      .subscribe();
    return () => { window.clearTimeout(initialLoad); void supabase.removeChannel(channel); };
    // loadMessages is scoped to this immutable match room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrim.id]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    const { error } = await supabase.from("match_messages").insert({ scrim_id: scrim.id, sender_id: userId, body: draft.trim() });
    if (error) setRoomError(error.message);
    else setDraft("");
  }

  async function saveRoomDetails() {
    const { error } = await supabase
      .from("scrims")
      .update({ room_code: roomCode.trim(), room_password: roomPassword.trim(), status: "live" })
      .eq("id", scrim.id)
      .in("status", ["accepted", "live"]);
    if (error) setRoomError(error.message);
    else await onRefresh();
  }

  async function submitResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { data, error } = await supabase.rpc("submit_scrim_result", {
      target_scrim: scrim.id,
      winning_team: String(form.get("winner")),
      host_maps: Number(form.get("host_score")),
      opponent_maps: Number(form.get("opponent_score")),
    });
    if (error) {
      setRoomError(error.message);
      return;
    }
    setResult(data as unknown as typeof result);
    await onRefresh();
  }

  async function confirmExistingResult() {
    if (!result) return;
    const { data, error } = await supabase.rpc("submit_scrim_result", {
      target_scrim: scrim.id,
      winning_team: result.winner_team_id,
      host_maps: result.host_score,
      opponent_maps: result.opponent_score,
    });
    if (error) setRoomError(error.message);
    else {
      const confirmedResult = data as unknown as typeof result;
      setResult(confirmedResult);
      await onRefresh();
      if (confirmedResult?.elo_processed) onClose();
    }
  }

  return <div className="match-room-overlay"><section className="live-match-room" role="dialog" aria-modal="true" aria-label="Private scrim room">
    <header><div><span className="room-open"><i /> Private match room</span><h2>{scrim.host_team.name} <b>VS</b> {scrim.opponent_team?.name}</h2><p>{scrim.format} · {scrim.region}</p></div><button onClick={onClose}>×</button></header>
    <div className="room-privacy-banner"><span>⌾</span><div><strong>Participant-only access</strong><small>Protected by Supabase row-level security.</small></div></div>
    {roomError && <div className="scrim-system-error">{roomError}</div>}
    <div className="live-room-body">
      <div className="room-chat"><div className="chat-head"><strong>Match chat</strong></div><div className="messages">{messages.length === 0 ? <p className="live-empty">No messages yet.</p> : messages.map((message) => <div className={message.sender_id === userId ? "message message--mine" : "message"} key={message.id}><span>{message.sender_id === userId ? myTeam.tag : "OPP"}</span><div><p>{message.body}</p><small>{message.profiles?.display_name ?? "Player"} · {new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small></div></div>)}</div><form className="chat-form" onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message the other team…" /><button disabled={!draft.trim()}>Send</button></form></div>
      <aside className="live-room-controls"><span className="org-panel-label">Room details</span><label>Lobby code<input value={roomCode} onChange={(event) => setRoomCode(event.target.value)} readOnly={!canManage} placeholder="Waiting for captain" /></label><label>Password<input value={roomPassword} onChange={(event) => setRoomPassword(event.target.value)} readOnly={!canManage} placeholder="Waiting for captain" /></label>{canManage && <button onClick={() => void saveRoomDetails()}>Save room details</button>}<p>Either captain or manager may post the room details.</p><div className="live-result-divider" /><span className="org-panel-label">Match result</span>{result ? <div className="live-result-status"><strong>{result.winner_team_id === scrim.host_team_id ? scrim.host_team.name : scrim.opponent_team?.name} won {result.host_score}–{result.opponent_score}</strong><span>Host: {result.host_confirmed ? "Confirmed" : "Waiting"}</span><span>Opponent: {result.opponent_confirmed ? "Confirmed" : "Waiting"}</span><b>{result.elo_processed ? "ELO updated ±25" : "Waiting for both captains"}</b>{canManage && !result.elo_processed && <button type="button" onClick={() => void confirmExistingResult()}>Confirm same result</button>}</div> : canManage ? <form className="live-result-form" onSubmit={submitResult}><label>Winner<select name="winner" defaultValue={scrim.host_team_id}><option value={scrim.host_team_id}>{scrim.host_team.name}</option><option value={scrim.opponent_team_id ?? ""}>{scrim.opponent_team?.name}</option></select></label><div><label>Host maps<input name="host_score" type="number" min="0" max="5" defaultValue="2" /></label><label>Opponent maps<input name="opponent_score" type="number" min="0" max="5" defaultValue="1" /></label></div><button type="submit">Submit result</button></form> : <p>Only captains and managers can submit results.</p>}</aside>
    </div>
  </section></div>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SocialsPreviewView({
  onProfile,
  loggedIn,
  onAuthRequired,
}: {
  onProfile: (name: string) => void;
  loggedIn: boolean;
  onAuthRequired: () => void;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState("");

  function publishPost(event: FormEvent) {
    event.preventDefault();
    if (!loggedIn) {
      onAuthRequired();
      return;
    }
    if (!draft.trim()) return;
    setPosts([{ id: Date.now(), name: "Daniel", handle: "@tru.daniel", initials: "DT", time: "now", text: draft.trim(), comments: 0, likes: 0, tag: "POST" }, ...posts]);
    setDraft("");
  }

  return (
    <section className="app-page community-page">
      <PageIntro
        kicker="Tru Socials"
        title="YOUR GAME. YOUR PEOPLE."
        copy="Share clips, recruit players, follow teams, and build a profile that shows who you are in the community."
      />

      <div className="social-layout">
        {loggedIn ? <aside className="profile-card panel-card">
          <div className="profile-cover"><div className="profile-avatar">DT<span /></div></div>
          <h2>Daniel Tringa</h2><p>@tru.daniel · Philippines</p>
          <span className="role-chip">Team Manager</span>
          <div className="profile-stats"><div><b>284</b><span>Followers</span></div><div><b>96</b><span>Following</span></div><div><b>1724</b><span>ELO</span></div></div>
          <button className="wide-outline" onClick={() => onProfile("Your profile")}>View profile</button>
        </aside> : <aside className="profile-card profile-card--guest panel-card">
          <div className="guest-profile-mark"><TruMark compact /></div>
          <p className="eyebrow">Your profile</p><h2>JOIN THE CONVERSATION.</h2>
          <p>Create a public player profile, follow teams, and share your moments.</p>
          <button className="button button--small" onClick={onAuthRequired}>Log in or join</button>
        </aside>}

        <div className="feed">
          <form className="composer" onSubmit={publishPost}>
            <Avatar initials={loggedIn ? "DT" : "TRU"} />
            <label><span className="sr-only">Create a post</span><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={loggedIn ? "Share an update with Tru…" : "Log in to share with Tru…"} /></label>
            <div className="composer-actions"><span>▧ Clip</span><span>◉ Looking for team</span><button type="submit">{loggedIn ? "Post" : "Log in"}</button></div>
          </form>

          {posts.map((post) => (
            <article className="feed-post" key={post.id}>
              <Avatar initials={post.initials} />
              <div>
                <div className="post-head">
                  <button onClick={() => onProfile(post.name)}><strong>{post.name}</strong><span>{post.handle}</span></button>
                  <span className="post-tag">{post.tag}</span><time>{post.time}</time><button aria-label="More options">•••</button>
                </div>
                <p>{post.text}</p>
                {post.tag === "MATCH" && <div className="match-recap"><TeamBadge tag="TRU" tru /><b>TRU 13</b><span>Ascent · Final</span><b>11 NOVA</b><TeamBadge tag="NOVA" /></div>}
                <div className="post-actions"><button>◯ {post.comments}</button><button>♡ {post.likes}</button><button>↗ Share</button></div>
              </div>
            </article>
          ))}
        </div>

        <aside className="community-aside">
          <div className="panel-card people-card">
            <div className="card-label"><span>Players to follow</span><button>See all</button></div>
            {[["MK", "Mika Yu", "Controller"], ["RV", "Raven C.", "Duelist"], ["KN", "Kenji N.", "IGL"]].map(([initials, name, role]) => (
              <div className="person-row" key={name}><Avatar initials={initials} /><button onClick={() => onProfile(name)}><strong>{name}</strong><span>{role}</span></button><button>＋</button></div>
            ))}
          </div>
          <div className="panel-card trending-card">
            <div className="card-label"><span>Trending in Tru</span></div>
            <button><span>01</span><div><strong>#ValorantMobile</strong><small>428 posts</small></div></button>
            <button><span>02</span><div><strong>#LookingForTeam</strong><small>182 posts</small></div></button>
            <button><span>03</span><div><strong>#TruHighlights</strong><small>96 posts</small></div></button>
          </div>
        </aside>
      </div>
    </section>
  );
}

type SocialPost = {
  id: string;
  author_id: string;
  body: string;
  post_type: string;
  created_at: string;
  profiles: { display_name: string; username: string | null; region: string | null } | null;
  post_likes: Array<{ profile_id: string }>;
  post_comments: Array<{ id: number }>;
};

function SocialsView({ userId, loggedIn, onAuthRequired }: { userId: string | null; loggedIn: boolean; onAuthRequired: () => void; onProfile?: (name: string) => void }) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [profile, setProfile] = useState<{ display_name: string; username: string | null; region: string | null; account_role: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [postType, setPostType] = useState("general");
  const [socialError, setSocialError] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentPost, setCommentPost] = useState<SocialPost | null>(null);
  const [comments, setComments] = useState<Array<{ id: number; author_id: string; body: string; created_at: string; profiles: { display_name: string } | null }>>([]);
  const [commentDraft, setCommentDraft] = useState("");

  async function loadFeed() {
    const { data, error } = await supabase.from("posts").select("id,author_id,body,post_type,created_at,profiles!posts_author_id_fkey(display_name,username,region),post_likes(profile_id),post_comments(id)").order("created_at", { ascending: false }).limit(50);
    if (error) setSocialError(error.message);
    else setPosts((data ?? []) as unknown as SocialPost[]);
    if (userId) {
      const { data: me } = await supabase.from("profiles").select("display_name,username,region,account_role").eq("id", userId).maybeSingle();
      setProfile(me);
    } else setProfile(null);
    setLoading(false);
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadFeed(), 0);
    const channel = supabase.channel("tru-social-feed").on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => void loadFeed()).on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => void loadFeed()).on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => void loadFeed()).subscribe();
    return () => { window.clearTimeout(initialLoad); void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function publishPost(event: FormEvent) {
    event.preventDefault();
    if (!userId) return onAuthRequired();
    if (!draft.trim()) return;
    const { error } = await supabase.from("posts").insert({ author_id: userId, body: draft.trim(), post_type: postType });
    if (error) setSocialError(error.message);
    else { setDraft(""); setPostType("general"); await loadFeed(); }
  }

  async function toggleLike(post: SocialPost) {
    if (!userId) return onAuthRequired();
    const liked = post.post_likes.some((like) => like.profile_id === userId);
    const query = liked
      ? supabase.from("post_likes").delete().eq("post_id", post.id).eq("profile_id", userId)
      : supabase.from("post_likes").insert({ post_id: post.id, profile_id: userId });
    const { error } = await query;
    if (error) setSocialError(error.message); else await loadFeed();
  }

  async function deletePost(postId: string) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) setSocialError(error.message); else await loadFeed();
  }

  async function openComments(post: SocialPost) {
    setCommentPost(post);
    const { data, error } = await supabase.from("post_comments").select("id,author_id,body,created_at,profiles!post_comments_author_id_fkey(display_name)").eq("post_id", post.id).order("created_at");
    if (error) setSocialError(error.message); else setComments((data ?? []) as unknown as typeof comments);
  }

  async function addComment(event: FormEvent) {
    event.preventDefault();
    if (!userId) return onAuthRequired();
    if (!commentPost || !commentDraft.trim()) return;
    const { error } = await supabase.from("post_comments").insert({ post_id: commentPost.id, author_id: userId, body: commentDraft.trim() });
    if (error) setSocialError(error.message);
    else { setCommentDraft(""); await openComments(commentPost); await loadFeed(); }
  }

  const initials = (profile?.display_name ?? "TRU").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return <section className="app-page live-socials-page">
    <PageIntro kicker="Tru Socials" title="YOUR GAME. YOUR PEOPLE." copy="Real community posts, reactions, and conversations stored securely with Supabase." />
    {socialError && <div className="scrim-system-error"><strong>Socials error</strong><span>{socialError}</span><button onClick={() => setSocialError("")}>×</button></div>}
    <div className="social-layout">
      {loggedIn ? <aside className="profile-card panel-card live-profile-card"><div className="profile-cover"><div className="profile-avatar">{initials}<span /></div></div><h2>{profile?.display_name ?? "Tru member"}</h2><p>@{profile?.username ?? "set-your-username"} · {profile?.region ?? "SEA"}</p><span className="role-chip">{profile?.account_role ?? "player"}</span><div className="profile-stats"><div><b>{posts.filter((post) => post.author_id === userId).length}</b><span>Posts</span></div><div><b>{posts.reduce((total, post) => total + post.post_likes.length, 0)}</b><span>Feed likes</span></div><div><b>Online</b><span>Status</span></div></div></aside> : <aside className="profile-card profile-card--guest panel-card"><div className="guest-profile-mark"><TruMark compact /></div><p className="eyebrow">Your profile</p><h2>JOIN THE CONVERSATION.</h2><p>Log in to post, like, and comment.</p><button className="button button--small" onClick={onAuthRequired}>Log in or join</button></aside>}
      <div className="feed">
        <form className="composer live-composer" onSubmit={publishPost}><Avatar initials={initials} /><label><span className="sr-only">Create a post</span><textarea maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={loggedIn ? "Share an update with Tru…" : "Log in to share with Tru…"} /></label><div className="composer-actions"><select value={postType} onChange={(event) => setPostType(event.target.value)}><option value="general">General</option><option value="lft">Looking for team</option><option value="match">Match update</option><option value="highlight">Highlight</option></select><span>{draft.length}/2000</span><button type="submit">{loggedIn ? "Post" : "Log in"}</button></div></form>
        {loading ? <div className="live-empty">Loading the Tru feed…</div> : posts.length === 0 ? <div className="live-empty"><TruMark compact /><strong>No posts yet.</strong><span>Start the first conversation.</span></div> : posts.map((post) => {
          const name = post.profiles?.display_name ?? "Tru member";
          const postInitials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
          const liked = Boolean(userId && post.post_likes.some((like) => like.profile_id === userId));
          return <article className="feed-post live-feed-post" key={post.id}><Avatar initials={postInitials} /><div><div className="post-head"><span><strong>{name}</strong><small>@{post.profiles?.username ?? "tru-member"}</small></span><span className="post-tag">{post.post_type}</span><time>{new Date(post.created_at).toLocaleString()}</time>{post.author_id === userId && <button onClick={() => void deletePost(post.id)} aria-label="Delete post">×</button>}</div><p>{post.body}</p><div className="post-actions"><button onClick={() => void openComments(post)}>◯ {post.post_comments.length}</button><button className={liked ? "liked" : ""} onClick={() => void toggleLike(post)}>♡ {post.post_likes.length}</button><button onClick={() => navigator.clipboard?.writeText(window.location.href)}>↗ Share</button></div></div></article>;
        })}
      </div>
      <aside className="community-aside"><div className="panel-card trending-card"><div className="card-label"><span>Community guide</span></div><div className="social-guide"><strong>Be competitive.</strong><p>Keep posts constructive and respectful.</p><strong>Find your five.</strong><p>Use Looking for Team to recruit.</p><strong>Be Tru.</strong><p>Your profile and activity represent you.</p></div></div></aside>
    </div>
    {commentPost && <div className="modal-backdrop" onMouseDown={() => setCommentPost(null)}><section className="comments-modal" role="dialog" aria-modal="true" aria-label="Post comments" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setCommentPost(null)}>×</button><p className="eyebrow">Conversation</p><h2>{commentPost.profiles?.display_name ?? "Tru member"}</h2><blockquote>{commentPost.body}</blockquote><div className="comments-list">{comments.length === 0 ? <p>No comments yet.</p> : comments.map((comment) => <article key={comment.id}><strong>{comment.profiles?.display_name ?? "Member"}</strong><p>{comment.body}</p><small>{new Date(comment.created_at).toLocaleString()}</small></article>)}</div><form onSubmit={addComment}><input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} maxLength={1000} placeholder={loggedIn ? "Write a comment…" : "Log in to comment"} /><button type="submit">Comment</button></form></section></div>}
  </section>;
}

type TeamDashboard = {
  id: string;
  name: string;
  tag: string;
  region: string;
  elo: number;
  wins: number;
  losses: number;
  role: string;
  logo_url: string | null;
};

function LiveMyTeamView({ userId }: { userId: string }) {
  const [team, setTeam] = useState<TeamDashboard | null>(null);
  const [members, setMembers] = useState<Array<{ profile_id: string; role: string; game_role: string | null; is_active_lineup: boolean; profiles: { display_name: string; username: string | null } }>>([]);
  const [matches, setMatches] = useState<LiveScrim[]>([]);
  const [section, setSection] = useState<"overview" | "roster">("overview");
  const [loading, setLoading] = useState(true);
  const [teamError, setTeamError] = useState("");
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"profile" | "team" | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [inviteTarget, setInviteTarget] = useState("");
  const [inviteRole, setInviteRole] = useState<"player" | "substitute">("player");
  const [membershipBusy, setMembershipBusy] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<Array<{ id: string; role: string; created_at: string; teams: { name: string; tag: string; logo_url: string | null } }>>([]);
  const [sentInvites, setSentInvites] = useState<Array<{ id: string; role: string; created_at: string; profiles: { display_name: string; username: string | null } }>>([]);

  useEffect(() => {
    async function loadTeam() {
      setLoading(true);
      const { data: incoming } = await supabase
        .from("team_invites")
        .select("id,role,created_at,teams!inner(name,tag,logo_url)")
        .eq("invited_profile_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setPendingInvites((incoming ?? []) as unknown as typeof pendingInvites);
      const { data: membership, error: membershipError } = await supabase
        .from("team_members")
        .select("role,team_id,teams!inner(id,name,tag,region,elo,wins,losses,logo_url)")
        .eq("profile_id", userId)
        .limit(1)
        .maybeSingle();

      if (membershipError) {
        setTeamError(membershipError.message);
        setLoading(false);
        return;
      }
      if (!membership?.teams) {
        setTeam(null);
        setLoading(false);
        return;
      }

      const linked = membership.teams as unknown as Omit<TeamDashboard, "role">;
      const liveTeam = { ...linked, role: membership.role } as TeamDashboard;
      setTeam(liveTeam);

      const [{ data: memberData, error: memberError }, { data: matchData, error: matchError }, { data: profileData }, { data: sentData }] = await Promise.all([
        supabase
          .from("team_members")
          .select("profile_id,role,game_role,is_active_lineup,profiles!inner(display_name,username)")
          .eq("team_id", liveTeam.id)
          .order("joined_at"),
        supabase
          .from("scrims")
          .select("id,host_team_id,opponent_team_id,region,format,scheduled_at,status,room_code,room_password,host_team:teams!scrims_host_team_id_fkey(id,name,tag,elo),opponent_team:teams!scrims_opponent_team_id_fkey(id,name,tag,elo)")
          .or(`host_team_id.eq.${liveTeam.id},opponent_team_id.eq.${liveTeam.id}`)
          .order("scheduled_at", { ascending: false })
          .limit(20),
        supabase.from("profiles").select("avatar_url").eq("id", userId).maybeSingle(),
        supabase
          .from("team_invites")
          .select("id,role,created_at,profiles!team_invites_invited_profile_id_fkey(display_name,username)")
          .eq("team_id", liveTeam.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
      ]);
      if (memberError || matchError) setTeamError(memberError?.message ?? matchError?.message ?? "");
      setMembers((memberData ?? []) as unknown as typeof members);
      setMatches((matchData ?? []) as unknown as LiveScrim[]);
      setProfileAvatar(profileData?.avatar_url ?? null);
      setSentInvites((sentData ?? []) as unknown as typeof sentInvites);
      setLoading(false);
    }
    void loadTeam();
    // Reload after an invitation response or membership change.
  }, [userId, reloadKey]);

  if (loading) return <section className="app-page team-page"><div className="live-empty">Loading your team…</div></section>;
  async function respondToInvite(inviteId: string, accept: boolean) {
    setMembershipBusy(true);
    setTeamError("");
    const { error } = await supabase.rpc("respond_to_team_invite", { target_invite: inviteId, accept_invite: accept });
    if (error) setTeamError(error.message);
    else {
      const acceptedTeam = pendingInvites.find((invite) => invite.id === inviteId)?.teams.name;
      window.dispatchEvent(new CustomEvent("tru-identity-updated", { detail: { teamName: accept ? acceptedTeam : undefined } }));
      setReloadKey((value) => value + 1);
    }
    setMembershipBusy(false);
  }

  if (!team) return <section className="app-page team-page">
    <PageIntro kicker="Team Command Center" title="YOU ARE NOT ON A TEAM YET." copy="Create your first team from the Scrims page or accept an invitation below." />
    {teamError && <div className="scrim-system-error"><strong>My Team error</strong><span>{teamError}</span><button onClick={() => setTeamError("")}>×</button></div>}
    {pendingInvites.length > 0 && <div className="panel-card membership-panel"><div className="card-label"><span>Pending team invitations</span><b>{pendingInvites.length}</b></div>{pendingInvites.map((invite) => <article className="invite-row" key={invite.id}><TeamBadge tag={invite.teams.tag} imageUrl={invite.teams.logo_url} /><div><strong>{invite.teams.name}</strong><span>Invited as {invite.role}</span></div><button disabled={membershipBusy} onClick={() => void respondToInvite(invite.id, true)}>Accept</button><button className="wide-outline" disabled={membershipBusy} onClick={() => void respondToInvite(invite.id, false)}>Decline</button></article>)}</div>}
  </section>;

  const currentTeam = team;
  const totalGames = currentTeam.wins + currentTeam.losses;
  const winRate = totalGames ? Math.round((currentTeam.wins / totalGames) * 100) : 0;
  const activeMatches = matches.filter((match) => !["completed", "cancelled"].includes(match.status));
  const completedMatches = matches.filter((match) => match.status === "completed");
  const canManageTeam = currentTeam.role === "captain" || currentTeam.role === "manager";

  async function uploadPicture(file: File, kind: "profile" | "team") {
    if (!file.type.startsWith("image/")) return setTeamError("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return setTeamError("Images must be 5 MB or smaller.");
    setUploading(kind);
    setTeamError("");
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const bucket = kind === "profile" ? "profile-images" : "team-images";
    const owner = kind === "profile" ? userId : currentTeam.id;
    const path = `${owner}/${kind}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setTeamError(uploadError.message);
      setUploading(null);
      return;
    }
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;
    const { error: saveError } = kind === "profile"
      ? await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId)
      : await supabase.from("teams").update({ logo_url: publicUrl }).eq("id", currentTeam.id);
    if (saveError) setTeamError(saveError.message);
    else if (kind === "profile") {
      setProfileAvatar(publicUrl);
      window.dispatchEvent(new CustomEvent("tru-identity-updated", { detail: { avatarUrl: publicUrl } }));
    } else {
      setTeam({ ...currentTeam, logo_url: publicUrl });
    }
    setUploading(null);
  }

  async function invitePlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteTarget.trim()) return;
    setMembershipBusy(true);
    setTeamError("");
    const { error } = await supabase.rpc("invite_player_to_my_team", {
      target_identity: inviteTarget.trim(),
      target_role: inviteRole,
    });
    if (error) setTeamError(error.message);
    else {
      setInviteTarget("");
      setReloadKey((value) => value + 1);
    }
    setMembershipBusy(false);
  }

  async function leaveTeam() {
    if (!window.confirm(`Leave ${currentTeam.name}? You will lose access to its private scrim rooms.`)) return;
    setMembershipBusy(true);
    setTeamError("");
    const { error } = await supabase.rpc("leave_my_team");
    if (error) setTeamError(error.message);
    else {
      window.dispatchEvent(new CustomEvent("tru-identity-updated", { detail: { teamName: "No team yet" } }));
      setReloadKey((value) => value + 1);
    }
    setMembershipBusy(false);
  }

  return <section className="app-page team-page">
    <PageIntro kicker="Team Command Center" title="YOUR TEAM. ONE PLACE." copy={`Manage ${team.name}, track team ELO, and prepare for upcoming scrims.`} />
    {teamError && <div className="scrim-system-error"><strong>My Team error</strong><span>{teamError}</span><button onClick={() => setTeamError("")}>×</button></div>}
    <div className="picture-settings panel-card">
      <div><Avatar initials="ME" imageUrl={profileAvatar} /><span><strong>Your profile picture</strong><small>JPG, PNG or WebP · maximum 5 MB</small></span><label className="wide-outline">{uploading === "profile" ? "Uploading…" : "Upload profile picture"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={Boolean(uploading)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPicture(file, "profile"); }} /></label></div>
      {canManageTeam && <div><TeamBadge tag={team.tag} imageUrl={team.logo_url} /><span><strong>Team picture</strong><small>Visible on your team dashboard</small></span><label className="wide-outline">{uploading === "team" ? "Uploading…" : "Upload team picture"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={Boolean(uploading)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPicture(file, "team"); }} /></label></div>}
    </div>
    <div className="membership-panel panel-card">
      {canManageTeam && <form onSubmit={invitePlayer}><div><strong>Invite a player</strong><small>Enter their Tru username or exact display name.</small></div><input value={inviteTarget} onChange={(event) => setInviteTarget(event.target.value)} placeholder="@username or display name" required /><select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as "player" | "substitute")}><option value="player">Player</option><option value="substitute">Substitute</option></select><button className="button button--small" disabled={membershipBusy}>{membershipBusy ? "Please wait…" : "Send invitation"}</button></form>}
      <div className="membership-leave"><span><strong>Leave team</strong><small>Team owners must transfer ownership before leaving.</small></span><button className="wide-outline" disabled={membershipBusy} onClick={() => void leaveTeam()}>Leave {currentTeam.name}</button></div>
      {canManageTeam && sentInvites.length > 0 && <div><div className="card-label"><span>Pending invitations</span><b>{sentInvites.length}</b></div>{sentInvites.map((invite) => <div className="invite-row" key={invite.id}><Avatar initials={(invite.profiles.display_name || "P").slice(0, 2).toUpperCase()} /><div><strong>{invite.profiles.display_name}</strong><span>@{invite.profiles.username ?? "username-not-set"} · {invite.role}</span></div><em>Pending</em></div>)}</div>}
      {pendingInvites.length > 0 && <div><div className="card-label"><span>Other team invitations</span><b>{pendingInvites.length}</b></div>{pendingInvites.map((invite) => <div className="invite-row" key={invite.id}><TeamBadge tag={invite.teams.tag} imageUrl={invite.teams.logo_url} /><div><strong>{invite.teams.name}</strong><span>Leave your current team before accepting.</span></div><button disabled={membershipBusy} onClick={() => void respondToInvite(invite.id, false)}>Decline</button></div>)}</div>}
    </div>
    <article className="team-hero panel-card">
      <div className="team-hero-mark"><TeamBadge tag={team.tag} imageUrl={team.logo_url} /><span>Your team</span></div>
      <div className="team-hero-copy"><div><span className="team-tag">{team.tag} · {team.region}</span><span className="role-chip">{team.role}</span></div><h2>{team.name}</h2><p>Valorant Mobile · Tru competitive community</p></div>
      <div className="team-hero-stats">
        <div><span>Team ELO</span><strong>{team.elo}</strong><small>Live ranking score</small></div>
        <div><span>Record</span><strong>{team.wins}–{team.losses}</strong><small>{winRate}% win rate</small></div>
        <div><span>Members</span><strong>{members.length}</strong><small>{members.filter((member) => member.is_active_lineup).length} active lineup</small></div>
      </div>
    </article>
    <div className="team-page-tabs" role="tablist">
      <button className={section === "overview" ? "active" : ""} onClick={() => setSection("overview")}>Overview</button>
      <button className={section === "roster" ? "active" : ""} onClick={() => setSection("roster")}>Roster <b>{members.length}</b></button>
    </div>
    {section === "overview" && <div className="team-overview-grid"><div className="team-overview-main">
      <article className="next-scrim-card panel-card"><div className="card-label"><span>Active scrims</span><b>{activeMatches.length}</b></div>{activeMatches.length === 0 ? <p className="live-empty">No active scrims. Post availability from the Scrims page.</p> : activeMatches.map((match) => <div className="invite-row" key={match.id}><TeamBadge tag={match.host_team.tag} /><div><strong>{match.host_team.name} vs {match.opponent_team?.name ?? "Waiting for opponent"}</strong><span>{match.format} · {new Date(match.scheduled_at).toLocaleString()}</span></div><em>{match.status.replaceAll("_", " ")}</em></div>)}</article>
      <article className="team-lineup-card panel-card"><div className="card-label"><span>Current members</span><button onClick={() => setSection("roster")}>View roster →</button></div><div className="team-lineup-table">{members.slice(0, 5).map((member, index) => { const name = member.profiles.display_name || "Tru member"; return <div key={member.profile_id}><span className="lineup-number">{String(index + 1).padStart(2, "0")}</span><Avatar initials={name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()} /><span><strong>{name}</strong><small>@{member.profiles.username ?? "tru-member"}</small></span><b>{member.game_role ?? member.role}</b><span className="member-status"><i />{member.is_active_lineup ? "Active" : "Substitute"}</span></div>; })}</div></article>
    </div><aside className="team-overview-aside"><article className="team-activity-card panel-card"><div className="card-label"><span>Recent results</span><b>{completedMatches.length}</b></div>{completedMatches.length === 0 ? <p>No completed matches yet.</p> : completedMatches.slice(0, 5).map((match) => <div key={match.id}><span className="activity-icon">✓</span><p><strong>{match.host_team.name} vs {match.opponent_team?.name}</strong><small>{match.format} · Completed</small></p><time>{new Date(match.scheduled_at).toLocaleDateString()}</time></div>)}</article></aside></div>}
    {section === "roster" && <div className="full-roster panel-card"><div className="full-roster-head"><div><h3>TEAM ROSTER</h3><p>Live members stored in Supabase.</p></div><span>{members.length} members</span></div><div className="roster-columns"><span>Player</span><span>Role</span><span>Team access</span><span>Status</span><span>Lineup</span><span /></div>{members.map((member) => { const name = member.profiles.display_name || "Tru member"; return <article key={member.profile_id}><div><Avatar initials={name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()} /><span><strong>{name}</strong><small>@{member.profiles.username ?? "tru-member"}</small></span></div><b>{member.game_role ?? "Unassigned"}</b><strong>{member.role}</strong><span className="member-status"><i />Member</span><span className="access-chip">{member.is_active_lineup ? "Active lineup" : "Substitute"}</span><span /></article>; })}</div>}
  </section>;
}

// Legacy visual prototype retained for reference while V1 uses LiveMyTeamView.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MyTeamView({
  onManage,
  onOpenMatch,
  onToast,
}: {
  onManage: () => void;
  onOpenMatch: () => void;
  onToast: (message: string) => void;
}) {
  const [section, setSection] = useState<"overview" | "roster" | "invites">("overview");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Flex");
  const teamMembers = [
    { name: "Kyo", handle: "@kyo.tru", role: "Duelist", initials: "KY", elo: 1782, status: "Online", captain: true },
    { name: "Mira", handle: "@miralocks", role: "Controller", initials: "MI", elo: 1705, status: "Online", captain: false },
    { name: "Raven", handle: "@ravenvm", role: "Initiator", initials: "RA", elo: 1738, status: "In game", captain: false },
    { name: "Sage", handle: "@sagewall", role: "Sentinel", initials: "SA", elo: 1694, status: "Offline", captain: false },
    { name: "Flux", handle: "@fluxfive", role: "Flex", initials: "FL", elo: 1716, status: "Online", captain: false },
  ];

  function sendInvite(event: FormEvent) {
    event.preventDefault();
    if (!inviteName.trim()) return;
    onToast(`Invite sent to ${inviteName.trim()} as ${inviteRole}`);
    setInviteName("");
    setInviteOpen(false);
    setSection("invites");
  }

  return (
    <section className="app-page team-page">
      <PageIntro
        kicker="Team Command Center"
        title="YOUR TEAM. ONE PLACE."
        copy="Manage your lineup, track team ELO, prepare for scrims, and control who represents Tru Phantoms."
        action={<button className="button button--outline" onClick={onManage}>⚙ Edit team</button>}
      />

      <article className="team-hero panel-card">
        <div className="team-hero-mark"><TruMark /><span>Verified team</span></div>
        <div className="team-hero-copy">
          <div><span className="team-tag">TRU · PHILIPPINES</span><span className="role-chip">Competitive</span></div>
          <h2>TRU PHANTOMS</h2>
          <p>Valorant Mobile · Established 2026</p>
          <div className="team-form">{["W", "W", "W", "L", "W"].map((result, index) => <b className={result === "W" ? "win" : "loss"} key={`${result}-${index}`}>{result}</b>)}<span>Last 5 matches</span></div>
        </div>
        <div className="team-hero-stats">
          <div><span>Team ELO</span><strong>1724</strong><small>▲ 68 this season</small></div>
          <div><span>SEA rank</span><strong>#03</strong><small>Immortal Division</small></div>
          <div><span>Record</span><strong>26–10</strong><small>72% win rate</small></div>
        </div>
      </article>

      <div className="team-page-tabs" role="tablist" aria-label="Team dashboard sections">
        <button className={section === "overview" ? "active" : ""} onClick={() => setSection("overview")}>Overview</button>
        <button className={section === "roster" ? "active" : ""} onClick={() => setSection("roster")}>Roster <b>5</b></button>
        <button className={section === "invites" ? "active" : ""} onClick={() => setSection("invites")}>Invites <b>2</b></button>
        <button className="invite-player-button" onClick={() => setInviteOpen(true)}>＋ Invite player</button>
      </div>

      {section === "overview" && <div className="team-overview-grid">
        <div className="team-overview-main">
          <article className="next-scrim-card panel-card">
            <div className="card-label"><span>Next confirmed scrim</span><b>Today · 9:30 PM</b></div>
            <div className="next-match">
              <div><TruMark compact /><strong>TRU PHANTOMS</strong><span>1724 ELO</span></div>
              <div><span>BO3 · SEA</span><b>VS</b><small>Starts in 01:42:18</small></div>
              <div><TeamBadge tag="NOVA" /><strong>NOVA CORE</strong><span>1648 ELO</span></div>
            </div>
            <div className="next-match-meta"><span>First map · Ascent</span><span>10 / 10 players ready</span><button onClick={onOpenMatch}>Enter private room →</button></div>
          </article>

          <article className="team-lineup-card panel-card">
            <div className="card-label"><span>Starting lineup</span><button onClick={() => setSection("roster")}>Manage roster →</button></div>
            <div className="team-lineup-table">
              {teamMembers.map((member, index) => <div key={member.name}>
                <span className="lineup-number">{String(index + 1).padStart(2, "0")}</span>
                <Avatar initials={member.initials} />
                <span><strong>{member.name}{member.captain && <i>Captain</i>}</strong><small>{member.handle}</small></span>
                <b>{member.role}</b>
                <span className={`member-status ${member.status === "Offline" ? "offline" : ""}`}><i />{member.status}</span>
              </div>)}
            </div>
          </article>
        </div>

        <aside className="team-overview-aside">
          <article className="team-season-card panel-card">
            <div className="card-label"><span>Season progress</span><b>S01</b></div>
            <div className="rank-orbit"><div><strong>#03</strong><span>SEA</span></div></div>
            <h3>Immortal Division</h3>
            <p><b>76 ELO</b> to Challenger</p>
            <i><span style={{ width: "72%" }} /></i>
            <div><span>Current 1724</span><span>Next 1800</span></div>
          </article>

          <article className="team-activity-card panel-card">
            <div className="card-label"><span>Team activity</span><button>See all</button></div>
            <div><span className="activity-icon">✓</span><p><strong>Result verified</strong><small>2–0 vs Crimson Tide · +24 ELO</small></p><time>2d</time></div>
            <div><span className="activity-icon">＋</span><p><strong>Mira joined the lineup</strong><small>Controller · Starting five</small></p><time>4d</time></div>
            <div><span className="activity-icon">◇</span><p><strong>Reached Immortal</strong><small>Team ELO crossed 1600</small></p><time>8d</time></div>
          </article>
        </aside>
      </div>}

      {section === "roster" && <div className="full-roster panel-card">
        <div className="full-roster-head"><div><h3>ACTIVE LINEUP</h3><p>These five players receive access to accepted scrim rooms.</p></div><span>5 / 5 locked</span></div>
        <div className="roster-columns"><span>Player</span><span>Role</span><span>Player ELO</span><span>Status</span><span>Access</span><span /></div>
        {teamMembers.map((member) => <article key={member.name}>
          <div><Avatar initials={member.initials} /><span><strong>{member.name}{member.captain && <i>Captain</i>}</strong><small>{member.handle}</small></span></div>
          <b>{member.role}</b><strong>{member.elo}</strong>
          <span className={`member-status ${member.status === "Offline" ? "offline" : ""}`}><i />{member.status}</span>
          <span className="access-chip">Scrim enabled</span>
          <button aria-label={`More options for ${member.name}`}>•••</button>
        </article>)}
        <footer><span>⌾ Private scrim access follows this locked lineup.</span><button className="wide-outline" onClick={() => setInviteOpen(true)}>＋ Invite sixth player or substitute</button></footer>
      </div>}

      {section === "invites" && <div className="team-invites-grid">
        <article className="panel-card">
          <div className="card-label"><span>Sent invitations</span><b>1 pending</b></div>
          <div className="invite-row"><Avatar initials="ZE" /><div><strong>Zen</strong><span>@zenmobile · Substitute</span></div><em>Expires in 2 days</em><button>Cancel</button></div>
          <button className="wide-outline" onClick={() => setInviteOpen(true)}>＋ Invite another player</button>
        </article>
        <article className="panel-card">
          <div className="card-label"><span>Team applications</span><b>1 new</b></div>
          <div className="application-row"><Avatar initials="NO" /><div><strong>Noah V.</strong><span>Controller · 1688 ELO</span><small>“Available nightly after 8 PM.”</small></div><button onClick={() => onToast("Noah’s application accepted")}>Accept</button><button onClick={() => onToast("Application declined")}>Decline</button></div>
        </article>
      </div>}

      {inviteOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setInviteOpen(false)}>
        <section className="invite-modal" role="dialog" aria-modal="true" aria-label="Invite player" onMouseDown={(event) => event.stopPropagation()}>
          <button className="modal-close" onClick={() => setInviteOpen(false)} aria-label="Close">×</button>
          <p className="eyebrow">Team invitation</p><h2>ADD TO YOUR LINEUP.</h2><p>Invite a player by their Tru username. They must accept before receiving scrim-room access.</p>
          <form onSubmit={sendInvite}>
            <label>Player username<input value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="@playername" /></label>
            <label>Team role<select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}><option>Substitute</option><option>Duelist</option><option>Controller</option><option>Initiator</option><option>Sentinel</option><option>Flex</option></select></label>
            <div className="secure-callout"><strong>⌾ Access stays protected</strong><p>Invited players cannot enter private match rooms until they accept and are added to the confirmed lineup.</p></div>
            <button className="button" disabled={!inviteName.trim()}>Send invitation →</button>
          </form>
        </section>
      </div>}
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RankingsPreviewView() {
  const [period, setPeriod] = useState("Season 01");
  return (
    <section className="app-page">
      <PageIntro
        kicker="Competitive Rankings"
        title="EARN YOUR PLACE."
        copy="Verified scrim results power the Tru ladder. Win against stronger teams, gain more ELO, and climb through the divisions."
        action={<label className="period-select">Ranking period<select value={period} onChange={(e) => setPeriod(e.target.value)}><option>Season 01</option><option>Last 30 days</option><option>All time</option></select></label>}
      />

      <div className="podium">
        {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry) => (
          <article className={entry.rank === 1 ? "podium-card podium-card--winner" : "podium-card"} key={entry.team}>
            <span className="podium-rank">{String(entry.rank).padStart(2, "0")}</span>
            <TeamBadge tag={entry.tag} tru={entry.tag === "TRU"} />
            <strong>{entry.team}</strong><span>{entry.elo} ELO</span><small>{entry.record} record</small>
          </article>
        ))}
      </div>

      <div className="ranking-table panel-card">
        <div className="ranking-table-head"><span>Rank</span><span>Team</span><span>ELO</span><span>Record</span><span>Win streak</span><span>Movement</span></div>
        {leaderboard.map((entry) => (
          <div className={entry.tag === "TRU" ? "ranking-row ranking-row--tru" : "ranking-row"} key={entry.team}>
            <b>{String(entry.rank).padStart(2, "0")}</b>
            <div><TeamBadge tag={entry.tag} tru={entry.tag === "TRU"} /><span><strong>{entry.team}</strong><small>{entry.tag} · SEA</small></span></div>
            <strong>{entry.elo}</strong><span>{entry.record}</span><span>{entry.streak} wins</span><em>{entry.movement}</em>
          </div>
        ))}
      </div>

      <div className="elo-explainer">
        <div><span>DIVISION 01</span><strong>Challenger</strong><small>1800+ ELO</small></div>
        <div><span>DIVISION 02</span><strong>Immortal</strong><small>1600–1799</small></div>
        <div><span>DIVISION 03</span><strong>Ascendant</strong><small>1400–1599</small></div>
        <div><span>DIVISION 04</span><strong>Diamond</strong><small>1200–1399</small></div>
      </div>
    </section>
  );
}

type RankedTeam = { id: string; name: string; tag: string; region: string; elo: number; wins: number; losses: number };

function RankingsView() {
  const [teams, setTeams] = useState<RankedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingError, setRankingError] = useState("");

  async function loadRankings() {
    const { data, error } = await supabase.from("teams").select("id,name,tag,region,elo,wins,losses").order("elo", { ascending: false }).order("wins", { ascending: false });
    if (error) setRankingError(error.message); else setTeams((data ?? []) as RankedTeam[]);
    setLoading(false);
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadRankings(), 0);
    const channel = supabase.channel("team-rankings").on("postgres_changes", { event: "*", schema: "public", table: "teams" }, () => void loadRankings()).subscribe();
    return () => { window.clearTimeout(initialLoad); void supabase.removeChannel(channel); };
  }, []);

  function division(elo: number) {
    if (elo >= 1800) return "Challenger";
    if (elo >= 1600) return "Immortal";
    if (elo >= 1400) return "Ascendant";
    if (elo >= 1200) return "Diamond";
    return "Platinum";
  }

  const podiumOrder = teams.length >= 3 ? [teams[1], teams[0], teams[2]] : teams;
  return <section className="app-page live-rankings-page">
    <PageIntro kicker="Live Competitive Rankings" title="EARN YOUR PLACE." copy="Confirmed scrim results automatically update team records, ELO, and the Tru ladder." action={<button className="wide-outline" onClick={() => void loadRankings()}>Refresh rankings</button>} />
    {rankingError && <div className="scrim-system-error"><strong>Rankings error</strong><span>{rankingError}</span></div>}
    {!loading && teams.length >= 1 && <div className="podium">{podiumOrder.map((team) => { const rank = teams.findIndex((entry) => entry.id === team.id) + 1; return <article className={rank === 1 ? "podium-card podium-card--winner" : "podium-card"} key={team.id}><span className="podium-rank">{String(rank).padStart(2, "0")}</span><TeamBadge tag={team.tag} tru={team.tag === "TRU"} /><strong>{team.name}</strong><span>{team.elo} ELO</span><small>{team.wins}–{team.losses} record</small></article>; })}</div>}
    <div className="ranking-table panel-card">
      <div className="ranking-table-head"><span>Rank</span><span>Team</span><span>ELO</span><span>Record</span><span>Win rate</span><span>Division</span></div>
      {loading ? <div className="live-empty">Loading live rankings…</div> : teams.length === 0 ? <div className="live-empty"><TruMark compact /><strong>No ranked teams yet.</strong><span>Create a team and complete a confirmed scrim to enter the ladder.</span></div> : teams.map((team, index) => {
        const games = team.wins + team.losses;
        const winRate = games ? Math.round((team.wins / games) * 100) : 0;
        return <div className={team.tag === "TRU" ? "ranking-row ranking-row--tru" : "ranking-row"} key={team.id}><b>{String(index + 1).padStart(2, "0")}</b><div><TeamBadge tag={team.tag} tru={team.tag === "TRU"} /><span><strong>{team.name}</strong><small>{team.tag} · {team.region}</small></span></div><strong>{team.elo}</strong><span>{team.wins}–{team.losses}</span><span>{winRate}%</span><em>{division(team.elo)}</em></div>;
      })}
    </div>
    <div className="elo-explainer"><div><span>DIVISION 01</span><strong>Challenger</strong><small>1800+ ELO</small></div><div><span>DIVISION 02</span><strong>Immortal</strong><small>1600–1799</small></div><div><span>DIVISION 03</span><strong>Ascendant</strong><small>1400–1599</small></div><div><span>DIVISION 04</span><strong>Diamond</strong><small>1200–1399</small></div></div>
  </section>;
}

function AuthModal({
  mode,
  onClose,
  onSuccess,
}: {
  mode: "login" | "join";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState(mode);
  const [done, setDone] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitAuth(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setAuthError("");

    const result = tab === "join"
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: window.location.origin,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);
    if (result.error) {
      const rawMessage = String(result.error.message ?? "").trim();
      const unusableMessage = !rawMessage || rawMessage === "0" || rawMessage === "[object Object]";
      setAuthError(
        unusableMessage
          ? tab === "join"
            ? "We couldn't create your account or send the confirmation email. Please check the email address and try again. If this continues, the site's email service needs attention."
            : "We couldn't log you in. Please check your email and password, then try again."
          : rawMessage,
      );
      return;
    }

    if (tab === "join" && !result.data.session) {
      setNeedsConfirmation(true);
    }
    setDone(true);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-label={tab === "join" ? "Join Tru" : "Log in"} onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <TruMark />
        {done ? (
          <div className="success-state"><span>✓</span><h2>{needsConfirmation ? "CHECK YOUR EMAIL." : tab === "join" ? "WELCOME TO TRU." : "WELCOME BACK."}</h2><p>{needsConfirmation ? "Use the confirmation link from Supabase, then return here and log in." : "Your account is ready. Continue to the page you were using."}</p>{needsConfirmation ? <button className="button" onClick={onClose}>Close</button> : <button className="button" onClick={onSuccess}>Continue</button>}</div>
        ) : (
          <>
            <p className="eyebrow">Welcome to Tru</p>
            <h2>{tab === "join" ? "CREATE YOUR PLAYER PROFILE." : "WELCOME BACK."}</h2>
            <div className="auth-tabs"><button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>Log in</button><button className={tab === "join" ? "active" : ""} onClick={() => setTab("join")}>Create account</button></div>
            <form onSubmit={submitAuth}>
              {tab === "join" && <label>Display name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your community name" /></label>}
              <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              <label>Password<input required minLength={tab === "join" ? 8 : undefined} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={tab === "join" ? "At least 8 characters" : "Your password"} /></label>
              {authError && <p className="auth-error" role="alert">{authError}</p>}
              <button className="button" type="submit" disabled={submitting}>{submitting ? "Please wait…" : tab === "join" ? "Join the community" : "Log in"}</button>
            </form>
            <p className="auth-note">Accounts are securely managed by Supabase.</p>
          </>
        )}
      </section>
    </div>
  );
}

function RecruitmentModal({
  track,
  onClose,
}: {
  track: "player" | "staff";
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="recruit-modal" role="dialog" aria-modal="true" aria-label={`${track} application`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        {submitted ? <div className="success-state"><span>✓</span><h2>APPLICATION READY.</h2><p>Thanks for choosing Tru. This V1 preview shows the full application flow; submissions will connect to the live database in the production build.</p><button className="button" onClick={onClose}>Return home</button></div> : <>
          <p className="eyebrow">{track === "player" ? "Player applications" : "Staff applications"}</p>
          <h2>{track === "player" ? "COMPETE WITH TRU." : "BUILD WITH TRU."}</h2>
          <p>Tell us where you can make the biggest impact. Our team will review your profile and contact you through Discord.</p>
          <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
            <div className="split-fields">
              <label>Display name<input required placeholder="Your name or IGN" /></label>
              <label>Discord username<input required placeholder="@username" /></label>
            </div>
            <div className="split-fields">
              <label>Region<select defaultValue="Philippines"><option>Philippines</option><option>SEA</option><option>Other</option></select></label>
              <label>{track === "player" ? "Main role" : "Department"}<select defaultValue={track === "player" ? "Duelist" : "Team Management"}>{track === "player" ? <><option>Duelist</option><option>Controller</option><option>Initiator</option><option>Sentinel</option><option>Flex</option><option>Content Creator</option></> : <><option>Team Management</option><option>Events</option><option>Content</option><option>Design</option><option>Community</option><option>Partnerships</option></>}</select></label>
            </div>
            <label>Tell us about yourself<textarea required placeholder={track === "player" ? "Rank, experience, availability, and what you want to achieve…" : "Experience, availability, and how you want to help Tru grow…"} /></label>
            <button className="button" type="submit">Submit application →</button>
          </form>
          <p className="auth-note">Interactive V1 preview — no application data is saved yet.</p>
        </>}
      </section>
    </div>
  );
}

function TeamModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [created, setCreated] = useState(false);
  const [teamName, setTeamName] = useState("Tru Phantoms");
  const [teamTag, setTeamTag] = useState("TRU");
  const [region, setRegion] = useState("Philippines");
  const [goal, setGoal] = useState("Competitive");
  const [roster, setRoster] = useState([
    { name: "Kyo", role: "Duelist" },
    { name: "Mira", role: "Controller" },
    { name: "Raven", role: "Initiator" },
    { name: "Sage", role: "Sentinel" },
    { name: "Flux", role: "Flex" },
  ]);

  function updatePlayer(index: number, key: "name" | "role", value: string) {
    setRoster(roster.map((player, playerIndex) => playerIndex === index ? { ...player, [key]: value } : player));
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="team-builder" role="dialog" aria-modal="true" aria-label="Create a team" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        {created ? <div className="success-state"><span>✓</span><h2>TEAM READY.</h2><p>{teamName} is ready for verification. Invite links and scrim access will appear in your team dashboard.</p><button className="button" onClick={onClose}>Open team dashboard</button></div> :
          <div className="builder-layout">
            <aside className="builder-aside">
              <p className="eyebrow">Team studio</p><h2>BUILD YOUR FIVE.</h2>
              <div className="team-logo-preview"><span>{teamTag.slice(0, 3) || "TRU"}</span><button>＋ Upload logo</button></div>
              <div className="builder-progress">
                {[["01", "Identity"], ["02", "Roster"], ["03", "Review"]].map(([number, label], index) => <button key={label} className={step === index + 1 ? "active" : step > index + 1 ? "complete" : ""} onClick={() => setStep(index + 1)}><b>{step > index + 1 ? "✓" : number}</b><span>{label}<small>{index === 0 ? "Name and region" : index === 1 ? "Lock your lineup" : "Privacy and access"}</small></span></button>)}
              </div>
              <p>Changes are local to this interactive UI preview.</p>
            </aside>

            <div className="builder-main">
              {step === 1 && <div className="builder-step">
                <div><span>Step 1 of 3</span><h3>Give your team an identity.</h3><p>This is how you appear in scrims, rankings, and community posts.</p></div>
                <div className="builder-fields">
                  <label>Team name<input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Tru Phantoms" /></label>
                  <div className="split-fields"><label>Team tag<input value={teamTag} onChange={(e) => setTeamTag(e.target.value.toUpperCase().slice(0, 5))} maxLength={5} /></label><label>Region<select value={region} onChange={(e) => setRegion(e.target.value)}><option>Philippines</option><option>SEA</option><option>Singapore</option></select></label></div>
                  <label>Team goal<div className="goal-options">{["Competitive", "Casual", "Academy"].map((option) => <button type="button" key={option} className={goal === option ? "active" : ""} onClick={() => setGoal(option)}><b>{option === "Competitive" ? "◇" : option === "Casual" ? "◎" : "△"}</b>{option}<small>{option === "Competitive" ? "Ranked scrims and ELO" : option === "Casual" ? "Practice and community" : "Develop new talent"}</small></button>)}</div></label>
                </div>
              </div>}

              {step === 2 && <div className="builder-step">
                <div><span>Step 2 of 3</span><h3>Lock your starting lineup.</h3><p>Five active players are required before your team can enter matchmaking.</p></div>
                <div className="roster-builder">
                  {roster.map((player, index) => <div className="roster-slot" key={index}><b>{String(index + 1).padStart(2, "0")}</b><span className="lineup-avatar">{player.name.slice(0, 2).toUpperCase() || "?"}</span><label>Player<input value={player.name} onChange={(e) => updatePlayer(index, "name", e.target.value)} placeholder="@username" /></label><label>Role<select value={player.role} onChange={(e) => updatePlayer(index, "role", e.target.value)}><option>Duelist</option><option>Controller</option><option>Initiator</option><option>Sentinel</option><option>Flex</option></select></label><span className="slot-ready">Ready</span></div>)}
                </div>
                <div className="roster-tip">⌾ Players must accept their invite before the lineup is verified.</div>
              </div>}

              {step === 3 && <div className="builder-step">
                <div><span>Step 3 of 3</span><h3>Review your team.</h3><p>You can edit these details anytime from the team dashboard.</p></div>
                <div className="team-review">
                  <div className="review-identity"><div className="team-logo-preview"><span>{teamTag || "TRU"}</span></div><div><h4>{teamName || "Untitled team"}</h4><p>{teamTag} · {region} · {goal}</p></div><b>5 / 5 ready</b></div>
                  <div className="review-roster">{roster.map((player) => <span key={player.name}><i>{player.name.slice(0, 2).toUpperCase()}</i><strong>{player.name}</strong><small>{player.role}</small></span>)}</div>
                  <div className="secure-callout"><strong>⌾ Match-room access</strong><p>When a scrim is accepted, only both confirmed five-player lineups plus their captains or managers can view chat, room codes, and results.</p></div>
                </div>
              </div>}

              <footer className="builder-footer"><button className="text-button" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? "Cancel" : "← Back"}</button><span>Step {step} / 3</span><button className="button button--small" onClick={() => step < 3 ? setStep(step + 1) : setCreated(true)} disabled={!teamName.trim() || !teamTag.trim()}>{step < 3 ? "Continue →" : "Create team →"}</button></footer>
            </div>
          </div>}
      </section>
    </div>
  );
}

function MatchRoom({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { team: "Nova Core", text: "Ready on our side. Sending room code now.", time: "9:21 PM" },
    { team: "Nova Core", text: "Room: TRU-NOVA-728 · Password: 5510", time: "9:22 PM", code: true },
    { team: "Tru Phantoms", text: "Received. Joining in two minutes.", time: "9:22 PM" },
  ]);
  const [draft, setDraft] = useState("");
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSent, setResultSent] = useState(false);

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages([...messages, { team: "Tru Phantoms", text: draft.trim(), time: "now" }]);
    setDraft("");
  }

  return (
    <div className="match-room-overlay">
      <section className="match-room" role="dialog" aria-modal="true" aria-label="Scrim match room">
        <header className="match-room-header">
          <div><span className="room-open"><i /> Live match room</span><h2>TRU PHANTOMS <b>vs</b> NOVA CORE</h2><p>BO3 · SEA · Ascent first map</p></div>
          <button onClick={onClose} aria-label="Close match room">×</button>
        </header>

        <div className="room-privacy-banner"><span>⌾</span><div><strong>Private lineup chat</strong><small>Visible only to both confirmed five-player lineups and their captains or managers.</small></div><b>12 authorized</b></div>

        <div className="room-scorebar">
          <div><TeamBadge tag="TRU" tru /><span><strong>Tru Phantoms</strong><small>1724 ELO</small></span></div>
          <div><strong>5</strong><span>MAP 1 · LIVE</span><strong>5</strong></div>
          <div><span><strong>Nova Core</strong><small>1648 ELO</small></span><TeamBadge tag="NOVA" /></div>
        </div>

        <div className="room-body">
          <aside className="room-rosters">
            <div className="card-label"><span>Match roster</span><b>10 / 10</b></div>
            <h3>Tru Phantoms</h3>{rosters.tru.map((name) => <PlayerRow key={name} name={name} side="tru" />)}
            <h3>Nova Core</h3>{rosters.nova.map((name) => <PlayerRow key={name} name={name} side="nova" />)}
          </aside>

          <div className="room-chat">
            <div className="chat-head"><div><strong>Match chat</strong><span>Community viewers have no access to this room</span></div><button>⋮</button></div>
            <div className="messages">
              {messages.map((message, index) => (
                <div className={message.team === "Tru Phantoms" ? "message message--mine" : "message"} key={`${message.time}-${index}`}>
                  <span>{message.team === "Tru Phantoms" ? "TRU" : "NOVA"}</span>
                  <div><p>{message.text}</p><small>{message.team} · {message.time}</small>{message.code && <button className="copy-code">Copy room details</button>}</div>
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={sendMessage}><label><span className="sr-only">Message</span><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message the other captain…" /></label><button disabled={!draft.trim()}>Send</button></form>
          </div>

          <aside className="room-actions-panel">
            <div className="card-label"><span>Match controls</span></div>
            <div className="access-lock"><span>⌾</span><div><strong>Access locked</strong><small>12 verified members</small></div></div>
            <div className="room-status"><span>Room code</span><strong>TRU-NOVA-728</strong><small>Password 5510</small></div>
            <button className="wide-outline">Copy room code</button>
            <button className="result-button" onClick={() => setResultOpen(true)}>Submit result</button>
            <p>Both captains must confirm the final score before ELO is updated.</p>
          </aside>
        </div>

        {resultOpen && <div className="result-sheet">
          {resultSent ? <div className="success-state"><span>✓</span><h2>RESULT SENT</h2><p>Waiting for Nova Core to confirm the score.</p><button className="wide-outline" onClick={() => setResultOpen(false)}>Close</button></div> : <>
            <div><p className="eyebrow">Submit match result</p><h3>Who won this BO3?</h3></div>
            <button className="modal-close" onClick={() => setResultOpen(false)} aria-label="Close result form">×</button>
            <div className="result-teams"><label><input type="radio" name="winner" defaultChecked /><TeamBadge tag="TRU" tru /><span>Tru Phantoms</span></label><label><input type="radio" name="winner" /><TeamBadge tag="NOVA" /><span>Nova Core</span></label></div>
            <div className="score-inputs"><label>Tru maps<input type="number" defaultValue={2} min={0} max={2} /></label><span>—</span><label>Nova maps<input type="number" defaultValue={1} min={0} max={2} /></label></div>
            <button className="button" onClick={() => setResultSent(true)}>Send for confirmation</button>
          </>}
        </div>}
      </section>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("Home");
  const [authMode, setAuthMode] = useState<"login" | "join" | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("Tru member");
  const [accountTeam, setAccountTeam] = useState("No team yet");
  const [accountAvatar, setAccountAvatar] = useState<string | null>(null);
  const [teamModal, setTeamModal] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [recruitmentTrack, setRecruitmentTrack] = useState<"player" | "staff" | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function loadAccountIdentity(id: string, email?: string) {
      const [{ data: profile }, { data: membership }] = await Promise.all([
        supabase.from("profiles").select("display_name,avatar_url").eq("id", id).maybeSingle(),
        supabase.from("team_members").select("teams!inner(name)").eq("profile_id", id).limit(1).maybeSingle(),
      ]);
      const linkedTeam = membership?.teams as unknown as { name?: string } | null;
      setAccountName(profile?.display_name?.trim() || email?.split("@")[0] || "Tru member");
      setAccountAvatar(profile?.avatar_url ?? null);
      setAccountTeam(linkedTeam?.name || "No team yet");
    }

    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session));
      setUserId(data.session?.user.id ?? null);
      if (data.session?.user.id) void loadAccountIdentity(data.session.user.id, data.session.user.email);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
      setUserId(session?.user.id ?? null);
      if (session?.user.id) void loadAccountIdentity(session.user.id, session.user.email);
      else {
        setAccountName("Tru member");
        setAccountTeam("No team yet");
        setAccountAvatar(null);
      }
    });
    const syncUpdatedIdentity = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl?: string; teamName?: string }>).detail;
      if (detail?.avatarUrl) setAccountAvatar(detail.avatarUrl);
      if (detail?.teamName) setAccountTeam(detail.teamName);
    };
    window.addEventListener("tru-identity-updated", syncUpdatedIdentity);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("tru-identity-updated", syncUpdatedIdentity);
    };
  }, []);

  useEffect(() => {
    function syncOrganizationPage() {
      const hash = window.location.hash;
      if (hash === "#about") setView("About");
      else if (hash === "#teams") setView("Teams");
      else if (hash === "#join") setView("Join Tru");
      else setView("Home");
    }
    syncOrganizationPage();
    window.addEventListener("popstate", syncOrganizationPage);
    return () => window.removeEventListener("popstate", syncOrganizationPage);
  }, []);

  function changeView(next: View) {
    if (next === "My Team" && !loggedIn) {
      setAuthMode("login");
      return;
    }
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function finishAuth() {
    setLoggedIn(true);
    setAuthMode(null);
    setView(view === "Scrims" ? "Scrims" : "My Team");
    showToast(view === "Scrims" ? "Welcome back — Scrims is ready" : "Welcome back — your team dashboard is ready");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await supabase.auth.signOut();
    setLoggedIn(false);
    setUserId(null);
    setView("Home");
    showToast("You are now logged out");
  }

  let currentView: ReactNode;
  if (view === "Scrims") {
    currentView = <ScrimsView userId={userId} loggedIn={loggedIn} onAuthRequired={() => setAuthMode("login")} />;
  } else if (view === "My Team" && loggedIn) {
    currentView = userId ? <LiveMyTeamView userId={userId} /> : <div className="live-empty">Loading your team…</div>;
  } else if (view === "Socials") {
    currentView = <SocialsView userId={userId} loggedIn={loggedIn} onAuthRequired={() => setAuthMode("login")} />;
  } else if (view === "Rankings") {
    currentView = <RankingsView />;
  } else if (view === "About") {
    currentView = <AboutView />;
  } else if (view === "Teams") {
    currentView = <TeamsView onJoin={() => { window.history.pushState(null, "", "/#join"); changeView("Join Tru"); }} />;
  } else if (view === "Join Tru") {
    currentView = <JoinTruView />;
  } else {
    currentView = <HomeView onView={changeView} onApply={setRecruitmentTrack} />;
  }

  const organizationView = view === "Home" || view === "About" || view === "Teams" || view === "Join Tru";

  return (
    <main className="site-shell">
      <div className="ambient ambient--one" /><div className="ambient ambient--two" /><div className="grid-field" />
      {organizationView
        ? <LandingHeader active={view as "Home" | "About" | "Teams" | "Join Tru"} onView={changeView} onEnter={() => { window.history.pushState(null, "", "/"); changeView("Socials"); }} />
        : <Header view={view} onView={changeView} onAuth={setAuthMode} loggedIn={loggedIn} onLogout={logout} displayName={accountName} teamName={accountTeam} avatarUrl={accountAvatar} />}
      <div className="view-shell" key={view}>{currentView}</div>
      {!organizationView && <footer className="site-footer"><div className="brand"><TruMark /><span className="brand-name">TRU</span></div><p>Built for the competitive gaming community.</p><span>be-tru.team · Version 1</span></footer>}
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSuccess={finishAuth} />}
      {recruitmentTrack && <RecruitmentModal track={recruitmentTrack} onClose={() => setRecruitmentTrack(null)} />}
      {teamModal && <TeamModal onClose={() => setTeamModal(false)} />}
      {matchOpen && <MatchRoom onClose={() => setMatchOpen(false)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
