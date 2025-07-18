package com.example.wherewego.domain.placeReferences.entity;

import com.example.wherewego.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@Table(name = "references")
public class PlaceReference extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long referenceId;

    @Column(nullable = false, length = 20)
    private String apiProvider;

    @Column(nullable = false, length = 100)
    private String apiPlaceId;

    public PlaceReference(String apiProvider, String apiPlaceId) {
        this.apiProvider = apiProvider;
        this.apiPlaceId = apiPlaceId;
    }
}
