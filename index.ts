import Calendar = GoogleAppsScript.Calendar.Calendar;
import GmailThread = GoogleAppsScript.Gmail.GmailThread;
import GmailMessage = GoogleAppsScript.Gmail.GmailMessage;

// ToDo　デプロイすると日本語がエンコーディングされてしまう
const QUERY = `from:member@zeabra-receptionist.page subject:※返信不可※ 【AQUES】 レッスン予約リクエスト承りました。 is:unread`;

type ICalendarEvent = {
  date: string;
  startTime: string;
  endTime: string;
};

const main = () => {
  const results = threads().map(messages).map(calendarEvents).map(register);

  if (results.every(isSucceededAll)) {
    threads().map(read);
  } else {
    Logger.log("カレンダー登録に失敗しました");
  }
};

const threads = (): GmailThread[] => {
  return GmailApp.search(QUERY);
};

const messages = (thread: GmailThread): GmailMessage[] => {
  return thread.getMessages();
};

const calendarEvents = (gmailMessages: GmailMessage[]): ICalendarEvent[] => {
  return gmailMessages.map((message) => {
    const e = {
      date: "",
      startTime: "",
      endTime: "",
    };
    const body = message.getBody();
    const match = body.match(
      /(\d{4})\/(\d{2})\/(\d{2})\s+?(\d{2})\:(\d{2})～(\d{2})\:(\d{2})/
    );
    if (match !== null) {
      e.date = `${match[1]}-${match[2]}-${match[3]}`;
      e.startTime = `${match[4]}:${match[5]}:00`;
      e.endTime = `${match[6]}:${match[7]}:00`;
    }
    Logger.log(`${e.date}, ${e.startTime}, ${e.endTime}`);
    return e;
  });
};

const register = (events: ICalendarEvent[]): boolean[] => {
  const calendar = calendars();
  const result = events.map((e) => {
    const startTime = new Date(`${e.date}T${e.startTime}`);
    const endTime = new Date(`${e.date}T${e.endTime}`);
    Logger.log(`(${startTime} - ${endTime})`);
    calendar.createEvent("AQUES", startTime, endTime);
    return true;
  });
  return [].concat.apply([], result);
};

const calendars = (): Calendar => {
  const result = CalendarApp.getDefaultCalendar();
  return result;
};

const isSucceededAll = (results: boolean[]): boolean => {
  return results.every((n) => n);
};

const read = (thread: GmailThread) => {
  thread.markRead();
};
