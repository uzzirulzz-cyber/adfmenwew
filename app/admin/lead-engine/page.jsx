import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getLeadEngineUrl() {
  const configuredUrl = process.env.LEAD_ENGINE_APP_URL?.trim();
  if (!configuredUrl) return { url: null, error: null };

  try {
    const url = new URL(configuredUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      return { url: null, error: 'LEAD_ENGINE_APP_URL must be an HTTP(S) URL without embedded credentials.' };
    }
    return { url: url.toString(), error: null };
  } catch {
    return { url: null, error: 'LEAD_ENGINE_APP_URL is not a valid URL.' };
  }
}

export default function LeadEnginePage() {
  const { url, error } = getLeadEngineUrl();

  return (
    <>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 mb-1" style={{ color: 'var(--bs-emphasis-color)' }}>Lead Engine</h1>
          <p className="mb-0" style={{ color: 'var(--bs-secondary-color)', fontSize: '.9rem' }}>
            AI-assisted acquisition, lead management and compliant outreach.
          </p>
        </div>
        {url && (
          <a className="btn btn-sm btn-outline-secondary" href={url} target="_blank" rel="noopener noreferrer">
            Open in new tab <i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true" />
          </a>
        )}
      </div>

      {url ? (
        <iframe
          src={url}
          title="PlayBeat Lead Engine"
          className="w-100 border rounded"
          style={{ minHeight: 'calc(100vh - 190px)', background: '#0b1220' }}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="alert alert-warning" role="status">
          <h2 className="h6 alert-heading">Lead Engine service is not configured</h2>
          <p className="mb-2">
            {error || 'Set LEAD_ENGINE_APP_URL to the deployed PlayBeat Lead Engine service URL to load the full app here.'}
          </p>
          <p className="mb-0 small">
            The standalone Lead Engine service hosts its UI and API; deploy it separately, then set this server-side variable and restart the admin app.
          </p>
        </div>
      )}

      <div className="small text-body-secondary mt-3">
        <Link href="/admin/marketing">Back to marketing</Link>
      </div>
    </>
  );
}
