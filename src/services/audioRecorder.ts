export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  volumeLevel: number; // 0 to 100 for live waveform
  error: string | null;
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private stream: MediaStream | null = null;

  private onVolumeChange?: (volume: number) => void;

  public async startRecording(onVolume?: (volume: number) => void): Promise<void> {
    this.onVolumeChange = onVolume;
    this.audioChunks = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported by your browser.');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Web Audio API Analyser for waveform
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      this.monitorVolume();

      // Setup MediaRecorder
      const options = MediaRecorder.isTypeSupported('audio/webm') 
        ? { mimeType: 'audio/webm' }
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? { mimeType: 'audio/mp4' }
          : undefined;

      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone access was denied. Please allow microphone access in your browser settings to practice.');
      }
      throw new Error('Could not access microphone: ' + (err.message || 'Unknown error'));
    }
  }

  private monitorVolume = () => {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    const volume = Math.min(100, Math.round((avg / 128) * 100));

    if (this.onVolumeChange) {
      this.onVolumeChange(volume);
    }

    this.animFrameId = requestAnimationFrame(this.monitorVolume);
  };

  public stopRecording(): Promise<{ blob: Blob; url: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder not initialized.'));
      }

      this.mediaRecorder.onstop = () => {
        // Stop audio animation and context
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        if (this.audioContext && this.audioContext.state !== 'closed') {
          this.audioContext.close();
        }

        // Stop all stream tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }

        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);

        resolve({ blob, url });
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        reject(e);
      }
    });
  }

  public cancel(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }
}
