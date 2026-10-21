---
title: "Haptic Handwheel — sketch — looking around"
born: 2026-10-19
links:
  - target: "[[Haptic Handwheel]]"
    type: connects-to
    label: child-of
forward_vector: "I keep the directions Loudon looked around in on the evening of 2026-10-06, so he can remember they are possible; I am not a plan, and I am done when the parts order is decided and each direction here has been taken into it or let go."
---

# Looking around, 2026-10-06

**Not a plan.** `order/PARTS.md` governs, and nothing here changes it unless Loudon says so. Every direction below is marked by where it came from, and none was checked on a vendor page, a datasheet or a bench.

His words, 2026-10-19:

> "Those questions were me looking around, trying to question our understanding and bring in other perspectives. Trying to consider alternate uses and perhaps cheaper approaches. I want to remember that this is possible, and I will absolutely continue with this project this winter."

The questions were asked on the evening of 2026-10-06, and the room answered them then, about the brief's parts. The steward's parts order of 2026-10-13 replaced two of those parts, the driver and the controller (`PARTS.md:14-15`). Where an answer leans on them, it says so.

## The directions

### 1. A clamped knob with stronger pushback: a bigger motor

*Search summary, unchecked. No cogging figure was found for either motor.*

Decide the torque wanted first, and stay direct drive: gears add backlash and fight a freely spinning knob. The same family has a larger sibling, the iPower GM8112, listed at 6–9 kg·cm. More rotor mass and lumpiness would fight the light, fine feel. The 14-bit encoder becomes the weak link sooner; the MT6835 (21-bit, rated above the AS5048A by the SimpleFOC community) is the step up. A bar on a strong motor can whip, so touch sensing would move early, and a long bar side-loads the small bearings. The room advised building the brief's version first, to learn whether its push feels weak.

One claim was withdrawn in the next answer: the brief's shield would not give only a third of the bigger motor's torque. The GM8112's listed torque is at about the current the shield is rated for, so the shield could plausibly drive it with no headroom. A stronger driver (B-G431B-ESC1 with current sensing, ODrive, moteus) is only needed to go past that.

*Against the order:* it buys the GM5208-12 (`PARTS.md:13`) and a SimpleFOC Mini in place of the shield (`:14`), so the shield point has to be redone for the Mini. The desk clamp is already in the mount block (`:20`), and the lever or bar is left out as a second build (`:60`).

