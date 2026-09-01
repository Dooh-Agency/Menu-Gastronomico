export default function AdminLoading() {
  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <div className="skeleton-box" style={{ width: "4rem", height: "0.8rem", marginBottom: "0.5rem" }} />
          <div className="skeleton-box" style={{ width: "12rem", height: "2rem", marginBottom: "0.5rem" }} />
          <div className="skeleton-box" style={{ width: "22rem", height: "1rem" }} />
        </div>
      </div>
      <section className="admin-section">
        <div className="admin-editor-list">
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
        </div>
      </section>
    </main>
  );
}
