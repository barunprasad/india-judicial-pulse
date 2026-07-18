"use client";

import { useState } from "react";
import { ArrowSquareOut, CheckCircle, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

// A live, one-at-a-time case lookup — exactly as the official portal intends. We never fetch or
// store anything: we validate the CNR, copy it, and hand you to eCourts where you solve the
// security check yourself. No bulk collection, no shortcuts.
const PORTAL = "https://services.ecourts.gov.in/ecourtindia_v6/";
const CNR_RE = /^[A-Z0-9]{16}$/;

function clean(v: string) {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
}

export default function CnrLookup() {
  const [cnr, setCnr] = useState("");
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);

  const valid = CNR_RE.test(cnr);
  const showError = touched && cnr.length > 0 && !valid;

  async function openPortal() {
    if (!valid) {
      setTouched(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(cnr);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the portal still opens and the CNR is on screen to copy.
      setCopied(false);
    }
    window.open(PORTAL, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="cnr">
      <label className="cnr-lab mono" htmlFor="cnr-input">CNR number &mdash; 16 characters</label>
      <div className="cnr-row">
        <input
          id="cnr-input"
          className="cnr-input mono"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="e.g. MHAU01xxxxxx20xx"
          value={cnr}
          aria-invalid={showError || undefined}
          aria-describedby="cnr-help"
          onChange={(e) => { setCnr(clean(e.target.value)); setCopied(false); }}
          onBlur={() => setTouched(true)}
          onKeyDown={(e) => { if (e.key === "Enter") openPortal(); }}
        />
        <button type="button" className="cnr-go" onClick={openPortal} disabled={!valid}>
          <MagnifyingGlass size={16} weight="bold" /> Look it up
          <ArrowSquareOut size={14} />
        </button>
      </div>

      <div className="cnr-meta">
        <span className="cnr-count mono">{cnr.length}/16</span>
        {showError ? (
          <span id="cnr-help" className="cnr-hint err">A CNR is 16 letters and digits, no spaces or dashes.</span>
        ) : copied ? (
          <span id="cnr-help" className="cnr-hint ok"><CheckCircle size={14} weight="fill" /> Copied &mdash; paste it into the &ldquo;CNR Number&rdquo; box on eCourts.</span>
        ) : (
          <span id="cnr-help" className="cnr-hint">We don&rsquo;t send this anywhere &mdash; it opens the official portal, where you finish the search.</span>
        )}
      </div>
    </div>
  );
}
