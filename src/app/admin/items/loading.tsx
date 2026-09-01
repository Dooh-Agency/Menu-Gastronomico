export default function ItemsLoading() {
  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <div className="skeleton-box" style={{ width: "3.5rem", height: "0.8rem", marginBottom: "0.5rem" }} />
          <div className="skeleton-box" style={{ width: "8rem", height: "2rem", marginBottom: "0.5rem" }} />
          <div className="skeleton-box" style={{ width: "24rem", height: "1rem" }} />
        </div>
      </div>
      <div className="admin-category-pills" style={{ marginBottom: "1.5rem" }}>
        <div className="skeleton-box" style={{ width: "6rem", height: "2rem", borderRadius: "999px" }} />
        <div className="skeleton-box" style={{ width: "7rem", height: "2rem", borderRadius: "999px" }} />
        <div className="skeleton-box" style={{ width: "6.5rem", height: "2rem", borderRadius: "999px" }} />
      </div>
      <section className="admin-section item-section">
        <div className="admin-editor-list">
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
        </div>
      </section>
    </main>
  );
}
