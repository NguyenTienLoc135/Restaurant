import { useState, useEffect, useRef } from "react"
import "./Careers.css"

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

const DEPARTMENTS = ["Tất cả", "Bếp", "Phục vụ", "Quản lý", "Marketing", "Vận hành"]
const LOCATIONS   = ["Hoàn Kiếm", "Ba Đình", "Đống Đa", "Hai Bà Trưng", "Tây Hồ", "Cầu Giấy","Bắc Từ Liêm", "Nam Từ Liêm", "Hà Đông", "Hoàng Mai", "Long Biên"]

const JOBS = [
  {
    id: 1, dept: "Bếp", highlight: true,
    title: "Bếp trưởng Bánh mì & Phô mai",
    location: "Ba Đình, Hà Nội",
    type: "Toàn thời gian",
    salary: "15,000,000 – 22,000,000 ₫/tháng",
    deadline: "31/03/2026",
    experience: "3+ năm",
    desc: "Dẫn dắt đội ngũ sản xuất phô mai và bánh mì thủ công hàng ngày. Đảm bảo chất lượng theo tiêu chuẩn Hải SAPA.",
    detail: `Bạn sẽ là người chịu trách nhiệm toàn bộ quy trình sản xuất phô mai tươi và bánh mì thủ công tại bếp Hải SAPA, từ khâu lựa chọn nguyên liệu đến thành phẩm cuối cùng.

Yêu cầu công việc:
• Tối thiểu 3 năm kinh nghiệm tại bếp bánh/phô mai nhà hàng cao cấp
• Có kiến thức về các loại phô mai Ý và kỹ thuật lên men
• Khả năng quản lý đội nhóm 4–6 người
• Đam mê ẩm thực thủ công và tiêu chuẩn cao

Quyền lợi:
• Lương cạnh tranh + thưởng KPI hàng quý
• Đào tạo tại Nhật Bản hoặc Ý (theo chương trình nội bộ)
• Bữa ăn theo ca, bảo hiểm đầy đủ`,
  },
  {
    id: 2, dept: "Bếp", highlight: false,
    title: "Pizzaiolo — Thợ làm Pizza",
    location: "Ba Đình, Hà Nội",
    type: "Toàn thời gian",
    salary: "10,000,000 – 16,000,000 ₫/tháng",
    deadline: "15/04/2026",
    experience: "1+ năm",
    desc: "Chuyên môn kỹ thuật lò củi & Napoli. Có kinh nghiệm tại nhà hàng Ý hoặc sẵn sàng được đào tạo chuyên sâu.",
    detail: `Bạn sẽ vận hành lò củi và chịu trách nhiệm chất lượng pizza theo chuẩn Napoli truyền thống của Hải SAPA.

Yêu cầu công việc:
• Kinh nghiệm làm pizza lò củi (Napoli-style) là lợi thế lớn
• Kỹ năng nhào bột, tạo hình tay thành thục
• Chịu được áp lực cao giờ cao điểm
• Tinh thần học hỏi và cầu tiến

Quyền lợi:
• Đào tạo chuyên sâu tại bếp Hải SAPA từ đầu
• Môi trường làm việc quốc tế, chuyên nghiệp
• Thu nhập tăng theo năng lực`,
  },
  {
    id: 3, dept: "Bếp", highlight: false,
    title: "Phụ bếp Pasta tươi",
    location: "Ba Đình, Hà Nội",
    type: "Toàn thời gian",
    salary: "8,000,000 – 11,000,000 ₫/tháng",
    deadline: "20/04/2026",
    experience: "Không yêu cầu",
    desc: "Hỗ trợ làm pasta nhà làm hàng ngày: fettuccine, tagliatelle, pappardelle. Niềm đam mê ẩm thực Ý là lợi thế.",
    detail: `Hỗ trợ đội bếp pasta cán và cắt các loại mì tươi nhà làm mỗi ngày theo công thức độc quyền của Hải SAPA.

Yêu cầu công việc:
• Không yêu cầu kinh nghiệm — sẽ được đào tạo hoàn toàn
• Cẩn thận, tỉ mỉ, có tinh thần đồng đội
• Yêu thích ẩm thực Ý

Quyền lợi:
• Đào tạo kỹ năng pasta từ đầu bởi bếp trưởng người Ý
• Lộ trình thăng tiến rõ ràng
• Bữa ăn miễn phí theo ca`,
  },
  {
    id: 4, dept: "Phục vụ", highlight: false,
    title: "Nhân viên phục vụ cao cấp",
    location: "Ba Đình, Hà Nội",
    type: "Toàn thời gian",
    salary: "8,500,000 – 13,000,000 ₫/tháng",
    deadline: "10/04/2026",
    experience: "1+ năm",
    desc: "Mang đến trải nghiệm ẩm thực tinh tế cho khách. Thành thạo tiếng Anh là yêu cầu bắt buộc.",
    detail: `Bạn là gương mặt đại diện của Hải SAPA, mang lại trải nghiệm ẩm thực tinh tế và đáng nhớ cho từng thực khách.

Yêu cầu công việc:
• Tiếng Anh giao tiếp tốt (bắt buộc)
• Kinh nghiệm phục vụ nhà hàng cao cấp tối thiểu 1 năm
• Ngoại hình sáng, thái độ chuyên nghiệp
• Kỹ năng upselling và xử lý tình huống

Quyền lợi:
• Lương cứng + tips + thưởng tháng
• Đồng phục cao cấp do nhà hàng cung cấp
• Đào tạo kỹ năng wine & cocktail pairing`,
  },
  {
    id: 5, dept: "Phục vụ", highlight: false,
    title: "Bartender & Pha chế đồ uống",
    location: "Ba Đình, Hà Nội",
    type: "Toàn thời gian",
    salary: "10,000,000 – 15,000,000 ₫/tháng",
    deadline: "25/04/2026",
    experience: "2+ năm",
    desc: "Phụ trách cocktail, bia craft Hải SAPA và danh mục đồ uống. Đam mê mixology và khả năng sáng tạo công thức mới.",
    detail: `Phụ trách toàn bộ bar, từ cocktail signature đến danh mục bia craft độc quyền Hải SAPA.

Yêu cầu công việc:
• Tối thiểu 2 năm kinh nghiệm bartending tại bar/nhà hàng
• Kiến thức wine, craft beer và spirits
• Khả năng sáng tạo cocktail mới theo mùa
• Tiếng Anh cơ bản

Quyền lợi:
• Tham gia phát triển menu đồ uống mới
• Đào tạo wine pairing cùng sommelier
• Môi trường sáng tạo, được thể hiện bản thân`,
  },
  {
    id: 6, dept: "Quản lý", highlight: true,
    title: "Quản lý nhà hàng",
    location: "Ba Đình, Hà Nội",
    type: "Toàn thời gian",
    salary: "25,000,000 – 40,000,000 ₫/tháng",
    deadline: "05/04/2026",
    experience: "3+ năm quản lý",
    desc: "Điều hành toàn bộ hoạt động nhà hàng. Tối thiểu 3 năm kinh nghiệm quản lý F&B cao cấp.",
    detail: `Bạn sẽ là người chèo lái toàn bộ hoạt động của nhà hàng Hải SAPA, đảm bảo chất lượng dịch vụ và mục tiêu kinh doanh.

Yêu cầu công việc:
• 3+ năm kinh nghiệm quản lý nhà hàng cao cấp / F&B
• Kỹ năng lãnh đạo đội nhóm 20–40 người
• Tiếng Anh thành thạo
• Hiểu biết về P&L, chi phí vận hành
• Định hướng khách hàng và giải quyết vấn đề nhanh

Quyền lợi:
• Gói lương hấp dẫn + bonus theo doanh thu
• Cổ phần ưu đãi cho nhân sự cấp cao (tùy đánh giá)
• Lộ trình phát triển thành Regional Manager`,
  },
  {
    id: 7, dept: "Marketing", highlight: false,
    title: "Content Creator & Chụp ảnh ẩm thực",
    location: "Linh hoạt, Hà Nội",
    type: "Bán thời gian",
    salary: "Thỏa thuận",
    deadline: "30/04/2026",
    experience: "Portfolio yêu cầu",
    desc: "Sản xuất nội dung hình ảnh và video cho mạng xã hội. Portfolio chụp ảnh food đẹp là điểm cộng lớn.",
    detail: `Sáng tạo nội dung hình ảnh và video cho Instagram, Facebook và TikTok của Hải SAPA.

Yêu cầu công việc:
• Portfolio food photography/videography ấn tượng (bắt buộc)
• Thành thạo Lightroom, Premiere Pro hoặc CapCut
• Hiểu về storytelling thương hiệu và social media trends
• Làm việc linh hoạt 2–3 buổi/tuần

Quyền lợi:
• Thu nhập linh hoạt theo dự án
• Được ăn thử menu mới miễn phí khi chụp
• Portfolio thương hiệu đẹp cho career`,
  },
  {
    id: 8, dept: "Vận hành", highlight: false,
    title: "Nhân viên giao hàng — Rider",
    location: "Nội thành Hà Nội",
    type: "Toàn thời gian",
    salary: "9,000,000 – 14,000,000 ₫/tháng",
    deadline: "Tuyển liên tục",
    experience: "Không yêu cầu",
    desc: "Giao hàng đảm bảo chất lượng, nhanh chóng. Có xe máy và giấy phép lái xe. Thu nhập hấp dẫn + thưởng KPI.",
    detail: `Bạn là cầu nối đưa trải nghiệm ẩm thực Hải SAPA đến tận cửa nhà khách hàng, đảm bảo món ăn tươi ngon và đúng giờ.

Yêu cầu công việc:
• Có xe máy cá nhân và giấy phép lái xe hợp lệ
• Thuộc nội thành Hà Nội
• Trung thực, cẩn thận, đúng giờ
• Sức khỏe tốt

Quyền lợi:
• Lương cứng + thưởng giao hàng đúng giờ
• Phụ cấp xăng xe + bảo dưỡng
• Bảo hiểm tai nạn 24/7`,
  },
]

