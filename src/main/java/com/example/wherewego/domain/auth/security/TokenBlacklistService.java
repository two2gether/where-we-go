package com.example.wherewego.domain.auth.security;


import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.Collections;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class TokenBlacklistService {
    private final Set<String> blacklist = Collections.newSetFromMap(new ConcurrentHashMap<>());

    // 토큰을 블랙리스트에 추가
    public void blacklist(String token) {
        blacklist.add(token);
    }

    // 토큰이 블랙리스트에 있는지 확인
    public boolean isBlacklisted(String token) {
        return blacklist.contains(token);
    }
}
