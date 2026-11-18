import { phones, laptops, tvs, tablets } from '../data/devices.js';
import { products } from '../data/products.js';

// Default / fallback user hardware profile
export const DEFAULT_USER_SETUP = {
  phoneId: 'phone-samsung-a54',
  laptopId: 'laptop-macbook-pro-13-intel-2019',
  tvId: 'tv-sony-bravia-xr-a80l'
};

const STORAGE_KEY = 'voltkart_user_setup';

export class CompatibilityEngine {
  constructor() {
    this.userSetup = this.loadUserSetup();
    this.rules = this.initRules();
  }

  loadUserSetup() {
    // Check URL parameters first for shared setups
    try {
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlPhone = urlParams.get('phone');
        const urlLaptop = urlParams.get('laptop');
        const urlTv = urlParams.get('tv');

        if (urlPhone || urlLaptop || urlTv) {
          const setup = {
            phoneId: urlPhone || DEFAULT_USER_SETUP.phoneId,
            laptopId: urlLaptop || DEFAULT_USER_SETUP.laptopId,
            tvId: urlTv || DEFAULT_USER_SETUP.tvId
          };
          this.saveUserSetup(setup);
          return setup;
        }
      }

      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('Could not read user setup from storage:', e);
    }
    return { ...DEFAULT_USER_SETUP };
  }

  saveUserSetup(setup) {
    this.userSetup = { ...this.userSetup, ...setup };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.userSetup));
      }
    } catch (e) {
      console.warn('Could not save user setup to storage:', e);
    }
    // Trigger global event so cards update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('setupChanged', { detail: this.userSetup }));
    }
  }

  getUserDevices() {
    let phone = null;
    if (this.userSetup.customDevices?.phone) {
      phone = this.userSetup.customDevices.phone;
    } else if (this.userSetup.phoneId) {
      phone = phones.find(p => p.id === this.userSetup.phoneId) || null;
    }

    let laptop = null;
    if (this.userSetup.customDevices?.laptop) {
      laptop = this.userSetup.customDevices.laptop;
    } else if (this.userSetup.laptopId) {
      laptop = laptops.find(l => l.id === this.userSetup.laptopId) || null;
    }

    let tv = null;
    if (this.userSetup.customDevices?.tv) {
      tv = this.userSetup.customDevices.tv;
    } else if (this.userSetup.tvId) {
      tv = tvs.find(t => t.id === this.userSetup.tvId) || null;
    }

    let tablet = null;
    if (this.userSetup.customDevices?.tablet) {
      tablet = this.userSetup.customDevices.tablet;
    } else if (this.userSetup.tabletId) {
      tablet = tablets.find(t => t.id === this.userSetup.tabletId) || null;
    }

    const audio = this.userSetup.customDevices?.audio || null;

    // Default fallback ONLY when no custom/analyzed setup exists and no IDs are set
    if (!phone && !laptop && !tv && !tablet && !audio && !this.userSetup.isAnalyzedSetup) {
      phone = phones.find(p => p.id === DEFAULT_USER_SETUP.phoneId) || phones[0];
      laptop = laptops.find(l => l.id === DEFAULT_USER_SETUP.laptopId) || laptops[0];
      tv = tvs.find(t => t.id === DEFAULT_USER_SETUP.tvId) || tvs[0];
    }

    return { phone, laptop, tv, tablet, audio };
  }

  /**
   * Evaluates product compatibility with user's saved hardware
   * Returns: { status: 'compatible'|'works_with_limits'|'needs_adapter', score: 0-100, reason: string, recommendedProductId: string|null }
   */
  evaluate(product) {
    const devices = this.getUserDevices();
    let bestResult = {
      status: 'compatible',
      score: 100,
      reason: '100% Compatible with your registered device hardware.',
      recommendedProductId: null
    };

    // Run through rules in order of priority
    for (const rule of this.rules) {
      const res = rule(product, devices);
      if (res) {
        // Needs adapter takes highest priority, followed by the most restrictive limits (lowest score)
        if (res.status === 'needs_adapter') {
          return res;
        } else if (res.status === 'works_with_limits') {
          if (bestResult.status !== 'works_with_limits' || (res.score && res.score < (bestResult.score || 100))) {
            bestResult = res;
          }
        }
      }
    }

    return bestResult;
  }

  initRules() {
    return [
      // RULE 1: Laptop missing HDMI port trying to connect video/hub/cable
      (prod, { laptop }) => {
        if (!laptop || !laptop.ports) return null;
        if (prod.solvesProblem === 'laptop_missing_hdmi_or_usb_a') {
          if (laptop.ports.hdmi === 0) {
            return {
              status: 'compatible',
              score: 100,
              reason: `Direct solution! Adds HDMI & ports to your ${laptop.name} which only has USB-C.`,
              recommendedProductId: null
            };
          }
        }

        // Product is a TV or HDMI display item and laptop has 0 HDMI ports
        if (prod.category === 'TVs' && laptop.ports.hdmi === 0) {
          return {
            status: 'needs_adapter',
            score: 40,
            reason: `Your ${laptop.name} has only USB-C/Thunderbolt and NO built-in HDMI port. Requires a USB-C to HDMI adapter or hub.`,
            recommendedProductId: 'prod-acc-1' // VoltKart HyperDrive Hub
          };
        }
        return null;
      },

      // RULE 2: Charger wattage below Phone fast-charge capability
      (prod, { phone }) => {
        if (!phone) return null;
        if (prod.category === 'Accessories' && prod.specs?.wattage) {
          const chargerW = prod.specs.wattage;
          const phoneW = phone.fastChargeWattage || 25;

          if (chargerW < phoneW) {
            return {
              status: 'works_with_limits',
              score: 70,
              reason: `Works safely, but won't reach your phone's peak ${phoneW}W speed (this charger outputs ${chargerW}W max).`,
              recommendedProductId: phoneW >= 45 ? 'prod-acc-8' : 'prod-acc-7'
            };
          }
          if (chargerW >= phoneW && prod.compatibleTargetTypes?.includes('phone')) {
            return {
              status: 'compatible',
              score: 100,
              reason: `Delivers full ${phoneW}W high-speed charging to your ${phone.name}.`,
              recommendedProductId: null
            };
          }
        }
        return null;
      },

      // RULE 3: Phone needs 25W PPS Charger (e.g. Galaxy A54, S23)
      (prod, { phone }) => {
        if (!phone) return null;
        if (phone.id === 'phone-samsung-a54' && prod.id === 'prod-acc-7') {
          return {
            status: 'compatible',
            score: 100,
            reason: `Perfect 25W PPS match engineered specifically for the Galaxy A54 5G fast-charge curve.`,
            recommendedProductId: null
          };
        }
        return null;
      },

      // RULE 4: Laptop Charger wattage deficit (Laptop requires 100W+ PD, charger is <65W)
      (prod, { laptop }) => {
        if (!laptop) return null;
        if (prod.category === 'Accessories' && prod.specs?.wattage) {
          const chargerW = prod.specs.wattage;
          const laptopW = laptop.chargingWattage || 65;

          if (laptopW > 100 && chargerW <= 65) {
            return {
              status: 'works_with_limits',
              score: 60,
              reason: `Your ${laptop.name} requires ${laptopW}W under workload. This ${chargerW}W plug will only slow-charge or trickle charge.`,
              recommendedProductId: 'prod-acc-3' // 100W Pro GaN
            };
          }
        }
        return null;
      },

      // RULE 5: 4K 120Hz/144Hz TV with HDMI 2.0 limitation
      (prod, { tv }) => {
        if (!tv) return null;
        if (prod.category === 'TVs') {
          const isHighRefresh = prod.specs?.refreshRate >= 120;
          if (isHighRefresh && tv.maxHdmiVersion === '2.0') {
            return {
              status: 'works_with_limits',
              score: 75,
              reason: `This TV panel supports 120Hz/144Hz, but existing HDMI 2.0 source devices are capped at 4K @ 60Hz.`,
              recommendedProductId: 'prod-acc-4' // 48Gbps 8K cable
            };
          }
          if (isHighRefresh && tv.maxHdmiVersion === '2.1') {
            return {
              status: 'compatible',
              score: 100,
              reason: `Full 4K@120Hz / 144Hz VRR & eARC verified across HDMI 2.1 architecture.`,
              recommendedProductId: null
            };
          }
        }
        return null;
      },

      // RULE 6: 48Gbps HDMI Cable recommendation for 4K 120Hz TVs
      (prod, { tv }) => {
        if (!tv) return null;
        if (prod.id === 'prod-acc-4' && tv.maxHdmiVersion === '2.1') {
          return {
            status: 'compatible',
            score: 100,
            reason: `Unlocks certified 48Gbps bandwidth for your 4K 120Hz / eARC setup.`,
            recommendedProductId: null
          };
        }
        return null;
      },

      // RULE 7: Product needs higher Bluetooth version than host device supports (Audio / Peripherals)
      (prod, { phone, laptop }) => {
        if (prod.category !== 'Audio' && !(prod.category === 'Accessories' && prod.specs?.bluetoothVersion)) {
          return null;
        }

        const prodBtStr = prod.specs?.bluetoothVersion;
        if (!prodBtStr) return null;
        const prodBt = parseFloat(prodBtStr);
        if (isNaN(prodBt)) return null;

        const host = phone || laptop;
        if (host && host.bluetoothVersion) {
          const hostBt = parseFloat(host.bluetoothVersion);
          if (!isNaN(hostBt) && prodBt > hostBt) {
            const hostType = (phone && host === phone) ? 'phone' : (laptop && host === laptop ? 'laptop' : 'device');
            return {
              status: 'works_with_limits',
              score: 70,
              reason: `Your ${hostType} has Bluetooth ${host.bluetoothVersion}, so you will not get the latest features and range`,
              recommendedProductId: null
            };
          }
        }
        return null;
      },

      // RULE 8: Wired 3.5mm Headphone on Device without Audio Jack
      (prod, { phone, laptop }) => {
        const host = phone || laptop;
        if (!host) return null;
        const hasJack = host.audioJack !== undefined ? host.audioJack : (host.ports ? host.ports.headphoneJack : true);
        if (prod.category === 'Audio' && prod.specs?.wiredOnly && prod.specs?.has35mmJack && !hasJack) {
          return {
            status: 'needs_adapter',
            score: 55,
            reason: `Your ${host.name} lacks an analog 3.5mm headphone jack. Requires a USB-C Hi-Fi DAC for wired audio.`,
            recommendedProductId: 'prod-acc-5' // USB-C to 3.5mm DAC
          };
        }
        return null;
      },

      // RULE 9: USB-C DAC Dongle on phone or laptop without 3.5mm jack
      (prod, { phone, laptop }) => {
        const host = phone || laptop;
        if (!host) return null;
        const hasJack = host.audioJack !== undefined ? host.audioJack : (host.ports ? host.ports.headphoneJack : true);
        if (prod.id === 'prod-acc-5' && !hasJack) {
          return {
            status: 'compatible',
            score: 100,
            reason: `Restores 3.5mm audio jack with 32-bit Hi-Fi DAC for your ${host.name}.`,
            recommendedProductId: null
          };
        }
        return null;
      },

      // RULE 10: MagSafe Charger on Android or Non-Magnetic Phone
      (prod, { phone }) => {
        if (!phone) return null;
        if (prod.id === 'prod-acc-6') {
          if (phone.brand === 'Apple') {
            return {
              status: 'compatible',
              score: 100,
              reason: `Full magnetic Qi2 snap and 15W fast alignment with your ${phone.name}.`,
              recommendedProductId: null
            };
          } else {
            return {
              status: 'works_with_limits',
              score: 65,
              reason: `Charges via standard Qi wireless, but requires a magnetic ring case to magnetically snap into place.`,
              recommendedProductId: null
            };
          }
        }
        return null;
      },

      // RULE 11: High-End Lossless Codecs (LDAC/aptX) on Apple Source
      (prod, { phone }) => {
        if (!phone) return null;
        if (prod.category === 'Audio' && phone.brand === 'Apple') {
          const codecs = prod.specs?.audioCodecs || [];
          if (codecs.includes('LDAC') && !codecs.includes('ALAC')) {
            return {
              status: 'works_with_limits',
              score: 85,
              reason: `Audio connects smoothly over AAC, but Android-exclusive Sony LDAC lossless streaming is unsupported on iOS.`,
              recommendedProductId: null
            };
          }
        }
        return null;
      },

      // RULE 12: Apple AirPods Max on Android Phone
      (prod, { phone }) => {
        if (!phone) return null;
        if (prod.id === 'prod-aud-2' && phone.brand !== 'Apple') {
          return {
            status: 'works_with_limits',
            score: 75,
            reason: `Connects via standard Bluetooth AAC, but Personalized Spatial Audio and ecosystem auto-switching require Apple hardware.`,
            recommendedProductId: null
          };
        }
        return null;
      },

      // RULE 13: SuperVOOC / HyperCharge high-wattage Phone on standard PD
      (prod, { phone }) => {
        if (!phone) return null;
        if (phone.fastChargeWattage >= 100 && prod.category === 'Accessories' && prod.specs?.wattage && prod.specs.wattage < 100) {
          return {
            status: 'works_with_limits',
            score: 75,
            reason: `Charges safely over universal USB-PD, but requires proprietary high-amp adapter to trigger 100W+ peak charging.`,
            recommendedProductId: 'prod-acc-3'
          };
        }
        return null;
      },

      // RULE 14: USB-C only laptop with USB-A accessory
      (prod, { laptop }) => {
        if (!laptop || !laptop.ports) return null;
        if (laptop.ports.usbA === 0 && prod.specs?.upstreamConnector === 'USB-A') {
          return {
            status: 'needs_adapter',
            score: 50,
            reason: `Your ${laptop.name} has no USB-A ports. Requires a USB-C hub or OTG adapter.`,
            recommendedProductId: 'prod-acc-1'
          };
        }
        return null;
      },

      // RULE 15: Direct USB-C to HDMI cable match
      (prod, { laptop }) => {
        if (!laptop || !laptop.ports) return null;
        if (prod.id === 'prod-acc-9' && laptop.ports.hdmi === 0) {
          return {
            status: 'compatible',
            score: 100,
            reason: `Direct solution! Connects your USB-C only ${laptop.name} to any 4K TV or monitor.`,
            recommendedProductId: null
          };
        }
        return null;
      }
    ];
  }

  /**
   * Plain-English NLP Parser
   * Parses free-form text like:
   * "I have a phone with Bluetooth 4.2"
   * "I have a laptop with no headphone jack"
   * "I have a TV with HDMI 2.0"
   * "I have a Samsung A54"
   */
  parsePlainEnglish(text) {
    if (!text || typeof text !== 'string') return null;

    const lower = text.toLowerCase().replace(/[-_]/g, ' ');
    const hasSolutionIntent = /\b(?:suggest|recommend|recommendation|chargers?|cables?|solution|bundle|accessories)\b/i.test(lower);
    const detected = {
      phone: null,
      laptop: null,
      tv: null,
      tablet: null,
      audio: null,
      rawTokens: [],
      items: [],
      suggestions: [],
      openSolution: hasSolutionIntent
    };

    // 1. Spec extraction
    // Bluetooth: "bluetooth 4.2", "bt 5.0", "bluetooth v5.3"
    const btMatch = lower.match(/(?:bluetooth|bt)\s*(?:v(?:ersion)?)?\s*([0-9]+(?:\.[0-9]+)?)/i);
    const detectedBt = btMatch ? btMatch[1] : null;

    // HDMI: "hdmi 2.0", "hdmi 2.1", "hdmi 1.4"
    const hdmiMatch = lower.match(/hdmi\s*(?:v(?:ersion)?)?\s*(2\.1|2\.0|1\.4)/i);
    const detectedHdmi = hdmiMatch ? hdmiMatch[1] : null;

    // Wattage: "18w", "25w", "65w", "100w"
    const wattMatch = lower.match(/\b([0-9]{2,3})\s*w(?:att)?(?:s)?\b/i);
    const detectedWattage = wattMatch ? parseInt(wattMatch[1], 10) : null;

    // Audio Jack / Ports
    const hasNoJack = /\b(?:no|without|lacks?)\s*(?:analog\s*)?(?:3\.5\s*mm|headphone|audio)\s*(?:jack|port)?\b/i.test(lower);
    const hasJack = !hasNoJack && /\b(?:with|has)\s*(?:analog\s*)?(?:3\.5\s*mm|headphone|audio)\s*(?:jack|port)\b/i.test(lower);
    const hasOnlyUsbC = /\bonly\s*(?:usb\s*c|type\s*c)\b|\b(?:usb\s*c|type\s*c)\s*only\b|\bno\s*hdmi\b/i.test(lower);
    const hasThunderbolt = /\bthunderbolt\b/i.test(lower);
    const hasUsbA = /\busb\s*a\b/i.test(lower);

    // 2. Phone Detection
    let phoneSuggestions = [];
    const iphoneMatch = lower.match(/(?:apple\s*)?iphone\s*(16|15|14|13)/i);
    if (iphoneMatch) {
      const gen = iphoneMatch[1];
      const hasProMax = /\b(pro\s*max)\b/i.test(lower);
      const hasPro = !hasProMax && /\bpro\b/i.test(lower);
      const hasPlus = /\bplus\b/i.test(lower);
      const hasMini = /\bmini\b/i.test(lower);

      if (hasProMax) {
        detected.phone = phones.find(p => p.id === `phone-iphone-${gen}-pro-max`);
      } else if (hasPro) {
        detected.phone = phones.find(p => p.id === `phone-iphone-${gen}-pro`);
      } else if (hasPlus) {
        detected.phone = phones.find(p => p.id === `phone-iphone-${gen}-plus`);
      } else if (hasMini && gen === '13') {
        detected.phone = phones.find(p => p.id === `phone-iphone-13-mini`);
      } else {
        // Base model exact match (e.g. "iPhone 15" -> base iPhone 15)
        detected.phone = phones.find(p => p.id === `phone-iphone-${gen}`);

        // Provide 2 closest options as suggestions if base was typed without variant
        const proCandidate = phones.find(p => p.id === `phone-iphone-${gen}-pro`);
        if (detected.phone && proCandidate) {
          phoneSuggestions = [
            { id: detected.phone.id, label: detected.phone.name.replace('Apple ', ''), device: detected.phone },
            { id: proCandidate.id, label: proCandidate.name.replace('Apple ', ''), device: proCandidate }
          ];
        }
      }
    } else if (/(samsung\s*a\s*54|galaxy\s*a\s*54|a\s*54)/i.test(lower)) {
      detected.phone = phones.find(p => p.id === 'phone-samsung-a54');
    } else if (/(s\s*24\s*ultra|galaxy\s*s\s*24\s*ultra)/i.test(lower)) {
      detected.phone = phones.find(p => p.id === 'phone-s24-ultra');
    } else if (/(galaxy\s*s\s*24|s\s*24)/i.test(lower)) {
      detected.phone = phones.find(p => p.id === 'phone-s24-ultra');
    } else if (/(pixel\s*9|pixel\s*8)/i.test(lower)) {
      detected.phone = phones.find(p => p.id === 'phone-pixel-9-pro');
    } else if (/(oneplus\s*12)/i.test(lower)) {
      detected.phone = phones.find(p => p.id === 'phone-oneplus-12');
    } else if (/(nothing\s*phone)/i.test(lower)) {
      detected.phone = phones.find(p => p.id === 'phone-nothing-phone-2');
    } else if (/\b(?:a\s+)?(?:phone|mobile|smartphone|cellphone)\b/i.test(lower) || (detectedBt && !lower.includes('laptop') && !lower.includes('tv') && !lower.includes('headphone'))) {
      // Generic Phone!
      detected.phone = {
        id: 'phone-generic',
        name: 'Phone (generic)',
        brand: 'Generic',
        portType: 'USB-C',
        usbVersion: 'USB 2.0',
        fastChargeWattage: detectedWattage || 20,
        chargingStandards: ['PD 2.0'],
        audioJack: hasJack ? true : (hasNoJack ? false : false),
        displayOut: 'None',
        bluetoothVersion: detectedBt || '5.0',
        audioCodecs: ['AAC', 'SBC'],
        releaseYear: 2023,
        isGeneric: true
      };
    }

    // Attach specs to phone if detected
    if (detected.phone) {
      if (detectedBt) detected.phone.bluetoothVersion = detectedBt;
      if (detectedWattage) detected.phone.fastChargeWattage = detectedWattage;
      if (hasNoJack) detected.phone.audioJack = false;
      if (hasJack) detected.phone.audioJack = true;
    }

    detected.suggestions = phoneSuggestions;

    // 3. Laptop Detection
    // Strict requirement: Only choose a specific laptop model when the user explicitly types
    // a brand or model name (e.g. "MacBook", "Dell XPS", "HP Pavilion", "ThinkPad", "ASUS ROG", etc.)
    // Never auto-select a brand the user didn't type!
    let laptopSuggestions = [];

    const hasAppleLaptop = /\b(?:apple\s*)?(macbook|mac\s*book)\b/i.test(lower);
    const hasDell = /\b(?:dell\s*xps|dell|xps)\b/i.test(lower);
    const hasAsusRog = /\b(asus|rog|zephyrus)\b/i.test(lower);
    const hasLenovoThinkpad = /\b(lenovo|thinkpad|think\s*pad)\b/i.test(lower);
    const hasHp = /\b(hp|spectre|pavilion)\b/i.test(lower);
    const hasAcer = /\b(acer|predator|helios)\b/i.test(lower);
    const hasSurface = /\b(surface|microsoft\s*surface)\b/i.test(lower);

    if (hasAppleLaptop) {
      if (/\b(?:pro\s*16|16\s*inch|16"|m3)\b/i.test(lower)) {
        detected.laptop = laptops.find(l => l.id === 'laptop-macbook-pro-16-m3');
        laptopSuggestions = [
          { id: 'laptop-macbook-pro-16-m3', label: 'MacBook Pro 16"' },
          { id: 'laptop-macbook-pro-13-intel-2019', label: 'MacBook Pro 13"' }
        ];
      } else if (/\bair\b/i.test(lower)) {
        detected.laptop = laptops.find(l => l.id === 'laptop-macbook-air-m2-m3');
        laptopSuggestions = [
          { id: 'laptop-macbook-air-m2-m3', label: 'MacBook Air 13"' },
          { id: 'laptop-macbook-pro-13-intel-2019', label: 'MacBook Pro 13"' }
        ];
      } else if (/\b(?:13|13\s*inch|13"|intel|2019|2020)\b/i.test(lower)) {
        detected.laptop = laptops.find(l => l.id === 'laptop-macbook-pro-13-intel-2019');
        laptopSuggestions = [
          { id: 'laptop-macbook-pro-13-intel-2019', label: 'MacBook Pro 13"' },
          { id: 'laptop-macbook-pro-16-m3', label: 'MacBook Pro 16"' }
        ];
      } else {
        // Generic MacBook mention without model size
        detected.laptop = laptops.find(l => l.id === 'laptop-macbook-pro-13-intel-2019');
        laptopSuggestions = [
          { id: 'laptop-macbook-pro-13-intel-2019', label: 'MacBook Pro 13"' },
          { id: 'laptop-macbook-pro-16-m3', label: 'MacBook Pro 16"' }
        ];
      }
    } else if (hasDell) {
      if (/\b(?:13|13\s*inch|13"|plus)\b/i.test(lower)) {
        detected.laptop = laptops.find(l => l.id === 'laptop-dell-xps-13');
        laptopSuggestions = [
          { id: 'laptop-dell-xps-13', label: 'Dell XPS 13' },
          { id: 'laptop-dell-xps-15-9530', label: 'Dell XPS 15' }
        ];
      } else if (/\b(?:15|15\s*inch|15")\b/i.test(lower)) {
        detected.laptop = laptops.find(l => l.id === 'laptop-dell-xps-15-9530');
        laptopSuggestions = [
          { id: 'laptop-dell-xps-15-9530', label: 'Dell XPS 15' },
          { id: 'laptop-dell-xps-13', label: 'Dell XPS 13' }
        ];
      } else {
        detected.laptop = laptops.find(l => l.id === 'laptop-dell-xps-13');
        laptopSuggestions = [
          { id: 'laptop-dell-xps-13', label: 'Dell XPS 13' },
          { id: 'laptop-dell-xps-15-9530', label: 'Dell XPS 15' }
        ];
      }
    } else if (hasAsusRog) {
      detected.laptop = laptops.find(l => l.id === 'laptop-asus-rog-zephyrus-g16');
    } else if (hasLenovoThinkpad) {
      detected.laptop = laptops.find(l => l.id === 'laptop-lenovo-thinkpad-x1-carbon-gen12');
    } else if (hasHp) {
      detected.laptop = laptops.find(l => l.id === 'laptop-hp-spectre-x360-14');
    } else if (hasAcer) {
      detected.laptop = laptops.find(l => l.id === 'laptop-acer-predator-helios-16');
    } else if (hasSurface) {
      detected.laptop = laptops.find(l => l.id === 'laptop-microsoft-surface-laptop-7');
    } else if (/\b(?:a\s+)?(?:laptop|notebook|computer|pc)\b/i.test(lower) || (hasOnlyUsbC && !detected.phone && !detected.tv)) {
      // User did NOT type any brand! Create a generic chip such as "Laptop (2019, USB-C only)" with the ports described.
      const yearMatch = lower.match(/\b(201[0-9]|202[0-9])\b/);
      const detectedYear = yearMatch ? yearMatch[1] : null;

      let portDesc = '';
      if (hasOnlyUsbC) {
        portDesc = 'USB-C only';
      } else if (hasNoJack) {
        portDesc = 'no headphone jack';
      } else if (hasThunderbolt) {
        portDesc = 'Thunderbolt';
      } else if (hasUsbA && !hasOnlyUsbC) {
        portDesc = 'USB-A & HDMI';
      } else if (detectedHdmi) {
        portDesc = `HDMI ${detectedHdmi}`;
      }

      const descParts = [];
      if (detectedYear) descParts.push(detectedYear);
      if (portDesc) descParts.push(portDesc);

      const genericLaptopName = descParts.length > 0
        ? `Laptop (${descParts.join(', ')})`
        : 'Laptop (generic)';

      detected.laptop = {
        id: 'laptop-generic',
        name: genericLaptopName,
        brand: 'Generic',
        ports: {
          usbC: (hasOnlyUsbC || hasThunderbolt) ? 2 : 2,
          thunderbolt: hasThunderbolt ? 2 : 0,
          usbA: hasOnlyUsbC ? 0 : 2,
          hdmi: hasOnlyUsbC ? 0 : 1,
          hdmiVersion: detectedHdmi || (hasOnlyUsbC ? null : '2.0'),
          sdCardSlot: false,
          headphoneJack: hasNoJack ? false : true
        },
        chargingWattage: detectedWattage || 65,
        bluetoothVersion: detectedBt || '5.0',
        releaseYear: detectedYear ? parseInt(detectedYear, 10) : 2022,
        isGeneric: true
      };
      // Keep suggestions empty for generic laptops - NEVER auto-select a brand the user didn't type!
      laptopSuggestions = [];
    }

    if (laptopSuggestions.length > 0 && phoneSuggestions.length === 0) {
      detected.suggestions = laptopSuggestions;
    }

    // Attach specs to laptop if detected
    if (detected.laptop) {
      if (detectedBt) detected.laptop.bluetoothVersion = detectedBt;
      if (detectedWattage) detected.laptop.chargingWattage = detectedWattage;
      if (hasNoJack && detected.laptop.ports) detected.laptop.ports.headphoneJack = false;
      if (hasJack && detected.laptop.ports) detected.laptop.ports.headphoneJack = true;
      if (hasOnlyUsbC && detected.laptop.ports) {
        detected.laptop.ports.hdmi = 0;
        detected.laptop.ports.usbA = 0;
        detected.laptop.ports.hdmiVersion = null;
      }
    }

    // 4. TV Detection
    if (/(sony|bravia|a80l)/i.test(lower)) {
      detected.tv = tvs.find(t => t.id === 'tv-sony-bravia-xr-a80l');
    } else if (/(lg\s*c3|lg\s*oled)/i.test(lower)) {
      detected.tv = tvs.find(t => t.id === 'tv-lg-c3-oled-55');
    } else if (/(samsung\s*tv|neo\s*qled|qn90c)/i.test(lower)) {
      detected.tv = tvs.find(t => t.id === 'tv-samsung-neo-qled-qn90c');
    } else if (/(oneplus\s*tv)/i.test(lower)) {
      detected.tv = tvs.find(t => t.id === 'tv-oneplus-q2-pro-65');
    } else if (/(xiaomi\s*tv)/i.test(lower)) {
      detected.tv = tvs.find(t => t.id === 'tv-xiaomi-smart-tv-x55');
    } else if (/\b(?:a\s+)?(?:tv|television|smart\s*tv)\b/i.test(lower) || (detectedHdmi && !detected.laptop && !detected.phone)) {
      // Generic TV!
      detected.tv = {
        id: 'tv-generic',
        name: 'TV (generic)',
        brand: 'Generic',
        maxHdmiVersion: detectedHdmi || '2.0',
        refreshRate: 60,
        bluetoothVersion: detectedBt || '5.0',
        eArcSupported: true,
        releaseYear: 2022,
        isGeneric: true
      };
    }

    // Attach specs to TV if detected
    if (detected.tv) {
      if (detectedHdmi) detected.tv.maxHdmiVersion = detectedHdmi;
      if (detectedBt) detected.tv.bluetoothVersion = detectedBt;
    }

    // 5. Tablet Detection
    let tabletSuggestions = [];
    if (/\b(?:apple\s*)?ipad\b/i.test(lower)) {
      if (/\b(?:pro\s*13|pro\s*m4|pro)\b/i.test(lower)) {
        detected.tablet = tablets.find(t => t.id === 'tablet-apple-ipad-pro-m4') || tablets[2];
        tabletSuggestions = [
          { id: 'tablet-apple-ipad-pro-m4', label: 'iPad Pro 13" (M4)' },
          { id: 'tablet-apple-ipad-air-m2', label: 'iPad Air 11" (M2)' }
        ];
      } else if (/\bair\b/i.test(lower)) {
        detected.tablet = tablets.find(t => t.id === 'tablet-apple-ipad-air-m2') || tablets[1];
        tabletSuggestions = [
          { id: 'tablet-apple-ipad-air-m2', label: 'iPad Air 11" (M2)' },
          { id: 'tablet-apple-ipad-10', label: 'iPad (10th Gen)' }
        ];
      } else if (/\bmini\b/i.test(lower)) {
        detected.tablet = tablets.find(t => t.id === 'tablet-apple-ipad-mini-6') || tablets[3];
      } else {
        // Base iPad (10th Gen)
        detected.tablet = tablets.find(t => t.id === 'tablet-apple-ipad-10') || tablets[0];
        tabletSuggestions = [
          { id: 'tablet-apple-ipad-10', label: 'iPad (10th Gen)' },
          { id: 'tablet-apple-ipad-air-m2', label: 'iPad Air 11" (M2)' }
        ];
      }
    } else if (/(galaxy\s*tab\s*s\s*9|tab\s*s\s*9)/i.test(lower)) {
      detected.tablet = tablets.find(t => t.id === 'tablet-samsung-galaxy-tab-s9') || tablets[4];
    } else if (/(galaxy\s*tab\s*a\s*9|tab\s*a\s*9)/i.test(lower)) {
      detected.tablet = tablets.find(t => t.id === 'tablet-samsung-galaxy-tab-a9') || tablets[5];
    } else if (/(galaxy\s*tab|samsung\s*tab)/i.test(lower)) {
      detected.tablet = tablets.find(t => t.id === 'tablet-samsung-galaxy-tab-s9') || tablets[4];
      tabletSuggestions = [
        { id: 'tablet-samsung-galaxy-tab-s9', label: 'Galaxy Tab S9' },
        { id: 'tablet-samsung-galaxy-tab-a9', label: 'Galaxy Tab A9' }
      ];
    } else if (/\b(?:a\s+)?(?:tablets?|pad)\b/i.test(lower)) {
      // Generic Tablet!
      detected.tablet = {
        id: 'tablet-generic',
        name: 'Tablet (generic)',
        brand: 'Generic',
        portType: 'USB-C',
        fastChargeWattage: detectedWattage || 25,
        chargingStandards: ['PD 3.0'],
        audioJack: hasJack ? true : (hasNoJack ? false : false),
        bluetoothVersion: detectedBt || '5.3',
        releaseYear: 2023,
        isGeneric: true
      };
    }

    if (detected.tablet) {
      if (detectedWattage) detected.tablet.fastChargeWattage = detectedWattage;
      if (detectedBt) detected.tablet.bluetoothVersion = detectedBt;
      if (hasNoJack) detected.tablet.audioJack = false;
      if (hasJack) detected.tablet.audioJack = true;
    }

    if (tabletSuggestions.length > 0 && (!detected.suggestions || detected.suggestions.length === 0)) {
      detected.suggestions = tabletSuggestions;
    }

    // 6. Generic Audio / Headphones Detection
    if (/\b(?:a\s+)?(?:headphones?|earphones?|earbuds?|headset|audio)\b/i.test(lower) && !detected.phone && !detected.laptop && !detected.tv && !detected.tablet) {
      detected.audio = {
        id: 'audio-generic',
        name: 'Headphones (generic)',
        brand: 'Generic',
        bluetoothVersion: detectedBt || '5.0',
        has35mmJack: hasNoJack ? false : true,
        isGeneric: true
      };
    }

    // Build structured items for interactive UI chips with edit / remove actions
    detected.items = [];

    if (detected.phone) {
      detected.items.push({
        type: 'phone',
        id: detected.phone.id,
        label: detected.phone.isGeneric ? 'Phone (generic)' : `Phone: ${detected.phone.name.replace('Apple ', '')}`
      });
    }
    if (detected.laptop) {
      detected.items.push({
        type: 'laptop',
        id: detected.laptop.id,
        label: detected.laptop.isGeneric ? detected.laptop.name : `Laptop: ${detected.laptop.name.replace('Apple ', '')}`
      });
    }
    if (detected.tablet) {
      detected.items.push({
        type: 'tablet',
        id: detected.tablet.id,
        label: detected.tablet.isGeneric ? 'Tablet (generic)' : `Tablet: ${detected.tablet.name.replace('Apple ', '')}`
      });
    }
    if (detected.tv) {
      detected.items.push({
        type: 'tv',
        id: detected.tv.id,
        label: detected.tv.isGeneric ? detected.tv.name : `TV: ${detected.tv.name}`
      });
    }
    if (detected.audio) {
      detected.items.push({
        type: 'audio',
        id: detected.audio.id,
        label: detected.audio.name
      });
    }

    // Spec chips (only add separate chip if not already included in device name)
    if (detectedBt && (!detected.phone || detected.phone.isGeneric)) {
      detected.items.push({
        type: 'spec-bt',
        id: `spec-bt-${detectedBt}`,
        label: `Bluetooth ${detectedBt}`
      });
    }
    if (detectedHdmi && (!detected.tv || !detected.tv.name.includes(`HDMI ${detectedHdmi}`))) {
      detected.items.push({
        type: 'spec-hdmi',
        id: `spec-hdmi-${detectedHdmi}`,
        label: `HDMI ${detectedHdmi}`
      });
    }
    if (hasNoJack && (!detected.laptop || !detected.laptop.name.includes('no headphone jack'))) {
      detected.items.push({
        type: 'spec-port',
        id: 'spec-no-jack',
        label: 'No headphone jack'
      });
    }
    if (detectedWattage) {
      detected.items.push({
        type: 'spec-wattage',
        id: `spec-watt-${detectedWattage}`,
        label: `${detectedWattage}W Fast Charge`
      });
    }
    if (hasOnlyUsbC && (!detected.laptop || !detected.laptop.name.includes('USB-C only'))) {
      detected.items.push({
        type: 'spec-port',
        id: 'spec-only-usbc',
        label: 'USB-C only (No HDMI)'
      });
    }

    return detected;
  }

  /**
   * Cart-level compatibility audit
   * Returns: { compatibleCount, limitsCount, needsAdapterCount, adapterSuggestions: [] }
   */
  auditCart(cartItems) {
    let compatibleCount = 0;
    let limitsCount = 0;
    let needsAdapterCount = 0;
    const adapterSuggestions = [];

    cartItems.forEach(item => {
      const result = this.evaluate(item);
      if (result.status === 'compatible') {
        compatibleCount++;
      } else if (result.status === 'works_with_limits') {
        limitsCount++;
        if (result.recommendedProductId && !cartItems.some(i => i.id === result.recommendedProductId)) {
          const recProd = products.find(p => p.id === result.recommendedProductId);
          if (recProd && !adapterSuggestions.some(s => s.id === recProd.id)) {
            adapterSuggestions.push(recProd);
          }
        }
      } else if (result.status === 'needs_adapter') {
        needsAdapterCount++;
        if (result.recommendedProductId && !cartItems.some(i => i.id === result.recommendedProductId)) {
          const recProd = products.find(p => p.id === result.recommendedProductId);
          if (recProd && !adapterSuggestions.some(s => s.id === recProd.id)) {
            adapterSuggestions.push(recProd);
          }
        }
      }
    });

    return {
      compatibleCount,
      limitsCount,
      needsAdapterCount,
      adapterSuggestions
    };
  }

  /**
   * Generates a tailored "YOUR RECOMMENDED SOLUTION" bundle
   * based on the customer's active devices.
   */
  getRecommendedSolution() {
    const devices = this.getUserDevices();
    const { phone, laptop, tv, tablet, audio } = devices;

    // Check if any device exists
    const hasAnyDevice = !!(phone || laptop || tv || tablet || audio);
    if (!hasAnyDevice) {
      return null;
    }

    // 1. Device-wise compatibility status
    const deviceStatuses = [];

    if (phone) {
      const isBtLimited = phone.bluetoothVersion && parseFloat(phone.bluetoothVersion) < 5.0;
      const isLightning = phone.portType === 'Lightning';
      let status = 'green';
      let label = 'Compatible';
      let badgeClass = 'status-green';
      let note = `Full ${phone.fastChargeWattage || 20}W ${phone.portType || 'USB-C'} fast-charging supported.`;

      if (isBtLimited) {
        status = 'blue';
        label = 'Compatible with limitations';
        badgeClass = 'status-blue';
        note = `Bluetooth ${phone.bluetoothVersion} audio caps wireless range & advanced codec bandwidth.`;
      } else if (isLightning) {
        status = 'yellow';
        label = 'Adapter / Cable required';
        badgeClass = 'status-yellow';
        note = `Uses Apple Lightning port. Requires USB-C to Lightning MFi cable.`;
      }

      deviceStatuses.push({
        deviceType: 'phone',
        name: phone.name,
        status,
        label,
        badgeClass,
        note
      });
    }

    if (laptop) {
      const lacksPorts = laptop.ports && laptop.ports.hdmi === 0 && laptop.ports.usbA === 0;
      const lacksAudio = laptop.ports && laptop.ports.headphoneJack === false;
      const isHighPower = laptop.chargingWattage && laptop.chargingWattage > 100;
      let status = 'green';
      let label = 'Compatible';
      let badgeClass = 'status-green';
      let note = `Full ${laptop.chargingWattage || 65}W USB-PD charging and display passthrough verified.`;

      if (lacksPorts) {
        status = 'yellow';
        label = 'Adapter required';
        badgeClass = 'status-yellow';
        note = `Has only USB-C/TB ports. Requires USB-C hub or HDMI cable for external displays & USB-A drives.`;
      } else if (lacksAudio) {
        status = 'yellow';
        label = 'Adapter required';
        badgeClass = 'status-yellow';
        note = `No built-in 3.5mm headphone jack. Requires USB-C Hi-Fi DAC for wired audio.`;
      } else if (isHighPower) {
        status = 'blue';
        label = 'Compatible with limitations';
        badgeClass = 'status-blue';
        note = `Demands ${laptop.chargingWattage}W under workload. Standard 65W chargers will trickle charge.`;
      }

      deviceStatuses.push({
        deviceType: 'laptop',
        name: laptop.name,
        status,
        label,
        badgeClass,
        note
      });
    }

    if (tablet) {
      const isBtLimited = tablet.bluetoothVersion && parseFloat(tablet.bluetoothVersion) < 5.0;
      let status = 'green';
      let label = 'Compatible';
      let badgeClass = 'status-green';
      let note = `Full ${tablet.fastChargeWattage || 25}W ${tablet.portType || 'USB-C'} fast-charging supported.`;

      if (isBtLimited) {
        status = 'blue';
        label = 'Compatible with limitations';
        badgeClass = 'status-blue';
        note = `Bluetooth ${tablet.bluetoothVersion} audio caps wireless range & advanced codec bandwidth.`;
      }

      deviceStatuses.push({
        deviceType: 'tablet',
        name: tablet.name,
        status,
        label,
        badgeClass,
        note
      });
    }

    if (tv) {
      const isHdmi20 = tv.maxHdmiVersion === '2.0';
      let status = 'green';
      let label = 'Compatible';
      let badgeClass = 'status-green';
      let note = `Certified HDMI 2.1 48Gbps 4K@120Hz & eARC verified.`;

      if (isHdmi20) {
        status = 'blue';
        label = 'Compatible with limitations';
        badgeClass = 'status-blue';
        note = `HDMI 2.0 bandwidth caps 4K refresh rates at 60Hz max.`;
      }

      deviceStatuses.push({
        deviceType: 'tv',
        name: tv.name,
        status,
        label,
        badgeClass,
        note
      });
    }

    if (audio) {
      deviceStatuses.push({
        deviceType: 'audio',
        name: audio.name,
        status: (audio.bluetoothVersion && parseFloat(audio.bluetoothVersion) < 5.0) ? 'blue' : 'green',
        label: (audio.bluetoothVersion && parseFloat(audio.bluetoothVersion) < 5.0) ? 'Compatible with limitations' : 'Compatible',
        badgeClass: (audio.bluetoothVersion && parseFloat(audio.bluetoothVersion) < 5.0) ? 'status-blue' : 'status-green',
        note: `Wireless audio peripheral evaluated.`
      });
    }

    // 2. Recommended Products
    const recommendedProducts = [];
    let isMultiDevice = false;
    let smartNote = '';

    const phoneW = phone ? (phone.fastChargeWattage || 20) : 0;
    const laptopW = laptop ? (laptop.chargingWattage || 65) : 0;
    const tabletW = tablet ? (tablet.fastChargeWattage || 25) : 0;
    const combinedW = phoneW + laptopW + tabletW;

    const chargeDevices = [laptop, tablet, phone].filter(Boolean);
    isMultiDevice = chargeDevices.length > 1;

    // Charger selection
    let chargerProduct = null;
    let recommendedWattageText = '';

    if (isMultiDevice) {
      if (combinedW > 65 || laptopW >= 65 || chargeDevices.length >= 3) {
        chargerProduct = products.find(p => p.id === 'prod-acc-3'); // 100W GaN Pro Multi-Port
        const devicePowers = [];
        if (laptop) devicePowers.push(`${laptop.name} @ 65W/100W`);
        if (tablet) devicePowers.push(`${tablet.name} @ 20W/30W`);
        if (phone) devicePowers.push(`${phone.name} @ 25W`);
        recommendedWattageText = `100W GaN III (Powers ${devicePowers.join(' + ')} simultaneously)`;
        smartNote = `Smart Multi-Port GaN replaces separate chargers! Powers your ${chargeDevices.map(d => d.name).join(', ')} from a single outlet at peak speeds without throttling.`;
      } else {
        chargerProduct = products.find(p => p.id === 'prod-acc-2'); // 65W GaN Dual Port
        recommendedWattageText = `65W GaN (Powers ${chargeDevices.map(d => d.name).join(' & ')} simultaneously)`;
        smartNote = `Dual-port GaN powers your devices from a single compact socket.`;
      }
    } else if (laptop) {
      if (laptopW > 65) {
        chargerProduct = products.find(p => p.id === 'prod-acc-3'); // 100W
        recommendedWattageText = `${laptopW}W Peak (100W GaN recommended to prevent throttling)`;
      } else {
        chargerProduct = products.find(p => p.id === 'prod-acc-2'); // 65W
        recommendedWattageText = `65W USB-PD High Speed`;
      }
      smartNote = `Engineered for ${laptop.name} to deliver full workload wattage efficiently.`;
    } else if (tablet) {
      if (tabletW > 25) {
        chargerProduct = products.find(p => p.id === 'prod-acc-8'); // 45W PPS
        recommendedWattageText = `${tabletW}W Super Fast Charge 2.0 (PPS certified)`;
      } else {
        chargerProduct = products.find(p => p.id === 'prod-acc-7'); // 25W PPS
        recommendedWattageText = `${tabletW}W USB-PD / PPS Fast Charge`;
      }
      smartNote = `Exact Power Delivery protocol match for ${tablet.name}.`;
    } else if (phone) {
      if (phoneW > 25) {
        chargerProduct = products.find(p => p.id === 'prod-acc-8'); // 45W PPS
        recommendedWattageText = `${phoneW}W Super Fast Charge 2.0 (PPS certified)`;
      } else {
        chargerProduct = products.find(p => p.id === 'prod-acc-7'); // 25W PPS
        recommendedWattageText = `${phoneW}W USB-PD / PPS Fast Charge`;
      }
      smartNote = `Exact PPS protocol match for ${phone.name} battery curve.`;
    }

    if (chargerProduct) {
      recommendedProducts.push({
        product: chargerProduct,
        role: isMultiDevice ? 'Multi-Port Charger' : 'Fast Charger',
        wattage: recommendedWattageText || `${chargerProduct.specs?.wattage}W`,
        supportedDevices: chargeDevices.map(d => d.name).join(' & ')
      });
    }

    // Cable selection
    if (phone && phone.portType === 'Lightning') {
      const lightningCable = products.find(p => p.id === 'prod-acc-11');
      if (lightningCable) {
        recommendedProducts.push({
          product: lightningCable,
          role: 'Charging Cable',
          wattage: '30W MFi Certified',
          supportedDevices: `${phone.name} (Lightning Fast Charge)`
        });
      }
    }

    const hasUsbCDevice = (laptop && laptop.ports?.usbC) || 
                          (phone && phone.portType === 'USB-C') || 
                          (tablet && (!tablet.portType || tablet.portType.includes('USB-C') || tablet.portType.includes('Thunderbolt')));
    if (hasUsbCDevice) {
      const usbcCable = products.find(p => p.id === 'prod-acc-10');
      if (usbcCable) {
        const supported = [
          laptop ? laptop.name : null,
          tablet ? tablet.name : null,
          (phone && phone.portType === 'USB-C') ? phone.name : null
        ].filter(Boolean);
        recommendedProducts.push({
          product: usbcCable,
          role: 'Charging Cable',
          wattage: '100W E-Marker PD',
          supportedDevices: supported.join(' & ')
        });
      }
    }

    if (tv) {
      const hdmiCable = products.find(p => p.id === 'prod-acc-4');
      if (hdmiCable) {
        recommendedProducts.push({
          product: hdmiCable,
          role: 'Display Cable',
          wattage: '48Gbps Bandwidth',
          supportedDevices: `${tv.name} (4K@120Hz & eARC)`
        });
      }
    }

    // Adapter / Hub selection
    if (laptop && laptop.ports && laptop.ports.hdmi === 0 && laptop.ports.usbA === 0) {
      const hub = products.find(p => p.id === 'prod-acc-1');
      if (hub) {
        recommendedProducts.push({
          product: hub,
          role: 'Port Expansion Hub',
          wattage: '100W PD Pass-through',
          supportedDevices: `${laptop.name} (Adds HDMI 4K, 3x USB-A, SD Card)`
        });
      }
    }

    // Audio DAC Dongle if lacking audio jack
    const phoneNoJack = phone && !phone.audioJack;
    const laptopNoJack = laptop && laptop.ports && laptop.ports.headphoneJack === false;
    if (phoneNoJack || laptopNoJack) {
      const dac = products.find(p => p.id === 'prod-acc-5');
      if (dac) {
        recommendedProducts.push({
          product: dac,
          role: 'Audio Adapter',
          wattage: '32-bit / 384kHz Hi-Fi DAC',
          supportedDevices: [
            phoneNoJack ? phone.name : null,
            laptopNoJack ? laptop.name : null
          ].filter(Boolean).join(' & ')
        });
      }
    }

    // 3. Why this solution explanation
    let whyExplanation = '';
    const deviceNames = [laptop?.name, tablet?.name, phone?.name, tv?.name].filter(Boolean).join(', ');

    if (isMultiDevice) {
      const parts = [];
      if (laptop) parts.push(`laptop requires ${laptopW}W`);
      if (tablet) parts.push(`tablet draws ${tabletW}W`);
      if (phone) parts.push(`phone takes ${phoneW}W`);
      whyExplanation = `We tailored this unified charging setup for your ${deviceNames}. Your ${parts.join(', ')}. The ${chargerProduct?.name || 'multi-port charger'} powers all your devices simultaneously at peak speeds from a single wall socket, eliminating the need to buy and carry separate bulky plugs. Every certified cable included supports high-current Power Delivery with E-Marker safety chips.`;
    } else if (laptop) {
      whyExplanation = `Engineered specifically for your ${laptop.name}. Provides full ${laptopW}W Power Delivery to prevent throttling during heavy use, combined with ${laptop.ports?.hdmi === 0 ? 'the HyperDrive hub to restore HDMI 4K video out and USB-A connectivity' : 'high-bandwidth certified cables'}.`;
    } else if (tablet) {
      whyExplanation = `Custom-engineered for your ${tablet.name}. Delivers safe, certified ${tabletW}W ${tablet.portType || 'USB-C'} fast-charging without overheating, perfectly matched to its power intake curve.`;
    } else if (phone) {
      whyExplanation = `Custom-tuned for your ${phone.name}. Delivers safe, certified ${phoneW}W ${phone.portType} charging without overheating, matching your phone manufacturer's peak charging curve.`;
    } else if (tv) {
      whyExplanation = `Optimized for your ${tv.name}. Delivers the certified 48Gbps bandwidth required to unlock true 4K@120Hz gaming, Dolby Vision HDR, and lossless eARC audio without signal drops.`;
    }

    // Check if device info is incomplete
    const isIncomplete = (phone && phone.isGeneric) || (laptop && laptop.isGeneric) || (tablet && tablet.isGeneric);
    const clarificationPrompt = isIncomplete
      ? "Tip: For exact wattage and pin matching, type your exact device model (e.g., 'Samsung A54 and Dell XPS 13')."
      : null;

    return {
      devices: deviceStatuses,
      recommendedProducts,
      whyExplanation,
      smartNote,
      isMultiDevice,
      totalRecommendedWattage: combinedW > 0 ? `${combinedW}W Total Requirement` : null,
      clarificationPrompt
    };
  }
}

let compatInstance = null;
export function getCompatibilityEngine() {
  if (!compatInstance) {
    compatInstance = new CompatibilityEngine();
  }
  return compatInstance;
}
