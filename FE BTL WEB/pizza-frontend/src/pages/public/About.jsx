import { useEffect, useRef, useState } from "react"
import "./About.css"

/* ── Intersection observer ── */
function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

/* ── Parallax hook ── */
function useParallax(speed = 0.3) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2 - window.innerHeight / 2
      el.style.transform = `translateY(${center * speed}px)`
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [speed])
  return ref
}

const PILLARS = [
  {
    num: "01",
    title: "Nguyên liệu tươi sạch",
    body: "Mỗi nguyên liệu được chọn lọc kỹ lưỡng từ các trang trại địa phương — rau hữu cơ từ Đà Lạt, phô mai tươi làm ngay tại bếp mỗi sáng, bột mì nhập từ Ý.",
  },
  {
    num: "02",
    title: "Lò nướng truyền thống",
    body: "Lò đốt củi đạt 450°C — nhiệt độ duy nhất tạo ra lớp đế pizza phồng giòn đúng chuẩn Napoli, cháy nhẹ ở rìa và mềm ẩm ở giữa.",
  },
  {
    num: "03",
    title: "Sáng tạo từ địa phương",
    body: "Chúng tôi kết hợp hương vị Việt Nam vào từng công thức — từ nước mắm tôm trong sốt bisque đến ớt hiểm, rau muống và phô mai ricotta tươi.",
  },
]

