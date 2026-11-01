export default function CategoriesPage() {
  return (
    <section className="cats">
      <div className="cats-inner">
        <p className="cats-kicker">Browse</p>
        <h2 className="cats-heading">Our Categories</h2>
        <p className="cats-sub">
          Explore different varsity jacket styles for school, college, and premium fashion.
        </p>

        <div className="cats-grid">
          <article className="cat-card">
            <div className="cat-imgWrap">
              <img
                className="cat-img"
                src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1200&auto=format&fit=crop"
                alt="School Jackets"
              />
            </div>
            <div className="cat-body">
              <p className="cat-kicker">Classic</p>
              <h3 className="cat-title">School Jackets</h3>
            </div>
          </article>

          <article className="cat-card">
            <div className="cat-imgWrap">
              <img
                className="cat-img"
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
                alt="College Varsity"
              />
            </div>
            <div className="cat-body">
              <p className="cat-kicker">Popular</p>
              <h3 className="cat-title">College Varsity</h3>
            </div>
          </article>

          <article className="cat-card">
            <div className="cat-imgWrap">
              <img
                className="cat-img"
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop"
                alt="Premium Leather"
              />
            </div>
            <div className="cat-body">
              <p className="cat-kicker">Luxury</p>
              <h3 className="cat-title">Premium Leather</h3>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}