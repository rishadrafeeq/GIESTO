/**
 * Loads real Instagram post embeds for @geistooffical
 */
(function initInstagramEmbeds() {
    const posts = window.GIESTO_INSTAGRAM_POSTS || [];
    const grid = document.getElementById('instagram-embed-posts');

    if (!grid || !posts.length) return;

    posts.forEach((url) => {
        const block = document.createElement('blockquote');
        block.className = 'instagram-media';
        block.setAttribute('data-instgrm-captioned', '');
        block.setAttribute('data-instgrm-permalink', url);
        block.setAttribute('data-instgrm-version', '14');
        block.style.cssText = 'background:#0A120E;border:0;border-radius:12px;margin:0;max-width:100%;min-width:280px;width:100%;';
        grid.appendChild(block);
    });

    if (!window.instgrm) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.instagram.com/embed.js';
        script.onload = () => window.instgrm?.Embeds?.process();
        document.body.appendChild(script);
    } else {
        window.instgrm.Embeds.process();
    }
})();
