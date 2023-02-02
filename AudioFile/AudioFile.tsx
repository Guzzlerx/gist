import React, { useEffect, useRef, useState } from 'react';

import playIcon from '../../assets/icons/audioFile_play.svg';
import stopIcon from '../../assets/icons/audioFile_stop.svg';
import crossIcon from '../../assets/icons/previewImageCross.svg';

import styles from './AudioFile.module.css';

type AudioFileTypes = {
  id: string;
  name: string;
  src: string;
  deleteCallback?: (id: string) => void;
};

const formatTime = (time: number) => {
  time.toFixed(0);

  const hours = Math.floor(time / 60 / 60);
  const minutes = Math.floor((time / 60) % 60);
  const seconds = Math.floor(time % 60);

  const hrsTime = hours < 10 && hours >= 0 ? '0' + hours : hours; //eslint-disable-line
  const minTime = minutes < 10 && minutes >= 0 ? '0' + minutes : minutes; //eslint-disable-line
  const secTime = seconds < 10 && seconds >= 0 ? '0' + seconds : seconds; //eslint-disable-line

  const result = parseInt(String(hrsTime), 10)
    ? `${hrsTime}:${minTime}:${secTime}`
    : `${minTime}:${secTime}`;

  return result;
};

const AudioFile: React.FC<AudioFileTypes> = ({ id, name, src, deleteCallback }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerId = useRef<ReturnType<typeof setInterval>>();

  const audioTime = formatTime(time);

  const onLoaded = () => {
    setIsLoaded(true);
  };

  const onPlay = () => {
    audioRef?.current?.play();

    clearInterval(timerId?.current);

    timerId.current = setInterval(() => {
      setTime(audioRef.current.currentTime);
    }, 100);

    setIsPlaying(true);
  };

  const onPause = () => {
    audioRef?.current?.pause();

    clearInterval(timerId.current);

    setIsPlaying(false);
  };

  const onEnded = () => {
    setIsPlaying(false);

    clearInterval(timerId.current);

    setTime(audioRef?.current?.duration);
  };

  useEffect(() => {
    setTime(Number(audioRef.current?.duration));
  }, [audioRef.current?.duration]);

  useEffect(() => {
    return () => {
      clearInterval(timerId.current);
    };
  }, []);

  return (
    <div className={styles.audio}>
      <audio //eslint-disable-line
        src={src}
        ref={audioRef}
        onLoadedMetadata={onLoaded}
        onEnded={onEnded}
      ></audio>
      {isPlaying ? (
        <img
          className={styles.audioBtn}
          role="presentation"
          src={stopIcon}
          alt="play"
          onClick={onPause}
        />
      ) : (
        <img
          className={styles.audioBtn}
          role="presentation"
          src={playIcon}
          alt="play"
          onClick={onPlay}
        />
      )}
      {deleteCallback && (
        <img
          role="presentation"
          src={crossIcon}
          alt="cross"
          className={styles.cross}
          onClick={() => deleteCallback(id)}
        />
      )}
      <h1 className={styles.audioTitle}>{name.split('.')[0]}</h1>
      {isLoaded && <p className={styles.audioTime}>{audioTime}</p>}
    </div>
  );
};

export default React.memo(AudioFile);
