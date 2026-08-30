package com.javaweb.config;

import com.javaweb.entity.User;
import com.javaweb.enums.UserGender;
import com.javaweb.enums.UserIsActive;
import com.javaweb.enums.UserRole;
import com.javaweb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StaffAccountSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedStaffIfMissing();
        seedDriverIfMissing();
    }

    private void seedStaffIfMissing() {
        if (userRepository.existsByUsername("staff")) {
            return;
        }

        User staff = new User();
        staff.setFullname("Tran Hai Nam");
        staff.setUsername("staff");
        staff.setPassword(passwordEncoder.encode("staff123"));
        staff.setPhone("0901000001");
        staff.setEmail("staff@haisapa.vn");
        staff.setAddress("Ha Noi");
        staff.setUserGender(UserGender.MALE);
        staff.setUserRole(UserRole.STAFF);
        staff.setUserIsActive(UserIsActive.ACTIVE);
        userRepository.save(staff);
    }

    private void seedDriverIfMissing() {
        if (userRepository.existsByUsername("driver")) {
            return;
        }

        User driver = new User();
        driver.setFullname("Le Van Tai");
        driver.setUsername("driver");
        driver.setPassword(passwordEncoder.encode("driver123"));
        driver.setPhone("0901000002");
        driver.setEmail("driver@haisapa.vn");
        driver.setAddress("Ha Noi");
        driver.setUserGender(UserGender.MALE);
        driver.setUserRole(UserRole.DRIVER);
        driver.setUserIsActive(UserIsActive.ACTIVE);
        userRepository.save(driver);
    }
}
