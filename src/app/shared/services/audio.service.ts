import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Sound {
  key: string;
  asset: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  isMuted$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private sounds: Sound[] = [];
  private audioPlayer: HTMLAudioElement = new Audio();

  constructor() {}

  preload(key: string, asset: string): void {
    let audio = new Audio();
    audio.src = asset;

    this.sounds.push({
      key: key,
      asset: asset
    });
  }

  play(key: string): void {
    console.log("Audio Play triggered");
    if (!this.isMuted$.value) {
      let soundToPlay = this.sounds.find(sound => {
        return sound.key === key;
      });

      this.audioPlayer.src = soundToPlay.asset;
      this.audioPlayer.loop = true;
      this.audioPlayer.play();
    }
  }

  stop(key: string): void {
    console.log("Audio Stop triggered");
    let soundToPlay = this.sounds.find(sound => {
      return sound.key === key;
    });

    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
  }

  toggleNotification(): void {
    if (this.isMuted$.value) {
      this.isMuted$.next(false);
    } else {
      this.isMuted$.next(true);
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
    }
  }
}
