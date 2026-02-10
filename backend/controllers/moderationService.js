const axios = require("axios");

const ML_URL = "http://localhost:8000/moderate"; // IMPORTANT change

const moderationEngine = async (text) => {
  try {
    console.log("Sending text to ML:", text);

    const response = await axios.post(ML_URL, { text });

    console.log("ML RESPONSE:", response.data);
    return response.data;

  } catch (error) {
    console.error("ML ERROR:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

module.exports = moderationEngine;
