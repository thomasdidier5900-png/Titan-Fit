// Web Audio API Synthesizer for high-fidelity offline alarm & beeps

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeAlarmNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private activeAlarmTimeout: number | null = null;

  constructor() {
    // Try to load mute state
    try {
      this.isMuted = localStorage.getItem('titanfit_muted') === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.ctx) {
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('titanfit_muted', muted ? 'true' : 'false');
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Pre-countdown warning tick / beep (short 880Hz beep)
  public playCountdownTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);

      // Light haptic pulse
      if ('vibrate' in navigator) {
        navigator.vibrate(60);
      }
    } catch (e) {
      console.warn('Audio tick failed:', e);
    }
  }

  // Stop any ongoing alarm sound immediately
  public stopAlarmSound() {
    try {
      this.activeAlarmNodes.forEach(({ osc, gain }) => {
        try {
          gain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.activeAlarmNodes = [];
      if (this.activeAlarmTimeout) {
        clearTimeout(this.activeAlarmTimeout);
        this.activeAlarmTimeout = null;
      }
    } catch (e) {
      console.warn('Stop alarm failed:', e);
    }
  }

  /**
   * Alarme de fin de temps de repos : sonne pendant exactement 2 secondes.
   * Génère une sonnerie énergique et percutante de 2.0 secondes
   * (4 impulsions sonores à 0s, 0.5s, 1.0s, 1.5s se terminant précisément à 2.0s)
   */
  public playRestAlarm(durationSeconds = 2.0) {
    if (this.isMuted) return;
    this.stopAlarmSound();

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const targetDuration = Math.max(1, durationSeconds);

      // Séquence de 4 sonneries réparties harmonieusement sur exactement 2 secondes :
      // 0.00s -> 0.45s (C6 + G5)
      // 0.50s -> 0.95s (C6 + G5)
      // 1.00s -> 1.45s (D6 + A5)
      // 1.50s -> 2.00s (E6 + C6 cloche finale énergique)
      const pulses = [
        { start: 0.0, end: 0.42, freq1: 1046.5, freq2: 783.99 },
        { start: 0.5, end: 0.92, freq1: 1046.5, freq2: 783.99 },
        { start: 1.0, end: 1.42, freq1: 1174.66, freq2: 880.0 },
        { start: 1.5, end: targetDuration, freq1: 1318.51, freq2: 1046.5 },
      ];

      pulses.forEach(pulse => {
        const startTime = now + pulse.start;
        const endTime = now + pulse.end;
        const pulseLen = pulse.end - pulse.start;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // Son percutant adapté à l'environnement de salle de sport
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(pulse.freq1, startTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(pulse.freq2, startTime);

        // Enveloppe d'attaque rapide et extinction nette
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(endTime);
        osc2.stop(endTime);

        this.activeAlarmNodes.push({ osc: osc1, gain }, { osc: osc2, gain });
      });

      // Vibration synchrone sur 2 secondes : 4 vibrations de 350ms espacées de 150ms (total = 1850ms ~ 2s)
      if ('vibrate' in navigator) {
        navigator.vibrate([350, 150, 350, 150, 350, 150, 350]);
      }

      // Nettoyage automatique des nœuds après les 2 secondes
      this.activeAlarmTimeout = window.setTimeout(() => {
        this.stopAlarmSound();
      }, targetDuration * 1000 + 100);
    } catch (e) {
      console.warn('Audio alarm failed:', e);
    }
  }

  // Alias pour compatibilité
  public playLoudAlarm() {
    this.playRestAlarm(2.0);
  }

  // Quick tactile sound on completing a set
  public playSuccessChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);

      if ('vibrate' in navigator) {
        navigator.vibrate(80);
      }
    } catch {}
  }
}

export const soundService = new SoundService();
