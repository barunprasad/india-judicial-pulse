// Pure parser: NJDG njdg_v3 homepage HTML -> structured national snapshot record.
// Grounded in the server-rendered $(document).ready() chart calls, whose arguments
// are stable numeric literals (far more robust than scraping rendered table cells).
//
//   charts(_,_,_, CIVIL_PENDING, CRIMINAL_PENDING, TOTAL_PENDING, ...)
//   pendingAgewiseBarChart('label', 'civilSeries~', 'crimSeries~', 'key', 'pctSeries~')
//   fetchStateData('ins'|'disp'|'citizen'|'women', 1|2|3) -> 1=total 2=civil 3=criminal

export const PARSER_VERSION = '1.0.0';

// Age buckets in the order NJDG emits them (under-1yr first).
export const AGE_BUCKETS = ['under_1yr', 'y1_to_3', 'y3_to_5', 'y5_to_10', 'above_10yr'];

const toInt = (s) => {
  if (s == null) return null;
  const n = Number(String(s).replace(/[^0-9-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

// fetchStateData('<flag>',<idx>) -> integer immediately after the closing '>'
const stateData = (html, flag, idx) => {
  const re = new RegExp(`fetchStateData\\('${flag}',${idx}\\)[^>]*>\\s*([0-9]+)`);
  const m = html.match(re);
  return m ? toInt(m[1]) : null;
};

export function parseNational(html) {
  const errors = [];

  // 1) Total / civil / criminal PENDING — charts() args at indices 3,4,5.
  let pendingCivil = null, pendingCriminal = null, pendingTotal = null, chartsArgs = null;
  const chartsM = html.match(/charts\(([^)]*)\)/);
  if (chartsM) {
    chartsArgs = chartsM[1].split(',').map((a) => a.trim());
    pendingCivil = toInt(chartsArgs[3]);
    pendingCriminal = toInt(chartsArgs[4]);
    pendingTotal = toInt(chartsArgs[5]);
  } else {
    errors.push('charts() call not found');
  }

  // 2) Age profile — civil series, criminal series, percentage series (tilde-separated).
  const ageProfile = {};
  const ageM = html.match(
    /pendingAgewiseBarChart\('[^']*','([^']*)','([^']*)','[^']*','([^']*)'\)/,
  );
  if (ageM) {
    const civilSeries = ageM[1].split('~').map(toInt);
    const crimSeries = ageM[2].split('~').map(toInt);
    const pctSeries = ageM[3].split('~').map(toInt); // "(34%)" -> 34
    AGE_BUCKETS.forEach((b, i) => {
      const civ = civilSeries[i] ?? null;
      const cri = crimSeries[i] ?? null;
      ageProfile[b] = {
        civil: civ,
        criminal: cri,
        total: civ != null && cri != null ? civ + cri : null,
        pct_of_pending: pctSeries[i] ?? null,
      };
    });
  } else {
    errors.push('pendingAgewiseBarChart() call not found');
  }

  // 3) Institution / disposal / demographics (last month).
  const instituted = {
    total: stateData(html, 'ins', 1),
    civil: stateData(html, 'ins', 2),
    criminal: stateData(html, 'ins', 3),
  };
  const disposed = {
    total: stateData(html, 'disp', 1),
    civil: stateData(html, 'disp', 2),
    criminal: stateData(html, 'disp', 3),
  };
  const seniorCitizenFiled = stateData(html, 'citizen', 1);
  const womenFiled = stateData(html, 'women', 1);

  // 4) The page's verbatim "Updated on : DD-MM-YYYY" footer label. NOTE: this is a
  // portal label, NOT a reliable data-as-of date — the live figures move between fetches
  // while this label stays put. Captured for transparency; time is anchored on fetched_at.
  const pageUpdatedM = html.match(/Updated on\s*:?\s*([0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})/i);
  const pageUpdatedLabel = pageUpdatedM ? pageUpdatedM[1] : null;

  // Derived metrics.
  const sumPct = (keys) => {
    const vals = keys.map((k) => ageProfile[k]?.pct_of_pending).filter((v) => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  };
  const monthlyClearanceRate =
    instituted.total && disposed.total
      ? +((disposed.total / instituted.total) * 100).toFixed(2)
      : null;
  const netBacklogChange =
    instituted.total != null && disposed.total != null
      ? instituted.total - disposed.total
      : null;

  return {
    parser_version: PARSER_VERSION,
    court_level: 'district_subordinate',
    scope: 'national',
    page_updated_label: pageUpdatedLabel,
    pending: { total: pendingTotal, civil: pendingCivil, criminal: pendingCriminal },
    last_month: {
      instituted,
      disposed,
      monthly_clearance_rate_pct: monthlyClearanceRate,
      net_backlog_change: netBacklogChange,
    },
    age_profile: ageProfile,
    derived: {
      pct_pending_over_3yr: sumPct(['y3_to_5', 'y5_to_10', 'above_10yr']),
      pct_pending_over_5yr: sumPct(['y5_to_10', 'above_10yr']),
    },
    litigants: { senior_citizen_filed: seniorCitizenFiled, women_filed: womenFiled },
    _raw: { charts_args: chartsArgs },
    _errors: errors,
  };
}
