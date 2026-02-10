export const analyzeToxicity = async ({ message, senderId, receiverId }) => {
  const response = await fetch("http://localhost:8080/api/chats/analyze-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

    },
    body: JSON.stringify({
      message,
      senderId,
      receiverId,
    }),
  });

  if (!response.ok) {
    throw new Error("Toxicity analysis failed");
  }

  return response.json();
};
