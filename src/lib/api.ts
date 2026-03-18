// const API_BASE = "http://127.0.0.1:8000";
export interface VoiceRequest {
  text: string;
  language: string;
}
export interface VoiceResponse {
  response: string;
  language: string;
}
export async function sendVoiceMessage(text: string, language = "en"): Promise<VoiceResponse> {

  const API_HOST = import.meta.env.VITE_API_HOST;
  let API_ROUTE = '/api/v1/voice'
  let API_URL = `${API_HOST}${API_ROUTE}`

  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}