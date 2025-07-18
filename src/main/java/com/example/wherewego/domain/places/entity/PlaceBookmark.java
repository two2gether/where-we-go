package com.example.wherewego.domain.places.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.placeReferences.entity.PlaceReference;
import com.example.wherewego.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@Table(name = "place_bookmarks")
public class PlaceBookmark extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long placeBookmarkId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_id", nullable = false)
    private PlaceReference placeReference;

    public PlaceBookmark(User user, PlaceReference placeReference) {
        this.user = user;
        this.placeReference = placeReference;
    }
}