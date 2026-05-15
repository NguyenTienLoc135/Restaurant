package com.javaweb.builder;

import com.javaweb.enums.UserGender;
import com.javaweb.enums.UserIsActive;
import com.javaweb.enums.UserRole;

public class UserSearchBuilder {
    private String name;
    private UserGender gender;
    private UserRole role;
    private UserIsActive isActive;

    public String getName() {
        return name;
    }

    public UserGender getGender() {
        return gender;
    }

    public UserRole getRole() {
        return role;
    }

    public UserIsActive getIsActive() {
        return isActive;
    }

    private UserSearchBuilder(Builder builder) {
        this.name = builder.name;
        this.gender = builder.gender;
        this.role = builder.role;
        this.isActive = builder.isActive;
    }

    public static class Builder {
        private String name;
        private UserGender gender;
        private UserRole role;
        private UserIsActive isActive;

        public Builder setName(String name) {
            this.name = name;
            return this;
        }

        public Builder setGender(UserGender gender) {
            this.gender = gender;
            return this;
        }

        public Builder setRole(UserRole role) {
            this.role = role;
            return this;
        }

        public Builder setIsActive(UserIsActive isActive) {
            this.isActive = isActive;
            return this;
        }

        public UserSearchBuilder build() {
            return new UserSearchBuilder(this);
        }
    }
}
