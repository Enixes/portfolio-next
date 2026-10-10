export type RoomSoundscape = {
  context: AudioContext;
  master: GainNode;
  wind: GainNode;
  windFilter: BiquadFilterNode;
  leaves: GainNode;
  source: AudioBufferSourceNode;
  breath: OscillatorNode;
  voices: Set<OscillatorNode>;
};

const WIND_BED = 0.036;

function hold(parameter: AudioParam, at: number) {
  if (typeof parameter.cancelAndHoldAtTime === "function") {
    parameter.cancelAndHoldAtTime(at);
  } else {
    const current = parameter.value;
    parameter.cancelScheduledValues(at);
    parameter.setValueAtTime(current, at);
  }
}

export function makeRoomSoundscape(): RoomSoundscape {
  const context = new AudioContext();
  // A long noise field keeps the room alive between gusts; filtering softens its loop seam.
  const buffer = context.createBuffer(1, context.sampleRate * 32, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 90;
  const windFilter = context.createBiquadFilter();
  windFilter.type = "lowpass";
  windFilter.frequency.value = 460;
  const wind = context.createGain();
  wind.gain.value = WIND_BED;
  source.connect(highpass);
  highpass.connect(windFilter).connect(wind).connect(master);

  const leafFilter = context.createBiquadFilter();
  leafFilter.type = "bandpass";
  leafFilter.frequency.value = 1650;
  leafFilter.Q.value = .7;
  const leaves = context.createGain();
  leaves.gain.value = 0;
  highpass.connect(leafFilter).connect(leaves).connect(master);

  const breath = context.createOscillator();
  const breathLevel = context.createGain();
  breath.type = "sine";
  breath.frequency.value = .055;
  breathLevel.gain.value = .005;
  breath.connect(breathLevel).connect(wind.gain);
  source.start();
  breath.start();
  return { context, master, wind, windFilter, leaves, source, breath, voices: new Set() };
}

export function fadeRoom(sound: RoomSoundscape, target: number, seconds: number) {
  const at = sound.context.currentTime;
  hold(sound.master.gain, at);
  sound.master.gain.linearRampToValueAtTime(target, at + seconds);
}

function voice(sound: RoomSoundscape, frequency: number, gainLevel: number, at: number, decay: number) {
  const oscillator = sound.context.createOscillator();
  const gain = sound.context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency * (1 + (Math.random() - .5) * .003), at);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(gainLevel, at + .025);
  gain.gain.exponentialRampToValueAtTime(.00001, at + decay);
  oscillator.connect(gain).connect(sound.master);
  oscillator.start(at);
  oscillator.stop(at + decay + .03);
  sound.voices.add(oscillator);
  oscillator.onended = () => {
    sound.voices.delete(oscillator);
    oscillator.disconnect();
    gain.disconnect();
  };
  return { oscillator, gain };
}

export function ringGlass(sound: RoomSoundscape) {
  const at = sound.context.currentTime;
  // Inharmonic, mostly upper partials: thin blown glass rather than a low bell.
  voice(sound, 2677, .009, at, 3.9);
  voice(sound, 3779, .0036, at + .004, 2.7);
  voice(sound, 5441, .0009, at + .008, 1.8);
}

export function birdCall(sound: RoomSoundscape) {
  const at = sound.context.currentTime;
  for (let note = 0; note < 2; note++) {
    const start = at + note * .21;
    const { oscillator } = voice(sound, 2140 + note * 175, .0026, start, .24);
    oscillator.frequency.exponentialRampToValueAtTime(3120 + note * 90, start + .095);
    oscillator.frequency.exponentialRampToValueAtTime(2280 + note * 145, start + .22);
  }
}

export function roomGust(sound: RoomSoundscape, heroVisible: boolean) {
  const { context, wind, windFilter, leaves } = sound;
  const now = context.currentTime;
  hold(wind.gain, now);
  wind.gain.linearRampToValueAtTime(.062, now + .8);
  wind.gain.linearRampToValueAtTime(WIND_BED, now + 5.2);
  hold(windFilter.frequency, now);
  windFilter.frequency.linearRampToValueAtTime(720, now + .9);
  windFilter.frequency.linearRampToValueAtTime(460, now + 5.2);
  hold(leaves.gain, now);
  leaves.gain.linearRampToValueAtTime(heroVisible ? .021 : 0, now + .95);
  leaves.gain.linearRampToValueAtTime(0, now + 5.2);
}

export function quietVoices(sound: RoomSoundscape) {
  for (const oscillator of sound.voices) {
    try { oscillator.stop(); } catch { /* already ending */ }
  }
}
