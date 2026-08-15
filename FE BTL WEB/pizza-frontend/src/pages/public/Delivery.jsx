import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import "./Delivery.css"

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

const ZONES = [
  { name: "Hoàn Kiếm", time: "25–35 phút", fee: "Miễn phí", min: "199.000₫", hot: true },
  { name: "Ba Đình",   time: "20–30 phút", fee: "Miễn phí", min: "199.000₫", hot: false },
  { name: "Đống Đa",  time: "30–45 phút", fee: "15.000₫",  min: "249.000₫", hot: false },
  { name: "Hai Bà Trưng", time: "30–40 phút", fee: "15.000₫", min: "249.000₫", hot: false },
  { name: "Tây Hồ",   time: "40–55 phút", fee: "25.000₫",  min: "299.000₫", hot: false },
  { name: "Cầu Giấy", time: "35–50 phút", fee: "25.000₫",  min: "299.000₫", hot: false },
]

const STEPS = [
  { num: "01", title: "Chọn món",    body: "Duyệt thực đơn và thêm vào giỏ — pizza, pasta, đồ uống và tráng miệng.", icon: "🍕" },
  { num: "02", title: "Đặt hàng",   body: "Nhập địa chỉ, xác nhận đơn và thanh toán online hoặc khi nhận hàng.",   icon: "📦" },
  { num: "03", title: "Chuẩn bị",   body: "Bếp bắt đầu làm ngay khi nhận đơn. Thời gian chuẩn bị trung bình 15 phút.", icon: "🔥" },
  { num: "04", title: "Giao hàng",  body: "Shipper lấy hàng và giao đến tận cửa. Bạn theo dõi realtime qua ứng dụng.", icon: "🛵" },
]

const FAQS = [
  {
    q: "Phạm vi giao hàng của Hải SAPA đến đâu?",
    a: "Hiện tại chúng tôi giao trong nội thành Hà Nội với bán kính tối đa 10km từ nhà hàng Ba Đình. Chúng tôi đang mở rộng thêm."
  },
  {
    q: "Pizza có bị nguội khi giao không?",
    a: "Chúng tôi dùng hộp giữ nhiệt chuyên dụng. Pizza ra lò xong được đóng gói ngay và giao trong vòng 30–45 phút để đảm bảo chất lượng tốt nhất."
  },
  {
    q: "Tôi có thể đặt trước cho buổi tối không?",
    a: "Được! Bạn có thể đặt trước tối đa 24 giờ và chọn khung giờ giao cụ thể. Tính năng này có trên ứng dụng và website."
  },
  {
    q: "Phương thức thanh toán nào được chấp nhận?",
    a: "Tiền mặt khi nhận hàng, chuyển khoản ngân hàng, MoMo, ZaloPay, VNPay và tất cả thẻ Visa/Mastercard."
  },
  {
    q: "Đơn hàng tối thiểu là bao nhiêu?",
    a: "Tùy theo khu vực giao hàng — từ 199.000₫ đến 299.000₫. Xem bảng phí giao hàng bên dưới để biết chi tiết."
  },
]