const BENEFITS = [
  { icon: "🍕", title: "Bữa ăn miễn phí",    desc: "Bữa ăn theo ca từ thực đơn nhà hàng" },
  { icon: "📚", title: "Đào tạo chuyên sâu", desc: "Chương trình học nghề bài bản tại nhà bếp" },
  { icon: "🌏", title: "Cơ hội phát triển",  desc: "Lộ trình thăng tiến rõ ràng tại Hải SAPA" },
  { icon: "🏥", title: "Bảo hiểm sức khỏe", desc: "Bảo hiểm y tế đầy đủ theo luật" },
  { icon: "🎂", title: "Phúc lợi sinh nhật", desc: "Ngày sinh nhật nghỉ phép có lương" },
  { icon: "✈️", title: "Teambuilding",        desc: "Chuyến du lịch team hàng năm" },
]

const VALUES = [
  { num: "01", title: "Make the world smile",  desc: "Chúng tôi tin rằng ẩm thực có sức mạnh kết nối con người. Mỗi món ăn là một nụ cười." },
  { num: "02", title: "Craft with integrity",  desc: "Phô mai làm tay mỗi ngày. Pasta cán tươi mỗi sáng. Không có đường tắt nào trong bếp Hải SAPA." },
  { num: "03", title: "Grow together",         desc: "Đồng nghiệp là gia đình. Thành công của một người là thành công của cả đội." },
]