export default function About() {
  const videoRef = useParallax(0.15)
  const [heroLoaded, setHeroLoaded] = useState(false)

  const [introRef, introInView]       = useInView(0.1)
  const [pillar1Ref, pillar1InView]   = useInView(0.2)
  const [pillar2Ref, pillar2InView]   = useInView(0.2)
  const [pillar3Ref, pillar3InView]   = useInView(0.2)
  const pillarRefs  = [pillar1Ref, pillar2Ref, pillar3Ref]
  const pillarViews = [pillar1InView, pillar2InView, pillar3InView]

  const [quoteRef,  quoteInView]  = useInView(0.3)
  const [splitRef,  splitInView]  = useInView(0.15)
  const [statsRef,  statsInView]  = useInView(0.2)

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="about-page">

      {/* ══════════════════════════════
          HERO — full-screen video
      ══════════════════════════════ */}
      <section className="ab-hero">
        <div className="ab-video-wrap" ref={videoRef}>
          <video autoPlay loop muted playsInline className="ab-video">
            <source src="/videos/vietnam.mp4" type="video/mp4" />
          </video>
          <div className="ab-hero-overlay" />
        </div>

        <div className={`ab-hero-content ${heroLoaded ? "loaded" : ""}`}>
          <p className="ab-eyebrow">Ba Đình · Hà Nội</p>
          <h1 className="ab-hero-title">
            <span>Nơi pizza</span>
            <span className="italic-line">gặp tâm hồn</span>
            <span>Việt Nam</span>
          </h1>
          <div className="ab-hero-rule" />
          <p className="ab-hero-sub">
            Hải SAPA — nhà hàng pizza thủ công tại trung tâm Hà Nội,<br />
            nơi mỗi chiếc pizza là một câu chuyện về con người và đất trời.
          </p>
        </div>

        <div className="ab-scroll-indicator">
          <span />
        </div>
      </section>

      {/* ══════════════════════════════
          INTRO — editorial 2-col
      ══════════════════════════════ */}
      <section className="ab-intro" ref={introRef}>
        <div className={`ab-intro-inner ${introInView ? "visible" : ""}`}>

          <div className="ab-intro-left">
            <span className="ab-label">Câu chuyện của chúng tôi</span>
            <h2 className="ab-intro-heading">
              Từ một chiếc lò<br />
              nướng, chúng tôi<br />
              <em>đã thay đổi</em><br />
              cách Hà Nội ăn pizza
            </h2>
          </div>

          <div className="ab-intro-right">
            <p>
              Hải SAPA được sinh ra từ một ý tưởng đơn giản: <strong>pizza tốt nhất không đến từ sự hoàn hảo — mà đến từ sự chân thật.</strong> Chân thật với nguyên liệu, chân thật với kỹ thuật, và chân thật với con người ngồi trước bàn ăn.
            </p>
            <p>
              Khai trương tại phố Nguyễn Thái Học, Ba Đình năm 2018, chúng tôi mang đến Hà Nội chiếc lò đốt củi đầu tiên đạt chuẩn Napoli — cùng triết lý rằng ẩm thực ngon nhất là ẩm thực kể được câu chuyện của vùng đất nó sinh ra.
            </p>
            <p>
              Hôm nay, mỗi tuần chúng tôi phục vụ hơn <strong>2.000 thực khách</strong>, từ những gia đình Hà Nội đến khách lữ hành từ khắp nơi trên thế giới — tất cả ngồi lại với nhau quanh một chiếc pizza, một ly rượu, và những câu chuyện đáng nhớ.
            </p>

            <div className="ab-since">
              <span className="ab-since-year">2018</span>
              <span className="ab-since-text">Thành lập tại Ba Đình, Hà Nội</span>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════
          VIDEO BREAK — pizza in oven
      ══════════════════════════════ */}
      <section className="ab-video-break">
        <div className="ab-vb-inner">
          <video autoPlay loop muted playsInline>
            <source src="/videos/pizza.mp4" type="video/mp4" />
          </video>
          <div className="ab-vb-overlay">
            <blockquote className={`ab-quote-float ${quoteInView ? "visible" : ""}`} ref={quoteRef}>
              <span>"</span>
              Chúng tôi không làm pizza để bán — chúng tôi làm pizza để mời.
              <cite>— Bếp trưởng Hải SAPA</cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          3 PILLARS
      ══════════════════════════════ */}
      <section className="ab-pillars">
        <div className="ab-pillars-header">
          <span className="ab-label">Triết lý bếp</span>
          <h2>Ba điều chúng tôi<br />không bao giờ thỏa hiệp</h2>
        </div>

        <div className="ab-pillars-grid">
          {PILLARS.map((p, i) => (
            <div
              key={i}
              className={`ab-pillar ${pillarViews[i] ? "visible" : ""}`}
              ref={pillarRefs[i]}
              style={{ "--delay": `${i * 0.15}s` }}
            >
              <span className="ab-pillar-num">{p.num}</span>
              <div className="ab-pillar-line" />
              <h3 className="ab-pillar-title">{p.title}</h3>
              <p className="ab-pillar-body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          SPLIT — image + text
      ══════════════════════════════ */}
      <section className={`ab-split ${splitInView ? "visible" : ""}`} ref={splitRef}>
        <div className="ab-split-media">
          <video autoPlay loop muted playsInline>
            <source src="/videos/pizza2.mp4" type="video/mp4" />
          </video>
          <div className="ab-split-tag">Không gian<br />Hải SAPA</div>
        </div>

        <div className="ab-split-content">
          <span className="ab-label">Không gian</span>
          <h2>Một góc Hà Nội<br />để thở chậm lại</h2>
          <p>
            Toà nhà phố cổ 3 tầng trên phố Nguyễn Thái Học được thiết kế theo phong cách Indochine hiện đại — nơi gạch trần, gỗ tối và ánh nến tạo nên bầu không khí ấm áp, thân mật, không hối hả.
          </p>
          <p>
            Sức chứa 80 chỗ ngồi trong nhà và sân thượng mở nhìn ra cây bàng già — không gian lý tưởng cho bữa tối gia đình, buổi hẹn hò hay tiệc nhỏ thân mật.
          </p>
          <div className="ab-split-cta">
            <a href="/booking" className="ab-btn">Đặt bàn ngay</a>
            <a href="/menu" className="ab-btn ab-btn-ghost">Xem thực đơn</a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          STATS
      ══════════════════════════════ */}
      <section className={`ab-stats ${statsInView ? "visible" : ""}`} ref={statsRef}>
        {[
          { num: "2.000+", label: "Thực khách mỗi tuần" },
          { num: "450°C",  label: "Nhiệt độ lò nướng củi" },
          { num: "100%",   label: "Phô mai tươi tự làm" },
          { num: "6+",     label: "Năm phục vụ Hà Nội" },
        ].map((s, i) => (
          <div key={i} className="ab-stat" style={{ "--delay": `${i * 0.1}s` }}>
            <span className="ab-stat-num">{s.num}</span>
            <span className="ab-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ══════════════════════════════
          FOOTER CTA
      ══════════════════════════════ */}
      <section className="ab-footer-cta">
        <div className="ab-fca-video">
          <video autoPlay loop muted playsInline>
            <source src="/videos/nhatrang.mp4" type="video/mp4" />
          </video>
          <div className="ab-fca-overlay" />
        </div>
        <div className="ab-fca-content">
          <h2>Hẹn gặp bạn<br />tại bàn ăn</h2>
          <p>175 Nguyễn Thái Học, Ba Đình, Hà Nội</p>
          <a href="/booking" className="ab-btn ab-btn-light">Đặt bàn</a>
        </div>
      </section>

    </div>
  )
}
