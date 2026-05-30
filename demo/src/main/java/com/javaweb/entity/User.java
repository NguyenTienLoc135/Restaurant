package com.javaweb.entity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.javaweb.enums.UserGender;
import com.javaweb.enums.UserIsActive;
import com.javaweb.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Collection;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name="users")
@NoArgsConstructor
public class User implements UserDetails{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="fullname")
    private String fullname;

    @Column(name="username")
    private String username;

    @Column(name="password")
    private String password;

    @Column(name="phone")
    private String phone;

    @Column(name="email")
    private String email;

    @Column(name="address")
    private String address;

    @Column(name="gender")
    @Enumerated(EnumType.STRING)
    private UserGender UserGender;

    @Column(name="role")
    @Enumerated(EnumType.STRING)
    private UserRole UserRole;

    @Column(name="status")
    @Enumerated(EnumType.STRING)
    private UserIsActive UserIsActive;

    @OneToMany(mappedBy = "customer",fetch = FetchType.LAZY)
    private List<Order> customerOrders;//lịch sử order của user

    @OneToMany(mappedBy = "driver", fetch = FetchType.LAZY)
    private List<Order> driverOrders;// lich sử order của driver

    @OneToMany(mappedBy = "user",fetch = FetchType.LAZY)
    private List<Booking> bookings;//lịch sử lịch đặt chỗ trước

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.UserRole.name()));
    }


}
