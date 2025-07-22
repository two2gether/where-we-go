package com.example.wherewego.domain.auth.security;

import com.example.wherewego.domain.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetail implements UserDetails {
    private final User user;

    public CustomUserDetail(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    public String getPassword() {
        return user.getPassword();
    }

    public String getUsername() {
        return user.getEmail();
    }

    public boolean isAccountNonExpired()     { return true; }
    public boolean isAccountNonLocked()      { return true; }
    public boolean isCredentialsNonExpired() { return true; }
    public boolean isEnabled()               { return true; }
}

