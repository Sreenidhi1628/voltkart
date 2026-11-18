/**
 * VoltKart Device Database
 * Contains detailed port, charging, and connectivity specifications
 * for Phones, Laptops, and TVs for real-time compatibility checks.
 */

export const phones = [
  {
    id: 'phone-iphone-16-pro-max',
    name: 'Apple iPhone 16 Pro Max',
    brand: 'Apple',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 2 (10Gbps)',
    fastChargeWattage: 30,
    chargingStandards: ['PD 3.0', 'MagSafe (25W)', 'Qi2 (15W)'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C (4K 60Hz)',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2024
  },
  {
    id: 'phone-iphone-16-pro',
    name: 'Apple iPhone 16 Pro',
    brand: 'Apple',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 2 (10Gbps)',
    fastChargeWattage: 27,
    chargingStandards: ['PD 3.0', 'MagSafe (25W)', 'Qi2 (15W)'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C (4K 60Hz)',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2024
  },
  {
    id: 'phone-iphone-16',
    name: 'Apple iPhone 16',
    brand: 'Apple',
    portType: 'USB-C',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 20,
    chargingStandards: ['PD 3.0', 'MagSafe (25W)', 'Qi2 (15W)'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C (4K 60Hz)',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2024
  },
  {
    id: 'phone-iphone-15-pro-max',
    name: 'Apple iPhone 15 Pro Max',
    brand: 'Apple',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 2 (10Gbps)',
    fastChargeWattage: 29,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi2 (15W)'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C (4K 60Hz)',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2023
  },
  {
    id: 'phone-iphone-15-pro',
    name: 'Apple iPhone 15 Pro',
    brand: 'Apple',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 2 (10Gbps)',
    fastChargeWattage: 27,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi2 (15W)'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C (4K 60Hz)',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2023
  },
  {
    id: 'phone-iphone-15-plus',
    name: 'Apple iPhone 15 Plus',
    brand: 'Apple',
    portType: 'USB-C',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 27,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi2 (15W)'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C (4K 60Hz)',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2023
  },
  {
    id: 'phone-iphone-15',
    name: 'Apple iPhone 15',
    brand: 'Apple',
    portType: 'USB-C',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 20,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi2 (15W)'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C (4K 60Hz)',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2023
  },
  {
    id: 'phone-iphone-14-pro-max',
    name: 'Apple iPhone 14 Pro Max',
    brand: 'Apple',
    portType: 'Lightning',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 27,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi (7.5W)'],
    audioJack: false,
    displayOut: 'Requires Lightning Digital AV Adapter',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2022
  },
  {
    id: 'phone-iphone-14-pro',
    name: 'Apple iPhone 14 Pro',
    brand: 'Apple',
    portType: 'Lightning',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 27,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi (7.5W)'],
    audioJack: false,
    displayOut: 'Requires Lightning Digital AV Adapter',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2022
  },
  {
    id: 'phone-iphone-14-plus',
    name: 'Apple iPhone 14 Plus',
    brand: 'Apple',
    portType: 'Lightning',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 20,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi (7.5W)'],
    audioJack: false,
    displayOut: 'Requires Lightning Digital AV Adapter',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2022
  },
  {
    id: 'phone-iphone-14',
    name: 'Apple iPhone 14',
    brand: 'Apple',
    portType: 'Lightning',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 20,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi (7.5W)'],
    audioJack: false,
    displayOut: 'Requires Lightning Digital AV Adapter',
    bluetoothVersion: '5.3',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2022
  },
  {
    id: 'phone-iphone-13-pro-max',
    name: 'Apple iPhone 13 Pro Max',
    brand: 'Apple',
    portType: 'Lightning',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 27,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi (7.5W)'],
    audioJack: false,
    displayOut: 'Requires Lightning Digital AV Adapter',
    bluetoothVersion: '5.0',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2021
  },
  {
    id: 'phone-iphone-13-pro',
    name: 'Apple iPhone 13 Pro',
    brand: 'Apple',
    portType: 'Lightning',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 23,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi (7.5W)'],
    audioJack: false,
    displayOut: 'Requires Lightning Digital AV Adapter',
    bluetoothVersion: '5.0',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2021
  },
  {
    id: 'phone-iphone-13-mini',
    name: 'Apple iPhone 13 mini',
    brand: 'Apple',
    portType: 'Lightning',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 18,
    chargingStandards: ['PD 2.0', 'MagSafe (12W)', 'Qi (7.5W)'],
    audioJack: false,
    displayOut: 'Requires Lightning Digital AV Adapter',
    bluetoothVersion: '5.0',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2021
  },
  {
    id: 'phone-iphone-13',
    name: 'Apple iPhone 13',
    brand: 'Apple',
    portType: 'Lightning',
    usbVersion: 'USB 2.0 (480Mbps)',
    fastChargeWattage: 20,
    chargingStandards: ['PD 2.0', 'MagSafe (15W)', 'Qi (7.5W)'],
    audioJack: false,
    displayOut: 'Requires Lightning Digital AV Adapter',
    bluetoothVersion: '5.0',
    audioCodecs: ['AAC', 'ALAC', 'SBC'],
    releaseYear: 2021
  },
  {
    id: 'phone-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 1 (5Gbps)',
    fastChargeWattage: 45,
    chargingStandards: ['PD 3.0 PPS', 'Fast Wireless 2.0 (15W)'],
    audioJack: false,
    displayOut: 'DisplayPort 1.2, Samsung DeX (4K 60Hz)',
    bluetoothVersion: '5.3',
    audioCodecs: ['LDAC', 'aptX', 'SSC', 'AAC', 'SBC'],
    releaseYear: 2024
  },
  {
    id: 'phone-s23',
    name: 'Samsung Galaxy S23',
    brand: 'Samsung',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 1',
    fastChargeWattage: 25,
    chargingStandards: ['PD 3.0 PPS', 'Fast Wireless (15W)'],
    audioJack: false,
    displayOut: 'DisplayPort 1.2, Samsung DeX',
    bluetoothVersion: '5.3',
    audioCodecs: ['LDAC', 'aptX', 'SSC', 'AAC', 'SBC'],
    releaseYear: 2023
  },
  {
    id: 'phone-samsung-a54',
    name: 'Samsung Galaxy A54 5G',
    brand: 'Samsung',
    portType: 'USB-C',
    usbVersion: 'USB 2.0',
    fastChargeWattage: 25,
    chargingStandards: ['PD 3.0 PPS'],
    audioJack: false,
    displayOut: 'No DisplayPort Alt Mode',
    bluetoothVersion: '5.3',
    audioCodecs: ['LDAC', 'aptX', 'SSC', 'AAC', 'SBC'],
    releaseYear: 2023
  },
  {
    id: 'phone-samsung-a35',
    name: 'Samsung Galaxy A35',
    brand: 'Samsung',
    portType: 'USB-C',
    usbVersion: 'USB 2.0',
    fastChargeWattage: 25,
    chargingStandards: ['PD 3.0 PPS'],
    audioJack: false,
    displayOut: 'No DisplayPort Alt Mode',
    bluetoothVersion: '5.3',
    audioCodecs: ['LDAC', 'aptX', 'SSC', 'AAC', 'SBC'],
    releaseYear: 2024
  },
  {
    id: 'phone-pixel-9-pro',
    name: 'Google Pixel 9 Pro',
    brand: 'Google',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 2',
    fastChargeWattage: 37,
    chargingStandards: ['PD 3.0 PPS', 'Pixel Stand (23W)', 'Qi'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C enabled',
    bluetoothVersion: '5.3',
    audioCodecs: ['LDAC', 'aptX HD', 'Opus', 'AAC', 'SBC'],
    releaseYear: 2024
  },
  {
    id: 'phone-pixel-8',
    name: 'Google Pixel 8',
    brand: 'Google',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 1',
    fastChargeWattage: 27,
    chargingStandards: ['PD 3.0 PPS', 'Qi (18W)'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C enabled (Android 14+)',
    bluetoothVersion: '5.3',
    audioCodecs: ['LDAC', 'aptX HD', 'AAC', 'SBC'],
    releaseYear: 2023
  },
  {
    id: 'phone-oneplus-12',
    name: 'OnePlus 12',
    brand: 'OnePlus',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 1',
    fastChargeWattage: 100,
    chargingStandards: ['SuperVOOC (100W)', 'AirVOOC (50W)', 'PD (27W)'],
    audioJack: false,
    displayOut: 'DisplayPort over USB-C',
    bluetoothVersion: '5.4',
    audioCodecs: ['LHDC 5.0', 'LDAC', 'aptX HD', 'aptX Adaptive', 'AAC'],
    releaseYear: 2024
  },
  {
    id: 'phone-oneplus-nord-4',
    name: 'OnePlus Nord 4',
    brand: 'OnePlus',
    portType: 'USB-C',
    usbVersion: 'USB 2.0',
    fastChargeWattage: 100,
    chargingStandards: ['SuperVOOC (100W)', 'PD (20W)'],
    audioJack: false,
    displayOut: 'No DisplayPort Alt Mode',
    bluetoothVersion: '5.4',
    audioCodecs: ['LDAC', 'aptX HD', 'AAC'],
    releaseYear: 2024
  },
  {
    id: 'phone-nothing-phone-2',
    name: 'Nothing Phone (2)',
    brand: 'Nothing',
    portType: 'USB-C',
    usbVersion: 'USB 2.0',
    fastChargeWattage: 45,
    chargingStandards: ['PD 3.0 PPS', 'Qi (15W)'],
    audioJack: false,
    displayOut: 'No DisplayPort Alt Mode',
    bluetoothVersion: '5.3',
    audioCodecs: ['LDAC', 'LHDC', 'aptX Adaptive', 'AAC'],
    releaseYear: 2023
  },
  {
    id: 'phone-xiaomi-14-ultra',
    name: 'Xiaomi 14 Ultra',
    brand: 'Xiaomi',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 2 (10Gbps)',
    fastChargeWattage: 90,
    chargingStandards: ['HyperCharge (90W)', 'Wireless (80W)', 'PD 3.0 (65W)'],
    audioJack: false,
    displayOut: 'DisplayPort 1.4',
    bluetoothVersion: '5.4',
    audioCodecs: ['LDAC', 'LHDC 5.0', 'aptX HD', 'aptX Lossless', 'AAC'],
    releaseYear: 2024
  },
  {
    id: 'phone-redmi-note-13-pro',
    name: 'Xiaomi Redmi Note 13 Pro+ 5G',
    brand: 'Xiaomi',
    portType: 'USB-C',
    usbVersion: 'USB 2.0',
    fastChargeWattage: 120,
    chargingStandards: ['HyperCharge (120W)', 'PD (18W)'],
    audioJack: false,
    displayOut: 'No DisplayPort Alt Mode',
    bluetoothVersion: '5.3',
    audioCodecs: ['LDAC', 'AAC'],
    releaseYear: 2024
  },
  {
    id: 'phone-sony-xperia-1-vi',
    name: 'Sony Xperia 1 VI',
    brand: 'Sony',
    portType: 'USB-C',
    usbVersion: 'USB 3.2 Gen 2',
    fastChargeWattage: 30,
    chargingStandards: ['PD 3.0 PPS', 'Qi Wireless'],
    audioJack: true, // Has physical 3.5mm jack!
    displayOut: 'DisplayPort 4K 60Hz',
    bluetoothVersion: '5.4',
    audioCodecs: ['LDAC', 'aptX Adaptive', 'aptX Lossless', 'AAC', 'SBC'],
    releaseYear: 2024
  },
  {
    id: 'phone-motorola-edge-50-ultra',
    name: 'Motorola Edge 50 Ultra',
    brand: 'Motorola',
    portType: 'USB-C',
    usbVersion: 'USB 3.1 Gen 2',
    fastChargeWattage: 125,
    chargingStandards: ['TurboPower (125W)', 'Wireless (50W)', 'PD 3.0 (100W)'],
    audioJack: false,
    displayOut: 'Ready For (DisplayPort 1.4)',
    bluetoothVersion: '5.4',
    audioCodecs: ['LDAC', 'aptX HD', 'AAC'],
    releaseYear: 2024
  }
];

export const laptops = [
  {
    id: 'laptop-macbook-pro-16-m3',
    name: 'Apple MacBook Pro 16" (M3 Max / Pro)',
    brand: 'Apple',
    ports: {
      usbC: 3,
      thunderbolt: 3, // Thunderbolt 4
      usbA: 0,
      hdmi: 1, // HDMI 2.1 (supports 8K 60Hz or 4K 240Hz)
      hdmiVersion: '2.1',
      sdCardSlot: true,
      headphoneJack: true,
      magsafe: true
    },
    chargingWattage: 140,
    chargingMethod: 'MagSafe 3 / USB-PD 3.1 EPR (140W)',
    displaySupport: 'Up to 4 external displays (M3 Max) / 2 displays (M3 Pro)',
    bluetoothVersion: '5.3',
    releaseYear: 2023
  },
  {
    id: 'laptop-macbook-air-m2-m3',
    name: 'Apple MacBook Air 13" / 15" (M2 / M3)',
    brand: 'Apple',
    ports: {
      usbC: 2,
      thunderbolt: 2, // Thunderbolt 3 / USB4
      usbA: 0,
      hdmi: 0, // NO HDMI port!
      hdmiVersion: null,
      sdCardSlot: false,
      headphoneJack: true,
      magsafe: true
    },
    chargingWattage: 35,
    maxFastChargeWattage: 70,
    chargingMethod: 'MagSafe 3 / USB-PD 3.0',
    displaySupport: '1 external display (M2) / 2 external displays with lid closed (M3)',
    bluetoothVersion: '5.3',
    releaseYear: 2024
  },
  {
    id: 'laptop-macbook-pro-13-intel-2019',
    name: 'Apple MacBook Pro 13" (2018-2020 Intel, 2/4 TB3 Ports)',
    brand: 'Apple',
    ports: {
      usbC: 2,
      thunderbolt: 2,
      usbA: 0,
      hdmi: 0,
      hdmiVersion: null,
      sdCardSlot: false,
      headphoneJack: true,
      magsafe: false
    },
    chargingWattage: 61,
    chargingMethod: 'USB-C PD',
    displaySupport: 'Up to 1 external 5K or 2 external 4K displays',
    bluetoothVersion: '5.0',
    releaseYear: 2019
  },
  {
    id: 'laptop-dell-xps-13',
    name: 'Dell XPS 13 (9315 / 9320 Plus)',
    brand: 'Dell',
    ports: {
      usbC: 2, // 2x Thunderbolt 4 (Type-C)
      thunderbolt: 2,
      usbA: 0,
      hdmi: 0,
      hdmiVersion: null,
      sdCardSlot: false,
      headphoneJack: false,
      magsafe: false
    },
    chargingWattage: 60,
    chargingMethod: 'Type-C USB-PD 60W',
    displaySupport: 'DisplayPort 1.4 over Type-C',
    bluetoothVersion: '5.3',
    releaseYear: 2023
  },
  {
    id: 'laptop-dell-xps-15-9530',
    name: 'Dell XPS 15 (9530 / OLED)',
    brand: 'Dell',
    ports: {
      usbC: 3, // 2x Thunderbolt 4 + 1x USB 3.2 Gen 2 Type-C
      thunderbolt: 2,
      usbA: 0, // NO USB-A port! Comes with dongle or requires hub
      hdmi: 0, // NO HDMI port!
      hdmiVersion: null,
      sdCardSlot: true,
      headphoneJack: true,
      magsafe: false
    },
    chargingWattage: 130,
    chargingMethod: 'Dell Type-C 130W / USB-PD (max 100W 3rd party)',
    displaySupport: 'DisplayPort 1.4 over Type-C',
    bluetoothVersion: '5.2',
    releaseYear: 2023
  },
  {
    id: 'laptop-asus-rog-zephyrus-g16',
    name: 'ASUS ROG Zephyrus G16 (2024)',
    brand: 'ASUS',
    ports: {
      usbC: 2, // 1x Thunderbolt 4 / USB4 + 1x USB 3.2 Gen 2 Type-C
      thunderbolt: 1,
      usbA: 2, // 2x USB 3.2 Gen 2 Type-A
      hdmi: 1, // HDMI 2.1 FRL
      hdmiVersion: '2.1',
      sdCardSlot: true,
      headphoneJack: true,
      magsafe: false
    },
    chargingWattage: 240,
    chargingMethod: 'Proprietary barrel/slim plug 240W, Type-C 100W PD (limited performance)',
    displaySupport: 'G-Sync, HDMI 2.1, DP 1.4',
    bluetoothVersion: '5.3',
    releaseYear: 2024
  },
  {
    id: 'laptop-lenovo-thinkpad-x1-carbon-gen12',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    brand: 'Lenovo',
    ports: {
      usbC: 2, // 2x Thunderbolt 4
      thunderbolt: 2,
      usbA: 2, // 2x USB 3.2 Gen 1 Type-A
      hdmi: 1, // HDMI 2.1 (supports up to 4K@60Hz)
      hdmiVersion: '2.0b/2.1 TMDS',
      sdCardSlot: false,
      headphoneJack: true,
      magsafe: false
    },
    chargingWattage: 65,
    chargingMethod: 'USB-C PD 3.0 (65W)',
    displaySupport: 'Thunderbolt 4 + HDMI',
    bluetoothVersion: '5.3',
    releaseYear: 2024
  },
  {
    id: 'laptop-hp-spectre-x360-14',
    name: 'HP Spectre x360 2-in-1 14"',
    brand: 'HP',
    ports: {
      usbC: 2, // 2x Thunderbolt 4
      thunderbolt: 2,
      usbA: 1, // 1x drop-jaw USB 3.2 Gen 2 Type-A
      hdmi: 0, // NO HDMI
      hdmiVersion: null,
      sdCardSlot: false,
      headphoneJack: true,
      magsafe: false
    },
    chargingWattage: 65,
    chargingMethod: 'USB-C PD (65W)',
    displaySupport: 'DisplayPort 2.1 via Thunderbolt 4',
    bluetoothVersion: '5.4',
    releaseYear: 2024
  },
  {
    id: 'laptop-acer-predator-helios-16',
    name: 'Acer Predator Helios 16',
    brand: 'Acer',
    ports: {
      usbC: 2, // 2x Thunderbolt 4
      thunderbolt: 2,
      usbA: 3, // 3x USB 3.2 Gen 2
      hdmi: 1, // HDMI 2.1
      hdmiVersion: '2.1',
      sdCardSlot: true,
      headphoneJack: true,
      magsafe: false
    },
    chargingWattage: 330,
    chargingMethod: 'High-power barrel plug, USB-C PD emergency (65-100W)',
    displaySupport: 'G-SYNC, HDMI 2.1 4K@120Hz',
    bluetoothVersion: '5.3',
    releaseYear: 2023
  },
  {
    id: 'laptop-microsoft-surface-laptop-7',
    name: 'Microsoft Surface Laptop 7 (Snapdragon X Elite)',
    brand: 'Microsoft',
    ports: {
      usbC: 2, // 2x USB4 / USB 3.2 Gen 2
      thunderbolt: 0,
      usbA: 1, // 1x USB 3.1 Gen 1 Type-A
      hdmi: 0, // NO HDMI
      hdmiVersion: null,
      sdCardSlot: false,
      headphoneJack: true,
      magsafe: false
    },
    chargingWattage: 65,
    chargingMethod: 'Surface Connect or USB-C PD (65W)',
    displaySupport: 'Supports up to three 4K monitors',
    bluetoothVersion: '5.4',
    releaseYear: 2024
  }
];

export const tvs = [
  {
    id: 'tv-sony-bravia-xr-a80l',
    name: 'Sony BRAVIA XR A80L 65" OLED 4K',
    brand: 'Sony',
    displayTech: 'OLED',
    resolution: '4K (3840 x 2160)',
    refreshRate: 120,
    hdmiPorts: [
      { portNumber: 1, version: '2.0', features: ['4K@60Hz', 'ARC'] },
      { portNumber: 2, version: '2.0', features: ['4K@60Hz'] },
      { portNumber: 3, version: '2.1', features: ['4K@120Hz', 'eARC', 'VRR', 'ALLM'] },
      { portNumber: 4, version: '2.1', features: ['4K@120Hz', 'VRR', 'ALLM'] }
    ],
    maxHdmiVersion: '2.1',
    usbPorts: 2,
    opticalAudio: true,
    bluetoothVersion: '5.2',
    eArcSupported: true,
    releaseYear: 2023
  },
  {
    id: 'tv-lg-c3-oled-55',
    name: 'LG C3 55" 4K Smart OLED evo TV',
    brand: 'LG',
    displayTech: 'OLED evo',
    resolution: '4K (3840 x 2160)',
    refreshRate: 120,
    hdmiPorts: [
      { portNumber: 1, version: '2.1', features: ['4K@120Hz', 'VRR', 'ALLM', 'G-Sync', 'FreeSync'] },
      { portNumber: 2, version: '2.1', features: ['4K@120Hz', 'eARC', 'VRR', 'ALLM'] },
      { portNumber: 3, version: '2.1', features: ['4K@120Hz', 'VRR', 'ALLM'] },
      { portNumber: 4, version: '2.1', features: ['4K@120Hz', 'VRR', 'ALLM'] }
    ],
    maxHdmiVersion: '2.1',
    usbPorts: 3,
    opticalAudio: true,
    bluetoothVersion: '5.0',
    eArcSupported: true,
    releaseYear: 2023
  },
  {
    id: 'tv-samsung-neo-qled-qn90c',
    name: 'Samsung Neo QLED 65" QN90C 4K',
    brand: 'Samsung',
    displayTech: 'Neo QLED (Mini-LED)',
    resolution: '4K (3840 x 2160)',
    refreshRate: 144,
    hdmiPorts: [
      { portNumber: 1, version: '2.1', features: ['4K@144Hz', 'VRR', 'ALLM'] },
      { portNumber: 2, version: '2.1', features: ['4K@144Hz', 'VRR', 'ALLM'] },
      { portNumber: 3, version: '2.1', features: ['4K@144Hz', 'eARC', 'VRR', 'ALLM'] },
      { portNumber: 4, version: '2.1', features: ['4K@144Hz', 'VRR', 'ALLM'] }
    ],
    maxHdmiVersion: '2.1',
    usbPorts: 2,
    opticalAudio: true,
    bluetoothVersion: '5.2',
    eArcSupported: true,
    releaseYear: 2023
  },
  {
    id: 'tv-oneplus-q2-pro-65',
    name: 'OnePlus TV 65 Q2 Pro 4K QLED',
    brand: 'OnePlus',
    displayTech: 'QLED',
    resolution: '4K (3840 x 2160)',
    refreshRate: 120,
    hdmiPorts: [
      { portNumber: 1, version: '2.0', features: ['4K@60Hz'] },
      { portNumber: 2, version: '2.1', features: ['4K@120Hz', 'eARC', 'VRR', 'ALLM'] },
      { portNumber: 3, version: '2.1', features: ['4K@120Hz', 'VRR', 'ALLM'] }
    ],
    maxHdmiVersion: '2.1',
    usbPorts: 2,
    opticalAudio: true,
    bluetoothVersion: '5.0',
    eArcSupported: true,
    releaseYear: 2023
  },
  {
    id: 'tv-xiaomi-smart-tv-x55',
    name: 'Xiaomi Smart TV X 55" 4K HDR',
    brand: 'Xiaomi',
    displayTech: 'LED',
    resolution: '4K (3840 x 2160)',
    refreshRate: 60, // 60Hz only!
    hdmiPorts: [
      { portNumber: 1, version: '2.0', features: ['4K@60Hz', 'eARC'] },
      { portNumber: 2, version: '2.0', features: ['4K@60Hz', 'ALLM'] },
      { portNumber: 3, version: '2.0', features: ['4K@60Hz'] }
    ],
    maxHdmiVersion: '2.0',
    usbPorts: 2,
    opticalAudio: true,
    bluetoothVersion: '5.0',
    eArcSupported: true,
    releaseYear: 2024
  },
  {
    id: 'tv-tcl-c745-gaming-55',
    name: 'TCL 55" C745 QLED Gaming TV',
    brand: 'TCL',
    displayTech: 'QLED',
    resolution: '4K (3840 x 2160)',
    refreshRate: 144,
    hdmiPorts: [
      { portNumber: 1, version: '2.1', features: ['4K@144Hz', 'VRR', 'AMD FreeSync Premium Pro'] },
      { portNumber: 2, version: '2.1', features: ['4K@120Hz', 'VRR'] },
      { portNumber: 3, version: '2.0', features: ['4K@60Hz'] },
      { portNumber: 4, version: '2.0', features: ['4K@60Hz', 'eARC'] }
    ],
    maxHdmiVersion: '2.1',
    usbPorts: 1,
    opticalAudio: true,
    bluetoothVersion: '5.0',
    eArcSupported: true,
    releaseYear: 2023
  },
  {
    id: 'tv-hisense-u7k-55',
    name: 'Hisense 55" U7K ULED Mini-LED 4K',
    brand: 'Hisense',
    displayTech: 'Mini-LED ULED',
    resolution: '4K (3840 x 2160)',
    refreshRate: 144,
    hdmiPorts: [
      { portNumber: 1, version: '2.0', features: ['4K@60Hz'] },
      { portNumber: 2, version: '2.0', features: ['4K@60Hz'] },
      { portNumber: 3, version: '2.1', features: ['4K@144Hz', 'eARC', 'VRR'] },
      { portNumber: 4, version: '2.1', features: ['4K@144Hz', 'VRR'] }
    ],
    maxHdmiVersion: '2.1',
    usbPorts: 2,
    opticalAudio: true,
    bluetoothVersion: '5.1',
    eArcSupported: true,
    releaseYear: 2023
  }
];

export const allDevices = {
  phones,
  laptops,
  tvs
};
