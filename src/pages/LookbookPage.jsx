import { siteConfig } from '../config/siteConfig';

export default function LookbookPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>Lookbook</h1>
          <p>Style inspiration from our atelier</p>
        </div>
      </section>
      <section className="section">
        <div className="container text-center">
          <h2 className="section-heading">@geistooffical</h2>
          <p className="section-sub" style={{ marginBottom: '2rem' }}>
            Follow us on Instagram for the latest drops and styling ideas.
          </p>
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark"
          >
            Open Instagram
          </a>
          <div className="instagram-embed-profile-wrap" style={{ marginTop: '4rem' }}>
            <iframe
              className="instagram-profile-embed"
              src="https://www.instagram.com/geistooffical/embed"
              title="Instagram @geistooffical"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </main>
  );
}
