import { v4 as uuid } from "uuid";

export const generateSession = () => {
  let session = localStorage.getItem("sessionId");
  if (!session) {
    session = uuid();
    localStorage.setItem("sessionId", session);
  }
  return session;
};