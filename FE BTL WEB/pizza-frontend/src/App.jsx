import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"

import Navbar from "./components/Navbar"
import { CartProvider }  from "./context/CartContext"
import { AuthProvider }  from "./context/AuthContext"

import Home           from "./pages/Home"
import Menu           from "./pages/Menu"
import About          from "./pages/About"
import PizzaDetail    from "./pages/PizzaDetails"
import Booking        from "./pages/Booking"
import BookingConfirm from "./pages/BookingConfirm"
import Delivery       from "./pages/Delivery"
import OrderMenu      from "./pages/OrderMenu"
import Cart           from "./pages/Cart"
import Checkout       from "./pages/Checkout"
import Careers        from "./pages/Careers"
import Login          from "./pages/Login"
import Profile        from "./pages/Profile"

function Layout() {
  const location = useLocation()
  const hideNavbar = ["/booking-confirm", "/login"].includes(location.pathname)

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/menu"            element={<Menu />} />
        <Route path="/about"           element={<About />} />
        <Route path="/pizza/:id"       element={<PizzaDetail />} />
        <Route path="/booking"         element={<Booking />} />
        <Route path="/booking-confirm" element={<BookingConfirm />} />
        <Route path="/delivery"        element={<Delivery />} />
        <Route path="/order"           element={<OrderMenu />} />
        <Route path="/cart"            element={<Cart />} />
        <Route path="/checkout"        element={<Checkout />} />
        <Route path="/careers"         element={<Careers />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/profile"         element={<Profile />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Layout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
