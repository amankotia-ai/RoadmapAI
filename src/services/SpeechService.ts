import { SpeechService } from './types';

export class SpeechServiceImpl implements SpeechService {
  private recognition: SpeechRecognition | null = null;
  private _isRecording: boolean = false;
  private transcriptCallback: ((text: string) => void) | null = null;
  private currentTranscript: string = '';
  private hasPermission: boolean = false;

  constructor() {
    // Check for both standard and webkit prefixed versions
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('Speech Recognition is supported');
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event) => {
        try {
          let finalTranscript = '';
          let interimTranscript = this.currentTranscript;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              this.currentTranscript = '';
            } else {
              interimTranscript += transcript;
            }
          }

          if (this.transcriptCallback) {
            const transcriptToSend = finalTranscript || interimTranscript;
            if (transcriptToSend.trim()) {
              console.log('Sending transcript:', transcriptToSend);
              this.transcriptCallback(transcriptToSend + ' ');
              if (finalTranscript) {
                this.currentTranscript = '';
              } else {
                this.currentTranscript = interimTranscript;
              }
            }
          }
        } catch (error) {
          console.error('Error processing speech result:', error);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this._isRecording = false;
        this.hasPermission = false;
        
        if (event.error === 'not-allowed') {
          alert('Please enable microphone access to use speech input.');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected');
        } else {
          console.error('Speech recognition error:', event.error);
        }
      };
      
      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        this._isRecording = false;
        this.currentTranscript = '';
      };
    } else {
      console.error('Speech Recognition is not supported in this browser');
    }
  }

  async startRecording(): Promise<void> {
    if (this.recognition) {
      try {
        if (!this.hasPermission) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.hasPermission = true;
          // Stop the stream immediately as we only needed it for permission
          stream.getTracks().forEach(track => track.stop());
        }

        if (!this._isRecording) {
          console.log('Starting speech recognition');
          this.recognition.start();
          this._isRecording = true;
        }
      } catch (error) {
        console.error('Failed to start recording:', error);
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            alert('Microphone access was denied. Please enable it in your browser settings.');
          } else {
            alert('Unable to access microphone. Please check your browser permissions.');
          }
        }
        this._isRecording = false;
        this.hasPermission = false;
      }
    }
  }

  stopRecording(): void {
    if (this.recognition) {
      try {
        console.log('Stopping speech recognition');
        this.recognition.stop();
        this._isRecording = false;
      } catch (error) {
        console.error('Failed to stop recording:', error);
        this._isRecording = false;
      }
    }
  }

  async toggleRecording(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition is not supported in your browser');
    }

    if (this._isRecording) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  onTranscript(callback: (text: string) => void): void {
    this.transcriptCallback = callback;
  }

  get isRecording(): boolean {
    return this._isRecording;
  }
}