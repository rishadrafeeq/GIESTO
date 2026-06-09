import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    image: '/assets/hero_suit.png',
    tag: 'New Arrivals',
    title: 'GIESTO',
    text: 'Premium menswear — formal, casual & sportswear',
    link: '/shop',
    cta: 'Shop Now',
  },
  {
    image: '/assets/casual_luxe.png',
    tag: 'Wear it your way',
    title: 'Casual Collection',
    text: 'Relaxed fits. Elevated style.',
    link: '/shop?cat=casual',
    cta: 'Shop Casual',
  },
];

export default function HeroSlider() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero-slider">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className={`hero-slide${i === idx ? ' active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-slide-content container">
            <span className="hero-tag">{slide.tag}</span>
            <h1>{slide.title}</h1>
            <p>{slide.text}</p>
            <Link to={slide.link} className="btn btn-dark">{slide.cta}</Link>
          </div>
        </div>
      ))}
    </section>
  );
}
