export interface Content{
  speakerName: string,
  startTime: string,
  endTime: string,
  korSub: string,
  setContent?: React.Dispatch<React.SetStateAction<Content>>
}