import React, { useEffect, useRef, useState } from "react";
import Papa from 'papaparse'
import Subtitle from "./Subtitle";
import { Clip } from "../types/types";

const YoutubePlayer: React.FC = () => {
  const playerRef = useRef<HTMLDivElement>(null);

  const [videoId, setVideoId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const [player, setPlayer] = useState<YT.Player | null>(null);

  const inputValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
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
    setData([])
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

  // 자막 컴포넌트 추가

  const addClip = () => {
    const clip: Clip = {
      speakerName : '',
      startTime : '',
      endTime : '',
      korSub : ''
    }
    setData((prevData) => [...prevData, clip]);
  }

  return (
      <div>
        {/* sample video id : crLbUTFh2oQ */}
      <div ref={playerRef} />

      <input type="text" value={inputValue} onChange={inputValueHandler} />
      <button onClick={() => {
        setVideoId(inputValue) 
      }}>setVideoId</button>

      {data.length > 0 && <button onClick={exportCSV}>내보내기</button>}
      <input type="file" accept=".csv" onChange={fileHandler} />
      
      {data.map((item, index) => (
        <>
          <Subtitle key={index} id={index} content={item} data={data} setData={setData} player={player}/>
        </>
      ))}
      <button onClick={addClip}>자막추가</button>

      </div>
    );
}

export default YoutubePlayer;