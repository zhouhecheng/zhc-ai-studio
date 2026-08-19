"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type MediaItem = {
  src: string;
  title: string;
  type: "image" | "video";
  orientation?: "landscape" | "portrait";
};

type Category = {
  id: string;
  number: string;
  title: string;
  en: string;
  text: string;
  media: MediaItem[];
};

const aiArtImages: MediaItem[] = Array.from({ length: 14 }, (_, index) => {
  const number = index + 1;
  return {
    src: `/works/${number}.${number === 11 ? "jpg" : "png"}`,
    title: `AI绘图 · ${String(number).padStart(2, "0")}`,
    type: "image",
  };
});

const categories: Category[] = [
  {
    id: "ai-animation",
    number: "01",
    title: "AI漫剧",
    en: "AI ANIMATION",
    text: "从剧本拆分、角色设计到分镜成片，完成连续的 AI 动画叙事。",
    media: [{ src: "/works/ai.manju.mp4", title: "AI漫剧", type: "video", orientation: "landscape" }],
  },
  {
    id: "short-drama",
    number: "02",
    title: "真人短剧",
    en: "SHORT DRAMA",
    text: "围绕人物、情节与镜头语言，呈现电影感真人短剧内容。",
    media: [{ src: "/works/zhenrenmanju.mp4", title: "真人短剧", type: "video", orientation: "portrait" }],
  },
  {
    id: "talking-video",
    number: "03",
    title: "口播",
    en: "TALKING VIDEO",
    text: "数字人、真人与产品口播，让信息表达更自然、更有记忆点。",
    media: [{ src: "/works/koubo.mp4", title: "口播作品", type: "video", orientation: "portrait" }],
  },
  {
    id: "ads",
    number: "04",
    title: "信息流广告",
    en: "FEED ADS",
    text: "用明确的卖点与视觉节奏，完成适合传播的信息流内容。",
    media: [{ src: "/works/ai.xinxiliu.mp4", title: "信息流广告", type: "video", orientation: "portrait" }],
  },
  {
    id: "commercial-film",
    number: "05",
    title: "宣传片",
    en: "PROMOTIONAL FILM",
    text: "品牌故事、企业形象与产品价值的电影化视觉表达。",
    media: [{ src: "/works/ai.xuanchuanpian.mp4", title: "宣传片", type: "video", orientation: "portrait" }],
  },
  {
    id: "ai-art",
    number: "06",
    title: "AI绘图",
    en: "AI ART",
    text: "人物、场景与世界观设计，把想法转化为完整视觉设定。",
    media: aiArtImages,
  },
  {
    id: "portfolio",
    number: "07",
    title: "个人集锦",
    en: "PORTFOLIO",
    text: "精选影像、动画与视觉实验，记录持续生长的创作轨迹。",
    media: Array.from({ length: 6 }, (_, index) => ({
      src: `/works/jijin${index === 0 ? "" : index + 1}.mp4`,
      title: `个人集锦 · ${String(index + 1).padStart(2, "0")}`,
      type: "video" as const,
      orientation: "portrait" as const,
    })),
  },
];

const processSteps = [
  { number: "01", title: "拆分剧本", en: "SCRIPT" },
  { number: "02", title: "角色设计", en: "CHARACTER" },
  { number: "03", title: "AI绘图", en: "VISUAL" },
  { number: "04", title: "视频生成", en: "MOTION" },
  { number: "05", title: "剪辑成品", en: "FINAL CUT" },
];

type Ripple = { id: number; x: number; y: number };

