import React, { useState } from "react";
import { Content } from "../types/types";

interface Props {
    id: number
    content: Content,
    setData: React.Dispatch<React.SetStateAction<Content[]>>,
    player: YT.Player | null
}

const Subtitle = ({ id, content, setData, player }: Props) => {
    const [isModify, setIsModify] = useState<boolean>(false);
    const [play, setPlay] = useState<boolean>(true);

    const [clip, setClip] = useState<Content>(content);

    const isModifyHandler = () => {
        setIsModify(!isModify);
    }

    const setTimingSetter = (isStart: boolean) => {
        if (isStart) {
            return (
                <>
                    <button onClick={() => changeTime(clip.startTime, -0.1, true)}>-0.1</button>
                    <button onClick={() => changeTime(clip.startTime, -0.01, true)}>-0.01</button>
                    <button onClick={() => changeTime(clip.startTime, 0.01, true)}>+0.01</button>
                    <button onClick={() => changeTime(clip.startTime, 0.1, true)}>+0.1</button>
                </>
            )
        } else {
            return (
                <>
                    <button onClick={() => changeTime(clip.endTime, -0.1, false)}>-0.1</button>
                    <button onClick={() => changeTime(clip.endTime, -0.01, false)}>-0.01</button>
                    <button onClick={() => changeTime(clip.endTime, 0.01, false)}>+0.01</button>
                    <button onClick={() => changeTime(clip.endTime, 0.1, false)}>+0.1</button>
                </>
            )
        }
    }

    const hmsToNumber = (time: string) => {
        if (time) { 
          const [hours, minutes, seconds, zpo] = time.split(":").map(Number);
          return hours * 3600 + minutes * 60 + seconds + zpo * 0.01;
        } else {
          return 0;
        }
      }
    
      const numberToHms = (time: number) => {
        if (time) {
          const hours = Math.floor(time / 3600);
          const minutes = Math.floor((time - hours * 3600) / 60);
          const seconds = Math.floor((time - hours * 3600 - minutes * 60));
          const miliseconds = Math.round((time - hours * 3600 - minutes * 60 - seconds) * 100);
          return `${hours >= 10 ? hours : `0${hours}`}:${minutes >= 10 ? minutes: `0${minutes}`}:${seconds >= 10 ? seconds : `0${seconds}`}:${miliseconds >= 10 ? miliseconds : `0${miliseconds}`}`
        } else {
          return '';
        }
      }
    
     // 재생위치 설정 코드
  
  const onPlayLoop = () => {
    const startTime = hmsToNumber(clip.startTime);
    const endTime = hmsToNumber(clip.endTime);
      setPlay(true);
    player?.seekTo(startTime, true);
    player?.playVideo();
    const interval = setInterval(() => {
      if (player && player?.getCurrentTime() >= endTime) {
        player.pauseVideo();
        clearInterval(interval);
      }
    }, 10)
  }

    const changeTime = (curTime: string, change: number, isStart: boolean) => {
        const nextTime = numberToHms(hmsToNumber(curTime) + change);
        if (isStart) {
            setClip((prev) => ({
                ...prev,
                startTime: nextTime
            }))
        } else {
            setClip((prev) => ({
                ...prev,
                endTime: nextTime
            }))
        }
    }

    const handleTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        let input = e.target.value;
        input = input.replace(/[^0-9]/g, "");
        input = input.slice(0, 8);

        if (input.length > 2) {
            input = `${input.slice(0,2)}:${input.slice(2)}`
            if (input.length > 5) {
                input = `${input.slice(0,5)}:${input.slice(5)}`
                if (input.length > 8) {
                    input = `${input.slice(0, 8)}:${input.slice(8)}`
                }
            }
        }
        
        const value = input;

        setClip((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleContent = (e: React.ChangeEvent<HTMLInputElement>) => {

    }

    const setToContent = () => {
            setData((prev) =>
            prev.map((item, i) => i === id ? clip : item)
        )
        setIsModify(!isModify);
    }

    return (
        <div>
            {/* <input readOnly={!isModify}></input> */}
            <input type="text" name="startTime" value={clip.startTime} readOnly={!isModify} onChange={handleTime}/>
            {isModify && setTimingSetter(true)}
            {
                play ? <button onClick={() => onPlayLoop()}>play</button> : <button onClick={() => player?.pauseVideo}>pause</button>
            }
            <input type="text" name="endTime" value={clip.endTime} readOnly={!isModify} onChange={handleTime}/>
            {isModify && setTimingSetter(false)}
            <br />
            <input type="text" name="korSub" value={clip.korSub} readOnly={!isModify} />
            <br />
            {
                isModify ? <button onClick={setToContent}>완료</button> : <button onClick={isModifyHandler}>수정</button>
            }
        </div>
    )
}

export default Subtitle;