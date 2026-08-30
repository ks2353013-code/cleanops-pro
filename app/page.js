import Link from 'next/link';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7f9',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#102a2a',
      }}
    >
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '80px 28px',
        }}
      >
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            marginBottom: 90,
          }}
        >
          <strong style={{ fontSize: 24 }}>CleanOps Pro</strong>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/login"
              style={{
                padding: '10px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                textDecoration: 'none',
                color: '#102a2a',
                background: '#fff',
              }}
            >
              Sign in
            </Link>

            <Link
              href="/register"
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                color: '#fff',
                background: '#0d6b61',
              }}
            >
              Create workspace
            </Link>
          </div>
        </nav>

        <section style={{ maxWidth: 820 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '7px 12px',
              borderRadius: 999,
              background: '#e5f2ef',
              color: '#0d6b61',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            Commercial Cleaning Operations
          </div>

          <h1
            style={{
              fontSize: 'clamp(42px, 7vw, 76px)',
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
              margin: '0 0 24px',
            }}
          >
            Run your cleaning
            <br />
            operation in one place.
          </h1>

          <p
            style={{
              fontSize: 20,
              lineHeight: 1.6,
              color: '#64748b',
              maxWidth: 700,
              marginBottom: 32,
            }}
          >
            CleanOps Pro connects service requests, facilities, jobs,
            workforce, check-in/out, inspection, rework, invoicing,
            payments and client financial visibility in one operational
            workflow.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/register"
              style={{
                padding: '14px 20px',
                borderRadius: 9,
                background: '#0d6b61',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Start a workspace
            </Link>

            <Link
              href="/login"
              style={{
                padding: '14px 20px',
                borderRadius: 9,
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#102a2a',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 14,
            marginTop: 90,
          }}
        >
          {[
            ['Operations', 'Requests, scheduling, jobs and workforce control.'],
            ['QA & Rework', 'Inspection, pass/fail, corrective work and re-inspection.'],
            ['Billing', 'Persistent invoices, payment states and balances.'],
            ['Client Portal', 'Facilities, service requests and financial visibility.'],
          ].map(([title, description]) => (
            <article
              key={title}
              style={{
                background: '#fff',
                border: '1px solid #e5eaee',
                borderRadius: 14,
                padding: 22,
              }}
            >
              <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>{title}</h2>
              <p
                style={{
                  margin: 0,
                  color: '#64748b',
                  lineHeight: 1.5,
                  fontSize: 14,
                }}
              >
                {description}
              </p>
            </article>
          ))}
        </section>

        <footer
          style={{
            marginTop: 70,
            paddingTop: 20,
            borderTop: '1px solid #dbe3e6',
            color: '#94a3b8',
            fontSize: 13,
          }}
        >
          CleanOps Pro · Operations platform
        </footer>
      </section>
    </main>
  );
}
