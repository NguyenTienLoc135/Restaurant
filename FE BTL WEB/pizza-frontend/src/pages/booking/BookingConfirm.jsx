import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./BookingConfirm.css"

function BookingConfirm(){

const navigate = useNavigate()
const location = useLocation()
const data = location.state

const [timeLeft,setTimeLeft] = useState(300)

const [firstName,setFirstName] = useState("")
const [lastName,setLastName] = useState("")
const [email,setEmail] = useState("")
const [phone,setPhone] = useState("")

const [success,setSuccess] = useState(false)

useEffect(()=>{

const timer = setInterval(()=>{

setTimeLeft(prev=>{

if(prev <= 1){
clearInterval(timer)
navigate("/booking")
return 0
}

return prev - 1

})

},1000)

return ()=>clearInterval(timer)

},[])

const minutes = Math.floor(timeLeft/60)
const seconds = timeLeft % 60

const percent = (timeLeft/300)*100

function handleSubmit(){

if(!firstName || !lastName || !email || !phone){

alert("Vui lòng nhập đầy đủ thông tin")
return

}

setSuccess(true)

setTimeout(()=>{

navigate("/booking")

},2000)

}

if(!data){
return <h2>Không có dữ liệu</h2>
}

return(

<div className="confirm-page">

<button
className="back-btn"
onClick={()=>navigate("/booking")}
>
← Quay lại
</button>

<div className="confirm-card">

{/* RESTAURANT INFO */}

<div className="restaurant-box">

<div>

<h3>{data.name}</h3>

<p>{data.address}</p>

<p>{data.people} người</p>

<p>{data.date} - {data.time}</p>

</div>

<div className="countdown">

<p>Thời gian còn lại</p>

<h2>
{minutes}:{seconds.toString().padStart(2,"0")}
</h2>

</div>

</div>

{/* PROGRESS BAR */}

<div className="progress">

<div
className="progress-bar"
style={{width:`${percent}%`}}
></div>

</div>

{/* FORM */}

<div className="form-box">

<h3>
Xin vui lòng cung cấp thông tin liên lạc được dùng cho việc đặt bàn của quý khách:
</h3>

<div className="form-grid">

<div className="input-group">

<label>Tên *</label>

<input
value={firstName}
onChange={(e)=>setFirstName(e.target.value)}
placeholder="Nhập tên"
/>

</div>

<div className="input-group">

<label>Họ *</label>

<input
value={lastName}
onChange={(e)=>setLastName(e.target.value)}
placeholder="Nhập họ"
/>

</div>

<div className="input-group full">

<label>Email *</label>

<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
placeholder="example@email.com"
/>

</div>

<div className="input-group">

<label>Số điện thoại *</label>

<div className="phone-input">

<span className="phone-country">🇻🇳 +84</span>

<input
value={phone}
onChange={(e)=>setPhone(e.target.value)}
placeholder="0123456789"
/>

</div>

</div>

<div className="notify">

<input type="checkbox"/>

<label>Thông báo tôi qua tin nhắn?</label>

</div>

</div>

<button
className="confirm-btn"
onClick={handleSubmit}
>

Đặt bàn ({minutes}:{seconds.toString().padStart(2,"0")})

</button>

</div>

</div>

{/* SUCCESS POPUP */}

{success && (

<div className="success-popup">

<div className="success-box">

<h2>Đặt bàn thành công</h2>

<p>Chúng tôi sẽ liên hệ với bạn sớm!</p>

</div>

</div>

)}

</div>

)

}

export default BookingConfirm
