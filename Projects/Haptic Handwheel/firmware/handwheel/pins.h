// Haptic Handwheel — which pin goes where, for the two boards it may run on.
// box-day.html draws the same wiring; keep the two in step.
//
// The sketch first compiled for the Arduino Nano ESP32 with GPIO 25/26/27/14
// written in. That board's core numbers pins the Arduino way by default (D0–D13,
// Tools → Pin Numbering → "By Arduino pin"), where 25, 26 and 27 don't exist:
// it built cleanly and would have driven nothing. Each board now gets its own.
#pragma once

#if defined(ARDUINO_NANO_ESP32)
  // Arduino Nano ESP32 (ESP32-S3), "By Arduino pin" numbering.
  // SPI is the board's own: SCK D13 (also the LED, so it flickers), CIPO D12, COPI D11.
  #define HW_BOARD   "Arduino Nano ESP32"
  #define PIN_PWM_A  D2
  #define PIN_PWM_B  D3
  #define PIN_PWM_C  D4
  #define PIN_EN     D5
  #define PIN_ENC_CS D10
  #define PIN_SCK_LABEL  "D13"
  #define PIN_MISO_LABEL "D12"
  #define PIN_MOSI_LABEL "D11"
#else
  // ESP32-DevKitC (classic ESP32), the controller on order/PARTS.md.
  // SPI is VSPI: SCK 18, MISO 19, MOSI 23. GPIO 5 is a boot-strapping pin that
  // must sit high at power-on; a chip-select idles high, so it is safe here.
  #define HW_BOARD   "ESP32-DevKitC"
  #define PIN_PWM_A  25
  #define PIN_PWM_B  26
  #define PIN_PWM_C  27
  #define PIN_EN     14
  #define PIN_ENC_CS 5
  #define PIN_SCK_LABEL  "GPIO18"
  #define PIN_MISO_LABEL "GPIO19"
  #define PIN_MOSI_LABEL "GPIO23"
#endif
