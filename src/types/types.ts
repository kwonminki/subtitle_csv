export interface Content{
  speakerName: string,
  startTime: string,
  endTime: string,
  korSub: string,
}

export const defaultContent: Content = {
  speakerName : '',
  startTime : '',
  endTime : '',
  korSub : ''
}