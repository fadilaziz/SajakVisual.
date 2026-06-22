import sql from '../../database/db';
import { send_email } from './send_email.js';

// Send Email
export const send_email_worker = async () => {
  //Ambil data queue yang statusnya pending dan type email (1 baris saja)
  const data_email = await sql`
    SELECT id, message, destination, subject
    FROM queue
    WHERE type = 'email' AND status = 'pending'
    LIMIT 1`;

  //Jika data email tidak ada, maka return
  if (data_email.length === 0) {
    return;
  }

  //Data yang dibutuhkan untuk mengirim pesan email
  const email_subject = data_email[0].subject;
  const email_message = data_email[0].message;
  const email_destination = data_email[0].destination;

  //Data yang dibutuhkan untuk mengirim pesan email
  const data = {
    subject: email_subject,
    message: email_message,
    destination: email_destination,
  };

  //Kirim email
  const result = await send_email(data);

  //Update status email untuk baris yang spesifik
  const status = result && result.code === 200 ? 'success' : 'failed';
  await sql`
    UPDATE queue
    SET status = ${status}
    WHERE id = ${data_email[0].id}`;
};
