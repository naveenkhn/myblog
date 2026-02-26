---
title: Reusable 3D Rotating Carousel Pattern in React
summary: Build a reusable 3D rotating card carousel that can showcase skills, projects, testimonials, products, or any grouped content.
publishDate: 2026-02-26
tags:
  - react
  - css
  - animation
  - ui-patterns
featured: false
---

This is a reusable React + CSS pattern for a 3D rotating carousel of cards.

It is not limited to a Skills section. You can use the same pattern for:

1. Projects
2. Testimonials
3. Product highlights
4. Feature groups
5. Team roles

## Why this pattern works

The carousel uses one simple idea:

1. Place each card in a 3D circular ring with `rotateY(...) translateZ(...)`.
2. Rotate only the parent container over time.

You avoid per-card animation complexity, while keeping smooth visual motion.

## Minimal implementation

```jsx
import React, { useEffect, useRef } from "react";

const categories = [
  {
    title: "Projects",
    items: ["Portfolio", "DevOps Toolkit", "Realtime Dashboard"]
  },
  {
    title: "Testimonials",
    items: ["Client A", "Client B", "Client C"]
  },
  {
    title: "Highlights",
    items: ["Scalability", "Observability", "Automation"]
  },
  {
    title: "Products",
    items: ["Starter", "Pro", "Enterprise"]
  },
  {
    title: "Roadmap",
    items: ["Q1", "Q2", "Q3"]
  }
];

export default function ThreeDCarousel() {
  const carouselRef = useRef(null);

  useEffect(() => {
    let angle = 0;
    let intervalId = null;

    const rotate = () => {
      angle += 360 / categories.length;
      if (carouselRef.current) {
        carouselRef.current.style.transform = `rotateY(-${angle}deg)`;
      }
    };

    const startRotation = () => {
      if (!intervalId) intervalId = setInterval(rotate, 2500);
    };

    const stopRotation = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const node = carouselRef.current;
    if (!node) return;

    node.addEventListener("mouseenter", stopRotation);
    node.addEventListener("mouseleave", startRotation);

    startRotation();

    return () => {
      stopRotation();
      node.removeEventListener("mouseenter", stopRotation);
      node.removeEventListener("mouseleave", startRotation);
    };
  }, []);

  return (
    <section className="carousel-section">
      <h2>3D Rotating Carousel</h2>

      <div className="carousel-wrapper">
        <div className="carousel" ref={carouselRef}>
          {categories.map((card, index) => {
            const angle = (360 / categories.length) * index;
            return (
              <article
                className="tile"
                key={card.title}
                style={{ transform: `rotateY(${angle}deg) translateZ(320px)` }}
              >
                <h3>{card.title}</h3>
                <ul>
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

## CSS for the 3D behavior

```css
.carousel-wrapper {
  perspective: 1500px;
  perspective-origin: center;
  display: flex;
  justify-content: center;
  height: 560px;
}

.carousel {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 1s ease-in-out;
  width: 800px;
  height: 100%;
}

.tile {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 352px;
  height: 352px;
  margin-left: -176px;
  margin-top: -176px;
  border: 1px solid #3a4b66;
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(25, 35, 65, 1), rgba(18, 28, 50, 0.98));
  padding: 16px;
  overflow: hidden;
}
```

## Rotation math

If there are `N` cards:

1. Angle between cards = `360 / N`
2. Card i position = `rotateY(i * 360 / N) translateZ(radius)`
3. Each auto-step rotates by one card angle

With 5 cards:

- Card spacing = `72deg`
- Rotate step = `72deg`

## Knobs you can tune

1. `translateZ(320px)` controls ring radius.
2. `setInterval(..., 2500)` controls auto-rotate speed.
3. `transition: transform 1s` controls smoothness.
4. `perspective: 1500px` controls depth intensity.

## Reusability tips

1. Keep data separate from rendering logic.
2. Make a generic card schema: `title`, `subtitle`, `items`, optional media.
3. Inject custom card content via props if needed.
4. Pause on hover so users can read content.
5. Add responsive fallback (stack or horizontal slider) for small screens.

This pattern is ideal when you want one component to display multiple grouped datasets with a premium visual feel and minimal animation code.