/* ══════════════ APPLY MODAL ══════════════ */
function ApplyModal({ job, onClose }) {
  const [form, setForm]       = useState({ firstName: "", lastName: "", email: "", phone: "", locations: [], note: "" })
  const [errors, setErrors]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab]         = useState("detail") // "detail" | "apply"

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })) }

  function toggleLoc(loc) {
    setForm(f => ({
      ...f,
      locations: f.locations.includes(loc)
        ? f.locations.filter(l => l !== loc)
        : [...f.locations, loc]
    }))
  }

  function validate() {
    const e = {}
    if (!form.firstName.trim()) e.firstName = "Vui lòng nhập tên"
    if (!form.lastName.trim())  e.lastName  = "Vui lòng nhập họ"
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email không hợp lệ"
    if (!form.phone.trim() || form.phone.length < 9) e.phone = "Số điện thoại không hợp lệ"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    setSubmitted(true)
  }

  // close on backdrop
  function onBackdrop(e) { if (e.target === e.currentTarget) onClose() }

  if (submitted) return (
    <div className="am-backdrop" onClick={onBackdrop}>
      <div className="am-modal">
        <button className="am-close" onClick={onClose}>✕</button>
        <div className="am-success">
          <div className="am-success-icon">✓</div>
          <h2>Đã nhận hồ sơ!</h2>
          <p>Cảm ơn <strong>{form.firstName} {form.lastName}</strong>.<br/>Chúng tôi sẽ liên hệ qua <strong>{form.email}</strong> trong vòng 3–5 ngày làm việc.</p>
          <button className="am-done-btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="am-backdrop" onClick={onBackdrop}>
      <div className="am-modal">
        <button className="am-close" onClick={onClose}>✕</button>

        {/* tab switcher */}
        <div className="am-tabs">
          <button className={`am-tab ${tab === "detail" ? "active" : ""}`} onClick={() => setTab("detail")}>Chi tiết</button>
          <button className={`am-tab ${tab === "apply"  ? "active" : ""}`} onClick={() => setTab("apply")}>Nộp hồ sơ</button>
        </div>

        {/* ── DETAIL TAB ── */}
        {tab === "detail" && (
          <div className="am-detail">
            <div className="am-job-header">
              {job.highlight && <span className="am-featured">⭐ Vị trí nổi bật</span>}
              <h2 className="am-job-title">{job.title}</h2>
              <span className={`am-job-type ${job.type === "Bán thời gian" ? "part" : ""}`}>{job.type}</span>
            </div>

            <div className="am-info-grid">
              <div className="am-info-item">
                <span className="am-info-icon">💰</span>
                <div>
                  <span className="am-info-label">Mức lương</span>
                  <span className="am-info-val">{job.salary}</span>
                </div>
              </div>
              <div className="am-info-item">
                <span className="am-info-icon">📍</span>
                <div>
                  <span className="am-info-label">Địa điểm</span>
                  <span className="am-info-val">{job.location}</span>
                </div>
              </div>
              <div className="am-info-item">
                <span className="am-info-icon">📅</span>
                <div>
                  <span className="am-info-label">Hạn nộp hồ sơ</span>
                  <span className="am-info-val">{job.deadline}</span>
                </div>
              </div>
              <div className="am-info-item">
                <span className="am-info-icon">🏅</span>
                <div>
                  <span className="am-info-label">Kinh nghiệm</span>
                  <span className="am-info-val">{job.experience}</span>
                </div>
              </div>
            </div>

            <div className="am-desc-section">
              {job.detail.split("\n\n").map((para, i) => (
                <p key={i} className="am-para">
                  {para.split("\n").map((line, j) => (
                    <span key={j}>
                      {line.startsWith("•") ? <span className="am-bullet">{line}</span> : line}
                      {j < para.split("\n").length - 1 && <br/>}
                    </span>
                  ))}
                </p>
              ))}
            </div>

            <button className="am-apply-cta" onClick={() => setTab("apply")}>
              Ứng tuyển ngay →
            </button>
          </div>
        )}

        {/* ── APPLY TAB ── */}
        {tab === "apply" && (
          <div className="am-form">
            <h2 className="am-form-title">Nộp đơn ứng tuyển<br /><em>{job.title}</em></h2>

            <div className="am-field">
              <label>Tên (First Name) <span className="am-req">*</span></label>
              <input
                value={form.firstName}
                onChange={e => set("firstName", e.target.value)}
                placeholder="Tên của bạn"
                className={errors.firstName ? "err" : ""}
              />
              {errors.firstName && <span className="am-err-msg">{errors.firstName}</span>}
            </div>

            <div className="am-field">
              <label>Họ (Last Name) <span className="am-req">*</span></label>
              <input
                value={form.lastName}
                onChange={e => set("lastName", e.target.value)}
                placeholder="Họ của bạn"
                className={errors.lastName ? "err" : ""}
              />
              {errors.lastName && <span className="am-err-msg">{errors.lastName}</span>}
            </div>

            <div className="am-field">
              <label>Email <span className="am-req">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                placeholder="email@example.com"
                className={errors.email ? "err" : ""}
              />
              {errors.email && <span className="am-err-msg">{errors.email}</span>}
            </div>

            <div className="am-field">
              <label>Chọn Địa Điểm bạn Muốn Làm Việc</label>
              <div className="am-loc-tags">
                {form.locations.map(l => (
                  <span key={l} className="am-loc-tag">
                    {l} <button onClick={() => toggleLoc(l)}>×</button>
                  </span>
                ))}
              </div>
              <div className="am-loc-options">
                {LOCATIONS.filter(l => !form.locations.includes(l)).map(l => (
                  <button key={l} className="am-loc-opt" onClick={() => toggleLoc(l)}>{l}</button>
                ))}
              </div>
            </div>

            <div className="am-field">
              <label>Số điện thoại (Phone number) <span className="am-req">*</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="0901 234 567"
                className={errors.phone ? "err" : ""}
              />
              {errors.phone && <span className="am-err-msg">{errors.phone}</span>}
            </div>

            <div className="am-field">
              <label>Giới thiệu bản thân (tùy chọn)</label>
              <textarea
                value={form.note}
                onChange={e => set("note", e.target.value)}
                placeholder="Chia sẻ thêm về kinh nghiệm hoặc lý do bạn muốn gia nhập Hải SAPA..."
                rows={4}
              />
            </div>

            <button className="am-submit" onClick={handleSubmit}>APPLY</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════ MAIN PAGE ══════════════ */
export default function Careers() {
  const [activeDept, setActiveDept] = useState("Tất cả")
  const [selectedJob, setSelectedJob] = useState(null)
  const [heroIn,     setHeroIn]     = useState(false)

  const [valuesRef,  valuesVisible]  = useInView(0.15)
  const [benefitRef, benefitVisible] = useInView(0.1)
  const [jobsRef,    jobsVisible]    = useInView(0.05)

  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 80)
    return () => clearTimeout(t)
  }, [])

  // lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selectedJob ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [selectedJob])

  const filtered = activeDept === "Tất cả" ? JOBS : JOBS.filter(j => j.dept === activeDept)

  return (
    <div className="cr-page">

      {/* ══ HERO ══ */}
      <section className="cr-hero">
        <div className="cr-hero-bg">
          <video autoPlay loop muted playsInline className="cr-hero-video">
            <source src="/videos/hanoi.mp4" type="video/mp4" />
          </video>
          <div className="cr-hero-overlay" />
          <div className="cr-grain" />
        </div>

        <div className={`cr-hero-content ${heroIn ? "in" : ""}`}>
          <span className="cr-eyebrow">Gia nhập đội ngũ</span>
          <h1 className="cr-hero-title">
            <span>Cùng chúng tôi</span>
            <span className="cr-italic">làm nên</span>
            <span>điều kỳ diệu</span>
          </h1>
          <p className="cr-hero-sub">
            Hải SAPA đang tìm kiếm những người yêu ẩm thực, đam mê sáng tạo và muốn xây dựng điều gì đó ý nghĩa cùng nhau.
          </p>
          <a href="#jobs" className="cr-hero-cta">Xem vị trí tuyển dụng ↓</a>
        </div>

        <div className="cr-hero-stats">
          {[["12+", "Quốc gia"], ["500+", "Nhân viên"], ["4.8★", "Điểm đánh giá"]].map(([n, l]) => (
            <div key={l} className="cr-stat-card">
              <strong>{n}</strong>
              <small>{l}</small>
            </div>
          ))}
        </div>
      </section>

      {/* ══ VALUES ══ */}
      <section className="cr-values" ref={valuesRef}>
        <div className="cr-container">
          <div className="cr-section-label">Triết lý của chúng tôi</div>
          <h2 className={`cr-section-title ${valuesVisible ? "in" : ""}`}>
            Điều gì khiến<br /><em>Hải SAPA khác biệt</em>
          </h2>
          <div className="cr-values-grid">
            {VALUES.map((v, i) => (
              <div key={v.num} className={`cr-value-card ${valuesVisible ? "in" : ""}`} style={{ "--d": `${i * 0.15}s` }}>
                <span className="cr-value-num">{v.num}</span>
                <div className="cr-value-line" />
                <h3 className="cr-value-title">{v.title}</h3>
                <p className="cr-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BENEFITS ══ */}
      <section className="cr-benefits" ref={benefitRef}>
        <div className="cr-container">
          <div className="cr-section-label">Phúc lợi</div>
          <h2 className={`cr-section-title cr-title-light ${benefitVisible ? "in" : ""}`}>
            Chúng tôi chăm sóc<br /><em>từng thành viên</em>
          </h2>
          <div className="cr-benefits-grid">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className={`cr-benefit-card ${benefitVisible ? "in" : ""}`} style={{ "--d": `${i * 0.1}s` }}>
                <span className="cr-benefit-icon">{b.icon}</span>
                <h3 className="cr-benefit-title">{b.title}</h3>
                <p className="cr-benefit-desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ JOBS ══ */}
      <section className="cr-jobs" id="jobs" ref={jobsRef}>
        <div className="cr-container">
          <div className="cr-section-label">Vị trí đang tuyển</div>
          <h2 className={`cr-section-title ${jobsVisible ? "in" : ""}`}>
            Tìm vị trí<br /><em>phù hợp với bạn</em>
          </h2>

          <div className="cr-dept-filter">
            {DEPARTMENTS.map(d => (
              <button key={d} className={`cr-dept-btn ${activeDept === d ? "active" : ""}`} onClick={() => setActiveDept(d)}>
                {d}
              </button>
            ))}
          </div>

          <div className={`cr-job-list ${jobsVisible ? "in" : ""}`}>
            {filtered.map((job) => (
              <div key={job.id} className={`cr-job-item ${job.highlight ? "highlight" : ""}`}>
                <button className="cr-job-header" onClick={() => setSelectedJob(job)}>
                  <div className="cr-job-left">
                    {job.highlight && <span className="cr-job-featured">⭐ Nổi bật</span>}
                    <h3 className="cr-job-title">{job.title}</h3>
                    <div className="cr-job-meta">
                      <span className="cr-job-dept">{job.dept}</span>
                      <span className="cr-meta-dot">·</span>
                      <span>📍 {job.location}</span>
                      <span className="cr-meta-dot">·</span>
                      <span className={`cr-job-type ${job.type === "Bán thời gian" ? "part" : ""}`}>{job.type}</span>
                      <span className="cr-meta-dot">·</span>
                      <span className="cr-job-salary">💰 {job.salary}</span>
                    </div>
                    <p className="cr-job-snippet">{job.desc}</p>
                  </div>
                  <span className="cr-job-arrow">Xem chi tiết →</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ OPEN APP CTA ══ */}
      <section className="cr-open-app">
        <div className="cr-open-inner">
          <span className="cr-section-label cr-label-light">Không tìm thấy vị trí phù hợp?</span>
          <h2 className="cr-open-title">Hãy tự giới thiệu<br /><em>bản thân</em></h2>
          <p className="cr-open-desc">Chúng tôi luôn chào đón những tài năng đặc biệt. Gửi hồ sơ và câu chuyện của bạn — chúng tôi đọc tất cả.</p>
          <button className="cr-open-btn" onClick={() => setSelectedJob({ id: 0, title: "Hồ sơ tự do", type: "Tùy chọn", salary: "Thỏa thuận", location: "Hà Nội", deadline: "Không giới hạn", experience: "Không yêu cầu", highlight: false, detail: "Gửi hồ sơ tự do để chúng tôi tìm vị trí phù hợp nhất cho bạn." })}>
            Gửi hồ sơ tự do
          </button>
        </div>
      </section>

      {/* ══ MODAL ══ */}
      {selectedJob && <ApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  )
}
