export const fetchGeminiResponse = async (
  prompt: string,
  systemInstruction: string,
  userApiKey?: string
): Promise<string> => {
  // Check API keys in order of priority: 1. User provided 2. Environment Variable
  const apiKey = userApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string) || "";

  if (!apiKey) {
    return "API Key Error: No Gemini API Key provided. Please paste your Google AI Studio API Key in the settings panel (cog icon in the header) to activate the intelligent agent advisor.";
  }

  // Use widely-adopted gemini-1.5-flash model or gemini-2.5-flash
  // gemini-1.5-flash is extremely stable and fast for REST API calls
  const modelName = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: systemInstruction ? {
      parts: [{ text: systemInstruction }]
    } : undefined,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1000
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr;
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        parsedErr = null;
      }
      
      const errMsg = parsedErr?.error?.message || errText || "";
      
      if (response.status === 400) {
        return `API Error (400): Invalid request format. Details: ${errMsg}`;
      } else if (response.status === 403) {
        return "API Error (403): Unauthorized key. Your Gemini API key is invalid or restricted.";
      } else if (response.status === 404) {
        return "API Error (404): AI model endpoint not found. Please try again with a valid API key.";
      } else if (response.status === 429) {
        return "API Error (429): Rate limited / Quota exceeded. Please wait a moment and try again.";
      }
      
      return `API Connection Error (${response.status}): ${errMsg}`;
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return "AI Response Error: Clean text was not returned by the language model.";
    }

    return generatedText;
  } catch (error: any) {
    return `Network Connection Attempt Failed: ${error?.message || "Verify your connection."}`;
  }
};
