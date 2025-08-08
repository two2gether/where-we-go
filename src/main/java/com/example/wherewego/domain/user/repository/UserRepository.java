package com.example.wherewego.domain.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.wherewego.domain.auth.enums.Provider;
import com.example.wherewego.domain.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByEmail(String email);

	Optional<User> findByEmailAndIsDeletedFalse(String email);

	@Query("SELECT u FROM User u WHERE u.id = :id AND u.isDeleted = false")
	Optional<User> findByIdAndIsDeletedFalse(@Param("id") Long id);

	@Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.isDeleted = false")
	boolean existsByEmailAndIsDeletedFalse(@Param("email") String email);

	Optional<User> findByProviderAndProviderId(Provider provider, String providerId);
}
