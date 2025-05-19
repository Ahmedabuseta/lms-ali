async function invokeChute() {
  const response = await fetch("https://llm.chutes.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer cpk_01415f8f16de4d41bcbb7c91c7fe324b.b1f89e931bdf555ebf4969bda693ca1b.NCcMYBzWCrzlzZu6aaIeaRzUB5LszUs6",
  "Content-Type": "application/json"
      },
      body: JSON.stringify({
    "model": "deepseek-ai/DeepSeek-V3-0324",
    "messages": [
      {
        "role": "user",
        "content": "Tell me a 250 word story."
      }
    ],
    "stream": true,
    "max_tokens": 1024,
    "temperature": 0.7
  })
  });
  
  // Check if the response body exists
  if (!response.body) {
    throw new Error("Response body is null");
  }

  // Handle stream response
  if (response.headers.get("content-type")?.includes("text/event-stream")) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonData = line.slice(5).trim();
            if (jsonData === '[DONE]') continue;
            
            try {
              const data = JSON.parse(jsonData);
              if (data.choices && data.choices[0]?.delta?.content) {
                const content = data.choices[0].delta.content;
                fullText += content;
                process.stdout.write(content); // Stream to console
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }
      console.log("\n\n--- Full response ---\n", fullText);
    } catch (e) {
      console.error("Error reading stream:", e);
    }
  } else {
    // Fallback to JSON if not a stream
    const data = await response.json();
    console.log(data);
  }
}

invokeChute();