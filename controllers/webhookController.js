import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, CHATGPT_TOKEN, PORT } = process.env;
const assistant = `Eres un excelente Asistente`;

//////////////// WEBHOOK POST /////////////////

app.post("/webhook", async (req, res) => {
  const attributes = extractAttributes(req);
  const { businessPhoneNumberId, userPhone, message, text } = attributes;

  if (message?.text.body) {
    const msg = message?.text.body;
    // const userPhone = message?.from;

    if (typeof msg === "string" && msg.includes("Ok")) {
      await sendTextMessage(businessPhoneNumberId, userPhone, text);
    }
  }

  // check if the incoming message contains text
  if (message?.type === "text") {
    // ASISTENTE
    let openai_data = JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: assistant,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization:
         `Bearer ${CHATGPT_TOKEN}`,
         },
      data: openai_data,
    };

    axios
      .request(config)
      .then((response) => {
        axios({
          method: "POST",
          url: `https://graph.facebook.com/v18.0/${businessPhoneNumberId}/messages`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            to: message.from,
            text: {
              body: response.data.choices[0].message.content,
            },
            context: {
              message_id: message.id, // shows the message as a reply to the original user message
            },
          },
        });
      })
      .catch((error) => {
        console.log(error);
      });

    // mark incoming message as read
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${businessPhoneNumberId}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        status: "read",
        message_id: message.id,
      },
    });
  }

  res.sendStatus(200);
});

//////////////// WEBHOOK GET /////////////////
// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.

app.get("/webhook", (req, res) => {
  
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    // console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});

const sendTextMessage = async (businessPhoneId, userPhone, message) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v20.0/${businessPhoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: userPhone,
        type: "text",
        text: {
          body: "Message: " + message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error en el envío del Mensaje al usuario:",
      error.response ? error.response.data : error.message
    );
  }
};

function extractAttributes(req) {
  
  const businessPhoneNumberId =
    req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  const text =
    req.body.entry?.[0]?.changes[0]?.value?.messages?.[0]?.text?.body;
  const userPhone = message?.from;

  return { businessPhoneNumberId, userPhone, message, text };
}
