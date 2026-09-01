export default function CategoriesLoading() {
  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <div className="skeleton-box" style={{ width: "3.5rem", height: "0.8rem", marginBottom: "0.5rem" }} />
          <div className="skeleton-box" style={{ width: "10rem", height: "2rem", marginBottom: "0.5rem" }} />
          <div className="skeleton-box" style={{ width: "20rem", height: "1rem" }} />
        </div>
      </div>
      <section className="admin-section category-section">
        <div className="admin-editor-list">
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
          <div className="skeleton-row" style={{ height: "4.5rem" }} />
        </div>
      </section>
    </main>
  );
}
