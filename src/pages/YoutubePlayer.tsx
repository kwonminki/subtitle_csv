import React, { useEffect, useRef, useState } from "react";
import Papa from 'papaparse'

interface Clip{
  speakerName: string,
  startTime: string,
  endTime: string,
  korSub: string,
}

const YoutubePlayer: React.FC = () => {
  const playerRef = useRef<HTMLDivElement>(null);

  const [videoId, setVideoId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const [player, setPlayer] = useState<YT.Player | null>(null);

  const inputValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }

  const timeValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    
  }

  //Youtube Player 코드

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (playerRef.current) {
        const newPlayer = new window.YT.Player(playerRef.current, {
          height: '390',
          width: '640',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            start: 0,
            end: 0,
          }
        })
        setPlayer(newPlayer);
      }
    };

    return (() => {
      document.body.removeChild(script);
    })
  }, []);

  useEffect(() => {
    if (player && videoId) {
      player.loadVideoById(videoId);
      player.pauseVideo();
    }
  }, [videoId]);

  // 재생위치 설정 코드
  
  const onPlayLoop = (start: string, end: string) => {
    const startTime = hmsToNumber(start);
    const endTiem = hmsToNumber(end);

    player?.seekTo(startTime, true);
    player?.playVideo();
    const interval = setInterval(() => {
      if (player && player?.getCurrentTime() >= endTiem) {
        player.pauseVideo();
        clearInterval(interval);
      }
    }, 10)
  }

  // 재생시간 설정코드(hh:mm:ss:ss string -> number)

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
      console.log(miliseconds);
      return `${hours >= 10 ? hours : `0${hours}`}:${minutes >= 10 ? minutes: `0${minutes}`}:${seconds >= 10 ? seconds : `0${seconds}`}:${miliseconds >= 10 ? miliseconds : `0${miliseconds}`}`
    } else {
      return '';
    }
  }

  
  // csv파일 업로드 및 분석 코드
  
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState < Clip[]>([]);

  const fileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      fileReader(e.target.files[0]);
    }
  }


  // 버그발생 이유 : 한줄로 정리한 후 배열로 분리를 쉼표로 하다보니 한글 내 존재하는 쉼표가 이후 데이터에도 영향을 미침

  const fileReader = (file: File) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parseData = Papa.parse(text, {
        skipEmptyLines: true,
      })
      const rows = parseData.data as string[][];
      const arr: Clip[] = [];
      for (let i = 1; i < rows.length; i++){
        const content: Clip = {
          speakerName : rows[i][0],
          startTime : rows[i][1],
          endTime : rows[i][2],
          korSub : rows[i][3],
        }
        arr.push(content);
      }
      setData(arr);
    }
    reader.readAsText(file);
  }

  // csv 파일 내보내기

  const exportCSV = () => {
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    data.forEach((row) => {
      const values = headers.map((header) => row[header as keyof Clip]);
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv; charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'clips.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  // 시작 or 종료시간 수정

  const changeTime = (index: number, time: string, change: number, isStart: boolean) => {
    const newTime = numberToHms(hmsToNumber(time) + change);
    console.log(`${newTime} change ${change}`);
    setData((prevData) => 
      prevData.map((item, i) => i === index ? isStart ?{ ...item, startTime: newTime } : {...item, endTime: newTime} : item)
    )
  }

  return (
      <div>
        {/* sample video id : crLbUTFh2oQ */}
      <div ref={playerRef}/>
      <input type="text" value={inputValue} onChange={inputValueHandler} />
      <button onClick={() => {
        setVideoId(inputValue) 
      }}>setVideoId</button>
      
        <button onClick={exportCSV}>내보내기</button>
      <input type="file" accept=".csv" onChange={fileHandler} />
      <table>
        <thead>
          <tr>
            <th>시작시간</th>
            <th>종료시간</th>
            <th>자막</th>
            <th>옵션</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>
                <input key={index} type="text" value={item.startTime} />
                <button onClick={() => changeTime(index, item.startTime, -0.1, true)}>-0.1</button>
                <button onClick={() => changeTime(index, item.startTime, -0.01, true)}>-0.01</button>
                <button onClick={() => changeTime(index, item.startTime, +0.01, true)}>+0.01</button>
                <button onClick={() => changeTime(index, item.startTime, +0.1, true)}>+0.1</button>
              </td>
              <td>
                <input type="text" value={item.endTime}/>
                <button onClick={() => changeTime(index, item.endTime, -0.1, false)}>-0.1</button>
                <button onClick={() => changeTime(index, item.endTime, -0.01, false)}>-0.01</button>
                <button onClick={() => changeTime(index, item.endTime, +0.01, false)}>+0.01</button>
                <button onClick={() => changeTime(index, item.endTime, +0.1, false)}>+0.1</button>
              </td>
              <td>
                {item.korSub}
              </td>
              <td>
                <button onClick={() => {
                  player?.setPlaybackRate(1)
                }}>1배속</button>
                <button onClick={() => {
                  player?.setPlaybackRate(2)
                }}>2배속</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    );
}

export default YoutubePlayer;