Sources: [iPower GM8112](https://shop.iflight.com/ipower-motor-gm8112-brushless-gimbal-motor-pro195) · [MT6835, SimpleFOC community](https://community.simplefoc.com/t/mt6835-angle-sensor-21bit/2910) · [B-G431B-ESC1 current control](https://community.simplefoc.com/t/b-g431b-esc1-current-control/521) · [B-G431B-ESC1 with AS5047P over SPI](https://community.simplefoc.com/t/b-g431b-esc1-with-as5047p-spi-and-can-bus-via-simplefoc/8015)

### 2. Encoder and driver from the same vendor

*Search summary, unchecked. The last point is the room's understanding, not a read page.*

iFlight sells its larger iPower motors with the same AS5048A encoder already mounted, and the encoder board alone. It is the same 14-bit part at every size, so resolution does not grow with the motor. The boards it pairs with these motors are camera-gimbal controllers (AlexMos, BaseCam), which the room understood will not run a feel function you write. The driver comes from elsewhere at any motor size.

*Against the order:* the driver is still a third-party part (`PARTS.md:14`).

Sources: [GM8112-80T with encoder](https://shop.iflight.com/ipower-motor-gm8112t-brushless-gimbal-motor-with-as5048a-encoder-pro246) · [GM110-10 with encoder](https://shop.iflight.com/ipower-gimbal-motor-gm110-10-with-as5048a-encoder-pro1300) · [GM110-8 with encoder](https://shop.iflight.com/motion-control-systems-cat34/ipower-motor-gm110-8-gimbal-motor-with-as5048a-encoder-pro242) · [AS5048A, sold separately](https://shop.iflight.com/gimbal-motors-cat44/as5048a-magnetic-encoder-pro262) · [GM8112-80T combo with AlexMos controller](https://shop.iflight.com/alexmos-32-bit-bgc-with-gm8112-encoder-system-combo-set-pro227) · [BaseCam SimpleBGC](https://shop.basecamelectronics.com/product/simplebgc-32-bit-oem-v1-2)

### 3. Actuators from other industries

*Search summary, unchecked. No price was looked up.*

- **Robot-joint actuators** (CubeMars AK): motor, gearbox, encoder and driver in one can. Geared, with a listed backlash you would feel through a knob. The room ruled them out for the instrument.
- **Robotics direct drive with the driver inside** (DJI RoboMaster GM6020): the gimbal motor's closest cousin, rated 1.2 N·m, controlled over CAN, with an angle sensor coarser than the brief's. As the room understood it, the feel function would run on your own board.
- **Coreless motors** (Maxon): no iron in the rotor, so no cogging, and less torque for the money. The Technics SL-1200G turntable uses a coreless direct-drive motor.
- **Brakes instead of motors** (XeelTech Hapticore): a fluid that stiffens on command, giving ticks, end stops and resistance. It can only resist, so it cannot play an LFO into the hand or turn itself to a pitch.

The room's read: a brake suits the context knob (detents, end stops, fine control), and an evaluation kit is worth trying before designing that product around a motor. The instrument needs a motor to push. Coreless is where to go if the gimbal's lumpiness limits the fine feel, and the GM6020 is the one to look at for a clamped, strong version. This bears on the entry's open question of whether the instrument and the context knob are one object or two (`Haptic Handwheel.md` § Forward Vectors).

*Against the order:* it keeps one motor for everything (`PARTS.md:13`) and names no alternative.

Sources: [DJI RoboMaster GM6020](https://www.robomaster.com/en-US/products/components/general/gm6020/info) · [CubeMars AK80-9](https://www.robotshop.com/products/cubemars-ak80-9-v30-kv100-ak-series-robotic-actuator) · [CubeMars AK10-9](https://uk.robotshop.com/products/cubemars-ak10-9-v20-kv100-ak-series-robotic-actuator) · [Maxon RE 30 EB](https://www.automate.org/robotics/news/the-re-30-eb-15-w-maxon-dc-motor-for-fine-rotary-motions) · [Technics SL-1200G](https://us.technics.com/products/direct-drive-turntable-system-sl-1200g-s) · [XeelTech HAPTICORE](https://www.xeeltech.com/?p=2157) · [HAPTICORE 34 evaluation kit](https://shop.xeeltech.com/wp-content/uploads/2023/03/Eval-Kit-HAPTICORE-34-P001X2_Datasheet.pdf)

### 4. Hub motors from hoverboards, Onewheels and electric unicycles

*Search summary, unchecked. Torque and price were not checked.*

Direct drive, gearless, built for a person to push against. They give torque cheaply and real momentum, which is the one thing a turntable platter wants, and VESC, the open controller from that world, can run a script of yours on the controller. The costs: hall sensors only, so an encoder would have to be added; ODrive's own guide says the motors are high-inductance and the current loop has to be slowed, which rules out fast, fine torque such as feeling a G; the size and weight are the opposite of a light cap; and the torque is enough to hurt. A Onewheel lifts its nose to warn of the speed limit, and its makers call that "pushback": a message sent through force, close to his claim.

The room's read: this is neither the knob nor the context knob but the platter. If the turntable feel turns out to matter most, a hub motor with a VESC or ODrive and an added encoder is the cheapest route to a wheel with real momentum, and the gimbal motor stays for the knob. One sentence was withdrawn, "from handling them", because it claimed an experience the room does not have; it is not carried here.

*Against the order:* it has one motor, and a printed disc of known mass for the inertia test (`PARTS.md:19`). A hub motor would be a second object.

Sources: [ODrive hoverboard setup guide](https://docs.odriverobotics.com/v/0.5.5/hoverboard.html) · [VESC LispBM introduction](https://mintlify.wiki/vedderb/bldc/lispbm/introduction) · [VESC firmware changelog](https://github.com/vedderb/bldc/blob/master/CHANGELOG.md) · [Onewheel: push back](https://onewheel.com/pages/push-back) · [What is pushback on a Onewheel](https://trailwheel.com/what-is-pushback-on-a-onewheel/)

### 5. A line on the cap as an absolute pointer

*From memory; the room ran no search for this answer. Unchecked.*

The brief's encoder reads the angle of a magnet on the shaft directly, so the firmware knows where the line points the moment it powers on, with no homing spin. It is fine enough for a pointer, and the error from an off-centre magnet repeats exactly. Three things have to be right: the cap keyed to the shaft, zero set once and stored after the cap is fitted, and the motor actually landing the line, which is the job of the I term in PID. It cannot know how many turns passed while off, which does not matter for a pointer. Then the pointer is the display: click a parameter and the knob turns itself to that value, with no lights or text, which is his claim, and it is the look of a vintage pointer knob that is never out of step with the value. A brake cannot move its own line. Hub motors cannot do it, because their hall sensors cannot tell which of many identical magnet pairs the line faces. The room did not check whether the GM6020's built-in sensor is absolute.

*Against the order:* it keeps the same encoder (`PARTS.md:13`). The nearest source is the AS5048 datasheet, linked in 8.

### 6. Free inputs and outputs on the controller

*Search summary, unchecked. The counts were the room's own arithmetic.*

The room's counts of free pins, analog inputs and a second motor on a stacking shield were for the STM32 Nucleo and the SimpleFOCShield. The order replaced both (`PARTS.md:14-15`), so the counts are void until they are redone for the ESP32-DevKitC-32E and the Mini. What carries in kind: the motor loop's time runs out before pins do, so slow inputs are read at a lower rate and the torque input is the one needing care; analog is 0–3.3 V, so modular CV needs an op-amp stage to scale and protect it; and USB is serial only as built. A board with native USB audio (a Teensy 4) was suggested from memory. `PARTS.md:15` already names the ESP32-S3 as the variant with a native USB port.

Sources, about the shield and the Nucleo: [SimpleFOCShield v3 pads and pinout](https://docs.simplefoc.com/pads_soldering_v3) · [SimpleFOCShield README](https://github.com/simplefoc/Arduino-SimpleFOCShield/blob/master/README.md) · [ST Nucleo F446RE documentation](https://docs.zephyrproject.org/latest/boards/st/nucleo_f446re/doc/index.html)

### 7. Six mechanical keys, a big switch and some LEDs

*From memory; the room ran no search for this answer. Unchecked.*

Whether this fits was judged against the Nucleo's pins, so it needs redoing for the ESP32. In kind: one pin per key, using the chip's built-in pull-ups, and a few milliseconds of debounce. The room suggested making the big switch a hardware kill switch that cuts the driver's enable line or the motor supply, since a physical off for a motor under the hand is worth more than a seventh control. Small indicator LEDs can run from pins with a resistor; bright pilot lamps want a transistor each; smooth dimming, say to glow with an LFO, wants an LED driver chip on a spare I2C bus. Hall-effect versions of the same key shape sense how far the key is pressed, which would give pressure-style expression, one analog input each. The room said to check the chip's datasheet before going higher on LED current.

*Against the order:* it lists no keys, switch or LEDs. The keys are his idea, in the entry (`Haptic Handwheel.md:124`).

### 8. Hall-effect keys beside the motor's magnets

*Reasoning plus search summary; nothing was measured.*

The room's view: probably not a problem if the keys sit a few centimetres from the motor. The key's own magnet dominates at its sensor. The motor's steel shell and its many alternating poles keep most of its field close. The encoder's magnet is tiny and its field falls off fast, and the AS5048 datasheet claims immunity to external stray fields. The likelier trouble is electrical: small analog voltages near the motor's fast-switching phase wires. Keep the key wiring away from the motor wires and filter each input. A test before designing a board: hold a phone's compass-sensor app where the keys would go, turn the motor by hand, then run it, and see whether the reading moves. The firmware can re-zero each key's rest level while idle.

*Against the order:* nothing differs. It echoes the encoder-noise warning at `PARTS.md:20`.

Sources: [Gateron KS-20 magnetic switch](https://www.gateron.com/products/gateron-ks-20-magnetic-white-switch-set) · [AS5048 datasheet](https://cdn.sparkfun.com/assets/e/d/e/1/d/AS5048_DS000298_4-00.pdf)
