export const extractAttributes = (req) => {
    const businessPhoneNumberId =
      req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
    const text = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0]?.text?.body;
    const userPhone = message?.from;
  
    return { businessPhoneNumberId, userPhone, message, text };
  };
  