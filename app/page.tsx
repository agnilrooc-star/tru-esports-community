"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type View = "Home" | "Scrims" | "My Team" | "Socials" | "Rankings";

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

function Avatar({ initials, className = "" }: { initials: string; className?: string }) {
  return <span className={`avatar ${className}`}>{initials}<i /></span>;
}

function TeamBadge({ tag, tru = false }: { tag: string; tru?: boolean }) {
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
}: {
  view: View;
  onView: (view: View) => void;
  onAuth: (mode: "login" | "join") => void;
  loggedIn: boolean;
  onLogout: () => void;
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
              <Avatar initials="DT" />
              <span><strong>Daniel</strong><small>Tru Phantoms</small></span>
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

function LandingHeader({ onEnter }: { onEnter: () => void }) {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="landing-header">
      <button className="landing-logo" onClick={() => scrollTo("landing-home")} aria-label="Tru home"><TruMark /></button>
      <nav aria-label="Tru organization navigation">
        <button className="active" onClick={() => scrollTo("landing-home")}>Home</button>
        <button onClick={() => scrollTo("landing-about")}>About</button>
        <button onClick={() => scrollTo("landing-teams")}>Teams</button>
        <button onClick={() => scrollTo("landing-recruit")}>Join Tru</button>
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

function ScrimsView({
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

function SocialsView({
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

function RankingsView() {
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
          options: { data: { display_name: displayName.trim() } },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);
    if (result.error) {
      setAuthError(result.error.message);
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
          <div className="success-state"><span>✓</span><h2>{needsConfirmation ? "CHECK YOUR EMAIL." : tab === "join" ? "WELCOME TO TRU." : "WELCOME BACK."}</h2><p>{needsConfirmation ? "Use the confirmation link from Supabase, then return here and log in." : "Your account is ready. Your private team dashboard is now available in the navigation."}</p>{needsConfirmation ? <button className="button" onClick={onClose}>Close</button> : <button className="button" onClick={onSuccess}>Open My Team</button>}</div>
        ) : (
          <>
            <p className="eyebrow">Welcome to Tru</p>
            <h2>{tab === "join" ? "CREATE YOUR PLAYER PROFILE." : "WELCOME BACK."}</h2>
            <div className="auth-tabs"><button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>Log in</button><button className={tab === "join" ? "active" : ""} onClick={() => setTab("join")}>Create account</button></div>
            <form onSubmit={submitAuth}>
              {tab === "join" && <label>Display name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your community name" /></label>}
              <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              <label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
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
  const [teamModal, setTeamModal] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [recruitmentTrack, setRecruitmentTrack] = useState<"player" | "staff" | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
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

  function requireLogin(action: () => void) {
    if (!loggedIn) {
      setAuthMode("login");
      return;
    }
    action();
  }

  function finishAuth() {
    setLoggedIn(true);
    setAuthMode(null);
    setView("My Team");
    showToast("Welcome back — your team dashboard is ready");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await supabase.auth.signOut();
    setLoggedIn(false);
    setView("Home");
    showToast("You are now logged out");
  }

  let currentView: ReactNode;
  if (view === "Scrims") {
    currentView = <ScrimsView loggedIn={loggedIn} onAuthRequired={() => setAuthMode("login")} onCreateTeam={() => requireLogin(() => setTeamModal(true))} onOpenMatch={() => requireLogin(() => setMatchOpen(true))} />;
  } else if (view === "My Team" && loggedIn) {
    currentView = <MyTeamView onManage={() => setTeamModal(true)} onOpenMatch={() => setMatchOpen(true)} onToast={showToast} />;
  } else if (view === "Socials") {
    currentView = <SocialsView loggedIn={loggedIn} onAuthRequired={() => setAuthMode("login")} onProfile={(name) => showToast(`${name} profile preview`)} />;
  } else if (view === "Rankings") {
    currentView = <RankingsView />;
  } else {
    currentView = <HomeView onView={changeView} onApply={setRecruitmentTrack} />;
  }

  return (
    <main className="site-shell">
      <div className="ambient ambient--one" /><div className="ambient ambient--two" /><div className="grid-field" />
      {view === "Home"
        ? <LandingHeader onEnter={() => changeView("Socials")} />
        : <Header view={view} onView={changeView} onAuth={setAuthMode} loggedIn={loggedIn} onLogout={logout} />}
      <div className="view-shell" key={view}>{currentView}</div>
      {view !== "Home" && <footer className="site-footer"><div className="brand"><TruMark /><span className="brand-name">TRU</span></div><p>Built for the Valorant Mobile community.</p><span>be-tru.team · Version 1</span></footer>}
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSuccess={finishAuth} />}
      {recruitmentTrack && <RecruitmentModal track={recruitmentTrack} onClose={() => setRecruitmentTrack(null)} />}
      {teamModal && <TeamModal onClose={() => setTeamModal(false)} />}
      {matchOpen && <MatchRoom onClose={() => setMatchOpen(false)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