export default function Home() {
  const cursorRing = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let frame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      root.style.setProperty("--pointer-x", `${pointerX}px`);
      root.style.setProperty("--pointer-y", `${pointerY}px`);
    };

    const handlePointerOver = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("a, button")) {
        cursorRing.current?.classList.add("is-hovering");
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("a, button")) {
        cursorRing.current?.classList.remove("is-hovering");
      }
    };

    const animateRing = () => {
      ringX += (pointerX - ringX) * 0.14;
      ringY += (pointerY - ringY) * 0.14;
      if (cursorRing.current) {
        cursorRing.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(animateRing);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    frame = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerout", handlePointerOut);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedImage]);

  const addRipple = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const ripple = { id: Date.now(), x: event.clientX, y: event.clientY };
    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== ripple.id));
    }, 820);
  };

  return (
    <main className="site-shell" data-version="confirmed-v1" onPointerDown={addRipple}>
      <div className="background-photo" aria-hidden="true" />
      <div className="background-overlay" aria-hidden="true" />

      <div className="cursor-glow" aria-hidden="true" />
      <div className="cursor-particles" aria-hidden="true"><i /><i /><i /></div>
      <div className="cursor-dot" aria-hidden="true" />
      <div ref={cursorRing} className="cursor-ring" aria-hidden="true" />
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="click-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          aria-hidden="true"
        />
      ))}

      <div className="page-content">
        <header className="topbar">
          <a className="brand-mark" href="#top" aria-label="ZHC AI STUDIO 首页">
            <strong>ZHC</strong><span>AI STUDIO</span>
          </a>
          <nav className="topnav" aria-label="主导航">
            <a href="#top">首页</a>
            <a href="#ai-animation">AI漫剧</a>
            <a href="#short-drama">真人短剧</a>
            <a href="#talking-video">口播</a>
            <a href="#ads">信息流广告</a>
            <a href="#commercial-film">宣传片</a>
            <a href="#ai-art">AI绘图</a>
            <a href="#portfolio">个人集锦</a>
            <a href="#about">关于我</a>
          </nav>
          <a className="nav-cta" href="#contact">联系合作</a>
        </header>

        <section id="top" className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="hero-kicker"><span /> WELCOME TO</p>
            <h1 id="hero-title">ZHC<br /><em>AI STUDIO</em></h1>
            <h2>你负责提供想法，<br />我负责实现想法</h2>
            <div className="hero-actions">
              <a className="button button-primary" href="#works">浏览作品</a>
              <a className="button button-ghost" href="#contact">联系我们</a>
            </div>
          </div>

          <div className="hero-signature" aria-label="周合成 ZHC 签名">
            <span>周合成</span><small>ZHC</small>
          </div>
          <p className="hero-side-note">AI FILM · AI ANIMATION · VISUAL CREATION</p>
        </section>

        <section id="about" className="section about-section" aria-labelledby="about-title">
          <div className="section-label"><span>01</span><p>ABOUT ME</p></div>
          <div className="about-main">
            <h2 id="about-title">关于我</h2>
            <p>
              我是一名AI创作者，专注于3D动漫风格，<br />
              从剧本拆分，到角色设计，视频产生，<br />
              最后的成品展示。
            </p>
          </div>
          <blockquote>
            我的技术与艺术结合起来，<br />
            相信AI能帮我创造出完美的作品。
          </blockquote>
        </section>

        <section id="works" className="section works-section" aria-labelledby="works-title">
          <header className="section-header">
            <div className="section-label"><span>02</span><p>SELECTED WORKS</p></div>
            <h2 id="works-title">作品分类</h2>
            <p>从故事、角色到最终成片，覆盖静态与动态的完整视觉创作。</p>
          </header>
          <div className="category-grid">
            {categories.map((category) => (
              <a className="category-card" href={`#${category.id}`} key={category.id}>
                <span className="card-number">{category.number}</span>
                <div>
                  <small>{category.en}</small>
                  <h3>{category.title}</h3>
                  <p>{category.text}</p>
                </div>
                <i aria-hidden="true">↗</i>
              </a>
            ))}
          </div>

          <div className="portfolio-groups" aria-label="分类作品展示">
            {categories.map((category) => (
              <section className="portfolio-group" id={category.id} key={category.id}>
                <header className="portfolio-header">
                  <span>{category.number}</span>
                  <div>
                    <small>{category.en}</small>
                    <h3>{category.title}</h3>
                  </div>
                  <p>{category.text}</p>
                  <em>{String(category.media.length).padStart(2, "0")} WORKS</em>
                </header>

                <div
                  className="media-grid"
                  data-layout={
                    category.id === "ai-art"
                      ? "images"
                      : category.media.length === 1
                        ? "single"
                        : "videos"
                  }
                >
                  {category.media.map((item) =>
                    item.type === "video" ? (
                      <article
                        className="media-card video-card"
                        data-orientation={item.orientation}
                        key={item.src}
                      >
                        <div className="video-frame" data-orientation={item.orientation}>
                          <video controls playsInline preload="metadata" aria-label={item.title}>
                            <source src={item.src} type="video/mp4" />
                            当前浏览器不支持视频播放。
                          </video>
                        </div>
                        <div className="media-caption">
                          <span>{item.title}</span>
                          <small>PLAY FILM</small>
                        </div>
                      </article>
                    ) : (
                      <button
                        className="media-card image-card"
                        type="button"
                        onClick={() => setSelectedImage(item)}
                        aria-label={`查看大图：${item.title}`}
                        key={item.src}
                      >
                        <span className="image-frame">
                          <Image
                            src={item.src}
                            alt={item.title}
                            fill
                            sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 25vw"
                          />
                        </span>
                        <span className="media-caption">
                          <span>{item.title}</span>
                          <small>VIEW IMAGE</small>
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section id="process" className="section process-section" aria-labelledby="process-title">
          <header className="section-header compact-header">
            <div className="section-label"><span>03</span><p>CREATIVE PROCESS</p></div>
            <h2 id="process-title">创作流程</h2>
            <p>让每一步都服务于最终作品，而不是停留在工具演示。</p>
          </header>
          <ol className="process-grid">
            {processSteps.map((step, index) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <small>{step.en}</small>
                <h3>{step.title}</h3>
                {index < processSteps.length - 1 && <i aria-hidden="true">→</i>}
              </li>
            ))}
          </ol>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="section-label"><span>04</span><p>CONTACT</p></div>
          <h2 id="contact-title">艺术的养成<br />只需你我共创</h2>
          <div className="contact-grid">
            <a href="mailto:zhczhc200512@gmail.com"><small>邮箱 / EMAIL</small><span>zhczhc200512@gmail.com</span></a>
            <div><small>微信 / WECHAT</small><span>17629966509</span></div>
            <a href="tel:17629966509"><small>电话 / PHONE</small><span>17629966509</span></a>
          </div>
        </section>

        <footer className="footer">
          <p>© 2026 ZHC AI STUDIO</p>
          <p>AI FILM · ANIMATION · VISUAL CREATION</p>
          <a href="#top">返回顶部 ↑</a>
        </footer>
      </div>

      {selectedImage && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="lightbox-close"
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="关闭大图"
          >
            关闭 ×
          </button>
          <div className="lightbox-image" onClick={(event) => event.stopPropagation()}>
            <Image src={selectedImage.src} alt={selectedImage.title} fill sizes="100vw" priority />
          </div>
          <p>{selectedImage.title}</p>
        </div>
      )}
    </main>
  );
}