export default function Delivery() {
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [openFaq, setOpenFaq]       = useState(null)

  const [stepsRef,  stepsVisible]  = useInView()
  const [zonesRef,  zonesVisible]  = useInView()
  const [promoRef,  promoVisible]  = useInView()
  const [faqRef,    faqVisible]    = useInView()
  const [ctaRef,    ctaVisible]    = useInView()

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="delivery-page">

      {/* ══ HERO ══ */}
      <section className="dv-hero">
        <div className="dv-hero-bg">
          <video autoPlay loop muted playsInline className="dv-bg-video">
            <source src="/videos/hanoi.mp4" type="video/mp4" />
          </video>
          <div className="dv-hero-overlay" />
        </div>

        <div className={`dv-hero-content ${heroLoaded ? "loaded" : ""}`}>
          <span className="dv-eyebrow">Giao hàng tận nơi</span>
          <h1 className="dv-hero-title">
            <span>Hương vị</span>
            <span className="dv-italic">Hải SAPA</span>
            <span>đến tận cửa</span>
          </h1>
          <p className="dv-hero-sub">
            Đặt hàng trong vòng 2 phút · Giao trong 30–45 phút · Nóng giòn như tại nhà hàng
          </p>
          <div className="dv-hero-actions">
            <Link to="/menu" className="dv-btn dv-btn-primary">Đặt ngay →</Link>
            <a href="#zones" className="dv-btn dv-btn-ghost">Xem khu vực giao</a>
          </div>
        </div>

        {/* floating badge */}
        <div className="dv-badge">
          <span className="dv-badge-icon">🛵</span>
          <div>
            <strong>Miễn phí ship</strong>
            <small>đơn từ 199.000₫</small>
          </div>
        </div>
      </section>

      {/* ══ STEPS ══ */}
      <section className="dv-steps" ref={stepsRef}>
        <div className="dv-container">
          <span className="dv-label">Quy trình</span>
          <h2 className="dv-section-title">Đặt hàng dễ như ăn pizza</h2>
          <div className="dv-steps-grid">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`dv-step ${stepsVisible ? "visible" : ""}`}
                style={{ "--delay": `${i * 0.12}s` }}
              >
                <div className="dv-step-icon">{s.icon}</div>
                <span className="dv-step-num">{s.num}</span>
                <h3 className="dv-step-title">{s.title}</h3>
                <p className="dv-step-body">{s.body}</p>
                {i < STEPS.length - 1 && <div className="dv-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROMO BANNER ══ */}
      <section className="dv-promo" ref={promoRef}>
        <div className={`dv-promo-inner ${promoVisible ? "visible" : ""}`}>
          <div className="dv-promo-text">
            <span className="dv-label dv-label-light">Ưu đãi hôm nay</span>
            <h2>Đơn đầu tiên<br /><em>giảm 20%</em></h2>
            <p>Dùng mã <strong>SAPA20</strong> khi thanh toán. Áp dụng đến 31/12/2024.</p>
            <Link to="/menu" className="dv-btn dv-btn-gold">Đặt ngay với mã SAPA20</Link>
          </div>
          <div className="dv-promo-visual">
            <div className="dv-promo-circle">
              <span className="dv-promo-pct">20%</span>
              <span className="dv-promo-off">OFF</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ZONES ══ */}
      <section className="dv-zones" id="zones" ref={zonesRef}>
        <div className="dv-container">
          <span className="dv-label">Phạm vi giao hàng</span>
          <h2 className="dv-section-title">Khu vực & phí giao hàng</h2>
          <div className={`dv-zones-grid ${zonesVisible ? "visible" : ""}`}>
            {ZONES.map((z, i) => (
              <div
                key={i}
                className={`dv-zone-card ${z.hot ? "dv-zone-hot" : ""}`}
                style={{ "--delay": `${i * 0.08}s` }}
              >
                {z.hot && <span className="dv-zone-badge">Phổ biến nhất</span>}
                <h3 className="dv-zone-name">{z.name}</h3>
                <div className="dv-zone-row">
                  <span className="dv-zone-icon">🕐</span>
                  <span>{z.time}</span>
                </div>
                <div className="dv-zone-row">
                  <span className="dv-zone-icon">🛵</span>
                  <span className={z.fee === "Miễn phí" ? "dv-free" : ""}>{z.fee}</span>
                </div>
                <div className="dv-zone-divider" />
                <div className="dv-zone-min">
                  <small>Đơn tối thiểu</small>
                  <strong>{z.min}</strong>
                </div>
              </div>
            ))}
          </div>
          <p className="dv-zones-note">
            * Thời gian giao hàng có thể thay đổi tùy điều kiện giao thông. Phí giao hàng miễn phí áp dụng trong giờ cao điểm có thể thay đổi.
          </p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="dv-faq" ref={faqRef}>
        <div className={`dv-container dv-faq-inner ${faqVisible ? "visible" : ""}`}>
          <span className="dv-label">Câu hỏi thường gặp</span>
          <h2 className="dv-section-title">Bạn cần biết gì?</h2>
          <div className="dv-faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className={`dv-faq-item ${openFaq === i ? "open" : ""}`}>
                <button className="dv-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="dv-faq-icon">{openFaq === i ? "−" : "+"}</span>
                </button>
                <div className="dv-faq-a">
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="dv-cta" ref={ctaRef}>
        <div className="dv-cta-bg">
          <video autoPlay loop muted playsInline className="dv-bg-video">
            <source src="/videos/vietnam.mp4" type="video/mp4" />
          </video>
          <div className="dv-cta-overlay" />
        </div>
        <div className={`dv-cta-content ${ctaVisible ? "visible" : ""}`}>
          <span className="dv-eyebrow">Sẵn sàng chưa?</span>
          <h2 className="dv-cta-title">Pizza nóng đang<br /><em>chờ bạn</em></h2>
          <p className="dv-cta-sub">Mở cửa 10:00 – 22:00 · Giao hàng toàn nội thành Hà Nội</p>
          <Link to="/menu" className="dv-btn dv-btn-primary dv-btn-large">
            Xem thực đơn & đặt hàng →
          </Link>
        </div>
      </section>

    </div>
  )
}
