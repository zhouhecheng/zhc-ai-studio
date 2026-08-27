"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type MediaItem = {
  src: string;
  poster?: string;
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

const mediaVersion = "cos-ai-projects-20260827";
const mediaBaseUrl = "https://zhc-ai-video-1454067432.cos.ap-guangzhou.myqcloud.com";
const mediaUrl = (filename: string) => `${mediaBaseUrl}/${filename}`;
const videoUrl = mediaUrl;
const posterUrl = (filename: string) => `/works/posters/${filename.replace(/\.mp4$/, ".jpg")}`;

const aiArtImages: MediaItem[] = Array.from({ length: 14 }, (_, index) => {
  const number = index + 1;
  return {
    src: mediaUrl(`${number}.${number === 11 ? "jpg" : "png"}`),
    title: `AI绘图 · ${String(number).padStart(2, "0")}`,
    type: "image",
  };
});

const aiProjectVideos: MediaItem[] = [
  { src: videoUrl("ai.manju.mp4"), poster: posterUrl("ai.manju.mp4"), title: "AI项目 · 精选", type: "video", orientation: "landscape" },
  { src: videoUrl("a.mp4"), poster: posterUrl("a.mp4"), title: "AI项目 · 01", type: "video", orientation: "landscape" },
  ...Array.from({ length: 6 }, (_, index) => ({
    src: videoUrl(`a${index + 1}.mp4`),
    poster: posterUrl(`a${index + 1}.mp4`),
    title: `AI项目 · ${String(index + 2).padStart(2, "0")}`,
    type: "video" as const,
    orientation: "portrait" as const,
  })),
];

