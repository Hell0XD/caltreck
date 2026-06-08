package com.caltrek.api.food;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class ServingMeasurementTests {

    @Test
    void normalizesGramAliases() {
        ServingMeasurement serving = ServingMeasurement.normalize(new BigDecimal("8"), "grams");

        assertThat(serving.size()).isEqualByComparingTo("8");
        assertThat(serving.unit()).isEqualTo("g");
    }

    @Test
    void convertsMassToGrams() {
        ServingMeasurement kilograms = ServingMeasurement.normalize(new BigDecimal("0.25"), "kg");
        ServingMeasurement milligrams = ServingMeasurement.normalize(new BigDecimal("500"), "mg");

        assertThat(kilograms.size()).isEqualByComparingTo("250");
        assertThat(kilograms.unit()).isEqualTo("g");
        assertThat(milligrams.size()).isEqualByComparingTo("0.5");
        assertThat(milligrams.unit()).isEqualTo("g");
    }

    @Test
    void convertsVolumeToMilliliters() {
        ServingMeasurement liters = ServingMeasurement.normalize(new BigDecimal("0.33"), "litre");
        ServingMeasurement centiliters = ServingMeasurement.normalize(new BigDecimal("25"), "cl");

        assertThat(liters.size()).isEqualByComparingTo("330");
        assertThat(liters.unit()).isEqualTo("ml");
        assertThat(centiliters.size()).isEqualByComparingTo("250");
        assertThat(centiliters.unit()).isEqualTo("ml");
    }
}
