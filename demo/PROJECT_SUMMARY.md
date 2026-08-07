# TONG QUAN DU AN (Restaurant Service)

| Cot trai | Cot phai |
|---|---|
| **Thong tin du an**  
- Ten: Restaurant Service  
- Nhom: Backend (Spring Boot)  
- Port mac dinh: 8082  
- DB: MySQL  
- Xac thuc: JWT (HS256)  
- Vai tro: CUSTOMER, STAFF, DRIVER  

**Cong nghe su dung**  
- Java 21, Maven  
- Spring Boot 3.3.4  
- Spring Web, Spring Security, OAuth2 Resource Server  
- Spring Data JPA, Validation  
- ModelMapper, Lombok  
- Nimbus JOSE JWT  
- Thymeleaf, OpenPDF, Apache POI  

**Cau hinh chay**  
- `.env`: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SIGNER_KEY`  
- `application.properties`: `spring.jpa.hibernate.ddl-auto=update`  

**Quy trinh & Git**  
- Nhanh: `main` (ahead 19 so voi `origin/master`)  
- Commit gan nhat: `40a367c update`  
- Working tree: thay doi o `..\.idea\workspace.xml`  
| **Mo ta du an**  
Dich vu nha hang cung cap API cho khach hang dat mon, dat ban; nhan vien quan ly menu/don/dat ban; tai xe nhan giao hang. He thong su dung JWT de xac thuc va phan quyen theo vai tro.  

**Luong nghiep vu chinh**  
- Dang ky/Dang nhap: tao user, login nhan JWT (1h).  
- Xem menu: public search/list/detail mon an.  
- Dat mon: customer tao don `PENDING`, tinh tong tien theo OrderDetail.  
- Huy don: chi huy khi `PENDING`.  
- Quan ly don: staff xem/loc va cap nhat trang thai.  
- Giao hang: driver nhan don o trang thai `DELIVERY`, chuyen sang `DELIVERING`.  
- Dat ban: customer tao/huy dat ban; staff duyet/cap nhat status.  
- Quan ly user: staff xem danh sach va khoa/mo khoa.  

**Cac module/chuc nang**  
- Public: login, register, view menu  
- User: thong tin ca nhan, dat mon, dat ban  
- Staff: menu, orders, reservations, users  
- Driver: nhan giao hang  

**Diem can luu y**  
- API duoc chan theo `SecurityFilterChain` va `@PreAuthorize`.  
- `OrderStatus`: PENDING, ACCEPTED, CANCELLED, DELIVERY, DELIVERING, COMPLETED, INCOMPLETE.  
- `BookingStatus`: PENDING, ACCEPTED, CANCELLED.  
|
