import React, { useState } from "react";
import { Clip } from "../types/types";

interface Props {
    id: number
    content: Clip,
    data: Clip[],
    setData: React.Dispatch<React.SetStateAction<Clip[]>>,
    player: YT.Player | null
}

const Subtitle = ({ id, content, data, setData, player }: Props) => {
    const [isModify, setIsModify] = useState<boolean>(false);
    const [play, setPlay] = useState<boolean>(true);

    // const [clip, setClip] = useState<Clip>(content);

    //내용 수정 버튼 기능

    const isModifyHandler = () => {
        setIsModify(!isModify);
    }

    // 수정기능 활성화시 시간변경 버튼 출력

    const setTimingSetter = (isStart: boolean) => {
        if (isStart) {
            return (
                <>
                    <button onClick={() => changeTime(content.startTime, -0.1, true)}>-0.1</button>
                    <button onClick={() => changeTime(content.startTime, -0.01, true)}>-0.01</button>
                    <button onClick={() => changeTime(content.startTime, 0.01, true)}>+0.01</button>
                    <button onClick={() => changeTime(content.startTime, 0.1, true)}>+0.1</button>
                </>
            )
        } else {
            return (
                <>
                    <button onClick={() => changeTime(content.endTime, -0.1, false)}>-0.1</button>
                    <button onClick={() => changeTime(content.endTime, -0.01, false)}>-0.01</button>
                    <button onClick={() => changeTime(content.endTime, 0.01, false)}>+0.01</button>
                    <button onClick={() => changeTime(content.endTime, 0.1, false)}>+0.1</button>
                </>
            )
        }
    }

    // 데이터 수정 반영

    const setToData = () => {
        setData((prev) => prev.map((item, i) => i === id ? content : item))
        setIsModify(!isModify);
    }

    // 시간형식 <-> 정수형 전환코드

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
        const startTime = hmsToNumber(content.startTime);
        const endTime = hmsToNumber(content.endTime);
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

    // 시간변경(버튼식 변경)

    const changeTime = (curTime: string, change: number, isStart: boolean) => {
        const nextTime = numberToHms(hmsToNumber(curTime) + change);
        if (isStart) {
            content.startTime = nextTime;
        } else {
            content.endTime = nextTime;
        }
        setData((prevData) => prevData.map((item, index) => index === id ? content : item));
    }

    // 시간변경(텍스트 작성)

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

        switch (name) {
            case "startTime":
                content.startTime = value;
                break;
            case "endTime":
                content.startTime = value;
                break;
            
        }
        setData((prevData) => prevData.map((item, index) => index === id ? content : item));
    }

    // 자막내용 변경

    const handleContent = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        content.korSub = value;
        setData((prevData) => prevData.map((item, index) => index === id ? content : item));
    }

    const delSubtitle = () => {
        const newData = data.filter((_, index) => index !== id);
        console.log(newData);
        setData(newData);
        // setData((data) => (data.filter((_, index) => index !== id)));
        // setData((data) => (data.splice(id, 1)));
    }

    return (
        <div>
            {/* <input readOnly={!isModify}></input> */}
            <input type="text" name="startTime" value={content.startTime} readOnly={!isModify} onChange={handleTime}/>
            {isModify && setTimingSetter(true)}
            {
                play ? <button onClick={() => onPlayLoop()}>play</button> : <button onClick={() => player?.pauseVideo}>pause</button>
            }
            <input type="text" name="endTime" value={content.endTime} readOnly={!isModify} onChange={handleTime}/>
            {isModify && setTimingSetter(false)}
            <br />
            <input type="text" name="korSub" value={content.korSub} readOnly={!isModify} onChange={handleContent}/>
            <br />
            {
                isModify ? <button onClick={setToData}>완료</button> : <button onClick={isModifyHandler}>수정</button>
            }
            <button onClick={delSubtitle}>삭제</button>
        </div>
    )
}

export default Subtitle;