const categories: Category[] = [
  {
    id: "ai-animation",
    number: "01",
    title: "AI项目",
    en: "AI PROJECTS",
    text: "从创意、角色与分镜到最终成片，呈现完整、多元的 AI 影像项目。",
    media: aiProjectVideos,
  },
  {
    id: "short-drama",
    number: "02",
    title: "真人短剧",
    en: "SHORT DRAMA",
    text: "围绕人物、情节与镜头语言，呈现电影感真人短剧内容。",
    media: [{ src: videoUrl("zhenrenmanju.mp4"), poster: posterUrl("zhenrenmanju.mp4"), title: "真人短剧", type: "video", orientation: "portrait" }],
  },
  {
    id: "talking-video",
    number: "03",
    title: "口播",
    en: "TALKING VIDEO",
    text: "数字人、真人与产品口播，让信息表达更自然、更有记忆点。",
    media: [{ src: videoUrl("koubo.mp4"), poster: posterUrl("koubo.mp4"), title: "口播作品", type: "video", orientation: "portrait" }],
  },
  {
    id: "ads",
    number: "04",
    title: "信息流广告",
    en: "FEED ADS",
    text: "用明确的卖点与视觉节奏，完成适合传播的信息流内容。",
    media: [{ src: videoUrl("ai.xinxiliu.mp4"), poster: posterUrl("ai.xinxiliu.mp4"), title: "信息流广告", type: "video", orientation: "portrait" }],
  },
  {
    id: "commercial-film",
    number: "05",
    title: "宣传片",
    en: "PROMOTIONAL FILM",
    text: "品牌故事、企业形象与产品价值的电影化视觉表达。",
    media: [{ src: videoUrl("ai.xuanchuanpian.mp4"), poster: posterUrl("ai.xuanchuanpian.mp4"), title: "宣传片", type: "video", orientation: "portrait" }],
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
      src: videoUrl(`jijin${index === 0 ? "" : index + 1}.mp4`),
      poster: posterUrl(`jijin${index === 0 ? "" : index + 1}.mp4`),
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

const featuredReel = categories[0].media[0];

type Ripple = { id: number; x: number; y: number };

export default function Home() {
  const cursorRing = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);

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
      if ((event.target as HTMLElement).closest("a, button, summary")) {
        cursorRing.current?.classList.add("is-hovering");
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("a, button, summary")) {
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
    if (!selectedImage && !selectedVideo) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
        setSelectedVideo(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedImage, selectedVideo]);

  const startVideoPreview = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const video = event.currentTarget.querySelector("video");
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  };

  const stopVideoPreview = (event: ReactPointerEvent<HTMLElement>) => {
    const video = event.currentTarget.querySelector("video");
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  const addRipple = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const ripple = { id: Date.now(), x: event.clientX, y: event.clientY };
    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== ripple.id));
    }, 820);
  };

  return (
    <main className="site-shell" data-version="editorial-cut-20260819" onPointerDown={addRipple}>
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
            <strong>ZHC</strong>
            <span>AI FILM STUDIO<small>周合成视觉创作</small></span>
          </a>
          <nav className="topnav" aria-label="主导航">
            <a href="#works"><span>01</span>作品</a>
            <a href="#about"><span>02</span>关于</a>
            <a href="#process"><span>03</span>流程</a>
            <a href="#contact"><span>04</span>联系</a>
          </nav>
          <div className="nav-meta">
            <span><i /> AVAILABLE FOR PROJECTS</span>
            <a className="nav-cta" href="#contact">发起合作 ↗</a>
          </div>
          <details className="mobile-menu">
            <summary aria-label="打开导航">菜单</summary>
            <nav aria-label="移动端导航">
              <a href="#works">作品</a>
              <a href="#about">关于</a>
              <a href="#process">流程</a>
              <a href="#contact">联系</a>
            </nav>
          </details>
        </header>

        <section id="top" className="hero" aria-labelledby="hero-title">
          <div className="hero-chapter" aria-hidden="true">
            <span>ZHOU HECHENG</span>
            <span>PORTFOLIO / 2026</span>
          </div>

          <div className="hero-title-wrap">
            <p className="hero-kicker">AI FILMMAKER <span>×</span> VISUAL ARTIST</p>
            <h1 id="hero-title">
              <span>ZHC</span>
              <span>AI FILM</span>
              <em>STUDIO</em>
            </h1>
          </div>

          <div className="hero-bottom">
            <div className="hero-intro">
              <p>你负责提供想法，<br />我负责实现想法。</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#works">观看作品 <span>↓</span></a>
                <a className="button button-ghost" href="#contact">合作咨询</a>
              </div>
            </div>

            <button
              className="hero-reel"
              type="button"
              onPointerEnter={startVideoPreview}
              onPointerLeave={stopVideoPreview}
              onClick={() => setSelectedVideo(featuredReel)}
              aria-label={`播放精选作品：${featuredReel.title}`}
            >
              <video muted loop playsInline preload="metadata" poster={featuredReel.poster} aria-hidden="true">
                <source src={`${featuredReel.src}?v=${mediaVersion}`} type="video/mp4" />
              </video>
              <span className="hero-reel-label"><i>▶</i><span><small>FEATURED REEL</small>播放精选作品</span></span>
              <em>00:01</em>
            </button>

            <div className="hero-index" aria-label="作品范围">
              <span>07 个创作门类</span>
              <p>AI 项目 / 真人短剧 / 口播<br />广告 / 宣传片 / 绘图 / 集锦</p>
            </div>
          </div>

          <div className="hero-signature" aria-label="周合成 ZHC 签名">
            <span>周合成</span><small>ZHC</small>
          </div>
          <p className="hero-side-note">SCROLL TO ENTER THE ARCHIVE</p>
        </section>

        <section id="about" className="section about-section" aria-labelledby="about-title">
          <div className="section-label"><span>01</span><p>ABOUT / STATEMENT</p></div>
          <div className="about-main">
            <p className="about-eyebrow">周合成 · AI 创作者</p>
            <h2 id="about-title">在技术与艺术之间，<br />把想法变成<em>完整作品。</em></h2>
          </div>
          <div className="about-detail">
            <p>
              专注于 3D 动漫风格与 AI 影视创作，从剧本拆分、角色设计、
              画面生成到剪辑成片，让每一个视觉选择都服务于故事。
            </p>
            <blockquote>“我的技术与艺术结合起来，相信 AI 能帮我创造出完美的作品。”</blockquote>
            <dl>
              <div><dt>07</dt><dd>创作门类</dd></div>
              <div><dt>32</dt><dd>线上作品</dd></div>
              <div><dt>∞</dt><dd>持续创作</dd></div>
            </dl>
          </div>
        </section>

        <section id="works" className="section works-section" aria-labelledby="works-title">
          <header className="section-header">
            <div className="section-label"><span>02</span><p>SELECTED / WORKS</p></div>
            <h2 id="works-title"><span>作品</span><em>索引</em></h2>
            <p>从故事、角色到最终成片。先选择一个创作门类，再进入完整作品档案。</p>
          </header>
          <div className="category-index">
            {categories.map((category) => (
              <a className="category-row" href={`#${category.id}`} key={category.id}>
                <span className="category-number">{category.number}</span>
                <div className="category-title">
                  <h3>{category.title}</h3>
                  <small>{category.en}</small>
                </div>
                <div className="category-description">
                  <p>{category.text}</p>
                </div>
                <span className="category-count">{String(category.media.length).padStart(2, "0")} / WORKS</span>
                <figure aria-hidden="true">
                  <img
                    src={category.media[0].type === "video" ? category.media[0].poster : category.media[0].src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <i aria-hidden="true">↘</i>
              </a>
            ))}
          </div>

          <div className="portfolio-groups" aria-label="分类作品展示">
            <div className="archive-intro">
              <span>FULL ARCHIVE</span>
              <p>影像不是装饰，<br />每一帧都是作品本身。</p>
              <em>32 ITEMS / 07 CATEGORIES</em>
            </div>
            {categories.map((category) => (
              <section className="portfolio-group" id={category.id} key={category.id}>
                <header className="portfolio-header">
                  <span className="portfolio-number">{category.number}</span>
                  <div>
                    <small>{category.en}</small>
                    <h3>{category.title}</h3>
                  </div>
                  <p>{category.text}</p>
                  <em>{String(category.media.length).padStart(2, "0")} WORKS / VIEW ALL</em>
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
                      <button
                        className="media-card video-card"
                        data-orientation={item.orientation}
                        type="button"
                        onPointerEnter={startVideoPreview}
                        onPointerLeave={stopVideoPreview}
                        onClick={() => setSelectedVideo(item)}
                        aria-label={`播放视频：${item.title}`}
                        key={item.src}
                      >
                        <span className="video-frame">
                          <video
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            poster={item.poster}
                            aria-hidden="true"
                            tabIndex={-1}
                          >
                            <source src={`${item.src}?v=${mediaVersion}`} type="video/mp4" />
                            当前浏览器不支持视频播放。
                          </video>
                          <span className="video-preview-ui" aria-hidden="true">
                            <i>▶</i>
                            <small>悬停预览</small>
                          </span>
                        </span>
                        <span className="media-caption">
                          <span>{item.title}</span>
                          <small>PLAY FILM ↗</small>
                        </span>
                      </button>
                    ) : (
                      <button
                        className="media-card image-card"
                        type="button"
                        onClick={() => setSelectedImage(item)}
                        aria-label={`查看大图：${item.title}`}
                        key={item.src}
                      >
                        <span className="image-frame">
                          <img
                            src={item.src}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                        <span className="media-caption">
                          <span>{item.title}</span>
                          <small>VIEW FRAME ↗</small>
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
            <div className="section-label"><span>03</span><p>CREATIVE / PROCESS</p></div>
            <h2 id="process-title"><span>从一个想法</span><em>到最终成片</em></h2>
            <p>五个环节串成一条完整创作链，让技术、审美与叙事在同一个方向上发生。</p>
          </header>
          <ol className="process-grid">
            {processSteps.map((step, index) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div><small>{step.en}</small><h3>{step.title}</h3></div>
                {index < processSteps.length - 1 && <i aria-hidden="true">↘</i>}
              </li>
            ))}
          </ol>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-topline">
            <div className="section-label"><span>04</span><p>CONTACT / COLLABORATION</p></div>
            <span><i /> AVAILABLE FOR PROJECTS</span>
          </div>
          <h2 id="contact-title"><span>让想法</span><em>开始成片。</em></h2>
          <p className="contact-lead">艺术的养成，只需你我共创。<br />如果你有一个故事、品牌或画面想法，现在就可以开始。</p>
          <div className="contact-grid">
            <a href="mailto:zhczhc200512@gmail.com"><small>01 / EMAIL</small><span>zhczhc200512@gmail.com</span><i>↗</i></a>
            <div><small>02 / WECHAT</small><span>17629966509</span><i>+</i></div>
            <a href="tel:17629966509"><small>03 / PHONE</small><span>17629966509</span><i>↗</i></a>
          </div>
          <div className="contact-signature"><span>周合成</span><small>ZHC</small></div>
        </section>

        <footer className="footer">
          <p>© 2026 ZHC AI FILM STUDIO</p>
          <p>周合成 · AI 影视与视觉创作</p>
          <a href="#top">BACK TO TOP ↑</a>
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
            <img src={selectedImage.src} alt={selectedImage.title} />
          </div>
          <p>{selectedImage.title}</p>
        </div>
      )}

      {selectedVideo && (
        <div
          className="video-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedVideo.title}
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className="lightbox-close"
            type="button"
            onClick={() => setSelectedVideo(null)}
            aria-label="关闭视频"
          >
            关闭 ×
          </button>
          <div className="lightbox-video" onClick={(event) => event.stopPropagation()}>
            <video
              key={selectedVideo.src}
              controls
              autoPlay
              playsInline
              poster={selectedVideo.poster}
              aria-label={selectedVideo.title}
            >
              <source src={`${selectedVideo.src}?v=${mediaVersion}`} type="video/mp4" />
              当前浏览器不支持视频播放。
            </video>
          </div>
          <p>{selectedVideo.title}</p>
        </div>
      )}
    </main>
  );
}
