import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"

import Navbar from "./components/Navbar"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { MenuProvider } from "./context/MenuContext"
import { StaffProvider } from "./staff/StaffContext"

import Home from "./pages/public/Home"
import Menu from "./pages/public/Menu"
import About from "./pages/public/About"
import PizzaDetail from "./pages/order/PizzaDetails"
import Booking from "./pages/booking/Booking"
import BookingConfirm from "./pages/booking/BookingConfirm"
import Delivery from "./pages/public/Delivery"
import OrderMenu from "./pages/order/OrderMenu"
import Cart from "./pages/order/Cart"
import Checkout from "./pages/order/Checkout"
import Careers from "./pages/public/Careers"
import Login from "./pages/account/Login"
import Profile from "./pages/account/Profile"

import StaffLayout from "./staff/StaffLayout"

function Layout() {
  const location = useLocation()
  const hideNavbar =
    ["/booking-confirm", "/login"].includes(location.pathname) ||
    location.pathname.startsWith("/staff")

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/pizza/:id" element={<PizzaDetail />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking-confirm" element={<BookingConfirm />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/order" element={<OrderMenu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/staff/login" element={<Navigate to="/login" replace />} />
        <Route path="/staff/dashboard" element={<StaffLayout />} />
        <Route path="/staff" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StaffProvider>
          <MenuProvider>
            <CartProvider>
              <Layout />
            </CartProvider>
          </MenuProvider>
        </StaffProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
